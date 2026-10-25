#!/usr/bin/env python3
"""Real-browser test of auto-pause + live map with a simulated clock and GPS. Run from repo root."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8897"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
SIM = """
window.__t=Date.now();Date.now=function(){return window.__t};
window.__la=40.7;window.__lo=-74.0;
window.simSec=function(secs,v,acc,spd,steps){for(var i=0;i<secs;i++){window.__t+=1000;window.__la+=v/111320;
  if(steps)TM.steps++;
  onFix({coords:{latitude:window.__la+(Math.random()-.5)*2e-5,longitude:window.__lo+(Math.random()-.5)*2e-5,accuracy:acc,speed:spd},timestamp:window.__t});step()}};
"""

NATIVE = """
(function(){var calls=[];window.__calls=calls;
 window.Capacitor={isNativePlatform:function(){return true},Plugins:{RunEngine:{
  requestPermissions:function(){return Promise.resolve({})},start:function(o){calls.push(["start"]);return Promise.resolve()},
  setState:function(o){calls.push(["set",JSON.stringify(o)]);return Promise.resolve()},
  state:function(){return Promise.resolve({active:true,paused:false,rev:0,hold:false,phase:0,round:1,pstart:0,jt:1200,wt:300,dist:100,acc:60000,rn:0,steps:50,sens:true,gacc:6,gavg:6,fx:100,fd:1,gap:0})},
  route:function(){return Promise.resolve({pts:"[]"})},stop:function(){return Promise.resolve({})},speak:function(){return Promise.resolve()}}}};
 navigator.geolocation.watchPosition=function(f){window.__apcb=f;return 7};})();
"""
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 390, "height": 844}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load"); pg.wait_for_timeout(1500)
        pg.evaluate(SIM); pg.evaluate("PR.ap=1;startIV0(cur)"); pg.wait_for_timeout(300)
        check("run started with tracking", pg.evaluate("!!(TM&&TM.trk&&TM.run)"), pg.evaluate("TM&&[TM.trk,TM.run,TM.mode]"))
        pg.evaluate("simSec(30,2.5,6,2.5,1)")  # warm up: easy jog 30 s so the tracker locks and elapsed > 20 s
        d0 = pg.evaluate("TM.dist")
        pg.evaluate("simSec(120,0.4,8,0.4,0)")
        check("slow walk 0.4 m/s for 2 min: never auto-pauses", pg.evaluate("TM.run===true"), pg.evaluate("[TM.run,TM.aps]"))
        d1 = pg.evaluate("TM.dist"); check("slow walk distance is counted (about 48 m)", 25 < d1 - d0 < 60, d1 - d0)
        pg.evaluate("AxLiveMap.render()"); check("live map shows the route", pg.evaluate("(function(){var e=document.getElementById('ax-lmap');return !!e&&!e.hidden&&!!e.querySelector('path')})()"))
        pg.evaluate("simSec(45,0,6,0,0)")
        check("standing still 45 s: auto-paused", pg.evaluate("TM.run===false&&TM.aps===1"), pg.evaluate("[TM.run,TM.aps]"))
        pg.evaluate("AxLiveMap.render()"); check("live map says Paused", pg.evaluate("document.getElementById('ax-lmap').textContent.includes('Paused')"))
        d2 = pg.evaluate("TM.dist"); pg.evaluate("simSec(20,0.5,6,0.5,1)")
        check("slow walking resumes the run", pg.evaluate("TM.run===true"), pg.evaluate("[TM.run,TM.aps]"))
        check("distance walked right after the pause is NOT lost", pg.evaluate("TM.dist")-d2 >= 4, pg.evaluate("TM.dist")-d2)
        pg.evaluate("simSec(90,0,60,-1,0)")
        check("weak GPS (60 m) for 90 s does not pause", pg.evaluate("TM.run===true"), pg.evaluate("[TM.run,TM.aps]"))
        pg.evaluate("TM.run=false;TM.aps=0;simSec(5,2.5,6,2.5,1)")
        check("manual pause stays paused when you move", pg.evaluate("TM.run===false"))

        # ---- native engine mode (the APK): GPS is in Java, the page runs its own detector
        ctx2 = b.new_context(viewport={"width": 390, "height": 844}); ctx2.add_init_script(NATIVE); pg2 = ctx2.new_page(); errs2 = []
        pg2.on("pageerror", lambda e: errs2.append(str(e)[:160]))
        pg2.goto(f"http://localhost:{PORT}/index.html", wait_until="load"); pg2.wait_for_timeout(1500)
        pg2.evaluate(SIM.replace("onFix(", "apFix(")); pg2.evaluate("PR.ap=1;startIV0(cur)"); pg2.wait_for_timeout(600)
        check("native: engine run started and raw-GPS watcher attached", pg2.evaluate("!!(TM&&TM.eng&&TM.awid===7)"), pg2.evaluate("TM&&[TM.eng,TM.awid]"))
        pg2.evaluate("TM.acc=60000;TM.last=Date.now();simSec(30,2.5,6,2.5,0)")
        pg2.evaluate("simSec(120,0.4,8,0.4,0)")
        check("native: slow walk 0.4 m/s for 2 min never auto-pauses", pg2.evaluate("TM.run===true"), pg2.evaluate("[TM.run,TM.aps]"))
        pg2.evaluate("simSec(45,0,6,0,0)")
        check("native: standing still auto-pauses and tells the engine", pg2.evaluate("TM.run===false&&TM.aps===1")  and pg2.evaluate("window.__calls.some(c=>c[0]=='set'&&c[1].includes('\"paused\":true'))"), pg2.evaluate("[TM.run,TM.aps,JSON.stringify(window.__calls.slice(-2))]"))
        pg2.evaluate("simSec(15,0.5,6,0.5,0)")
        check("native: slow walking resumes the engine", pg2.evaluate("TM.run===true"), pg2.evaluate("[TM.run,TM.aps]"))
        check("native: no page errors", not errs2, errs2)
        check("no page errors", not errs, errs); b.close()
finally:
    srv.kill()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

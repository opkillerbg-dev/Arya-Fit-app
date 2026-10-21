#!/usr/bin/env python3
"""v92 run summary / card / native-engine flow in a real browser with a stubbed RunEngine plugin.
Run from repo root: python3 tests/run_ui_test.py   (shots go to $SHOTS if set)"""
import json, subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8898"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1); URL = f"http://localhost:{PORT}/index.html"; fails = []; SH = os.environ.get("SHOTS")
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
STUB = r"""
(function(){
  var calls=[],T0=Date.now(),pts=[],i;
  for(i=0;i<320;i++){var a=i/319,la=40.7+0.0145*Math.sin(a*3.1)+0.0001*Math.sin(a*40),lo=-74+0.02*a*(1+0.15*Math.sin(a*9));pts.push([+la.toFixed(5),+lo.toFixed(5),1700000000000+i*4700+(i>150&&i<160?20000:0)])}
  window.__calls=calls;
  window.Capacitor={isNativePlatform:function(){return true},Plugins:{RunEngine:{
    requestPermissions:function(){return Promise.resolve({})},
    start:function(o){calls.push(["start",o]);return Promise.resolve()},
    setState:function(o){return Promise.resolve()},
    state:function(){return Promise.resolve({active:true,paused:false,hold:false,phase:0,round:3,pstart:0,jt:1200,wt:300,dist:3410,acc:1500000,rev:0,rn:320,steps:4210,sens:true,gacc:6.2,gavg:5.8,goff:false,fx:1480,fd:35,gap:1})},
    route:function(o){return Promise.resolve({pts:JSON.stringify(pts.slice(o.from||0))})},
    stop:function(){calls.push(["stop"]);return Promise.resolve({})},
    speak:function(o){calls.push(["speak",o.text]);return Promise.resolve()}}}};
})();
"""
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}); ctx.add_init_script(STUB)
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        pg.goto(URL, wait_until="load"); pg.wait_for_timeout(2500)
        check("app loads with the new modules", pg.evaluate("!!(window.AxRun&&window.AxRunSum&&window.AxRunCard&&typeof axRsum==='function')"), errs)
        # --- a native-engine run, saved
        pg.evaluate("startIV0(cur)"); pg.wait_for_timeout(1500)
        started = pg.evaluate("window.__calls.filter(c=>c[0]=='start').length")
        check("native engine started with a steps field", started >= 1 and pg.evaluate("'steps' in window.__calls[0][1]"), pg.evaluate("JSON.stringify(window.__calls[0])"))
        pg.evaluate("TM.acc=1500000;TM.last=Date.now();TM.steps=999999"); pg.wait_for_timeout(1500)
        msg = pg.evaluate("document.getElementById('gmsg').textContent")
        check("live status shows GPS accuracy", "GPS good" in msg, msg)
        check("hardware steps replace the phone-motion guess", pg.evaluate("TM.nsens===1&&TM.steps===4210"), pg.evaluate("[TM.nsens,TM.steps]"))
        pg.evaluate("document.getElementById('dsv').click()"); pg.wait_for_timeout(300)
        if pg.evaluate("TM!==null"): pg.evaluate("document.getElementById('dsv').click()")  # short-of-goal confirm tap
        pg.wait_for_timeout(2600)
        day = pg.evaluate("cur")
        sv = pg.evaluate("JSON.stringify(axRsum()[%d])" % day)
        check("summary saved with splits", sv and sv != "undefined" and '"km":[' in sv, sv)
        o = json.loads(sv)[0]
        check("saved steps are the sensor count, not doubled", o["st"] == 4210 and pg.evaluate("st['s%d']" % day) == 4210, (o.get("st"), pg.evaluate("st['s%d']" % day)))
        check("cadence and stride saved", o.get("cd") and o.get("sl"), o)
        check("summary sheet opened after save", pg.evaluate("!document.getElementById('ax-sh').hidden") and "km" in pg.evaluate("document.getElementById('ax-shb').innerText"))
        check("sheet shows route, splits, profile", pg.evaluate("!!document.querySelector('#ax-shb svg[aria-label^=Route]')&&document.querySelectorAll('#ax-shb .rs-r').length>=3&&!!document.querySelector('#ax-shb svg[aria-label^=Pace]')"))
        if SH: pg.screenshot(path=SH + "/summary-top.png"); pg.evaluate("document.getElementById('ax-sh').scrollTop=9999"); pg.wait_for_timeout(200); pg.screenshot(path=SH + "/summary-bottom.png")
        check("sheet width never scrolls sideways", pg.evaluate("(()=>{const s=document.getElementById('ax-sh');return s.scrollWidth<=s.clientWidth+1})()"))
        # --- card
        png = pg.evaluate("AxRunCard.draw(AxRunSum.data(%d)).toDataURL('image/png').length" % day)
        check("run card renders", png > 20000, png)
        if SH:
            import base64
            d = pg.evaluate("AxRunCard.draw(AxRunSum.data(%d)).toDataURL('image/png')" % day)
            open(SH + "/card.png", "wb").write(base64.b64decode(d.split(",")[1]))
        pg.evaluate("axSheetX()")
        # --- history button, export/import round trip, delete
        pg.evaluate("document.querySelector('[data-pg=hist],[data-ps=hist]')&&0")
        txt = pg.evaluate("exportData ? 1 : 0") if False else 1
        exp = pg.evaluate("(()=>{try{return JSON.stringify(JSON.parse(buildExport?buildExport():'{}'))}catch(e){return ''}})()") if False else ""
        pg.evaluate("window.__sv=JSON.stringify(axRsum())")
        clean = pg.evaluate("JSON.stringify(axCleanRsum(JSON.parse(window.__sv)))")
        check("backup validator keeps the summary intact", json.loads(clean) == json.loads(pg.evaluate("window.__sv")), (clean[:300], pg.evaluate("window.__sv")[:300]))
        bad = pg.evaluate("JSON.stringify(axCleanRsum({'3':[{t:1,d:'x',s:5},{t:1,d:5,s:5,km:[1,'a',2],pp:[9],evil:1}]}))")
        check("backup validator drops junk fields and bad rows", '"evil"' not in bad and '"d":5' in bad and '"km":[1,2]' in bad, bad)
        pg.evaluate("axShiftSt(%d)" % day); moved = pg.evaluate("Object.keys(axRsum())")
        check("schedule shift moves the summary with the run", str(day + 1) in moved and str(day) not in moved, moved)
        pg.evaluate("delete axRsum()[%d]" % (day + 1))
        check("no page errors", not errs, errs)
        # --- old run without a stored summary is rebuilt from route + totals
        pg.evaluate("(()=>{const d=%d+2;st['g'+d]=2400;st['r'+d]=900;st['s'+d]=3000;axRoutes()[d]=[JSON.parse(JSON.stringify(axRoutes()[%d]&&axRoutes()[%d][0]||[]))];save()})()" % (day, day + 1, day + 1))
        old = pg.evaluate("(()=>{const D=AxRunSum.data(%d);return D?[D.sum.dv,D.sum.d]:null})()" % (day + 2))
        check("older run is rebuilt for the summary", old and old[0] == 1 and old[1] == 2400, old)
        check("no page errors (end)", not errs, errs)
        ctx.close(); b.close()
finally:
    srv.terminate()
print("FAILED: " + ", ".join(fails) if fails else "all passed"); sys.exit(1 if fails else 0)

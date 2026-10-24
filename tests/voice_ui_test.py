#!/usr/bin/env python3
"""v99 voice picker with a stubbed RunEngine plugin. Run from repo root: python3 tests/voice_ui_test.py"""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8890"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1); URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
STUB = r"""
window.__v=[];var st={engine:"",voice:"",rate:95};
var A={engines:[{name:"com.google.android.tts",label:"Google"},{name:"org.woheller69.ttsengine",label:"SherpaTTS"}]};
var V={"":[{name:"en-us-x-sfg-local",lang:"en-US",q:400,net:false},{name:"en-gb-x-gbb-network",lang:"en-GB",q:500,net:true},{name:"hi-in-x-hic-local",lang:"hi-IN",q:300,net:false}],
 "org.woheller69.ttsengine":[{name:"en_US-lessac-medium",lang:"en-US",q:400,net:false}],"com.google.android.tts":[{name:"en-us-x-sfg-local",lang:"en-US",q:400,net:false}]};
window.Capacitor={isNativePlatform:function(){return true},Plugins:{RunEngine:{
 voiceList:function(){return Promise.resolve({engines:A.engines,voices:V[st.engine]||V[""],engine:st.engine,voice:st.voice,rate:st.rate})},
 voiceSet:function(o){window.__v.push(["set",JSON.parse(JSON.stringify(o))]);if("engine" in o){st.engine=o.engine;st.voice=""}if("voice" in o)st.voice=o.voice;if("rate" in o)st.rate=Math.round(o.rate*100);return Promise.resolve()},
 voiceSettings:function(){window.__v.push(["settings"]);return Promise.resolve()},
 openUrl:function(o){window.__v.push(["url",o.url]);return Promise.resolve()},
 speak:function(){return Promise.resolve()}}}};
"""
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        errs = []
        pg = b.new_page(viewport={"width": 412, "height": 915}); pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(2000)
        check("browser (no plugin): picker is hidden", pg.evaluate("getComputedStyle(document.getElementById('ax-vx')).display") == "none")
        pg.close()
        pg = b.new_page(viewport={"width": 412, "height": 915}); pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.add_init_script(STUB); pg.goto(URL); pg.wait_for_timeout(2000)
        pg.evaluate("go('set')"); pg.wait_for_timeout(300); pg.click('[data-sp="alert"]'); pg.wait_for_timeout(1200)
        check("picker visible in the phone app", pg.evaluate("getComputedStyle(document.getElementById('ax-vx')).display") != "none")
        eng = pg.evaluate("Array.from(document.getElementById('ax-ve').options).map(function(o){return o.text})")
        check("engines listed (default + installed)", len(eng) == 3 and "SherpaTTS" in eng, eng)
        vo = pg.evaluate("Array.from(document.getElementById('ax-vv').options).map(function(o){return o.text})")
        check("voices: offline first (English before Hindi), internet voices last", vo[1].startswith("en-us-x-sfg-local") and vo[2].startswith("hi-in") and "needs internet" in vo[3], vo)
        pg.select_option("#ax-ve", "org.woheller69.ttsengine"); pg.wait_for_timeout(1500)
        check("choosing an engine saves it", ["set", {"engine": "org.woheller69.ttsengine"}] in pg.evaluate("window.__v"), pg.evaluate("window.__v"))
        vo = pg.evaluate("Array.from(document.getElementById('ax-vv').options).map(function(o){return o.text})")
        check("voice list reloads for the new engine", any(v.startswith("en_US-lessac-medium") for v in vo), vo)
        pg.select_option("#ax-vv", "en_US-lessac-medium"); pg.wait_for_timeout(300)
        check("choosing a voice saves it", ["set", {"voice": "en_US-lessac-medium"}] in pg.evaluate("window.__v"))
        pg.evaluate("var r=document.getElementById('ax-vr');r.value=80;r.dispatchEvent(new Event('input'));r.dispatchEvent(new Event('change'))"); pg.wait_for_timeout(300)
        check("speed saved as 0.8", ["set", {"rate": 0.8}] in pg.evaluate("window.__v"), pg.evaluate("window.__v"))
        check("speed label updates", "0.8" in pg.evaluate("document.getElementById('ax-vrl').textContent"))
        pg.click("#ax-vset"); pg.click("#ax-vget"); pg.wait_for_timeout(300)
        v = pg.evaluate("window.__v")
        check("phone voice settings opens", ["settings"] in v)
        check("SherpaTTS link opens F-Droid", ["url", "https://f-droid.org/packages/org.woheller69.ttsengine/"] in v, v)
        check("no page errors", errs == [], errs)
        b.close()
finally:
    srv.terminate()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

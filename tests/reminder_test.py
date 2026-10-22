#!/usr/bin/env python3
"""v95 smart reminder + notification toggles in a real browser with stubbed LocalNotifications / AppWidget plugins.
Run from repo root: python3 tests/reminder_test.py"""
import json, subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8899"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1); URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
STUB = r"""
window.__ln=[];window.__wd=[];
window.Capacitor={isNativePlatform:function(){return true},Plugins:{LocalNotifications:{
 requestPermissions:function(){return Promise.resolve({})},createChannel:function(){return Promise.resolve()},
 cancel:function(o){window.__ln.push(["cancel",o]);return Promise.resolve()},
 schedule:function(o){window.__ln.push(["schedule",JSON.parse(JSON.stringify(o))]);return Promise.resolve()}}}};
window.__axWidget={update:function(o){window.__wd.push(JSON.parse(o.json));return Promise.resolve()}};
"""
def sched(pg):
    return [x[1]["notifications"] for x in pg.evaluate("window.__ln") if x[0] == "schedule"]
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.add_init_script(STUB); pg.goto(URL); pg.wait_for_timeout(1500)
        pg.evaluate("PR.rmt='23:59';window.__ln.length=0;remind(1)")
        s = sched(pg); n = s[-1] if s else []
        check("reminder schedules upcoming workout days", len(n) >= 1, s)
        if n:
            check("ids are 9..15", all(9 <= x["id"] <= 15 for x in n), [x["id"] for x in n])
            check("one-shot with a time", all("at" in x["schedule"] for x in n), n[0])
            check("body names the workout", all(x["body"].endswith("Ready when you are.") and len(x["body"]) > 22 for x in n), n[0]["body"])
            check("today title", any(x["title"] == "Time to move" for x in n) or n[0]["id"] != 9, n[0]["title"])
        pg.evaluate("var i=todayIdx();st['x'+i]=1;window.__ln.length=0;remind(1)")
        s = sched(pg); m = s[-1] if s else []
        check("rest day is skipped", all(x["id"] != 9 for x in m), [x["id"] for x in m])
        pg.evaluate("PR.rmt='';window.__ln.length=0;remind(1)")
        check("no time set = nothing scheduled", sched(pg) == [], sched(pg))
        check("goal alert toggle on by default", pg.evaluate("document.getElementById('t-nga').checked") is True)
        check("compact toggle off by default", pg.evaluate("document.getElementById('t-ncp').checked") is False)
        pg.evaluate("var e=document.getElementById('t-nga');e.checked=false;e.onchange.call(e);var c=document.getElementById('t-ncp');c.checked=true;c.onchange.call(c);window.__wd.length=0;axWidgetSync()")
        w = pg.evaluate("window.__wd")
        check("widget json carries nga=0 and ncp=1", bool(w) and w[-1].get("nga") == 0 and w[-1].get("ncp") == 1, w)
        check("widget json carries stride", bool(w) and 0.4 <= w[-1].get("stride", 0) <= 1.6, w)
        check("no page errors", errs == [], errs)
        b.close()
finally:
    srv.terminate()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

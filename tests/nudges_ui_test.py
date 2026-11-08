#!/usr/bin/env python3
"""v140 nudges: settings row, sheet, persistence and scheduling in a real browser with a stubbed LocalNotifications plugin.
Run from repo root: python3 tests/nudges_ui_test.py"""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8897"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1); URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
STUB = r"""
window.__ln=[];
window.Capacitor={isNativePlatform:function(){return true},Plugins:{LocalNotifications:{
 requestPermissions:function(){window.__ln.push(["perm"]);return Promise.resolve({})},
 createChannel:function(o){window.__ln.push(["channel",o.id]);return Promise.resolve()},
 cancel:function(o){window.__ln.push(["cancel",o.notifications.length]);return Promise.resolve()},
 schedule:function(o){window.__ln.push(["schedule",JSON.parse(JSON.stringify(o))]);return Promise.resolve()}}}};
"""
def sched(pg): return [x[1]["notifications"] for x in pg.evaluate("window.__ln") if x[0] == "schedule"]
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 390, "height": 800}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.add_init_script(STUB); pg.goto(URL); pg.wait_for_timeout(1800)
        check("module loaded", pg.evaluate("typeof AxNudge==='object'"))
        check("old compact-steps toggle is gone", pg.evaluate("!document.getElementById('t-ncp')"))
        check("setup row exists", pg.evaluate("!!document.getElementById('ax-nudge-open')"))
        pg.evaluate("window.__ln.length=0;AxNudge.plan()")
        s = sched(pg); n = s[-1] if s else []
        ids = [x["id"] for x in n]
        check("plan cancels then schedules", pg.evaluate("window.__ln[0][0]") == "cancel" and len(n) > 5, pg.evaluate("window.__ln.slice(0,3)"))
        check("ids unique and in range", len(set(ids)) == len(ids) and all(3000 <= i < 3600 for i in ids))
        check("hydration + comeback + weekly present", {"nud_hy", "nud_cb", "nud_ws"} <= {x["channelId"] for x in n}, {x["channelId"] for x in n})
        check("channels created before scheduling", pg.evaluate("window.__ln.map(function(x){return x[0]}).indexOf('channel')") < pg.evaluate("window.__ln.map(function(x){return x[0]}).lastIndexOf('schedule')"))
        # open the sheet from the settings row (call click handler directly: row sits inside a collapsed group)
        pg.evaluate("document.getElementById('ax-nudge-open').click()"); pg.wait_for_timeout(300)
        check("sheet opens with title", pg.evaluate("document.getElementById('ax-sht').textContent")=="Notifications")
        check("sheet shows 9 switches (master + 8)", pg.evaluate("document.querySelectorAll('#ax-shb [data-nd]').length")==9)
        # turn hydration off
        pg.evaluate("window.__ln.length=0;var e=document.querySelector('#ax-shb [data-nd=hy]');e.checked=false;e.onchange()"); pg.wait_for_timeout(900)
        s = sched(pg); n = s[-1] if s else []
        check("hydration off removes hydration notifications", n and not any(x["channelId"] == "nud_hy" for x in n), [x["channelId"] for x in n][:5])
        check("setting persisted in PR.nud", pg.evaluate("PR.nud&&PR.nud.hy.on")==0)
        # interval + times
        pg.evaluate("var e=document.querySelector('#ax-shb [data-nd=hy]');e.checked=true;e.onchange();var s=document.querySelector('#ax-shb [data-ndn=hy]');s.value='3';s.onchange();var t=document.querySelector('#ax-shb [data-ndt=hya]');t.value='10:00';t.onchange()"); pg.wait_for_timeout(900)
        check("interval and start time saved", pg.evaluate("PR.nud.hy.n==3&&PR.nud.hy.a=='10:00'"))
        # bad range is repaired
        pg.evaluate("var t=document.querySelector('#ax-shb [data-ndt=hyb]');t.value='09:00';t.onchange()"); pg.wait_for_timeout(300)
        check("end before start resets window", pg.evaluate("PR.nud.hy.a=='09:00'&&PR.nud.hy.b=='21:00'"))
        # master off
        pg.evaluate("window.__ln.length=0;var e=document.querySelector('#ax-shb [data-nd=on]');e.checked=false;e.onchange()"); pg.wait_for_timeout(900)
        check("master off schedules nothing", sched(pg) == [] or all(len(x) == 0 for x in sched(pg)))
        # test notification button
        pg.evaluate("window.__ln.length=0;document.querySelector('#ax-shb [data-ndtest]').click()")
        s = sched(pg); check("test button schedules one in a few seconds", len(s) == 1 and len(s[0]) == 1 and s[0][0]["id"] == 3599)
        # backup restore keeps and validates nud
        pg.evaluate("restorePrefs({nud:{on:1,hy:{on:0,n:9,a:'x',b:'y'},ws:{on:0}}})")
        check("restorePrefs validates nud", pg.evaluate("PR.nud.hy.on==0&&PR.nud.hy.n==2&&PR.nud.ws.on==0&&PR.nud.ci.t=='08:00'"))
        check("no page errors", not errs, errs)
        b.close()
finally:
    srv.terminate()
print("\n" + ("ALL PASSED" if not fails else "FAILED: %s" % fails)); sys.exit(1 if fails else 0)

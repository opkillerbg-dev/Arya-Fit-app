#!/usr/bin/env python3
"""v96 native back button (@capacitor/app) behaviour in a real browser with a stubbed App plugin.
Run from repo root: python3 tests/backnav_test.py"""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8897"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1); URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
STUB = r"""window.__exit=0;window.Capacitor={isNativePlatform:function(){return true},Plugins:{App:{
 addListener:function(n,f){if(n=='backButton')window.__bb=f;return Promise.resolve({remove:function(){}})},
 exitApp:function(){window.__exit++}}}};"""
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.add_init_script(STUB); pg.goto(URL); pg.wait_for_timeout(2500)
        vis = lambda: pg.evaluate("VIEWS.filter(function(v){var e=document.getElementById('ax-v-'+v);return e&&!e.hidden})[0]")
        back = lambda: (pg.evaluate("window.__bb({canGoBack:true})"), pg.wait_for_timeout(250))
        ex = lambda: pg.evaluate("window.__exit")
        check("listener registered", pg.evaluate("typeof window.__bb") == "function")
        for v in ("prog", "timers", "plan", "set"):
            pg.evaluate("go('%s')" % v); back()
            check("%s -> back -> Home" % v, vis() == "home", vis())
        check("no exit while navigating", ex() == 0, ex())
        pg.evaluate("go('set');go('plans')"); back()
        check("plans -> Settings", vis() == "set", vis()); back()
        check("Settings -> Home", vis() == "home", vis())
        pg.evaluate("axSheet('T','<p>x</p>')"); back()
        check("back closes a sheet", pg.evaluate("document.getElementById('ax-sh').hidden") is True and vis() == "home")
        pg.evaluate("axDrawer(true)"); back()
        check("back closes the menu", pg.evaluate("!document.body.classList.contains('ax-drawer-open')"))
        pg.evaluate("var o=document.createElement('div');o.id='gov';document.body.appendChild(o)"); back()
        check("back closes an overlay", pg.evaluate("!document.getElementById('gov')"))
        check("still not exited", ex() == 0, ex())
        back()
        check("Home: first back shows hint, no exit", ex() == 0 and "Press back again" in pg.evaluate("document.body.innerText"), ex())
        back()
        check("Home: second back exits", ex() == 1, ex())
        pg.wait_for_timeout(2600); back()
        check("after the hint expired, one back only warns", ex() == 1, ex())
        check("no page errors", errs == [], errs)
        b.close()
finally:
    srv.terminate()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

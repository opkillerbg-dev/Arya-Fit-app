"""Regression: V2 must boot on a rest day (no observer loop), show no hero placeholder, and keep Close day above the nav."""
import subprocess, time, sys
from playwright.sync_api import sync_playwright
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8973", "-d", "web"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok):
    global fails; print(("ok   " if ok else "FAIL ") + n); fails += 0 if ok else 1
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 360, "height": 800})
        ctx.add_init_script("(()=>{const R=Date,off=new R('2026-10-11T09:00:00').getTime()-R.now();class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}};window.Date=D})()")
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        try:
            pg.goto("http://127.0.0.1:8973/index.html", timeout=15000); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=15000); booted = True
        except Exception: booted = False
        check("V2 boots on a rest day (no hang)", booted)
        if booted:
            pg.evaluate("go('plan')"); pg.wait_for_timeout(700)
            check("rest day shows no hero placeholder", pg.evaluate("!document.querySelector('.v2-session-hero')"))
            r = pg.evaluate("(()=>{var a=document.querySelector('#ax-v-plan .ax-pbar'),n=document.querySelector('.v2-nav,.v2-tabbar,#v2-shell-controls');if(!a)return null;a.scrollIntoView({block:'end'});var ar=a.getBoundingClientRect();return [ar.bottom,innerHeight]})()")
            check("Close day bar sits above the bottom nav area", r is None or r[0] <= r[1] - 90)
            check("no page errors", not errs)
        b.close()
finally:
    srv.terminate()
print("V2 rest-day checks passed" if not fails else "FAILURES: %d" % fails); sys.exit(1 if fails else 0)

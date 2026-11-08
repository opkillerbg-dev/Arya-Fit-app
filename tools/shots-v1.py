"""P0 baseline: screenshots of every V1 tab on a fresh profile (and the Settings pages). Usage: python3 tools/shots-v1.py [outdir]"""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
out = sys.argv[1] if len(sys.argv) > 1 else "docs/v1-simplify/before"
os.makedirs(out, exist_ok=True)
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8979", "-d", "web"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5)
URL = "http://127.0.0.1:8979/index.html"
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1).new_page()
        pg.goto(URL); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(2500)
        for v in ["home", "plan", "timers", "prog", "set"]:
            pg.evaluate("go('%s')" % v); pg.wait_for_timeout(700)
            pg.screenshot(path="%s/%s.png" % (out, v), full_page=False)
            pg.screenshot(path="%s/%s_full.png" % (out, v), full_page=True)
        for k in ["look", "run", "alert", "plan", "data", "about"]:
            pg.evaluate("go('set'); axSettingsHub.show('%s')" % k); pg.wait_for_timeout(500)
            pg.screenshot(path="%s/set_%s.png" % (out, k), full_page=False)
        pg.evaluate("go('home'); axDrawer(true)"); pg.wait_for_timeout(600)
        pg.screenshot(path="%s/drawer.png" % out)
        print("name on home:", pg.evaluate("go('home'); document.getElementById('ax-name').textContent"))
finally:
    srv.terminate()

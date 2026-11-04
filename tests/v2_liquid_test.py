"""Liquid glass: on by default in Chromium, toggle off removes it, V2 off leaves nothing behind."""
import subprocess, time, sys
from playwright.sync_api import sync_playwright
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8974", "-d", "web"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok):
    global fails; print(("ok   " if ok else "FAIL ") + n); fails += 0 if ok else 1
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 360, "height": 800}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("http://127.0.0.1:8974/index.html"); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1500)
        check("liquid attribute set", pg.evaluate("document.documentElement.dataset.liquid")=="1")
        check("nav has refraction filter", pg.evaluate("/url\\(/.test(document.querySelector('.v2-nav').style.backdropFilter)"))
        check("svg filters created", pg.evaluate("document.querySelectorAll('filter').length")>0)
        pg.evaluate("AxLiquid.set(false)"); pg.wait_for_timeout(300)
        check("toggle off clears filters", pg.evaluate("!document.documentElement.dataset.liquid && !document.querySelector('[data-liquid-el]') && !document.querySelector('filter')"))
        pg.evaluate("AxLiquid.set(true)"); pg.wait_for_timeout(500)
        check("toggle on restores", pg.evaluate("!!document.querySelector('[data-liquid-el]')"))
        pg.evaluate("AxV2.setEnabled(false)"); pg.wait_for_timeout(400)
        check("V2 off removes liquid", pg.evaluate("!document.documentElement.dataset.liquid && !document.querySelector('[data-liquid-el]') && !document.querySelector('filter')"))
        check("no page errors", not errs)
        b.close()
finally:
    srv.terminate()
print("V2 liquid checks passed" if not fails else "FAILURES: %d" % fails); sys.exit(1 if fails else 0)

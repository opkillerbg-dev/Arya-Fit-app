"""Glass studio: hub quick toggles + glass row, presets, sliders, persistence, cleanup when V2 is off."""
import subprocess, time, sys
from playwright.sync_api import sync_playwright
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8975", "-d", "web"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok):
    global fails; print(("ok   " if ok else "FAIL ") + n); fails += 0 if ok else 1
URL = "http://127.0.0.1:8975/index.html"
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 360, "height": 800}); pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1500)
        pg.evaluate("go('set')"); pg.wait_for_timeout(1200)
        check("quick toggles present (4)", pg.evaluate("document.querySelectorAll('#v2-quick [data-q]').length") == 4)
        check("Glass studio row in hub", pg.evaluate("!!document.querySelector('#ax-sm [data-sp=glass]')"))
        # quick tile: haptics toggles the real checkbox
        before = pg.evaluate("document.getElementById('t-hap').checked")
        pg.evaluate("document.querySelector('[data-q=haptics]').click()"); pg.wait_for_timeout(200)
        check("haptics tile flips the real setting", pg.evaluate("document.getElementById('t-hap').checked") != before)
        pg.evaluate("document.querySelector('[data-q=haptics]').click()"); pg.wait_for_timeout(100)
        pg.evaluate("document.querySelector('#ax-sm [data-sp=glass]').click()"); pg.wait_for_timeout(900)
        check("studio page opens", pg.evaluate("!document.getElementById('ax-sp-glass').hidden"))
        check("preview lens has refraction filter", pg.evaluate("/url\\(/.test(document.getElementById('lg-lens').style.backdropFilter)"))
        f1 = pg.evaluate("document.getElementById('lg-lens').style.backdropFilter")
        pg.evaluate("document.querySelector('[data-preset=subtle]').click()"); pg.wait_for_timeout(500)
        check("preset applies (thickness 40)", pg.evaluate("AxLiquid.params.thickness") == 40)
        check("filter rebuilt after change", pg.evaluate("document.getElementById('lg-lens').style.backdropFilter") != f1)
        pg.evaluate("(()=>{var e=document.getElementById('lg-blur');e.value='3.5';e.dispatchEvent(new Event('input',{bubbles:true}))})()"); pg.wait_for_timeout(600)
        check("slider sets blur", pg.evaluate("AxLiquid.params.blur") == 3.5)
        check("slider updates label", pg.evaluate("document.getElementById('lg-blur-o').textContent") == "3.5px")
        check("css variables follow material", pg.evaluate("document.documentElement.style.getPropertyValue('--lg-glow').indexOf('14px')>0"))
        pg.wait_for_timeout(700)
        check("saved in PR.v2LiquidP", pg.evaluate("PR.v2LiquidP&&PR.v2LiquidP.blur")==3.5)
        pg.reload(); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1800)
        check("settings survive reload", pg.evaluate("AxLiquid.params.blur")==3.5 and pg.evaluate("AxLiquid.params.thickness")==40)
        pg.evaluate("AxLiquid.reset()"); pg.wait_for_timeout(300)
        check("reset restores defaults", pg.evaluate("AxLiquid.params.thickness")==80 and pg.evaluate("AxLiquid.matches()")=="ios")
        pg.evaluate("AxV2.setEnabled(false)"); pg.wait_for_timeout(600)
        check("V2 off removes studio + quick toggles", pg.evaluate("!document.getElementById('v2-quick') && !document.getElementById('ax-sp-glass') && !document.querySelector('[data-sp=glass]')"))
        check("no page errors", not errs)
        b.close()
finally:
    srv.terminate()
print("V2 glass studio checks passed" if not fails else "FAILURES: %d" % fails); sys.exit(1 if fails else 0)

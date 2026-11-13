"""V1 is the main UI. V2 is an opt-in beta: new installs start on V1, no 'try the new look' popup,
anyone who had V2 only because it was the old default is moved back ONCE, and an explicit later opt-in sticks."""
import subprocess, sys, time
from playwright.sync_api import sync_playwright
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8978", "-d", "web"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok):
    global fails; print(("ok   " if ok else "FAIL ") + n); fails += 0 if ok else 1
URL = "http://127.0.0.1:8978/index.html"
def boot(pg, reload=False):
    if reload: pg.reload()
    else: pg.goto(URL)
    pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1500)
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 360, "height": 800}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        boot(pg)
        check("new install starts on V1 (no html.v2)", pg.evaluate("!document.documentElement.classList.contains('v2')"))
        check("no V2 elements in the page", pg.evaluate("document.querySelectorAll('.v2-nav,.v2-shell-controls,.v2-today-hero,.v2-avatar').length===0"))
        check("new install records the default decision (v2Rst=1, v2 unset)", pg.evaluate("PR.v2Rst===1 && PR.v2!==1"))
        pg.wait_for_timeout(3500)
        check("no 'A new way to train' popup", pg.evaluate("!/new way to train/i.test(document.body.innerText)"))
        pg.evaluate("go('set')"); pg.wait_for_timeout(500)
        pg.evaluate("axSettingsHub&&axSettingsHub.show('look')"); pg.wait_for_timeout(500); pg.evaluate("document.querySelector('#ax-sp-look .ax-adv').open=true"); pg.wait_for_timeout(200)   # New look lives under Advanced (v148)
        check("Settings has 'New look (beta)', unchecked", pg.evaluate("(()=>{var r=document.getElementById('ax-v2-row'),t=document.getElementById('t-v2');return !!r&&/beta/i.test(r.innerText)&&!t.checked})()"))
        # opt in through the real toggle
        pg.evaluate("document.getElementById('t-v2').click()"); pg.wait_for_timeout(700)
        check("toggle turns V2 on", pg.evaluate("document.documentElement.classList.contains('v2')"))
        boot(pg, reload=True)
        check("opt-in survives a restart", pg.evaluate("document.documentElement.classList.contains('v2') && PR.v2===1"))
        pg.evaluate("AxV2.setEnabled(false)"); pg.wait_for_timeout(500)
        boot(pg, reload=True)
        check("switching back keeps V1 after restart", pg.evaluate("!document.documentElement.classList.contains('v2')"))
        # migration: a user who had V2 only because it used to be the default
        pg.evaluate("PR.v2=1; delete PR.v2Rst; save()"); pg.wait_for_timeout(300)
        boot(pg, reload=True)
        check("old default-V2 user is moved back to V1 once", pg.evaluate("!document.documentElement.classList.contains('v2') && PR.v2===0 && PR.v2Rst===1"))
        pg.evaluate("AxV2.setEnabled(true)"); pg.wait_for_timeout(400)
        boot(pg, reload=True)
        check("explicit opt-in after the reset is kept", pg.evaluate("document.documentElement.classList.contains('v2')"))
        check("no page errors", not errs)
        b.close()
finally:
    srv.terminate()
print("V1-default checks passed" if not fails else "FAILURES: %d" % fails); sys.exit(1 if fails else 0)

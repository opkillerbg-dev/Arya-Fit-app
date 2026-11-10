"""V1 simplification P3: one navigation. No drawer button, short quick actions, Plan > Manage is the one home for plan tools, Settings has no Plan row."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8983"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok, i=""):
    global fails; print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  -> " + str(i))); fails += 0 if ok else 1
URL = "http://127.0.0.1:8983/index.html"
def boot(pg):
    pg.goto(URL); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1800)
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 390, "height": 844}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        boot(pg)
        check("left drawer button is hidden", pg.evaluate("getComputedStyle(document.getElementById('ax-tmenu')).display==='none'"))
        pg.evaluate("document.getElementById('ax-tmore').click()"); pg.wait_for_timeout(300)
        t = pg.evaluate("document.getElementById('ax-shb').innerText")
        check("quick actions: only Daily check-in (+ Close today when in plan)", "Daily check-in" in t and "Add exercise" not in t and "Export backup" not in t, t)
        pg.evaluate("axSheetX()")
        pg.evaluate("go('plan')"); pg.wait_for_timeout(500)
        check("Plan has a labelled Manage button", pg.evaluate("document.getElementById('ax-pmore').innerText.trim()==='Manage'"))
        pg.click("#ax-pmore"); pg.wait_for_timeout(300)
        t = pg.evaluate("document.getElementById('ax-shb').innerText")
        for w in ["Add exercise", "Switch, import or export plan", "Personalise my plan", "Smart week", "More plan tools"]:
            check("Manage lists: " + w, w in t, t)
        check("Manage has no duplicate 'Mark rest day'", "Mark rest day" not in t)
        # Add exercise opens the add sheet
        pg.click("#ax-m2"); pg.wait_for_timeout(500)
        check("Manage > Add exercise opens the add sheet", pg.evaluate("/exercise/i.test(document.getElementById('ax-sht').textContent)&&!document.getElementById('ax-sh').hidden"))
        pg.evaluate("axSheetX()")
        # Plans view and back goes to Plan
        pg.click("#ax-pmore"); pg.wait_for_timeout(300); pg.click("#ax-m3"); pg.wait_for_timeout(500)
        check("Manage > Plans opens the Plans view", pg.evaluate("!document.getElementById('ax-v-plans').hidden"))
        pg.click("#pl-back"); pg.wait_for_timeout(300)
        check("Plans > Back returns to Plan", pg.evaluate("!document.getElementById('ax-v-plan').hidden"))
        # Smart week
        pg.click("#ax-pmore"); pg.wait_for_timeout(300); pg.click("#ax-m5"); pg.wait_for_timeout(700)
        check("Manage > Smart week opens it", pg.evaluate("!document.getElementById('ax-sh').hidden||!!document.querySelector('#ax-coach-card,.ax-coach')"))
        pg.evaluate("axSheetX()")
        # Personalise opens the wizard
        pg.click("#ax-pmore"); pg.wait_for_timeout(300); pg.click("#ax-m4"); pg.wait_for_timeout(600)
        check("Manage > Personalise opens the wizard", pg.evaluate("AxOnboard.isOpen()"))
        pg.evaluate("AxOnboard.close()"); pg.wait_for_timeout(300)
        # More plan tools -> page with library; back returns to Plan
        pg.evaluate("go('plan')"); pg.click("#ax-pmore"); pg.wait_for_timeout(300); pg.click("#ax-m6"); pg.wait_for_timeout(700)
        check("More plan tools shows the library and plan page", pg.evaluate("!document.getElementById('ax-v-set').hidden&&!document.getElementById('ax-sp-plan').hidden&&!!document.getElementById('ax-lib')"))
        pg.click("#ax-sp-plan .ax-sp-b"); pg.wait_for_timeout(400)
        check("Back from plan tools returns to Plan", pg.evaluate("!document.getElementById('ax-v-plan').hidden"))
        # Settings: no Plan row
        pg.evaluate("go('set')"); pg.wait_for_timeout(500)
        rows = pg.evaluate("Array.from(document.querySelectorAll('#ax-sm [data-sp]')).map(b=>b.dataset.sp)")
        check("Settings has no Plan & exercises row", "plan" not in rows and len(rows) == 5, rows)
        # moved hint for established installs, not for new ones
        check("new install does not see the 'moved' hint", pg.evaluate("!document.querySelector('#ax-sm .ax-mv')"))
        pg.evaluate("delete PR.born; delete PR.mvHint; save(); go('home')"); pg.wait_for_timeout(400); pg.evaluate("go('set')"); pg.wait_for_timeout(600)
        check("established install sees the 'moved' hint once", pg.evaluate("!!document.querySelector('#ax-sm .ax-mv')"))
        pg.click("#ax-sm [data-mv=ok]"); pg.wait_for_timeout(300)
        check("hint goes away after Got it", pg.evaluate("!document.querySelector('#ax-sm .ax-mv')&&PR.mvHint===1"))
        # exports/backup still reachable in Settings > Data & backup
        pg.evaluate("axSettingsHub.show('data')"); pg.wait_for_timeout(300)
        check("Backup lives in Settings > Data & backup", pg.evaluate("!!document.querySelector('#ax-sp-data #ex')"))
        check("no page errors", not errs, errs)
        b.close()
finally:
    srv.terminate()
print("FAILED %d" % fails if fails else "all passed"); sys.exit(1 if fails else 0)

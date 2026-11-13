"""V1 simplification P7: Me (Settings). 5 plain rows, rarely used rows under Advanced, no product names in plan import copy."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8989"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok, i=""):
    global fails; print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  -> " + str(i))); fails += 0 if ok else 1
URL = "http://127.0.0.1:8989/index.html"
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 390, "height": 844}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(URL); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1800)
        pg.evaluate("go('set')"); pg.wait_for_timeout(600)
        check("tab heading is Me", pg.evaluate("document.querySelector('#ax-v-set h1').textContent")=="Me")
        titles = pg.evaluate("Array.from(document.querySelectorAll('#ax-sm [data-sp] b')).map(b=>b.textContent.trim())")
        check("five plain rows", titles == ["Appearance", "Run & steps", "Reminders & sound", "Data & backup", "About"] or sorted(titles)==sorted(["Appearance", "Run & steps", "Reminders & sound", "Data & backup", "About"]), titles)
        check("reminder subtitle shows state", "reminder" in pg.evaluate("document.getElementById('ax-sm').innerText").lower())
        # advanced folds
        for page, adv, vis in [("look", ["Glass look", "Smooth mode", "New look (beta)"], ["Theme", "Accent color", "Exercise pictures"]),
                               ("run", ["Auto-pause", "Cadence beat", "Auto rest timer"], ["GPS and step tracking", "Run goal (km)", "Step counting"]),
                               ("alert", ["Test voice", "Voice engine and voice", "Test haptics"], ["Daily reminder", "Goal reached alert", "Voice cues", "Haptics"])]:
            pg.evaluate("axSettingsHub.show('%s')" % page); pg.wait_for_timeout(300)
            inadv = pg.evaluate("Array.from(document.querySelectorAll('#ax-sp-%s .ax-adv .row b')).map(b=>b.textContent.trim())" % page)
            top = pg.evaluate("Array.from(document.querySelectorAll('#ax-sp-%s .ax-sp-card .row b')).map(b=>b.textContent.trim())" % page)
            check("%s: advanced rows are folded" % page, all(a in inadv for a in adv), inadv)
            check("%s: the everyday rows stay on top" % page, all(v in top for v in vis), top)
            check("%s: Advanced is collapsed" % page, pg.evaluate("(()=>{var d=document.querySelector('#ax-sp-%s .ax-adv');return !!d&&!d.open})()" % page))
        # the folded controls still work
        pg.evaluate("axSettingsHub.show('look')"); pg.wait_for_timeout(200)
        pg.evaluate("document.querySelector('#ax-sp-look .ax-adv').open=true")
        pg.evaluate("document.getElementById('t-lite').click()"); pg.wait_for_timeout(200)
        check("Smooth mode toggle still works inside Advanced", pg.evaluate("localStorage.getItem('axLite')")=="1")
        pg.evaluate("document.getElementById('t-lite').click()")
        # plans copy
        txt = pg.evaluate("document.getElementById('ax-v-plans').innerText") if pg.evaluate("!!document.getElementById('ax-v-plans')") else ""
        pg.evaluate("go('plans')"); pg.wait_for_timeout(300)
        txt = pg.evaluate("document.getElementById('ax-v-plans').innerText")
        check("Plans copy has no product name", "Claude" not in txt, txt[:300])
        check("Plans copy points at any AI assistant", "AI assistant" in txt)
        check("no page errors", not errs, errs)
        b.close()
finally:
    srv.terminate()
print("FAILED %d" % fails if fails else "all passed"); sys.exit(1 if fails else 0)

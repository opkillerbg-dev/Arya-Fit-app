#!/usr/bin/env python3
"""S7: entry points for existing users (Home card, Settings rows, edit mode). Nothing changes until the person opts in. Run from repo root."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8895"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
def txt(pg): return pg.evaluate("document.getElementById('ax-ob')?document.getElementById('ax-ob').innerText:''")
def wait(pg, ms=250): pg.wait_for_timeout(ms)
def settings(pg):
    pg.evaluate("go('set')"); pg.wait_for_timeout(350)
    if not pg.evaluate("document.getElementById('ax-ob-row').offsetParent!==null"):
        pg.click("#ax-v-set [data-sp='plan']"); pg.wait_for_timeout(350)
try:
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel="chrome")
        except Exception: b = pw.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(URL, wait_until="load"); wait(pg, 1200)
        # an existing user: some ticks, no profile
        pg.evaluate("(()=>{const o=APP.plans[APP.active].st;o['1:wu']=1;o['2:wu']=1;save()})()"); pg.reload(wait_until="load"); wait(pg, 2200)
        snap = pg.evaluate("JSON.stringify(APP.plans)")
        check("existing user sees the Home card; wizard did not open by itself", pg.evaluate("!!document.getElementById('ax-ob-nudge')") and not pg.evaluate("AxOnboard.isOpen()"))
        check("nothing changed yet: no profile, same plans", pg.evaluate("AxProfile.get()") is None and pg.evaluate("JSON.stringify(APP.plans)") == snap)
        settings(pg)
        check("Settings > Plan tools has 'Personalise my plan' (Start) and no profile row", pg.evaluate("document.getElementById('ax-ob-set').textContent") == "Start" and pg.evaluate("!document.getElementById('ax-ob-prow')"))
        pg.evaluate("go('plans')"); wait(pg, 300)
        check("old builder is labelled as the advanced quick builder", pg.evaluate("!!document.getElementById('bld-card')&&document.getElementById('bld-card').innerText.includes('Quick plan builder (advanced)')"))
        pg.evaluate("go('home')"); wait(pg, 300)
        pg.click("#ax-ob-later"); wait(pg, 200)
        check("'Not now' hides the card and snoozes it across a restart", pg.evaluate("!document.getElementById('ax-ob-nudge')"))
        pg.reload(wait_until="load"); wait(pg, 2200)
        check("still snoozed after reload", pg.evaluate("!document.getElementById('ax-ob-nudge')") and pg.evaluate("PR.obz>Date.now()"))
        # opt in through Settings
        settings(pg); pg.click("#ax-ob-set"); wait(pg, 300)
        check("Start opens the wizard on the welcome screen with a 'Not now' button", pg.evaluate("AxOnboard.isOpen()") and "Not now" in txt(pg))
        pg.click("#ob-go"); wait(pg, 200); pg.fill("#ob-name", "Arya"); pg.click("#ob-next"); wait(pg, 200)
        pg.click("#ax-ob .ob-c[data-v='no']"); pg.click("#ob-next"); wait(pg, 200)
        pg.click("#ax-ob .ob-o[data-v='strength']"); wait(pg, 200); pg.click("#ob-next"); wait(pg, 200)
        for _ in range(5): pg.click("#ob-next"); wait(pg, 200)
        check("review says the current plan is kept", "Your starting levels" in txt(pg) and "current plan is kept" in txt(pg))
        old_ids = pg.evaluate("Object.keys(APP.plans)"); old_ticks = pg.evaluate("Object.keys(APP.plans[APP.active].st).filter(k=>/^\\d+:/.test(k)).length")
        pg.click("#ob-create"); wait(pg, 700)
        ids = pg.evaluate("Object.keys(APP.plans)")
        check("Create adds a new plan; the old plan and its ticks are untouched", len(ids) == len(old_ids) + 1 and pg.evaluate("Object.keys(APP.plans['%s'].st).filter(k=>/^\\d+:/.test(k)).length" % old_ids[0]) == old_ticks, [old_ids, ids])
        check("profile saved, goal strength", pg.evaluate("AxProfile.get().goal.main") == "strength" and pg.evaluate("AxProfile.get().name") == "Arya")
        # now with a profile
        settings(pg)
        check("Settings shows Redo and a My profile row with a summary", pg.evaluate("document.getElementById('ax-ob-set').textContent") == "Redo" and "Get stronger" in pg.evaluate("document.getElementById('ax-ob-psum').textContent"), pg.evaluate("document.getElementById('ax-ob-psum')&&document.getElementById('ax-ob-psum').textContent"))
        pg.evaluate("go('home')"); wait(pg, 300)
        check("the Home card is gone once there is a profile", pg.evaluate("!document.getElementById('ax-ob-nudge')"))
        # edit answers only
        settings(pg); pg.click("#ax-ob-pedit"); wait(pg, 300)
        check("Edit opens on the first question screen with the saved answers", pg.evaluate("AxOnboard.step()") == 1 and pg.input_value("#ob-name") == "Arya")
        pg.fill("#ob-name", "Arya F"); pg.click("#ob-next"); wait(pg, 150); pg.click("#ob-next"); wait(pg, 150)
        check("goal screen shows the saved goal selected", pg.evaluate("document.querySelector('#ax-ob .ob-o.on').getAttribute('data-v')") == "strength")
        pg.click("#ax-ob .ob-o[data-v='muscle']"); wait(pg, 200)
        for _ in range(6): pg.click("#ob-next"); wait(pg, 150)
        check("edit review offers Save answers and Create a new plan", pg.evaluate("!!document.getElementById('ob-save')&&!!document.getElementById('ob-create')"), txt(pg)[-200:])
        n_plans = pg.evaluate("Object.keys(APP.plans).length"); active = pg.evaluate("APP.active")
        pg.click("#ob-save"); wait(pg, 500)
        check("Save answers updates the profile only: same plans, same active plan", pg.evaluate("Object.keys(APP.plans).length") == n_plans and pg.evaluate("APP.active") == active and pg.evaluate("AxProfile.get().goal.main") == "muscle" and pg.evaluate("AxProfile.get().name") == "Arya F")
        check("wizard closed and no draft left that would resume", not pg.evaluate("AxOnboard.isOpen()"))
        # redo creates another plan
        settings(pg); pg.click("#ax-ob-set"); wait(pg, 300)
        check("Redo starts from the saved answers (not the welcome screen)", pg.evaluate("AxOnboard.step()") == 1 and pg.input_value("#ob-name") == "Arya F")
        for _ in range(8): pg.click("#ob-next"); wait(pg, 120)
        pg.click("#ob-create"); wait(pg, 700)
        check("Redo > Create adds a third plan", pg.evaluate("Object.keys(APP.plans).length") == n_plans + 1)
        check("no page errors", not errs, errs)
        ctx.close(); b.close()
finally:
    srv.terminate()
print("FAILED: " + ", ".join(fails) if fails else "ALL OK"); sys.exit(1 if fails else 0)

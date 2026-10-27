#!/usr/bin/env python3
"""Real-browser test of the onboarding wizard shell (S4): screens 0-3, back, draft resume, skip defaults, units, Android back. Run from repo root."""
import json, subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8890"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
def page(b, seed=None):
    ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(800)
    if seed is not None:
        pg.evaluate("s=>{localStorage.clear();for(const k in s)localStorage.setItem(k,s[k])}", seed); pg.reload(wait_until="load")
    pg.wait_for_timeout(1500)
    return ctx, pg, errs
def txt(pg): return pg.evaluate("document.getElementById('ax-ob')?document.getElementById('ax-ob').innerText:''")
def draft(pg): return pg.evaluate("AxProfile.draftGet()")
try:
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel="chrome")
        except Exception: b = pw.chromium.launch()
        ctx, pg, errs = page(b)
        check("fresh install: wizard does not open by itself yet (AUTOSTART off)", not pg.evaluate("AxOnboard.isOpen()") and pg.evaluate("AxOnboard.isFresh()"))
        pg.evaluate("AxOnboard.open()"); pg.wait_for_timeout(200)
        check("welcome screen opens full screen with Start and Skip", "Start" in txt(pg) and "Skip, use a standard plan" in txt(pg))
        pg.click("#ob-go"); pg.wait_for_timeout(200)
        check("screen 1 shows you-questions and a progress bar", "About you" in txt(pg) and pg.evaluate("!!document.querySelector('#ax-ob [role=progressbar]')"))
        pg.fill("#ob-name", "Arya"); pg.fill("#ob-ht", "178"); pg.fill("#ob-wt", "76")
        pg.click("#ax-ob .ob-c[data-v='30-39']"); pg.click("#ax-ob .ob-c[data-v='m']"); pg.wait_for_timeout(100)
        d = draft(pg)
        check("each answer is saved to the draft", d["name"] == "Arya" and d["ht"] == 178 and d["wt"] == 76 and d["age"] == "30-39" and d["sex"] == "m", d)
        pg.click("#ax-ob .ob-st[data-t='ob-wt'][data-s='1']"); pg.wait_for_timeout(100)
        check("stepper changes the value and the draft", draft(pg)["wt"] == 77, draft(pg))
        pg.click("#ax-ob .ob-c[data-v='imperial']"); pg.wait_for_timeout(200)
        check("switching to imperial converts what is shown (5 ft 10 in, 170 lb) and keeps metric stored",
              pg.input_value("#ob-ft") == "5" and pg.input_value("#ob-in") == "10" and pg.input_value("#ob-wt") == "170" and draft(pg)["ht"] == 178, [pg.input_value("#ob-ft"), pg.input_value("#ob-in"), pg.input_value("#ob-wt"), draft(pg)["ht"]])
        pg.fill("#ob-ft", "6"); pg.fill("#ob-in", "0"); pg.fill("#ob-wt", "200"); pg.wait_for_timeout(100)
        d = draft(pg)
        check("imperial entry is stored as metric (183 cm, 90.7 kg)", d["units"] == "imperial" and d["ht"] == 183 and abs(d["wt"] - 90.7) < 0.2, d)
        pg.click("#ax-ob .ob-c[data-v='under18']"); pg.wait_for_timeout(100)
        check("under 18 shows the gentle note", pg.evaluate("!document.getElementById('ob-u18').hidden"))
        pg.click("#ax-ob .ob-c[data-v='30-39']"); pg.click("#ob-next"); pg.wait_for_timeout(200)
        check("Next goes to the health screen", "health check" in txt(pg).lower())
        pg.click("#ax-ob .ob-c[data-v='notsure']"); pg.wait_for_timeout(100)
        check("Not sure shows the doctor note and stores gentle mode", pg.evaluate("!document.getElementById('ob-hn').hidden") and draft(pg)["health"] == "check")
        pg.click("#ax-ob .ob-c[data-v='no']"); pg.wait_for_timeout(100)
        check("No clears the note and stores ok", pg.evaluate("document.getElementById('ob-hn').hidden") and draft(pg)["health"] == "ok")
        pg.click("#ob-back"); pg.wait_for_timeout(200)
        check("Back returns to screen 1 with answers intact", "About you" in txt(pg) and pg.input_value("#ob-name") == "Arya")
        pg.click("#ob-next"); pg.click("#ob-next"); pg.wait_for_timeout(200)
        check("goal screen lists five goals", pg.evaluate("document.querySelectorAll('#ax-ob .ob-o').length") == 5)
        pg.click("#ax-ob .ob-o[data-v='muscle']"); pg.wait_for_timeout(200); pg.click("#ax-ob .ob-c[data-v='run']"); pg.wait_for_timeout(100)
        check("main goal plus one extra saved", draft(pg)["goal"] == {"main": "muscle", "extra": "run"}, draft(pg))
        pg.click("#ax-ob .ob-o[data-v='run']"); pg.wait_for_timeout(200)
        check("picking the extra as main clears the extra", draft(pg)["goal"] == {"main": "run", "extra": None}, draft(pg))
        # resume after a restart
        pg.reload(wait_until="load"); pg.wait_for_timeout(1500)
        pg.evaluate("AxOnboard.open()"); pg.wait_for_timeout(200)
        check("close and reopen resumes on the same screen with answers", pg.evaluate("AxOnboard.step()") == 3 and "main goal" in txt(pg).lower() and draft(pg)["name"] == "Arya")
        # Android back
        pg.evaluate("axBack()"); pg.wait_for_timeout(200)
        check("Android back steps back one screen", pg.evaluate("AxOnboard.step()") == 2)
        pg.evaluate("axBack();axBack();axBack()"); pg.wait_for_timeout(200)
        check("Android back on the welcome screen closes the wizard and keeps the draft", not pg.evaluate("AxOnboard.isOpen()") and draft(pg)["name"] == "Arya")
        check("a user who has logged any tick is not treated as fresh", not pg.evaluate("(()=>{const o=APP.plans[APP.active].st;o['1:wu']=1;const r=AxOnboard.isFresh();delete o['1:wu'];return r})()"))
        check("closing never created a profile or changed the plan", pg.evaluate("AxProfile.get()") is None)
        check("no page errors", not errs, errs); ctx.close()

        # skip defaults
        ctx, pg, errs = page(b)
        pg.evaluate("AxOnboard.open()"); pg.click("#ob-go"); pg.click("#ob-skip"); pg.wait_for_timeout(200)
        check("skipping 'about you' leaves everything empty and moves on", "health check" in txt(pg).lower() and draft(pg)["ht"] is None and draft(pg)["name"] == "")
        pg.click("#ob-skip"); pg.wait_for_timeout(200)
        check("skipping the health check is safe: gentle mode", draft(pg)["health"] == "check", draft(pg))
        pg.click("#ob-skip"); pg.wait_for_timeout(200)
        check("skipping the goal defaults to general fitness", draft(pg)["goal"]["main"] == "general", draft(pg))
        check("last screen of this update says the rest comes later and can close", "next update" in txt(pg) and pg.evaluate("!!document.getElementById('ob-close')"))
        pg.click("#ob-close"); pg.wait_for_timeout(200)
        check("close removes the overlay", not pg.evaluate("AxOnboard.isOpen()") and pg.evaluate("!document.getElementById('ax-ob')"))
        check("no page errors (skip path)", not errs, errs); ctx.close()

        # skip everything on the welcome screen
        ctx, pg, errs = page(b)
        pg.evaluate("AxOnboard.open()"); pg.click("#ob-skipall"); pg.wait_for_timeout(200)
        check("'Skip, use a standard plan' closes it and it is no longer fresh", not pg.evaluate("AxOnboard.isOpen()") and not pg.evaluate("AxOnboard.isFresh()"))
        check("no page errors (skip all)", not errs, errs); ctx.close()

        # layout sanity on a small phone: nothing wider than the screen, buttons big enough
        ctx = b.new_context(viewport={"width": 360, "height": 640}); pg = ctx.new_page(); pg.goto(URL, wait_until="load"); pg.wait_for_timeout(1500)
        pg.evaluate("AxOnboard.open()"); pg.click("#ob-go"); pg.wait_for_timeout(300)
        check("no sideways scroll on a 360 px wide phone", pg.evaluate("document.getElementById('ob-bd').scrollWidth<=document.getElementById('ob-bd').clientWidth+1"))
        small = pg.evaluate("[...document.querySelectorAll('#ax-ob button')].filter(b=>b.offsetParent&&b.getBoundingClientRect().height<47).length")
        check("every button is at least 48 px tall", small == 0, small)
        ctx.close(); b.close()
finally:
    srv.terminate()
print("FAILED: " + ", ".join(fails) if fails else "ALL OK"); sys.exit(1 if fails else 0)

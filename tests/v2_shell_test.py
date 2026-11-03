#!/usr/bin/env python3
"""P1 V2 shell smoke test. Run from repo root; requires Playwright + Chromium."""
import os, subprocess, sys, time
from playwright.sync_api import sync_playwright
PORT = "8917"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
URL = "http://127.0.0.1:" + PORT + "/index.html"
fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok else " -> " + str(detail)))
    if not ok: fails.append(name)
try:
    time.sleep(.8)
    with sync_playwright() as p:
        try: browser = p.chromium.launch(channel="chrome")
        except Exception: browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width":390,"height":844})
        page = ctx.new_page(); errors=[]
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(URL, wait_until="load")
        page.wait_for_function("!document.getElementById('ax-boot')", timeout=25000)
        page.evaluate("AxV2.setEnabled(true)")
        page.wait_for_selector("#v2-shell-controls .v2-nav")
        check("V2 nav mounts only after enable", page.locator("#v2-shell-controls .v2-nav").count()==1)
        check("four primary tabs plus separate exercise search button", page.locator("#v2-shell-controls .v2-tab").count()==4 and page.locator("#v2-shell-controls .v2-search-button").count()==1)
        for view in ["plan","timers","prog","home"]:
            page.locator('.v2-tab[data-v="'+view+'"]').click()
            page.wait_for_function("v=>!document.getElementById('ax-v-'+v).hidden", arg=view)
        check("primary tabs route through existing go()", page.evaluate("!document.getElementById('ax-v-home').hidden && document.getElementById('ax-v-prog').hidden"))
        page.evaluate("window.scrollTo(0,360)"); page.wait_for_timeout(350)
        check("scroll down collapses nav", page.locator(".v2-nav-wrap.is-collapsed").count()==1)
        page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(350)
        check("scroll up expands nav", page.locator(".v2-nav-wrap.is-collapsed").count()==0)
        page.evaluate("go('home');startSW(0)"); page.wait_for_timeout(350)
        check("active timer shows mini-session pill", page.locator(".v2-mini.is-visible").count()==2)
        page.evaluate("document.getElementById('dfs').click()"); page.wait_for_timeout(300); page.locator(".v2-mini:not(.v2-mini-collapsed) [data-mini-play]").click(); page.wait_for_timeout(150)
        check("mini-session delegates pause to existing timer control", page.locator("#dpp").inner_text().lower()=="resume")
        page.evaluate("closeT()")
        page.locator(".v2-avatar").click()
        check("Today avatar opens account popover", page.locator(".v2-popover.is-open").count()==1)
        page.locator('.v2-pop-row[data-action="settings"]').click()
        check("popover Settings action opens existing Settings view", page.evaluate("!document.getElementById('ax-v-set').hidden"))
        check("no browser page errors", not errors, errors)
        ctx.close(); browser.close()
finally:
    srv.terminate(); srv.wait()
if fails: sys.exit(1)
print("V2 P1 shell checks passed")

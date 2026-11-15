"""V1 simplification P8: help layer. Tips (max 2 shows, never after Got it, new installs only), How it works card, empty-state buttons, no stale tab names."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8993"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok, i=""):
    global fails; print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  -> " + str(i))); fails += 0 if ok else 1
URL = "http://127.0.0.1:8993/index.html"
def boot(pg, reload=False):
    pg.reload() if reload else pg.goto(URL)
    pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1800)
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 390, "height": 844}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        boot(pg)
        pg.wait_for_timeout(2500)
        tips = pg.evaluate("Array.from(document.querySelectorAll('.ax-tip')).map(t=>t.dataset.tip)")
        check("new install sees the Today tip", tips == ["home"], tips)
        check("tip is above Today card and is one line plus a button", pg.evaluate("(()=>{var t=document.querySelector('.ax-tip'),h=document.getElementById('ax-htoday');return !!t&&!!h&&(t.compareDocumentPosition(h)&4)>0&&t.innerText.length<200})()"))
        check("Today tip matches the day (rest day vs workout day)", pg.evaluate("(()=>{var t=document.querySelector('.ax-tip').innerText,r=/Rest day/.test(document.getElementById('ax-htoday').textContent);return r?/rest day/i.test(t)&&!/Tap the big button/.test(t):/Tap the big button/.test(t)})()"))
        # Plan and Move tips
        pg.evaluate("go('plan')"); pg.wait_for_timeout(1200)
        check("Plan tip shows on first visit (Today tip is gone from view)", pg.evaluate("!!document.querySelector('#ax-v-plan .ax-tip')"))
        pg.click("#ax-v-plan [data-tip-ok]"); pg.wait_for_timeout(200)
        check("Got it removes the tip", pg.evaluate("!document.querySelector('#ax-v-plan .ax-tip')"))
        pg.evaluate("go('home')"); pg.wait_for_timeout(300); pg.evaluate("go('plan')"); pg.wait_for_timeout(1000)
        check("a dismissed tip never comes back", pg.evaluate("!document.querySelector('#ax-v-plan .ax-tip')"))
        pg.evaluate("go('timers')"); pg.wait_for_timeout(1200)
        check("Move tip shows", pg.evaluate("!!document.querySelector('#ax-v-timers .ax-tip')"))
        # ignoring a tip: shown at most twice
        pg.evaluate("go('home')"); pg.wait_for_timeout(300)
        pg.evaluate("go('timers')"); pg.wait_for_timeout(1000)
        pg.evaluate("go('home')"); pg.wait_for_timeout(300)
        pg.evaluate("go('timers')"); pg.wait_for_timeout(1000)
        n = pg.evaluate("JSON.parse(localStorage.getItem('axTips')).timers")
        check("an ignored tip is shown at most twice", n == 2, n)
        # established install: no tips
        pg.evaluate("localStorage.removeItem('axTips'); delete PR.born; save()"); boot(pg, reload=True); pg.wait_for_timeout(2500)
        check("installs without PR.born never see tips", pg.evaluate("!document.querySelector('.ax-tip')"))
        # replay from About & help
        pg.evaluate("go('set')"); pg.wait_for_timeout(400); pg.evaluate("axSettingsHub.show('about')"); pg.wait_for_timeout(300)
        t = pg.evaluate("document.getElementById('ax-help').innerText")
        check("How AERUNO works lists all five tabs", all(w in t for w in ["Today", "Plan", "Move", "Progress", "Me"]) and "How AERUNO works" in t, t[:200])
        pg.click("#ax-tips-again"); pg.wait_for_timeout(1800)
        check("Show the tips again brings the Today tip back", pg.evaluate("!!document.querySelector('#ax-v-home .ax-tip')"))
        check("About row is named About & help", pg.evaluate("document.getElementById('ax-sm').innerText.includes('About & help')"))
        # empty-state buttons
        pg.evaluate("go('prog')"); pg.wait_for_timeout(700)
        check("Progress empty state has an Open today button", pg.evaluate("!!document.getElementById('ax-prog-go')"))
        pg.click("#ax-prog-go"); pg.wait_for_timeout(300)
        check("Open today goes to Today", pg.evaluate("!document.getElementById('ax-v-home').hidden"))
        pg.evaluate("go('prog'); axPs('hist')"); pg.wait_for_timeout(600)
        check("History empty state names Move, not Timers", pg.evaluate("(()=>{var t=document.getElementById('ax-ps-hist').innerText;return t.includes('Move tab')&&!t.includes('Timers')})()"))
        pg.click("#ax-hist-go"); pg.wait_for_timeout(300)
        check("Go to Move opens Move", pg.evaluate("!document.getElementById('ax-v-timers').hidden"))
        # stale tab names
        all_txt = pg.evaluate("Array.from(document.querySelectorAll('script')).length")
        check("no page errors", not errs, errs)
        b.close()
finally:
    srv.terminate()
print("FAILED %d" % fails if fails else "all passed"); sys.exit(1 if fails else 0)

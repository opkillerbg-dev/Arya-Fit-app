"""V1 simplification P1: a fresh install gets a neutral Starter plan (no owner name, starts today), a calm Home (no weather prompt,
readiness card or backup nag in the first days), and the welcome copy says what the app is. Established installs are unchanged."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8981"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok, i=""):
    global fails; print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  -> " + str(i))); fails += 0 if ok else 1
URL = "http://127.0.0.1:8981/index.html"
def boot(pg, reload=False):
    if reload: pg.reload()
    else: pg.goto(URL)
    pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(2000)
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 390, "height": 844}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        boot(pg)
        info = pg.evaluate("(()=>{var e=APP.plans[APP.active],pl=e.plan;return {name:pl.name,ath:pl.athlete,start:pl.start,today:ymd(),weeks:pl.weeks,days:Object.keys(pl.days).length,born:!!PR.born,nd:ND}})()")
        check("fresh install: plan is the Starter plan", info["name"] == "Starter plan", info)
        check("fresh install: no athlete name", info["ath"] == "", info)
        check("fresh install: plan starts today", info["start"] == info["today"], info)
        check("fresh install: a full week of days and ND > 7", info["days"] == 7 and info["nd"] >= 21, info)
        check("fresh install: PR.born recorded", info["born"])
        txt = pg.evaluate("document.getElementById('ax-v-home').innerText")
        check("Home has no owner name", "sheladiya" not in txt.lower(), txt[:200])
        check("Home does not say 'Plan complete' to a new user", "plan complete" not in txt.lower(), txt[:300])
        check("Home name placeholder is neutral", pg.evaluate("document.getElementById('ax-name').textContent") == "Your plan")
        check("quiet window is active", pg.evaluate("axQuiet()") is True)
        check("no weather prompt on Home", pg.evaluate("!document.getElementById('ax-wx-card')"))
        check("no readiness card on Home", pg.evaluate("!document.getElementById('ax-readiness-card')"))
        check("no Smart week coach card on day one", pg.evaluate("!document.getElementById('ax-coach-card')"))
        check("no backup nag on Home", pg.evaluate("!document.getElementById('ax-bk-nudge')"))
        check("Today card offers to start", pg.evaluate("/start|view/i.test(document.getElementById('ax-hopen').innerText)"))
        # the plan is usable: open the plan view, a day has exercises, ticking one works
        pg.evaluate("go('plan')"); pg.wait_for_timeout(600)
        check("Plan view renders exercises", pg.evaluate("document.querySelectorAll('#ax-day .ax-ex, #ax-day [data-i], #ax-day .row, #ax-day button').length>0"))
        # quiet ends after 3 ticks
        pg.evaluate("(()=>{var e=APP.plans[APP.active];e.st['0:a']=1;e.st['0:b']=1;e.st['0:c']=1;save()})()")
        check("quiet window ends after 3 ticks", pg.evaluate("axQuiet()") is False)
        pg.evaluate("(()=>{var e=APP.plans[APP.active];delete e.st['0:a'];delete e.st['0:b'];delete e.st['0:c'];save()})()")
        check("quiet window ends after 3 days", pg.evaluate("(()=>{PR.born=Date.now()-4*864e5;return axQuiet()})()") is False)
        pg.evaluate("go('plan'); go('home')"); pg.wait_for_timeout(1200)
        check("readiness card returns once the quiet window is over", pg.evaluate("!!document.getElementById('ax-readiness-card')"))
        check("weather invite returns once the quiet window is over", pg.evaluate("!!document.getElementById('ax-wx-card')"))
        # welcome wording
        pg.evaluate("AxOnboard.open()"); pg.wait_for_timeout(300)
        w = pg.evaluate("document.getElementById('ax-ob').innerText")
        check("welcome says what the app is", "workout, run and step tracker" in w, w[:200])
        check("skip button says starter plan", "Skip, use a starter plan" in w, w[:300])
        pg.evaluate("AxOnboard.close()")
        check("no page errors", not errs, errs)
        # established install (no PR.born): never quiet
        pg.evaluate("delete PR.born; save()"); boot(pg, reload=True)
        check("older installs are never quiet", pg.evaluate("axQuiet()") is False)
        b.close()
finally:
    srv.terminate()
print("FAILED %d" % fails if fails else "all passed"); sys.exit(1 if fails else 0)

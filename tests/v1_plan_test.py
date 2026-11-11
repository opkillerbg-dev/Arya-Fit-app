"""V1 simplification P5: Plan tab wording. Finish day, Reschedule, See all days, friendly rest day, Plan tools header, Plan my next week."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8987"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok, i=""):
    global fails; print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  -> " + str(i))); fails += 0 if ok else 1
URL = "http://127.0.0.1:8987/index.html"
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 390, "height": 844}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(URL); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1800)
        # a workout day (today if it is one, else find the next one)
        pg.evaluate("go('plan')"); pg.wait_for_timeout(400)
        i = pg.evaluate("(()=>{for(var i=0;i<ND;i++){var s=axSrc(i);if(s>=0&&!T[wdk(s)].r&&!T[wdk(s)].m&&i<=todayIdx())return i}return todayIdx()})()")
        pg.evaluate("cur=%d;day()" % i); pg.wait_for_timeout(300)
        check("bottom button says Finish day", pg.evaluate("document.getElementById('ax-pclose').textContent")=="Finish day")
        check("day card has Reschedule and Edit sets and reps", pg.evaluate("document.getElementById('ax-reschedule').textContent")=="Reschedule" and pg.evaluate("document.getElementById('ax-edit-workout').textContent")=="Edit sets and reps")
        check("all-days accordion says See all days", "See all days" in pg.evaluate("document.querySelector('#ax-v-plan .ax-all summary').textContent"))
        pg.click("#ax-pclose"); pg.wait_for_timeout(400)
        t = pg.evaluate("document.getElementById('ax-sht').innerText+' '+document.getElementById('ax-shb').innerText")
        check("finish sheet is titled Finish today with plain options", "Finish today" in t and "Finish with what I did" in t and "Skip training, keep your streak" in t and "Call it a day" not in t, t)
        pg.evaluate("axSheetX()")
        pg.click("#ax-reschedule"); pg.wait_for_timeout(400)
        check("reschedule sheet is titled Reschedule", pg.evaluate("document.getElementById('ax-sht').innerText.trim()")=="Reschedule")
        pg.evaluate("axSheetX()")
        # Manage + plan tools header
        pg.evaluate("go('plan')"); pg.click("#ax-pmore"); pg.wait_for_timeout(300)
        t = pg.evaluate("document.getElementById('ax-shb').innerText")
        check("Manage says Plan my next week, not Smart week", "Plan my next week" in t and "Smart week" not in t, t)
        pg.click("#ax-m6"); pg.wait_for_timeout(700)
        check("plan tools page is titled Plan tools", pg.evaluate("document.querySelector('#ax-sp-plan .ax-sp-h, #ax-sp-plan h2, #ax-sp-plan .ax-sp-t').textContent.trim()")=="Plan tools", pg.evaluate("document.getElementById('ax-sp-plan').innerText.slice(0,60)"))
        # whole app has no 'Smart week' / 'Close day' wording left in visible plan UI
        body = pg.evaluate("document.getElementById('ax-v-plan').innerText+document.getElementById('ax-v-set').innerText")
        check("no 'Smart week' or 'Close day' left", "Smart week" not in body and "Close day" not in body)
        check("no page errors", not errs, errs)
        b.close()
finally:
    srv.terminate()
print("FAILED %d" % fails if fails else "all passed"); sys.exit(1 if fails else 0)

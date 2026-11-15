"""V1 simplification P9 dry run: the five stranger tasks, using ONLY visible taps from a fresh install (no go() shortcuts).
Each task has a tap budget; the script prints the taps it took. Real people still have to run docs/v1-simplify/STRANGER_TEST.md."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8994"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok, i=""):
    global fails; print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  -> " + str(i))); fails += 0 if ok else 1
URL = "http://127.0.0.1:8994/index.html"
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 390, "height": 844}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(URL); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(2500)
        # make sure today is a workout day in the fresh starter plan (a real tester should also pick a workout day)
        pg.evaluate("(()=>{for(var k=0;k<7;k++){var t=new Date();START=new Date(t.getFullYear(),t.getMonth(),t.getDate()-k);var i=todayIdx();if(i>=0&&!T[wdk(i)].r&&!T[wdk(i)].m)break}go('home');go('plan');go('home')})()")
        pg.wait_for_timeout(800)
        taps = {}
        def tap(task, sel, wait=350):
            taps[task] = taps.get(task, 0) + 1
            pg.click(sel, timeout=4000); pg.wait_for_timeout(wait)
        # 1. start today's workout (budget 1)
        check("Home: a single main button is on screen for today's session", pg.evaluate("(()=>{var b=document.getElementById('ax-hopen');if(!b)return false;var r=b.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()"))
        tap(1, "#ax-hopen")
        check("task 1: today's session is open (1 tap)", pg.evaluate("!document.getElementById('ax-v-plan').hidden&&document.querySelectorAll('#ax-day .ax-row').length>0") and taps[1] <= 1, taps)
        # 2. mark it done and see that it counted (budget 3)
        tap(2, "#ax-day .ax-row:not(.ax-ck) >> nth=0")
        tap(2, "#ax-pclose")
        tap(2, "#ax-c2")
        counted = pg.evaluate("document.getElementById('ax-pclose').textContent==='Reopen day'")
        check("task 2: day finished and the app shows it (<= 3 taps)", counted and taps[2] <= 3, (counted, taps))
        tap(2, "#ax-nav [data-v=home]")
        check("task 2: Today shows the finished day", pg.evaluate("/Finished|finished|done|complete/i.test(document.getElementById('ax-v-home').innerText)"))
        # 3. today's steps (budget 1)
        tap(3, "#ax-nav [data-v=prog]", 800)
        check("task 3: steps are on screen after 1 tap", pg.evaluate("(()=>{var t=Array.from(document.querySelectorAll('#ax-ps-stats .tile')).find(e=>/Steps counted/.test(e.innerText));if(!t)return false;var r=t.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})()") and taps[3] <= 1, taps)
        # 4. change the daily reminder time (budget 3)
        tap(4, "#ax-nav [data-v=set]", 600)
        tap(4, "#ax-sm [data-sp=alert]", 500)
        taps[4] += 1; pg.fill("#rm-t", "07:30"); pg.wait_for_timeout(300)
        check("task 4: reminder time changed (<= 3 actions)", pg.evaluate("PR.rmt")=="07:30" and taps[4] <= 3, (pg.evaluate("PR.rmt"), taps))
        # 5. back up the data (budget 3)
        pg.click("#ax-sp-alert .ax-sp-b"); pg.wait_for_timeout(300)
        tap(5, "#ax-sm [data-sp=data]", 500)
        vis = pg.evaluate("(()=>{var b=document.getElementById('ex');if(!b)return false;var r=b.getBoundingClientRect();return r.width>0&&r.top>=0&&r.bottom<=innerHeight&&!b.disabled})()")
        check("task 5: Export backup is visible and ready after 2 taps (budget 3)", vis and taps[5] <= 2, (vis, taps))
        check("no page errors", not errs, errs)
        print("TAPS:", taps)
        b.close()
finally:
    srv.terminate()
print("FAILED %d" % fails if fails else "all passed"); sys.exit(1 if fails else 0)

"""V1 simplification P4: Run tab becomes Move. Start run is always available (free run when the plan has no run); tools are one collapsed card with plain names; tabs are Today, Plan, Move, Progress, Me."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8985"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok, i=""):
    global fails; print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  -> " + str(i))); fails += 0 if ok else 1
URL = "http://127.0.0.1:8985/index.html"
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 390, "height": 844}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(URL); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1800)
        labels = pg.evaluate("Array.from(document.querySelectorAll('#ax-nav button')).map(b=>b.innerText.trim())")
        check("tabs are Today, Plan, Move, Progress, Me", labels == ["Today", "Plan", "Move", "Progress", "Me"], labels)
        pg.evaluate("go('timers')"); pg.wait_for_timeout(500)
        check("Move: heading is plain", "Start moving" in pg.evaluate("document.querySelector('#ax-v-timers h1').innerText"))
        check("Move: start card is visible on a plan with no run", pg.evaluate("!document.getElementById('tvpanel').hidden&&document.getElementById('tvpanel').offsetParent!==null"))
        check("Move: button says Start free run", pg.evaluate("document.getElementById('tvrun').textContent")=="Start free run")
        check("Move: explains no target", "No target" in pg.evaluate("document.getElementById('tvtxt').textContent"))
        check("Move: tools are one collapsed card", pg.evaluate("(()=>{var d=document.getElementById('ax-tools');return !!d&&!d.open})()"))
        pg.click("#ax-tools summary"); pg.wait_for_timeout(300)
        t = pg.evaluate("document.getElementById('ax-tools').innerText")
        for w in ["Workout stopwatch", "Rest timer", "Warm-up", "Cool-down", "Log reps", "Add a run by hand"]:
            check("Tools has: " + w, w in t, t)
        pg.click("#ax-tools summary")
        # free run
        pg.evaluate("PR.gps=0; save()")
        pg.click("#tvrun"); pg.wait_for_timeout(500)
        s = pg.evaluate("document.getElementById('ax-shb').innerText")
        check("free run asks Run or Walk", "Run" in s and "Walk" in s and "Follow the plan" not in s, s)
        pg.click("#ax-ivj"); pg.wait_for_timeout(1500)
        check("run dock opens", pg.evaluate("!document.getElementById('dock').hidden"))
        check("run is labelled Free run", pg.evaluate("!!TM&&TM.mode==='iv'&&TM.label==='Free run'"))
        check("no 'km reached' toast at the start", pg.evaluate("!/reached/i.test(document.body.innerText)"))
        pg.evaluate("closeT()"); pg.wait_for_timeout(300)
        # stats: a free run never becomes 'Best run time'
        pg.evaluate("st['r0']=600;st['g0']=1500;save();go('prog')"); pg.wait_for_timeout(700)
        check("free runs do not set 'Best run time'", pg.evaluate("(()=>{var t=Array.from(document.querySelectorAll('#ax-ps-stats .tile, #pgv .tile')).find(e=>/Best run time/.test(e.innerText));return !t||/--/.test(t.innerText)})()"))
        # a plan WITH a run keeps the old wording and goal
        pg.evaluate("APP.plans.default.plan=defaultPlan();activate('default');go('timers')"); pg.wait_for_timeout(600)
        check("run plan: card says Start run - ...", pg.evaluate("/^Start run - /.test(document.getElementById('tvrun').textContent)"), pg.evaluate("document.getElementById('tvrun').textContent"))
        check("run plan: goal text still shows", "This week" in pg.evaluate("document.getElementById('tvtxt').textContent"))
        pg.click("#tvrun"); pg.wait_for_timeout(400)
        s = pg.evaluate("document.getElementById('ax-shb').innerText")
        check("run plan: still offers Jog and walk", "Jog and walk" in s, s)
        pg.evaluate("axSheetX()")
        check("no page errors", not errs, errs)
        b.close()
finally:
    srv.terminate()
print("FAILED %d" % fails if fails else "all passed"); sys.exit(1 if fails else 0)

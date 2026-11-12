"""V1 simplification P6: Progress has 3 tabs (Overview, History, Recovery), badges live in Overview, 4 numbers up front, empty state says what to do."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8988"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok, i=""):
    global fails; print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  -> " + str(i))); fails += 0 if ok else 1
URL = "http://127.0.0.1:8988/index.html"
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 390, "height": 844}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(URL); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1800)
        pg.evaluate("go('prog')"); pg.wait_for_timeout(800)
        segs = pg.evaluate("Array.from(document.querySelectorAll('#ax-psg button')).map(b=>b.innerText.trim())")
        check("three tabs: Overview, History, Recovery", segs == ["Overview", "History", "Recovery"], segs)
        vis = pg.evaluate("['stats','badges','hist','body'].filter(k=>!document.getElementById('ax-ps-'+k).hidden)")
        check("Overview shows numbers and badges together", vis == ["stats", "badges"], vis)
        t = pg.evaluate("document.getElementById('ax-v-prog').innerText")
        check("no duplicated 'Progress, in context' header", t.count("Progress, in context") == 0 and t.count("At a glance") == 1, t[:300])
        check("empty state tells a new user what to do", pg.evaluate("!!document.getElementById('ax-prog-empty')") and "Finish today" in t)
        check("only four numbers show up front", pg.evaluate("document.querySelectorAll('#ax-ps-stats > .tiles .tile').length")==4)
        check("more numbers are folded away", pg.evaluate("(()=>{var d=document.querySelector('.ax-more-nums');return !!d&&!d.open&&d.querySelectorAll('.tile').length===4})()"))
        for w in ["Days finished", "Activities done", "Total km", "Steps counted"]:
            check("tile: " + w, w in t)
        check("jargon tiles renamed", "Jog share of runs" not in t and "Tasks done" not in t)
        # once there is data the empty card goes away
        pg.evaluate("APP.plans[APP.active].st['0:a']=1;save();go('home')"); pg.wait_for_timeout(300); pg.evaluate("go('prog')"); pg.wait_for_timeout(800)
        check("empty state disappears once something is done", pg.evaluate("!document.getElementById('ax-prog-empty')"))
        pg.evaluate("delete APP.plans[APP.active].st['0:a'];save()")
        # tabs switch
        pg.click("#ax-psg [data-ps=hist]"); pg.wait_for_timeout(400)
        check("History tab shows history only", pg.evaluate("['stats','badges','hist','body'].filter(k=>!document.getElementById('ax-ps-'+k).hidden).join()")=="hist")
        pg.click("#ax-psg [data-ps=body]"); pg.wait_for_timeout(600)
        check("Recovery tab shows the map", pg.evaluate("!document.getElementById('ax-ps-body').hidden&&document.querySelectorAll('#bsv svg, #bsv path').length>0"))
        check("Recovery has one plain intro", pg.evaluate("document.getElementById('ax-ps-body').innerText.includes('Know what needs a break')") and pg.evaluate("!document.getElementById('ax-body-overview')"))
        pg.evaluate("axPs('badges')"); pg.wait_for_timeout(300)
        check("old badges link lands on Overview", pg.evaluate("['stats','badges'].every(k=>!document.getElementById('ax-ps-'+k).hidden)&&document.querySelector('#ax-psg .on').dataset.ps==='stats'"))
        check("no page errors", not errs, errs)
        b.close()
finally:
    srv.terminate()
print("FAILED %d" % fails if fails else "all passed"); sys.exit(1 if fails else 0)

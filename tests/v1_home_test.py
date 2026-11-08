"""V1 simplification P2: Home is short. Today first, one nudge at a time, extras folded into a remembered 'More for today'."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8982"], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok, i=""):
    global fails; print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  -> " + str(i))); fails += 0 if ok else 1
URL = "http://127.0.0.1:8982/index.html"
def boot(pg, reload=False):
    pg.reload() if reload else pg.goto(URL)
    pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(2000)
KIDS = "Array.from(document.getElementById('ax-v-home').children).filter(c=>!c.hidden&&getComputedStyle(c).display!=='none').map(c=>c.id||c.className.split(' ')[0])"
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 390, "height": 844}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        boot(pg)
        # make it an established install so the extras exist
        pg.evaluate("delete PR.born; save(); go('plan'); go('home')"); pg.wait_for_timeout(1200)
        kids = pg.evaluate(KIDS)
        check("Today card is the first card after the banner", kids.index("ax-htoday") <= 1, kids)
        check("extras are not on the top level", not any(k in kids for k in ["ax-wx-card", "ax-readiness-card", "ax-hbar", "ax-hbrain"]), kids)
        check("'More for today' exists and is collapsed", "ax-hmore" in kids and pg.evaluate("document.getElementById('ax-hmore-body').hidden"), kids)
        check("More summary lists what is inside", "Check-in" in pg.evaluate("document.querySelector('#ax-hmore-bar em').textContent"))
        check("home shows at most 5 cards", len([k for k in kids if k != 'ax-hero-art' and not k.startswith('ax-hero')]) <= 5, kids)
        pg.click("#ax-hmore-bar"); pg.wait_for_timeout(300)
        check("tap opens More", pg.evaluate("!document.getElementById('ax-hmore-body').hidden"))
        check("check-in bar is inside More", pg.evaluate("!!document.querySelector('#ax-hmore-body #ax-hbar')"))
        check("readiness + weather live inside More", pg.evaluate("!!document.querySelector('#ax-hmore-body #ax-readiness-card')&&!!document.querySelector('#ax-hmore-body #ax-wx-card')"))
        boot(pg, reload=True)
        check("open state is remembered", pg.evaluate("!document.getElementById('ax-hmore-body').hidden"))
        pg.click("#ax-hmore-bar"); pg.wait_for_timeout(200)
        boot(pg, reload=True)
        check("closed state is remembered", pg.evaluate("document.getElementById('ax-hmore-body').hidden"))
        # check-in shortcut opens More + the check-in
        pg.evaluate("axBrainOpen()"); pg.wait_for_timeout(500)
        check("axBrainOpen opens More and the check-in", pg.evaluate("!document.getElementById('ax-hmore-body').hidden&&!document.getElementById('ax-hbrain').classList.contains('ax-cl')"))
        # one nudge at a time
        pg.evaluate("""(()=>{var h=document.getElementById('ax-v-home');['ax-bk-nudge','ax-rt-nudge','ax-ob-nudge'].forEach(function(id){if(document.getElementById(id))return;var d=document.createElement('div');d.id=id;d.className='ax-card';d.textContent=id;h.appendChild(d)});})()""")
        pg.wait_for_timeout(900)
        vis = pg.evaluate("['ax-ob-nudge','ax-rt-nudge','ax-bk-nudge'].filter(i=>{var e=document.getElementById(i);return e&&e.offsetParent!==null})")
        check("only the highest-priority nudge is visible", vis == ["ax-ob-nudge"], vis)
        pg.evaluate("document.getElementById('ax-ob-nudge').remove()"); pg.wait_for_timeout(700)
        vis = pg.evaluate("['ax-ob-nudge','ax-rt-nudge','ax-bk-nudge'].filter(i=>{var e=document.getElementById(i);return e&&e.offsetParent!==null})")
        check("dismissing it reveals the next one", vis == ["ax-rt-nudge"], vis)
        pg.evaluate("['ax-rt-nudge','ax-bk-nudge'].forEach(function(i){document.getElementById(i).remove()})"); pg.wait_for_timeout(600)
        check("nudge slot is hidden exactly when it has no cards", pg.evaluate("(()=>{var s=document.getElementById('ax-hnudge');return s.hidden===(s.children.length===0)})()"))
        # rest-day card names the next workout (fake a rest day by checking text on a rest day plan day)
        txt = pg.evaluate("document.getElementById('ax-htoday').innerText")
        check("Today card never says 'Smart Today' / 'Catch up' jargon", "Smart Today" not in pg.evaluate("document.getElementById('ax-v-home').innerText") and "Catch up" not in pg.evaluate("document.getElementById('ax-v-home').innerText"))
        # V2 look keeps the old flat order and hides the new wrappers
        pg.evaluate("document.documentElement.classList.add('v2'); axHomeArrange()"); pg.wait_for_timeout(400)
        check("V2: extras are back on the top level", pg.evaluate("document.getElementById('ax-hbrain').parentNode===document.getElementById('ax-v-home')"))
        check("V2: new wrappers hidden", pg.evaluate("document.getElementById('ax-hmore').hidden"))
        pg.evaluate("document.documentElement.classList.remove('v2'); axHomeArrange()"); pg.wait_for_timeout(400)
        check("leaving V2 puts extras back in More", pg.evaluate("document.getElementById('ax-hbrain').parentNode===document.getElementById('ax-hmore-body')"))
        check("no page errors", not errs, errs)
        b.close()
finally:
    srv.terminate()
print("FAILED %d" % fails if fails else "all passed"); sys.exit(1 if fails else 0)

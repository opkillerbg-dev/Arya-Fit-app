"""Typography: day titles, group headings, session hero and Today numbers use the poster face on EVERY day type; accent removed when V2 is off."""
import subprocess, time, sys
from playwright.sync_api import sync_playwright

def v2on(pg):
    """V1 is the default now: switch V2 on and reload, like a user who opted in."""
    pg.evaluate("AxV2.setEnabled(true)"); pg.wait_for_timeout(500)
    pg.reload(); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1500)
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8976", "-d", "web"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok):
    global fails; print(("ok   " if ok else "FAIL ") + n); fails += 0 if ok else 1
FAM = "(sel)=>{var e=document.querySelector(sel);return e?getComputedStyle(e).fontFamily.split(',')[0].replace(/\"/g,''):null}"
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        for label, day in [("workout day", "2026-10-08"), ("rest day", "2026-10-11")]:
            ctx = b.new_context(viewport={"width": 360, "height": 800})
            ctx.add_init_script("(()=>{const R=Date,off=new R('%sT09:00:00').getTime()-R.now();class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}};window.Date=D})()" % day)
            pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto("http://127.0.0.1:8976/index.html"); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1800)
            v2on(pg)
            pg.evaluate("go('plan')"); pg.wait_for_timeout(900)
            check(label + ": plan day title is poster", pg.evaluate(FAM, "#ax-v-plan .ax-dayx h2.ax-h2") == "Arya Display")
            check(label + ": plan day title has italic accent", pg.evaluate("!!document.querySelector('#ax-v-plan .ax-dayx h2 em.v2-type-accent')"))
            check(label + ": group headings are poster", pg.evaluate(FAM, "#ax-v-plan h3.ax-gh") == "Arya Display")
            if label == "workout day":
                check("hero exercise name is poster", pg.evaluate(FAM, "#ax-v-plan .v2-session-lockup h2") == "Arya Display")
                check("hero number is poster", pg.evaluate(FAM, "#ax-v-plan .v2-session-lockup strong") == "Arya Display")
            pg.evaluate("go('home')"); pg.wait_for_timeout(700)
            check(label + ": today count is poster", pg.evaluate(FAM, "#ax-v-home .v2-today-metric strong") == "Arya Display")
            check(label + ": today section heads are poster", pg.evaluate(FAM, "#ax-v-home .v2-today-section-head h2") == "Arya Display")
            check(label + ": today card title is poster", pg.evaluate(FAM, "#ax-v-home .ax-home-session-title h2.ax-h2") == "Arya Display")
            pg.evaluate("AxV2.setEnabled(false)"); pg.wait_for_timeout(600)
            check(label + ": V2 off removes accent", pg.evaluate("!document.querySelector('em.v2-type-accent')"))
            check(label + ": no page errors", not errs)
            ctx.close()
        b.close()
finally:
    srv.terminate()
print("V2 typography checks passed" if not fails else "FAILURES: %d" % fails); sys.exit(1 if fails else 0)

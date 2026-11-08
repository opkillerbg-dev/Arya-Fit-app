"""Brand: public name is AERUNO everywhere users look; internal ids / saved-data keys stay unchanged."""
import json, re, subprocess, sys, time
from playwright.sync_api import sync_playwright
srv = subprocess.Popen([sys.executable, "-m", "http.server", "8977", "-d", "web"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.5); fails = 0
def check(n, ok):
    global fails; print(("ok   " if ok else "FAIL ") + n); fails += 0 if ok else 1
try:
    cap = json.load(open("capacitor.config.json"))
    check("capacitor appName is AERUNO", cap["appName"] == "AERUNO")
    check("app id unchanged (com.arya.fit): installs keep their data", cap["appId"] == "com.arya.fit")
    check("sync file marker unchanged (old backups still import)", 'app:"arya-fit-sync"' in open("web/js/features/sync.js", encoding="utf-8").read())
    check("splash colour is black", "#000000" in open("native/res/values/arya_splash.xml").read())
    check("notification icon is the AF mark (evenOdd vector)", 'fillType="evenOdd"' in open("native/res/drawable/ic_stat_arya.xml").read())
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_context(viewport={"width": 360, "height": 800}).new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("http://127.0.0.1:8977/index.html", wait_until="commit")
        pg.wait_for_selector("#ax-boot .ax-bw", timeout=8000)
        check("splash wordmark says AERUNO", pg.inner_text("#ax-boot .ax-bw").strip().upper() == "AERUNO")
        check("splash logo is the filled AF mark", pg.evaluate("(()=>{var p=document.querySelector('#ax-boot .ax-bl path');return !!p&&p.getAttribute('d').length>1000&&p.getAttribute('fill-rule')==='evenodd'})()"))
        pg.wait_for_function("!document.getElementById('ax-boot')", timeout=25000); pg.wait_for_timeout(1200)
        check("HTML title is AERUNO (the app later swaps in the plan name)", pg.evaluate("fetch('index.html').then(r=>r.text()).then(t=>/<title>AERUNO/.test(t))"))
        check("manifest name", pg.evaluate("fetch('manifest.webmanifest').then(r=>r.json()).then(j=>j.name==='AERUNO'&&j.short_name==='AERUNO')"))
        check("saved-data key unchanged (aryaApp2)", pg.evaluate("localStorage.getItem('aryaApp2')!==null"))
        left = []
        for v in ["home", "plan", "timers", "prog", "set", "plans"]:
            pg.evaluate("go('%s')" % v); pg.wait_for_timeout(300)
            if "arya fit" in pg.evaluate("document.body.innerText").lower() or "arya" in pg.evaluate("document.body.innerText").lower().replace("arya sheladiya",""): left.append(v)
        check("no view still shows the old name", not left)
        pg.evaluate("go('set')"); pg.wait_for_timeout(600); pg.evaluate("axSettingsHub.show('about')"); pg.wait_for_timeout(500)
        check("About shows AERUNO + tagline", pg.evaluate("/AERUNO/.test(document.getElementById('ax-sp-about').innerText)&&/Personal Fitness/.test(document.getElementById('ax-sp-about').innerText)"))
        pg.evaluate("axSettingsHub.show('look')"); pg.wait_for_timeout(600)
        check("icon picker: 6 icons, first is AERUNO", pg.evaluate("(()=>{var b=document.querySelectorAll('#ax-ico-grid .ax-ico');return b.length===6&&/AERUNO/.test(b[0].innerText)})()"))
        check("no page errors", not errs)
        b.close()
finally:
    srv.terminate()
print("brand checks passed" if not fails else "FAILURES: %d" % fails); sys.exit(1 if fails else 0)

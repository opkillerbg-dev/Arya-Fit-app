#!/usr/bin/env python3
"""Real-browser tests of the full app. Needs: pip install playwright (+ Chrome, or `playwright install chromium`).
Run from repo root: python3 tests/browser_test.py"""
import json, subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8899"
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1); URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(name, cond, info=""):
    print(("ok   " if cond else "FAIL ") + name + ("" if cond else "  -> " + str(info)))
    if not cond: fails.append(name)
def launch(p):
    try: return p.chromium.launch(channel="chrome")
    except Exception: return p.chromium.launch()
def fresh(b, seed=None):
    ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(800)
    if seed is not None:
        pg.evaluate("s=>{localStorage.clear();for(const k in s)localStorage.setItem(k,s[k])}", seed)
        pg.reload(wait_until="load"); pg.wait_for_timeout(1500)
    return ctx, pg, errs
TICKS_JS = r"Object.keys(APP.plans[APP.active].st).filter(k=>/^\d+:/.test(k)).length"
GOOD = lambda **k: json.dumps(dict({"v": 2, "active": "default", "prefs": {"skin": "oldmoney"}, "plans": {"default": {"plan": None, "st": {"1:wu": 1, "2:j": 1}}}}, **k))
try:
    with sync_playwright() as p:
        b = launch(p)
        # build a real plan object once, from a clean first run
        ctx, pg, errs = fresh(b); plan = pg.evaluate("APP.plans[APP.active].plan"); check("clean first run: no page errors", not errs, errs)
        check("clean first run: schema stamped", pg.evaluate("APP.schema") == 1); ctx.close()
        mk = lambda **k: json.dumps(dict({"v": 2, "active": "default", "prefs": {"skin": "oldmoney"}, "plans": {"default": {"plan": plan, "st": {"1:wu": 1, "2:j": 1}}}}, **k))

        ctx, pg, errs = fresh(b, {"aryaApp2": mk()})
        check("old data (no schema): loads, ticks kept", pg.evaluate(TICKS_JS) == 2, pg.evaluate("JSON.stringify(APP.plans.default.st)"))
        check("old data: stamped schema 1 + premig copy", pg.evaluate("APP.schema") == 1 and pg.evaluate("!!localStorage.getItem('aryaApp2.premig')"))
        check("old data: no page errors", not errs, errs); ctx.close()

        ctx, pg, errs = fresh(b, {"aryaApp2": '{"plans":{"default":{"plan"', "aryaApp2.bak": mk(marker="from-bak")})
        check("damaged data: restored from daily backup", pg.evaluate("APP.marker") == "from-bak" and pg.evaluate(TICKS_JS) == 2, pg.evaluate("APP.marker"))
        check("damaged data: evidence kept in .bad", pg.evaluate("localStorage.getItem('aryaApp2.bad')") == '{"plans":{"default":{"plan"')
        pg.wait_for_timeout(1500)  # the notice appears 1.8 s after start, and only once the splash is gone
        check("damaged data: user told", pg.evaluate("document.body.innerText.includes('damaged')"))
        check("damaged data: no page errors", not errs, errs); ctx.close()

        ctx, pg, errs = fresh(b, {"aryaApp2": mk(schema=9, future={"x": 1})})
        pg.evaluate("save()")
        saved = json.loads(pg.evaluate("localStorage.getItem('aryaApp2')"))
        check("newer data: untouched and unknown fields survive a save", saved.get("schema") == 9 and saved.get("future") == {"x": 1}, saved.get("schema"))
        check("newer data: no page errors", not errs, errs); ctx.close()

        ctx, pg, errs = fresh(b, {"aryaApp2": mk()})
        txt = pg.evaluate("pack()"); d = json.loads(txt)
        check("export carries schema", d.get("schema") == 1)
        pg.evaluate("t=>doImport(t)", txt); pg.wait_for_timeout(500)
        check("export -> import round trip keeps ticks", pg.evaluate(TICKS_JS) == 2)
        check("import makes a pre-import safety copy", pg.evaluate("!!localStorage.getItem('aryaApp2.preimport')"))
        d["schema"] = 99
        before = pg.evaluate("JSON.stringify(APP.plans)")
        pg.evaluate("t=>doImport(t)", json.dumps(d)); pg.wait_for_timeout(400)
        check("backup from a newer app is refused, data unchanged", pg.evaluate("JSON.stringify(APP.plans)") == before)
        check("round trip: no page errors", not errs, errs); ctx.close()

        ctx, pg, errs = fresh(b, {"aryaApp2": mk()})
        for v in ["home", "plan", "timers", "prog", "set", "plans", "home"]:
            pg.evaluate(f"go('{v}')"); pg.wait_for_timeout(250)
        check("all views render without errors", not errs, errs); ctx.close()

        # v90 startup: logo splash goes away, the warm-up leaves every tab exactly as it found it
        ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
        pg.goto(URL, wait_until="commit"); pg.wait_for_selector("#ax-boot")
        check("splash shows the logo", pg.evaluate("!!document.querySelector('#ax-boot svg.ax-bl path')"))
        pg.wait_for_function("!document.getElementById('ax-boot')", timeout=8000); pg.wait_for_timeout(1500)
        check("splash is removed and booting class cleared", pg.evaluate("!document.documentElement.classList.contains('ax-booting')"))
        state = pg.evaluate("VIEWS.map(v=>[v,document.getElementById('ax-v-'+v).hidden,document.getElementById('ax-v-'+v).getAttribute('style')])")
        check("warm-up: only Home is visible", [x[0] for x in state if not x[1]] == ["home"], state)
        check("warm-up: no tab keeps an inline style", all(x[2] in (None, "") for x in state if x[0] != "home"), state)
        check("warm-up: tabs still switch", pg.evaluate("go('prog'),!document.getElementById('ax-v-prog').hidden&&document.getElementById('ax-v-home').hidden"))
        check("fonts stylesheet does not block rendering", pg.evaluate("document.querySelector('link[data-ax-font]').media")  in ("all", "print"))
        check("startup: no page errors", not errs, errs); ctx.close()

        # v91 run weather: mocked Open-Meteo, granted location
        def forecast(route):
            import datetime
            t0 = datetime.datetime.now().replace(minute=0, second=0, microsecond=0) - datetime.timedelta(hours=1)
            hrs = [t0 + datetime.timedelta(hours=i) for i in range(48)]
            n = len(hrs)
            route.fulfill(status=200, content_type="application/json", headers={"access-control-allow-origin": "*"}, body=json.dumps({"hourly": {
                "time": [h.strftime("%Y-%m-%dT%H:00") for h in hrs], "temperature_2m": [13] * n, "apparent_temperature": [12] * n,
                "precipitation_probability": [5] * n, "precipitation": [0] * n, "wind_speed_10m": [9] * n, "uv_index": [2] * n, "weather_code": [1] * n}}))
        ctx = b.new_context(viewport={"width": 390, "height": 844}, geolocation={"latitude": 12.9716, "longitude": 77.5946}, permissions=["geolocation"])
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
        pg.route("**/api.open-meteo.com/**", forecast)
        pg.goto(URL, wait_until="load"); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=8000); pg.wait_for_timeout(600)
        check("weather: invite card shows before opt-in", pg.evaluate("!!document.getElementById('ax-wx-on')"))
        check("weather: nothing asked or fetched before opt-in", pg.evaluate("localStorage.getItem('axWx')") is None)
        pg.click("#ax-wx-on"); pg.wait_for_function("document.querySelector('#ax-wx-card .ax-wx-pill')", timeout=6000)
        txt = pg.evaluate("document.getElementById('ax-wx-card').innerText")
        check("weather: card shows a verdict after opt-in", "Good" in txt.upper() or "GOOD" in txt, txt)
        saved = json.loads(pg.evaluate("localStorage.getItem('axWx')"))
        check("weather: location stored rounded to 2 decimals, on this phone only", saved.get("lat") == 12.97 and saved.get("lon") == 77.59 and "aryaApp2" not in json.dumps(saved), saved.get("lat"))
        check("weather: location is not inside the tracker data/backup", "12.97" not in (pg.evaluate("pack()") or ""))
        order = pg.evaluate("[...document.getElementById('ax-v-home').children].map(c=>c.id||c.className).findIndex(x=>x==='ax-wx-card')")
        check("weather: card sits on Home (positioned by the Home order)", order > 0, order)
        pg.click("#ax-wx-card"); pg.wait_for_selector("#ax-wx-off", timeout=3000)
        check("weather: sheet credits Open-Meteo", "Open-Meteo" in pg.evaluate("document.getElementById('ax-shb').innerText"))
        pg.click("#ax-wx-off"); pg.wait_for_timeout(300)
        check("weather: turning off forgets the location", json.loads(pg.evaluate("localStorage.getItem('axWx')")).get("lat") is None)
        check("weather: off state is a slim row with Turn on", pg.evaluate("!!document.getElementById('ax-wx-on2')"))
        check("weather: no page errors", not errs, errs); ctx.close()

        ctx = b.new_context(viewport={"width": 390, "height": 844}, geolocation={"latitude": 12.9716, "longitude": 77.5946}, permissions=["geolocation"])
        pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
        pg.route("**/api.open-meteo.com/**", lambda r: r.abort())
        pg.goto(URL, wait_until="load"); pg.evaluate("localStorage.setItem('axWx',JSON.stringify({on:1,lat:12.97,lon:77.59,pt:Date.now()}))")
        pg.reload(wait_until="load"); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=8000); pg.wait_for_timeout(1500)
        check("weather: offline with no saved forecast shows a retry card, not an error", "try again" in pg.evaluate("document.getElementById('ax-wx-card').innerText").lower())
        check("weather: offline: no page errors", not errs, errs); ctx.close()
        b.close()
finally:
    srv.kill()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

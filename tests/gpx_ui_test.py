#!/usr/bin/env python3
"""Real-browser test: Export GPX button, downloaded file is valid GPX, route resolution survives save and backup round trip. Run from repo root."""
import subprocess, sys, time, os, xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright
PORT = "8891"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
SEED = """
(function(){var p=APP.plans[APP.active],T=Date.now()-86400000;
 var big=[],la=40.7,t=T;for(var i=0;i<3000;i++){big.push([la,-74,t]);la+=2.8/111195;t+=1000}
 window.__big=big;saveRoute(2,big);
 p.rsum=p.rsum||{};p.rsum["2"]=[{t:T+3000000,d:8400,s:3000}];p.st["g2"]=8400;p.st["r2"]=3000;save()})()
"""
try:
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel="chrome")
        except Exception: b = pw.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, accept_downloads=True); pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load"); pg.wait_for_timeout(1500)
        pg.evaluate(SEED)
        n = pg.evaluate("axRoutes()[2][0].length"); check("saved route keeps about 500 points (was 250)", 490 <= n <= 502, n)
        pg.evaluate("AxRunSum.open(2,0)"); pg.wait_for_timeout(500)
        check("run summary shows Export GPX", pg.evaluate("!!document.getElementById('rs-gpx')"))
        with pg.expect_download(timeout=5000) as dl: pg.evaluate("document.getElementById('rs-gpx').click()")
        d = dl.value; path = d.path(); check("file name is Arya-Run-<date>.gpx", d.suggested_filename.startswith("Arya-Run-") and d.suggested_filename.endswith(".gpx"), d.suggested_filename)
        root_el = ET.parse(path).getroot(); ns = {"g": "http://www.topografix.com/GPX/1/1"}
        pts = root_el.findall(".//g:trkpt", ns)
        check("downloaded file is well-formed GPX with all route points", root_el.tag.endswith("gpx") and len(pts) == n, (len(pts), n))
        check("every point has a time", all(p.find("g:time", ns) is not None for p in pts))
        check("track type is running", root_el.find(".//g:trk/g:type", ns).text == "running")
        # backup round trip keeps the full route
        txt = pg.evaluate("pack()"); pg.evaluate("t=>doImport(t)", txt); pg.wait_for_timeout(400)
        check("backup export/import keeps the full-resolution route", pg.evaluate("axRoutes()[2][0].length") == n, pg.evaluate("axRoutes()[2]&&axRoutes()[2][0].length"))
        pg.evaluate("axSheetX()"); pg.evaluate("axRoutes()[2]=[];save()"); pg.evaluate("AxRunSum.open(2,0)"); pg.wait_for_timeout(400)
        check("no route -> no Export GPX button", pg.evaluate("!document.getElementById('rs-gpx')"))
        check("no page errors", not errs, errs); b.close()
finally: srv.kill()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

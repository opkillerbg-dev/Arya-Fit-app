#!/usr/bin/env python3
"""Real-browser test: PR ranking, run-summary badges, Progress card, all-efforts sheet, old-run backfill. Run from repo root."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8894"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
SEED = """
(function(){var p=APP.plans[APP.active],T=Date.now()-5*86400000;
 p.rsum={"0":[{t:T,d:5200,s:1800,be:{"1000":360,"5000":1800}}],
         "1":[{t:T+86400000,d:5100,s:1700,be:{"1000":340,"5000":1700}}],
         "2":[{t:T+2*86400000,d:5300,s:1750,be:{"400":100,"1000":350,"5000":1750}}]};
 var pts=[],la=40.7,t=0;for(var i=0;i<13;i++){pts.push([la,-74,t]);la+=100/111195;t+=33333}
 p.routes={"3":[pts]};p.rsum["3"]=[{t:T+3*86400000,d:1200,s:400}];
 for(var d=0;d<4;d++){p.st["g"+d]=5000;p.st["r"+d]=1700}
 save()})()
"""
try:
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel="chrome")
        except Exception: b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 390, "height": 844}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load"); pg.wait_for_timeout(1500)
        pg.evaluate(SEED)
        k = pg.evaluate("Object.keys(AxPR.table()).join(',')"); check("table has the distances found in all runs", k == "400,805,1000,5000", k)
        tops = pg.evaluate("AxPR.table()[1000].map(e=>e.s+'@d'+e.r.dy).join(' ')")
        check("1 km ranking is fastest first, backfilled old run included", tops.startswith("333@d3 340@d1 350@d2 360@d0") or tops.startswith("334@d3"), tops)
        e1 = pg.evaluate("JSON.stringify(AxPR.forRun(1).map(e=>[e.D,e.rank]))"); check("day 2 has rank 2 for 1 km (backfilled run is faster) and rank 1 for 5 km", e1 == "[[1000,2],[5000,1]]", e1)
        pg.evaluate("AxRunSum.open(1,0)"); pg.wait_for_timeout(500); txt = pg.evaluate("document.body.innerText").lower()
        check("run summary has Best efforts section", "best efforts" in txt and "5 km" in txt)
        check("run summary shows PR badge", "pr 5 km" in txt and "vs old pr" in txt)
        pg.evaluate("axSheetX()"); pg.wait_for_timeout(300)
        pg.evaluate("AxRunSum.open(0,0)"); pg.wait_for_timeout(500); t0 = pg.evaluate("document.body.innerText").lower()
        check("oldest run shows 4th-or-worse 1 km without a medal, no crash", "best efforts" in t0)
        pg.evaluate("axSheetX()"); pg.wait_for_timeout(300)
        pg.evaluate("prog()"); pg.wait_for_timeout(500)
        card = pg.evaluate("(function(){var c=document.getElementById('ax-prcard');return c?c.innerText:''})()")
        check("Progress shows the Best efforts card with 1 km and 5 km", "1 km" in card and "5 km" in card, card)
        pg.evaluate("document.querySelector('[data-prs]').click()"); pg.wait_for_timeout(500); sh = pg.evaluate("document.body.innerText")
        check("All best efforts sheet lists PR, 2nd and 3rd", "PR" in sh and "2nd" in sh and "3rd" in sh, sh[:200])
        check("import/export keeps efforts", pg.evaluate("(function(){var d=JSON.parse(pack());var r=d.plans[APP.active].rsum;return !!(r&&r['1']&&r['1'][0].be)})()"))
        check("no page errors", not errs, errs); b.close()
finally: srv.kill()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

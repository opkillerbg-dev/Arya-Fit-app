#!/usr/bin/env python3
"""v98 Smart week in a real browser: a person who trained, then took ~12 days off. Run from repo root: python3 tests/coach_ui_test.py"""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8894"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1); URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
SETUP = """(function(idx,doneDays){
  var t=new Date();START=new Date(t.getFullYear(),t.getMonth(),t.getDate()-idx);
  Object.keys(st).forEach(function(k){delete st[k]});
  var pe=axPlan();delete pe.schedMap;delete pe.workoutEdits;delete pe.coach;ND=NW*7;
  for(var i=0;i<doneDays;i++){items(i).forEach(function(x){st[i+':'+x[1]]=1})}
  save();render();home();
})"""
def strength_days(pg, d0):
    return pg.evaluate("(function(d0){var o=[];for(var d=d0;d<d0+7;d++){var s=axSrc(d),t=s<0?null:T[wdk(s)];o.push(t&&!t.r&&!t.m?1:0)}return o})(%d)" % d0)
try:
    with sync_playwright() as p:
        try: b = p.chromium.launch(channel="chrome")
        except Exception: b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 412, "height": 915}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL); pg.wait_for_timeout(2500)
        # trained days 0..6, nothing since; today is day 18 -> about 12 days off
        pg.evaluate(SETUP + "(18,7)"); pg.wait_for_timeout(400)
        s = pg.evaluate("(function(){var x=axCoach.state();return x?{k:x.kind,mode:x.p.rec.mode,gap:x.p.a.gap,d0:x.p.d0}:null})()")
        check("break detected, offer shown", s and s["k"] == "offer" and s["mode"] == "comeback" and s["gap"] >= 11, s)
        check("Home card is on screen", pg.evaluate("!!document.getElementById('ax-coach-card')") is True)
        pg.click("#ax-coach-see"); pg.wait_for_timeout(300)
        txt = pg.evaluate("document.getElementById('ax-shb').innerText")
        check("sheet explains the break", "days" in txt and "WHY THIS WEEK" in txt and "Apply this week" in txt, txt[:200])
        pg.click("#ax-coach-yes"); pg.wait_for_timeout(500)
        d0 = s["d0"]; sd = strength_days(pg, d0)
        check("comeback week has 3 strength sessions", sum(sd) == 3, sd)
        lv = pg.evaluate("(function(d0){var m=[];for(var d=d0;d<d0+7;d++)m.push(Math.floor(Math.max(0,axSrc(d))/7));return m})(%d)" % d0)
        check("run level is the easiest the person ran at or lower", max(lv) <= 1, lv)
        ed = pg.evaluate("axPlan().workoutEdits||{}")
        first = [d for d in range(d0, d0 + 7) if str(d) in ed]
        check("sets were reduced for the kept sessions", len(first) >= 1, ed)
        sets = pg.evaluate("(function(d){return items(d).filter(function(x){return x[0]=='Strength'}).map(function(x){return x[3]})})(%d)" % first[0]) if first else []
        check("first session shows at most 2 sets per exercise", bool(sets) and all(int(str(x).split(' ')[0]) <= 2 for x in sets), sets)
        check("card switches to active with Undo", pg.evaluate("!!document.getElementById('ax-coach-un')") is True)
        check("past days untouched", pg.evaluate("(function(){var m=axPlan().schedMap;for(var d=0;d<%d;d++){if(m[d]!==d)return false}return true})()" % d0))
        pg.click("#ax-coach-un"); pg.wait_for_timeout(400)
        check("undo restores the original schedule and edits", pg.evaluate("!axPlan().schedMap&&!(axPlan().workoutEdits&&Object.keys(axPlan().workoutEdits).length)&&ND==NW*7") is True)
        # user's own edit wins
        pg.evaluate(SETUP + "(18,7)")
        first_day = None
        pg.evaluate("(function(){var pe=axPlan();pe.workoutEdits={};for(var d=18;d<25;d++){var s=axSrc(d),t=T[wdk(s)];if(t&&!t.r&&!t.m&&!t.c){pe.workoutEdits[String(d)]={0:{sets:4,reps:12}};break}}save()})()")
        keep = pg.evaluate("Object.keys(axPlan().workoutEdits)[0]")
        pg.evaluate("axCoach.apply(axCoach.compute())")
        after = pg.evaluate("(axPlan().workoutEdits||{})['%s']" % keep)
        check("a hand-made edit is never overwritten", after and after.get("0", {}).get("sets") == 4 and after["0"].get("reps") == 12, after)
        # plan running out: window crosses the end of the 28-day plan
        pg.evaluate(SETUP + "(24,7)"); pg.wait_for_timeout(300)
        pg.evaluate("axCoach.apply(axCoach.compute())"); pg.wait_for_timeout(400)
        check("plan extends past day 28", pg.evaluate("ND") > 28, pg.evaluate("ND"))
        pg.evaluate("go('plan')"); pg.wait_for_timeout(300); pg.evaluate("go('home')"); pg.wait_for_timeout(300)
        check("day views render beyond the old end", pg.evaluate("(function(){cur=ND-1;day();return !!document.getElementById('ax-day').innerHTML})()") is True)
        # the app auto-closes missed days as rest, and a habit-only tick as "partly done": neither may hide the break or the missed sessions
        pg.evaluate(SETUP + "(18,7)")
        pg.evaluate("(function(){for(var i=12;i<17;i++){var h=items(i).filter(function(x){var id=String(x[1]);return id.charAt(0)!=='e'&&id!=='j'})[0];if(h)st[i+':'+h[1]]=1}axAutoClose();save()})()")
        r = pg.evaluate("(function(){var x=axCoach.compute();return {m:x.rec.mode,gap:x.a.gap,x12:st['x12']}})()")
        check("habit-only days (auto-closed as partly done) do not hide the break", r["m"] == "comeback" and r["gap"] >= 11, r)
        pg.evaluate(SETUP + "(13,13)")
        pg.evaluate("(function(){for(var i=0;i<13;i++){if(i%2===1){Object.keys(st).forEach(function(k){if(k.indexOf(i+':')===0)delete st[k]})}}axAutoClose();save()})()")
        r = pg.evaluate("(function(){var x=axCoach.compute();return {m:x.rec.mode,adh:x.a.adh,planned:x.a.planned}})()")
        check("auto-closed missed days still count as missed sessions", r["adh"] is not None and r["adh"] < 0.8 and r["m"] in ("hold", "lighten"), r)
        # regular week: solid adherence -> progress offered at week end
        pg.evaluate(SETUP + "(13,13)"); pg.wait_for_timeout(300)
        r = pg.evaluate("(function(){var x=axCoach.compute();return {m:x.rec.mode,gap:x.a.gap}})()")
        check("solid recent weeks -> step up (or lighter week), never a comeback", r["m"] in ("progress", "deload", "hold"), r)
        # settings button opens the sheet
        pg.evaluate("go('set')"); pg.wait_for_timeout(300); pg.click('[data-sp="plan"]'); pg.wait_for_timeout(300); pg.click("#ax-coach-open"); pg.wait_for_timeout(300)
        check("Settings > Smart week opens the sheet", "Apply this week" in pg.evaluate("document.getElementById('ax-shb').innerText"))
        check("no page errors", errs == [], errs)
        b.close()
finally:
    srv.terminate()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

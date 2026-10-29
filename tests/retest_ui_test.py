#!/usr/bin/env python3
"""S8: 4-week retest in a real browser: due card, snooze, retest screens, results, weak point dropped, gen.weak updated, new plan option. Run from repo root."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8898"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
def txt(pg): return pg.evaluate("document.getElementById('ax-ob')?document.getElementById('ax-ob').innerText:''")
def wait(pg, ms=250): pg.wait_for_timeout(ms)
SEED = """(()=>{
  const now=Date.now(),D=864e5,b={push:50,pull:3,squat:30,plank:45,run:null,lifts:{squat:null,bench:null,deadlift:null,ohp:null}};
  const p0={done:true,ts:now-30*D,xp:'int',env:'homeplus',equip:['pullbar','backpack'],goal:{main:'muscle',extra:null},days:4,mins:45,weeks:8,start:'today',bench:b,weak:['pull'],weakAsked:true,want:[],protect:[],health:'ok',age:'30-39',name:'Arya',wt:76,ht:178};
  const A=AxLevel.calc(p0); p0.levels=A.levels; p0.retest={last:now-30*D,due:now-1000,history:[{ts:now-30*D,levels:A.levels}]};
  const c=AxProfile.set(p0); const r=AxPlanGen.build(c,AxExDb,{now:now}); const v=vplan(r.plan);
  const id='p'+now.toString(36); APP.plans[id]={plan:v.plan,st:{},gen:r.gen}; APP.plans[id].st['1:wu']=1; activate(id); save();
  return [c.levels.pull,r.gen.weak.join()];
})()"""
def settings(pg):
    pg.evaluate("go('set')"); wait(pg, 350)
    if not pg.evaluate("document.getElementById('ax-rt-row')&&document.getElementById('ax-rt-row').offsetParent!==null"):
        pg.click("#ax-v-set [data-sp='plan']"); wait(pg, 350)
def pick(pg, k, i): pg.click(f"#ax-ob [data-b={k}] .ob-c[data-i='{i}']")
try:
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel="chrome")
        except Exception: b = pw.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(URL, wait_until="load"); wait(pg, 1200)
        seeded = pg.evaluate(SEED); pg.reload(wait_until="load"); wait(pg, 2200)
        check("seed: pull is level 2 and the plan's weak point is pull", seeded[0] == 2 and seeded[1].startswith("pull"), seeded)
        check("Home shows the retest card when it is due", pg.evaluate("!!document.getElementById('ax-rt-nudge')") and "Time to retest" in pg.evaluate("document.getElementById('ax-rt-nudge').innerText"))
        pg.click("#ax-rt-later"); wait(pg, 300)
        due = pg.evaluate("AxProfile.get().retest.due"); now = pg.evaluate("Date.now()")
        check("Later snoozes 3 days and hides the card", pg.evaluate("!document.getElementById('ax-rt-nudge')") and 2.9 * 864e5 < due - now < 3.1 * 864e5, due - now)
        settings(pg)
        check("Settings has a 'Retest my levels' row with the next due date", pg.evaluate("!!document.getElementById('ax-rt-row')") and "Next due" in pg.evaluate("document.getElementById('ax-rt-rem').textContent"), pg.evaluate("document.getElementById('ax-rt-rem')&&document.getElementById('ax-rt-rem').textContent"))
        pg.click("#ax-rt-set"); wait(pg, 300)
        check("Retest opens on the benchmark screen without a progress bar; button says See results",
              "Retest: what can you do now" in txt(pg) and pg.evaluate("!document.querySelector('#ax-ob [role=progressbar]')") and "See results" in txt(pg) and "Skip" not in pg.evaluate("document.getElementById('ob-bd').parentNode.querySelector('.ob-nav').innerText"))
        check("current answers are pre-selected (push 50+, pull 3-5)", pg.evaluate("document.querySelector('#ax-ob [data-b=push] .ob-c.on').innerText") == "50+" and pg.evaluate("document.querySelector('#ax-ob [data-b=pull] .ob-c.on').innerText") == "3-5")
        pick(pg, "pull", 5); pick(pg, "squat", 4); pick(pg, "plank", 4); wait(pg, 100)       # pull 10-14, squat 50-99, plank 90-179 s
        check("the draft is not touched by a retest", pg.evaluate("AxProfile.draftGet()") is None)
        pg.click("#ob-next"); wait(pg, 250)
        t = txt(pg)
        check("results show before -> after and that the gap closed", "Your retest results" in t and "Pulling" in t and "Gap closed, priority removed: pulling" in t, t[:400])
        check("results offer Save results and Save and create a new plan", pg.evaluate("!!document.getElementById('ob-rt-save')&&!!document.getElementById('ob-rt-plan')"))
        plans = pg.evaluate("Object.keys(APP.plans).length")
        pg.click("#ob-rt-save"); wait(pg, 500)
        pr = pg.evaluate("AxProfile.get()")
        check("levels updated and weak point removed in the profile", pr["levels"]["pull"] == 4 and pr["weak"] == [] and pr["weakAsked"] is False, [pr["levels"], pr["weak"]])
        check("next retest is 4 weeks away; history has 2 entries", 27.9 * 864e5 < pr["retest"]["due"] - pg.evaluate("Date.now()") < 28.1 * 864e5 and len(pr["retest"]["history"]) == 2)
        check("the active plan's gen.weak is cleared so Coach stops the extra set", pg.evaluate("APP.plans[APP.active].gen.weak") == [])
        check("no new plan was created, wizard closed, no retest card", pg.evaluate("Object.keys(APP.plans).length") == plans and not pg.evaluate("AxOnboard.isOpen()") and pg.evaluate("!document.getElementById('ax-rt-nudge')"))
        # second retest with no change, then save + new plan
        settings(pg); pg.click("#ax-rt-set"); wait(pg, 300); pg.click("#ob-next"); wait(pg, 250)
        check("an unchanged retest says so", "No change yet" in txt(pg), txt(pg)[:300])
        pg.click("#ob-rt-plan"); wait(pg, 800)
        check("Save and create a new plan adds a plan and activates it", pg.evaluate("Object.keys(APP.plans).length") == plans + 1 and pg.evaluate("APP.plans[APP.active].gen.v") == 1)
        check("a new plan resets the retest clock to 4 weeks", 27.9 * 864e5 < pg.evaluate("AxProfile.get().retest.due") - pg.evaluate("Date.now()") < 28.1 * 864e5)
        # Back on the first retest screen closes without changes
        settings(pg); pg.click("#ax-rt-set"); wait(pg, 300); before = pg.evaluate("JSON.stringify(AxProfile.get())"); pg.click("#ob-back"); wait(pg, 200)
        check("Back on the retest screen closes it and changes nothing", not pg.evaluate("AxOnboard.isOpen()") and pg.evaluate("JSON.stringify(AxProfile.get())") == before)
        # Android back inside retest
        settings(pg); pg.click("#ax-rt-set"); wait(pg, 300); pg.click("#ob-next"); wait(pg, 200); pg.evaluate("axBack()"); wait(pg, 200)
        check("Android back goes from results to the benchmarks, then closes", pg.evaluate("AxOnboard.isOpen()") and "Retest: what can you do now" in txt(pg))
        pg.evaluate("axBack()"); wait(pg, 200); check("second back closes the retest", not pg.evaluate("AxOnboard.isOpen()"))
        # Coach still loads with a weak-pattern plan
        pg.evaluate("go('home')"); wait(pg, 300)
        check("no page errors", not errs, errs)
        ctx.close(); b.close()
finally:
    srv.terminate()
print("FAILED: " + ", ".join(fails) if fails else "ALL OK"); sys.exit(1 if fails else 0)

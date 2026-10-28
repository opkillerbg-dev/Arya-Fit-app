#!/usr/bin/env python3
"""S9: gym loads in a real browser: weight per set in PR.wtLog, start-weight hint, +/- steps, carry-over, 'Try heavier' nudge, lb display, backup. Run from repo root."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8899"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
def wait(pg, ms=250): pg.wait_for_timeout(ms)
SEED = """(units=>{
  const now=Date.now(),b={push:20,pull:6,squat:30,plank:45,run:null,lifts:{squat:100,bench:null,deadlift:null,ohp:null}};
  const p0={done:true,ts:now,xp:'int',units:units,env:'gym',equip:[],goal:{main:'muscle',extra:null},days:3,mins:45,weeks:8,start:'today',bench:b,weak:[],weakAsked:false,want:[],protect:[],health:'ok',age:'30-39',wt:76};
  const A=AxLevel.calc(p0); p0.levels=A.levels; AxProfile.set(p0);
  const day={title:'Gym test',short:'Gym',focus:'Test',icon:'dumbbell',type:'strength',exercises:[{name:'Barbell back squat',sets:3,reps:'8',note:'x'},{name:'Wall push-ups',sets:3,reps:'10',note:'x'}]};
  const days={};['mon','tue','wed','thu','fri','sat','sun'].forEach(k=>{days[k]=JSON.parse(JSON.stringify(day))});
  const v=vplan({format:'arya-plan',version:1,name:'Gym test',start:new Date().toISOString().slice(0,10),weeks:4,days:days});
  const id='pg'+now.toString(36);APP.plans[id]={plan:v.plan,st:{}};activate(id);PR.setLog={};PR.wtLog={};save();return !!v.plan})"""
def strip(pg, name):
    return pg.evaluate("""n=>{const r=[...document.querySelectorAll('#ax-day .ax-row')].find(x=>x.innerText.includes(n));const s=r&&r.nextElementSibling;return s&&s.classList.contains('ax-prog-strip')?s.innerText:null}""", name)
def show(pg, d): pg.evaluate(f"cur={d};day()"); wait(pg, 300)
try:
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel="chrome")
        except Exception: b = pw.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(URL, wait_until="load"); wait(pg, 1500)
        check("seed ok", pg.evaluate(SEED + "('metric')") is True)
        show(pg, 0)
        sq, pu = strip(pg, "Barbell back squat"), strip(pg, "Wall push-ups")
        check("barbell exercise has a weight row; bodyweight one does not", sq is not None and "WEIGHT" in sq and pu is not None and "WEIGHT" not in pu, [sq, pu])
        check("start weight hint comes from the entered squat (60% of 100 kg)", "Add weight" in sq and "about 60 kg" in sq, sq)
        pg.evaluate("[...document.querySelectorAll('#ax-day .ax-wt-row [data-w]')][0].click()"); wait(pg, 250)
        check("Add weight sets 60 kg for all 3 sets", pg.evaluate("JSON.stringify(PR.wtLog['Barbell back squat'][0])") == "[60,60,60]" and "60 kg" in strip(pg, "Barbell back squat"), pg.evaluate("JSON.stringify(PR.wtLog)"))
        up = "[...document.querySelectorAll('#ax-day .ax-wt-row [data-w=\"1\"]')][0].click()"; dn = "[...document.querySelectorAll('#ax-day .ax-wt-row [data-w=\"-1\"]')][0].click()"
        pg.evaluate(up); wait(pg, 200); w1 = pg.evaluate("PR.wtLog['Barbell back squat'][0][0]")
        pg.evaluate(dn); wait(pg, 200); pg.evaluate(dn); wait(pg, 200); w2 = pg.evaluate("PR.wtLog['Barbell back squat'][0][0]")
        check("+ adds 5 kg for legs, - takes it back", w1 == 65 and w2 == 55, [w1, w2])
        pg.evaluate("[...document.querySelectorAll('#ax-day .ax-prog-strip')][0].querySelector('.ax-set-chip').click()"); wait(pg, 250)
        check("logging a set keeps the weight and records reps", pg.evaluate("PR.setLog['Barbell back squat'][0][0]") == 8 and pg.evaluate("PR.wtLog['Barbell back squat'][0][0]") == 55)
        # next day: carry-over and heavier nudge
        show(pg, 1); s1 = strip(pg, "Barbell back squat")
        check("next session shows last time's weight as a carry-over", "55 kg" in s1 and "Last time: 55 kg" in s1, s1)
        pg.evaluate("[...document.querySelectorAll('#ax-day .ax-prog-strip')][0].querySelectorAll('.ax-set-chip').forEach(c=>{if(/Set/.test(c.innerText))c.click()})"); wait(pg, 300)
        for _ in range(2): pg.evaluate("(()=>{const c=[...document.querySelectorAll('#ax-day .ax-prog-strip')][0].querySelector('.ax-set-chip:not(.done)');if(c&&/Set/.test(c.innerText))c.click()})()"); wait(pg, 250)
        check("carried weight is written into today's log when a set is logged", pg.evaluate("PR.wtLog['Barbell back squat'][1][0]") == 55, pg.evaluate("JSON.stringify(PR.wtLog)"))
        s1 = strip(pg, "Barbell back squat")
        check("all sets hit: 'Target hit at 55 kg' with 'Try 60 kg'", "Target hit at 55 kg" in s1 and "Try 60 kg" in s1, s1)
        pg.evaluate("document.querySelector('#ax-day .ax-nudge-btn').click()"); wait(pg, 300)
        check("tapping Try sets today's weight to 60 kg and the nudge goes away", pg.evaluate("PR.wtLog['Barbell back squat'][1][0]") == 60 and "Try 60" not in (strip(pg, "Barbell back squat") or ""), strip(pg, "Barbell back squat"))
        # PR panel + backup
        pg.evaluate("axPg()"); wait(pg, 300)
        panel = pg.evaluate("document.getElementById('ax-pr-panel')?document.getElementById('ax-pr-panel').innerText:''")
        check("PR panel shows the best weight", "60 kg" in panel, panel)
        pk = pg.evaluate("JSON.parse(pack())")
        check("export contains the weight log", pk["prefs"]["wtLog"]["Barbell back squat"]["1"][0] == 60, pk["prefs"].get("wtLog"))
        pg.evaluate("(()=>{const o=JSON.parse(pack()).prefs;o.wtLog['Barbell back squat']['abc']=[1];o.wtLog.Junk=5;o.wtLog['Barbell back squat']['2']=[9999,'x'];PR.wtLog={};restorePrefs(o)})()")
        r = pg.evaluate("JSON.stringify(PR.wtLog)")
        check("restore brings the log back, clamps and drops junk", '"1":[60,60,60]' in r and "abc" not in r and "Junk" not in r and '"2":[500,0]' in r, r)
        # imperial display
        pg.evaluate(SEED + "('imperial')"); show(pg, 0)
        pg.evaluate("[...document.querySelectorAll('#ax-day .ax-wt-row [data-w]')][0].click()"); wait(pg, 250)
        s2 = strip(pg, "Barbell back squat")
        check("imperial: weight is shown in lb (132 lb) but stored in kg", "132 lb" in s2 and pg.evaluate("PR.wtLog['Barbell back squat'][0][0]") == 60, s2)
        pg.evaluate("[...document.querySelectorAll('#ax-day .ax-wt-row [data-w=\"1\"]')][0].click()"); wait(pg, 250)
        check("imperial: + adds 10 lb for legs", "140 lb" in strip(pg, "Barbell back squat"), strip(pg, "Barbell back squat"))
        check("no page errors", not errs, errs)
        ctx.close(); b.close()
finally:
    srv.terminate()
print("FAILED: " + ", ".join(fails) if fails else "ALL OK"); sys.exit(1 if fails else 0)

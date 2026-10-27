#!/usr/bin/env python3
"""Real-browser test of profile storage (S0): schema 2 migration, persistence, backup export/import, junk rejection, draft. Run from repo root."""
import json, subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8889"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
PROFILE = {"v": 1, "done": True, "ts": 1730000000000, "units": "metric", "name": "Arya", "ht": 178, "wt": 76, "age": "30-39", "sex": "m", "health": "ok",
  "goal": {"main": "muscle", "extra": None}, "xp": "int", "env": "homeplus", "equip": ["backpack", "pullbar"],
  "bench": {"push": 50, "pull": 5, "squat": 50, "plank": 90, "run": 5, "lifts": {"squat": None, "bench": None, "deadlift": None, "ohp": None}},
  "levels": {"push": 5, "pull": 2, "legs": 3, "core": 3, "run": 3}, "weak": ["pull"], "want": ["pull"], "protect": ["shoulder"],
  "days": 4, "mins": 45, "weeks": 8, "start": "today", "retest": {"last": None, "due": None, "history": []}}
def page(b, seed=None):
    ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
    pg.goto(URL, wait_until="load"); pg.wait_for_timeout(800)
    if seed is not None:
        pg.evaluate("s=>{localStorage.clear();for(const k in s)localStorage.setItem(k,s[k])}", seed); pg.reload(wait_until="load"); pg.wait_for_timeout(1200)
    return ctx, pg, errs
try:
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel="chrome")
        except Exception: b = pw.chromium.launch()
        ctx, pg, errs = page(b)
        check("fresh install: schema 2 and profile null", pg.evaluate("APP.schema") == 2 and pg.evaluate("APP.profile") is None, pg.evaluate("[APP.schema,APP.profile]"))
        check("AxProfile and axCleanProfile are available", pg.evaluate("typeof AxProfile==='object'&&typeof axCleanProfile==='function'"))
        plan = pg.evaluate("APP.plans[APP.active].plan")
        check("set() stores the profile", pg.evaluate("p=>!!AxProfile.set(p)", PROFILE) and pg.evaluate("AxProfile.get().levels.pull") == 2)
        pg.reload(wait_until="load"); pg.wait_for_timeout(1200)
        check("profile persists across a restart", pg.evaluate("AxProfile.get()&&AxProfile.get().weak[0]") == "pull")
        txt = pg.evaluate("pack()"); d = json.loads(txt)
        check("backup carries schema 2 and the profile", d.get("schema") == 2 and d.get("profile", {}).get("goal", {}).get("main") == "muscle")
        check("no page errors (fresh)", not errs, errs); ctx.close()

        old = json.dumps({"v": 2, "active": "default", "prefs": {}, "plans": {"default": {"plan": plan, "st": {"1:wu": 1, "2:j": 1}}}})
        ctx, pg, errs = page(b, {"aryaApp2": old})
        check("old schema-1 data: migrated to 2, profile null, ticks kept, premig copy kept",
              pg.evaluate("APP.schema") == 2 and pg.evaluate("APP.profile") is None and pg.evaluate("Object.keys(APP.plans.default.st).filter(k=>/^\\d+:/.test(k)).length") == 2 and pg.evaluate("!!localStorage.getItem('aryaApp2.premig')"))
        pg.evaluate("p=>AxProfile.set(p)", PROFILE)
        d0 = json.loads(pg.evaluate("pack()")); d0.pop("profile", None); d0.pop("schema", None)
        pg.evaluate("t=>doImport(t)", json.dumps(d0)); pg.wait_for_timeout(400)
        check("import without profile keeps the existing profile", pg.evaluate("AxProfile.get()&&AxProfile.get().days") == 4)
        d1 = json.loads(pg.evaluate("pack()")); d1["profile"] = {"done": True, "goal": {"main": "bogus"}, "evil": 1}
        pg.evaluate("t=>doImport(t)", json.dumps(d1)); pg.wait_for_timeout(400)
        check("import with a junk profile is ignored, current profile kept", pg.evaluate("AxProfile.get()&&AxProfile.get().goal.main") == "muscle")
        d2 = json.loads(pg.evaluate("pack()")); d2["profile"] = dict(PROFILE, days=99, ht=9999, evil="x", goal={"main": "run", "extra": None}); d2["profile"]["levels"]["push"] = 9
        pg.evaluate("t=>doImport(t)", json.dumps(d2)); pg.wait_for_timeout(400)
        pr = pg.evaluate("JSON.parse(JSON.stringify(APP.profile))")
        check("import with a valid profile replaces it, values cleaned (days 6, ht null, level 5, no extra keys)", pr["goal"]["main"] == "run" and pr["days"] == 6 and pr["ht"] is None and pr["levels"]["push"] == 5 and "evil" not in pr, pr)
        d3 = json.loads(pg.evaluate("pack()")); d3["schema"] = 99; d3["profile"] = dict(PROFILE, goal={"main": "general", "extra": None})
        pg.evaluate("t=>doImport(t)", json.dumps(d3)); pg.wait_for_timeout(400)
        check("backup from a newer schema is refused, profile unchanged", pg.evaluate("APP.profile.goal.main") == "run")
        pg.evaluate("AxProfile.draftSet({units:'imperial',ht:180,step:3})"); pg.reload(wait_until="load"); pg.wait_for_timeout(1000)
        check("draft survives a restart and is separate from APP.profile", pg.evaluate("AxProfile.draftGet().units") == "imperial" and pg.evaluate("AxProfile.draftStep()") == 3 and pg.evaluate("APP.profile.units") == "metric")
        pg.evaluate("p=>AxProfile.set(p)", PROFILE)
        check("finishing (set) clears the draft", pg.evaluate("AxProfile.draftGet()") is None)
        check("no page errors (old data)", not errs, errs); ctx.close(); b.close()
finally: srv.kill()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

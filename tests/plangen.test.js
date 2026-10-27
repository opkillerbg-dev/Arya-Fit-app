// Unit tests for web/js/features/plangen.js. Run: node tests/plangen.test.js
// Real vplan() (core/sheets-views.js) validates every generated plan, so a plan that would be refused in the app fails here.
const assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm");
const G = require("../web/js/features/plangen.js"), X = require("../web/js/features/exdb.js"), LV = require("../web/js/features/levelcalc.js");
const sv = fs.readFileSync(path.join(__dirname, "../web/js/core/sheets-views.js"), "utf8");
const a = sv.indexOf("function vplan(o){"), b = sv.indexOf("function setPlan(");
assert.ok(a > 0 && b > a, "vplan not found");
const ctx = { ICONS: ["dumbbell", "run", "flame", "stretch", "moon", "sun", "wind", "drop", "egg", "timer"], KEYS: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"], Number, Array, Date, String, JSON };
vm.createContext(ctx); vm.runInContext(sv.slice(a, b), ctx);
const vplan = o => vm.runInContext("vplan", ctx)(JSON.parse(JSON.stringify(o)));
const NOW = 1793000000000, WK = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const owner = () => ({ units: "metric", xp: "int", env: "homeplus", equip: ["backpack", "pullbar"], bench: { push: 50, pull: 5, squat: 50, plank: 90, run: 5, lifts: {} },
  days: 4, mins: 45, weeks: 8, goal: { main: "muscle", extra: null }, want: [], protect: [], health: "ok", age: "30-39", start: "today", name: "Arya" });
let n = 0; const t = (m, f) => { f(); n++; console.log("ok  " + m) };
const gen = (p, o) => G.build(p, X, Object.assign({ now: NOW }, o || {}));
const strength = r => WK.map(k => r.plan.days[k]).filter(d => d.type === "strength");
const sets = (r, pat) => { let s = 0; strength(r).forEach(d => d.exercises.forEach(e => { if (X.byName(e.name).p === pat) s += e.sets })); return s };

function checkInvariants(p, r, label) {
  const v = vplan(r.plan); assert.ok(v.plan, label + " vplan: " + (v.E || []).join("; "));
  const budget = G.budget(p.mins, p.age === "under18"), eqs = ["body", "chair"].concat(p.equip || []);
  let rest = 0;
  WK.forEach(k => { const d = r.plan.days[k]; if (d.type === "rest") rest++;
    let tot = 0; d.exercises.forEach(e => { const x = X.byName(e.name); assert.ok(x, label + " unknown exercise " + e.name);
      (p.protect || []).forEach(a => assert.ok(!x.av.includes(a), label + " protected " + a + " in " + e.name));
      if (p.env !== "gym") x.e.forEach(tg => assert.ok(eqs.includes(tg), label + " equipment " + tg + " for " + e.name));
      if (d.type === "strength") { tot += e.sets; if (p.health === "check") assert.ok(e.sets <= 2, label + " gentle cap"); } });
    if (d.type === "strength") assert.ok(tot <= budget, label + " " + k + " sets " + tot + " > " + budget); });
  assert.ok(rest >= 1, label + " no rest day");
  assert.ok(sets(r, "pull") >= 0.8 * sets(r, "push") - 1e-9, label + " pull " + sets(r, "pull") + " < 0.8 x push " + sets(r, "push"));
  if ((p.days || 4) >= 3) r.gen.weak.filter(w => w !== "run").forEach(w => {
    const pats = { push: ["push"], pull: ["pull"], legs: ["squat", "hinge"], core: ["core"] }[w];
    const f = strength(r).filter(d => d.exercises.some(e => pats.includes(X.byName(e.name).p))).length;
    assert.ok(f >= 3, label + " weak " + w + " trained " + f + "x"); });
}

t("owner example: valid plan, pull is the weak point, pull-ups come first, pull trained 3x", () => {
  const p = owner(), r = gen(p); checkInvariants(p, r, "owner");
  assert.deepStrictEqual(r.gen.levels, { push: 5, pull: 2, legs: 4, core: 4, run: 3 }); assert.deepStrictEqual(r.gen.weak, ["pull"]);
  assert.strictEqual(r.plan.name, "Muscle Plan: pull focus");
  const up = r.plan.days.mon; assert.strictEqual(X.byName(up.exercises[0].name).p, "pull"); assert.strictEqual(X.byName(up.exercises[1].name).p, "pull");
  assert.strictEqual(strength(r).length, 4);
});
t("deterministic: same input, same output", () => { assert.deepStrictEqual(gen(owner()), gen(owner())) });
t("split sizes: 2..6 strength days, week has a rest day", () => {
  [2, 3, 4, 5, 6].forEach(d => { const p = owner(); p.days = d; const r = gen(p); assert.strictEqual(strength(r).length, d); checkInvariants(p, r, "days" + d) });
});
t("run goal swaps one strength day for an easy run day and adds a jog plan", () => {
  const p = owner(); p.goal.main = "run"; const r = gen(p); checkInvariants(p, r, "run");
  assert.strictEqual(strength(r).length, 3); assert.ok(r.plan.jog && r.plan.jog.weeks.length === 8); assert.ok(WK.some(k => r.plan.days[k].title === "Easy run"));
  assert.ok(WK.every(k => r.plan.days[k].jog === false || r.plan.days[k].jogNote));
  const q = owner(); assert.strictEqual(gen(q).plan.jog, undefined);
});
t("fat loss adds a circuit day (not with 6 days)", () => {
  const p = owner(); p.goal.main = "fatloss"; let r = gen(p); checkInvariants(p, r, "fat");
  assert.ok(WK.some(k => r.plan.days[k].type === "circuit")); p.days = 6; r = gen(p); assert.ok(!WK.some(k => r.plan.days[k].type === "circuit"));
});
t("protect areas, gentle mode and under 18 are respected", () => {
  const p = owner(); p.protect = ["shoulder", "knee"]; p.health = "check"; p.age = "under18"; p.mins = 90; const r = gen(p); checkInvariants(p, r, "safe");
  assert.ok(!JSON.stringify(r.plan).includes("Weighted")); assert.ok(r.notes.some(x => /Gentle/.test(x)) && r.notes.some(x => /Under 18/.test(x)));
});
t("gym: loads from entered lifts, generic advice otherwise", () => {
  const p = owner(); p.env = "gym"; p.equip = []; p.bench.lifts = { squat: 100, bench: null, deadlift: null, ohp: null }; p.xp = "adv";
  const r = gen(p); checkInvariants(p, r, "gym"); const txt = JSON.stringify(r.plan);
  assert.ok(/Find a weight you can do 10 reps with/.test(txt)); const sq = strength(r).flatMap(d => d.exercises).find(e => e.name === "Barbell back squat");
  if (sq) assert.ok(/Start about 60 kg/.test(sq.note));
});
t("built-in notes and reps are used when given; every note and rep fits vplan limits", () => {
  const r = gen(owner(), { notes: { "Inverted rows": { reps: "8-12", note: "Body straight, chest to bar." } } });
  const e = strength(r).flatMap(d => d.exercises).find(x => x.name === "Inverted rows"); if (e) { assert.strictEqual(e.reps, "8-12"); assert.ok(e.note.startsWith("Body straight")) }
  checkInvariants(owner(), r, "notes");
});
t("start date: today vs next Monday; weeks and light weeks", () => {
  const p = owner(); p.weeks = 12; let r = gen(p); assert.deepStrictEqual(r.plan.lightWeeks, [4, 8, 12]); p.start = "monday"; r = gen(p);
  assert.strictEqual(new Date(r.plan.start + "T12:00:00").getDay(), 1);
});
t("500 random profiles: all invariants hold, fast", () => {
  let s = 12345; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff, pick = a => a[Math.floor(rnd() * a.length)], num = (a, b) => Math.floor(a + rnd() * (b - a + 1));
  const skip = v => rnd() < 0.15 ? null : v, t0 = Date.now(), eqAll = ["backpack", "pullbar", "dumbbell", "band", "bench", "rope", "wheel", "chair"];
  for (let i = 0; i < 500; i++) {
    const p = { units: "metric", xp: pick(["beg", "int", "adv"]), env: pick(["home", "homeplus", "gym"]), equip: eqAll.filter(() => rnd() < 0.4), wt: num(45, 120),
      bench: { push: skip(num(0, 70)), pull: skip(num(0, 20)), squat: skip(num(0, 120)), plank: skip(num(0, 240)), run: skip(num(0, 15)), lifts: { squat: skip(num(0, 150)), bench: null, deadlift: null, ohp: null } },
      days: num(2, 6), mins: num(20, 90), weeks: num(4, 12), goal: { main: pick(["muscle", "strength", "fatloss", "run", "general"]), extra: null },
      want: ["push", "pull", "legs", "core", "run"].filter(() => rnd() < 0.15), protect: ["knee", "back", "shoulder", "wrist", "elbow", "ankle", "neck"].filter(() => rnd() < 0.15),
      health: pick(["ok", "ok", "check"]), age: pick(["under18", "18-29", "30-39", "60+"]), start: pick(["today", "monday"]) };
    checkInvariants(p, gen(p), "rand" + i + " " + JSON.stringify(p));
  }
  assert.ok((Date.now() - t0) / 500 < 50, "slower than 50 ms per plan");
});
console.log(n + " passed");

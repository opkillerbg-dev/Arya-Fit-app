// Unit tests for web/js/core/profile.js (validation, drafts, get/set). Run: node tests/profile.test.js
const vm = require("vm"), fs = require("fs"), path = require("path"), assert = require("assert");
const src = fs.readFileSync(path.join(__dirname, "../web/js/core/profile.js"), "utf8");
function env() {
  const ls = {}, saved = [];
  const ctx = { JSON, Math, APP: { plans: {}, profile: null }, save: () => saved.push(JSON.stringify(ctx.APP.profile)),
    localStorage: { getItem: k => (k in ls ? ls[k] : null), setItem: (k, v) => { ls[k] = String(v) }, removeItem: k => { delete ls[k] } } };
  vm.createContext(ctx); vm.runInContext(src, ctx); return { ctx, ls, saved, P: ctx.AxProfile, clean: raw => { const r = ctx.AxProfile.clean(JSON.parse(JSON.stringify(raw))); return r === null ? null : JSON.parse(JSON.stringify(r)) } }; // clone: objects made inside the vm have another prototype
}
const good = () => ({ v: 1, done: true, ts: 1730000000000, units: "metric", name: "Arya", ht: 178, wt: 76, age: "30-39", sex: "m", health: "ok",
  goal: { main: "muscle", extra: "run" }, xp: "int", env: "homeplus", equip: ["backpack", "pullbar"],
  bench: { push: 50, pull: 5, squat: 50, plank: 90, run: 5, lifts: { squat: null, bench: null, deadlift: null, ohp: null } },
  levels: { push: 5, pull: 2, legs: 3, core: 3, run: 3 }, weak: ["pull"], want: ["pull"], protect: ["shoulder"],
  days: 4, mins: 45, weeks: 8, start: "today", retest: { last: null, due: null, history: [] } });
let n = 0; const t = (name, f) => { f(); n++; console.log("ok  " + name) };

t("a complete profile survives cleaning unchanged, and cleaning twice changes nothing", () => {
  const { clean } = env(), a = clean(good()); assert.ok(a); assert.deepStrictEqual(a, good()); assert.deepStrictEqual(clean(a), a);
});
t("unknown and dangerous keys are dropped, nothing leaks onto Object.prototype", () => {
  const { clean } = env(), raw = good(); raw.evil = "x"; raw.goal.evil = 1; raw.bench.evil = 2;
  const a = clean(JSON.parse('{"__proto__":{"polluted":1},"constructor":{"x":1},' + JSON.stringify(raw).slice(1)));
  assert.strictEqual(a.evil, undefined); assert.strictEqual(a.goal.evil, undefined); assert.strictEqual(a.bench.evil, undefined); assert.strictEqual(({}).polluted, undefined);
  assert.deepStrictEqual(Object.keys(a).sort(), Object.keys(good()).sort());
});
t("body and benchmark numbers outside the allowed range become null", () => {
  const { clean } = env(), r = good(); r.ht = 999; r.wt = 5; r.bench.push = 5000; r.bench.pull = -3; r.bench.lifts.squat = 9999;
  const a = clean(r); assert.strictEqual(a.ht, null); assert.strictEqual(a.wt, null); assert.strictEqual(a.bench.push, null); assert.strictEqual(a.bench.pull, null); assert.strictEqual(a.bench.lifts.squat, null);
});
t("days, minutes, weeks and levels are clamped; numeric strings are accepted", () => {
  const { clean } = env(), r = good(); r.days = 99; r.mins = 5; r.weeks = "8"; r.levels = { push: 9, pull: -2, legs: "3", core: 2.6, run: 1 }; r.ht = "178.5";
  const a = clean(r); assert.strictEqual(a.days, 6); assert.strictEqual(a.mins, 20); assert.strictEqual(a.weeks, 8);
  assert.deepStrictEqual(a.levels, { push: 5, pull: 0, legs: 3, core: 3, run: 1 }); assert.strictEqual(a.ht, 178.5);
});
t("bad enums fall back to safe defaults", () => {
  const { clean } = env(), r = good(); r.units = "stone"; r.health = "maybe"; r.start = "never"; r.sex = "z"; r.age = "99";
  const a = clean(r); assert.strictEqual(a.units, "metric"); assert.strictEqual(a.health, "ok"); assert.strictEqual(a.start, "today"); assert.strictEqual(a.sex, null); assert.strictEqual(a.age, null);
});
t("a finished profile must be usable: missing goal, env, levels or schedule gives null", () => {
  const { clean } = env();
  [["goal", { main: "bogus" }], ["env", "mars"], ["levels", {}], ["days", null], ["mins", "abc"], ["done", false]].forEach(([k, v]) => { const r = good(); r[k] = v; assert.strictEqual(clean(r), null, k) });
  assert.strictEqual(clean(null), null); assert.strictEqual(clean("x"), null); assert.strictEqual(clean([]), null);
});
t("missing levels are filled with 0 so the engine never sees undefined", () => {
  const { clean } = env(), r = good(); r.levels = { pull: 2 }; assert.deepStrictEqual(clean(r).levels, { push: 0, pull: 2, legs: 0, core: 0, run: 0 });
});
t("lists: dedupe, whitelist, size caps; extra goal cannot equal the main goal", () => {
  const { clean } = env(), r = good(); r.weak = ["pull", "pull", "push", "legs", "x"]; r.equip = ["bar", "pullbar", "pullbar", "band"]; r.protect = ["knee", "knee", "soul"]; r.goal.extra = "muscle";
  const a = clean(r); assert.deepStrictEqual(a.weak, ["pull", "push"]); assert.deepStrictEqual(a.equip, ["pullbar", "band"]); assert.deepStrictEqual(a.protect, ["knee"]); assert.strictEqual(a.goal.extra, null);
});
t("name is stripped of markup and control characters and cut at 40", () => {
  const { clean } = env(), r = good(); r.name = '  <b>Ar"ya</b>\u0007' + "x".repeat(60); const a = clean(r);
  assert.ok(!/[<>"&\u0007]/.test(a.name)); assert.ok(a.name.length <= 40);
});
t("retest history keeps at most 12 valid entries", () => {
  const { clean } = env(), r = good(); r.retest.history = Array.from({ length: 20 }, (_, i) => ({ ts: i + 1, levels: { push: 1 } })).concat([{ ts: 1, levels: {} }, "junk"]);
  const a = clean(r); assert.strictEqual(a.retest.history.length, 12);
});
t("draft mode keeps partial answers, never marks them done, and needs no required fields", () => {
  const { P } = env(), d = P.clean({ done: true, units: "imperial", ht: 180, goal: { main: "run" } }, { draft: true });
  assert.strictEqual(d.done, false); assert.strictEqual(d.units, "imperial"); assert.strictEqual(d.ht, 180); assert.strictEqual(d.goal.main, "run"); assert.strictEqual(d.levels, null);
});
t("draft storage: save, resume step, clear; corrupt draft is ignored", () => {
  const { P, ls } = env(); assert.strictEqual(P.draftGet(), null);
  assert.strictEqual(P.draftSet({ units: "metric", ht: 170, step: 4 }), true);
  assert.strictEqual(P.draftGet().ht, 170); assert.strictEqual(P.draftStep(), 4);
  ls.aryaOnboardDraft = "{not json"; assert.strictEqual(P.draftGet(), null); assert.strictEqual(P.draftStep(), 0);
  P.draftSet({ ht: 1 }); P.draftClear(); assert.strictEqual(ls.aryaOnboardDraft, undefined);
});
t("set() stores a cleaned profile, saves, clears the draft; get() returns only a finished one", () => {
  const { P, ctx, ls, saved } = env(); P.draftSet({ ht: 170 }); assert.strictEqual(P.get(), null);
  assert.strictEqual(P.set({ done: true }), null); assert.strictEqual(ctx.APP.profile, null);
  const r = good(); r.evil = 1; const c = P.set(r);
  assert.ok(c && ctx.APP.profile.goal.main === "muscle" && ctx.APP.profile.evil === undefined); assert.strictEqual(saved.length, 1); assert.strictEqual(ls.aryaOnboardDraft, undefined);
  assert.strictEqual(P.get().days, 4); ctx.APP.profile.done = false; assert.strictEqual(P.get(), null);
});
console.log("\n" + n + " tests passed");

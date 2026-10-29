// Unit tests for web/js/features/retest.js. Run: node tests/retest.test.js
const assert = require("assert"), R = require("../web/js/features/retest.js"), LV = require("../web/js/features/levelcalc.js");
const DAY = 864e5, NOW = 1793000000000;
const mk = (b, x) => Object.assign({ done: true, ts: NOW, xp: "int", wt: 76, goal: { main: "muscle" }, want: [], protect: [], health: "ok", age: "30-39",
  bench: Object.assign({ push: 50, pull: 3, squat: 30, plank: 45, run: 5, lifts: {} }, b || {}) }, x || {});
const fin = p => { const l = LV.calc(p).levels; return Object.assign({}, p, { levels: l, weak: LV.calc(p).weak, retest: R.initial(l, NOW) }) };
let n = 0; const t = (m, f) => { f(); n++; console.log("ok  " + m) };
t("due after 4 weeks, not before; needs a finished profile", () => {
  const p = fin(mk());
  assert.strictEqual(R.due(p, NOW + 27 * DAY), false); assert.strictEqual(R.due(p, NOW + 28 * DAY), true);
  assert.strictEqual(R.due({ done: false }, NOW + 99 * DAY), false); assert.strictEqual(R.due(null, NOW), false);
});
t("profiles from before retest existed are due 4 weeks after they were made", () => {
  const p = mk({}, { ts: NOW, retest: { last: null, due: null, history: [] } });
  assert.strictEqual(R.dueAt(p), NOW + 28 * DAY); assert.strictEqual(R.dueAt(mk({}, { ts: 0 })), null);
});
t("snooze moves the due date by 3 days and keeps history", () => {
  const p = fin(mk()), s = R.snooze(p, NOW + 30 * DAY); assert.strictEqual(s.due, NOW + 33 * DAY); assert.strictEqual(s.history.length, 1);
});
t("retest updates levels and history; due moves 4 weeks on", () => {
  const p = fin(mk()), r = R.run(p, { pull: 10, plank: 90 }, NOW + 28 * DAY);
  assert.strictEqual(r.profile.levels.pull, 4); assert.strictEqual(r.profile.levels.core, 4);
  assert.ok(r.changes.some(c => c.k === "pull" && c.from === 2 && c.to === 4));
  assert.strictEqual(r.profile.retest.due, NOW + 56 * DAY); assert.strictEqual(r.profile.retest.history.length, 2);
});
t("answers left out keep their old value", () => {
  const p = fin(mk()), r = R.run(p, { pull: 6 }, NOW + 28 * DAY); assert.strictEqual(r.profile.bench.push, 50); assert.strictEqual(r.profile.bench.squat, 30);
  assert.strictEqual(R.run(p, null, NOW).profile.bench.pull, 3);
});
t("gap closes to 1: the weak point is removed", () => {
  const p = fin(mk()); assert.deepStrictEqual(p.weak.slice(0, 1), ["pull"]);
  const r = R.run(p, { pull: 10, squat: 50, plank: 90 }, NOW + 28 * DAY);        // push 5, pull 4, legs 4, core 4
  assert.deepStrictEqual(r.profile.weak, []); assert.ok(r.removed.includes("pull")); assert.strictEqual(r.profile.weakAsked, false);
});
t("still behind: the weak point stays; a new gap is added", () => {
  const p = fin(mk()), r = R.run(p, { pull: 6, plank: 0 }, NOW + 28 * DAY);
  assert.ok(r.profile.weak.includes("core")); assert.ok(r.added.includes("core"));
});
t("a person who declined the priority stays declined (gap rule stays off)", () => {
  const p = fin(mk({}, {})); p.weakAsked = true; p.weak = [];
  const r = R.run(p, { pull: 0 }, NOW + 28 * DAY); assert.deepStrictEqual(r.profile.weak, []); assert.strictEqual(r.profile.weakAsked, true); assert.deepStrictEqual(r.added, []);
});
t("history is capped at 12 entries", () => {
  let p = fin(mk()); for (let i = 1; i <= 15; i++) p = R.run(p, { push: 50 }, NOW + i * 28 * DAY).profile; assert.strictEqual(p.retest.history.length, 12);
});
t("gym lifts merge and raise levels", () => {
  const p = fin(mk({ squat: 30 })), r = R.run(p, { lifts: { squat: 152 } }, NOW + 28 * DAY); assert.strictEqual(r.profile.bench.lifts.squat, 152); assert.ok(r.profile.levels.legs > p.levels.legs);
});
t("garbage in never throws", () => { R.run(fin(mk()), { pull: "x", lifts: { squat: -5 }, push: NaN }, NOW); R.run({ bench: null }, undefined, NOW); });
console.log(n + " passed");

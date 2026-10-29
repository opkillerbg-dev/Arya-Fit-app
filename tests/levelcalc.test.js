// Unit tests for web/js/features/levelcalc.js. Run: node tests/levelcalc.test.js
const assert = require("assert"), L = require("../web/js/features/levelcalc.js");
const P = (b, x) => Object.assign({ xp: "int", wt: 76, goal: { main: "muscle" }, want: [], protect: [], health: "ok", age: "30-39",
  bench: Object.assign({ push: 20, pull: 6, squat: 30, plank: 45, run: 5, lifts: {} }, b || {}) }, x || {});
let n = 0; const t = (m, f) => { f(); n++; console.log("ok  " + m) };
t("owner example: 50 push-ups + 5 pull-ups -> push 5, pull 2, pull is weak", () => {
  const r = L.calc(P({ push: 50, pull: 5, squat: 30, plank: 45 }));
  assert.strictEqual(r.levels.push, 5); assert.strictEqual(r.levels.pull, 2); assert.strictEqual(r.weak[0], "pull"); /* legs/core (3) are also 2 below top by the literal rule, so they may follow, max 2 */
});
t("table boundaries (every row of 03)", () => {
  const e = { push: [[0, 0], [2, 0], [3, 1], [9, 1], [10, 2], [19, 2], [20, 3], [34, 3], [35, 4], [49, 4], [50, 5]],
    pull: [[0, 0], [1, 1], [2, 1], [3, 2], [5, 2], [6, 3], [9, 3], [10, 4], [14, 4], [15, 5]],
    squat: [[0, 0], [14, 1], [15, 2], [29, 2], [30, 3], [49, 3], [50, 4], [99, 4], [100, 5]],
    plank: [[0, 0], [19, 1], [20, 2], [44, 2], [45, 3], [89, 3], [90, 4], [179, 4], [180, 5]],
    run: [[0, 0], [1, 1], [2, 1], [3, 2], [5, 3], [10, 4], [15, 5]] }, m = { squat: "legs", plank: "core" };
  Object.keys(e).forEach(k => e[k].forEach(([v, lv]) => assert.strictEqual(L.calc(P({ [k]: v })).levels[m[k] || k], lv, k + " " + v)));
});
t("skipped benchmarks use experience (beg 1, int 2, adv 3) and are listed", () => {
  [["beg", 1], ["int", 2], ["adv", 3]].forEach(([x, lv]) => {
    const r = L.calc({ xp: x, bench: { push: null, pull: null, squat: null, plank: null, run: null } });
    assert.deepStrictEqual(Object.values(r.levels), [lv, lv, lv, lv, lv]); assert.strictEqual(r.skipped.length, 5);
  });
  assert.deepStrictEqual(L.calc(null).levels, { push: 1, pull: 1, legs: 1, core: 1, run: 1 });
});
t("gap of 1 is not weak; gap of 2 is; max 2 weak, biggest gap first", () => {
  assert.deepStrictEqual(L.calc(P({ push: 35, pull: 6 })).weak, []);
  assert.deepStrictEqual(L.calc(P({ push: 50, pull: 3, squat: 15, plank: 20 })).weak, ["pull", "legs"]);
  assert.strictEqual(L.calc(P({ push: 50, pull: 0, squat: 0, plank: 0 })).weak.length, 2);
});
t("want picks become weak; run only counts when goal is run", () => {
  assert.deepStrictEqual(L.calc(P({}, { want: ["core"] })).weak, ["core"]); /* levels 3,3,3,3: no gap, so only the pick */
  assert.deepStrictEqual(L.calc(P({ push: 50, run: 1 })).weak.includes("run"), false);
  assert.ok(L.calc(P({ push: 50, run: 1 }, { goal: { main: "run" } })).weak.includes("run"));
});
t("knee pain lowers legs by 1 (not below 0)", () => {
  assert.strictEqual(L.calc(P({ squat: 30 }, { protect: ["knee"] })).levels.legs, 2);
  assert.strictEqual(L.calc(P({ squat: 0 }, { protect: ["knee"] })).levels.legs, 0);
});
t("gym lifts raise a level by at most 1, never lower, ignored without body weight", () => {
  const lifts = { squat: 152, bench: 0, deadlift: null, ohp: null }; // 2.0 x bw -> lift level 5
  assert.strictEqual(L.calc(P({ squat: 30, lifts })).levels.legs, 4);
  assert.strictEqual(L.calc(P({ squat: 100, lifts: { squat: 40 } })).levels.legs, 5);
  assert.strictEqual(L.calc(P({ squat: 30, lifts }, { wt: null })).levels.legs, 3);
  assert.strictEqual(L.calc(P({ push: 20, lifts: { bench: 100 } })).levels.push, 4);
});
t("start levels are one lower (min 0); safety caps", () => {
  const r = L.calc(P({ push: 0, pull: 6 })); assert.strictEqual(r.start.push, 0); assert.strictEqual(r.start.pull, 2);
  assert.deepStrictEqual(L.calc(P({}, { health: "check" })).caps, { gentle: true, minor: false, maxSetsPerExercise: 2, noMaxTests: true, noWeighted: false, sessionSetCap: null, longRest: true });
  const m = L.calc(P({}, { age: "under18" })).caps; assert.ok(m.minor && m.noMaxTests && m.noWeighted && m.sessionSetCap === 12);
  assert.strictEqual(L.calc(P()).caps.noMaxTests, false);
});
t("garbage input never throws or leaves the 0-5 range", () => {
  [{}, { bench: "x" }, { bench: { push: -5, pull: NaN, squat: 1e9, lifts: { squat: 1e9 } }, wt: 76 }, { want: "a", protect: 3 }].forEach(x => {
    const r = L.calc(x); Object.values(r.levels).forEach(v => assert.ok(v >= 0 && v <= 5)); });
});
t("declining the weak-point priority drops the gap rule but keeps picks from want", () => {
  const base = P({ push: 50, pull: 3, squat: 15, plank: 20 }, { weakAsked: true, weak: [] });
  assert.deepStrictEqual(L.calc(base).weak, []);
  assert.deepStrictEqual(L.calc(Object.assign({}, base, { want: ["pull"] })).weak, ["pull"]);
  assert.ok(L.calc(Object.assign({}, base, { weakAsked: false })).weak.length > 0);
});
console.log(n + " passed");

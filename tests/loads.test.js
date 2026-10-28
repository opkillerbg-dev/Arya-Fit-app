// Unit tests for web/js/features/loads.js and plangen.startKg. Run: node tests/loads.test.js
const assert = require("assert"), L = require("../web/js/features/loads.js"), G = require("../web/js/features/plangen.js"), X = require("../web/js/features/exdb.js");
let n = 0; const t = (m, f) => { f(); n++; console.log("ok  " + m) };
t("display: kg to 0.5, lb whole", () => { assert.strictEqual(L.fmt(42.5, "metric"), "42.5 kg"); assert.strictEqual(L.fmt(40, "imperial"), "88 lb"); assert.strictEqual(L.disp(0, "metric"), 0) });
t("bump: 2.5 kg for upper body, 5 kg for legs, snaps to the grid, never below 0 or above 500", () => {
  assert.strictEqual(L.bump(40, 1, "metric", false), 42.5); assert.strictEqual(L.bump(40, -1, "metric", false), 37.5);
  assert.strictEqual(L.bump(40, 1, "metric", true), 45); assert.strictEqual(L.bump(41, 1, "metric", false), 42.5); assert.strictEqual(L.bump(41, -1, "metric", false), 40);
  assert.strictEqual(L.bump(1, -1, "metric", true), 0); assert.strictEqual(L.bump(0, -1, "metric", false), 0); assert.strictEqual(L.bump(499, 1, "metric", true), 500);
});
t("bump in pounds: 5 lb steps (10 lb for legs) on whole-number grid", () => {
  assert.strictEqual(L.disp(L.bump(40, 1, "imperial", false), "imperial"), 90); assert.strictEqual(L.disp(L.bump(40, -1, "imperial", false), "imperial"), 85);
  assert.strictEqual(L.disp(L.bump(40, 1, "imperial", true), "imperial"), 90); const w = L.bump(L.bump(0, 1, "imperial", false), 1, "imperial", false); assert.strictEqual(L.disp(w, "imperial"), 10);
  assert.strictEqual(L.disp(L.bump(L.bump(60 / 2.2046, 1, "imperial", false), -1, "imperial", false), "imperial"), 60);
});
t("only dumbbell/barbell/machine/cable exercises take weights; legs are lower body", () => {
  assert.ok(L.weightable(X.byId("barbell-back-squat"))); assert.ok(!L.weightable(X.byId("wall-push-ups"))); assert.ok(!L.weightable(null));
  assert.ok(L.lower(X.byId("barbell-back-squat"))); assert.ok(!L.lower(X.byId("barbell-bench-press")));
});
t("last / today / best weights", () => {
  const log = { Squat: { 2: [40, 40, 40], 5: [0, 45, 45], 9: [50] } };
  assert.strictEqual(L.today(log, "Squat", 5), 45); assert.strictEqual(L.today(log, "Squat", 6), 0);
  assert.deepStrictEqual(L.last(log, "Squat", 9), { d: 5, kg: 45 }); assert.strictEqual(L.last(log, "Squat", 2), null); assert.strictEqual(L.last(log, "Nope", 9), null);
  assert.strictEqual(L.best(log, "Squat"), 50); assert.strictEqual(L.best(log, "Nope"), 0);
});
t("fill makes n equal sets (1-10)", () => { assert.deepStrictEqual(L.fill(40, 3), [40, 40, 40]); assert.strictEqual(L.fill(40, 0).length, 1); assert.strictEqual(L.fill(40, 99).length, 10) });
t("cleanLog keeps good data and drops junk (backup restore)", () => {
  const c = L.cleanLog({ Squat: { 3: [40, "42.5", -5, 9999, "x"], abc: [1], 4: "no", 5: [0, 0] }, Bad: 5, [("N" + "x".repeat(60))]: { 1: [10] } });
  assert.deepStrictEqual(c.Squat, { 3: [40, 42.5, 0, 500, 0] }); assert.ok(!c.Bad); assert.ok(Object.keys(c).some(k => k.length === 40));
  assert.strictEqual(L.cleanLog(null), null); assert.strictEqual(L.cleanLog([]), null); assert.strictEqual(L.cleanLog({ A: { 1: [0] } }), null);
  const big = {}; for (let i = 0; i < 80; i++) big["E" + i] = { 1: [10] }; assert.strictEqual(Object.keys(L.cleanLog(big)).length, 60);
});
t("startKg: 60% of the entered lift in 2.5 kg steps, only for the main lifts", () => {
  const p = { bench: { lifts: { squat: 100, bench: 60, deadlift: null, ohp: 0 } } };
  assert.strictEqual(G.startKg(p, "barbell-back-squat"), 60); assert.strictEqual(G.startKg(p, "barbell-bench-press"), 35);
  assert.strictEqual(G.startKg(p, "barbell-deadlift"), null); assert.strictEqual(G.startKg(p, "barbell-overhead-press"), null); assert.strictEqual(G.startKg(p, "wall-push-ups"), null);
  assert.strictEqual(G.startKg({}, "barbell-back-squat"), null); assert.strictEqual(G.startKg(null, "barbell-back-squat"), null);
});
console.log(n + " passed");

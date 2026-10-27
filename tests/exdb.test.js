// Unit tests for web/js/features/exdb.js. Run: node tests/exdb.test.js
const assert = require("assert"), path = require("path"), fs = require("fs");
const X = require("../web/js/features/exdb.js");
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, "../docs/onboarding/exercises.seed.json"), "utf8")).ex;
let n = 0; const t = (m, f) => { f(); n++; console.log("ok  " + m) };
t("108 exercises, same as the seed", () => { assert.strictEqual(X.all.length, 108); assert.deepStrictEqual(X.all, seed) });
t("ids and names are unique", () => {
  assert.strictEqual(new Set(X.all.map(e => e.id)).size, X.all.length);
  assert.strictEqual(new Set(X.all.map(e => e.n.toLowerCase())).size, X.all.length);
});
t("every ladder is contiguous from its lowest step and L is 0-5", () => {
  X.ladders.forEach(g => { const L = X.ladder(g).map(e => e.L); L.forEach(l => assert.ok(l >= 0 && l <= 5));
    for (let i = 1; i < L.length; i++) assert.ok(L[i] === L[i - 1] || L[i] === L[i - 1] + 1, g + " gap at " + L[i]) });
});
t("31 built-in exercises (b:1) are present", () => assert.strictEqual(X.all.filter(e => e.b).length, 31));
t("byId / byName work and reject prototype keys", () => {
  assert.strictEqual(X.byId("wall-push-ups").n, "Wall push-ups"); assert.strictEqual(X.byName("WALL PUSH-UPS").id, "wall-push-ups");
  assert.strictEqual(X.byId("constructor"), null); assert.strictEqual(X.byName("__proto__"), null); assert.strictEqual(X.ladder("toString").length, 0);
});
t("home filter: only body/chair/owned gear; gym-only items hidden", () => {
  const h = X.filter({ env: "home", equip: [] });
  assert.ok(h.length > 0 && h.every(e => e.e.every(t => t === "body" || t === "chair")));
  const hp = X.filter({ env: "homeplus", equip: ["pullbar"] });
  assert.ok(hp.some(e => e.e.includes("pullbar")) && hp.every(e => e.e.every(t => ["body", "chair", "pullbar"].includes(t))));
});
t("gym filter returns everything", () => assert.strictEqual(X.filter({ env: "gym" }).length, 108));
t("avoid removes exercises tagged with that area; pattern/group filters combine", () => {
  const a = X.filter({ env: "gym", avoid: ["shoulder"] });
  assert.ok(a.length < 108 && a.every(e => !e.av.includes("shoulder")));
  assert.ok(X.filter({ p: "pull", g: "pullup" }).every(e => e.p === "pull" && e.g === "pullup"));
});
console.log(n + " passed");

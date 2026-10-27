// Unit tests for web/js/core/store.js. Run: node tests/store.test.js (no dependencies)
const vm = require("vm"), fs = require("fs"), path = require("path"), assert = require("assert");
const src = fs.readFileSync(path.join(__dirname, "../web/js/core/store.js"), "utf8");
function env(init, now) {
  const ls = Object.assign({}, init), notes = [];
  const ctx = { KEY2: "aryaApp2", JSON, Math, Date: { now: () => ctx.__now }, __now: now || 1e12,
    localStorage: { getItem: k => (k in ls ? ls[k] : null), setItem: (k, v) => { ls[k] = String(v) }, removeItem: k => { delete ls[k] } },
    setTimeout: f => f(), toast: m => notes.push(m), APP: null };
  vm.createContext(ctx); vm.runInContext(src, ctx);
  return { ctx, ls, notes, run: code => vm.runInContext(code, ctx) };
}
const good = (extra) => Object.assign({ v: 2, active: "default", prefs: {}, plans: { default: { plan: { name: "P" }, st: { "1:0": 1 } } } }, extra || {});
let n = 0; const t = (name, f) => { f(); n++; console.log("ok  " + name) };

t("runMig: runs pending migrations in order and stamps schema", () => {
  const e = env({}); const order = [];
  const list = [{ to: 2, name: "b", run: a => { order.push("b"); a.b = 1; return a } }, { to: 1, name: "a", run: a => { order.push("a"); a.a = 1; return a } }];
  e.ctx.__a = { x: 1 }; e.ctx.__l = list;
  const r = e.run("axRunMig(__a,__l,2)");
  assert.deepStrictEqual(order, ["a", "b"]); assert.strictEqual(r.app.schema, 2); assert.strictEqual(r.app.a, 1); assert.strictEqual(r.app.b, 1); assert.strictEqual(r.error, null);
});
t("runMig: skips already-applied migrations", () => {
  const e = env({}); let ran = 0; e.ctx.__a = { schema: 2 }; e.ctx.__l = [{ to: 1, name: "a", run: a => { ran++; return a } }, { to: 2, name: "b", run: a => { ran++; return a } }];
  const r = e.run("axRunMig(__a,__l,2)"); assert.strictEqual(ran, 0); assert.strictEqual(r.ran.length, 0);
});
t("runMig: a throwing migration leaves the original data untouched", () => {
  const e = env({}); e.ctx.__a = { schema: 0, keep: [1, 2, 3] };
  e.ctx.__l = [{ to: 1, name: "ok", run: a => { a.keep.push(4); return a } }, { to: 2, name: "boom", run: () => { throw new Error("bad") } }];
  const r = e.run("axRunMig(__a,__l,2)");
  assert.deepStrictEqual(JSON.parse(JSON.stringify(r.app)), { schema: 0, keep: [1, 2, 3] }); assert.ok(/bad/.test(r.error)); assert.strictEqual(r.to, 0);
});
t("runMig: data from a NEWER app is never modified", () => {
  const e = env({}); e.ctx.__a = { schema: 9, z: 1 }; e.ctx.__l = [{ to: 1, name: "a", run: a => { a.z = 2; return a } }];
  const r = e.run("axRunMig(__a,__l,1)"); assert.strictEqual(r.newer, true); assert.strictEqual(r.app.z, 1); assert.strictEqual(r.app.schema, 9);
});
t("read: empty storage returns null (fresh install / legacy path)", () => {
  const e = env({}); assert.strictEqual(e.run("axStoreRead()"), null);
});
t("read: valid pre-schema data gets baseline migration, premig copy and daily backup", () => {
  const raw = JSON.stringify(good()); const e = env({ aryaApp2: raw });
  const a = e.run("axStoreRead()");
  assert.strictEqual(a.schema, 2); assert.strictEqual(a.profile, null); assert.strictEqual(a.plans.default.st["1:0"], 1);
  assert.strictEqual(e.ls["aryaApp2.premig"], raw); assert.strictEqual(e.ls["aryaApp2.bak"], raw); assert.ok(e.ls["aryaApp2.bakts"]);
});
t("read: daily backup is not rewritten within 20 h, is rewritten after", () => {
  const e = env({ aryaApp2: JSON.stringify(good({ schema: 1 })) }, 1e12); e.run("axStoreRead()");
  const first = e.ls["aryaApp2.bak"]; e.ls.aryaApp2 = JSON.stringify(good({ schema: 1, marker: "new" }));
  e.ctx.__now = 1e12 + 3600e3; e.run("axStoreRead()"); assert.strictEqual(e.ls["aryaApp2.bak"], first);
  e.ctx.__now = 1e12 + 21 * 3600e3; e.run("axStoreRead()"); assert.ok(/new/.test(e.ls["aryaApp2.bak"]));
});
t("read: no premig copy when already at current schema", () => {
  const e = env({ aryaApp2: JSON.stringify(good({ schema: 2, profile: null })) }); e.run("axStoreRead()"); assert.strictEqual(e.ls["aryaApp2.premig"], undefined);
});
t("read: damaged main file is restored from the daily backup and kept as evidence", () => {
  const bak = JSON.stringify(good({ schema: 1, from: "bak" })); const e = env({ aryaApp2: '{"plans":{"default":{"plan":', "aryaApp2.bak": bak });
  const a = e.run("axStoreRead()");
  assert.strictEqual(a.from, "bak"); assert.strictEqual(e.ls["aryaApp2.bad"], '{"plans":{"default":{"plan":'); assert.strictEqual(e.ls["aryaApp2.bak"], bak); assert.ok(e.notes.length === 1);
});
t("read: damaged main and no backup returns null but keeps the damaged text", () => {
  const e = env({ aryaApp2: "{oops" }); assert.strictEqual(e.run("axStoreRead()"), null); assert.strictEqual(e.ls["aryaApp2.bad"], "{oops");
});
t("read: wrong-shape JSON (no active plan) counts as damaged", () => {
  const e = env({ aryaApp2: JSON.stringify({ plans: {}, active: "x" }) }); assert.strictEqual(e.run("axStoreRead()"), null);
});
t("read: newer-schema data is returned untouched with a warning", () => {
  const e = env({ aryaApp2: JSON.stringify(good({ schema: 7, future: true })) }); const a = e.run("axStoreRead()");
  assert.strictEqual(a.schema, 7); assert.strictEqual(a.future, true); assert.strictEqual(e.run("AXSTORE.newer"), true); assert.strictEqual(e.notes.length, 1);
});
t("read: oversized data skips the daily backup (quota protection)", () => {
  const big = good({ schema: 1, pad: "x".repeat(1300000) }); const e = env({ aryaApp2: JSON.stringify(big) }); e.run("axStoreRead()");
  assert.strictEqual(e.ls["aryaApp2.bak"], undefined);
});
t("stamp: fresh data gets the current schema, existing is kept", () => {
  const e = env({}); e.ctx.__a = {}; e.ctx.__b = { schema: 3 }; e.run("axStamp(__a);axStamp(__b)"); assert.strictEqual(e.ctx.__a.schema, 2); assert.strictEqual(e.ctx.__a.profile, null); assert.strictEqual(e.ctx.__b.schema, 3);
});
console.log("\n" + n + " tests passed");

/* v140 nudge planner. Run from repo root: node tests/nudges.test.js */
var N = require("../web/js/features/nudges.js"), assert = require("assert"), fails = 0;
function t(n, f) { try { f(); console.log("ok   " + n); } catch (e) { fails++; console.log("FAIL " + n + "  -> " + e.message); } }
var now = new Date(2026, 10, 8, 10, 5); // Sunday 10:05
function ctx(o) { o = o || {}; return { now: o.now || now, ciDone: !!o.ciDone, steps: o.steps == null ? 3000 : o.steps, goal: 8000, day: o.day || function () { return { work: true, done: false, name: "Upper body" }; } }; }
function keys(l, k) { return l.filter(function (n) { return n.key === k; }); }
t("clean() fills defaults and fixes junk", function () {
  var c = N.clean({ on: 5, hy: { n: 9, a: "bad", b: "08:00" }, ci: { t: "25:99" } });
  assert.strictEqual(c.on, 1); assert.strictEqual(c.hy.n, 2); assert.strictEqual(c.hy.a, "09:00"); assert.strictEqual(c.ci.t, "08:00");
  assert.deepStrictEqual(N.clean(null), N.clean({}));
});
t("master off schedules nothing", function () { assert.strictEqual(N.build(N.clean({ on: 0 }), ctx()).length, 0); });
t("past times are skipped (today's 09:00 hydration, 08:00 check-in)", function () {
  var l = N.build(N.clean({}), ctx());
  assert.ok(keys(l, "hy").every(function (n) { return n.at > now; }));
  assert.strictEqual(keys(l, "ci").filter(function (n) { return n.at.getDate() === 8; }).length, 0);
});
t("hydration interval and window", function () {
  var l = keys(N.build(N.clean({ hy: { n: 3, a: "09:00", b: "18:00" } }), ctx({ now: new Date(2026, 10, 9, 0, 5) })), "hy").filter(function (n) { return n.at.getDate() === 9; });
  assert.deepStrictEqual(l.map(function (n) { return n.at.getHours(); }), [9, 12, 15, 18]);
});
t("ids are unique and inside 3000-3599", function () {
  var l = N.build(N.clean({ mv: { on: 1 }, wd: { on: 1 } }), ctx({ now: new Date(2026, 10, 9, 0, 5) })), seen = {};
  l.forEach(function (n) { assert.ok(n.id >= 3000 && n.id < 3600, n.id); assert.ok(!seen[n.id], "dup " + n.id); seen[n.id] = 1; });
});
t("check-in skipped for today when already answered", function () {
  var l = N.build(N.clean({ ci: { on: 1, t: "23:00" } }), ctx({ ciDone: true }));
  assert.ok(keys(l, "ci").every(function (n) { return n.at.getDate() !== 8; }));
  assert.ok(keys(N.build(N.clean({ ci: { on: 1, t: "23:00" } }), ctx({ ciDone: false })), "ci").some(function (n) { return n.at.getDate() === 8; }));
});
t("evening walk skipped today once the goal is reached", function () {
  assert.ok(keys(N.build(N.clean({}), ctx({ steps: 9000 })), "wk").every(function (n) { return n.at.getDate() !== 8; }));
  assert.ok(keys(N.build(N.clean({}), ctx({ steps: 3000 })), "wk").some(function (n) { return n.at.getDate() === 8; }));
  assert.ok(keys(N.build(N.clean({}), ctx({ steps: -1 })), "wk").some(function (n) { return n.at.getDate() === 8; }));
});
t("workout-still-open only on unfinished workout days", function () {
  var l = N.build(N.clean({}), ctx({ day: function (k) { return k === 0 ? { work: true, done: true } : k === 1 ? { work: false } : { work: true, done: false, name: "Legs" }; } }));
  var d = keys(l, "nd").map(function (n) { return n.at.getDate(); });
  assert.deepStrictEqual(d, [10]); assert.ok(/Legs/.test(keys(l, "nd")[0].body));
});
t("weekly summary lands on a Sunday, comeback at +3 and +6 days", function () {
  var l = N.build(N.clean({}), ctx({ now: new Date(2026, 10, 9, 10, 0) }));
  var w = keys(l, "ws"); assert.strictEqual(w.length, 1); assert.strictEqual(w[0].at.getDay(), 0); assert.strictEqual(w[0].at.getDate(), 15);
  var c = keys(l, "cb"); assert.deepStrictEqual(c.map(function (n) { return n.at.getDate(); }), [12, 15]);
});
t("per-nudge off switches are respected", function () {
  var l = N.build(N.clean({ hy: { on: 0 }, ci: { on: 0 }, wk: { on: 0 }, nd: { on: 0 }, ws: { on: 0 }, cb: { on: 0 } }), ctx());
  assert.strictEqual(l.length, 0);
});
t("every nudge has a channel and text", function () {
  N.build(N.clean({ mv: { on: 1 }, wd: { on: 1 } }), ctx()).forEach(function (n) { assert.ok(N.CH[n.key]); assert.ok(n.title && n.body); });
});
if (fails) { console.log(fails + " failed"); process.exit(1); } console.log("all passed");

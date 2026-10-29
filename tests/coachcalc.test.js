// node tests/coachcalc.test.js : coach engine rules (break detection, comeback, progress, hold, lighten, deload, rebuild, week builder).
const C = require("../web/js/features/coachcalc.js");
let fails = 0;
function ok(name, cond, info) { if (cond) console.log("ok   " + name); else { fails++; console.log("FAIL " + name + (info !== undefined ? "  -> " + JSON.stringify(info) : "")); } }
const T = 1000;
/* history helper: days from..to, a strength session planned Mon-Sat pattern (6 of 7), done fraction f, act when f>0 */
function hist(from, to, f, extra) {
  const days = [];
  for (let d = from; d <= to; d++) { const planned = d % 7 !== 0 ? 1 : 0; days.push({ d, plan: planned, done: planned ? f : 0, act: planned && f > 0 ? 1 : 0, km: 0 }); }
  return Object.assign({ days, perf: { up: 0, down: 0, same: 0 }, lastLevel: 2, peakLevel: 2, maxLevel: 3, runsRecent: 1, log: [] }, extra || {});
}
function run(h, today, natural) { const a = C.analyze(h, today); return { a, r: C.recommend(a, h, { today, natural: natural || 5 }) }; }

/* 1. the real case: 11 days off after a normal stretch */
{ const h = hist(T - 40, T - 12, 1); const { a, r } = run(h, T);
  ok("11-day break is detected (gap)", a.gap >= 11 && a.gap <= 12, a.gap);
  ok("11-day break -> comeback", r.mode === "comeback", r.mode);
  ok("comeback: 3 sessions, one set less, first capped at 2", r.sessions === 3 && r.delta === -1 && r.capFirst === 2, r);
  ok("comeback: run level steps back from 2 to 1", r.level === 1, r.level);
  ok("comeback explains the number of days", r.reasons.join(" ").indexOf(a.gap + " days") >= 0, r.reasons); }
/* 2. other gaps */
{ const h = hist(T - 60, T - 31, 1); ok("30+ days -> restart, level 0, max 2 sets", (() => { const { r } = run(h, T); return r.mode === "restart" && r.level === 0 && r.capAll === 2 && r.delta === -2; })()); }
{ const h = hist(T - 40, T - 7, 1); const { a, r } = run(h, T); ok("7 days off -> easeback (first set less, normal level)", r.mode === "easeback" && r.firstDelta === -1 && r.level === 2 && a.gap === 7, [a.gap, r]); }
ok("no history at all -> start, level 0", (() => { const { r } = run({ days: [], log: [] }, T); return r.mode === "start" && r.level === 0 && r.sessions === 3; })());
ok("days exist but never any activity -> start", (() => { const h = hist(T - 20, T - 1, 0); const { r } = run(h, T); return r.mode === "start"; })());
/* 3. normal weeks */
{ const h = hist(T - 20, T - 1, 1); const { a, r } = run(h, T); ok("solid weeks, no rest of 4 good -> progress", r.mode === "progress" && r.top === 1 && r.level === 3, r); ok("goodWeeks counted", a.goodWeeks >= 2, a.goodWeeks); }
{ const h = hist(T - 20, T - 1, 1, { perf: { up: 1, down: 3, same: 0 } }); ok("lifts declining blocks progress -> hold", run(h, T).r.mode === "hold"); }
{ const h = hist(T - 20, T - 1, 0.7); ok("70% adherence -> hold", run(h, T).r.mode === "hold"); }
{ const h = hist(T - 20, T - 1, 0.3); const { r } = run(h, T); ok("30% adherence -> lighten with 4 sessions and one set less", r.mode === "lighten" && r.sessions === 4 && r.delta === -1, r); }
{ const h = hist(T - 30, T - 1, 1); const { a, r } = run(h, T); ok("4 good weeks in a row -> deload", a.goodWeeks >= 4 && r.mode === "deload" && r.delta === -1, [a.goodWeeks, r.mode]); }
{ const h = hist(T - 30, T - 1, 1, { log: [{ d: T - 3, mode: "deload" }] }); ok("no second deload right after one", run(h, T).r.mode !== "deload"); }
{ const h = hist(T - 2, T - 1, 1); ok("too few planned sessions -> hold (not enough data)", run(h, T).r.mode === "hold"); }
/* 4. after a comeback */
{ const h = hist(T - 40, T - 20, 1); h.days = h.days.concat(hist(T - 9, T - 1, 0.9).days); h.log = [{ d: T - 8, mode: "comeback" }]; h.lastLevel = 1; h.peakLevel = 2;
  const { a, r } = run(h, T); ok("break days before the comeback are not counted against you", a.adh === null || a.adh >= 0.85, a.adh);
  ok("week after comeback -> rebuild, level steps up toward peak", r.mode === "rebuild" && r.level === 2 && r.sessions === 5 && r.delta === 0, r); }
{ const h = hist(T - 9, T - 1, 0.2); h.log = [{ d: T - 8, mode: "comeback" }]; h.lastLevel = 1; ok("comeback week mostly missed (gap<5) -> lighten, no jump", run(h, T).r.mode === "lighten"); }
{ const h = hist(T - 9, T - 1, 0.9); h.log = [{ d: T - 8, mode: "comeback" }, { d: T - 1, mode: "rebuild" }]; ok("after rebuild the normal rules apply again", run(h, T).r.mode !== "rebuild"); }
/* 5. week builder */
function wk(kinds, base, extra) { return kinds.map((k, i) => Object.assign({ d: 100 + i, wk: i, kind: k, base: k === "strength" ? base.slice() : [], circuit: false, locked: false }, extra && extra[i] || {})); }
{ const rec = C.recommend(C.analyze(hist(T - 40, T - 12, 1), T), hist(T - 40, T - 12, 1), { today: T, natural: 5 });
  const days = wk(["strength", "strength", "strength", "strength", "strength", "mobility", "rest"], [3, 3, 3, 3, 2]);
  const out = C.buildWeek(rec, days);
  const kept = out.filter(x => x.keep && x.sets);
  ok("comeback week keeps exactly 3 of 5 strength days, spaced out", kept.length === 3 && kept.map(x => x.d).join() === "100,102,104", kept.map(x => x.d));
  ok("dropped strength days become rest", out.filter(x => x.keep === false).map(x => x.d).join() === "101,103");
  ok("first session: sets 2,2,2,2,1 (capped at 2, one less)", kept[0].sets.join() === "2,2,2,2,1", kept[0].sets);
  ok("later sessions: one set less than plan", kept[1].sets.join() === "2,2,2,2,1", kept[1].sets);
  ok("mobility/rest days stay, with the run level", out[5].keep && out[5].sets === null && out[5].level === rec.level && out[6].keep); }
{ const rec = { mode: "progress", sessions: 5, delta: 0, top: 1, capFirst: 0, capAll: 0, firstDelta: 0, level: 2 };
  const out = C.buildWeek(rec, wk(["strength", "strength", "rest"], [3, 3, 3, 4]));
  ok("progress: +1 set on the first two exercises only, max 5", out[0].sets.join() === "4,4,3,4" && out[1].sets.join() === "4,4,3,4", out[0].sets);
  const out2 = C.buildWeek(rec, wk(["strength"], [5, 5, 3])); ok("never above 5 sets", out2[0].sets.join() === "5,5,3", out2[0].sets); }
{ const rec = { mode: "comeback", sessions: 3, delta: -1, top: 0, capFirst: 2, capAll: 0, firstDelta: 0, level: 0 };
  const out = C.buildWeek(rec, wk(["strength", "strength", "strength", "strength"], [3, 3, 3], [{ locked: true }, { circuit: true }]));
  ok("locked (already done / past) days are never touched", out[0].skip === true);
  ok("circuit days get no per-exercise sets", out[1].keep && out[1].sets === null, out[1]);
  ok("gentle first session lands on the first day that has sets (a circuit has none)", out[2].keep && out[2].sets.join() === "2,2,2", out[2]);
  ok("never below 1 set", C.buildWeek(rec, wk(["strength"], [1, 0, 2]))[0].sets.join() === "1,0,1"); }

/* onboarding weak point: +1 set on weak exercises in progress mode only */
{ const day = { d: 1, wk: 1, kind: "strength", base: [3, 3, 3, 3], weak: [false, false, true, false] };
  const prog = { mode: "progress", sessions: 1, delta: 0, top: 1, capFirst: 0, capAll: 0, firstDelta: 0, level: 0 };
  const w = C.buildWeek(prog, [day])[0].sets;
  ok("progress: weak exercise gets +1 on top of the normal step", w[2] === 4 && w[0] === 4 && w[1] === 4 && w[3] === 3, w);
  const hold = Object.assign({}, prog, { mode: "hold", top: 0 });
  ok("hold: weak flag changes nothing", C.buildWeek(hold, [day])[0].sets.join() === "3,3,3,3", C.buildWeek(hold, [day])[0].sets);
  const noWeak = C.buildWeek(prog, [Object.assign({}, day, { weak: undefined })])[0].sets;
  ok("plans without a weak list behave as before", noWeak.join() === "4,4,3,3", noWeak);
  const capped = C.buildWeek(Object.assign({}, prog, { capAll: 3 }), [day])[0].sets;
  ok("weak bonus still respects the safety cap", capped.every(x => x <= 3), capped);
  const five = C.buildWeek(prog, [Object.assign({}, day, { base: [5, 5, 5, 5] })])[0].sets;
  ok("never above 5 sets", five.every(x => x <= 5), five); }

console.log(fails ? "\n" + fails + " FAILED" : "\nall passed"); process.exit(fails ? 1 : 0);

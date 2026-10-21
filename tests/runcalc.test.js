// node tests/runcalc.test.js : GPS filter accuracy on simulated runs, splits, summary. No dependencies.
const A = require("../web/js/features/runcalc.js"), S = require("./gps_sim.js");
let fails = 0;
const check = (n, c, i) => { console.log((c ? "ok   " : "FAIL ") + n + (c ? "" : "  -> " + i)); if (!c) fails++; };
const run = (fx, cfg) => { const t = new A.Track(cfg); fx.forEach(f => t.add(f.la, f.lo, f.acc, f.spd, f.t)); return t; };
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
function err(mode, env) { const e = [], o = []; for (let s = 1; s <= 40; s++) { const g = S.gen(s * 7919, env), fx = mode === "good" ? g.fixes : S.withSpeed(g.fixes, mode, s); e.push((run(fx).dist - g.truth) / g.truth * 100); o.push((S.oldAlgo(g.fixes) - g.truth) / g.truth * 100) } return { n: mean(e), o: mean(o) } }
let r = err("good", {});
check("typical GPS noise: new error under 3% (old " + r.o.toFixed(1) + "%, new " + r.n.toFixed(1) + "%)", Math.abs(r.n) < 3 && Math.abs(r.n) < Math.abs(r.o) / 5, r);
r = err("good", { sig: 6, tau: 10 }); check("noisy GPS: new error under 4% (old " + r.o.toFixed(1) + "%)", Math.abs(r.n) < 4, r);
r = err("none", {}); check("no speed channel: still beats old by 4x (" + r.n.toFixed(1) + "% vs " + r.o.toFixed(1) + "%)", Math.abs(r.n) < Math.abs(r.o) / 4, r);
r = err("zero", {}); check("speed stuck at 0: distance not frozen (" + r.n.toFixed(1) + "%)", r.n > -6, r);
r = err("chord", {}); check("noisy speed channel: scale stays 1, error under 10%", Math.abs(r.n) < 10, r);
// pause: restart() drops the filter; position change during the pause adds nothing
{ const g = S.gen(11, { stop: false, gap: false }), t = new A.Track(), h = g.fixes.length >> 1; g.fixes.slice(0, h).forEach(f => t.add(f.la, f.lo, f.acc, f.spd, f.t)); const d0 = t.dist; t.restart(); const f = g.fixes[h + 200]; t.add(f.la, f.lo, f.acc, f.spd, f.t); check("pause then resume far away: no jump in distance", t.dist - d0 < 1, t.dist - d0) }
// wild fix
{ const t = new A.Track(); let la = 40.7, lo = -74; for (let i = 0; i < 60; i++) t.add(la + i * 3e-5, lo, 4, 3, i * 1000 + 1000); const d0 = t.dist; t.add(la + 60 * 3e-5 + 5e-3, lo, 5, 3, 61000); check("single 500 m jump is rejected", t.dist - d0 < 20, t.dist - d0) }
// bad accuracy and lock
{ const t = new A.Track(); t.add(40.7, -74, 28, 0, 1000); check("first fix worse than 22 m is not trusted", !t.locked && t.dropped === 1) }
// splits: constant 3 m/s straight line for 2.6 km
{ const pts = []; for (let i = 0; i <= 867; i++) pts.push([40.7 + i * 3 / 111320, -74, i * 1000]); const sp = A.splits(pts);
  check("splits: 2 full km of 333 s", sp.km.length === 2 && sp.km.every(x => Math.abs(x - 333) <= 2), sp.km);
  check("splits: partial last km reported", sp.part && Math.abs(sp.part[0] - 601) < 15, sp.part);
  check("splits: 20 profile buckets near 333 s/km", sp.pp.length === 20 && sp.pp.every(x => Math.abs(x - 333) <= 6), sp.pp) }
// splits: a 60 s pause in place is not slow running
{ const pts = []; for (let i = 0; i <= 400; i++) pts.push([40.7 + i * 3 / 111320, -74, i * 1000]); for (let i = 401; i <= 460; i++) pts.push([40.7 + 400 * 3 / 111320, -74, i * 1000 + (i === 401 ? 0 : 0)]); for (let i = 461; i <= 800; i++) pts.push([40.7 + (400 + i - 460) * 3 / 111320, -74, i * 1000]);
  const sp = A.splits([pts[0], pts[400], [pts[400][0], -74, 460000 + 0 * 1], ...pts.slice(461)].map((p, i) => i === 2 ? [p[0], p[1], 461000] : p)); check("splits: pause time excluded from first km", sp.km.length >= 1 && sp.km[0] < 345, sp.km) }
// summarize
{ const o = A.summarize({ dist: 3500, sec: 1500, steps: 4200, jt: 1200, wt: 300, acc: 6.4, lvl: "4 min jog, 1 min walk", t: 5 });
  check("summary: cadence = steps per moving minute", o.cd === 168, o.cd); check("summary: stride metres", o.sl === 0.83, o.sl); check("summary: compact", JSON.stringify(o).length < 220, JSON.stringify(o).length) }
check("quality labels", A.quality(5, 0, 3000).k === "good" && A.quality(12, 0, 3000).k === "ok" && A.quality(25, 0, 3000).k === "weak" && A.quality(0, 0, 0).k === "none");
console.log(fails ? fails + " FAILED" : "all passed"); process.exit(fails ? 1 : 0);

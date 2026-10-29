const G = require("../web/js/features/bootgate.js");
let n = 0, bad = 0;
function ok(c, m) { n++; if (!c) { bad++; console.log("FAIL", m); } }
/* run a fake clock: dtFn(i,t) gives the next frame time; returns {t, v} at the first ok verdict or at maxMs */
function run(g, dtFn, maxMs, on) {
  var t = 1000, i = 0, v;
  while (t < 1000 + maxMs) {
    t += dtFn(i++, t); g.frame(t); if (on) on(g, t);
    v = g.check(t); if (v.ok) return { t: t - 1000, v: v };
  }
  return { t: t - 1000, v: v };
}
const hz = (f) => () => 1000 / f;

/* 1 steady 60 / 90 / 120 Hz is accepted after about one window */
[60, 90, 120].forEach(function (f) {
  var r = run(G.create(), hz(f), 5000);
  ok(r.v.ok && r.v.reason === "stable" && r.v.tier === "strict", f + " Hz stable, got " + r.v.reason);
  ok(r.t >= 1000 && r.t < 2500, f + " Hz accepted at " + r.t + " ms");
  ok(Math.abs(r.v.fps - f) <= 2, f + " Hz measured " + r.v.fps);
});

/* 2 a hitch inside the window delays the go, and the clean window starts again after it */
(function () {
  var g = G.create(), r = run(g, function (i) { return i === 50 ? 70 : 1000 / 60; }, 6000);
  ok(r.v.ok, "hitch run ends");
  ok(r.t > 50 * 16.7 + 1000, "waited for a clean second after the hitch (" + r.t + ")");
})();

/* 3 a long task resets the window even when frames look fine */
(function () {
  var g = G.create(), fired = false;
  var r = run(g, hz(60), 6000, function (gg, t) { if (!fired && t > 1000 + 500) { fired = true; gg.busy(t, 180); } });
  ok(r.v.ok && r.t >= 500 + 900, "long task delays the go (" + r.t + ")");
})();

/* 4 constant jank never passes strict, gets through relaxed only when mild, and always ends at the hard cap */
(function () {
  var jank = function (i) { return i % 5 === 0 ? 40 : 16.7; };         /* a late frame every 5th frame */
  var r = run(G.create(), jank, 20000);
  ok(r.v.ok && r.v.reason === "timeout", "constant jank ends by timeout, got " + r.v.reason);
  ok(r.t >= 10500 && r.t < 12500, "timeout near 11 s (" + r.t + ")");
})();
(function () {
  var mild = function (i) { return i % 40 === 0 && i > 0 ? 26 : 16.7; };  /* one slightly late frame every 40 */
  var r = run(G.create(), mild, 20000);
  ok(r.v.ok && r.v.reason === "stable", "mild jitter passes, got " + r.v.reason);
})();
(function () {
  var g = G.create({ strict: 500, hard: 9000 });
  var r = run(g, function (i) { return i % 15 === 0 ? 45 : 16.7; }, 20000);   /* 2-3 late frames per window: fails strict, ok relaxed */
  ok(r.v.ok && r.v.tier === "relaxed", "relaxed tier used, got " + r.v.tier + "/" + r.v.reason);
})();

/* 5 starved frames (rAF barely firing) is not stable */
(function () {
  var r = run(G.create(), function () { return 33; }, 3000);
  ok(r.v.ok && r.v.base > 30, "a steady 30 Hz screen is learned as 30 Hz and accepted");
  var g = G.create(); var t = 1000;
  for (var i = 0; i < 40; i++) { t += 16.7; g.frame(t); }
  var v = g.check(t + 2000);                                             /* no frames for 2 s of clock */
  ok(!v.ok, "no recent frames is not ok (" + v.reason + ")");
})();

/* 6 hidden page: a long gap restarts the window and does not count as visible time */
(function () {
  var g = G.create(), t = 1000, i;
  for (i = 0; i < 40; i++) { t += 16.7; g.frame(t); }
  var vis = g.visibleMs();
  t += 30000; g.frame(t);
  ok(g.visibleMs() - vis < 50, "hidden time not counted");
  ok(!g.check(t).ok, "window restarted after hidden");
  for (i = 0; i < 90; i++) { t += 16.7; g.frame(t); }
  ok(g.check(t).ok, "stable again after a clean second");
})();

/* 7 calibration is not fooled by a janky start */
(function () {
  var g = G.create(), t = 1000;
  for (var i = 0; i < 30; i++) { t += i % 3 === 0 ? 60 : 8.33; g.frame(t); }
  ok(Math.abs(g.base() - 1000 / 120) < 0.5, "base from fastest quarter = 120 Hz (" + g.base() + ")");
})();

console.log(bad ? bad + " of " + n + " failed" : "bootgate: " + n + " checks ok");
process.exit(bad ? 1 : 0);

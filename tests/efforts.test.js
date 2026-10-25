// Unit tests for AxRun.bestEfforts. Run: node tests/efforts.test.js
const A = require("../web/js/features/runcalc.js"), assert = require("assert");
let n = 0; const t = (name, f) => { f(); n++; console.log("ok  " + name) };
const M = 111195; // metres per degree for the Earth radius used by hav()
// build a track north at piecewise speeds [[meters, m/s], ...], 1 Hz fixes; optional pause (sec) after meters
function track(segs, opt) {
  opt = opt || {}; const pts = []; let la = 40.7, ts = 0, covered = 0; pts.push([la, -74, 0]);
  for (const [len, v] of segs) { let left = len; while (left > 1e-9) { const step = Math.min(v, left); la += step / M; left -= step; covered += step; ts += step / v * 1000; pts.push([la, -74, Math.round(ts)]) }
    if (opt.pauseAfter && Math.abs(covered - opt.pauseAfter) < 1e-6) { ts += opt.pauseSec * 1000; pts.push([la, -74, Math.round(ts)]) } }
  return pts;
}
t("constant 3 m/s for 5.2 km: 1 km = 333 s, 5 km = 1667 s, no 10 km", () => {
  const b = A.bestEfforts(track([[5200, 3]]));
  assert.ok(Math.abs(b[1000] - 333) <= 1, b[1000]); assert.ok(Math.abs(b[5000] - 1667) <= 2, b[5000]); assert.strictEqual(b[10000], undefined);
  assert.ok(Math.abs(b[400] - 133) <= 1); assert.ok(Math.abs(b[1609] - 536) <= 2);
});
t("a fast km hidden in the middle is found (not just at km marks)", () => {
  // 700 m @3, 1000 m @4 (250 s), 1300 m @3 -> best 1 km must be 250 s even though it straddles km marks
  const b = A.bestEfforts(track([[700, 3], [1000, 4], [1300, 3]]));
  assert.ok(Math.abs(b[1000] - 250) <= 1, b[1000]);
});
t("fast part does not leak into a longer effort", () => {
  const b = A.bestEfforts(track([[2000, 3], [1000, 4], [2020, 3]]));
  assert.ok(Math.abs(b[1000] - 250) <= 1); assert.ok(b[5000] > 1500 && b[5000] < 1700, b[5000]);
});
t("a standing pause is not counted as time", () => {
  const plain = A.bestEfforts(track([[3000, 3]])), paused = A.bestEfforts(track([[3000, 3]], { pauseAfter: 1500, pauseSec: 120 }));
  assert.ok(Math.abs(plain[1000] - paused[1000]) <= 1); assert.ok(Math.abs(plain[2000 > 0 ? 1609 : 0] - paused[1609]) <= 2);
  assert.ok(Math.abs(plain[1609] - paused[1609]) <= 2, [plain[1609], paused[1609]]);
});
t("GPS-error speeds (> 9 m/s) are dropped", () => assert.deepStrictEqual(A.bestEfforts(track([[2000, 12]])), {}));
t("too short for any distance returns nothing", () => assert.deepStrictEqual(A.bestEfforts(track([[300, 3]])), {}));
t("fewer than 5 points returns nothing", () => assert.deepStrictEqual(A.bestEfforts([[40.7, -74, 0], [40.71, -74, 1000]]), {}));
t("summarize stores be, and keeps it small", () => {
  const o = A.summarize({ pts: track([[5200, 3]]), dist: 5200, sec: 1733, t: 1 }); assert.ok(o.be && o.be[1000] && o.be[5000]);
  assert.ok(JSON.stringify(o.be).length < 200, JSON.stringify(o.be));
});
console.log("\n" + n + " tests passed");

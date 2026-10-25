// Unit tests for the auto-pause detector AxRun.Move. Run: node tests/automove.test.js
const A = require("../web/js/features/runcalc.js"), assert = require("assert");
let n = 0; const t = (name, f) => { f(); n++; console.log("ok  " + name) };
const M = 111320;
// simulate a walker: speed v m/s north, 1 Hz fixes, optional step counter, returns {m, pausedAt}
function sim({ v, secs, acc = 8, spd = v, steps = false, jitter = 1.2, seed = 1 }) {
  const m = new A.Move(0); let la = 40.7, st = 0, pausedAt = -1, s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 - .5 };
  for (let sec = 1; sec <= secs; sec++) {
    la += v / M; if (steps && sec % 2 === 0 && v > 0) st++;
    m.fix(sec * 1000, la + rnd() * 2 * jitter / M, -74 + rnd() * 2 * jitter / M, acc, spd == null ? -1 : (v > 0 ? spd : 0.05), steps ? st : undefined);
    if (pausedAt < 0 && m.still(sec * 1000)) pausedAt = sec;
  }
  return { m, pausedAt };
}
t("slow walk 0.4 m/s, GPS only, never pauses over 5 min", () => assert.strictEqual(sim({ v: .4, secs: 300, spd: .4 }).pausedAt, -1));
t("very slow walk 0.3 m/s, GPS only, never pauses", () => assert.strictEqual(sim({ v: .3, secs: 300, spd: .3 }).pausedAt, -1));
t("slow walk with the Doppler channel missing never pauses", () => assert.strictEqual(sim({ v: .4, secs: 300, spd: null }).pausedAt, -1));
t("slow walk 0.25 m/s with steps never pauses", () => assert.strictEqual(sim({ v: .25, secs: 300, spd: 0, steps: true }).pausedAt, -1));
t("normal jog never pauses", () => assert.strictEqual(sim({ v: 2.8, secs: 120 }).pausedAt, -1));
t("standing still pauses after about 20 s", () => { const r = sim({ v: 0, secs: 60 }); assert.ok(r.pausedAt >= 20 && r.pausedAt <= 26, r.pausedAt) });
t("standing still with a good step sensor still pauses", () => { const r = sim({ v: 0, secs: 60, steps: true }); assert.ok(r.pausedAt >= 20 && r.pausedAt <= 26, r.pausedAt) });
t("weak GPS (60 m) never pauses", () => assert.strictEqual(sim({ v: 0, secs: 120, acc: 60 }).pausedAt, -1));
t("no fixes at all never pauses", () => { const m = new A.Move(0); assert.strictEqual(m.still(120000), false) });
t("resume needs two signs within 6 s", () => {
  const m = new A.Move(0); m.fix(1000, 40.7, -74, 8, 0, 0); assert.strictEqual(m.recent(1500, 6000), 0);
  m.fix(2000, 40.7, -74, 8, .6, 0); assert.strictEqual(m.recent(2500, 6000), 1);
  m.fix(3000, 40.7, -74, 8, .6, 0); assert.strictEqual(m.recent(3500, 6000), 2); assert.strictEqual(m.recent(20000, 6000), 0);
});
t("a phone bump (one step) is not enough to resume", () => { const m = new A.Move(0); m.fix(1000, 40.7, -74, 8, 0, 5); m.fix(2000, 40.7, -74, 8, 0, 6); assert.strictEqual(m.recent(2500, 6000), 1) });
console.log("\n" + n + " tests passed");

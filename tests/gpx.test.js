// Unit tests for AxGpx. Run: node tests/gpx.test.js
const G = require("../web/js/features/gpx.js"), assert = require("assert");
let n = 0; const t = (name, f) => { f(); n++; console.log("ok  " + name) };
const T0 = Date.UTC(2026, 9, 5, 6, 30, 0);
const pts = (k, dt, step) => Array.from({ length: k }, (_, i) => [40.7 + i * step, -74 + i * step, T0 + i * dt]);
t("valid structure: one trkpt per point, ISO times, running type", () => {
  const x = G.build(pts(10, 3000, 3e-5), { name: "Run", desc: "1 km" });
  assert.ok(x.startsWith('<?xml version="1.0" encoding="UTF-8"?>')); assert.ok(x.includes('<gpx version="1.1"')); assert.ok(x.includes("<type>running</type>"));
  assert.strictEqual((x.match(/<trkpt /g) || []).length, 10); assert.strictEqual((x.match(/<\/trkpt>/g) || []).length, 10);
  assert.ok(x.includes("<time>2026-10-05T06:30:00.000Z</time>")); assert.strictEqual((x.match(/<trkseg>/g) || []).length, 1); assert.ok(x.trim().endsWith("</gpx>"));
});
t("times never go backwards", () => {
  const x = G.build(pts(20, 2000, 3e-5)), ts = [...x.matchAll(/<trkpt[^>]*><time>([^<]+)</g)].map(m => Date.parse(m[1]));
  for (let i = 1; i < ts.length; i++) assert.ok(ts[i] >= ts[i - 1]);
});
t("a pause (long gap, almost no movement) starts a new segment", () => {
  const a = pts(6, 2000, 3e-5), b = pts(6, 2000, 3e-5).map((p, i) => [a[5][0] + 1e-7 + i * 3e-5, p[1], a[5][2] + 120000 + i * 2000]);
  const x = G.build(a.concat(b)); assert.strictEqual((x.match(/<trkseg>/g) || []).length, 2); assert.strictEqual((x.match(/<\/trkseg>/g) || []).length, 2);
});
t("a long gap WITH real movement stays one segment", () => {
  const a = pts(3, 2000, 3e-5), far = [[a[2][0] + 0.003, a[2][1], a[2][2] + 60000]];
  assert.strictEqual((G.build(a.concat(far)).match(/<trkseg>/g) || []).length, 1);
});
t("names are XML-escaped", () => { const x = G.build(pts(6, 1000, 1e-5), { name: 'A & B <"x">' }); assert.ok(x.includes("A &amp; B &lt;&quot;x&quot;&gt;")); assert.ok(!x.includes('<"x">')) });
t("missing timestamps give points without <time> instead of bad dates", () => {
  const x = G.build([[40.7, -74, 0], [40.7001, -74, 0], [40.7002, -74, 0], [40.7003, -74, 0], [40.7004, -74, 0]]);
  assert.ok(!x.includes("<time>")); assert.strictEqual((x.match(/<trkpt /g) || []).length, 5);
});
t("file name uses the local date of the first point, or the plan day", () => {
  const d = new Date(T0), exp = "Arya-Run-" + d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") + ".gpx";
  assert.strictEqual(G.fileName(pts(5, 1000, 1e-5), 3), exp); assert.strictEqual(G.fileName([[1, 1, 0]], 3), "Arya-Run-day4.gpx");
});
console.log("\n" + n + " tests passed");

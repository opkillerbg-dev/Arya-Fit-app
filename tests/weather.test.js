/* Run weather: pure scoring and verdict logic. Run from repo root: node tests/weather.test.js */
const W = require("../web/js/features/weather.js");
let n = 0, bad = 0;
const ok = (name, c, info) => { n++; if (c) console.log("ok  " + name); else { bad++; console.log("FAIL " + name + (info !== undefined ? "  -> " + JSON.stringify(info) : "")); } };
const H = (o) => Object.assign({ a: 12, p: 0, r: 0, w: 8, u: 2, c: 1 }, o);

ok("ideal cool dry morning scores 100", W.score(H({})) === 100, W.score(H({})));
ok("hot afternoon is penalised more than the same gap when cold", W.score(H({ a: 27 })) < W.score(H({ a: -3 })), [W.score(H({ a: 27 })), W.score(H({ a: -3 }))]);
ok("rain chance lowers the score", W.score(H({ p: 80 })) < 60, W.score(H({ p: 80 })));
ok("actual rain hurts", W.score(H({ r: 3 })) < W.score(H({ r: 0 })));
ok("strong wind hurts", W.score(H({ w: 40 })) < 80, W.score(H({ w: 40 })));
ok("high UV hurts", W.score(H({ u: 11 })) < 80);
ok("thunderstorm is very low", W.score(H({ c: 95 })) <= 40, W.score(H({ c: 95 })));
ok("score stays within 0..100", [W.score(H({ a: 60, p: 100, r: 50, w: 90, u: 14, c: 99 })), W.score(H({}))].every(v => v >= 0 && v <= 100));
ok("missing numbers do not give NaN", Number.isFinite(W.score({ a: 15 })));

// two days of hourly data starting 2026-10-21 00:00
function day(base, fn) { const t = [], o = { time: t, apparent_temperature: [], precipitation_probability: [], precipitation: [], wind_speed_10m: [], uv_index: [], weather_code: [], temperature_2m: [] };
  for (let d = 0; d < 2; d++) for (let h = 0; h < 24; h++) { const x = fn(d, h); t.push(`2026-10-${21 + d}T${String(h).padStart(2, "0")}:00`);
    o.apparent_temperature.push(x.a); o.temperature_2m.push(x.a); o.precipitation_probability.push(x.p); o.precipitation.push(x.r); o.wind_speed_10m.push(x.w); o.uv_index.push(x.u); o.weather_code.push(x.c); }
  return o; }
const hot = day(0, (d, h) => ({ a: h >= 10 && h <= 17 ? 33 : 21, p: 0, r: 0, w: 8, u: h >= 10 && h <= 16 ? 9 : 1, c: 0 }));
const hours = W.hoursOf(hot);
ok("hoursOf parses 48 hours with hour numbers", hours.length === 48 && hours[14].hr === 14 && hours[14].k === "2026-10-21T14:00");
let p = W.pick(hours, new Date(2026, 9, 21, 13, 20));
ok("hot afternoon: best hour is outside the hot 10:00-17:00 block (first cool hour is 18:00)", p.best && p.best.hr === 18, p.best && p.best.hr);
ok("hot afternoon: not 'good now'", W.verdict(p, new Date(2026, 9, 21, 13, 20)).title.indexOf("now") < 0, W.verdict(p, new Date(2026, 9, 21, 13, 20)).title);
const mild = W.hoursOf(day(0, () => ({ a: 13, p: 5, r: 0, w: 9, u: 2, c: 1 })));
p = W.pick(mild, new Date(2026, 9, 21, 9, 5));
ok("mild day at 09:05: good now", W.verdict(p, new Date(2026, 9, 21, 9, 5)).title === "Good time to run now", W.verdict(p, new Date(2026, 9, 21, 9, 5)).title);
p = W.pick(mild, new Date(2026, 9, 21, 23, 10));
ok("23:10 (outside run window): best is tomorrow morning, says so", /tomorrow/.test(W.verdict(p, new Date(2026, 9, 21, 23, 10)).title) && p.best.k.startsWith("2026-10-22"), W.verdict(p, new Date(2026, 9, 21, 23, 10)));
const storm = W.hoursOf(day(0, () => ({ a: 14, p: 90, r: 4, w: 30, u: 1, c: 95 })));
p = W.pick(storm, new Date(2026, 9, 21, 10, 0));
const v = W.verdict(p, new Date(2026, 9, 21, 10, 0));
ok("storm all day: poor verdict suggests a walk or indoor session", v.lvl === "bad" && /walk or indoor/.test(v.title), v);
ok("storm notes warn about thunderstorm", W.notes(p.best)[0].indexOf("Thunderstorm") === 0, W.notes(p.best));
ok("notes capped at two", W.notes({ a: 35, p: 80, r: 2, w: 50, u: 10, c: 0 }).length === 2);
ok("temperature units", W.fmtT(20, "c") === "20°" && W.fmtT(20, "f") === "68°");
ok("empty forecast gives a safe verdict", W.verdict(W.pick([], new Date()), new Date()).lvl === "bad");
console.log(`\n${n - bad}/${n} passed`); process.exit(bad ? 1 : 0);

/* Arya Fit v98: Coach engine. Pure logic (no DOM, no app globals), tested by tests/coachcalc.test.js.
   analyze()    : turns the person's history into a few numbers (days since last activity, adherence, good weeks in a row).
   recommend()  : picks the mode for the next 7 days and explains why.
   buildWeek()  : turns the mode into per-day instructions (keep / rest, run level, sets per exercise).
   Rules are conservative, general fitness guidance (not medical advice): after a long break come back with fewer sessions,
   fewer sets and easier run/walk steps, then rebuild; raise load by about one set at most when the last weeks were solid; lighten after a
   rough patch (missed days are never treated as failure); a lighter week after four solid weeks. */
(function (root) {
  "use strict";
  var RESET = { start: 1, restart: 1, comeback: 1, easeback: 1 };

  function num(x) { return typeof x === "number" && isFinite(x); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pct(x) { return Math.round(x * 100) + "%"; }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }

  function lastReset(log) {
    var r = null;
    (log || []).forEach(function (e) { if (e && RESET[e.mode] && num(e.d) && (r === null || e.d > r)) r = e.d; });
    return r;
  }
  function lastMode(log) {
    var r = null;
    (log || []).forEach(function (e) { if (e && num(e.d) && (r === null || e.d >= r.d)) r = e; });
    return r ? r.mode : null;
  }

  /* h.days: [{d (day number), plan (0/1 a strength session was planned), done (0..1 share finished), act (0/1 any workout or run), km}] */
  function analyze(h, today) {
    var days = ((h && h.days) || []).filter(function (x) { return x && num(x.d) && x.d <= today; });
    var lastAct = null, first = null;
    days.forEach(function (x) {
      if (first === null || x.d < first) first = x.d;
      if (x.act && (lastAct === null || x.d > lastAct)) lastAct = x.d;
    });
    function win(a, b) {
      var p = 0, dn = 0;
      days.forEach(function (x) { if (x.d >= a && x.d <= b && x.plan) { p++; dn += clamp(x.done || 0, 0, 1); } });
      return { p: p, dn: dn };
    }
    var anchor = lastReset(h && h.log);
    var from = today - 14;
    if (anchor !== null && anchor > from) from = anchor;       /* a break must not count against the weeks after it */
    var w = win(from, today - 1);
    var weeks = [], good = 0, run = true;
    for (var k = 0; k < 4; k++) {
      var wk = win(today - 7 * (k + 1), today - 7 * k - 1);
      var v = wk.p >= 2 ? wk.dn / wk.p : null;
      weeks.push(v);
      if (run && v !== null && v >= 0.85) good++; else run = false;
    }
    return {
      known: days.length, first: first, lastAct: lastAct,
      gap: lastAct === null ? null : today - lastAct,
      adh: w.p >= 3 ? w.dn / w.p : null, planned: w.p, done: Math.round(w.dn * 10) / 10,
      weeks: weeks, goodWeeks: good, anchor: anchor
    };
  }

  /* o: {today, natural (strength sessions in a normal week)} ; h: {lastLevel, peakLevel, maxLevel, runsRecent, perf:{up,down,same}, log} */
  function recommend(a, h, o) {
    o = o || {}; h = h || {};
    var today = num(o.today) ? o.today : 0;
    var nat = clamp(Math.round(o.natural || 5), 2, 6);
    var maxL = Math.max(0, Math.round(h.maxLevel || 0));
    var ll = num(h.lastLevel) ? clamp(Math.round(h.lastLevel), 0, maxL) : null;
    var peak = num(h.peakLevel) ? clamp(Math.round(h.peakLevel), 0, maxL) : (ll === null ? 0 : ll);
    var perf = h.perf || {};
    var declining = (perf.down || 0) >= 2 && (perf.down || 0) > (perf.up || 0);
    var lm = lastMode(h.log);
    var rec = { mode: "hold", title: "", sessions: nat, delta: 0, top: 0, capFirst: 0, capAll: 0, firstDelta: 0, level: ll === null ? 0 : ll, reasons: [], gap: a.gap, adh: a.adh };
    var R = rec.reasons, adhTxt = a.adh === null ? "" : a.done + " of " + a.planned + " planned sessions done";

    if (!a.known || a.lastAct === null) {
      rec.mode = "start"; rec.title = "Gentle first week";
      rec.sessions = Math.min(3, nat); rec.delta = -1; rec.capFirst = 2; rec.level = 0;
      R.push("Not enough history yet, so the coach starts light and learns from what you do.");
      R.push(plural(rec.sessions, "session") + " this week with one set less, and the first session capped at 2 sets.");
    } else if (a.gap >= 28) {
      rec.mode = "restart"; rec.title = "Fresh restart";
      rec.sessions = Math.min(3, nat); rec.delta = -2; rec.capAll = 2; rec.capFirst = 2; rec.level = 0;
      R.push("No workouts or runs for " + plural(a.gap, "day") + ". Starting over gently is the fastest safe way back.");
      R.push(plural(rec.sessions, "session") + ", no more than 2 sets per exercise, run/walk intervals back at the first level.");
      R.push("Each following week the coach adds a little as long as you keep showing up.");
    } else if (a.gap >= 10) {
      rec.mode = "comeback"; rec.title = "Welcome back";
      rec.sessions = Math.min(3, nat); rec.delta = -1; rec.capFirst = 2; rec.level = Math.max(0, (ll === null ? 0 : ll) - 1);
      R.push("You had " + plural(a.gap, "day") + " without a workout or run. Your body is rested, not behind.");
      R.push(plural(rec.sessions, "session") + " this week, one set less per exercise, and the first session capped at 2 sets.");
      if (ll !== null && rec.level < ll) R.push("Run/walk intervals go back one level.");
      R.push("If this week feels good, next week returns toward your full plan.");
    } else if (a.gap >= 5) {
      rec.mode = "easeback"; rec.title = "Easing back in";
      rec.sessions = Math.max(3, nat - 1); rec.delta = 0; rec.firstDelta = -1; rec.level = ll === null ? 0 : ll;
      R.push(plural(a.gap, "day") + " since your last activity. A short break needs only a small step down.");
      R.push("First session has one set less, then the normal plan with " + plural(rec.sessions, "session") + ".");
    } else if (a.anchor !== null && today - a.anchor <= 14 && (a.adh === null || a.adh >= 0.5) && lm !== "rebuild" && lm !== "progress") {
      rec.mode = "rebuild"; rec.title = "Back in rhythm";
      rec.sessions = nat; rec.delta = 0; rec.level = clamp(Math.min(peak, (ll === null ? 0 : ll) + 1), 0, maxL);
      R.push("You came back after a break and kept going" + (adhTxt ? " (" + adhTxt + ")" : "") + ".");
      R.push("Full session count and original sets again. Run/walk intervals step up toward where you were.");
    } else if (a.goodWeeks >= 4 && lm !== "deload") {
      rec.mode = "deload"; rec.title = "Lighter week";
      rec.sessions = nat; rec.delta = -1; rec.level = ll === null ? 0 : ll;
      R.push("Four solid weeks in a row. A lighter week lets your body catch up before the next push.");
      R.push("One set less per exercise, same sessions, same run/walk level.");
    } else if (a.adh === null) {
      rec.mode = "hold"; rec.title = "Same again";
      R.push("Not enough recent sessions to judge, so the plan stays as it is.");
    } else if (a.adh >= 0.85 && !declining) {
      rec.mode = "progress"; rec.title = "Step up";
      rec.top = 1;
      rec.level = (ll !== null && (h.runsRecent || 0) > 0) ? clamp(ll + 1, 0, maxL) : (ll === null ? 0 : ll);
      R.push("Strong two weeks: " + adhTxt + " (" + pct(a.adh) + ").");
      R.push("+1 set on the first two exercises of each session" + (rec.level > (ll === null ? 0 : ll) ? ", and run/walk intervals one step harder." : "."));
    } else if (a.adh >= 0.5 || (a.adh >= 0.85 && declining)) {
      rec.mode = "hold"; rec.title = "Same again";
      R.push("Last two weeks: " + adhTxt + " (" + pct(a.adh) + "). Same load again to settle in.");
      if (declining) R.push("A few lifts went down recently, so no increase this time.");
    } else {
      rec.mode = "lighten"; rec.title = "Lighter, to keep the habit";
      rec.sessions = Math.max(2, nat - 1); rec.delta = -1;
      R.push("Last two weeks: " + adhTxt + " (" + pct(a.adh) + "). Life happens, and a smaller week is still a win.");
      R.push(plural(rec.sessions, "session") + " with one set less per exercise.");
    }
    return rec;
  }

  /* days: [{d, wk, kind:"strength"|"mobility"|"rest", base:[sets per exercise], circuit, locked}] -> per-day instructions */
  function buildWeek(rec, days) {
    var strength = days.filter(function (x) { return x.kind === "strength" && !x.locked; });
    var n = strength.length, S = clamp(rec.sessions, 0, n), keepIdx = {};
    if (S >= n) { for (var i = 0; i < n; i++) keepIdx[i] = 1; }
    else if (S === 1) keepIdx[0] = 1;
    else if (S > 1) { for (var j = 0; j < S; j++) keepIdx[Math.round(j * (n - 1) / (S - 1))] = 1; }
    var firstDone = false, byD = {};
    strength.forEach(function (x, idx) { byD[x.d] = idx; });
    return days.map(function (x) {
      if (x.locked) return { d: x.d, skip: true };
      if (x.kind !== "strength") return { d: x.d, keep: true, level: rec.level, sets: null };
      var idx = byD[x.d];
      if (!keepIdx[idx]) return { d: x.d, keep: false };
      var first = !x.circuit && !firstDone; if (!x.circuit) firstDone = true;   /* a circuit has no sets to cap, so the gentle first session is the first one that does */
      var sets = null;
      if (!x.circuit) {
        sets = (x.base || []).map(function (b, k) {
          if (!(b >= 1)) return b;
          var s = b + rec.delta + (k < 2 ? rec.top : 0) + (first ? rec.firstDelta : 0);
          s = clamp(s, 1, 5);
          if (rec.capAll) s = Math.min(s, rec.capAll);
          if (first && rec.capFirst) s = Math.min(s, rec.capFirst);
          return s;
        });
      }
      return { d: x.d, keep: true, level: rec.level, sets: sets };
    });
  }

  var api = { analyze: analyze, recommend: recommend, buildWeek: buildWeek, RESET: RESET };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.AxCoach = api;
})(typeof window !== "undefined" ? window : this);

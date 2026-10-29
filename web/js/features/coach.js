/* Arya Fit v98: Smart week (coach), app side. The rules live in coachcalc.js (pure, tested).
   Reads everything the app knows (all plans' ticks, runs, workout time, rep logs), asks the engine for the next 7 days and, only when the
   person taps Apply, writes it with the app's own mechanisms: plan.schedMap (which workout and run level a day uses, -1 = rest) and
   plan.workoutEdits ({sets}). Nothing outside those days changes. Undo restores the exact previous schedule and edits.
   Own edits win: an exercise the person edited by hand is never overwritten. Missed days are never treated as failure. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var C = window.AxCoach;
  if (!C) return;

  function ed(y, m, d) { return Math.round(Date.UTC(y, m, d) / 864e5); }
  function edDate(dt) { return ed(dt.getFullYear(), dt.getMonth(), dt.getDate()); }
  function key(i, id) { return i + ":" + id; }
  function coachOf(pe) { pe.coach = pe.coach && typeof pe.coach === "object" ? pe.coach : {}; pe.coach.log = Array.isArray(pe.coach.log) ? pe.coach.log : []; pe.coach.owned = pe.coach.owned && typeof pe.coach.owned === "object" ? pe.coach.owned : {}; return pe.coach; }
  function isCore(id) { return id.charAt(0) === "e" || id === "j"; }

  /* The app auto-closes every missed day as "rest" (x=1) and a day with any tick, even only a habit like water, as "partly done" (x=2).
     So x alone proves nothing. Real activity = a run/GPS/workout time, a ticked exercise or run, or a day closed as done by hand with nothing ticked. */
  function tickInfo(stx, i) {
    var pre = i + ":", core = 0, any = 0;
    for (var k in stx) { if (k.indexOf(pre) === 0 && stx[k]) { any++; if (isCore(k.slice(pre.length))) core++; } }
    return { core: core, any: any };
  }
  function dayActivity(stx, i) {
    if ((stx["g" + i] || 0) > 0 || (stx["r" + i] || 0) > 0 || (stx["w" + i] || 0) > 0) return true;
    var t = tickInfo(stx, i);
    if (t.core > 0) return true;
    return stx["x" + i] === 2 && t.any === 0;
  }

  function gather() {
    var pe = axPlan(); if (!pe) return null;
    var sN = edDate(START), ti = todayIdx(), days = {}, i;
    for (i = 0; i <= ti && i < ND; i++) {
      var src = axSrc(i), t = src < 0 ? null : T[wdk(src)], core = 0, got = 0, list = [];
      try { list = items(i); } catch (e) { list = []; }
      list.forEach(function (x) { if (isCore(String(x[1]))) { core++; if (st[key(i, x[1])]) got++; } });
      /* a strength day in the schedule counts as planned even if auto-close turned it into "rest"; days the coach itself set to rest have no template and are not counted */
      var planned = t && !t.r && !t.m && core > 0 ? 1 : 0, manual = st["x" + i] === 2 && tickInfo(st, i).any === 0;
      days[sN + i] = { d: sN + i, plan: planned, done: planned ? (manual ? 1 : got / core) : 0, act: dayActivity(st, i) ? 1 : 0, km: (st["g" + i] || 0) / 1000 };
    }
    /* other plans only add "was active that day" (so a break is measured across plans) */
    Object.keys(APP.plans || {}).forEach(function (id) {
      if (id === APP.active) return;
      var e = APP.plans[id], m = e && e.plan && /^(\d+)-(\d+)-(\d+)$/.exec(e.plan.start || ""); if (!m) return;
      var s2 = ed(+m[1], +m[2] - 1, +m[3]), n = (e.plan.weeks || 4) * 7 + 60;
      for (var j = 0; j < n; j++) {
        if (s2 + j > sN + ti) break;
        if (dayActivity(e.st || {}, j)) { var cur = days[s2 + j]; if (cur) cur.act = 1; else days[s2 + j] = { d: s2 + j, plan: 0, done: 0, act: 1, km: 0 }; }
      }
    });
    /* run levels (which interval week the person actually ran at) */
    var lastLevel = null, peak = 0, runsRecent = 0, maxL = Math.max(0, NW - 1);
    for (i = 0; i <= ti && i < ND; i++) {
      if ((st["g" + i] || 0) > 0 || st[key(i, "j")]) {
        var lv = Math.min(maxL, Math.floor(Math.max(0, axSrc(i)) / 7));
        lastLevel = lv; if (i >= ti - 42) peak = Math.max(peak, lv); if (i >= ti - 14) runsRecent++;
      }
    }
    /* lifts: compare the last two logged sessions of each exercise */
    var perf = { up: 0, down: 0, same: 0 }, SL = PR.setLog && typeof PR.setLog === "object" ? PR.setLog : {};
    Object.keys(SL).forEach(function (name) {
      var byDay = SL[name]; if (!byDay || typeof byDay !== "object") return;
      var ds = Object.keys(byDay).map(Number).filter(function (n) { return n >= ti - 20 && n <= ti && Array.isArray(byDay[n]); }).sort(function (a, b) { return a - b; });
      if (ds.length < 2) return;
      var sum = function (n) { return byDay[n].reduce(function (s, v) { return s + (+v || 0); }, 0); };
      var a = sum(ds[ds.length - 2]), b = sum(ds[ds.length - 1]); if (!(a > 0)) return;
      if (b > a * 1.05) perf.up++; else if (b < a * 0.95) perf.down++; else perf.same++;
    });
    var nat = 0; for (i = 0; i < 7; i++) { var tt = T[i]; if (tt && !tt.r && !tt.m) nat++; }
    return { days: Object.keys(days).map(function (k2) { return days[k2]; }), perf: perf, lastLevel: lastLevel, peakLevel: peak, maxLevel: maxL, runsRecent: runsRecent, log: coachOf(pe).log, natural: nat || 5 };
  }

  /* onboarding: is this exercise in one of the plan's weak patterns? (plans without gen have none) */
  var WPM = { push: ["push"], pull: ["pull"], legs: ["squat", "hinge"], core: ["core"] };
  function isWeakEx(name, weak) {
    if (!weak || !weak.length || !window.AxExDb) return false;
    var x = window.AxExDb.byName(name); if (!x) return false;
    return weak.some(function (w) { return WPM[w] && WPM[w].indexOf(x.p) >= 0; });
  }

  function hasActivity(d) { return d < ND && dayActivity(st, d); }

  function compute() {
    var pe = axPlan(); if (!pe || !T.length) return null;
    var h = gather(), tN = edDate(new Date()), ti = todayIdx(), a = C.analyze(h, tN), rec = C.recommend(a, h, { today: tN, natural: h.natural });
    var rem = ((ti % 7) + 7) % 7, d0 = (a.gap === null || a.gap >= 5) ? ti : (rem >= 5 ? ti - rem + 7 : ti);
    if (d0 < 0) d0 = 0;
    var weakPats = ((APP.plans[APP.active] || {}).gen || {}).weak || [];
    var level = Math.max(0, Math.min(NW - 1, rec.level)); while (level > 0 && isL(level)) level--;
    rec.level = level;
    var days = [];
    for (var d = d0; d < d0 + 7; d++) {
      var wkd = (START.getDay() + d) % 7, t = T[wkd];
      days.push({ d: d, wk: wkd, kind: !t || t.r ? "rest" : (t.m ? "mobility" : "strength"), base: t ? t.x.map(function (e) { return e[1]; }) : [], weak: t ? t.x.map(function (e) { return isWeakEx(e[0], weakPats); }) : [], circuit: !!(t && t.c), locked: d < ti || hasActivity(d) });
    }
    return { pe: pe, h: h, a: a, rec: rec, d0: d0, ti: ti, tN: tN, plan: C.buildWeek(rec, days), days: days };
  }

  function srcFor(d, level) { return (d % 7) + 7 * level; }

  function apply(p) {
    var pe = p.pe, co = coachOf(pe), rec = p.rec;
    var oldMap = Array.isArray(pe.schedMap) ? pe.schedMap.slice() : null, oldND = ND;
    var map = oldMap ? oldMap.slice() : Array.from({ length: ND }, function (_, n) { return n; });
    while (map.length < p.d0 + 7) map.push(map.length);
    var edits = pe.workoutEdits = pe.workoutEdits && typeof pe.workoutEdits === "object" ? pe.workoutEdits : {};
    var prevEdits = {}, prevOwned = JSON.parse(JSON.stringify(co.owned));
    p.plan.forEach(function (x) { prevEdits[x.d] = edits[String(x.d)] ? JSON.parse(JSON.stringify(edits[String(x.d)])) : null; });
    p.plan.forEach(function (x, idx) {
      if (x.skip) return;
      var dk = String(x.d), day = edits[dk] || {};
      Object.keys(co.owned).forEach(function (o) { if (o.indexOf(x.d + ":") === 0) { delete day[o.split(":")[1]]; delete co.owned[o]; } });
      if (x.keep === false) map[x.d] = -1;
      else {
        map[x.d] = srcFor(x.d, x.level);
        var base = p.days[idx].base;
        if (x.sets) x.sets.forEach(function (n, k) {
          if (!(base[k] >= 1) || n === base[k] || day[k]) return;       /* user's own edit wins; unchanged sets need no edit */
          day[k] = { sets: n }; co.owned[x.d + ":" + k] = 1;
        });
      }
      if (Object.keys(day).length) edits[dk] = day; else delete edits[dk];
    });
    pe.schedMap = map;
    if (map.length > ND) ND = map.length;
    co.log.push({ d: p.tN, mode: rec.mode, week: p.d0 });
    if (co.log.length > 30) co.log = co.log.slice(-30);
    co.last = { d0: p.d0, mode: rec.mode, title: rec.title, undo: { sched: oldMap, nd: oldND, edits: prevEdits, owned: prevOwned, logLen: co.log.length - 1 } };
    save(); try { hx("ok"); } catch (e) { /* no haptics */ }
    render(); try { if (typeof home === "function") home(); } catch (e) { /* ignore */ }
    toast("Smart week applied. You can undo it in Smart week.");
  }

  function undo() {
    var pe = axPlan(); if (!pe) return; var co = coachOf(pe), u = co.last && co.last.undo; if (!u) return;
    var edits = pe.workoutEdits = pe.workoutEdits || {};
    Object.keys(u.edits).forEach(function (d) { if (u.edits[d]) edits[d] = u.edits[d]; else delete edits[d]; });
    pe.schedMap = u.sched || undefined; ND = u.nd; co.owned = u.owned || {};
    co.log = co.log.slice(0, u.logLen); delete co.last;
    save(); render(); try { if (typeof home === "function") home(); } catch (e) { /* ignore */ }
    toast("Smart week undone.");
  }

  function dayLine(p, x, idx) {
    var wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][(START.getDay() + x.d) % 7], lab = wd + " " + dl(x.d), t = T[(START.getDay() + x.d) % 7], what;
    if (x.skip) what = x.d < p.ti ? "past" : "already started, left as is";
    else if (x.keep === false) what = "Rest";
    else if (!t || t.r) what = "Rest";
    else {
      what = t.n;
      if (t.c && (p.rec.delta < 0 || p.rec.firstDelta < 0)) what += " (circuit: one round fewer)";
      if (x.sets) { var b = p.days[idx].base, ch = x.sets.filter(function (n, k) { return b[k] >= 1 && n !== b[k]; }).length; what += ch ? " (" + x.sets.filter(function (n) { return n >= 1; }).join("-") + " sets)" : " (normal sets)"; }
    }
    return '<p style="margin:6px 0;display:flex;gap:10px"><b style="min-width:92px">' + esc(lab) + "</b><span>" + esc(what) + "</span></p>";
  }

  function openSheet() {
    var p = compute();
    if (!p) { toast("Open a plan first."); return; }
    var co = coachOf(p.pe), ex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var why = p.rec.reasons.map(function (r) { return "<p>" + esc(r) + "</p>"; }).join("");
    var rows = p.plan.map(function (x, i) { return dayLine(p, x, i); }).join("");
    var undoBtn = co.last && co.last.undo ? '<button class="ax-btn" type="button" id="ax-coach-undo" style="margin-top:8px">Undo the last smart week</button>' : "";
    axSheet("Smart week: " + p.rec.title,
      '<p class="ax-sub">Built from your past workouts, runs and logged sets. Nothing changes until you tap Apply.</p>' +
      '<div class="ax-card"><p class="ax-cap">WHY THIS WEEK</p>' + why + "</div>" +
      '<div class="ax-card"><p class="ax-cap">THE NEXT 7 DAYS, FROM ' + esc(ex[(START.getDay() + p.d0) % 7].toUpperCase() + " " + dl(p.d0).toUpperCase()) + "</p>" + rows + "</div>" +
      '<div style="display:flex;gap:8px"><button class="ax-btn" type="button" id="ax-coach-no">Not now</button><button class="ax-btn a" type="button" id="ax-coach-yes">Apply this week</button></div>' + undoBtn +
      '<p class="ax-sub" style="margin-top:12px">General fitness guidance, not medical advice. If something hurts, stop and ask a professional. Exercises you edited by hand are never changed.</p>');
    $("ax-coach-no").onclick = axSheetX;
    $("ax-coach-yes").onclick = function () { axSheetX(); apply(p); };
    var u = $("ax-coach-undo"); if (u) u.onclick = function () { axSheetX(); undo(); };
  }

  /* ---------- Home card ---------- */
  function state() {
    var p = compute(); if (!p) return null;
    var co = coachOf(p.pe), last = co.last, ti = p.ti, tN = p.tN;
    if (last && ti >= last.d0 && ti <= last.d0 + 6) return { kind: "active", p: p, last: last };
    if (co.dismiss === tN) return null;
    var reset = last && C.RESET[last.mode];
    var already = last && (reset ? ti - last.d0 < 7 : last.d0 >= p.d0);
    if (already) return null;
    var rem = ((ti % 7) + 7) % 7;
    var due = (p.a.gap !== null && p.a.gap >= 5) || p.a.lastAct === null && p.a.known > 0 || rem >= 5 || ND - ti <= 7;
    return due ? { kind: "offer", p: p } : null;
  }

  function renderCard() {
    try {
      var hb = $("ax-htoday") || $("ax-hbrain"); if (!hb || !hb.parentNode) return;   /* right above today's plan: it changes what today should be */
      var box = $("ax-coach-card"), s = null;
      try { s = state(); } catch (e) { s = null; }
      if (!s) { if (box) box.remove(); return; }
      if (!box) { box = document.createElement("div"); box.id = "ax-coach-card"; box.className = "ax-card"; }
      if (box.nextSibling !== hb) hb.parentNode.insertBefore(box, hb);
      if (s.kind === "active") {
        box.innerHTML = '<p class="ax-cap">SMART WEEK · ACTIVE</p><p style="margin:4px 0 10px"><b>' + esc(s.last.title) + "</b>. Your week was built from your history (from " + esc(dl(s.last.d0)) + ").</p>" +
          '<div style="display:flex;gap:8px"><button class="ax-btn" type="button" id="ax-coach-det">Details</button><button class="ax-btn" type="button" id="ax-coach-un">Undo</button></div>';
        $("ax-coach-det").onclick = openSheet; $("ax-coach-un").onclick = undo;
      } else {
        box.innerHTML = '<p class="ax-cap">SMART WEEK</p><p style="margin:4px 0 4px"><b>' + esc(s.p.rec.title) + "</b></p><p style=\"margin:0 0 10px\">" + esc(s.p.rec.reasons[0] || "") + "</p>" +
          '<div style="display:flex;gap:8px"><button class="ax-btn" type="button" id="ax-coach-no2">Not now</button><button class="ax-btn a" type="button" id="ax-coach-see">See my week</button></div>';
        $("ax-coach-see").onclick = openSheet;
        $("ax-coach-no2").onclick = function () { var co = coachOf(axPlan()); co.dismiss = s.p.tN; save(); renderCard(); };
      }
    } catch (e) { /* the card is optional; never break Home */ }
  }

  var _sb = window.smartBrainUI;
  if (typeof _sb === "function") {
    window.smartBrainUI = function () { var r = _sb.apply(this, arguments); renderCard(); return r; };
  }
  function wire() { var b = $("ax-coach-open"); if (b) b.onclick = openSheet; renderCard(); }
  window.axCoach = { compute: compute, open: openSheet, apply: apply, undo: undo, state: state };
  if (document.readyState !== "loading") wire(); else document.addEventListener("DOMContentLoaded", wire);
})();

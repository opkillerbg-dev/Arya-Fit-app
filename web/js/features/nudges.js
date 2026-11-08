/* v140: Nudges. Hydration, morning check-in, move break, evening walk, workout-still-open, wind-down, weekly summary and comeback notifications.
   Same mechanism as the daily reminder (remind() in run-extras.js): the next 3 days are scheduled with LocalNotifications and re-planned whenever the app opens or is left.
   Nothing is scheduled while the master switch is off. Weekly and comeback ones look further ahead. Config lives in PR.nud (backed up with the other prefs).
   build() is pure (no DOM, no storage) so it can be unit tested: tests/nudges.test.js. */
(function (w) {
  "use strict";
  var BASE = 3000, H = 3, SLOTS = 30;
  var DEF = {
    on: 1,
    hy: { on: 1, n: 2, a: "09:00", b: "21:00" },
    ci: { on: 1, t: "08:00" },
    mv: { on: 0, t: "15:30" },
    wk: { on: 1, t: "18:30" },
    nd: { on: 1, t: "20:30" },
    wd: { on: 0, t: "22:30" },
    ws: { on: 1, t: "19:00" },
    cb: { on: 1 }
  };
  var CH = {
    hy: ["nud_hy", "Hydration", 2, "Water reminders through the day"],
    ci: ["nud_ci", "Morning check-in", 3, "Sleep, energy and soreness check"],
    mv: ["nud_mv", "Move breaks", 2, "A short stretch or walk break"],
    wk: ["nud_wk", "Evening walk", 3, "A nudge toward your step goal"],
    nd: ["nud_nd", "Workout still open", 3, "Evening heads-up when today is not done"],
    wd: ["nud_wd", "Wind-down", 2, "Sleep and recovery reminder"],
    ws: ["nud_ws", "Weekly summary", 3, "Sunday summary of your week"],
    cb: ["nud_cb", "Comeback", 3, "Gentle message after a few days away"]
  };
  var MSG = {
    hy: [["Water break", "A glass of water keeps energy and recovery on track."], ["Sip some water", "Small sips add up. Drink a glass now."], ["Hydration check", "Your muscles are mostly water. Top up."], ["Time for a glass", "Quick glass of water, then carry on."]],
    mv: [["Move break", "Stand up, roll your shoulders, walk for a minute."], ["Stretch break", "One minute of stretching beats another hour of sitting."]],
    wd: [["Wind down", "Screens down soon. Good sleep is when your body recovers."], ["Recovery time", "Dim the lights and ease off. Sleep is part of the plan."]]
  };

  function isHM(s) { return typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s); }
  function hm(s) { return isHM(s) ? (+s.slice(0, 2)) * 60 + (+s.slice(3)) : -1; }
  function flag(v, d) { return v === 0 || v === 1 ? v : d; }

  /** Returns a full, valid config. Unknown or broken fields fall back to the defaults. */
  function clean(x) {
    x = x && typeof x === "object" ? x : {};
    var o = { on: flag(x.on, DEF.on) }, k;
    var h = x.hy && typeof x.hy === "object" ? x.hy : {};
    o.hy = { on: flag(h.on, DEF.hy.on), n: h.n === 1 || h.n === 2 || h.n === 3 ? h.n : DEF.hy.n, a: isHM(h.a) ? h.a : DEF.hy.a, b: isHM(h.b) ? h.b : DEF.hy.b };
    if (hm(o.hy.b) <= hm(o.hy.a)) { o.hy.a = DEF.hy.a; o.hy.b = DEF.hy.b; }
    ["ci", "mv", "wk", "nd", "wd", "ws"].forEach(function (key) {
      var s = x[key] && typeof x[key] === "object" ? x[key] : {};
      o[key] = { on: flag(s.on, DEF[key].on), t: isHM(s.t) ? s.t : DEF[key].t };
    });
    k = x.cb && typeof x.cb === "object" ? x.cb : {};
    o.cb = { on: flag(k.on, DEF.cb.on) };
    return o;
  }

  function at(now, k, mins) { return new Date(now.getFullYear(), now.getMonth(), now.getDate() + k, Math.floor(mins / 60), mins % 60, 0, 0); }
  function pick(list, n) { return list[Math.abs(n) % list.length]; }
  function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  /** Pure planner. x = {now:Date, day:function(k)->{work,done,name}, ciDone:bool, steps:number (-1 unknown), goal:number}. Returns [{id,key,title,body,at}] */
  function build(c, x) {
    var out = [], now = x.now, floor = now.getTime() + 20000, k, m, sl, d;
    function put(id, key, title, body, when) { if (when.getTime() > floor) out.push({ id: id, key: key, title: title, body: body, at: when }); }
    if (!c || !c.on) return out;
    for (k = 0; k < H; k++) {
      d = x.day(k) || {};
      if (c.hy.on) {
        sl = 0;
        for (m = hm(c.hy.a); m <= hm(c.hy.b) && sl < 12; m += c.hy.n * 60, sl++) { var hy = pick(MSG.hy, k * 5 + sl); put(BASE + k * SLOTS + sl, "hy", hy[0], hy[1], at(now, k, m)); }
      }
      if (c.ci.on && !(k === 0 && x.ciDone)) put(BASE + k * SLOTS + 12, "ci", "Morning check-in", "30 seconds: sleep, energy, soreness. Get today's Full, Light, Walk or Rest call.", at(now, k, hm(c.ci.t)));
      if (c.mv.on) { var mv = pick(MSG.mv, k); put(BASE + k * SLOTS + 13, "mv", mv[0], mv[1], at(now, k, hm(c.mv.t))); }
      if (c.wk.on && !(k === 0 && x.steps >= 0 && x.steps >= x.goal)) put(BASE + k * SLOTS + 14, "wk", "Evening walk?", "A 15-minute walk gets you closer to your " + num(x.goal) + " steps.", at(now, k, hm(c.wk.t)));
      if (c.nd.on && d.work && !d.done) put(BASE + k * SLOTS + 15, "nd", "Workout still open", (d.name || "Your workout") + ". Even 10 minutes counts, or close the day as rest.", at(now, k, hm(c.nd.t)));
      if (c.wd.on) { var wd = pick(MSG.wd, k); put(BASE + k * SLOTS + 16, "wd", wd[0], wd[1], at(now, k, hm(c.wd.t))); }
    }
    if (c.ws.on) {
      for (k = 0; k < 8; k++) {
        var s = at(now, k, hm(c.ws.t));
        if (s.getDay() === 0 && s.getTime() > floor) { put(BASE + 500, "ws", "Your week is ready", "See distance, workouts and streak in your weekly summary.", s); break; }
      }
    }
    if (c.cb.on) {
      put(BASE + 501, "cb", "No pressure", "A 10-minute walk is a fine restart. Rest days are normal.", at(now, 3, 18 * 60));
      put(BASE + 502, "cb", "Whenever you are ready", "Your plan waits and nothing is lost. Start small today.", at(now, 6, 18 * 60));
    }
    return out;
  }

  var api = { DEF: DEF, CH: CH, BASE: BASE, clean: clean, build: build, hm: hm };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  /* ---------- browser part ---------- */
  var busy = 0, ptimer = 0;
  function LNP() { try { return typeof LN !== "undefined" && LN ? LN : null; } catch (e) { return null; } }
  function cfg() { return clean(w.PR && w.PR.nud); }
  function key(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  function ctx() {
    var now = new Date(), t0 = w.todayIdx(), nd = w.ND;
    return {
      now: now,
      ciDone: !!(w.PR && w.PR.brain && w.PR.brain[key(now)] && Object.keys(w.PR.brain[key(now)]).length),
      steps: w.SS && w.SS.perm ? w.SS.today | 0 : -1,
      goal: w.sgoal ? w.sgoal() : 8000,
      day: function (k) {
        var i = t0 + k;
        if (i < 0 || i >= nd) return { work: false };
        var src = w.axSrc(i);
        if (src < 0 || w.st["x" + i] === 1) return { work: false };
        var cc = w.cnt(i), tt = w.T[w.wdk(src)];
        return { work: true, done: !!(cc[1] && cc[0] >= cc[1]) || w.st["x" + i] === 2, name: (tt && tt.n) || "Your workout" };
      }
    };
  }

  function mkChannels(keys) {
    var ln = LNP();
    keys.forEach(function (k) {
      var c = CH[k];
      try { ln.createChannel({ id: c[0], name: c[1], description: c[3], importance: c[2], visibility: 1, vibration: false }); } catch (e) { /* ignore */ }
    });
  }

  /** Cancels every nudge id, then schedules the plan. All calls are queued in the same tick so it still completes when the app is being left. */
  function plan() {
    var ln = LNP();
    if (!ln || busy) return;
    busy = 1;
    try {
      var ids = [], i;
      for (i = 0; i < 100; i++) ids.push({ id: BASE + i });
      ids.push({ id: BASE + 500 }, { id: BASE + 501 }, { id: BASE + 502 });
      ln.cancel({ notifications: ids });
      var c = cfg(), list = c.on ? build(c, ctx()) : [];
      if (list.length) {
        var used = {}; list.forEach(function (n) { used[n.key] = 1; });
        mkChannels(Object.keys(used));
        ln.schedule({ notifications: list.map(function (n) { return { id: n.id, channelId: CH[n.key][0], title: n.title, body: n.body, schedule: { at: n.at, allowWhileIdle: true } }; }) });
      }
    } catch (e) { /* ignore */ }
    busy = 0;
  }
  function planSoon() { clearTimeout(ptimer); ptimer = setTimeout(plan, 500); }

  function askPerm() { var ln = LNP(); try { ln && ln.requestPermissions(); } catch (e) { /* ignore */ } }

  function sendTest() {
    var ln = LNP();
    if (!ln) { w.toast("Notifications work in the phone app."); return; }
    askPerm(); mkChannels(["ci"]);
    try { ln.schedule({ notifications: [{ id: BASE + 599, channelId: CH.ci[0], title: "Test notification", body: "Nudges are working.", schedule: { at: new Date(Date.now() + 4000), allowWhileIdle: true } }] }); w.toast("Test arrives in a few seconds"); } catch (e) { /* ignore */ }
  }

  function sw(id, on) { return '<input class="sw2" type="checkbox" data-nd="' + id + '"' + (on ? " checked" : "") + ">"; }
  function tin(id, v) { return '<input type="time" class="tin" data-ndt="' + id + '" value="' + v + '" style="width:112px">'; }
  function item(id, title, sub, on, extra) {
    return '<div class="row" style="flex-wrap:wrap"><span style="flex:1;min-width:0"><b>' + title + "</b><em>" + sub + "</em></span>" + sw(id, on) +
      '<div class="ax-nd-x" data-ndx="' + id + '" style="flex-basis:100%;display:' + (on ? "flex" : "none") + ';gap:10px;align-items:center;flex-wrap:wrap">' + extra + "</div></div>";
  }

  function open() {
    var c = cfg(), h;
    h = '<div class="row"><span><b>Nudges</b><em>Master switch for everything below. The daily workout reminder and goal alert are separate.</em></span>' + sw("on", c.on) + "</div>" +
      item("hy", "Hydration", "Water reminders between the times you pick.", c.hy.on,
        '<select class="tin" data-ndn="hy" style="width:auto"><option value="1"' + (c.hy.n === 1 ? " selected" : "") + '>Every hour</option><option value="2"' + (c.hy.n === 2 ? " selected" : "") + '>Every 2 hours</option><option value="3"' + (c.hy.n === 3 ? " selected" : "") + ">Every 3 hours</option></select>" +
        '<span class="ax-cap">from</span>' + tin("hya", c.hy.a) + '<span class="ax-cap">to</span>' + tin("hyb", c.hy.b)) +
      item("ci", "Morning check-in", "Sleep, energy and soreness. Skipped once you have answered.", c.ci.on, tin("ci", c.ci.t)) +
      item("mv", "Move break", "One reminder to stand up and stretch.", c.mv.on, tin("mv", c.mv.t)) +
      item("wk", "Evening walk", "Nudge toward your step goal. Skipped once it is reached.", c.wk.on, tin("wk", c.wk.t)) +
      item("nd", "Workout still open", "Only on workout days that are not done yet.", c.nd.on, tin("nd", c.nd.t)) +
      item("wd", "Wind-down", "Sleep and recovery reminder.", c.wd.on, tin("wd", c.wd.t)) +
      item("ws", "Weekly summary", "Every Sunday.", c.ws.on, tin("ws", c.ws.t)) +
      item("cb", "Comeback", "Two gentle messages if you have not opened the app for 3 and 6 days. No guilt.", c.cb.on, "") +
      '<div class="row"><span><b>Send a test</b><em>Arrives in a few seconds.</em></span><button class="btn" type="button" data-ndtest="1">Test</button></div>' +
      '<p class="key" style="margin:10px 2px 0">Step counting keeps running in the background. Its Android notification is hidden. If you ever want to see it, turn on the &quot;Step counting (hidden)&quot; category in your phone&#39;s notification settings for this app.</p>';
    w.axSheet("Notifications", h);
    var box = document.getElementById("ax-shb");
    if (!box) return;
    function store(mut) { var n = cfg(); mut(n); w.PR.nud = n; w.save(); planSoon(); }
    [].forEach.call(box.querySelectorAll("[data-nd]"), function (e) {
      e.onchange = function () {
        var id = e.getAttribute("data-nd"), on = e.checked ? 1 : 0;
        store(function (n) { if (id === "on") n.on = on; else n[id].on = on; });
        var x = box.querySelector('[data-ndx="' + id + '"]'); if (x) x.style.display = on ? "flex" : "none";
        if (on) askPerm();
      };
    });
    [].forEach.call(box.querySelectorAll("[data-ndt]"), function (e) {
      e.onchange = function () {
        var id = e.getAttribute("data-ndt"), v = e.value;
        if (!isHM(v)) return;
        store(function (n) { if (id === "hya") n.hy.a = v; else if (id === "hyb") n.hy.b = v; else n[id].t = v; if (hm(n.hy.b) <= hm(n.hy.a)) { n.hy.a = DEF.hy.a; n.hy.b = DEF.hy.b; w.toast("Hydration end must be after the start"); } });
      };
    });
    [].forEach.call(box.querySelectorAll("[data-ndn]"), function (e) { e.onchange = function () { var v = +e.value; store(function (n) { n.hy.n = v; }); }; });
    var t = box.querySelector("[data-ndtest]"); if (t) t.onclick = sendTest;
  }

  function init() {
    var b = document.getElementById("ax-nudge-open");
    if (b) b.onclick = open;
    setTimeout(plan, 3000);
    document.addEventListener("visibilitychange", function () { if (document.hidden) plan(); });
  }
  api.plan = plan; api.open = open; api.ctx = ctx; api.cfg = cfg;
  w.AxNudge = api;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(typeof window !== "undefined" ? window : this);

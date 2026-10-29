/* Arya Fit v116: smart loading-screen gate (pure, also node).
   AxBootGate.create(opts) -> g.  Feed it what the browser reports; ask g.check(now) whether the app is stable enough to show.
   It learns the screen's frame time (60/90/120 Hz...) from the first frames, then looks at a rolling window (default 1 s):
     late frame  = took > 1.5 x frame time (one missed refresh)      hitch = took > 2.5 x frame time (two or more missed)
     busy        = a long task or timer delay (main thread blocked)
   Strict tier (first STRICT ms of visible time): at most 1 late frame, no hitch, no busy >= 50 ms, window full of frames.
   Relaxed tier (up to HARD ms): at most 3 late frames, no frame > 4 x frame time, no busy >= 120 ms.
   After HARD ms it says go (reason "timeout") so a weak phone never waits forever. Time only counts while the page is visible. */
(function (root) {
  "use strict";
  var SNAP = [1000 / 144, 1000 / 120, 1000 / 90, 1000 / 60, 1000 / 30];

  function create(o) {
    o = o || {};
    var WIN = o.win || 1000, STRICT = o.strict || 6000, HARD = o.hard || 11000, CAL = o.cal || 24;
    var frames = [], busy = [], cal = [], base = 0, last = 0, since = -1, vis = 0, firstT = -1;

    function snap(v) {
      for (var i = 0; i < SNAP.length; i++) if (Math.abs(v - SNAP[i]) / SNAP[i] < 0.12) return SNAP[i];
      return Math.max(6, Math.min(40, v));
    }
    function calibrate() {
      var s = cal.slice().sort(function (a, b) { return a - b; });
      var n = Math.max(1, Math.floor(s.length / 4)), t = 0;      /* mean of the fastest quarter: robust to early hitches */
      for (var i = 0; i < n; i++) t += s[i];
      base = snap(t / n);
    }
    function prune(now) {
      var lim = now - WIN * 2;
      while (frames.length && frames[0].t < lim) frames.shift();
      while (busy.length && busy[0].t < lim) busy.shift();
    }
    var g = {
      /* one animation frame; t = rAF timestamp in ms */
      frame: function (t) {
        if (firstT < 0) firstT = t;
        if (last) {
          var dt = t - last;
          if (dt > 1000) { g.reset(t); last = t; return; }       /* page was hidden or frozen: start the window again */
          vis += dt;
          if (!base) { cal.push(dt); if (cal.length >= CAL) calibrate(); }
          frames.push({ t: t, dt: dt });
        }
        last = t;
        if (since < 0) since = t;
        prune(t);
      },
      /* main thread was blocked for dur ms and it ended at time t */
      busy: function (t, dur) { busy.push({ t: t, dur: dur }); if (dur >= 50) since = t; },
      reset: function (t) { frames = []; busy = []; since = t == null ? -1 : t; last = 0; },
      visibleMs: function () { return vis; },
      base: function () { return base; },
      check: function (now) {
        var r = { ok: false, tier: "wait", reason: "", fps: 0, base: base, late: 0, hitch: 0, busy: 0, frames: 0, visible: Math.round(vis) };
        if (vis >= HARD) { r.ok = true; r.tier = "timeout"; r.reason = "timeout"; }
        if (!base) { r.reason = r.reason || "calibrating"; return r; }
        var relaxed = vis >= STRICT, from = now - WIN, i, f, n = 0, sum = 0;
        var lateAt = base * 1.5, hitchAt = base * (relaxed ? 4 : 2.5), busyAt = relaxed ? 120 : 50;
        for (i = 0; i < frames.length; i++) {
          f = frames[i]; if (f.t < from) continue;
          n++; sum += f.dt;
          if (f.dt > hitchAt) r.hitch++;
          if (f.dt > lateAt) r.late++;
        }
        for (i = 0; i < busy.length; i++) if (busy[i].t >= from && busy[i].dur >= busyAt) r.busy++;
        r.frames = n; r.fps = n ? Math.round(1000 * n / sum) : 0;
        var need = Math.floor(0.75 * WIN / base);
        var full = since >= 0 && now - since >= WIN;             /* a whole clean window has passed since the last reset or long task */
        var lateMax = relaxed ? 3 : 1;
        if (r.ok) return r;
        if (!full) { r.reason = "settling"; return r; }
        if (n < need) { r.reason = "starved"; return r; }
        if (r.hitch) { r.reason = "hitch"; return r; }
        if (r.late > lateMax) { r.reason = "late"; return r; }
        if (r.busy) { r.reason = "busy"; return r; }
        r.ok = true; r.tier = relaxed ? "relaxed" : "strict"; r.reason = "stable";
        return r;
      }
    };
    return g;
  }

  var api = { create: create };
  root.AxBootGate = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

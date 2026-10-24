/* Arya Fit v99: voice engine / voice / speed picker (Settings > Sound & feedback). Phone app only.
   The cues are spoken by Android's text-to-speech. Any installed engine can be used, so an open-source neural voice
   (SherpaTTS, VoxSherpa: Piper-style voices, offline) simply becomes the voice of every cue once it is chosen here.
   The native side (VoiceKit.java) stores the choice, falls back to the phone's default engine if the chosen one disappears,
   and ducks music while a cue plays. */
(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var box = $("ax-vx");
  if (!box) return;
  var ENG = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.RunEngine;
  if (!ENG || !ENG.voiceList || !ENG.voiceSet) { box.style.display = "none"; return; }
  function attr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function txt(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function opt(v, label, sel) { return '<option value="' + attr(v) + '"' + (sel ? " selected" : "") + ">" + txt(label) + "</option>"; }
  var busy = 0;

  function fill(d) {
    var engines = d.engines || [], found = false, h = opt("", "Phone default voice engine", !d.engine);
    engines.forEach(function (e) { var s = e.name === d.engine; if (s) found = true; h += opt(e.name, e.label || e.name, s); });
    if (d.engine && !found) h += opt(d.engine, d.engine + " (not installed, using default)", true);
    $("ax-ve").innerHTML = h;
    var voices = (d.voices || []).slice().sort(function (a, b) {
      if (!!a.net !== !!b.net) return a.net ? 1 : -1;                    /* offline voices first */
      var ea = a.lang.indexOf("en") === 0 ? 0 : 1, eb = b.lang.indexOf("en") === 0 ? 0 : 1;
      if (ea !== eb) return ea - eb;
      if ((b.q || 0) !== (a.q || 0)) return (b.q || 0) - (a.q || 0);
      return a.name < b.name ? -1 : 1;
    });
    var vh = opt("", voices.length ? "Engine default voice" : "No voices found for this engine yet", !d.voice);
    voices.forEach(function (v) { vh += opt(v.name, v.name + "  ·  " + v.lang + (v.net ? "  ·  needs internet" : ""), v.name === d.voice); });
    $("ax-vv").innerHTML = vh;
    var r = d.rate || 95; $("ax-vr").value = r; $("ax-vrl").textContent = "Speed " + (r / 100).toFixed(2).replace(/0$/, "") + "x";
  }

  function refresh(tries) {
    if (busy) return; busy = 1;
    (function go(n) {
      ENG.voiceList().then(function (d) {
        if (!(d.voices && d.voices.length) && n < (tries || 1) - 1) { setTimeout(function () { go(n + 1); }, 700); return; }
        busy = 0; fill(d);
      }).catch(function () { busy = 0; if (n < (tries || 1) - 1) setTimeout(function () { refresh(tries); }, 700); });
    })(0);
  }

  $("ax-ve").onchange = function () { var v = this.value; ENG.voiceSet({ engine: v }).then(function () { refresh(8); }).catch(function () { toast("Could not switch the voice engine."); }); };
  $("ax-vv").onchange = function () { var v = this.value; ENG.voiceSet({ voice: v }).then(function () { toast(v ? "Voice saved. Tap Play above to hear it." : "Using the engine default voice."); }).catch(function () { /* ignore */ }); };
  $("ax-vr").oninput = function () { $("ax-vrl").textContent = "Speed " + (this.value / 100).toFixed(2).replace(/0$/, "") + "x"; };
  $("ax-vr").onchange = function () { ENG.voiceSet({ rate: this.value / 100 }).catch(function () { /* ignore */ }); };
  $("ax-vset").onclick = function () { ENG.voiceSettings().catch(function () { toast("Open your phone Settings, then Text-to-speech."); }); };
  $("ax-vget").onclick = function () { ENG.openUrl({ url: "https://f-droid.org/packages/org.woheller69.ttsengine/" }).catch(function () { toast("Search SherpaTTS on F-Droid."); }); };

  try { new IntersectionObserver(function (es) { if (es[0] && es[0].isIntersecting) refresh(3); }).observe(box); } catch (e) { refresh(3); }
  window.axVoiceRefresh = refresh;
})();

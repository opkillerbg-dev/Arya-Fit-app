/* Arya Fit V2 P7 — one-time introduction and global accessibility/presentation corrections. */
(function(w,d){
  "use strict";
  var root=d.documentElement;
  function $(id){return d.getElementById(id)}
  function prompt(){if(!w.PR||PR.v2===1||PR.v2Intro===1||!w.axSheet||d.getElementById("ax-ob"))return;PR.v2Intro=1;w.save&&save();
    w.axSheet("A new way to train",'<div class="v2-intro-card"><p class="v2-intro-eyebrow">ARYA FIT · NEW INTERFACE</p><h2>Make room for<br><em>your progress.</em></h2><p>A darker, picture-first interface with grouped settings and a cleaner exercise library. Your workouts and history stay exactly where they are.</p><div class="v2-intro-actions"><button type="button" class="ax-btn" id="v2-intro-later">Keep classic</button><button type="button" class="ax-btn ax-pri" id="v2-intro-try">Try the new look</button></div></div>');
    var later=$("v2-intro-later"),go=$("v2-intro-try");if(later)later.onclick=function(){w.axSheetX();w.toast&&w.toast("Classic look kept")};if(go)go.onclick=function(){w.axSheetX();if(w.AxV2)AxV2.setEnabled(true);w.toast&&w.toast("New look enabled")};
  }
  function labels(){
    var nav=d.querySelector(".v2-nav");if(nav)nav.setAttribute("aria-label","Main navigation");
    d.querySelectorAll("button:not([aria-label]):not([aria-labelledby])").forEach(function(b){var t=(b.textContent||"").replace(/\s+/g," ").trim(),alt=b.querySelector("img[alt]");if(t)b.setAttribute("aria-label",t.slice(0,80));else if(alt&&alt.alt)b.setAttribute("aria-label",alt.alt);else if(b.title)b.setAttribute("aria-label",b.title);else if(b.id)b.setAttribute("aria-label",b.id.replace(/^ax-|^v2-/g,"").replace(/[-_]/g," "))});
    d.querySelectorAll("input:not([aria-label]):not([aria-labelledby])").forEach(function(i){var l=i.id&&d.querySelector('label[for="'+i.id+'"]');if(l)i.setAttribute("aria-label",l.textContent.trim());else if(i.placeholder)i.setAttribute("aria-label",i.placeholder)});
  }
  function fixTime(){var lab=$("dlab");if(lab&&/^\s*time\s*$/i.test(lab.textContent||""))lab.hidden=true;else if(lab)lab.hidden=false}
  function viewFix(){var hero=d.querySelector("#ax-day .v2-session-hero");if(hero){var title=hero.querySelector("h2");if(title)title.style.marginTop="4px"}fixTime();labels()}
  function observe(){var dock=$("dock"),day=$("ax-day"),sheet=$("ax-shb"),drawer=$("ax-drawer"),home=$("ax-v-home");if(w.MutationObserver&&dock)new MutationObserver(fixTime).observe(dock,{subtree:true,childList:true,characterData:true});if(w.MutationObserver&&day)new MutationObserver(viewFix).observe(day,{subtree:true,childList:true});if(w.MutationObserver&&sheet)new MutationObserver(function(){if(root.classList.contains("v2"))labels()}).observe(sheet,{subtree:true,childList:true});if(w.MutationObserver&&drawer)new MutationObserver(function(){if(root.classList.contains("v2"))labels()}).observe(drawer,{subtree:true,childList:true});if(w.MutationObserver&&home)new MutationObserver(function(){if(root.classList.contains("v2"))labels()}).observe(home,{subtree:true,childList:true})}
  function start(){observe();viewFix();if(w.PR&&PR.v2!==1&&PR.v2Intro!==1){var wait=function(){if($("ax-boot")){w.setTimeout(wait,300);return}if(w.AxOnboard&&AxOnboard.isOpen&&AxOnboard.isOpen()){w.setTimeout(wait,1000);return}prompt()};w.setTimeout(wait,1200)}}
  if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",start);else start();
  if(w.AxV2&&w.AxV2.apply){var old=w.AxV2.apply;w.AxV2.apply=function(){var before=root.classList.contains("v2"),r=old.apply(this,arguments),after=root.classList.contains("v2");if(before!==after){if(!after){if($("ax-sh")&&!$("ax-sh").hidden&&w.axSheetX)w.axSheetX();d.querySelectorAll(".v2-today-hero,.v2-today-section,.v2-shell-controls,.v2-top-fade,.v2-avatar,.v2-popover,.v2-popover-scrim").forEach(function(n){n.remove()})}else viewFix()}return r}}
})(window,document);

/* AERUNO v149 (V1 simplification P8): help layer.
   1) up to three one-line tips (Today, Plan, Move), each shown at most twice and never after "Got it"; only for installs that started on v142 or later (PR.born) or after "Show the tips again";
   2) buttons on empty states (Progress, History);
   3) the "How AERUNO works" card on Me > About & help calls "Show the tips again".
   Nothing here changes data: tips live in localStorage "axTips". */
(function(){
  "use strict";
  var $=function(i){return document.getElementById(i)},K="axTips";
  var TIPS={
    home:{v:"ax-v-home",t:"This is today's session. Tap the big button to start. Check-in, readiness and weather are under More for today."},
    plan:{v:"ax-v-plan",t:"Tap a day to see its exercises. Tap Finish day when you are done. Manage has plans, extra exercises and more."},
    timers:{v:"ax-v-timers",t:"Start a run or walk any time, even outside your plan. Tools has the stopwatch, rest timer and logging."}
  };
  function get(){try{return JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(e){return {}}}
  function put(o){try{localStorage.setItem(K,JSON.stringify(o))}catch(e){}}
  function v2(){return document.documentElement.classList.contains("v2")}
  function busy(){try{return !!$("ax-boot")||(window.AxOnboard&&AxOnboard.isOpen&&AxOnboard.isOpen())}catch(e){return false}}
  function eligible(o){return !!(o.force||(window.PR&&PR.born))}

  function tip(k){
    var d=TIPS[k];if(!d||v2()||busy())return;
    var o=get();if(!eligible(o)||(o[k]||0)>=2)return;
    var view=$(d.v);if(!view||view.hidden||view.querySelector(".ax-tip"))return;
    var c=document.createElement("div");c.className="ax-card ax-tip";c.setAttribute("data-tip",k);
    c.innerHTML='<p class="ax-sub"><b>Tip.</b> '+d.t+'</p><div class="ax-chips"><button type="button" class="ax-btn" data-tip-ok="'+k+'">Got it</button></div>';
    if(k==="home"){var a=$("ax-htoday");if(a&&a.parentNode)a.parentNode.insertBefore(c,a);else view.insertBefore(c,view.children[1]||null)}
    else{var i=view.querySelector(".ax-section-intro");if(i&&i.nextSibling)view.insertBefore(c,i.nextSibling);else view.insertBefore(c,view.firstChild)}
    o[k]=(o[k]||0)+1;put(o);
  }
  function clearTips(){var o=get();Array.prototype.forEach.call(document.querySelectorAll(".ax-tip"),function(n){n.remove()});o=o.force?{force:1}:{};put(o)}

  /* delegated clicks: tips, empty-state buttons, replay */
  document.addEventListener("click",function(e){
    var t=e.target.closest&&e.target.closest("[data-tip-ok],#ax-prog-go,#ax-hist-go,#ax-tips-again");if(!t)return;
    if(t.hasAttribute("data-tip-ok")){var o=get();o[t.getAttribute("data-tip-ok")]=9;put(o);var c=t.closest(".ax-tip");if(c)c.remove();return}
    if(t.id==="ax-prog-go"&&window.go){go("home");return}
    if(t.id==="ax-hist-go"&&window.go){go("timers");return}
    if(t.id==="ax-tips-again"){put({force:1});Array.prototype.forEach.call(document.querySelectorAll(".ax-tip"),function(n){n.remove()});if(window.toast)toast("Tips are back. You will see them on Today, Plan and Move.");if(window.go)go("home")}
  });

  /* show a tip a moment after each visit to Today, Plan or Move */
  var _go=window.go;
  if(typeof _go==="function")window.go=function(v){var r=_go.apply(this,arguments);var k=v;
    Array.prototype.forEach.call(document.querySelectorAll(".ax-tip"),function(n){if(n.getAttribute("data-tip")!==k)n.remove()});   /* an ignored tip leaves with the view and counts as one showing */
    setTimeout(function(){tip(k)},500);return r};
  var n=0,iv=setInterval(function(){n++;if(!busy()){clearInterval(iv);tip("home")}else if(n>40)clearInterval(iv)},500);
  window.axTips={show:tip,reset:clearTips};

  var css=document.createElement("style");
  css.textContent=".ax-tip{border-style:dashed}.ax-tip .ax-chips{margin-top:8px}"+
    ".ax-help-row{display:flex;gap:12px;padding:9px 0;border-top:1px solid var(--line)}.ax-help-row:first-of-type{border-top:0}.ax-help-row b{min-width:74px}.ax-help-row span{color:var(--mut);font-size:var(--ax-t2,14px)}";
  document.head.appendChild(css);
})();

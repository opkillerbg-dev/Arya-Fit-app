/* Arya Fit V2 - typography accent: wraps the LAST word of day titles in <em class="v2-type-accent"> (editorial italic),
   the same signature as the Today hero. Idempotent, removed again when V2 is off. */
(function(w,d){
  "use strict";
  var root=d.documentElement,SEL=".ax-dayx h2.ax-h2,.ax-home-session-title h2.ax-h2",pending=0,raf=w.requestAnimationFrame||function(f){return setTimeout(f,16)};
  function accent(h){
    if(h.querySelector("em.v2-type-accent"))return;
    var n=h.lastChild;while(n&&!(n.nodeType===3&&n.nodeValue.trim()))n=n.previousSibling;
    if(!n)return;
    var m=/^([\s\S]*\S)\s+(\S+)\s*$/.exec(n.nodeValue);if(!m)return;
    var em=d.createElement("em");em.className="v2-type-accent";em.textContent=m[2];
    n.nodeValue=m[1]+" ";if(n.nextSibling)h.insertBefore(em,n.nextSibling);else h.appendChild(em);
  }
  function plain(h){
    var e=h.querySelector("em.v2-type-accent");if(!e)return;
    var t=d.createTextNode(e.textContent);e.parentNode.replaceChild(t,e);h.normalize();
  }
  function run(){
    pending=0;var on=root.classList.contains("v2");
    d.querySelectorAll(on?SEL:"h2 em.v2-type-accent").forEach(function(x){on?accent(x):plain(x.parentNode)});
  }
  function schedule(){if(pending)return;pending=1;raf(run)}
  function start(){
    var views=d.getElementById("ax-v-home"),plan=d.getElementById("ax-v-plan");
    [views,plan].forEach(function(v){if(v&&w.MutationObserver)new MutationObserver(function(){schedule()}).observe(v,{childList:true,subtree:true,characterData:true})});
    if(w.AxV2&&AxV2.apply&&!AxV2.apply.__ty){var o=AxV2.apply;AxV2.apply=function(){var r=o.apply(this,arguments);schedule();return r};AxV2.apply.__ty=1}
    schedule();
  }
  if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",function(){setTimeout(start,600)});else setTimeout(start,600);
})(window,document);

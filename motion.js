/* Arya Fit v80: one motion language for every screen. Direction-aware tab slides, settings pages that push in/out,
   sheets that animate out (ghost copy, no logic touched), check-in that unfolds. Honors reduced-motion. */
(function(){
  "use strict";
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  var $=function(i){return document.getElementById(i)};
  var ORDER=["home","plan","timers","prog","set","plans"];

  /* 1. direction of the next screen change (forward = slide from right) */
  var og=window.go;
  if(typeof og==="function"){
    window.go=function(v){
      try{
        var cur=-1;ORDER.forEach(function(x,i){var e=$("ax-v-"+x);if(e&&!e.hidden)cur=i});
        var nx=ORDER.indexOf(v);document.documentElement.setAttribute("data-dir",nx>=cur?"f":"b");
      }catch(e){}
      return og.apply(this,arguments);
    };
  }

  /* 2. sheet exit: animate a ghost copy while the real sheet closes instantly */
  window.axSheetGhost=function(){
    var sh=$("ax-sh"),bg=$("ax-shbg");if(!sh||sh.hidden)return;
    [[sh,"ax-m-sho"],[bg,"ax-m-bgo"]].forEach(function(p){
      var el=p[0];if(!el||el.hidden)return;
      var g=el.cloneNode(true);g.removeAttribute("id");
      Array.prototype.forEach.call(g.querySelectorAll("[id]"),function(n){n.removeAttribute("id")});
      g.classList.add("ax-ghost",p[1]);g.setAttribute("aria-hidden","true");g.hidden=false;
      el.parentNode.insertBefore(g,el.nextSibling);
      setTimeout(function(){if(g.parentNode)g.parentNode.removeChild(g)},260);
    });
  };

  /* 3. settings pages push in, menu returns from the left; check-in unfolds */
  function once(el,cls){
    el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);
    var done=function(){el.classList.remove(cls);el.removeEventListener("animationend",done)};
    el.addEventListener("animationend",done);setTimeout(done,500);
  }
  new MutationObserver(function(ms){
    ms.forEach(function(m){
      var t=m.target;if(!t||t.hidden)return;
      if(t.classList.contains("ax-sp"))once(t,"ax-m-r");
      else if(t.id==="ax-sm")once(t,"ax-m-l");
    });
  }).observe(document.documentElement,{attributes:true,attributeFilter:["hidden"],subtree:true});
  function watchBrain(){
    var b=$("ax-hbrain");if(!b){return}
    new MutationObserver(function(){if(!b.classList.contains("ax-cl"))once(b,"ax-m-drop")}).observe(b,{attributes:true,attributeFilter:["class"]});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",watchBrain);else watchBrain();

  var css=document.createElement("style");
  css.textContent=
   /* tab change: staggered, direction aware (overrides the older up-only rise) */
   "html[data-dir=f] .ax-view.ax-in>*{animation:ax-m-f .34s cubic-bezier(.2,.8,.2,1) both!important}"+
   "html[data-dir=b] .ax-view.ax-in>*{animation:ax-m-b .34s cubic-bezier(.2,.8,.2,1) both!important}"+
   ".ax-view.ax-in>*:nth-child(2){animation-delay:30ms!important}.ax-view.ax-in>*:nth-child(3){animation-delay:60ms!important}"+
   ".ax-view.ax-in>*:nth-child(4){animation-delay:90ms!important}.ax-view.ax-in>*:nth-child(5){animation-delay:115ms!important}"+
   ".ax-view.ax-in>*:nth-child(n+6){animation-delay:135ms!important}"+
   "@keyframes ax-m-f{from{opacity:0;transform:translate3d(26px,0,0) scale(.99)}to{opacity:1;transform:none}}"+
   "@keyframes ax-m-b{from{opacity:0;transform:translate3d(-26px,0,0) scale(.99)}to{opacity:1;transform:none}}"+
   ".ax-m-r{animation:ax-m-f .3s cubic-bezier(.2,.8,.2,1) both}.ax-m-l{animation:ax-m-b .3s cubic-bezier(.2,.8,.2,1) both}"+
   ".ax-m-drop{animation:ax-m-d .3s cubic-bezier(.2,.8,.2,1) both}@keyframes ax-m-d{from{opacity:0;transform:translate3d(0,-10px,0) scale(.985)}to{opacity:1;transform:none}}"+
   /* sheet exit ghosts */
   ".ax-ghost{pointer-events:none!important;animation-fill-mode:forwards!important}"+
   ".ax-sh.ax-m-sho{animation:ax-m-so .22s cubic-bezier(.4,0,1,1) both!important}"+
   ".ax-shbg.ax-m-bgo{animation:ax-m-bo .22s ease both!important}"+
   "@keyframes ax-m-so{from{opacity:1;transform:none}to{opacity:0;transform:translate3d(0,34px,0)}}@keyframes ax-m-bo{from{opacity:1}to{opacity:0}}"+
   /* small shared polish: toggles, chips, rows ease instead of snapping */
   ".sw2,.ax-chip,.ax-opt,.ax-lr,.ax-btn{transition:background-color .2s ease,border-color .2s ease,box-shadow .2s ease,transform .14s ease,opacity .2s ease}"+
   ".ax-opt:active,.ax-lr:active{transform:scale(.985)}";
  document.head.appendChild(css);
})();

/* Arya Fit v83: performance governor. Zero cost while idle (its only per-frame work runs during a scroll).
   1) Fixed bars (nav, top pill) drop their backdrop blur WHILE the page scrolls and get it back when it stops:
      blur over moving content is re-computed every frame, which is the most expensive thing the glass layer does.
   2) If scrolling is measurably choppy on this device in two separate scrolls, Smooth mode switches on by itself, once.
      A manual choice in Settings > Appearance always wins and stops the governor. */
(function(){
  "use strict";
  var root=document.documentElement,KEY="axLite",AUTO="axLiteAuto";
  function g(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function s(k,v){try{localStorage.setItem(k,v)}catch(e){}}

  var css=document.createElement("style");
  css.textContent=
   ":root.gls.gls.ax-scrolling.ax-scrolling:not(.ax-lite-glass) :is(#ax-nav,.ax-tp,#ax-tmenu){-webkit-backdrop-filter:none!important;backdrop-filter:none!important;--lq-f2:color-mix(in srgb,var(--card) 82%,transparent)}"+
   /* closed drawer must not keep a blur layer alive */
   ":root.gls.gls.gls:not(.ax-lite-glass) #ax-drawer:not(.on){-webkit-backdrop-filter:none!important;backdrop-filter:none!important}";
  document.head.appendChild(css);

  var t0=performance.now(),on=false,tmr=0,raf=0,last=0,frames=[],bursts=[];
  function sample(t){
    if(!on)return;
    if(last)frames.push(t-last);
    last=t;raf=requestAnimationFrame(sample);
  }
  function start(){
    on=true;root.classList.add("ax-scrolling");
    frames=[];last=0;raf=requestAnimationFrame(sample);
  }
  function stop(){
    on=false;cancelAnimationFrame(raf);root.classList.remove("ax-scrolling");
    judge();
  }
  function judge(){
    if(g(AUTO)||g(KEY)==="1"||root.classList.contains("ax-lite-glass"))return;     /* already decided, or already light */
    if(document.hidden||performance.now()-t0<8000)return;                           /* ignore load and background */
    var f=frames.slice(3);if(f.length<30)return;                                    /* need a real scroll, not a nudge */
    var slow=f.filter(function(d){return d>40}).length;
    bursts.push(slow/f.length);if(bursts.length>3)bursts.shift();
    var bad=bursts.filter(function(r){return r>=.15}).length;
    if(bad>=2)enable();
  }
  function enable(){
    s(KEY,"1");s(AUTO,"auto");
    root.classList.add("ax-lite-glass");root.setAttribute("data-glass-mode","efficient");
    var t=document.getElementById("t-lite");if(t)t.checked=true;
    try{toast("Smooth mode is on to keep scrolling fluid. Change it in Settings > Appearance.")}catch(e){}
  }
  window.addEventListener("scroll",function(){
    if(!on)start();
    clearTimeout(tmr);tmr=setTimeout(stop,160);
  },{passive:true,capture:true});
  window.axPerf={bursts:function(){return bursts.slice()},enable:enable};
})();

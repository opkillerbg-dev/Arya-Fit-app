/* Arya Fit v78: smarter Home. Order by "what do I do now": Today first, then status, alerts, check-in, steps, backup last.
   Only MOVES existing nodes (ids/handlers untouched) and adds one toggle bar for the long Smart Today card. */
(function(){
  "use strict";
  var $=function(i){return document.getElementById(i)};
  var home=$("ax-v-home");if(!home)return;
  var open=false,bar=null,busy=false;

  function ensureBar(){
    if(bar&&bar.parentNode)return bar;
    bar=document.createElement("button");bar.type="button";bar.id="ax-hbar";bar.className="ax-card ax-hbar";
    bar.innerHTML='<svg class="ax-ic"><use href="#i-bolt"/></svg><span><b>How are you feeling?</b><em></em></span><svg class="ax-ic ax-hbar-c"><use href="#i-chev"/></svg>';
    bar.onclick=function(){setOpen(!open)};
    return bar;
  }
  function setOpen(v){
    open=!!v;var b=$("ax-hbrain");if(!b)return;
    b.classList.toggle("ax-cl",!open);
    ensureBar().setAttribute("aria-expanded",open);ensureBar().classList.toggle("on",open);
    label();
    if(open)try{b.scrollIntoView({behavior:"smooth",block:"nearest"})}catch(e){}
  }
  function label(){
    var b=$("ax-hbrain"),em=bar&&bar.querySelector("em");if(!b||!em)return;
    var done=!!b.querySelector("#ax-br-edit");
    var t1=open?"Tap to hide":(done?"Done for today · tap to view":"Smart Today · 3 quick taps tailor your session"),
        t2=done?"Check-in":"How are you feeling?",bb=bar.querySelector("b");
    if(em.textContent!==t1)em.textContent=t1;
    if(bb.textContent!==t2)bb.textContent=t2;
  }
  window.axBrainOpen=function(){setOpen(true)};

  var ORDER=["ax-hnote","ax-htoday","ax-hmiss","ax-stat","ax-hsteps","ax-wx-card","ax-readiness-card","ax-hbar","ax-hbrain","ax-bk-nudge"];
  function node(k){return k==="ax-stat"?home.querySelector(".ax-stat"):$(k)}
  var calls=0,callT=Date.now(),mo=null;
  function arrange(){
    if(busy)return;
    var now=Date.now();if(now-callT>1000){callT=now;calls=0}
    if(++calls>80){if(mo)mo.disconnect();return}   /* storm breaker */
    busy=true;
    try{
      var hero=home.querySelector(".ax-hero-art"),prev=hero;
      ensureBar();
      var want=ORDER.map(function(k){return k==="ax-hbar"?bar:node(k)}).filter(Boolean);
      var cur=Array.prototype.filter.call(home.children,function(c){return want.indexOf(c)>=0});
      var same=cur.length===want.length&&cur.every(function(c,i){return c===want[i]})&&(!hero||home.firstElementChild===hero);
      if(!same){
        if(hero&&home.firstElementChild!==hero)home.insertBefore(hero,home.firstChild);
        want.forEach(function(n){var after=prev?prev.nextSibling:home.firstChild;if(after!==n)home.insertBefore(n,after);prev=n});
      }
      var b=$("ax-hbrain");if(b&&!b.dataset.axInit){b.dataset.axInit=1;b.classList.add("ax-cl")}
      label();
    }catch(e){}
    busy=false;
  }

  /* re-run after renders / late inserts (readiness card, backup nudge) */
  mo=new MutationObserver(function(m){
    if(busy)return;
    for(var i=0;i<m.length;i++){if(m[i].target===home){arrange();return}if(m[i].target.id==="ax-hbrain"){label();}}
  });
  mo.observe(home,{childList:true,subtree:true});

  var css=document.createElement("style");
  css.textContent=
   "#ax-v-home .ax-hero-art{min-height:176px!important}"+
   "#ax-v-home .ax-hero-copy{margin-top:18px!important}"+
   "#ax-v-home .ax-hero-copy span,#ax-v-home .ax-hero-bottom{display:none!important}"+
   "#ax-v-home .ax-hero-copy h2{font-size:clamp(26px,7.4vw,32px)!important}"+
   "#ax-hbrain.ax-cl{display:none!important}"+
   ".ax-hbar{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:12px 16px;text-align:left;color:var(--ink);cursor:pointer}"+
   ".ax-hbar>span{flex:1;min-width:0}.ax-hbar b{display:block;font-size:var(--ax-t3,17px)}"+
   ".ax-hbar em{display:block;font-style:normal;font-size:var(--ax-t1,12px);color:var(--mut);margin-top:2px}"+
   ".ax-hbar .ax-hbar-c{transform:rotate(90deg);transition:transform .2s ease;color:var(--mut)}.ax-hbar.on .ax-hbar-c{transform:rotate(-90deg)}";
  document.head.appendChild(css);

  function init(){arrange();setTimeout(arrange,600);setTimeout(arrange,2200)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.axHomeArrange=arrange;
})();

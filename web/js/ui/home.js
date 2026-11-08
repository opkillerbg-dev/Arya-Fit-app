/* AERUNO v142 (V1 simplification P2): Home = "what do I do now".
   Top level: Today card first, then missed days, progress ring, steps, ONE nudge (highest priority only), then a single collapsible "More for today"
   (check-in, readiness, weather). Only MOVES existing nodes (ids/handlers untouched). With the V2 look on, the old flat order is used. */
(function(){
  "use strict";
  var $=function(i){return document.getElementById(i)};
  var home=$("ax-v-home");if(!home)return;
  var open=false,bar=null,busy=false,slot=null,more=null,moreBar=null,moreBody=null,moreOpen=false;
  var LSK="axHomeMore";
  try{moreOpen=localStorage.getItem(LSK)==="1"}catch(e){}

  /* cards that ask for something once; only the first present one shows (priority order) */
  var NUDGES=["ax-ob-nudge","ax-rt-nudge","ax-coach-card","ax-bk-nudge"];
  var LEGACY=["ax-hnote","ax-htoday","ax-hmiss","ax-stat","ax-hsteps","ax-wx-card","ax-readiness-card","ax-hbar","ax-hbrain","ax-bk-nudge"];
  function isV2(){return document.documentElement.classList.contains("v2")}

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
    var t1=open?"Tap to hide":(done?"Done for today · tap to view":"Daily check-in · 3 taps tailor today's session"),
        t2=done?"Check-in":"How are you feeling?",bb=bar.querySelector("b");
    if(em.textContent!==t1)em.textContent=t1;
    if(bb.textContent!==t2)bb.textContent=t2;
  }

  /* ---- More for today ---- */
  function ensureMore(){
    if(more&&more.parentNode)return more;
    more=document.createElement("section");more.id="ax-hmore";more.className="ax-hmore";
    moreBar=document.createElement("button");moreBar.type="button";moreBar.id="ax-hmore-bar";moreBar.className="ax-card ax-hbar";
    moreBar.innerHTML='<svg class="ax-ic"><use href="#i-set"/></svg><span><b>More for today</b><em></em></span><svg class="ax-ic ax-hbar-c"><use href="#i-chev"/></svg>';
    moreBar.onclick=function(){setMore(!moreOpen)};
    moreBody=document.createElement("div");moreBody.id="ax-hmore-body";moreBody.className="ax-hmore-body";
    more.appendChild(moreBar);more.appendChild(moreBody);
    setMore(moreOpen,true);
    return more;
  }
  function setMore(v,quiet){
    moreOpen=!!v;if(!more)return;
    moreBody.hidden=!moreOpen;moreBar.classList.toggle("on",moreOpen);moreBar.setAttribute("aria-expanded",moreOpen);
    if(!quiet)try{localStorage.setItem(LSK,moreOpen?"1":"0")}catch(e){}
    if(moreOpen&&!quiet)try{moreBody.scrollIntoView({behavior:"smooth",block:"nearest"})}catch(e){}
  }
  function moreLabel(){
    if(!moreBar)return;var p=[];
    if($("ax-hbrain"))p.push("Check-in");
    if($("ax-readiness-card"))p.push("Readiness");
    if($("ax-wx-card"))p.push("Weather");
    var em=moreBar.querySelector("em"),t=p.join(" · ")||"Nothing else right now";
    if(em&&em.textContent!==t)em.textContent=t;
  }
  window.axBrainOpen=function(){if(!isV2()){ensureMore();setMore(true,true);try{localStorage.setItem(LSK,"1")}catch(e){}}setOpen(true)};

  function ensureSlot(){
    if(slot&&slot.parentNode)return slot;
    slot=document.createElement("div");slot.id="ax-hnudge";slot.className="ax-hnudge";return slot;
  }

  var calls=0,callT=Date.now(),mo=null;
  function place(list,parent,firstNode){
    /* make `list` the ordered children of `parent` (extra children untouched); only touches the DOM when out of place */
    var cur=Array.prototype.filter.call(parent.children,function(c){return list.indexOf(c)>=0});
    var same=cur.length===list.length&&cur.every(function(c,i){return c===list[i]});
    if(same&&(!firstNode||parent.firstElementChild===firstNode))return;
    var prev=firstNode||null;
    if(firstNode&&parent.firstElementChild!==firstNode)parent.insertBefore(firstNode,parent.firstChild);
    list.forEach(function(n){var after=prev?prev.nextSibling:parent.firstChild;if(after!==n)parent.insertBefore(n,after);prev=n});
  }
  function arrange(){
    if(busy)return;
    var now=Date.now();if(now-callT>1000){callT=now;calls=0}
    if(++calls>80){if(mo)mo.disconnect();return}   /* storm breaker */
    busy=true;
    try{
      var hero=home.querySelector(".ax-hero-art");
      ensureBar();
      var node=function(k){return k==="ax-stat"?home.querySelector(".ax-stat"):k==="ax-hbar"?bar:$(k)};
      if(isV2()){
        if(slot)slot.hidden=true;if(more)more.hidden=true;
        place(LEGACY.map(node).filter(Boolean),home,hero);
      }else{
        var sl=ensureSlot(),mr=ensureMore();
        /* one nudge at a time */
        var ns=NUDGES.map($).filter(Boolean);
        place(ns,sl,null);
        ns.forEach(function(n,i){n.classList.toggle("ax-nq",i>0)});
        sl.hidden=!ns.length;
        /* the extras live inside More for today */
        var ex=["ax-wx-card","ax-readiness-card","ax-hbar","ax-hbrain"].map(node).filter(Boolean);
        place(ex,moreBody,null);
        mr.hidden=!ex.length;moreLabel();
        place(["ax-hnote","ax-htoday","ax-hmiss","ax-stat","ax-hsteps"].map(node).concat([sl,mr]).filter(function(n){return n&&(n!==sl||ns.length)&&(n!==mr||ex.length)}),home,hero);
      }
      var b=$("ax-hbrain");if(b&&!b.dataset.axInit){b.dataset.axInit=1;b.classList.add("ax-cl")}
      label();
    }catch(e){}
    busy=false;
  }

  /* re-run after renders / late inserts (readiness card, nudges, weather) */
  mo=new MutationObserver(function(m){
    if(busy)return;
    for(var i=0;i<m.length;i++){var t=m[i].target;if(t===home||t===slot||t===moreBody){arrange();return}if(t.id==="ax-hbrain"){label();}}
  });
  mo.observe(home,{childList:true,subtree:true});

  var css=document.createElement("style");
  css.textContent=
   "#ax-v-home .ax-hero-art{min-height:136px!important}"+
   "#ax-v-home .ax-hero-copy{margin-top:10px!important}"+
   "#ax-v-home .ax-hero-copy span,#ax-v-home .ax-hero-bottom{display:none!important}"+
   "#ax-v-home .ax-hero-copy h2{font-size:clamp(24px,6.6vw,29px)!important}"+
   "#ax-hbrain.ax-cl{display:none!important}"+
   "#ax-hnote:empty,#ax-hmiss:empty{display:none!important}"+
   "#ax-hnudge>.ax-nq{display:none!important}"+
   "#ax-hnudge[hidden],#ax-hmore[hidden],#ax-hmore-body[hidden]{display:none!important}"+
   ".ax-hmore-body{display:flex;flex-direction:column;gap:14px;margin-top:14px}"+
   ".ax-hbar{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:12px 16px;text-align:left;color:var(--ink);cursor:pointer}"+
   ".ax-hbar>span{flex:1;min-width:0}.ax-hbar b{display:block;font-size:var(--ax-t3,17px)}"+
   ".ax-hbar em{display:block;font-style:normal;font-size:var(--ax-t1,12px);color:var(--mut);margin-top:2px}"+
   ".ax-hbar .ax-hbar-c{transform:rotate(90deg);transition:transform .2s ease;color:var(--mut)}.ax-hbar.on .ax-hbar-c{transform:rotate(-90deg)}";
  document.head.appendChild(css);

  function init(){arrange();setTimeout(arrange,600);setTimeout(arrange,2200)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.axHomeArrange=arrange;
})();

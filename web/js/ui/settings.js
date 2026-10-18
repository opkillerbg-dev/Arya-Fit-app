/* Settings hub (v75). Turns the stacked accordion into a menu of rows; each row opens one page.
   Existing nodes are MOVED, never rebuilt, so every id and handler (t-gps, skins, ex, rs ...) keeps working. */
(function(){
  "use strict";
  var $=function(i){return document.getElementById(i)};
  var sec=$("ax-v-set");if(!sec)return;
  var cur=null,built=false,hub,pagesBox;

  var ICON={look:"i-sun",run:"i-run",alert:"i-bolt",plan:"i-cal",data:"i-flag",about:"i-set"};
  var DEF=[
    {k:"look",t:"Appearance",s:function(){var sk=String((window.PR&&PR.skin)||"oldmoney").toLowerCase();var nm={oldmoney:"Old Money",classic:"Classic",modern:"Modern",professional:"Professional",midnight:"Midnight",sunset:"Sunset"};return (nm[sk]||cap(sk))+(PR.gls===0?"":" · glass")+(PR.amo?" · black":"")}},
    {k:"run",t:"Run & tracking",s:function(){return (PR.gps===0?"GPS off":"GPS on")+" · goal "+(PR.goal?PR.goal+" km":"plan")}},
    {k:"alert",t:"Sound & feedback",s:function(){return (PR.voi===0?"Voice off":"Voice on")+" · "+(PR.hap===0?"haptics off":"haptics on")}},
    {k:"plan",t:"Plan & exercises",s:function(){var n=$("sp-name");return (n&&n.textContent)||"Plans, next plan, library"}},
    {k:"data",t:"Data & backup",s:function(){return PR.lbk?"Last backup "+Math.floor((Date.now()-PR.lbk)/864e5)+" d ago":"No backup yet"}},
    {k:"about",t:"About",s:function(){return "Arya Fit · v84"}}
  ];
  function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
  function ic(n,c){return '<svg class="ax-ic'+(c?" "+c:"")+'"><use href="#'+n+'"/></svg>'}

  function pageFrom(key,title){
    var p=document.createElement("div");p.className="ax-sp";p.id="ax-sp-"+key;p.hidden=true;
    p.innerHTML='<div class="ax-sp-h"><button type="button" class="ax-sp-b" aria-label="Back to Settings">'+ic("i-chev","ax-sp-bi")+'</button><h2>'+title+'</h2></div><div class="ax-sp-c"></div>';
    p.querySelector(".ax-sp-b").onclick=function(){show(null)};
    pagesBox.appendChild(p);return p;
  }
  /* move all children of a <details> (except summary) into a page body, keep order */
  function drain(det,page){
    if(!det)return;var body=page.querySelector(".ax-sp-c"),card=document.createElement("div");card.className="ax-card ax-sp-card";
    Array.prototype.slice.call(det.children).forEach(function(n){if(n.tagName!=="SUMMARY")card.appendChild(n)});
    body.appendChild(card);return card;
  }
  function findDet(name){
    var ds=sec.querySelectorAll(":scope > details.ax-dt");
    for(var i=0;i<ds.length;i++){var s=ds[i].querySelector(":scope > summary");if(s&&s.textContent.replace(/\s+/g," ").trim()===name)return ds[i]}
    return null;
  }

  function build(){
    if(built)return;
    var run=findDet("Run"),voice=findDet("Voice & alerts"),look=findDet("Look"),data=findDet("Data & backup"),tools=findDet("Plan tools"),cr=$("ax-credits");
    if(!run||!voice||!look||!data||!tools||!cr)return;           /* markup changed: leave the old accordion alone */
    built=true;

    hub=document.createElement("div");hub.id="ax-sm";
    pagesBox=document.createElement("div");pagesBox.id="ax-sp-box";
    sec.appendChild(hub);sec.appendChild(pagesBox);

    var pLook=pageFrom("look","Appearance"),pRun=pageFrom("run","Run & tracking"),pAl=pageFrom("alert","Sound & feedback"),
        pPl=pageFrom("plan","Plan & exercises"),pDa=pageFrom("data","Data & backup"),pAb=pageFrom("about","About");

    /* Exercise pictures belongs with looks, not voice */
    var exi=$("t-exi"),exiRow=exi&&exi.closest(".row");
    drain(look,pLook);
    if(exiRow)pLook.querySelector(".ax-sp-card").appendChild(exiRow);
    /* Smooth mode: lighter effects for a steadier frame rate (stored outside the app data, applied before first paint) */
    var lr=document.createElement("label");lr.className="row";
    lr.innerHTML='<span><b>Smooth mode</b><em>Lighter effects for a steadier frame rate. Turn on if the app feels laggy.</em></span><input class="sw2" type="checkbox" id="t-lite">';
    var card0=pLook.querySelector(".ax-sp-card");card0.insertBefore(lr,card0.firstChild);
    var tl=lr.querySelector("#t-lite");try{tl.checked=localStorage.getItem("axLite")==="1"}catch(e){}
    tl.addEventListener("change",function(){
      var r=document.documentElement;
      try{localStorage.setItem("axLite",tl.checked?"1":"0");localStorage.setItem("axLiteAuto","user")}catch(e){}
      r.classList.toggle("ax-lite-glass",tl.checked);r.setAttribute("data-glass-mode",tl.checked?"efficient":"full");
    });
    drain(run,pRun);
    drain(voice,pAl);
    drain(tools,pPl);
    drain(data,pDa);
    var crInner=cr.querySelector(".ax-cr");
    if(crInner){var c=document.createElement("div");c.className="ax-card ax-sp-card";c.appendChild(crInner);pAb.querySelector(".ax-sp-c").appendChild(c)}

    /* the original summaries are now empty shells; hide them. #ax-credits stays as an anchor for library.js */
    [look,run,voice,tools,data].forEach(function(d){d.remove()});
    cr.hidden=true;cr.style.display="none";
    /* the drawer does c.open=true then scrollIntoView on #ax-credits: route that to the About page */
    try{Object.defineProperty(cr,"open",{configurable:true,get:function(){return false},set:function(v){if(v)show("about")}})}catch(e){}

    /* library card is mounted by library.js before #ax-credits; move it to Plan & exercises */
    function grabLib(){var l=$("ax-lib");if(l&&l.parentNode!==pPl.querySelector(".ax-sp-c")){pPl.querySelector(".ax-sp-c").appendChild(l);return true}return !!l}
    if(!grabLib()){
      var mo=new MutationObserver(function(){if(grabLib())mo.disconnect()});
      mo.observe(sec,{childList:true,subtree:true});setTimeout(function(){mo.disconnect()},8000);
    }

    paintHub();
  }

  function paintHub(){
    if(!hub)return;
    var h="";
    DEF.forEach(function(d){
      var sub="";try{sub=d.s()}catch(e){}
      h+='<button type="button" class="ax-lr ax-smr" data-sp="'+d.k+'">'+ic(ICON[d.k])+'<span><b>'+d.t+'</b><em>'+sub+'</em></span>'+ic("i-chev","ax-chv")+'</button>';
    });
    hub.innerHTML='<div class="ax-card ax-sm-card">'+h+'</div>';
    Array.prototype.forEach.call(hub.querySelectorAll("[data-sp]"),function(b){b.onclick=function(){show(b.getAttribute("data-sp"))}});
  }

  function show(key){
    if(!built)build();if(!built)return;
    cur=key||null;
    var title=sec.querySelector("h1.vt");
    hub.hidden=!!cur;if(title)title.hidden=!!cur;
    Array.prototype.forEach.call(pagesBox.children,function(p){p.hidden=p.id!=="ax-sp-"+cur});
    if(!cur)paintHub();
    if(cur){try{window.axGuard&&axGuard()}catch(e){}}
    try{window.scrollTo(0,0)}catch(e){}
    if(cur==="run"&&typeof window.axSl==="function")try{axSl()}catch(e){}
    var p=cur&&$("ax-sp-"+cur);if(p)p.scrollTop=0;
  }

  /* Android Back: close the open page first */
  window.axSetBack=function(){if(cur&&!sec.hidden){show(null);return true}return false};

  /* leaving Settings resets to the menu; a deep link (drawer > About) sets a page right after it opens */
  var wasHidden=sec.hidden;
  new MutationObserver(function(){
    if(sec.hidden){wasHidden=true;if(built){cur=null;hub.hidden=false;var t=sec.querySelector("h1.vt");if(t)t.hidden=false;Array.prototype.forEach.call(pagesBox.children,function(p){p.hidden=true})}}
    else if(wasHidden){wasHidden=false;if(!cur)show(null)}
  }).observe(sec,{attributes:true,attributeFilter:["hidden"]});

  var css=document.createElement("style");
  css.textContent=
   "#ax-sm .ax-sm-card{padding:4px 0;overflow:hidden}"+
   "#ax-sm .ax-smr{min-height:64px;border-top:1px solid var(--line)}#ax-sm .ax-smr:first-child{border-top:0}"+
   "#ax-sm .ax-smr em{display:block;font-style:normal;font-size:var(--ax-t1);color:var(--mut);margin-top:2px}"+
   "#ax-sm .ax-smr b{font-size:var(--ax-t3)}"+
   ".ax-sp-h{display:flex;align-items:center;gap:10px;margin:0 0 var(--ax-s3)}"+
   ".ax-sp-h h2{margin:0;font-size:22px;line-height:1.15}"+
   ".ax-sp-b{width:var(--ax-tap,48px);height:var(--ax-tap,48px);border-radius:50%;border:1px solid var(--line);background:var(--card,transparent);color:var(--ink);display:grid;place-items:center;padding:0}"+
   ".ax-sp-bi{transform:rotate(180deg);width:20px;height:20px}"+
   ".ax-sp-c{display:flex;flex-direction:column;gap:var(--ax-s3)}"+
   ".ax-sp-card{margin-top:0}";
  document.head.appendChild(css);

  function init(){build();if(built&&!sec.hidden)show(null)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.axSettingsHub={show:show,paint:paintHub};
})();

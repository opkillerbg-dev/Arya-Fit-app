/* Arya Fit v84: app icon picker (Settings > Appearance). Six adaptive icons; Android switches between them with
   <activity-alias> entries (native/java/AppIconPlugin.java). In a browser the choice is only remembered.
   Colours mirror tools/icons/variants.json. "Match app theme" follows the theme you pick. */
(function(){
  "use strict";
  var $=function(i){return document.getElementById(i)};
  var STROKE="M30 80 L52 28 L68 63 Q72 72 81 79",DOT=[74,33.5,6.8],SW=9.5;
  var ICONS=[
    {id:"oldmoney",n:"Old Money",bg:["#2f5a46","#17301f"],ink:"#f3ead7",ac:"#d9b76a"},
    {id:"midnight",n:"Midnight",bg:["#0e1c33","#050a14"],ink:"#eafff7",ac:"#4fe3c1"},
    {id:"sunset",n:"Sunset",bg:["#4a1d33","#241020"],ink:"#fff1e6",ac:"#ff8a4c"},
    {id:"classic",n:"Classic",bg:["#17358a","#091a45"],ink:"#ffffff",ac:"#ffc83d"},
    {id:"professional",n:"Professional",bg:["#ffffff","#dfe8f5"],ink:"#1b4bb8",ac:"#e8793a"},
    {id:"glass",n:"Glass",bg:["#6ea8ff","#a47bff"],ink:"#ffffff",ac:"#ffe9a8"}
  ];
  var BY_SKIN={classic:"classic",oldmoney:"oldmoney",modern:"glass",professional:"professional",midnight:"midnight",sunset:"sunset"};
  var cur="oldmoney",busy=false,matchT=0;

  function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  function plug(){return window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AppIcon||null}
  function tile(ic){
    var g="ai_"+ic.id;
    return '<svg viewBox="0 0 108 108" width="58" height="58" aria-hidden="true"><defs><linearGradient id="'+g+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+ic.bg[0]+'"/><stop offset="1" stop-color="'+ic.bg[1]+'"/></linearGradient></defs>'
      +'<rect width="108" height="108" rx="26" fill="url(#'+g+')"/><path d="'+STROKE+'" fill="none" stroke="'+ic.ink+'" stroke-width="'+SW+'" stroke-linecap="round" stroke-linejoin="round" transform="translate(54 54) scale(1.12) translate(-54 -54)"/>'
      +'<circle cx="'+DOT[0]+'" cy="'+DOT[1]+'" r="'+DOT[2]+'" fill="'+ic.ac+'" transform="translate(54 54) scale(1.12) translate(-54 -54)"/></svg>';
  }
  function paint(){
    var box=$("ax-ico-grid");if(!box)return;
    Array.prototype.forEach.call(box.querySelectorAll(".ax-ico"),function(b){
      var on=b.getAttribute("data-i")===cur;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)
    });
  }
  function setIcon(id,silent){
    if(busy||id===cur)return;
    var P=plug(),prev=cur;busy=true;cur=id;ls("axIcon",id);paint();
    function done(ok,msg){busy=false;if(!ok){cur=prev;ls("axIcon",prev);paint()}if(!silent||!ok){try{toast(msg)}catch(e){}}}
    if(!P){done(true,"Icon saved. It changes on your phone in the Android app.");return}
    P.set({name:id}).then(function(){done(true,"Icon changed. Your home screen can take a few seconds to update.")}).catch(function(){done(false,"Could not change the icon.")});
  }
  function mount(){
    var card=document.querySelector("#ax-sp-look .ax-sp-card");if(!card||$("ax-ico-sec"))return false;
    var sec=document.createElement("div");sec.id="ax-ico-sec";sec.className="ax-ico-sec";
    sec.innerHTML='<b class="ax-ico-h">App icon</b><em class="ax-ico-s">Pick the icon on your home screen. It can take a few seconds to update.</em>'
      +'<div class="ax-ico-grid" id="ax-ico-grid">'+ICONS.map(function(ic){return '<button type="button" class="ax-ico" data-i="'+ic.id+'" aria-label="'+ic.n+' icon">'+tile(ic)+'<span>'+ic.n+'</span></button>'}).join("")+'</div>'
      +'<label class="row ax-ico-m"><span><b>Match app theme</b><em>The icon follows the theme you choose.</em></span><input class="sw2" type="checkbox" id="t-icomatch"></label>';
    card.insertBefore(sec,card.firstChild);
    Array.prototype.forEach.call(sec.querySelectorAll(".ax-ico"),function(b){b.onclick=function(){ls("axIconMatch","0");$("t-icomatch").checked=false;setIcon(b.getAttribute("data-i"))}});
    var m=$("t-icomatch");m.checked=ls("axIconMatch")==="1";
    m.addEventListener("change",function(){ls("axIconMatch",m.checked?"1":"0");if(m.checked)follow()});
    paint();return true;
  }
  function skin(){return document.documentElement.getAttribute("data-skin")||"classic"}
  function follow(){
    if(ls("axIconMatch")!=="1")return;
    var want=BY_SKIN[skin()];if(!want||want===cur)return;
    clearTimeout(matchT);matchT=setTimeout(function(){setIcon(want,true)},1500);   /* wait while the user is still browsing themes */
  }
  /* theme() changes the data-skin attribute; this observer only reads it, never writes it */
  new MutationObserver(follow).observe(document.documentElement,{attributes:true,attributeFilter:["data-skin"]});

  function init(){
    cur=ls("axIcon")||"oldmoney";
    var P=plug();if(P&&P.get)P.get().then(function(r){if(r&&r.name){cur=r.name;ls("axIcon",cur);paint()}}).catch(function(){});
    if(!mount())setTimeout(mount,500);
  }
  var css=document.createElement("style");
  css.textContent=
   ".ax-ico-sec{padding:6px 0 10px;border-bottom:1px solid var(--line);margin-bottom:6px}"+
   ".ax-ico-h{display:block;font-size:var(--ax-t3,17px);margin:4px 0 2px}.ax-ico-s{display:block;font-style:normal;font-size:var(--ax-t1,12px);color:var(--mut);margin-bottom:12px}"+
   ".ax-ico-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}"+
   ".ax-ico{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 4px 8px;border-radius:20px;border:1.5px solid transparent;background:transparent;color:var(--ink);font:600 12px/1.1 \"DM Sans\",system-ui,sans-serif;transition:border-color .2s ease,background-color .2s ease,transform .14s ease}"+
   ".ax-ico:active{transform:scale(.96)}.ax-ico svg{border-radius:15px;box-shadow:0 6px 14px -8px rgba(0,0,0,.45)}"+
   ".ax-ico.on{border-color:var(--blue);background:color-mix(in srgb,var(--blue) 12%,transparent)}"+
   ".ax-ico-m{margin-top:8px;border:0!important}";
  document.head.appendChild(css);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();

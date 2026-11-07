/* Arya Fit v84: app icon picker (Settings > Appearance). Six adaptive icons; Android switches between them with
   <activity-alias> entries (native/java/AppIconPlugin.java). In a browser the choice is only remembered.
   Colours mirror tools/icons/variants.json. "Match app theme" follows the theme you pick. */
(function(){
  "use strict";
  var $=function(i){return document.getElementById(i)};
  var MARK="M61.16 51.36L61.07 51.36 61.06 51.34 60.56 50.35 58.47 46.41 58.21 45.87 58.19 45.78 59.33 43.81 59.51 43.54 59.90 43.09 60.21 42.82 60.62 42.54 60.98 42.36 61.61 42.16 62.06 42.08 62.51 42.05 82.50 42.03 82.95 42.04 83.00 42.11 81.70 44.26 81.02 45.33 80.72 45.87 80.22 46.68 80.02 47.04 79.90 47.21 79.58 47.57 79.18 47.95 78.82 48.21 78.46 48.40 78.02 48.57 77.72 48.65 77.39 48.70 77.12 48.71 64.48 48.72 64.12 48.73 63.67 48.79 63.31 48.90 62.95 49.06 62.51 49.36 62.33 49.52 62.11 49.82ZM44.84 65.95L36.31 65.95 36.39 65.86 37.04 65.74 42.24 64.92 44.22 64.58 47.35 64.09 48.07 63.96 48.97 63.83 50.85 63.52 51.84 63.37 52.55 63.24 54.53 62.93 55.24 62.80 56.14 62.67 56.50 62.59 56.53 62.55 56.51 62.46 54.84 59.23 54.49 58.60 53.94 57.53 52.98 55.73 52.76 55.28 52.26 54.39 51.77 53.40 50.56 51.16 50.15 50.35 49.89 49.91 49.69 49.64 49.50 49.46 49.24 49.27 48.88 49.09 48.52 48.98 48.25 48.95 39.55 48.95 39.44 48.92 39.44 48.83 40.14 47.66 40.69 46.68 42.08 44.35 42.48 43.63 42.82 43.18 43.14 42.88 43.50 42.62 43.86 42.44 44.40 42.26 44.85 42.19 45.11 42.18 53.00 42.20 53.63 42.26 53.99 42.34 54.26 42.43 54.71 42.64 54.97 42.81 55.33 43.08 55.61 43.36 55.89 43.72 56.00 43.90 58.60 48.83 59.43 50.44 59.73 50.98 60.23 51.97 62.72 56.72 63.02 57.35 63.50 58.24 64.55 60.31 64.94 61.02 65.21 61.74 65.30 62.10 65.34 62.46 65.34 62.82 65.31 63.17 65.21 63.62 65.12 63.89 64.93 64.31 64.67 64.70 64.43 64.97 64.12 65.25 63.67 65.54 63.31 65.71 62.77 65.87 62.51 65.91 62.15 65.94 61.16 65.95ZM34.00 65.97L26.82 65.96 26.29 65.92 25.93 65.80 25.66 65.62 25.45 65.42 25.26 65.15 25.17 64.97 25.08 64.70 25.01 64.34 25.00 63.89 25.06 63.44 25.16 63.08 25.28 62.82 25.77 62.01 26.26 61.11 26.49 60.75 27.04 59.77 27.47 59.05 27.87 58.33 28.20 57.80 29.58 55.37 30.33 54.12 30.47 53.85 30.99 52.95 31.10 52.77 31.31 52.52 31.57 52.23 32.02 51.85 32.65 51.49 33.10 51.32 33.37 51.24 34.00 51.14 47.62 51.14 48.88 51.14 49.14 51.16 49.02 51.25 48.97 51.26 48.61 51.32 45.11 52.13 44.66 52.26 43.68 52.48 43.05 52.68 42.42 52.94 42.06 53.13 41.71 53.36 41.26 53.74 40.85 54.21 40.54 54.68 39.59 56.36 38.48 58.26 38.15 58.87 36.22 62.19 35.37 63.71 35.14 64.07 34.18 65.77 34.09 65.92ZM70.49 57.71L69.95 57.75 64.84 57.75 64.48 57.75 64.39 57.72 64.17 57.35 63.96 56.90 63.36 55.82 62.57 54.30 62.44 54.03 62.45 53.94 63.18 52.68 63.38 52.42 63.58 52.22 63.94 51.93 64.39 51.65 64.57 51.57 65.02 51.42 65.37 51.33 65.64 51.30 66.00 51.29 75.24 51.28 75.69 51.28 75.77 51.34 75.74 51.43 75.13 52.42 74.83 52.95 73.35 55.37 72.82 56.27 72.69 56.45 72.15 56.99 71.74 57.29 71.38 57.47 71.11 57.56 70.84 57.64Z";
  var ICONS=[
    {id:"oldmoney",n:"AERUNO",bg:["#161616","#000000"],ink:"#ffffff",ac:"#ffffff"},
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
      +'<rect width="108" height="108" rx="26" fill="url(#'+g+')"/><path d="'+MARK+'" fill="'+ic.ink+'" fill-rule="evenodd" transform="translate(54 54) scale(1.15) translate(-54 -54)"/></svg>';
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

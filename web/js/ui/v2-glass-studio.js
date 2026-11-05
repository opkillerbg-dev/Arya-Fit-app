/* Arya Fit V2 - Glass studio (Settings > Glass studio) + Settings hub upgrades (quick toggles, glass row).
   Controls the liquid-glass engine in v2-liquid.js (archisvaze/liquid-glass, MIT). Presentation layer only. */
(function(w,d){
  "use strict";
  var root=d.documentElement,raf=w.requestAnimationFrame||function(f){return setTimeout(f,16)},pending=0;
  function $(id){return d.getElementById(id)}
  function ic(n,c){return '<svg class="ax-ic'+(c?" "+c:"")+'"><use href="#'+n+'"/></svg>'}
  function L(){return w.AxLiquid}
  var CFG=[
    {g:"Refraction",items:[
      {k:"surface",t:"Edge shape",type:"select",opts:[["convex_squircle","Smooth squircle"],["lip","Lip"]]},
      {k:"thickness",t:"Glass thickness",min:10,max:200,step:1},
      {k:"bezel",t:"Edge width",min:2,max:60,step:1,u:"px"},
      {k:"ior",t:"Refractive index",min:1,max:3,step:.05},
      {k:"scale",t:"Refraction strength",min:0,max:2,step:.05}]},
    {g:"Blur & reflection",items:[
      {k:"blur",t:"Blur",min:0,max:8,step:.1,u:"px"},
      {k:"specOpacity",t:"Reflection (shine)",min:0,max:1,step:.05},
      {k:"specSat",t:"Reflection colour boost",min:0,max:12,step:1}]},
    {g:"Material",items:[
      {k:"tintOp",t:"Tint strength",min:0,max:40,step:1,u:"%"},
      {k:"tintColor",t:"Tint colour",type:"color"},
      {k:"glowBlur",t:"Edge glow size",min:0,max:40,step:1,u:"px"},
      {k:"glowSpread",t:"Edge glow spread",min:-15,max:10,step:1,u:"px"},
      {k:"glowColor",t:"Edge glow colour",type:"color"},
      {k:"shadowBlur",t:"Shadow softness",min:0,max:50,step:1,u:"px"}]}
  ];
  function fmt(it,v){return (typeof v==="number"?(Math.round(v*100)/100):v)+(it.u||"")}

  /* ---------- the page ---------- */
  function buildPage(){
    var box=$("ax-sp-box");if(!box||$("ax-sp-glass")||!L())return;
    var p=d.createElement("div");p.className="ax-sp";p.id="ax-sp-glass";p.hidden=true;
    var h='<div class="ax-sp-h"><button type="button" class="ax-sp-b" aria-label="Back to Settings">'+ic("i-chev","ax-sp-bi")+'</button><h2>Glass studio</h2></div><div class="ax-sp-c">';
    h+='<section class="lg-preview" id="lg-preview" aria-label="Live preview"><div class="lg-prev-bg"><b>Liquid</b><i>glass</i></div><div class="lg-lens" id="lg-lens" role="img" aria-label="Glass preview. Drag to move."></div><p class="lg-note" id="lg-note"></p></section>';
    h+='<div class="ax-card ax-sp-card lg-card"><label class="lg-switch"><span><b>Liquid glass</b><small id="lg-sub">Refracting glass on the nav and buttons.</small></span><input class="sw2" type="checkbox" id="lg-master"></label>';
    h+='<div class="lg-chips" id="lg-chips" role="group" aria-label="Presets">';
    var pr=L().presets,k;for(k in pr)h+='<button type="button" class="lg-chip" data-preset="'+k+'" aria-pressed="false">'+pr[k].label+'</button>';
    h+='</div></div>';
    CFG.forEach(function(g){
      h+='<div class="ax-card ax-sp-card lg-card"><h3 class="lg-h">'+g.g+'</h3>';
      g.items.forEach(function(it){
        var id="lg-"+it.k;
        if(it.type==="select"){h+='<div class="lg-row"><label for="'+id+'"><span>'+it.t+'</span></label><select id="'+id+'" data-k="'+it.k+'">'+it.opts.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>'}).join("")+'</select></div>'}
        else if(it.type==="color"){h+='<div class="lg-row lg-row-c"><label for="'+id+'"><span>'+it.t+'</span></label><input type="color" id="'+id+'" data-k="'+it.k+'"></div>'}
        else{h+='<div class="lg-row"><label for="'+id+'"><span>'+it.t+'</span><output id="'+id+'-o"></output></label><input type="range" id="'+id+'" data-k="'+it.k+'" min="'+it.min+'" max="'+it.max+'" step="'+it.step+'"></div>'}
      });
      h+='</div>';
    });
    h+='<button type="button" class="lg-reset" id="lg-reset">Reset to iOS 26 look</button></div>';
    p.innerHTML=h;box.appendChild(p);
    p.querySelector(".ax-sp-b").onclick=function(){w.axSettingsHub&&axSettingsHub.show(null)};
    wire(p);paint();
    new MutationObserver(function(){if(!p.hidden){paint();L()&&L().refresh()}}).observe(p,{attributes:true,attributeFilter:["hidden"]});
  }
  function item(k){var r=null;CFG.forEach(function(g){g.items.forEach(function(i){if(i.k===k)r=i})});return r}
  function wire(p){
    p.querySelectorAll("[data-k]").forEach(function(el){
      var evt=(el.tagName==="SELECT")?"change":"input";
      el.addEventListener(evt,function(){
        var k=el.getAttribute("data-k"),it=item(k),v=(el.type==="range")?+el.value:el.value;
        L().setParam(k,v);var o=$("lg-"+k+"-o");if(o)o.textContent=fmt(it,v);chips()
      });
    });
    p.querySelectorAll("[data-preset]").forEach(function(b){b.onclick=function(){L().preset(b.getAttribute("data-preset"));paint()}});
    $("lg-reset").onclick=function(){L().reset();paint()};
    var m=$("lg-master");m.onchange=function(){L().set(m.checked);paint()};
    var lens=$("lg-lens"),prev=$("lg-preview"),sx=0,sy=0,ox=0,oy=0,drag=false;
    lens.addEventListener("pointerdown",function(e){drag=true;sx=e.clientX;sy=e.clientY;ox=+lens.getAttribute("data-x")||0;oy=+lens.getAttribute("data-y")||0;try{lens.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
    lens.addEventListener("pointermove",function(e){if(!drag)return;var r=prev.getBoundingClientRect(),lw=lens.offsetWidth,lh=lens.offsetHeight,mx=(r.width-lw)/2-6,my=(r.height-lh)/2-6;
      var nx=Math.max(-mx,Math.min(mx,ox+e.clientX-sx)),ny=Math.max(-my,Math.min(my,oy+e.clientY-sy));lens.setAttribute("data-x",nx);lens.setAttribute("data-y",ny);lens.style.transform="translate("+nx+"px,"+ny+"px)"});
    function up(){drag=false}lens.addEventListener("pointerup",up);lens.addEventListener("pointercancel",up);
  }
  function chips(){
    var cur=L()?L().matches():null;
    d.querySelectorAll("#lg-chips [data-preset]").forEach(function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-preset")===cur))});
    var s=$("lg-sub");if(s)s.textContent=cur?("Preset: "+L().presets[cur].label):"Custom settings";
  }
  function paint(){
    var A=L(),p=$("ax-sp-glass");if(!A||!p)return;
    var P=A.params;
    CFG.forEach(function(g){g.items.forEach(function(it){var el=$("lg-"+it.k);if(!el)return;el.value=P[it.k];var o=$("lg-"+it.k+"-o");if(o)o.textContent=fmt(it,P[it.k])})});
    var m=$("lg-master");m.checked=!!A.isOn();m.disabled=!A.supported();
    var n=$("lg-note");if(n)n.textContent=!A.supported()?"Real refraction needs Chrome on Android. This browser shows a plain frosted glass instead.":(A.isOn()?"Drag the glass around":"Liquid glass is off. Turn it on to see the refraction.");
    chips();
  }

  /* ---------- hub upgrades ---------- */
  var QUICK=[
    {q:"theme",t:"Theme",icon:'<svg viewBox="0 0 24 24" class="ax-ic"><use href="#i-sun"/></svg>'},
    {q:"glass",t:"Liquid glass",icon:'<svg viewBox="0 0 24 24" class="ax-ic"><use href="#i-drop"/></svg>'},
    {q:"voice",t:"Voice",icon:'<svg viewBox="0 0 24 24" class="ax-ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7"/></svg>'},
    {q:"haptics",t:"Haptics",icon:'<svg viewBox="0 0 24 24" class="ax-ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 8v8M20 8v8"/></svg>'}
  ];
  function theme(){return (w.PR&&PR.v2Theme)||"dark"}
  function tileState(q){
    var A=L(),c;
    if(q==="theme"){var t=theme();return {on:t!=="dark",text:t==="system"?"System":(t==="light"?"Light":"Dark")}}
    if(q==="glass"){if(!A||!A.supported())return {on:false,text:"Chrome only",off:true};return {on:A.isOn(),text:A.isOn()?"On":"Off"}}
    if(q==="voice"){c=$("t-voi");return {on:!!(c&&c.checked),text:c&&c.checked?"On":"Off",off:!c}}
    c=$("t-hap");return {on:!!(c&&c.checked),text:c&&c.checked?"On":"Off",off:!c};
  }
  function tiles(){
    var q=$("v2-quick");if(!q)return;
    q.querySelectorAll("[data-q]").forEach(function(b){var s=tileState(b.getAttribute("data-q"));b.setAttribute("aria-pressed",String(!!s.on));b.disabled=!!s.off;b.querySelector("em").textContent=s.text});
  }
  function tapTile(k){
    var A=L(),c;
    if(k==="theme"){var n={dark:"light",light:"system",system:"dark"}[theme()]||"dark";if(w.PR){PR.v2Theme=n;w.save&&save()}root.setAttribute("data-theme",n);if(w.AxV2&&AxV2.apply)AxV2.apply()}
    else if(k==="glass"){if(A&&A.supported())A.set(!A.isOn())}
    else if(k==="voice"){c=$("t-voi");if(c)c.click()}
    else{c=$("t-hap");if(c)c.click()}
    setTimeout(tiles,60);
  }
  function glassSub(){var A=L();if(!A)return "Blur, reflection, refraction";var m=A.matches();return (A.isOn()?"On":(A.supported()?"Off":"Chrome only"))+" · "+(m?A.presets[m].label:"Custom")}
  function enhanceHub(){
    pending=0;
    var hub=$("ax-sm");if(!hub||!root.classList.contains("v2")||!hub.querySelector(".v2-settings-card"))return;
    if(!hub.querySelector('[data-sp="glass"]')){
      var look=hub.querySelector('[data-sp="look"]');
      if(look){var b=d.createElement("button");b.type="button";b.className="ax-lr ax-smr";b.setAttribute("data-sp","glass");b.setAttribute("aria-label","Glass studio");
        b.innerHTML=ic("i-drop")+'<span><b>Glass studio</b><em>'+glassSub()+'</em></span>'+ic("i-chev","ax-chv");
        b.onclick=function(){w.axSettingsHub&&axSettingsHub.show("glass")};look.parentNode.insertBefore(b,look.nextSibling)}
    }
    if(!$("v2-quick")){
      var sec=d.createElement("section");sec.id="v2-quick";sec.setAttribute("aria-label","Quick settings");
      sec.innerHTML=QUICK.map(function(t){return '<button type="button" class="v2-q-tile" data-q="'+t.q+'" aria-pressed="false"><span class="v2-q-ic">'+t.icon+'</span><span class="v2-q-t"><b>'+t.t+'</b><em></em></span></button>'}).join("");
      var search=$("v2-settings-search");hub.insertBefore(sec,search?search.nextSibling:hub.firstChild);
      sec.querySelectorAll("[data-q]").forEach(function(b){b.onclick=function(){tapTile(b.getAttribute("data-q"))}});
    }
    tiles();buildPage();
  }
  function schedule(){if(pending)return;pending=1;raf(enhanceHub)}
  function cleanup(){var q=$("v2-quick"),g=$("ax-sp-glass"),r=d.querySelector('#ax-sm [data-sp="glass"]');if(q)q.remove();if(r)r.remove();if(g)g.remove()}
  function start(){
    var sec=$("ax-v-set");
    if(sec&&w.MutationObserver)new MutationObserver(function(){if(root.classList.contains("v2"))schedule()}).observe(sec,{childList:true,subtree:true});
    if(w.AxV2&&AxV2.apply&&!AxV2.apply.__gs){var o=AxV2.apply;AxV2.apply=function(){var r=o.apply(this,arguments);if(root.classList.contains("v2"))schedule();else cleanup();return r};AxV2.apply.__gs=1}
    schedule();
  }
  if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",function(){setTimeout(start,700)});else setTimeout(start,700);
})(window,document);

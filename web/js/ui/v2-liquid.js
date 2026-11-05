/* Arya Fit V2 - Liquid Glass.
   REFRACTION ENGINE COPIED UNMODIFIED from https://github.com/archisvaze/liquid-glass (index.html), MIT License,
   Copyright (c) 2026 Archis Vaze (full licence text: docs/licenses/liquid-glass-LICENSE.txt).
   Copied verbatim: SURFACE_FNS, calculateRefractionProfile, generateDisplacementMap, generateSpecularMap and the SVG filter markup
   (feGaussianBlur -> feDisplacementMap -> specular layer). Only the wiring below (per-element filter ids, targets, toggle) is Arya code.
   Real refraction needs backdrop-filter:url() = Chromium only (Android Chrome/WebView); other engines keep the normal frosted look. */
(function(w,d){
  "use strict";
  /* ===== begin copied code (archisvaze/liquid-glass, MIT) ===== */
  const SURFACE_FNS = {
              convex_squircle: (x) => Math.pow(1 - Math.pow(1 - x, 4), 0.25),
              convex_circle: (x) => Math.sqrt(1 - (1 - x) * (1 - x)),
              concave: (x) => 1 - Math.sqrt(1 - (1 - x) * (1 - x)),
              lip: (x) => {
                  const convex = Math.pow(1 - Math.pow(1 - Math.min(x * 2, 1), 4), 0.25);
                  const concave = 1 - Math.sqrt(1 - (1 - x) * (1 - x)) + 0.1;
                  const t = 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
                  return convex * (1 - t) + concave * t;
              },
          };

          function calculateRefractionProfile(glassThickness, bezelWidth, heightFn, ior, samples) {
              samples = samples || 128;
              const eta = 1 / ior;
              function refract(nx, ny) {
                  const dot = ny;
                  const k = 1 - eta * eta * (1 - dot * dot);
                  if (k < 0) return null;
                  const sq = Math.sqrt(k);
                  return [-(eta * dot + sq) * nx, eta - (eta * dot + sq) * ny];
              }
              const profile = new Float64Array(samples);
              for (let i = 0; i < samples; i++) {
                  const x = i / samples;
                  const y = heightFn(x);
                  const dx = x < 1 ? 0.0001 : -0.0001;
                  const y2 = heightFn(x + dx);
                  const deriv = (y2 - y) / dx;
                  const mag = Math.sqrt(deriv * deriv + 1);
                  const ref = refract(-deriv / mag, -1 / mag);
                  if (!ref) {
                      profile[i] = 0;
                      continue;
                  }
                  profile[i] = ref[0] * ((y * bezelWidth + glassThickness) / ref[1]);
              }
              return profile;
          }

          function generateDisplacementMap(w, h, radius, bezelWidth, profile, maxDisp) {
              const c = document.createElement('canvas');
              c.width = w;
              c.height = h;
              const ctx = c.getContext('2d');
              const img = ctx.createImageData(w, h);
              const d = img.data;
              for (let i = 0; i < d.length; i += 4) {
                  d[i] = 128;
                  d[i + 1] = 128;
                  d[i + 2] = 0;
                  d[i + 3] = 255;
              }

              const r = radius,
                  rSq = r * r,
                  r1Sq = (r + 1) ** 2;
              const rBSq = Math.max(r - bezelWidth, 0) ** 2;
              const wB = w - r * 2,
                  hB = h - r * 2,
                  S = profile.length;

              for (let y1 = 0; y1 < h; y1++) {
                  for (let x1 = 0; x1 < w; x1++) {
                      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
                      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
                      const dSq = x * x + y * y;
                      if (dSq > r1Sq || dSq < rBSq) continue;
                      const dist = Math.sqrt(dSq);
                      const fromSide = r - dist;
                      const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
                      if (op <= 0 || dist === 0) continue;
                      const cos = x / dist,
                          sin = y / dist;
                      const bi = Math.min(((fromSide / bezelWidth) * S) | 0, S - 1);
                      const disp = profile[bi] || 0;
                      const dX = (-cos * disp) / maxDisp,
                          dY = (-sin * disp) / maxDisp;
                      const idx = (y1 * w + x1) * 4;
                      d[idx] = (128 + dX * 127 * op + 0.5) | 0;
                      d[idx + 1] = (128 + dY * 127 * op + 0.5) | 0;
                  }
              }
              ctx.putImageData(img, 0, 0);
              return c.toDataURL();
          }

          function generateSpecularMap(w, h, radius, bezelWidth, angle) {
              angle = angle != null ? angle : Math.PI / 3;
              const c = document.createElement('canvas');
              c.width = w;
              c.height = h;
              const ctx = c.getContext('2d');
              const img = ctx.createImageData(w, h);
              const d = img.data;
              d.fill(0);

              const r = radius,
                  rSq = r * r,
                  r1Sq = (r + 1) ** 2;
              const rBSq = Math.max(r - bezelWidth, 0) ** 2;
              const wB = w - r * 2,
                  hB = h - r * 2;
              const sv = [Math.cos(angle), Math.sin(angle)];

              for (let y1 = 0; y1 < h; y1++) {
                  for (let x1 = 0; x1 < w; x1++) {
                      const x = x1 < r ? x1 - r : x1 >= w - r ? x1 - r - wB : 0;
                      const y = y1 < r ? y1 - r : y1 >= h - r ? y1 - r - hB : 0;
                      const dSq = x * x + y * y;
                      if (dSq > r1Sq || dSq < rBSq) continue;
                      const dist = Math.sqrt(dSq);
                      const fromSide = r - dist;
                      const op = dSq < rSq ? 1 : 1 - (dist - Math.sqrt(rSq)) / (Math.sqrt(r1Sq) - Math.sqrt(rSq));
                      if (op <= 0 || dist === 0) continue;
                      const cos = x / dist,
                          sin = -y / dist;
                      const dot = Math.abs(cos * sv[0] + sin * sv[1]);
                      const edge = Math.sqrt(Math.max(0, 1 - (1 - fromSide) ** 2));
                      const coeff = dot * edge;
                      const col = (255 * coeff) | 0;
                      const alpha = (col * coeff * op) | 0;
                      const idx = (y1 * w + x1) * 4;
                      d[idx] = col;
                      d[idx + 1] = col;
                      d[idx + 2] = col;
                      d[idx + 3] = alpha;
                  }
              }
              ctx.putImageData(img, 0, 0);
              return c.toDataURL();
          }

  /* ===== end copied code ===== */

  /* ---- Arya wiring ------------------------------------------------------ */
  var root=d.documentElement,NS="http://www.w3.org/2000/svg",SEL=".v2-glass:not(.v2-mini-collapsed),.v2-icon-button,.v2-avatar,.lg-lens";
  /* defaults = the author's demo defaults */
  var DEFAULTS={surface:"convex_squircle",thickness:80,bezel:60,ior:3.0,scale:1.0,blur:0.3,specOpacity:0.5,specSat:4,
    tintColor:"#ffffff",tintOp:6,glowColor:"#ffffff",glowBlur:20,glowSpread:-5,shadowBlur:24};
  var PRESETS={
    ios:{label:"iOS 26",v:{}},
    subtle:{label:"Subtle",v:{thickness:40,bezel:24,ior:1.6,scale:.6,blur:.6,specOpacity:.35,specSat:3,tintOp:8,glowBlur:14,glowSpread:-4,shadowBlur:18}},
    crystal:{label:"Crystal",v:{thickness:120,bezel:40,ior:2.4,scale:1.2,blur:0,specOpacity:.8,specSat:8,tintOp:3,glowBlur:18,glowSpread:-4}},
    frosted:{label:"Frosted",v:{thickness:30,bezel:20,ior:1.3,scale:.4,blur:4,specOpacity:.25,specSat:2,tintOp:14,glowBlur:18,glowSpread:-6}},
    dense:{label:"Dense",v:{thickness:160,bezel:50,ior:3,scale:1.6,blur:.2,specOpacity:.7,specSat:6,tintOp:4,glowBlur:24,glowSpread:-3,shadowBlur:30}}
  };
  var P={},stored={},ver=0,saveT=0,rebT=0;
  var svg=null,defs=null,cache={},targets=[],ro=null,queued=0,on=false;
  function pref(){return w.PR||null}
  function copy(o){var r={},k;for(k in o)r[k]=o[k];return r}
  function loadParams(){
    P=copy(DEFAULTS);var p=pref(),sv=p&&p.v2LiquidP;stored={};
    if(sv&&typeof sv==="object"){for(var k in sv)if(k in DEFAULTS&&typeof sv[k]===typeof DEFAULTS[k]){P[k]=sv[k];stored[k]=sv[k]}}
    w.AxLiquid&&(w.AxLiquid.params=P);
  }
  function persist(){clearTimeout(saveT);saveT=setTimeout(function(){var p=pref();if(!p)return;if(Object.keys(stored).length)p.v2LiquidP=copy(stored);else delete p.v2LiquidP;try{w.save&&w.save()}catch(e){}},350)}
  function hexRgb(h){var m=/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h||"");return m?[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]:[255,255,255]}
  function applyMaterial(){
    var t=hexRgb(P.tintColor),op=Math.max(0,Math.min(100,P.tintOp))/100,st=root.style;
    st.setProperty("--lg-tint","rgba("+t[0]+","+t[1]+","+t[2]+","+op+")");
    st.setProperty("--lg-tint-light","rgba("+t[0]+","+t[1]+","+t[2]+","+Math.min(1,op+.12)+")");
    st.setProperty("--lg-glow","inset 0 0 "+P.glowBlur+"px "+P.glowSpread+"px "+P.glowColor);
    st.setProperty("--lg-shadow","0 4px "+P.shadowBlur+"px rgba(0,0,0,.18)");
  }
  function clearMaterial(){["--lg-tint","--lg-tint-light","--lg-glow","--lg-shadow"].forEach(function(n){root.style.removeProperty(n)})}
  function supported(){
    try{
      var ua=navigator.userAgent||"";
      if(!/Chrome\/\d+/.test(ua)||/Edg\/|OPR\/|Firefox|CriOS|FxiOS/.test(ua))return false;
      return !!(w.CSS&&CSS.supports&&CSS.supports("backdrop-filter","blur(1px)"));
    }catch(e){return false}
  }
  function wanted(){
    var p=pref();
    if(!root.classList.contains("v2")||root.getAttribute("data-fx")==="solid")return false;
    if(p&&p.v2Liquid===0)return false;
    return supported();
  }
  function ensureSvg(){
    if(svg)return;
    svg=d.createElementNS(NS,"svg");svg.setAttribute("width","0");svg.setAttribute("height","0");svg.setAttribute("aria-hidden","true");
    svg.style.cssText="position:absolute;width:0;height:0;pointer-events:none";defs=d.createElementNS(NS,"defs");svg.appendChild(defs);d.body.appendChild(svg);
  }
  /* same maths as the author's rebuildFilter(), per element size */
  function filterFor(wd,ht,rad){
    var radius=Math.floor(Math.min(rad,wd/2,ht/2)),id="lg"+ver+"-"+wd+"x"+ht+"r"+radius;
    if(cache[id])return id;
    ensureSvg();
    var heightFn=SURFACE_FNS[P.surface]||SURFACE_FNS.convex_squircle,clampedBezel=Math.max(1,Math.min(P.bezel,radius-1,Math.min(wd,ht)/2-1));
    var profile=calculateRefractionProfile(P.thickness,clampedBezel,heightFn,P.ior,128);
    var maxDisp=Math.max.apply(null,Array.prototype.map.call(profile,Math.abs))||1;
    var dispUrl=generateDisplacementMap(wd,ht,radius,clampedBezel,profile,maxDisp);
    var specUrl=generateSpecularMap(wd,ht,radius,clampedBezel*2.5);
    var scale=maxDisp*P.scale;
    var markup='<filter id="'+id+'" x="0%" y="0%" width="100%" height="100%">'+
      '<feGaussianBlur in="SourceGraphic" stdDeviation="'+P.blur+'" result="blurred_source" />'+
      '<feImage href="'+dispUrl+'" x="0" y="0" width="'+wd+'" height="'+ht+'" result="disp_map" />'+
      '<feDisplacementMap in="blurred_source" in2="disp_map" scale="'+scale+'" xChannelSelector="R" yChannelSelector="G" result="displaced" />'+
      '<feColorMatrix in="displaced" type="saturate" values="'+P.specSat+'" result="displaced_sat" />'+
      '<feImage href="'+specUrl+'" x="0" y="0" width="'+wd+'" height="'+ht+'" result="spec_layer" />'+
      '<feComposite in="displaced_sat" in2="spec_layer" operator="in" result="spec_masked" />'+
      '<feComponentTransfer in="spec_layer" result="spec_faded"><feFuncA type="linear" slope="'+P.specOpacity+'" /></feComponentTransfer>'+
      '<feBlend in="spec_masked" in2="displaced" mode="normal" result="with_sat" />'+
      '<feBlend in="spec_faded" in2="with_sat" mode="normal" /></filter>';
    defs.insertAdjacentHTML("beforeend",markup);cache[id]=1;return id;
  }
  function apply(el){
    var r=el.getBoundingClientRect();if(r.width<24||r.height<24){clear(el);return}
    var cs=getComputedStyle(el),rad=parseFloat(cs.borderTopLeftRadius)||0,id=filterFor(Math.round(r.width),Math.round(r.height),rad),val="url(#"+id+")";
    el.style.setProperty("backdrop-filter",val,"important");el.style.setProperty("-webkit-backdrop-filter",val,"important");el.setAttribute("data-liquid-el","1");
  }
  function clear(el){el.style.removeProperty("backdrop-filter");el.style.removeProperty("-webkit-backdrop-filter");el.removeAttribute("data-liquid-el")}
  function scan(){
    queued=0;if(!on)return;
    var list=[].slice.call(d.querySelectorAll(SEL));
    targets.forEach(function(t){if(list.indexOf(t)<0){clear(t);try{ro&&ro.unobserve(t)}catch(e){}}});
    list.forEach(function(t){if(targets.indexOf(t)<0&&ro)ro.observe(t);apply(t)});
    targets=list;
  }
  function queue(){if(queued)return;queued=1;(w.requestAnimationFrame||setTimeout)(scan)}
  function rebuild(){ver++;cache={};if(defs)defs.innerHTML="";queue()}
  function rebuildSoon(){clearTimeout(rebT);rebT=setTimeout(rebuild,70)}
  function enable(){
    if(on)return;on=true;root.setAttribute("data-liquid","1");applyMaterial();
    if(w.ResizeObserver)ro=new ResizeObserver(queue);
    queue();
  }
  function disable(){
    if(!on&&!root.hasAttribute("data-liquid"))return;on=false;root.removeAttribute("data-liquid");clearMaterial();
    targets.forEach(clear);targets=[];if(ro){try{ro.disconnect()}catch(e){}ro=null}
    if(svg&&svg.parentNode)svg.parentNode.removeChild(svg);svg=null;defs=null;cache={};
  }
  function sync(){if(wanted())enable();else disable();if(on)queue()}
  function setLiquid(v){var p=pref();if(!p)return false;if(v)delete p.v2Liquid;else p.v2Liquid=0;try{w.save&&w.save()}catch(e){}sync();return true}
  function setParam(k,v){
    if(!(k in DEFAULTS))return false;
    if(typeof DEFAULTS[k]==="number"){v=+v;if(!isFinite(v))return false}
    P[k]=v;if(v===DEFAULTS[k])delete stored[k];else stored[k]=v;persist();
    if(on){applyMaterial();rebuildSoon()}return true;
  }
  function preset(name){
    var pr=PRESETS[name];if(!pr)return false;
    P=copy(DEFAULTS);var k;for(k in pr.v)P[k]=pr.v[k];stored={};
    for(k in P)if(P[k]!==DEFAULTS[k])stored[k]=P[k];
    w.AxLiquid.params=P;persist();if(on){applyMaterial();rebuild()}return true;
  }
  function reset(){return preset("ios")}
  function matches(){var n=null,k;for(k in PRESETS){var t=copy(DEFAULTS),j;for(j in PRESETS[k].v)t[j]=PRESETS[k].v[j];var same=true;for(j in t)if(t[j]!==P[j]){same=false;break}if(same){n=k;break}}return n}
  w.AxLiquid={sync:sync,set:setLiquid,supported:supported,isOn:function(){return on},params:P,defaults:DEFAULTS,presets:PRESETS,
    setParam:setParam,preset:preset,reset:reset,matches:matches,refresh:queue,rebuild:rebuild};
  loadParams();
  function hook(){
    if(w.AxV2&&typeof AxV2.apply==="function"&&!AxV2.apply.__lg){var old=AxV2.apply;AxV2.apply=function(){var r=old.apply(this,arguments);sync();return r};AxV2.apply.__lg=1}
    if(typeof w.go==="function"&&!w.go.__lg){var og=w.go;w.go=function(){var r=og.apply(this,arguments);queue();return r};w.go.__lg=1}
    var obs=new MutationObserver(function(){if(on)queue()}),host=d.getElementById("v2-shell-controls");
    if(host)obs.observe(host,{childList:true,subtree:true});
  }
  function init(){loadParams();hook();sync();w.setTimeout(function(){loadParams();hook();sync()},900)}
  if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",init);else init();
  w.addEventListener("load",function(){hook();sync()});
})(window,document);

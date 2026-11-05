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
  var root=d.documentElement,NS="http://www.w3.org/2000/svg",SEL=".v2-glass:not(.v2-mini-collapsed),.v2-icon-button,.v2-avatar";
  /* the author's default settings from the demo */
  var P={surface:"convex_squircle",thickness:80,bezel:60,ior:3.0,scale:1.0,blur:0.3,specOpacity:0.5,specSat:4};
  var svg=null,defs=null,cache={},targets=[],ro=null,queued=0,on=false;
  function pref(){return w.PR||null}
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
    var radius=Math.floor(Math.min(rad,wd/2,ht/2)),id="lg-"+wd+"x"+ht+"r"+radius;
    if(cache[id])return id;
    ensureSvg();
    var heightFn=SURFACE_FNS[P.surface],clampedBezel=Math.max(1,Math.min(P.bezel,radius-1,Math.min(wd,ht)/2-1));
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
  function enable(){
    if(on)return;on=true;root.setAttribute("data-liquid","1");
    if(w.ResizeObserver)ro=new ResizeObserver(queue);
    queue();
  }
  function disable(){
    if(!on&&!root.hasAttribute("data-liquid"))return;on=false;root.removeAttribute("data-liquid");
    targets.forEach(clear);targets=[];if(ro){try{ro.disconnect()}catch(e){}ro=null}
    if(svg&&svg.parentNode)svg.parentNode.removeChild(svg);svg=null;defs=null;cache={};
  }
  function sync(){if(wanted())enable();else disable();if(on)queue()}
  function setLiquid(v){var p=pref();if(!p)return false;if(v)delete p.v2Liquid;else p.v2Liquid=0;try{w.save&&w.save()}catch(e){}sync();return true}
  w.AxLiquid={sync:sync,set:setLiquid,supported:supported,isOn:function(){return on},params:P,rebuild:function(){cache={};if(defs)defs.innerHTML="";queue()}};
  function hook(){
    if(w.AxV2&&typeof AxV2.apply==="function"&&!AxV2.apply.__lg){var old=AxV2.apply;AxV2.apply=function(){var r=old.apply(this,arguments);sync();return r};AxV2.apply.__lg=1}
    if(typeof w.go==="function"&&!w.go.__lg){var og=w.go;w.go=function(){var r=og.apply(this,arguments);queue();return r};w.go.__lg=1}
    var obs=new MutationObserver(function(){if(on)queue()}),host=d.getElementById("v2-shell-controls");
    if(host)obs.observe(host,{childList:true,subtree:true});
  }
  function init(){hook();sync();w.setTimeout(function(){hook();sync()},900)}
  if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",init);else init();
  w.addEventListener("load",function(){hook();sync()});
})(window,document);

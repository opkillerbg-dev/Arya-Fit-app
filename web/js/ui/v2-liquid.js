/* Arya Fit V2 - Liquid Glass.
   Real backdrop refraction for small floating controls (nav pill, round buttons, avatar, mini-session pill, popover).
   Technique (own implementation, same ideas as iyinchao/liquid-glass-studio, MIT): rounded-rect SDF -> convex bezel height
   profile -> Snell refraction (n=1.5) -> displacement map -> SVG feDisplacementMap used inside backdrop-filter, with
   per-channel scale for dispersion. Chromium only (Android Chrome / WebView); everything else falls back to the frosted look. */
(function(w,d){
  "use strict";
  var root=d.documentElement,NS="http://www.w3.org/2000/svg",SEL=".v2-glass:not(.v2-mini-collapsed),.v2-icon-button,.v2-avatar";
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
  /* ---- refraction map -------------------------------------------------- */
  function sdRound(px,py,hw,hh,r){var qx=Math.abs(px)-(hw-r),qy=Math.abs(py)-(hh-r),ox=Math.max(qx,0),oy=Math.max(qy,0);return Math.sqrt(ox*ox+oy*oy)+Math.min(Math.max(qx,qy),0)-r}
  function profile(t){ /* t 0..1 from edge to flat; returns refraction strength 0..1 */
    if(t>=1)return 0;
    var u=1-t,h=Math.pow(1-Math.pow(u,4),.25),slope=Math.pow(u,3)*Math.pow(Math.max(1-Math.pow(u,4),1e-4),-.75);
    var th=Math.atan(Math.min(slope,6)),ph=Math.asin(Math.sin(th)/1.5),dl=th-ph;
    return Math.sin(dl)/.4112; /* sin(delta) at theta=atan(6) ~ .4112 -> ~1 */
  }
  function makeMap(W,H,R,B){
    var sc=W*H>150000?.5:1,mw=Math.max(2,Math.round(W*sc)),mh=Math.max(2,Math.round(H*sc)),c=d.createElement("canvas");
    c.width=mw;c.height=mh;
    var g=c.getContext("2d"),img=g.createImageData(mw,mh),px=img.data,hw=W/2,hh=H/2,x,y,i=0;
    for(y=0;y<mh;y++)for(x=0;x<mw;x++,i+=4){
      var X=(x+.5)/sc-hw,Y=(y+.5)/sc-hh,dist=sdRound(X,Y,hw,hh,R),depth=-dist,dx=0,dy=0;
      if(depth>0&&depth<B){
        var s=Math.min(1,profile(depth/B)),qx=Math.abs(X)-(hw-R),qy=Math.abs(Y)-(hh-R),nx,ny;
        if(qx>0&&qy>0){var l=Math.sqrt(qx*qx+qy*qy)||1;nx=qx/l*(X<0?-1:1);ny=qy/l*(Y<0?-1:1)}
        else if(qx>qy){nx=X<0?-1:1;ny=0}else{nx=0;ny=Y<0?-1:1}
        dx=-nx*s;dy=-ny*s; /* sample from toward the centre: convex lens */
      }
      px[i]=Math.round(127.5+dx*127.5);px[i+1]=Math.round(127.5+dy*127.5);px[i+2]=128;px[i+3]=255;
    }
    g.putImageData(img,0,0);return c.toDataURL("image/png");
  }
  function ensureSvg(){
    if(svg)return;
    svg=d.createElementNS(NS,"svg");svg.setAttribute("width","0");svg.setAttribute("height","0");svg.setAttribute("aria-hidden","true");
    svg.style.cssText="position:absolute;width:0;height:0;pointer-events:none";defs=d.createElementNS(NS,"defs");svg.appendChild(defs);d.body.appendChild(svg);
  }
  function filterFor(W,H,R){
    var B=Math.max(5,Math.min(22,Math.min(W,H)*.34)),key=W+"x"+H+"r"+Math.round(R),id="v2lg-"+key.replace(/[^a-z0-9]/gi,"_");
    if(cache[id])return id;
    ensureSvg();
    var D=Math.max(6,B*.95),url=makeMap(W,H,R,B),f=d.createElementNS(NS,"filter");
    f.setAttribute("id",id);f.setAttribute("x","0");f.setAttribute("y","0");f.setAttribute("width","1");f.setAttribute("height","1");f.setAttribute("color-interpolation-filters","sRGB");
    function el(n,a){var e=d.createElementNS(NS,n),k;for(k in a)e.setAttribute(k,a[k]);f.appendChild(e);return e}
    var im=el("feImage",{x:"0",y:"0",width:String(W),height:String(H),preserveAspectRatio:"none",result:"map"});
    im.setAttribute("href",url);im.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",url);
    var ch=[["r",1,"1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"],["g",.93,"0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"],["b",.86,"0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"]];
    ch.forEach(function(c){
      el("feDisplacementMap",{"in":"SourceGraphic",in2:"map",scale:String((2*D*c[1]).toFixed(2)),xChannelSelector:"R",yChannelSelector:"G",result:"d"+c[0]});
      el("feColorMatrix",{"in":"d"+c[0],type:"matrix",values:c[2],result:c[0]});
    });
    el("feBlend",{"in":"r",in2:"g",mode:"screen",result:"rg"});el("feBlend",{"in":"rg",in2:"b",mode:"screen"});
    defs.appendChild(f);cache[id]=1;return id;
  }
  /* ---- targets --------------------------------------------------------- */
  function apply(el){
    var r=el.getBoundingClientRect();if(r.width<24||r.height<24){clear(el);return}
    var cs=getComputedStyle(el),rad=parseFloat(cs.borderTopLeftRadius)||0,W=Math.round(r.width),H=Math.round(r.height),R=Math.min(rad,Math.min(W,H)/2);
    var id=filterFor(W,H,R),val="blur(7px) url(#"+id+") saturate(1.5) brightness(1.04)";
    el.style.setProperty("backdrop-filter",val,"important");el.style.setProperty("-webkit-backdrop-filter",val,"important");el.setAttribute("data-liquid-el","1");
  }
  function clear(el){el.style.removeProperty("backdrop-filter");el.style.removeProperty("-webkit-backdrop-filter");el.removeAttribute("data-liquid-el")}
  function scan(){
    queued=0;if(!on)return;
    var list=[].slice.call(d.querySelectorAll(SEL)),i;
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
  w.AxLiquid={sync:sync,set:setLiquid,supported:supported,isOn:function(){return on}};
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

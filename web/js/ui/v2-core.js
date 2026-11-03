/* V2 foundation state. Pure helpers are exported for node tests; DOM work stays optional. */
(function(root){
  "use strict";
  var FX={full:1,lite:1,solid:1};
  function choice(info,opt){
    info=info||{};opt=opt||{};
    if(opt.reducedTransparency)return "solid";
    if(opt.reducedMotion)return "lite";
    if(FX[opt.forced])return opt.forced;
    if(opt.liteSignal)return "lite";
    if(info.reason==="timeout")return "solid";
    if(info.tier==="relaxed")return "lite";
    if(info.reason==="stable"&&info.tier==="strict"&&info.fps>0&&info.base>0&&info.fps>=900/info.base)return "full";
    return "lite";
  }
  function scrollDirection(last,next,prior){
    var d=next-last;if(Math.abs(d)<(prior&&prior.collapsed?12:24))return prior&&prior.direction||"none";
    return d>0?"down":"up";
  }
  function pref(){return root.PR&&typeof root.PR==="object"?root.PR:null}
  function apply(){
    if(!root.document)return;
    var p=pref()||{},h=document.documentElement,on=p.v2===1;
    h.classList.toggle("v2",on);
    if(p.v2Accent)h.setAttribute("data-accent",p.v2Accent);else h.removeAttribute("data-accent");
    h.setAttribute("data-fx",choice(root.axBootInfo,{forced:p.v2Fx,liteSignal:h.classList.contains("ax-lite-glass"),reducedMotion:root.matchMedia&&root.matchMedia("(prefers-reduced-motion: reduce)").matches,reducedTransparency:root.matchMedia&&root.matchMedia("(prefers-reduced-transparency: reduce)").matches}));
  }
  function enabled(on){var p=pref();if(!p)return false;p.v2=on?1:0;try{root.save&&root.save()}catch(e){}api.apply();return true}
  function accent(name){var p=pref();if(!p||!(/^(blue|ruby|teal|orange|gold)$/.test(name||"")))return false;p.v2Accent=name;try{root.save&&root.save()}catch(e){}api.apply();return true}
  function fx(name){var p=pref();if(!p||!FX[name])return false;p.v2Fx=name;try{root.save&&root.save()}catch(e){}api.apply();return true}
  function init(){apply();if(root.addEventListener)root.addEventListener("load",apply)}
  var api={chooseFx:choice,scrollDirection:scrollDirection,apply:apply,setEnabled:enabled,setAccent:accent,setFx:fx,init:init};
  root.AxV2=api;
  if(root.document){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init()}
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);

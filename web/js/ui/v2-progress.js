/* Arya Fit V2 P5 — Progress presentation enhancer. Existing prog()/axPs() own all data and interactions. */
(function(w,d){
  "use strict";
  var html=d.documentElement,view=d.getElementById("ax-v-prog"),obs=null;
  function on(){return html.classList.contains("v2")}
  function apply(){
    if(!view)return;
    if(on()){view.classList.add("v2-progress-ready");var st=d.getElementById("ax-ps-stats"),hd=st&&st.querySelector(".ax-prog-sectionhead");if(hd)hd.classList.add("v2-duplicate-title")}
    else{view.classList.remove("v2-progress-ready");var st2=d.getElementById("ax-ps-stats"),hd2=st2&&st2.querySelector(".ax-prog-sectionhead");if(hd2)hd2.classList.remove("v2-duplicate-title")}
  }
  function hook(){
    if(typeof w.go==="function"&&!w.go.__v2Progress){
      var old=w.go;
      var wrapped=function(v){var r=old.apply(this,arguments);apply();return r};
      wrapped.__v2Progress=true;w.go=wrapped;
    }
    if(typeof w.prog==="function"&&!w.prog.__v2Progress){
      var pg=w.prog;
      var wrappedProg=function(){var r=pg.apply(this,arguments);apply();return r};
      wrappedProg.__v2Progress=true;w.prog=wrappedProg;
    }
    if(w.AxV2&&typeof w.AxV2.apply==="function"&&!w.AxV2.apply.__v2Progress){
      var ap=w.AxV2.apply;
      var wrappedApply=function(){var r=ap.apply(this,arguments);apply();return r};
      wrappedApply.__v2Progress=true;w.AxV2.apply=wrappedApply;
    }
  }
  if(view&&typeof MutationObserver!=="undefined"){
    obs=new MutationObserver(function(){if(on()&&view.classList.contains("v2-progress-ready"))apply()});
    obs.observe(view,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
  }
  var last=on();var htmlObs=new MutationObserver(function(){var n=on();if(n!==last){last=n;apply()}});
  htmlObs.observe(html,{attributes:true,attributeFilter:["class"]});
  hook();apply();
  d.addEventListener("visibilitychange",apply);
})(window,document);

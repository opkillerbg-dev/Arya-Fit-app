/* Arya Fit V2 P4 — Plan/Plans presentation enhancer. No plan data or handlers are rebuilt. */
(function(w,d){
  "use strict";
  var html=d.documentElement,plan=d.getElementById("ax-v-plan"),plans=d.getElementById("ax-v-plans"),mo=null;
  function on(){return html.classList.contains("v2")}
  function clear(){
    if(plan)plan.classList.remove("v2-plan-ready");
    if(plans)plans.classList.remove("v2-plans-ready");
  }
  function apply(){
    if(!on()){clear();return}
    if(plan)plan.classList.add("v2-plan-ready");
    if(plans)plans.classList.add("v2-plans-ready");
  }
  function hook(){
    if(typeof w.go==="function"&&!w.go.__v2Plan){
      var old=w.go;
      var wrapped=function(v){var r=old.apply(this,arguments);apply();return r};
      wrapped.__v2Plan=true;w.go=wrapped;
    }
    if(w.AxV2&&typeof w.AxV2.apply==="function"&&!w.AxV2.apply.__v2Plan){
      var ap=w.AxV2.apply;
      var next=function(){var r=ap.apply(this,arguments);apply();return r};
      next.__v2Plan=true;w.AxV2.apply=next;
    }
  }
  if(plan&&typeof MutationObserver!=="undefined"){
    mo=new MutationObserver(function(){if(on()&&plan.classList.contains("v2-plan-ready"))apply()});
    mo.observe(plan,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
  }
  if(plans&&typeof MutationObserver!=="undefined"){
    var mo2=new MutationObserver(function(){if(on()&&plans.classList.contains("v2-plans-ready"))apply()});
    mo2.observe(plans,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
  }
  var apObs=new MutationObserver(function(){if(!on())clear();else apply()});
  apObs.observe(html,{attributes:true,attributeFilter:["class"]});
  hook();apply();
  d.addEventListener("visibilitychange",apply);
})(window,document);

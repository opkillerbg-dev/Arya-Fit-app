/* onboard-entry.js: S7. Ways in to the personalisation wizard for people who already use the app. Never forced, never overwrites a plan.
   - Home card "Personalise your plan (2 min)" (no profile yet, 30 day snooze with "Not now")
   - Settings > Plan tools: "Personalise my plan" (Start / Redo) and "My profile" (summary + Edit: change answers, save without a new plan) */
(function(root){
  "use strict";
  var $=function(i){return document.getElementById(i)},SNOOZE=30*864e5;
  var GN={muscle:"Build muscle",strength:"Get stronger",fatloss:"Lose fat",run:"Run further",general:"General fitness"},XN={beg:"beginner","int":"intermediate",adv:"advanced"};
  function prof(){try{return root.AxProfile.get()}catch(e){return null}}
  function snoozed(){try{return (root.PR&&+root.PR.obz||0)>Date.now()}catch(e){return false}}
  function summary(p){
    var a=[];if(p.goal&&p.goal.main)a.push(GN[p.goal.main]);if(p.days)a.push(p.days+" days");if(p.mins)a.push(p.mins+" min");if(p.xp)a.push(XN[p.xp]);
    return a.join(", ")||"Saved";
  }
  function homeCard(){
    var old=$("ax-ob-nudge"),anchor=$("ax-hbrain"),show=!prof()&&!snoozed()&&!(root.AxOnboard&&root.AxOnboard.isOpen())&&!(root.AxOnboard&&root.AxOnboard.isFresh()&&root.AxOnboard.AUTOSTART);
    if(!show){if(old)old.remove();return}
    if(old||!anchor||!anchor.parentNode)return;
    var c=document.createElement("div");c.id="ax-ob-nudge";c.className="ax-card";
    c.innerHTML='<p class="ax-cap">Personalise your plan (2 min)</p><p class="ax-sub">Answer a few questions and get a plan that fits your levels, equipment and week. Your current plan stays as it is.</p><div class="ax-chips"><button type="button" class="ax-btn ax-pri" id="ax-ob-go">Start</button><button type="button" class="ax-btn" id="ax-ob-later">Not now</button></div>';
    anchor.parentNode.insertBefore(c,anchor);
    $("ax-ob-go").onclick=function(){c.remove();root.AxOnboard.open()};
    $("ax-ob-later").onclick=function(){try{root.PR.obz=Date.now()+SNOOZE;root.save()}catch(e){}c.remove()};
  }
  function settingsRows(){
    var coach=$("ax-coach-open"),row=coach&&coach.closest(".row");if(!row)return;
    var p=prof(),r1=$("ax-ob-row"),r2=$("ax-ob-prow");
    if(!r1){
      r1=document.createElement("div");r1.className="row";r1.id="ax-ob-row";
      r1.innerHTML='<span><b>Personalise my plan</b><em id="ax-ob-rem"></em></span><button class="btn pri" type="button" id="ax-ob-set"></button>';
      row.parentNode.insertBefore(r1,row);
      $("ax-ob-set").onclick=function(){var q=prof();root.AxOnboard.open(q?{fromProfile:true}:{})};
    }
    $("ax-ob-rem").textContent=p?"Answer again and create a new plan. Your current plan is kept.":"A few questions, a plan that fits your levels.";
    $("ax-ob-set").textContent=p?"Redo":"Start";
    if(p&&!r2){
      r2=document.createElement("div");r2.className="row";r2.id="ax-ob-prow";
      r2.innerHTML='<span><b>My profile</b><em id="ax-ob-psum"></em></span><button class="btn" type="button" id="ax-ob-pedit">Edit</button>';
      r1.parentNode.insertBefore(r2,r1.nextSibling);
      $("ax-ob-pedit").onclick=function(){root.AxOnboard.open({fromProfile:true,edit:true})};
    }
    if(p&&r2)$("ax-ob-psum").textContent=summary(p);
    if(!p&&r2)r2.remove();
  }
  function paint(){try{homeCard()}catch(e){}try{settingsRows()}catch(e){}}
  var _home=root.home;if(typeof _home==="function")root.home=function(){var r=_home.apply(this,arguments);paint();return r};
  /* repaint whenever Home or Settings is shown (other scripts also wrap go(), so watch the views instead) */
  function watch(){["ax-v-set","ax-v-home"].forEach(function(id){var v=$(id);if(!v||v.__obw)return;v.__obw=1;
    new MutationObserver(function(){if(!v.hidden)paint()}).observe(v,{attributes:true,attributeFilter:["hidden"]})})}
  root.AxOnboardEntry={paint:paint,summary:summary};
  function start(){watch();paint()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(start,400)});else setTimeout(start,400);
})(window);

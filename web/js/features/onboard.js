/* onboard.js: first-run personalisation wizard (docs/onboarding/01_UX_SPEC.md). S4 = shell + screens 0-3 (welcome, you, health, goal).
   Full-screen overlay, one question per screen, Back always works (also Android back via axBack), draft saved after every answer
   (AxProfile.draftSet) so closing the app resumes. Answers are stored metric. Strings live in STR for later translation.
   AUTOSTART stays false until the wizard can create a plan (S6): until then it opens only through AxOnboard.open(). */
(function(root){
  "use strict";
  var AUTOSTART=false,SKIPK="aryaOnboardSkip",TOTAL=9;
  var STR={
    welcomeT:"Let's make a plan that fits you",welcomeP:"A few quick questions, about 2 minutes. Everything stays on your phone.",start:"Start",skipAll:"Skip, use a standard plan",
    next:"Next",back:"Back",skip:"Skip",why:"Why we ask: ",
    youT:"About you",youWhy:"Height and weight help set sensible starting loads. Age keeps things safe. All optional.",name:"Name (optional)",units:"Units",height:"Height",weight:"Weight",age:"Age",sex:"Sex",
    sexWhy:"Only used for strength standards.",under18:"Under 18: we will keep it gentle, with no max-effort tests.",
    healthT:"A quick health check",healthQ:"Has a doctor ever said you should not exercise, or do you get chest pain or dizziness when you do?",healthWhy:"So we start safely if you need that.",
    no:"No",yes:"Yes",notsure:"Not sure",healthNote:"Please check with a doctor before you start. We will begin in gentle mode: fewer sets, longer rests and no max-effort tests. This is not medical advice.",
    goalT:"What is your main goal?",goalWhy:"It decides how many sets, and whether running or circuits are added.",extraT:"Anything else? (optional)",
    later:"The remaining questions arrive in the next update. Your answers so far are saved.",close:"Close"
  };
  var GOALS=[["muscle","Build muscle","More sets, steady progress"],["strength","Get stronger","Heavier or harder, fewer sets"],["fatloss","Lose fat and stay fit","Strength plus a circuit day"],["run","Run further","Running first, lighter strength"],["general","General fitness","A balanced week"]];
  var AGES=[["under18","Under 18"],["18-29","18-29"],["30-39","30-39"],["40-49","40-49"],["50-59","50-59"],["60+","60+"]];
  var SEXES=[["m","Male"],["f","Female"],["x","Prefer not to say"]];
  var S=null,step=0,el=null,asked={};
  function $(id){return document.getElementById(id)}
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function P(){return root.AxProfile}
  function save(){try{P().draftSet(Object.assign({},S,{step:step}))}catch(e){}}
  function chips(k,opts,cur){return '<div class="ob-ch" role="group" data-k="'+k+'">'+opts.map(function(o){return '<button type="button" class="ob-c'+(cur===o[0]?' on':'')+'" aria-pressed="'+(cur===o[0])+'" data-v="'+o[0]+'">'+o[1]+'</button>'}).join("")+'</div>'}
  function lab(t,sub){return '<p class="ob-q">'+t+'</p>'+(sub?'<p class="ob-s">'+sub+'</p>':'')}
  function why(t){return '<p class="ob-w">'+STR.why+t+'</p>'}
  /* unit helpers (stored metric) */
  function imp(){return S.units==="imperial"}
  function ftIn(cm){var t=Math.round(cm/2.54);return [Math.floor(t/12),t%12]}
  function numIn(id,label,val,min,max,suffix){
    return '<div class="ob-n"><button type="button" class="ob-st" data-s="-1" data-t="'+id+'" aria-label="'+label+' minus">-</button><label class="ob-nl"><span class="ob-sr">'+label+'</span><input id="'+id+'" type="number" inputmode="decimal" min="'+min+'" max="'+max+'" step="1" value="'+(val==null?"":val)+'" placeholder="'+suffix+'"></label><button type="button" class="ob-st" data-s="1" data-t="'+id+'" aria-label="'+label+' plus">+</button></div>';
  }
  var SCREENS=[
    function welcome(){return {body:'<div class="ob-hero" aria-hidden="true"><svg viewBox="0 0 108 108"><path d="M30 80 52 28 68 63Q72 72 81 79"/></svg></div><h1 class="ob-h">'+STR.welcomeT+'</h1><p class="ob-p">'+STR.welcomeP+'</p>',
      nav:'<button type="button" class="ob-b ob-pri" id="ob-go">'+STR.start+'</button><button type="button" class="ob-b ob-ghost" id="ob-skipall">'+STR.skipAll+'</button>'}},
    function you(){
      var ht=imp()&&S.ht!=null?ftIn(S.ht):null,wt=S.wt==null?null:(imp()?Math.round(S.wt*2.2046):S.wt);
      var h=imp()?'<div class="ob-row">'+numIn("ob-ft","Feet",ht?ht[0]:null,3,7,"ft")+numIn("ob-in","Inches",ht?ht[1]:null,0,11,"in")+'</div>':numIn("ob-ht","Height in centimetres",S.ht,100,230,"cm");
      return {body:'<h1 class="ob-h">'+STR.youT+'</h1>'+why(STR.youWhy)
        +lab(STR.name)+'<input class="ob-in" id="ob-name" maxlength="40" autocomplete="off" aria-label="'+STR.name+'" value="'+esc(S.name)+'">'
        +lab(STR.units)+chips("units",[["metric","cm, kg"],["imperial","ft in, lb"]],S.units)
        +lab(STR.height)+h+lab(STR.weight)+numIn("ob-wt","Weight in "+(imp()?"pounds":"kilograms"),wt,imp()?66:30,imp()?550:250,imp()?"lb":"kg")
        +lab(STR.age)+chips("age",AGES,S.age)+'<p class="ob-note" id="ob-u18" '+(S.age==="under18"?"":"hidden")+'>'+STR.under18+'</p>'
        +lab(STR.sex,STR.sexWhy)+chips("sex",SEXES,S.sex),skip:1};
    },
    function health(){
      var cur=S.health==="check"?(asked.hs==="notsure"?"notsure":"yes"):(asked.h?"no":null);
      return {body:'<h1 class="ob-h">'+STR.healthT+'</h1>'+why(STR.healthWhy)+'<p class="ob-p">'+STR.healthQ+'</p>'
        +chips("health",[["no",STR.no],["yes",STR.yes],["notsure",STR.notsure]],cur)+'<p class="ob-note" id="ob-hn" '+(S.health==="check"?"":"hidden")+'>'+STR.healthNote+'</p>',skip:1};
    },
    function goal(){
      return {body:'<h1 class="ob-h">'+STR.goalT+'</h1>'+why(STR.goalWhy)+'<div class="ob-opts" role="group" data-k="goal">'+GOALS.map(function(g){return '<button type="button" class="ob-o'+(S.goal.main===g[0]?' on':'')+'" aria-pressed="'+(S.goal.main===g[0])+'" data-v="'+g[0]+'"><b>'+g[1]+'</b><span>'+g[2]+'</span></button>'}).join("")+'</div>'
        +lab(STR.extraT)+'<div class="ob-ch" role="group" data-k="extra">'+GOALS.filter(function(g){return g[0]!==S.goal.main}).map(function(g){return '<button type="button" class="ob-c'+(S.goal.extra===g[0]?' on':'')+'" aria-pressed="'+(S.goal.extra===g[0])+'" data-v="'+g[0]+'">'+g[1]+'</button>'}).join("")+'</div>',skip:1};
    }
  ];
  function later(){return {body:'<h1 class="ob-h">'+"Saved"+'</h1><p class="ob-p">'+STR.later+'</p>',nav:'<button type="button" class="ob-b ob-pri" id="ob-close">'+STR.close+'</button>'}}

  function render(dir){
    var sc=step<SCREENS.length?SCREENS[step]():later(),prog=step===0?"":'<div class="ob-pr" role="progressbar" aria-valuemin="0" aria-valuemax="'+TOTAL+'" aria-valuenow="'+Math.min(step,TOTAL)+'" aria-label="Step '+step+' of '+TOTAL+'"><i style="width:'+Math.round(Math.min(step,TOTAL)/TOTAL*100)+'%"></i></div>';
    var nav=sc.nav||('<div class="ob-r"><button type="button" class="ob-b" id="ob-back">'+STR.back+'</button><button type="button" class="ob-b ob-pri" id="ob-next">'+STR.next+'</button></div>'+(sc.skip?'<button type="button" class="ob-b ob-ghost" id="ob-skip">'+STR.skip+'</button>':''));
    el.innerHTML='<div class="ob-top">'+prog+'</div><div class="ob-body '+(dir<0?"ob-b2":"ob-f")+'" tabindex="-1" id="ob-bd">'+sc.body+'</div><div class="ob-nav">'+nav+'</div>';
    wire();var bd=$("ob-bd");if(bd){try{bd.focus({preventScroll:true})}catch(e){}bd.scrollTop=0}
  }
  function go(n,dir){step=Math.max(0,n);save();render(dir||1)}
  function setGoalDefault(){if(!S.goal.main)S.goal.main="general"}
  function wire(){
    var r=el,b;
    if(b=$("ob-go"))b.onclick=function(){go(1,1)};
    if(b=$("ob-skipall"))b.onclick=function(){try{localStorage.setItem(SKIPK,"1")}catch(e){}close()};
    if(b=$("ob-close"))b.onclick=close;
    if(b=$("ob-back"))b.onclick=function(){go(step-1,-1)};
    if(b=$("ob-next"))b.onclick=function(){if(step===3)setGoalDefault();go(step+1,1)};
    if(b=$("ob-skip"))b.onclick=function(){if(step===2){S.health="check";asked.h=1;asked.hs="notsure"}if(step===3){S.goal={main:"general",extra:null}}go(step+1,1)};
    var nm=$("ob-name");if(nm)nm.oninput=function(){S.name=nm.value;save()};
    Array.prototype.forEach.call(r.querySelectorAll(".ob-st"),function(x){x.onclick=function(){var i=$(x.getAttribute("data-t"));if(!i)return;var v=(+i.value||+i.getAttribute("min")||0)+(+x.getAttribute("data-s"));v=Math.max(+i.min,Math.min(+i.max,v));i.value=v;readNums()}});
    ["ob-ht","ob-ft","ob-in","ob-wt"].forEach(function(id){var i=$(id);if(i)i.oninput=readNums});
    Array.prototype.forEach.call(r.querySelectorAll(".ob-ch[data-k]"),function(box){
      var k=box.getAttribute("data-k");
      Array.prototype.forEach.call(box.querySelectorAll(".ob-c"),function(c){c.onclick=function(){
        var v=c.getAttribute("data-v");
        if(k==="units"){if(S.units!==v){S.units=v;save();render(1)}return}
        if(k==="health"){asked.h=1;asked.hs=v;S.health=v==="no"?"ok":"check";var n=$("ob-hn");if(n)n.hidden=S.health!=="check"}
        else if(k==="extra"){S.goal.extra=S.goal.extra===v?null:v}
        else S[k]=S[k]===v?null:v;
        Array.prototype.forEach.call(box.querySelectorAll(".ob-c"),function(x){var on=k==="health"?x.getAttribute("data-v")===v:(k==="extra"?S.goal.extra===x.getAttribute("data-v"):S[k]===x.getAttribute("data-v"));x.classList.toggle("on",on);x.setAttribute("aria-pressed",on)});
        if(k==="age"){var u=$("ob-u18");if(u)u.hidden=S.age!=="under18"}
        save();
      }});
    });
    var gb=r.querySelector('.ob-opts[data-k="goal"]');
    if(gb)Array.prototype.forEach.call(gb.querySelectorAll(".ob-o"),function(o){o.onclick=function(){S.goal.main=o.getAttribute("data-v");if(S.goal.extra===S.goal.main)S.goal.extra=null;save();render(1)}});
  }
  function readNums(){
    var n=function(id){var i=$(id);return i&&i.value!==""&&isFinite(+i.value)?+i.value:null};
    if(imp()){var ft=n("ob-ft"),inch=n("ob-in");S.ht=(ft==null&&inch==null)?null:Math.round(((ft||0)*12+(inch||0))*2.54);var w=n("ob-wt");S.wt=w==null?null:Math.round(w/2.2046*10)/10}
    else{S.ht=n("ob-ht");S.wt=n("ob-wt")}
    save();
  }
  /* open / close / back */
  function open(o){
    if(el)return;
    var d=P().draftGet(),raw=d||{};
    S=Object.assign({units:"metric",name:"",ht:null,wt:null,age:null,sex:null,health:"ok"},raw);S.goal=raw.goal&&typeof raw.goal==="object"?{main:raw.goal.main||null,extra:raw.goal.extra||null}:{main:null,extra:null};
    step=d?Math.min(P().draftStep(),3):0;asked={};if(step>2){asked.h=1}
    try{if(root.axGuard)root.axGuard()}catch(e){}
    el=document.createElement("div");el.id="ax-ob";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label","Personalise your plan");
    document.body.appendChild(el);document.documentElement.classList.add("ob-lock");render(1);
  }
  function close(){if(!el)return;save();el.remove();el=null;document.documentElement.classList.remove("ob-lock")}
  function back(){if(!el)return 0;if(step>0)go(step-1,-1);else close();return 1}
  function isFresh(){
    try{
      if(P().get()||localStorage.getItem(SKIPK)==="1")return false;
      var A=root.APP;if(!A||!A.plans||Object.keys(A.plans).length!==1)return false;
      var st=(A.plans[A.active]||{}).st||{};return Object.keys(st).every(function(k){return /^x\d+$/.test(k)}); /* x0, x1.. are auto-closed past days, not activity */
    }catch(e){return false}
  }
  function auto(){if(!AUTOSTART||!isFresh())return;(function w(){if(document.getElementById("ax-boot"))return void setTimeout(w,300);if(isFresh())open()})()}

  var css=document.createElement("style");
  css.textContent=
   "html.ob-lock,html.ob-lock body{overflow:hidden}"+
   "#ax-ob{position:fixed;inset:0;z-index:9000;display:flex;flex-direction:column;background:var(--bg);color:var(--ink);font:16px/1.45 'DM Sans',system-ui,sans-serif;padding:var(--ax-sat,0px) 20px calc(var(--ax-sab,0px) + 12px);box-sizing:border-box}"+
   ".ob-top{min-height:22px;padding-top:14px}.ob-pr{height:6px;border-radius:6px;background:var(--line);overflow:hidden}.ob-pr i{display:block;height:100%;background:var(--blue);border-radius:6px;transition:width .3s ease}"+
   ".ob-body{flex:1;overflow-y:auto;padding:18px 2px 8px;outline:none;-webkit-overflow-scrolling:touch}"+
   ".ob-h{margin:6px 0 6px;font:800 26px/1.15 'DM Sans',system-ui,sans-serif}.ob-p{margin:8px 0 14px;color:var(--mut);font-size:16px}.ob-w{margin:0 0 12px;color:var(--mut);font-size:13px}"+
   ".ob-q{margin:18px 0 6px;font:700 17px/1.2 'DM Sans',system-ui,sans-serif}.ob-s{margin:-2px 0 8px;font-size:13px;color:var(--mut)}"+
   ".ob-hero{width:132px;height:132px;margin:28px auto 10px;border-radius:36px;background:#1e3b2b;display:flex;align-items:center;justify-content:center}.ob-hero svg{width:96px;height:96px;fill:none;stroke:#f3ead7;stroke-width:7;stroke-linecap:round;stroke-linejoin:round}"+
   ".ob-ch{display:flex;flex-wrap:wrap;gap:8px}.ob-c{min-height:48px;padding:0 16px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:600 15px/1 'DM Sans',system-ui,sans-serif}"+
   ".ob-c.on{background:var(--blue);color:var(--ax-onblue,#fff);border-color:transparent}.ob-c:active,.ob-o:active,.ob-b:active{transform:scale(.97)}"+
   ".ob-opts{display:flex;flex-direction:column;gap:8px}.ob-o{min-height:60px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;padding:8px 16px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;text-align:left}"+
   ".ob-o b{font-size:16px}.ob-o span{font-size:13px;color:var(--mut)}.ob-o.on{border-color:var(--blue);box-shadow:0 0 0 2px color-mix(in srgb,var(--blue) 35%,transparent);background:color-mix(in srgb,var(--blue) 12%,var(--card))}"+
   ".ob-in{width:100%;min-height:52px;padding:0 14px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:500 16px 'DM Sans',system-ui,sans-serif;box-sizing:border-box}"+
   ".ob-row{display:flex;gap:10px}.ob-row .ob-n{flex:1}.ob-n{display:flex;align-items:center;gap:6px}.ob-nl{flex:1}.ob-nl input{width:100%;min-height:52px;text-align:center;padding:0 6px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:600 17px 'DM Sans',system-ui,sans-serif;box-sizing:border-box}"+
   ".ob-st{width:48px;min-height:52px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:700 22px/1 'DM Sans',system-ui,sans-serif}"+
   ".ob-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}"+
   ".ob-note{margin:12px 0 0;padding:10px 12px;border-radius:14px;background:var(--bluet);border:1px solid var(--line);font-size:14px}.ob-note[hidden]{display:none}"+
   ".ob-nav{padding-top:8px}.ob-r{display:flex;gap:10px}.ob-r .ob-b{flex:1}.ob-r .ob-pri{flex:2}"+
   ".ob-b{width:100%;min-height:56px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:700 16px/1 'DM Sans',system-ui,sans-serif}"+
   ".ob-pri{background:var(--blue);color:var(--ax-onblue,#fff);border-color:transparent}.ob-ghost{margin-top:6px;border-color:transparent;background:transparent;color:var(--mut);font-weight:600}"+
   "@media(prefers-reduced-motion:no-preference){.ob-f{animation:ob-f .26s cubic-bezier(.2,.8,.2,1) both}.ob-b2{animation:ob-b .26s cubic-bezier(.2,.8,.2,1) both}@keyframes ob-f{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:none}}@keyframes ob-b{from{opacity:0;transform:translateX(-22px)}to{opacity:1;transform:none}}}";
  document.head.appendChild(css);

  var api={open:open,close:close,back:back,auto:auto,isFresh:isFresh,isOpen:function(){return !!el},step:function(){return step},AUTOSTART:AUTOSTART};
  root.AxOnboard=api;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",auto);else setTimeout(auto,0);
})(window);

/* onboard.js: first-run personalisation wizard (docs/onboarding/01_UX_SPEC.md). S4 = shell + screens 0-3 (welcome, you, health, goal).
   Full-screen overlay, one question per screen, Back always works (also Android back via axBack), draft saved after every answer
   (AxProfile.draftSet) so closing the app resumes. Answers are stored metric. Strings live in STR for later translation.
   S6: screen 9 = review, "Create my plan" builds with AxPlanGen, checks it with vplan(), adds it as a NEW plan (never overwrites), saves the
   profile and opens Home. AUTOSTART opens the wizard once on a fresh install; automated browsers (navigator.webdriver) skip it unless
   window.__AX_OB_AUTO is set, so the other UI tests are not blocked. */
(function(root){
  "use strict";
  var AUTOSTART=true,SKIPK="aryaOnboardSkip",TOTAL=9;
  var STR={
    welcomeT:"Let's make a plan that fits you",welcomeP:"A few quick questions, about 2 minutes. Everything stays on your phone.",start:"Start",skipAll:"Skip, use a standard plan",
    next:"Next",back:"Back",skip:"Skip",why:"Why we ask: ",
    youT:"About you",youWhy:"Height and weight help set sensible starting loads. Age keeps things safe. All optional.",name:"Name (optional)",units:"Units",height:"Height",weight:"Weight",age:"Age",sex:"Sex",
    sexWhy:"Only used for strength standards.",under18:"Under 18: we will keep it gentle, with no max-effort tests.",
    healthT:"A quick health check",healthQ:"Has a doctor ever said you should not exercise, or do you get chest pain or dizziness when you do?",healthWhy:"So we start safely if you need that.",
    no:"No",yes:"Yes",notsure:"Not sure",healthNote:"Please check with a doctor before you start. We will begin in gentle mode: fewer sets, longer rests and no max-effort tests. This is not medical advice.",
    goalT:"What is your main goal?",goalWhy:"It decides how many sets, and whether running or circuits are added.",extraT:"Anything else? (optional)",
    xpT:"How much have you trained?",xpWhy:"Only a cross-check. Your answers on the next screens matter more.",
    envT:"Where will you train?",envWhy:"So every exercise fits what you have.",equipT:"What do you have? (tick all)",
    benchT:"What can you do today?",benchWhy:"Good form, as many as you can. Not sure? Skip it and we estimate.",lifts:"Best working weights (optional)",liftsS:"Leave blank if you don't know yet.",notsure2:"Not sure",
    weakT:"Your weak point",weakWhy:"Balanced strength is safer and builds faster.",weakYes:"Yes, recommended",weakNo:"No",weakNone:"Your levels look balanced. No clear weak point.",
    wantT:"Anything you want to improve?",wantS:"Pick up to 4.",protT:"Anything we should protect?",
    schT:"Your schedule",schWhy:"A plan you can keep beats a perfect one.",daysT:"Workout days per week",minsT:"Time per session",weeksT:"Plan length",startT:"Start",recT:"Recommended for you: ",
    rtT:"Retest: what can you do now?",rtWhy:"Tap what you can do today. Anything you leave alone keeps your last answer.",rtNext:"See results",rtRes:"Your retest results",
    rtSave:"Save results",rtSavePlan:"Save and create a new plan",rtSame:"No change yet. Keep going, the next retest is in 4 weeks.",rtGap:"Gap closed, priority removed: ",rtStill:"Still your weakest link: ",rtNew:"New priority: ",rtKeep:"Your current plan keeps going. A new plan is optional.",rtToast:"Retest saved",
    revT:"Your starting levels",revWhy:"Week 1 starts one level lower on purpose, so you can build up safely.",create:"Create my plan",createNew:"Create a new plan from these",saveOnly:"Save answers",keepNote:"Your current plan is kept. You can switch back any time in Plans.",notNow:"Not now",change:"Change answers",weekT:"Your week",reasonT:"Why this plan",
    errBuild:"Something went wrong building the plan. Please change an answer and try again.",toast:"Plan ready. Week 1 is deliberately easy.",close:"Close"
  };
  var GOALS=[["muscle","Build muscle","More sets, steady progress"],["strength","Get stronger","Heavier or harder, fewer sets"],["fatloss","Lose fat and stay fit","Strength plus a circuit day"],["run","Run further","Running first, lighter strength"],["general","General fitness","A balanced week"]];
  var AGES=[["under18","Under 18"],["18-29","18-29"],["30-39","30-39"],["40-49","40-49"],["50-59","50-59"],["60+","60+"]];
  var SEXES=[["m","Male"],["f","Female"],["x","Prefer not to say"]];
  var XP=[["beg","Beginner","New, or on and off"],["int","Intermediate","1-3 years, fairly steady"],["adv","Advanced","3+ years, consistent"]];
  var ENVS=[["home","Home, no equipment","Bodyweight only"],["homeplus","Home with some equipment","Pick what you have"],["gym","Gym","Machines and weights"]];
  var EQUIP=[["pullbar","Pull-up bar"],["dumbbell","Dumbbells"],["band","Bands"],["bench","Bench"],["rope","Jump rope"],["backpack","Backpack"]];
  var BENCH=[
    {k:"push",t:"Push-ups",h:"Chest to the floor, body straight.",o:[["0-2",0],["3-9",3],["10-19",10],["20-34",20],["35-49",35],["50+",50]]},
    {k:"pull",t:"Pull-ups",h:"Chin over the bar, full hang each rep.",o:[["Can't hang",0],["Hang only",0],["1-2",1],["3-5",3],["6-9",6],["10-14",10],["15+",15]]},
    {k:"squat",t:"Squats",h:"Thighs parallel, no stopping.",o:[["Can't yet",0],["Under 15",1],["15-29",15],["30-49",30],["50-99",50],["100+",100]]},
    {k:"plank",t:"Plank",h:"Straight line, hold as long as you can.",o:[["Can't yet",0],["Under 20 s",1],["20-44 s",20],["45-89 s",45],["90-179 s",90],["3 min+",180]]},
    {k:"run",t:"Running non-stop",h:"Easy pace, no walking.",o:[["Can't",0],["About 1 km",1],["3 km",3],["5 km",5],["10 km+",10]]}];
  var LIFTS=[["squat","Squat"],["bench","Bench press"],["deadlift","Deadlift"],["ohp","Overhead press"]];
  var WANT=[["pull","Pull-ups"],["push","Push-ups"],["legs","Legs"],["core","Core"],["run","Running"],["flex","Flexibility"],["posture","Posture"]];
  var PROT=[["knee","Knees"],["back","Lower back"],["shoulder","Shoulders"],["wrist","Wrists"],["elbow","Elbows"]];
  var PN={push:"Pushing",pull:"Pulling",legs:"Legs",core:"Core",run:"Running"},PU={push:"push-ups",pull:"pull-ups",legs:"squats",core:"s plank",run:"km"},BK={push:"push",pull:"pull",legs:"squat",core:"plank",run:"run"};
  var WORDS=["Starter","Basic","Solid","Good","Strong","Very strong"],MAXWEAK=2;
  var S=null,step=0,el=null,asked={},mode={edit:false,retest:false},rtRes=null;
  function $(id){return document.getElementById(id)}
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function P(){return root.AxProfile}
  function save(){if(mode.retest)return;try{P().draftSet(Object.assign({},S,{step:step}))}catch(e){}}
  function chips(k,opts,cur){return '<div class="ob-ch" role="group" data-k="'+k+'">'+opts.map(function(o){return '<button type="button" class="ob-c'+(cur===o[0]?' on':'')+'" aria-pressed="'+(cur===o[0])+'" data-v="'+o[0]+'">'+o[1]+'</button>'}).join("")+'</div>'}
  function lab(t,sub){return '<p class="ob-q">'+t+'</p>'+(sub?'<p class="ob-s">'+sub+'</p>':'')}
  function why(t){return '<p class="ob-w">'+STR.why+t+'</p>'}
  function opts(k,list,cur){return '<div class="ob-opts" role="group" data-k="'+k+'">'+list.map(function(g){return '<button type="button" class="ob-o'+(cur===g[0]?' on':'')+'" aria-pressed="'+(cur===g[0])+'" data-v="'+g[0]+'"><b>'+g[1]+'</b><span>'+g[2]+'</span></button>'}).join("")+'</div>'}
  function multi(k,list,cur){return '<div class="ob-ch" role="group" data-m="'+k+'">'+list.map(function(e){var on=cur.indexOf(e[0])>=0;return '<button type="button" class="ob-c'+(on?' on':'')+'" aria-pressed="'+on+'" data-v="'+e[0]+'">'+e[1]+'</button>'}).join("")+'</div>'}
  function chipsR(k,list,cur,rec){return '<div class="ob-ch" role="group" data-k="'+k+'">'+list.map(function(o){return '<button type="button" class="ob-c'+(cur===o[0]?' on':'')+(o[0]===rec?' rec':'')+'" aria-pressed="'+(cur===o[0])+'" data-v="'+o[0]+'"'+(o[0]===rec?' aria-label="'+o[1]+' days, recommended"':'')+'>'+o[1]+'</button>'}).join("")+'</div>'}
  function firstIx(o,v){for(var i=0;i<o.length;i++)if(o[i][1]===v)return i;return -2}
  function lv(){return root.AxLevel.calc(Object.assign({},S,{bench:S.bench}))}
  function lvNoDecl(){return root.AxLevel.calc(Object.assign({},S,{weakAsked:false,weak:[]}))}
  function recDays(){return {beg:3,"int":4,adv:5}[S.xp||"beg"]}
  /* unit helpers (stored metric) */
  function imp(){return S.units==="imperial"}
  function ftIn(cm){var t=Math.round(cm/2.54);return [Math.floor(t/12),t%12]}
  function numIn(id,label,val,min,max,suffix){
    return '<div class="ob-n"><button type="button" class="ob-st" data-s="-1" data-t="'+id+'" aria-label="'+label+' minus">-</button><label class="ob-nl"><span class="ob-sr">'+label+'</span><input id="'+id+'" type="number" inputmode="decimal" min="'+min+'" max="'+max+'" step="1" value="'+(val==null?"":val)+'" placeholder="'+suffix+'"></label><button type="button" class="ob-st" data-s="1" data-t="'+id+'" aria-label="'+label+' plus">+</button></div>';
  }
  var SCREENS=[
    function welcome(){return {body:'<div class="ob-hero" aria-hidden="true"><svg viewBox="0 0 108 108"><path d="M30 80 52 28 68 63Q72 72 81 79"/></svg></div><h1 class="ob-h">'+STR.welcomeT+'</h1><p class="ob-p">'+STR.welcomeP+'</p>',
      nav:'<button type="button" class="ob-b ob-pri" id="ob-go">'+STR.start+'</button><button type="button" class="ob-b ob-ghost" id="ob-skipall">'+(isFresh()?STR.skipAll:STR.notNow)+'</button>'}},
    function you(){
      var ht=imp()&&S.ht!=null?ftIn(S.ht):null,wt=S.wt==null?null:(imp()?Math.round(S.wt*2.2046):S.wt);
      var h=imp()?'<div class="ob-row">'+numIn("ob-ft","Feet",ht?ht[0]:null,3,7,"ft")+numIn("ob-in","Inches",ht?ht[1]:null,0,11,"in")+'</div>':numIn("ob-ht","Height in centimetres",S.ht,100,230,"cm");
      return {body:'<h1 class="ob-h">'+STR.youT+'</h1>'+why(STR.youWhy)
        +lab(STR.name)+'<input class="ob-in" id="ob-name" maxlength="40" autocomplete="off" aria-label="'+STR.name+'" value="'+esc(S.name)+'">'
        +lab(STR.units)+chips("units",[["metric","cm, kg"],["imperial","ft in, lb"]],S.units)
        +lab(STR.height)+h+lab(STR.weight)+numIn("ob-wt","Weight in "+(imp()?"pounds":"kilograms"),wt,imp()?66:30,imp()?550:250,imp()?"lb":"kg")
        +lab(STR.age)+chips("age",AGES,S.age)+'<p class="ob-note" id="ob-u18" role="status" '+(S.age==="under18"?"":"hidden")+'>'+STR.under18+'</p>'
        +lab(STR.sex,STR.sexWhy)+chips("sex",SEXES,S.sex),skip:1};
    },
    function health(){
      var cur=S.health==="check"?(asked.hs==="notsure"?"notsure":"yes"):(asked.h?"no":null);
      return {body:'<h1 class="ob-h">'+STR.healthT+'</h1>'+why(STR.healthWhy)+'<p class="ob-p">'+STR.healthQ+'</p>'
        +chips("health",[["no",STR.no],["yes",STR.yes],["notsure",STR.notsure]],cur)+'<p class="ob-note" id="ob-hn" role="status" '+(S.health==="check"?"":"hidden")+'>'+STR.healthNote+'</p>',skip:1};
    },
    function goal(){
      return {body:'<h1 class="ob-h">'+STR.goalT+'</h1>'+why(STR.goalWhy)+'<div class="ob-opts" role="group" data-k="goal">'+GOALS.map(function(g){return '<button type="button" class="ob-o'+(S.goal.main===g[0]?' on':'')+'" aria-pressed="'+(S.goal.main===g[0])+'" data-v="'+g[0]+'"><b>'+g[1]+'</b><span>'+g[2]+'</span></button>'}).join("")+'</div>'
        +lab(STR.extraT)+'<div class="ob-ch" role="group" data-k="extra">'+GOALS.filter(function(g){return g[0]!==S.goal.main}).map(function(g){return '<button type="button" class="ob-c'+(S.goal.extra===g[0]?' on':'')+'" aria-pressed="'+(S.goal.extra===g[0])+'" data-v="'+g[0]+'">'+g[1]+'</button>'}).join("")+'</div>',skip:1};
    },
    function experience(){return {body:'<h1 class="ob-h">'+STR.xpT+'</h1>'+why(STR.xpWhy)+opts("xp",XP,S.xp),skip:1}},
    function where(){
      var eq=S.env==="homeplus"?'<p class="ob-q">'+STR.equipT+'</p><div class="ob-ch" role="group" data-m="equip">'+EQUIP.map(function(e){var on=S.equip.indexOf(e[0])>=0;return '<button type="button" class="ob-c'+(on?' on':'')+'" aria-pressed="'+on+'" data-v="'+e[0]+'">'+e[1]+'</button>'}).join("")+'</div>':"";
      return {body:'<h1 class="ob-h">'+STR.envT+'</h1>'+why(STR.envWhy)+opts("env",ENVS,S.env)+eq,skip:1};
    },
    function bench(){
      var cards=BENCH.map(function(c){
        var v=S.bench[c.k],ix=asked.b[c.k]!==undefined?asked.b[c.k]:(v==null?-2:firstIx(c.o,v));
        return '<div class="ob-card" role="group" aria-label="'+c.t+'"><p class="ob-q" style="margin-top:2px">'+c.t+'</p><p class="ob-s">'+c.h+'</p><div class="ob-ch" data-b="'+c.k+'">'
          +c.o.map(function(o,i){return '<button type="button" class="ob-c'+(ix===i?' on':'')+'" aria-pressed="'+(ix===i)+'" data-i="'+i+'">'+o[0]+'</button>'}).join("")
          +'<button type="button" class="ob-c'+(ix===-1?' on':'')+'" aria-pressed="'+(ix===-1)+'" data-i="-1">'+STR.notsure2+'</button></div></div>'}).join("");
      var lf="";
      if(S.env==="gym"||S.equip.indexOf("dumbbell")>=0)lf='<div class="ob-card"><p class="ob-q" style="margin-top:2px">'+STR.lifts+'</p><p class="ob-s">'+STR.liftsS+'</p>'+LIFTS.map(function(l){var v=S.bench.lifts[l[0]];if(v!=null&&imp())v=Math.round(v*2.2046);return '<label class="ob-lf"><span>'+l[1]+'</span><input id="ob-l-'+l[0]+'" type="number" inputmode="decimal" min="0" max="'+(imp()?1300:600)+'" aria-label="'+l[1]+' best weight in '+(imp()?"pounds":"kilograms")+'" placeholder="'+(imp()?"lb":"kg")+'" value="'+(v==null?"":v)+'"></label>'}).join("")+'</div>';
      return {body:'<h1 class="ob-h">'+(mode.retest?STR.rtT:STR.benchT)+'</h1>'+(mode.retest?'<p class="ob-w">'+STR.rtWhy+'</p>':why(STR.benchWhy))+cards+lf,skip:mode.retest?0:1,next:mode.retest?STR.rtNext:null};
    },
    function weak(){
      var A=lv(),w=A.weak[0],msg;
      if(!w)msg='<p class="ob-note">'+STR.weakNone+'</p>';
      else{
        var top="push",t;["push","pull","legs","core"].forEach(function(k){if(A.levels[k]>A.levels[top])top=k});
        var a=S.bench[BK[w]],b=S.bench[BK[top]];
        var nums=(a!=null&&b!=null&&w!=="run"&&top!=="core"&&w!=="core")?": "+a+" "+PU[w]+" vs "+b+" "+PU[top]:"";
        msg='<p class="ob-p"><b>'+PN[w]+'</b> looks like your weakest link ('+WORDS[A.levels[w]]+' vs '+WORDS[A.levels[top]]+' for '+PN[top].toLowerCase()+')'+nums+'. Make it a priority?</p>'
          +'<div class="ob-ch" role="group" data-k="weakq"><button type="button" class="ob-c'+(S.weakAsked&&S.weak.length?' on':'')+'" aria-pressed="'+!!(S.weakAsked&&S.weak.length)+'" data-v="yes">'+STR.weakYes+'</button><button type="button" class="ob-c'+(S.weakAsked&&!S.weak.length?' on':'')+'" aria-pressed="'+!!(S.weakAsked&&!S.weak.length)+'" data-v="no">'+STR.weakNo+'</button></div>';
      }
      return {body:'<h1 class="ob-h">'+STR.weakT+'</h1>'+why(STR.weakWhy)+msg
        +'<p class="ob-q">'+STR.wantT+'</p><p class="ob-s">'+STR.wantS+'</p>'+multi("want",WANT,S.want)
        +'<p class="ob-q">'+STR.protT+'</p>'+multi("protect",PROT.concat([["none","None"]]),S.protect.length?S.protect:(asked.none?["none"]:[])),skip:1};
    },
    function schedule(){
      var rec=recDays();
      return {body:'<h1 class="ob-h">'+STR.schT+'</h1>'+why(STR.schWhy)
        +lab(STR.daysT,STR.recT+rec)+chipsR("days",[2,3,4,5,6].map(function(n){return [n,String(n)]}),S.days,rec)
        +lab(STR.minsT)+chips("mins",[[20,"20 min"],[30,"30 min"],[45,"45 min"],[60,"60 min"]],S.mins)
        +lab(STR.weeksT)+chips("weeks",[[4,"4 weeks"],[8,"8 weeks"],[12,"12 weeks"]],S.weeks)
        +lab(STR.startT)+chips("start",[["today","Today"],["monday","Next Monday"]],S.start),skip:1};
    },
    function(){return review()}
  ];
  var DN=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],WKK=["mon","tue","wed","thu","fri","sat","sun"],NOTE=null;
  function noteMap(){if(NOTE)return NOTE;NOTE={};try{(root.T0||[]).forEach(function(t){t.x.forEach(function(e){NOTE[e[0]]={reps:e[2],note:e[3]}})})}catch(e){}return NOTE}
  function make(){
    var prof=Object.assign({},S),A=root.AxLevel.calc(prof),res=root.AxPlanGen.build(prof,root.AxExDb,{now:Date.now(),notes:noteMap(),athlete:S.name,level:root.AxLevel});
    return {A:A,res:res};
  }
  function review(){
    var R=make(),L=R.res.gen.levels,pats=["push","pull","legs","core"].concat(S.goal.main==="run"||S.goal.extra==="run"||S.want.indexOf("run")>=0?["run"]:[]);
    var bars=pats.map(function(k){var w=R.res.gen.weak.indexOf(k)>=0;return '<div class="ob-bar"><span class="ob-bl">'+PN[k]+'</span><span class="ob-bt" role="img" aria-label="'+PN[k]+': '+WORDS[L[k]]+'"><i style="width:'+Math.max(6,Math.round((L[k]+1)/6*100))+'%"'+(w?' class="wk"':'')+'></i></span><span class="ob-bw">'+WORDS[L[k]]+(w?' *':'')+'</span></div>'}).join("");
    var wk=R.res.gen.weak.filter(function(k){return k!=="run"}).map(function(k){return PN[k].toLowerCase()}).join(" and ");
    var strip='<div class="ob-strip" role="list">'+WKK.map(function(k,i){var d=R.res.plan.days[k];return '<div class="ob-d'+(d.type==="rest"?' rest':'')+'" role="listitem" aria-label="'+DN[i]+': '+esc(d.title)+'"><b>'+DN[i]+'</b><span>'+esc(d.short)+'</span></div>'}).join("")+'</div>';
    var why=R.res.notes.slice(0,4).map(function(n){return '<li>'+esc(n)+'</li>'}).join("");
    return {body:'<h1 class="ob-h">'+STR.revT+'</h1>'+why0()+'<div class="ob-card">'+bars+(wk?'<p class="ob-s" style="margin:8px 0 0">* Priority: '+wk+'</p>':'')+'</div>'
      +'<p class="ob-q">'+STR.weekT+'</p>'+strip+'<p class="ob-q">'+STR.reasonT+'</p><ul class="ob-ul">'+why+'</ul>'+(isFresh()?'':'<p class="ob-s">'+STR.keepNote+'</p>')+'<p class="ob-note" id="ob-err" role="alert" hidden></p>',
      nav:(mode.edit?'<button type="button" class="ob-b ob-pri" id="ob-save">'+STR.saveOnly+'</button><button type="button" class="ob-b" id="ob-create" style="margin-top:6px">'+STR.createNew+'</button>'
        :'<button type="button" class="ob-b ob-pri" id="ob-create">'+STR.create+'</button>')+'<button type="button" class="ob-b ob-ghost" id="ob-change">'+STR.change+'</button>'};
  }
  function why0(){return '<p class="ob-w">'+STR.revWhy+'</p>'}
  var busy=false;
  function rtResults(){
    var r=rtRes=root.AxRetest.run(P().get(),S.bench,Date.now()),L=r.levels,O=r.old;
    var pats=["push","pull","legs","core"].concat(S.goal.main==="run"||S.goal.extra==="run"||S.want.indexOf("run")>=0||O.run!==L.run?["run"]:[]);
    var rows=pats.map(function(k){var ch=O[k]!==L[k];return '<div class="ob-bar"><span class="ob-bl">'+PN[k]+'</span><span class="ob-bw" style="width:auto;flex:1;text-align:left">'+WORDS[O[k]]+(ch?' &rarr; <b>'+WORDS[L[k]]+'</b>':' (same)')+'</span></div>'}).join("");
    var names=function(a){return a.map(function(k){return PN[k].toLowerCase()}).join(" and ")},msg=[];
    if(r.removed.length)msg.push(STR.rtGap+names(r.removed));
    var still=r.profile.weak.filter(function(k){return r.removed.indexOf(k)<0&&r.added.indexOf(k)<0&&k!=="run"});
    if(still.length)msg.push(STR.rtStill+names(still));
    if(r.added.length)msg.push(STR.rtNew+names(r.added.filter(function(k){return k!=="run"})));
    if(!r.changes.length&&!msg.length)msg.push(STR.rtSame);
    return {body:'<h1 class="ob-h">'+STR.rtRes+'</h1><div class="ob-card">'+rows+'</div><ul class="ob-ul" style="margin-top:10px">'+msg.map(function(m){return '<li>'+esc(m)+'</li>'}).join("")+'</ul><p class="ob-s">'+STR.rtKeep+'</p><p class="ob-note" id="ob-err" role="alert" hidden></p>',
      nav:'<button type="button" class="ob-b ob-pri" id="ob-rt-save">'+STR.rtSave+'</button><button type="button" class="ob-b" id="ob-rt-plan" style="margin-top:6px">'+STR.rtSavePlan+'</button><button type="button" class="ob-b ob-ghost" id="ob-back">'+STR.back+'</button>'};
  }
  function rtSave(plan){
    if(busy)return;busy=true;var err=$("ob-err");
    function fail(){busy=false;if(err){err.hidden=false;err.textContent=STR.errBuild}}
    try{
      var r=rtRes||root.AxRetest.run(P().get(),S.bench,Date.now()),c=P().set(r.profile);if(!c)return fail();
      var pe=root.APP.plans[root.APP.active];if(pe&&pe.gen){pe.gen.weak=r.weak.slice(0,2);root.save()}   /* Coach reads gen.weak: a closed gap stops the extra set */
      if(plan){S=Object.assign({},S,r.profile);mode={edit:false,retest:false};busy=false;create();return}
      busy=false;finish();try{root.toast(STR.rtToast)}catch(e){}try{if(root.AxOnboardEntry)root.AxOnboardEntry.paint()}catch(e){}
    }catch(e){fail()}
  }
  function saveProfile(R,keep){var declined=S.weakAsked&&S.weak.length===0,prev=P().get(),now=Date.now(),rt=(keep&&prev&&prev.retest&&typeof prev.retest.due==="number")?prev.retest:root.AxRetest.initial(R.A.levels,now);
    return P().set(Object.assign({},S,{done:true,ts:now,levels:R.A.levels,weak:declined?[]:R.res.gen.weak,retest:rt}))}
  function saveOnly(){
    if(busy)return;busy=true;var err=$("ob-err");
    try{fill(8);var c=saveProfile(make(),true);if(!c){busy=false;if(err){err.hidden=false;err.textContent=STR.errBuild}return}
      busy=false;finish();try{root.toast("Answers saved")}catch(e){}try{if(root.AxOnboardEntry)root.AxOnboardEntry.paint()}catch(e){}}
    catch(e){busy=false;if(err){err.hidden=false;err.textContent=STR.errBuild}}
  }
  function create(){
    if(busy)return;busy=true;var err=$("ob-err");
    function fail(){busy=false;if(err){err.hidden=false;err.textContent=STR.errBuild}}
    try{
      fill(8);var R=make(),r=root.vplan(R.res.plan);if(!r||!r.plan)return fail();
      var c=saveProfile(R);
      if(!c)return fail();
      var id="p"+Date.now().toString(36);
      root.APP.plans[id]={plan:r.plan,st:{},gen:R.res.gen};root.save();root.activate(id);root.save();
      busy=false;finish();try{root.toast(STR.toast)}catch(e){}try{root.go("home")}catch(e){}
    }catch(e){fail()}
  }
  function later(){return {body:'<h1 class="ob-h">'+"Saved"+'</h1><p class="ob-p">'+STR.later+'</p>',nav:'<button type="button" class="ob-b ob-pri" id="ob-close">'+STR.close+'</button>'}}

  function render(dir){
    var sc=mode.retest?(step===0?SCREENS[6]():rtResults()):(step<SCREENS.length?SCREENS[step]():later()),prog=(step===0||mode.retest)?"":'<div class="ob-pr" role="progressbar" aria-valuemin="0" aria-valuemax="'+TOTAL+'" aria-valuenow="'+Math.min(step,TOTAL)+'" aria-label="Step '+step+' of '+TOTAL+'"><i style="width:'+Math.round(Math.min(step,TOTAL)/TOTAL*100)+'%"></i></div>';
    var nav=sc.nav||('<div class="ob-r"><button type="button" class="ob-b" id="ob-back">'+STR.back+'</button><button type="button" class="ob-b ob-pri" id="ob-next">'+(sc.next||STR.next)+'</button></div>'+(sc.skip?'<button type="button" class="ob-b ob-ghost" id="ob-skip">'+STR.skip+'</button>':''));
    el.innerHTML='<div class="ob-top">'+prog+'</div><div class="ob-body '+(dir<0?"ob-b2":"ob-f")+'" tabindex="-1" id="ob-bd">'+sc.body+'</div><div class="ob-nav">'+nav+'</div>';
    wire();nameGroups();var bd=$("ob-bd");if(bd){try{bd.focus({preventScroll:true})}catch(e){}bd.scrollTop=0}
  }
  function go(n,dir){step=Math.max(0,n);save();render(dir||1)}
  /* safe defaults for anything left unanswered on a screen */
  function fill(n){
    if(n===3&&!S.goal.main)S.goal.main="general";
    if(n===4&&!S.xp)S.xp="beg";
    if(n===5&&!S.env)S.env="home";
    if(n===8){if(!S.days)S.days=recDays();if(!S.mins)S.mins=45;if(!S.weeks)S.weeks=8;if(!S.start)S.start="today"}
  }
  function wire(){
    var r=el,b;
    if(b=$("ob-go"))b.onclick=function(){go(1,1)};
    if(b=$("ob-skipall"))b.onclick=function(){try{localStorage.setItem(SKIPK,"1")}catch(e){}close()};
    if(b=$("ob-close"))b.onclick=close;
    if(b=$("ob-create"))b.onclick=create;
    if(b=$("ob-save"))b.onclick=saveOnly;
    if(b=$("ob-rt-save"))b.onclick=function(){rtSave(false)};
    if(b=$("ob-rt-plan"))b.onclick=function(){rtSave(true)};
    if(b=$("ob-change"))b.onclick=function(){go(1,-1)};
    if(b=$("ob-back"))b.onclick=function(){if(step<=0)close();else go(step-1,-1)};
    if(b=$("ob-next"))b.onclick=function(){fill(step);go(step+1,1)};
    if(b=$("ob-skip"))b.onclick=function(){if(step===2){S.health="check";asked.h=1;asked.hs="notsure"}if(step===3){S.goal={main:"general",extra:null}}fill(step);go(step+1,1)};
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
        else if(k==="days"||k==="mins"||k==="weeks")S[k]=S[k]===+v?null:+v;
        else S[k]=S[k]===v?null:v;
        Array.prototype.forEach.call(box.querySelectorAll(".ob-c"),function(x){var xv=x.getAttribute("data-v"),on=k==="health"?xv===v:(k==="extra"?S.goal.extra===xv:(k==="days"||k==="mins"||k==="weeks")?S[k]===+xv:S[k]===xv);x.classList.toggle("on",on);x.setAttribute("aria-pressed",on)});
        if(k==="age"){var u=$("ob-u18");if(u)u.hidden=S.age!=="under18"}
        save();
      }});
    });
    var gb=r.querySelector('.ob-opts[data-k="goal"]');
    if(gb)Array.prototype.forEach.call(gb.querySelectorAll(".ob-o"),function(o){o.onclick=function(){S.goal.main=o.getAttribute("data-v");if(S.goal.extra===S.goal.main)S.goal.extra=null;save();render(1)}});
    Array.prototype.forEach.call(r.querySelectorAll('.ob-opts[data-k="xp"] .ob-o,.ob-opts[data-k="env"] .ob-o'),function(o){o.onclick=function(){
      var k=o.parentNode.getAttribute("data-k"),v=o.getAttribute("data-v");S[k]=v;
      if(k==="env"){S.equip=v==="homeplus"?(S.equip.length?S.equip:["backpack"]):[]}
      save();render(1)}});
    Array.prototype.forEach.call(r.querySelectorAll(".ob-ch[data-m]"),function(box){
      var k=box.getAttribute("data-m");
      Array.prototype.forEach.call(box.querySelectorAll(".ob-c"),function(c){c.onclick=function(){
        var v=c.getAttribute("data-v"),a=S[k],i=a.indexOf(v);
        if(v==="none"){S[k]=[];asked.none=1}
        else{asked.none=0;if(i>=0)a.splice(i,1);else if(k!=="want"||a.length<4)a.push(v)}
        if(k==="equip"&&!S.equip.length&&S.env==="homeplus"){}
        save();render(1);
      }});
    });
    Array.prototype.forEach.call(r.querySelectorAll(".ob-ch[data-b]"),function(box){
      var k=box.getAttribute("data-b"),c0=BENCH.filter(function(x){return x.k===k})[0];
      Array.prototype.forEach.call(box.querySelectorAll(".ob-c"),function(c){c.onclick=function(){
        var i=+c.getAttribute("data-i");asked.b[k]=i;S.bench[k]=i<0?null:c0.o[i][1];save();
        Array.prototype.forEach.call(box.querySelectorAll(".ob-c"),function(x){var on=+x.getAttribute("data-i")===i;x.classList.toggle("on",on);x.setAttribute("aria-pressed",on)});
      }});
    });
    LIFTS.forEach(function(l){var i=$("ob-l-"+l[0]);if(i)i.oninput=function(){var v=i.value===""||!isFinite(+i.value)?null:+i.value;S.bench.lifts[l[0]]=v==null?null:(imp()?Math.round(v/2.2046*10)/10:v);save()}});
    Array.prototype.forEach.call(r.querySelectorAll('.ob-ch[data-k="weakq"] .ob-c'),function(c){c.onclick=function(){
      var yes=c.getAttribute("data-v")==="yes";S.weakAsked=true;S.weak=yes?lvNoDecl().weak:[];save();render(1)}});
  }
  function readNums(){
    var n=function(id){var i=$(id);return i&&i.value!==""&&isFinite(+i.value)?+i.value:null};
    if(imp()){var ft=n("ob-ft"),inch=n("ob-in");S.ht=(ft==null&&inch==null)?null:Math.round(((ft||0)*12+(inch||0))*2.54);var w=n("ob-wt");S.wt=w==null?null:Math.round(w/2.2046*10)/10}
    else{S.ht=n("ob-ht");S.wt=n("ob-wt")}
    save();
  }
  /* open / close / back */
  /* the app's own theme can leave dark ink on a dark background (AMOLED + classic): keep the wizard readable anyway */
  function rgb(c){var m=String(c).match(/[\d.]+/g);return m?m.slice(0,3).map(Number):[255,255,255]}
  function lum(a){var f=function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(a[0])+0.7152*f(a[1])+0.0722*f(a[2])}
  function fixTheme(){
    var cs=getComputedStyle(el),b=lum(rgb(cs.backgroundColor)),k=lum(rgb(cs.color)),r=(Math.max(b,k)+0.05)/(Math.min(b,k)+0.05);
    if(r<4.5){var dark=b<0.4;el.style.setProperty("--ink",dark?"#f2f4f8":"#0b1b3f");el.style.setProperty("--mut",dark?"#b4bccb":"#44506b")}
  }
  /* screen readers: every group of choices gets the question above it as its name */
  function nameGroups(){
    Array.prototype.forEach.call(el.querySelectorAll('[role="group"]:not([aria-label])'),function(g){
      var p=g.previousElementSibling,t="";
      while(p&&!t){if(/^(P|H1)$/.test(p.tagName)&&!p.classList.contains("ob-s")&&!p.classList.contains("ob-w"))t=p.textContent;p=p.previousElementSibling}
      if(!t){var h=el.querySelector("h1");t=h?h.textContent:""}
      if(t)g.setAttribute("aria-label",t.replace(/\s+/g," ").trim().slice(0,80))});
  }
  function open(o){
    if(el)return;o=o||{};
    var prof=P().get(),d=P().draftGet(),raw=d||{};
    mode={edit:!!(o.edit&&prof),retest:!!(o.retest&&prof)};
    if((o.fromProfile||o.retest)&&prof){d=null;raw=JSON.parse(JSON.stringify(prof))}
    S=Object.assign({units:"metric",name:"",ht:null,wt:null,age:null,sex:null,health:"ok"},raw);S.goal=raw.goal&&typeof raw.goal==="object"?{main:raw.goal.main||null,extra:raw.goal.extra||null}:{main:null,extra:null};
    S.bench=Object.assign({push:null,pull:null,squat:null,plank:null,run:null},raw.bench||{});S.bench.lifts=Object.assign({squat:null,bench:null,deadlift:null,ohp:null},(raw.bench&&raw.bench.lifts)||{});
    S.equip=Array.isArray(raw.equip)?raw.equip.slice():[];S.want=Array.isArray(raw.want)?raw.want.slice():[];S.protect=Array.isArray(raw.protect)?raw.protect.slice():[];S.weak=Array.isArray(raw.weak)?raw.weak.slice():[];S.weakAsked=raw.weakAsked===true;
    step=mode.retest?0:(d?Math.min(P().draftStep(),9):((o.fromProfile&&prof)?1:0));asked={b:{}};if(step>2||(o.fromProfile&&prof))asked.h=1;if(o.fromProfile&&prof){asked.none=S.protect.length===0?1:0}
    try{if(root.axGuard)root.axGuard()}catch(e){}
    el=document.createElement("div");el.id="ax-ob";el.setAttribute("role","dialog");el.setAttribute("aria-modal","true");el.setAttribute("aria-label","Personalise your plan");
    document.body.appendChild(el);document.documentElement.classList.add("ob-lock");fixTheme();render(1);
  }
  function finish(){if(!el)return;el.remove();el=null;document.documentElement.classList.remove("ob-lock")}
  function close(){if(!el)return;save();finish()}
  function back(){if(!el)return 0;if(step>0)go(step-1,-1);else close();return 1}
  function isFresh(){
    try{
      if(P().get()||localStorage.getItem(SKIPK)==="1")return false;
      var A=root.APP;if(!A||!A.plans||Object.keys(A.plans).length!==1)return false;
      var st=(A.plans[A.active]||{}).st||{};return Object.keys(st).every(function(k){return /^x\d+$/.test(k)}); /* x0, x1.. are auto-closed past days, not activity */
    }catch(e){return false}
  }
  function auto(){if(!AUTOSTART||!isFresh())return;if(navigator.webdriver&&!root.__AX_OB_AUTO)return;(function w(){if(document.getElementById("ax-boot"))return void setTimeout(w,300);if(isFresh())open()})()}

  var css=document.createElement("style");
  css.textContent=
   "html.ob-lock,html.ob-lock body{overflow:hidden}"+
   "#ax-ob{--ob-mut:color-mix(in srgb,var(--mut) 55%,var(--ink));position:fixed;inset:0;z-index:9000;display:flex;flex-direction:column;background:var(--bg);color:var(--ink);overflow:hidden;font:16px/1.45 'DM Sans',system-ui,sans-serif;padding:var(--ax-sat,0px) 20px calc(var(--ax-sab,0px) + 12px);box-sizing:border-box}"+
   ".ob-top{min-height:22px;padding-top:14px}.ob-pr{height:6px;border-radius:6px;background:var(--line);overflow:hidden}.ob-pr i{display:block;height:100%;background:var(--blue);border-radius:6px;transition:width .3s ease}"+
   ".ob-body{flex:1;overflow-y:auto;overflow-x:hidden;padding:18px 2px 8px;outline:none;-webkit-overflow-scrolling:touch}"+
   ".ob-h{margin:6px 0 6px;font:800 26px/1.15 'DM Sans',system-ui,sans-serif}.ob-p{margin:8px 0 14px;color:var(--ob-mut);font-size:16px}.ob-w{margin:0 0 12px;color:var(--ob-mut);font-size:13px}"+
   ".ob-q{margin:18px 0 6px;font:700 17px/1.2 'DM Sans',system-ui,sans-serif}.ob-s{margin:-2px 0 8px;font-size:13px;color:var(--ob-mut)}"+
   ".ob-hero{width:132px;height:132px;margin:28px auto 10px;border-radius:36px;background:#1e3b2b;display:flex;align-items:center;justify-content:center}.ob-hero svg{width:96px;height:96px;fill:none;stroke:#f3ead7;stroke-width:7;stroke-linecap:round;stroke-linejoin:round}"+
   ".ob-ch{display:flex;flex-wrap:wrap;gap:8px}.ob-c{min-height:48px;padding:0 16px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:600 15px/1 'DM Sans',system-ui,sans-serif}"+
   ".ob-c.on{background:var(--blue);color:var(--ax-onblue,#fff);border-color:transparent}.ob-c:active,.ob-o:active,.ob-b:active{transform:scale(.97)}"+
   ".ob-opts{display:flex;flex-direction:column;gap:8px}.ob-o{min-height:60px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;padding:8px 16px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;text-align:left}"+
   ".ob-o b{font-size:16px}.ob-o span{font-size:13px;color:var(--ob-mut)}.ob-o.on{border-color:var(--blue);box-shadow:0 0 0 2px color-mix(in srgb,var(--blue) 35%,transparent);background:color-mix(in srgb,var(--blue) 12%,var(--card))}"+
   ".ob-in{width:100%;min-height:52px;padding:0 14px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:500 16px 'DM Sans',system-ui,sans-serif;box-sizing:border-box}"+
   ".ob-row{display:flex;gap:10px}.ob-row .ob-n{flex:1}.ob-n{display:flex;align-items:center;gap:6px}.ob-nl{flex:1}.ob-nl input{width:100%;min-height:52px;text-align:center;padding:0 6px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:600 17px 'DM Sans',system-ui,sans-serif;box-sizing:border-box}"+
   ".ob-st{width:48px;min-height:52px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:700 22px/1 'DM Sans',system-ui,sans-serif}"+
   ".ob-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}"+
   ".ob-note{margin:12px 0 0;padding:10px 12px;border-radius:14px;background:var(--card);border:1px solid var(--line);border-left:4px solid var(--blue);font-size:14px}.ob-note[hidden]{display:none}"+
   ".ob-nav{padding-top:8px}.ob-r{display:flex;gap:10px}.ob-r .ob-b{flex:1}.ob-r .ob-pri{flex:2}"+
   ".ob-b{width:100%;min-height:56px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:700 16px/1 'DM Sans',system-ui,sans-serif}"+
   ".ob-pri{background:var(--blue);color:var(--ax-onblue,#fff);border-color:transparent}.ob-ghost{margin-top:6px;border-color:transparent;background:transparent;color:var(--ob-mut);font-weight:600}"+
   ".ob-card{margin:12px 0;padding:12px 14px;border-radius:20px;border:1px solid var(--line);background:var(--card)}.ob-lf{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0}.ob-lf input{width:120px;min-height:48px;text-align:center;border-radius:14px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:600 16px 'DM Sans',system-ui,sans-serif;box-sizing:border-box}"+
   ".ob-bar{display:flex;align-items:center;gap:10px;margin:8px 0}.ob-bl{width:70px;font-weight:700;font-size:14px}.ob-bt{flex:1;height:10px;border-radius:10px;background:var(--line);overflow:hidden}.ob-bt i{display:block;height:100%;background:var(--blue);border-radius:10px}.ob-bt i.wk{background:#c8782b}.ob-bw{width:84px;text-align:right;font-size:13px;color:var(--ob-mut)}"+
   ".ob-strip{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.ob-d{padding:8px 2px;border-radius:12px;background:var(--card);border:1px solid var(--line);text-align:center;font-size:11px;overflow:hidden}.ob-d b{display:block;font-size:12px}.ob-d span{display:block;margin-top:2px;color:var(--ob-mut);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.ob-d.rest{opacity:.55}.ob-ul{margin:0;padding-left:18px;font-size:14px;color:var(--ob-mut)}.ob-ul li{margin:4px 0}"+
   ".ob-c.rec:not(.on){border-color:var(--blue);box-shadow:0 0 0 1px var(--blue)}"+
   "#ax-ob .ob-b,#ax-ob .ob-c,#ax-ob .ob-o,#ax-ob .ob-st{color:var(--ink)}#ax-ob .ob-ghost{color:var(--ob-mut)}#ax-ob .ob-pri,#ax-ob .ob-c.on{color:var(--ax-onblue,#fff)}"+
   "#ax-ob button:focus-visible,#ax-ob input:focus-visible,#ax-ob [tabindex]:focus-visible{outline:3px solid var(--blue);outline-offset:2px}#ax-ob .ob-body:focus{outline:none}"+
   "@media(prefers-reduced-motion:no-preference){.ob-f{animation:ob-f .26s cubic-bezier(.2,.8,.2,1) both}.ob-b2{animation:ob-b .26s cubic-bezier(.2,.8,.2,1) both}@keyframes ob-f{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:none}}@keyframes ob-b{from{opacity:0;transform:translateX(-22px)}to{opacity:1;transform:none}}}";
  document.head.appendChild(css);

  var api={open:open,close:close,back:back,auto:auto,isFresh:isFresh,isOpen:function(){return !!el},step:function(){return step},AUTOSTART:AUTOSTART};
  root.AxOnboard=api;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",auto);else setTimeout(auto,0);
})(window);

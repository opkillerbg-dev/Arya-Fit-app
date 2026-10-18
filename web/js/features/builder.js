/* Arya Fit v80: "Build my plan". 3 quick steps -> a plan in the existing arya-plan format -> validated by vplan() -> added like "Add and use this plan".
   Exercises come from the built-in list (T0), so pictures, notes and swap keep working. No logic outside this file is changed. */
(function(){
  "use strict";
  var $=function(i){return document.getElementById(i)};
  var S,NOTE=null;

  var GOALS=[
    {k:"strength",t:"Build strength",s:"More sets, strength first",run:"none",name:"Strength Plan"},
    {k:"balanced",t:"Stay fit and lean",s:"Strength plus easy cardio",run:"3",name:"Fit and Lean Plan"},
    {k:"endurance",t:"Run further",s:"Running first, lighter strength",run:"5",name:"Run Further Plan"}
  ];
  function reset(){S={step:0,dir:1,goal:"balanced",level:"beginner",days:4,weeks:4,start:"today",run:"3",habits:1,name:"",runTouched:false}}

  function notes(){
    if(NOTE)return NOTE;NOTE={};
    (window.T0||[]).forEach(function(t){t.x.forEach(function(e){NOTE[e[0]]={reps:e[2],note:e[3]}})});
    return NOTE;
  }
  function pad(n){return n<10?"0"+n:""+n}
  function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
  function startDate(){var d=new Date();d.setHours(12,0,0,0);if(S.start==="monday"){var add=(8-d.getDay())%7||7;d.setDate(d.getDate()+add)}return d}

  function pools(){
    var b=S.level==="beginner";
    return {
      push:b?["Push-ups","Incline push-ups","Chair dips","Plank"]:["Push-ups","Pike push-ups","Chair dips","Diamond push-ups","Plank"],
      legs:["Bodyweight squats","Reverse lunges","Glute bridges","Calf raises","Wall sit"],
      core:b?["Crunches","Dead bug","Leg raises","Side plank"]:["Leg raises","Crunches","Mountain climbers","Russian twists","Dead bug","Side plank"],
      pull:["Table or towel rows","Superman hold","Reverse snow angels","Backpack curls","Backpack bent-over row"],
      fa:["Push-ups","Bodyweight squats","Table or towel rows","Glute bridges","Plank"],
      fb:["Incline push-ups","Reverse lunges","Superman hold","Dead bug","Calf raises"],
      mob:["Cat-cow","World's greatest stretch","Hamstring stretch","Hip flexor stretch","Child's pose"],
      circ:b?["Bodyweight squats","Incline push-ups","Mountain climbers","Glute bridges"]:["Burpees","Squat jumps","Incline push-ups","Bear crawls","Plank to push-up"]
    };
  }
  function setsFor(i){
    if(S.level==="beginner")return i<2?3:2;
    var top=S.goal==="strength"?4:3;return i<2?top:3;
  }
  function strength(title,short,focus,names,icon){
    var N=notes();
    return {title:title,short:short,focus:focus,icon:icon||"dumbbell",type:"strength",
      exercises:names.map(function(nm,i){var n=N[nm]||{reps:"10",note:""};return {name:nm,sets:setsFor(i),reps:n.reps,note:n.note}})};
  }
  function dayObj(kind,P){
    var N=notes();
    switch(kind){
      case "push":return strength("Push day","Push","Chest, shoulders, triceps",P.push);
      case "legs":return strength("Legs and glutes","Legs","Quads, hamstrings, glutes, calves",P.legs);
      case "core":return strength("Core and conditioning","Core","Abs, obliques, lower back",P.core);
      case "pull":return strength("Pull day","Pull","Back, rear shoulders, biceps",P.pull);
      case "fa":return strength("Full body A","Full A","Push, legs and back",P.fa);
      case "fb":return strength("Full body B","Full B","Push, legs and back",P.fb);
      case "circ":return {title:"Full body circuit",short:"Circuit",focus:"Rest 60-90 sec between rounds",icon:"flame",type:"circuit",rounds:S.level==="beginner"?2:3,
        exercises:P.circ.map(function(nm){var n=N[nm]||{reps:"10",note:""};return {name:nm,reps:n.reps,note:n.note}})};
      case "mob":return {title:"Mobility and stretch",short:"Stretch",focus:"Recovery and stretching, about 20 min",icon:"stretch",type:"mobility",
        exercises:P.mob.map(function(nm){var n=N[nm]||{reps:"10",note:""};return {name:nm,reps:n.reps,note:n.note}})};
    }
    return {title:"Rest day",short:"Rest",focus:"No strength training today",icon:"moon",type:"rest",exercises:[]};
  }
  var WEEKS={
    3:{mon:"fa",wed:"fb",fri:"circ",sun:"mob"},
    4:{mon:"push",tue:"legs",thu:"pull",sat:"circ",wed:"mob"},
    5:{mon:"push",tue:"legs",wed:"core",fri:"pull",sat:"circ"},
    6:{mon:"push",tue:"legs",wed:"core",thu:"pull",fri:"circ",sat:"mob"}
  };
  var WK=["mon","tue","wed","thu","fri","sat","sun"],PRI={rest:0,mobility:1,circuit:2,strength:3};

  function jogNote(type,i){
    if(type==="rest")return "Slowest pace. Walk if you are sore.";
    if(type==="mobility")return "Your steadiest run of the week. Easy, you can talk.";
    if(type==="circuit")return "Easy pace, you will be tired. Keep it relaxed.";
    return "Easy pace, right after strength. Stretch after.";
  }
  function intervals(km){
    var fin={3:480,5:900,8:1500,10:1800}[km]||900,st=S.level==="beginner"?60:180,out=[];
    for(var w=0;w<S.weeks;w++){
      var t=S.weeks>1?w/(S.weeks-1):1,jog=Math.max(30,Math.round((st+(fin-st)*t)/30)*30),walk=Math.max(0,Math.round((120-90*t)/15)*15);
      if(jog>=1500)walk=0;out.push([jog,walk]);
    }
    return out;
  }

  function build(){
    var P=pools(),days={},tpl=WEEKS[S.days]||WEEKS[4],order=[];
    WK.forEach(function(k){var kind=tpl[k]||"rest";days[k]=dayObj(kind,P);order.push([k,days[k].type,kind])});
    var plan={format:"arya-plan",version:1,name:(S.name||goal().name).slice(0,60),athlete:"",start:ymd(startDate()),weeks:S.weeks,
      lightWeeks:S.weeks>=4?[4,8,12].filter(function(w){return w<=S.weeks}):[],lightSets:2,days:days};
    try{var cur=window.APP&&APP.plans&&APP.plans[APP.active]&&APP.plans[APP.active].plan;if(cur&&cur.athlete)plan.athlete=cur.athlete}catch(e){}
    var km=S.run==="none"?0:+S.run;
    if(km){
      var runs=S.level==="beginner"?3:4;if(S.goal==="endurance")runs=Math.min(5,runs+1);
      var pick=order.slice().sort(function(a,b){return PRI[a[1]]-PRI[b[1]]||WK.indexOf(a[0])-WK.indexOf(b[0])}).slice(0,runs).map(function(x){return x[0]});
      WK.forEach(function(k){if(pick.indexOf(k)<0)days[k].jog=false;else days[k].jogNote=jogNote(days[k].type)});
      plan.jog={label:km+" km run and walk",km:km,weeks:intervals(km)};
    }else{WK.forEach(function(k){days[k].jog=false})}
    if(S.habits)plan.habits=[{name:"Water",badge:"2-3 L",note:"More on hot days and run days.",icon:"drop"},{name:"Protein",badge:"Every meal",note:"Eggs, paneer, dal, curd, soya, chana, sprouts.",icon:"egg"},{name:"Sleep",badge:"7-9 h",note:"Muscle is built during recovery.",icon:"moon"}];
    return plan;
  }
  function goal(){return GOALS.filter(function(g){return g.k===S.goal})[0]}

  /* ---------- UI ---------- */
  function chips(key,opts){
    return '<div class="bld-chips" data-k="'+key+'">'+opts.map(function(o){return '<button type="button" class="bld-c'+(String(S[key])===String(o[0])?' on':'')+'" data-v="'+o[0]+'">'+o[1]+'</button>'}).join("")+'</div>';
  }
  function h(t,sub){return '<p class="bld-q">'+t+'</p>'+(sub?'<p class="bld-s">'+sub+'</p>':'')}
  function weekLine(){
    var tpl=WEEKS[S.days]||WEEKS[4],nm={push:"Push",legs:"Legs",core:"Core",pull:"Pull",fa:"Full A",fb:"Full B",circ:"Circuit",mob:"Stretch"},D=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    return WK.map(function(k,i){return '<span class="bld-d'+(tpl[k]?' on':'')+'"><b>'+D[i]+'</b>'+(tpl[k]?nm[tpl[k]]:"Rest")+'</span>'}).join("");
  }
  function step0(){
    return h("What is your goal?")+'<div class="bld-opts">'+GOALS.map(function(g){return '<button type="button" class="ax-opt bld-g'+(S.goal===g.k?' on':'')+'" data-g="'+g.k+'"><b>'+g.t+'</b><span>'+g.s+'</span></button>'}).join("")+'</div>'
      +h("Your level")+chips("level",[["beginner","Beginner"],["intermediate","Intermediate"]]);
  }
  function step1(){
    return h("Workout days per week","The rest are recovery days.")+chips("days",[[3,"3"],[4,"4"],[5,"5"],[6,"6"]])
      +'<div class="bld-week" id="bld-week">'+weekLine()+'</div>'
      +h("Plan length")+chips("weeks",[[4,"4 weeks"],[6,"6 weeks"],[8,"8 weeks"],[12,"12 weeks"]])
      +h("Start")+chips("start",[["today","Today"],["monday","Next Monday"]]);
  }
  function step2(){
    return h("Add running?","Short run and walk sessions on your lighter days. Grows each week.")+chips("run",[["none","No"],["3","3 km"],["5","5 km"],["8","8 km"],["10","10 km"]])
      +h("Daily habits","Water, protein and sleep ticks.")+chips("habits",[[1,"Yes"],[0,"No"]])
      +h("Plan name")+'<input id="bld-name" class="bld-in" maxlength="40" placeholder="'+goal().name+'" value="'+(S.name||"").replace(/"/g,"&quot;")+'">';
  }
  var TITLES=["Build my plan  1/3","Build my plan  2/3","Build my plan  3/3"];
  function render(){
    var body=[step0,step1,step2][S.step]();
    var nav='<div class="bld-nav">'+(S.step>0?'<button type="button" class="ax-btn" id="bld-back">Back</button>':'<button type="button" class="ax-btn" id="bld-x">Cancel</button>')
      +'<button type="button" class="ax-btn ax-pri" id="bld-next">'+(S.step<2?'Next':'Create my plan')+'</button></div><p class="bld-err" id="bld-err" hidden></p>';
    axSheet(TITLES[S.step],'<div class="bld-step '+(S.dir>0?'bld-f':'bld-b')+'">'+body+nav+'</div>');
    wire();
  }
  function wire(){
    var root=$("ax-shb");
    Array.prototype.forEach.call(root.querySelectorAll(".bld-chips"),function(box){
      var k=box.getAttribute("data-k");
      Array.prototype.forEach.call(box.querySelectorAll(".bld-c"),function(b){b.onclick=function(){
        var v=b.getAttribute("data-v");S[k]=(k==="days"||k==="weeks"||k==="habits")?+v:v;if(k==="run")S.runTouched=true;
        Array.prototype.forEach.call(box.querySelectorAll(".bld-c"),function(x){x.classList.toggle("on",x===b)});
        if(k==="days"){var w=$("bld-week");if(w)w.innerHTML=weekLine()}
      }});
    });
    Array.prototype.forEach.call(root.querySelectorAll(".bld-g"),function(b){b.onclick=function(){
      S.goal=b.getAttribute("data-g");if(!S.runTouched)S.run=goal().run;
      if(S.goal==="endurance"&&S.days>5)S.days=4;
      Array.prototype.forEach.call(root.querySelectorAll(".bld-g"),function(x){x.classList.toggle("on",x===b)});
    }});
    var nx=$("bld-next"),bk=$("bld-back"),cx=$("bld-x");
    if(nx)nx.onclick=function(){
      if(S.step<2){S.step++;S.dir=1;render();return}
      var nm=$("bld-name");S.name=nm?nm.value.trim():S.name;create();
    };
    if(bk)bk.onclick=function(){S.step--;S.dir=-1;render()};
    if(cx)cx.onclick=function(){axSheetX()};
  }
  function create(){
    var err=$("bld-err"),r;
    try{r=vplan(build())}catch(e){r={E:["Something went wrong building the plan."],plan:null}}
    if(!r.plan){if(err){err.hidden=false;err.textContent=(r.E||[]).slice(0,2).join(" ")}return}
    var id="p"+Date.now().toString(36);
    APP.plans[id]={plan:r.plan,st:{}};save();activate(id);save();
    axSheetX();toast("Your plan is ready");go("home");
  }
  window.axBuildPlan=function(){reset();render()};
  window.axBuildPlan.test=function(o){reset();for(var k in o)S[k]=o[k];var r=vplan(build());return {E:r.E,ok:!!r.plan}};

  /* ---------- entry points ---------- */
  function mount(){
    var list=$("pl-list");
    if(list&&!$("bld-card")){
      var c=document.createElement("div");c.id="bld-card";c.className="panel";
      c.innerHTML='<h3 style="margin-top:0">Build my plan</h3><p style="margin:4px 0 10px;font-size:13px;color:var(--mut)">Answer three quick questions and get a plan made for you. No typing needed.</p><div class="qr"><button class="btn pri" id="bld-go">Build my plan</button></div>';
      var nx=list.nextElementSibling;list.parentNode.insertBefore(c,nx||null);
      $("bld-go").onclick=window.axBuildPlan;
    }
    var sp=$("sp-go"),row=sp&&sp.closest(".row");
    if(row&&!$("bld-row")){
      var r=document.createElement("div");r.className="row";r.id="bld-row";
      r.innerHTML='<span><b>Build my plan</b><em>Answer a few questions, get a plan</em></span><button class="btn pri" id="bld-go2">Build</button>';
      row.parentNode.insertBefore(r,row);$("bld-go2").onclick=window.axBuildPlan;
    }
  }

  var css=document.createElement("style");
  css.textContent=
   ".bld-q{margin:14px 0 6px;font:700 17px/1.2 \"DM Sans\",system-ui,sans-serif;color:var(--ink)}.bld-q:first-child{margin-top:4px}"+
   ".bld-s{margin:-2px 0 8px;font-size:13px;color:var(--mut)}"+
   ".bld-chips{display:flex;flex-wrap:wrap;gap:8px}"+
   ".bld-c{min-height:46px;padding:0 16px;border-radius:18px;border:1px solid var(--line);background:color-mix(in srgb,var(--card) 70%,transparent);color:var(--ink);font:600 15px/1 \"DM Sans\",system-ui,sans-serif;transition:background .18s ease,color .18s ease,transform .12s ease,box-shadow .18s ease}"+
   ".bld-c:active{transform:scale(.96)}"+
   ".bld-c.on{background:var(--blue);color:var(--ax-onblue,#fff);border-color:transparent;box-shadow:0 8px 18px -8px color-mix(in srgb,var(--blue) 70%,transparent)}"+
   ".bld-opts{display:flex;flex-direction:column;gap:8px}"+
   ".bld-g{transition:border-color .18s ease,box-shadow .18s ease,transform .12s ease}.bld-g:active{transform:scale(.985)}"+
   ".bld-g.on{border-color:var(--blue)!important;background:color-mix(in srgb,var(--blue) 14%,transparent)!important;box-shadow:0 0 0 2px color-mix(in srgb,var(--blue) 35%,transparent)!important}"+
   ".bld-week{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin:10px 0 2px}"+
   ".bld-d{display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 0;border-radius:12px;border:1px solid var(--line);font-size:10.5px;color:var(--mut);transition:background .2s ease,color .2s ease}"+
   ".bld-d b{font-size:10px;letter-spacing:.04em;color:var(--mut)}.bld-d.on{background:color-mix(in srgb,var(--blue) 16%,transparent);color:var(--ink);border-color:color-mix(in srgb,var(--blue) 40%,var(--line))}.bld-d.on b{color:var(--blue)}"+
   ".bld-in{width:100%;min-height:50px;padding:0 14px;border-radius:16px;border:1px solid var(--line);background:color-mix(in srgb,var(--card) 70%,transparent);color:var(--ink);font:500 16px \"DM Sans\",system-ui,sans-serif;box-sizing:border-box}"+
   ".bld-nav{display:flex;gap:10px;margin-top:18px}.bld-nav .ax-btn{flex:1;width:auto}.bld-nav .ax-pri{flex:2}"+
   ".bld-err{color:#c0392b;font-size:13px;margin:8px 0 0}"+
   "@media(prefers-reduced-motion:no-preference){.bld-f{animation:bld-f .26s cubic-bezier(.2,.8,.2,1) both}.bld-b{animation:bld-b .26s cubic-bezier(.2,.8,.2,1) both}"+
   "@keyframes bld-f{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:none}}@keyframes bld-b{from{opacity:0;transform:translateX(-22px)}to{opacity:1;transform:none}}}";
  document.head.appendChild(css);

  reset();
  function init(){mount();setTimeout(mount,800)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();

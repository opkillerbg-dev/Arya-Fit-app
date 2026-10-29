/* plangen.js: onboarding S3. Pure plan engine (docs/onboarding/04): profile -> arya-plan. No UI, no storage, no randomness, also runs in node.
   AxPlanGen.build(profile, exdb, opts) -> {plan, gen, notes}
   opts: {now:ms (default Date.now()), notes:{exerciseName:{reps,note}} (built-in notes from T0), athlete:"", level:AxLevel} */
(function(root){
  var WK=["mon","tue","wed","thu","fri","sat","sun"];
  var DAYS={2:["mon","thu"],3:["mon","wed","fri"],4:["mon","tue","thu","fri"],5:["mon","tue","wed","fri","sat"],6:["mon","tue","wed","thu","fri","sat"]};
  var SPLIT={2:["fullA","fullB"],3:["fullA","fullB","fullA"],4:["upper","lower","upper","lower"],5:["push","pull","legs","upper","lower"],6:["push","pull","legs","push","pull","legs"]};
  var TPL={
    fullA:[["pullup","row"],["pushup","bench"],["squat","single"],["hinge"],["core"]],
    fullB:[["row","pullup"],["vpush","dip","pushup"],["single","squat"],["hinge","calf"],["core"]],
    upper:[["pullup","row"],["pushup","bench"],["row","pullup"],["vpush","dip"]],
    lower:[["squat","single"],["hinge"],["single","squat"],["calf","hinge"],["core"]],
    push:[["pushup","bench"],["vpush"],["dip","pushup"]],
    pull:[["pullup"],["row"],["pullacc","row"]],
    legs:[["squat"],["single"],["hinge"],["calf"],["core"]]
  };
  var GP={pushup:"push",bench:"push",dip:"push",vpush:"push",pullup:"pull",row:"pull",pullacc:"pull",squat:"squat",single:"squat",squatx:"squat",hinge:"hinge",calf:"hinge",core:"core"};
  var LV={push:"push",pull:"pull",squat:"legs",hinge:"legs",core:"core"};
  var BUCKETS=["push","pull","squat","hinge","core"];
  var PRACT={push:["pushup"],pull:["pullup","row"],legs:["squat"],core:["core"]};
  var TITLE={fullA:["Full body A","Full A","Push, pull and legs"],fullB:["Full body B","Full B","Push, pull and legs"],upper:["Upper body","Upper","Chest, back, shoulders, arms"],
    lower:["Lower body and core","Lower","Legs, glutes, core"],push:["Push day","Push","Chest, shoulders, triceps"],pull:["Pull day","Pull","Back, rear shoulders, biceps"],legs:["Legs and core","Legs","Quads, hamstrings, glutes, core"]};
  var PNAME={push:"push",pull:"pull",legs:"leg",core:"core",run:"run"},NOTEW={push:"pushing",pull:"pulling",legs:"legs",core:"core",run:"running"},SKIPW={push:"push-ups",pull:"pull-ups",squat:"squats",plank:"plank",run:"running"};
  var GENERIC={push:"Control the lowering. Stop 1-2 reps before failure.",pull:"Pull with your back, not your arms. Stop 1-2 reps before failure.",squat:"Knees track over toes. Stop 1-2 reps before failure.",hinge:"Hips back, flat back. Stop 1-2 reps before failure.",core:"Keep it slow and tight. Stop before form slips.",cardio:"Steady effort you can keep up.",mobility:"Easy stretch, no pain. Breathe slowly."};
  var GYMEQ=["dumbbell","barbell","machine","cable"];
  var LIFTEX={"barbell-back-squat":"squat","barbell-bench-press":"bench","machine-chest-press":"bench","barbell-deadlift":"deadlift","romanian-deadlift":"deadlift","barbell-overhead-press":"ohp"};
  var GOALNAME={muscle:"Muscle Plan",strength:"Strength Plan",fatloss:"Fat Loss Plan",run:"Run Further Plan",general:"Fit Plan"};
  var PRI={rest:0,mobility:1,circuit:2,strength:3};
  function pad(n){return n<10?"0"+n:""+n}
  function ymd(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function hash(o){var s=JSON.stringify(o),h=5381;for(var i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return h.toString(16)}
  function budget(mins,minor){
    var pts=[[20,8],[30,12],[45,18],[60,24],[90,36]],m=clamp(+mins||45,20,90),r=pts[0][1];
    for(var i=1;i<pts.length;i++)if(m<=pts[i][0]){var a=pts[i-1],b=pts[i];r=a[1]+(b[1]-a[1])*(m-a[0])/(b[0]-a[0]);break}
    r=Math.round(r);return minor?Math.min(12,r):r;
  }
  function startDate(now,mode){var d=new Date(now);d.setHours(12,0,0,0);if(mode==="monday"){var add=(8-d.getDay())%7||7;d.setDate(d.getDate()+add)}return d}
  function intervals(km,weeks,lvl){
    var fin={3:480,5:900,8:1500,10:1800}[km]||900,st=lvl<=1?60:180,out=[];
    for(var w=0;w<weeks;w++){var t=weeks>1?w/(weeks-1):1,jog=Math.max(30,Math.round((st+(fin-st)*t)/30)*30),walk=Math.max(0,Math.round((120-90*t)/15)*15);if(jog>=1500)walk=0;out.push([jog,walk])}
    return out;
  }
  /* start weight (kg) for the main barbell/machine lifts from the lifts the person entered: 60% of the best working weight, 2.5 kg steps */
  function startKg(profile,id){
    var lift=LIFTEX[id],lf=profile&&profile.bench&&profile.bench.lifts;
    if(!lift||!lf||!(+lf[lift]>0))return null;
    return Math.max(2.5,Math.round(0.6*lf[lift]/2.5)*2.5);
  }
  function kg(p,v){return p.units==="imperial"?Math.round(v*2.2046/5)*5+" lb":(Math.round(v/2.5)*2.5)+" kg"}

  function build(profile,exdb,opts){
    opts=opts||{};profile=profile&&typeof profile==="object"?profile:{};
    var LVL=opts.level||root.AxLevel||(typeof require!=="undefined"?require("./levelcalc.js"):null);
    var now=typeof opts.now==="number"?opts.now:Date.now(),NT=opts.notes||{};
    var A=LVL.calc(profile),caps=A.caps,notes=[];
    var days=clamp(+profile.days||4,2,6),mins=+profile.mins||45,weeks=clamp(+profile.weeks||8,4,12),xp=profile.xp||"beg",goal=(profile.goal&&profile.goal.main)||"general";
    var want=Array.isArray(profile.want)?profile.want:[],extra=profile.goal&&profile.goal.extra;
    var env=profile.env||"home",equip=Array.isArray(profile.equip)?profile.equip:[],avoid=Array.isArray(profile.protect)?profile.protect:[];
    var wantRun=goal==="run"||extra==="run"||want.indexOf("run")>=0;
    var sd=(goal==="run"&&days>=4)?days-1:days;                      /* strength days: run goal swaps one for an easy run day */
    var pool=exdb.filter({env:env,equip:equip,avoid:avoid}).filter(function(e){return !(caps.noWeighted&&/weighted/.test(e.id))});
    var weakStr=A.weak.filter(function(w){return w!=="run"});
    var BUD=budget(mins,caps.minor),CAP=caps.maxSetsPerExercise||5,gymEnv=env==="gym";

    /* 1) sessions from the split, weak patterns first */
    var order=SPLIT[sd],sessions=order.map(function(t,i){
      var slots=TPL[t].map(function(g){return {g:g,b:GP[g[0]],sets:0,ex:null,prac:false}});
      var weakSlots=slots.filter(function(s){return weakStr.indexOf(LV[s.b])>=0}),rest=slots.filter(function(s){return weakStr.indexOf(LV[s.b])<0});
      return {t:t,key:DAYS[sd][i],slots:weakSlots.concat(rest)};
    });
    /* 2) weak patterns trained 3x a week: add short practice slots to sessions that lack them */
    if(days>=3)weakStr.forEach(function(w){
      var has=function(s){return s.slots.some(function(x){return LV[x.b]===w})},n=sessions.filter(has).length;
      for(var i=0;i<sessions.length&&n<3;i++)if(!has(sessions[i])){var g=PRACT[w];sessions[i].slots.push({g:g,b:GP[g[0]],sets:2,ex:null,prac:true});n++}
    });
    /* 3) weekly set targets per pattern */
    var base={beg:7,"int":10,adv:14}[xp]||7;base+=goal==="muscle"?2:(goal==="strength"?-1:0);
    var T={};BUCKETS.forEach(function(b){T[b]=base});
    var add=Math.min(4,Math.round(base*0.4));
    weakStr.forEach(function(w){BUCKETS.forEach(function(b){
      if(LV[b]!==w)return;T[b]+=add;
      var best=null;BUCKETS.forEach(function(c){if(LV[c]===w)return;if(best===null||A.levels[LV[c]]>A.levels[LV[best]])best=c});
      if(best)T[best]=Math.max(Math.min(T[best],6),T[best]-add);
    })});
    var cnt={};BUCKETS.forEach(function(b){cnt[b]=0});
    sessions.forEach(function(s){s.slots.forEach(function(x){if(!x.prac)cnt[x.b]++})});
    sessions.forEach(function(s){s.slots.forEach(function(x){if(!x.prac)x.sets=clamp(Math.round(T[x.b]/Math.max(1,cnt[x.b])),2,CAP);else x.sets=Math.min(x.sets,CAP)})});
    /* 4) pick exercises (fit to level, variety, built-in picture bonus) */
    var used={};
    sessions.forEach(function(s){
      var inDay={};
      s.slots=s.slots.filter(function(x){
        var tgt=A.start[LV[x.b]];if(x.prac)tgt=Math.max(0,tgt-1);
        var best=null,bs=-1e9;
        pool.forEach(function(e){
          if(x.g.indexOf(e.g)<0||inDay[e.id])return;
          var sc=-Math.abs(e.L-tgt)*3+(e.b?1:0)-(used[e.id]||0)*4+(x.g.length-x.g.indexOf(e.g))*0.5+(gymEnv&&e.e.some(function(t){return GYMEQ.indexOf(t)>=0})?2:0);   /* at a gym prefer the gym equipment */
          if(sc>bs){bs=sc;best=e}
        });
        if(!best)return false;
        x.ex=best;inDay[best.id]=1;used[best.id]=(used[best.id]||0)+1;return true;
      });
    });
    /* 5) session budget: lower sets first, then drop the last non-weak slots */
    function tot(s){return s.slots.reduce(function(a,x){return a+x.sets},0)}
    sessions.forEach(function(s){
      var guard=200;
      while(tot(s)>BUD&&guard--){
        var cand=null;
        for(var i=s.slots.length-1;i>=0;i--){var x=s.slots[i];if(x.sets>2&&(cand===null||(weakStr.indexOf(LV[cand.b])>=0&&weakStr.indexOf(LV[x.b])<0)))cand=x}
        if(cand){cand.sets--;continue}
        var drop=-1;for(var j=s.slots.length-1;j>=0;j--)if(weakStr.indexOf(LV[s.slots[j].b])<0){drop=j;break}
        if(drop<0){ /* only weak slots left: drop a duplicate pattern first, so every weak pattern keeps its session */
          var seen={};s.slots.forEach(function(x){seen[x.b]=(seen[x.b]||0)+1});
          for(var q=s.slots.length-1;q>=0;q--)if(seen[s.slots[q].b]>1){drop=q;break}
          if(drop<0)drop=s.slots.length-1;
        }
        if(s.slots.length<=1){s.slots[0].sets=Math.min(s.slots[0].sets,BUD);break}
        s.slots.splice(drop,1);
      }
    });
    /* 6) pulling sets >= 0.8 x pushing sets */
    function sum(b){var n=0;sessions.forEach(function(s){s.slots.forEach(function(x){if(x.b===b)n+=x.sets})});return n}
    var g2=300;
    while(sum("pull")<0.8*sum("push")&&g2--){
      var did=false,i2,j2,s2,x2;
      for(i2=sessions.length-1;i2>=0&&!did;i2--){s2=sessions[i2];for(j2=s2.slots.length-1;j2>=0;j2--){x2=s2.slots[j2];if(x2.b==="push"&&x2.sets>2){x2.sets--;did=true;break}}}
      if(did)continue;
      for(i2=0;i2<sessions.length&&!did;i2++){s2=sessions[i2];if(tot(s2)>=BUD)continue;for(j2=0;j2<s2.slots.length;j2++){x2=s2.slots[j2];if(x2.b==="pull"&&x2.sets<CAP){x2.sets++;did=true;break}}}
      if(did)continue;
      /* add one more pulling exercise where the session has room */
      for(i2=0;i2<sessions.length&&!did;i2++){
        s2=sessions[i2];if(tot(s2)+Math.min(2,CAP)>BUD)continue;
        var inS={};s2.slots.forEach(function(x){inS[x.ex.id]=1});
        var pb=null,pbs=-1e9,pg=["pullacc","row","pullup"];
        pool.forEach(function(e){if(pg.indexOf(e.g)<0||inS[e.id])return;var sc=-Math.abs(e.L-A.start.pull)*3+(e.b?1:0)-(used[e.id]||0)*4;if(sc>pbs){pbs=sc;pb=e}});
        if(pb){used[pb.id]=(used[pb.id]||0)+1;s2.slots.push({g:pg,b:"pull",sets:Math.min(2,CAP),ex:pb,prac:false});did=true}
      }
      if(did)continue;
      for(i2=sessions.length-1;i2>=0&&!did;i2--){s2=sessions[i2];for(j2=s2.slots.length-1;j2>=0;j2--){x2=s2.slots[j2];if(x2.b==="push"){if(x2.sets>1)x2.sets--;else s2.slots.splice(j2,1);did=true;break}}}
      if(!did)break;
    }
    /* 7) day objects */
    function noteFor(e,lvl){
      var nm=NT[e.n],n=nm&&nm.note?String(nm.note):(e.cue||GENERIC[e.p]||"Good form first."),lift=LIFTEX[e.id],lf=profile.bench&&profile.bench.lifts,adv=[],i;
      if(e.e.some(function(t){return GYMEQ.indexOf(t)>=0})){
        if(lift&&lf&&+lf[lift]>0){var w=kg(profile,startKg(profile,e.id));adv=[" Start about "+w+", add weight when 10 reps feel easy."," Start about "+w+"."]}
        else adv=[" Find a weight you can do 10 reps with, 2 left in the tank."," Pick a weight for 10 reps, 2 left."];
      }
      for(i=0;i<adv.length;i++)if((n+adv[i]).length<=160)return n+adv[i];   /* longest advice that still fits the 160 character note limit */
      return n.slice(0,160);
    }
    function repsFor(e,tgt){
      var nm=NT[e.n];if(nm&&nm.reps!=null&&String(nm.reps).length<=20&&String(nm.reps).trim())return String(nm.reps);
      if(e.reps)return e.reps;
      if(/^(plank|side-plank|l-sit|wall-sit|dead-hang)$|hold$/.test(e.id))return "20-40 sec";
      if(e.g==="pullup")return e.L<=1?"3-6":"5-8";
      if(e.p==="mobility")return "30 sec";if(e.p==="cardio")return "30-45 sec";
      if(e.e.some(function(t){return t==="barbell"||t==="machine"||t==="cable"||t==="dumbbell"}))return e.L>=3?"6-10":"8-12";
      return e.L>=4?"5-8":(e.L===3?"8-12":"10-15");
    }
    function row(e,sets){var o={name:e.n,reps:repsFor(e),note:noteFor(e)};if(sets)o.sets=sets;return o}
    var plan={days:{}},dayList=[];
    sessions.forEach(function(s){
      var tt=TITLE[s.t],hasWeak=weakStr.filter(function(w){return s.slots.some(function(x){return LV[x.b]===w&&!x.prac})})[0];
      plan.days[s.key]={title:tt[0],short:tt[1],focus:(hasWeak?PNAME[hasWeak]+" priority. ":"")+tt[2],icon:"dumbbell",type:"strength",
        exercises:s.slots.map(function(x){return row(x.ex,x.sets)})};
    });
    var free=WK.filter(function(k){return !plan.days[k]}),pref=["wed","sat","sun","tue","thu","mon","fri"],take=function(){for(var i=0;i<pref.length;i++){var k=pref[i];if(free.indexOf(k)>=0){free.splice(free.indexOf(k),1);return k}}return null};
    function mobDay(title,focus){
      var m=pool.filter(function(e){return e.p==="mobility"}).sort(function(a,b){return b.b-a.b}).slice(0,5);
      return {title:title,short:title==="Easy run"?"Run":"Stretch",focus:focus,icon:title==="Easy run"?"run":"stretch",type:"mobility",exercises:m.map(function(e){return row(e)})};
    }
    var extraDays=0;
    if(goal==="run"&&days>=4&&free.length>1){var k1=take();if(k1){plan.days[k1]=mobDay("Easy run","Easy run plus a short stretch");extraDays++}}
    if(goal==="fatloss"&&free.length>1&&sd+extraDays<=4){
      var k2=take();if(k2){
        var tl=clamp(Math.round((A.start.push+A.start.legs+A.start.core)/3),0,3),ex=[],inC={};
        [["squat","single"],["pushup"],["core"],["cardio"]].forEach(function(gs){
          var b=null,bs=-1e9;pool.forEach(function(e){if(gs.indexOf(e.g)<0||inC[e.id])return;var sc=-Math.abs(e.L-tl)*3+(e.b?1:0)-(used[e.id]||0)*4;if(sc>bs){bs=sc;b=e}});
          if(b){inC[b.id]=1;used[b.id]=(used[b.id]||0)+1;ex.push(row(b))}});
        if(ex.length){plan.days[k2]={title:"Full body circuit",short:"Circuit",focus:"Rest 60-90 sec between rounds",icon:"flame",type:"circuit",rounds:xp==="beg"?2:3,exercises:ex};extraDays++}
        else free.push(k2);
      }
    }
    if(free.length>=3){var k3=take();if(k3)plan.days[k3]=mobDay("Mobility and stretch","Recovery and stretching, about 20 min")}
    WK.forEach(function(k){if(!plan.days[k])plan.days[k]={title:"Rest day",short:"Rest",focus:"No strength training today",icon:"moon",type:"rest",exercises:[]}});
    /* 8) running: reuse the builder's interval logic, run days on the lightest days first */
    var out={format:"arya-plan",version:1,name:"",athlete:String(profile.name||opts.athlete||"").slice(0,40),start:ymd(startDate(now,profile.start)),weeks:weeks,
      lightWeeks:weeks>=4?[4,8,12].filter(function(w){return w<=weeks}):[],lightSets:2,days:plan.days};
    if(wantRun){
      var kms=[3,5,8,10],ki=({0:0,1:0,2:1,3:1,4:2,5:3})[A.levels.run]||0;if(goal==="run")ki=Math.min(3,ki+1);
      var km=kms[ki],runs=A.levels.run<=1?3:4;if(goal==="run")runs=Math.min(5,runs+1);
      var ord=WK.map(function(k){return [k,out.days[k].type]}).sort(function(a,b){return PRI[a[1]]-PRI[b[1]]||WK.indexOf(a[0])-WK.indexOf(b[0])}).slice(0,runs).map(function(x){return x[0]});
      WK.forEach(function(k){var d=out.days[k];if(ord.indexOf(k)<0)d.jog=false;else d.jogNote=d.type==="rest"?"Slowest pace. Walk if you are sore.":d.type==="mobility"?"Your steadiest run of the week. Easy, you can talk.":d.type==="circuit"?"Easy pace, you will be tired. Keep it relaxed.":"Easy pace, right after strength. Stretch after."});
      out.jog={label:km+" km run and walk",km:km,weeks:intervals(km,weeks,A.levels.run)};
    }else WK.forEach(function(k){out.days[k].jog=false});
    out.habits=[{name:"Water",badge:"2-3 L",note:"More on hot days and run days.",icon:"drop"},{name:"Protein",badge:"Every meal",note:"Eggs, paneer, dal, curd, soya, chana, sprouts.",icon:"egg"},{name:"Sleep",badge:"7-9 h",note:"Muscle is built during recovery.",icon:"moon"}];
    /* 9) name, gen, notes */
    out.name=(GOALNAME[goal]||"Fit Plan")+(weakStr.length?": "+PNAME[weakStr[0]]+" focus":"");
    var gen={v:1,ts:now,levels:A.levels,weak:A.weak,inputsHash:hash([profile.bench,profile.goal,profile.xp,profile.env,equip,avoid,days,mins,weeks,profile.health,profile.age,want])};
    notes.push("Week 1 is a test week: start one level lower, stop 2 reps before failure and log your reps. Coach adjusts from there.");
    if(weakStr.length)notes.push("Weak point: "+weakStr.map(function(w){return NOTEW[w]}).join(" and ")+". It is trained first and at least 3 times a week.");
    if(A.skipped.length)notes.push("We estimated "+A.skipped.map(function(k){return SKIPW[k]||k}).join(", ")+" from your experience level, because you skipped it.");
    if(caps.gentle)notes.push("Gentle mode: at most 2 sets per exercise and no max-effort tests. If something hurts, stop and see a doctor. This is not medical advice.");
    if(caps.minor)notes.push("Under 18: no weighted or max-effort work and at most 12 sets per session.");
    if(avoid.length)notes.push("Exercises that load your "+avoid.join(", ")+" were left out.");
    return {plan:out,gen:gen,notes:notes};
  }
  var api={build:build,budget:budget,intervals:intervals,startKg:startKg};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.AxPlanGen=api;
})(typeof window!=="undefined"?window:this);

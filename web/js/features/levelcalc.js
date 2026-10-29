/* levelcalc.js: onboarding S2. Pure level + weak-point engine (docs/onboarding/03). No UI, no storage, also runs in node.
   AxLevel.calc(profile) -> {levels:{push,pull,legs,core,run}, start:{...}, weak:[..], skipped:[..], caps:{...}}
   Weak point = level <= top-2 (top = max of push/pull/legs/core) or picked in "want"; max 2, biggest gap first; run only when goal is run. */
(function(root){
  var PAT=["push","pull","legs","core","run"];
  /* lowest value that reaches level 1..5 (below the first = level 0) */
  var T={push:[3,10,20,35,50],pull:[1,3,6,10,15],squat:[1,15,30,50,100],plank:[1,20,45,90,180],run:[1,3,5,10,15]};
  /* gym lifts: ratio to body weight for levels 1..5 */
  var LIFT={squat:[.5,.75,1,1.5,2],bench:[.4,.6,.9,1.1,1.4],deadlift:[.75,1,1.5,1.9,2.4],ohp:[.3,.45,.6,.8,1]};
  var LIFTPAT={squat:"legs",deadlift:"legs",bench:"push",ohp:"push"};
  var XP={beg:1,"int":2,adv:3};
  function lvl(tab,v){var n=0;for(var i=0;i<tab.length;i++)if(v>=tab[i])n=i+1;return n}
  function isNum(v){return typeof v==="number"&&isFinite(v)&&v>=0}
  function calc(p){
    p=p&&typeof p==="object"?p:{};
    var b=p.bench&&typeof p.bench==="object"?p.bench:{},def=XP[p.xp]||1,skipped=[],L={};
    function from(key,tab){if(isNum(b[key]))return lvl(tab,b[key]);skipped.push(key);return def}
    L.push=from("push",T.push);L.pull=from("pull",T.pull);L.legs=from("squat",T.squat);L.core=from("plank",T.plank);L.run=from("run",T.run);
    /* gym lifts can raise a bodyweight level by at most 1 */
    var lf=b.lifts&&typeof b.lifts==="object"?b.lifts:{},wt=+p.wt;
    if(wt>=30)Object.keys(LIFT).forEach(function(k){
      if(!isNum(lf[k])||!lf[k])return;
      var l=lvl(LIFT[k],lf[k]/wt),pt=LIFTPAT[k];
      if(l>L[pt])L[pt]=Math.min(L[pt]+1,l);
    });
    var prot=Array.isArray(p.protect)?p.protect:[];
    if(prot.indexOf("knee")>=0)L.legs=Math.max(0,L.legs-1);
    var decl=p.weakAsked===true&&Array.isArray(p.weak)&&p.weak.length===0; /* asked and said no to the gap-based priority */
    var top=Math.max(L.push,L.pull,L.legs,L.core),want=Array.isArray(p.want)?p.want:[],cand=[];
    PAT.forEach(function(k){
      if(k==="run"&&!(p.goal&&p.goal.main==="run"))return;
      var gap=top-L[k];
      if((gap>=2&&!decl)||want.indexOf(k)>=0)cand.push({k:k,gap:gap,w:want.indexOf(k)>=0?1:0});
    });
    cand.sort(function(a,c){return c.gap-a.gap||c.w-a.w||PAT.indexOf(a.k)-PAT.indexOf(c.k)});
    var weak=cand.slice(0,2).map(function(c){return c.k}),start={};
    PAT.forEach(function(k){start[k]=Math.max(0,L[k]-1)}); /* ramp-in: week 1 one level lower */
    var gentle=p.health==="check",minor=p.age==="under18";
    return {levels:L,start:start,weak:weak,skipped:skipped,
      caps:{gentle:gentle,minor:minor,maxSetsPerExercise:gentle?2:null,noMaxTests:gentle||minor,noWeighted:minor,sessionSetCap:minor?12:null,longRest:gentle}};
  }
  var api={calc:calc,PAT:PAT,thresholds:T,lifts:LIFT};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.AxLevel=api;
})(typeof window!=="undefined"?window:this);

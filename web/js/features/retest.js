/* retest.js: onboarding S8. Pure 4-week retest logic: when it is due, new levels from fresh benchmarks, weak points added or dropped
   (a gap of 1 or less closes the priority). No UI, no storage, also runs in node. UI lives in onboard.js (retest mode) and onboard-entry.js. */
(function(root){
  var DAY=864e5,PERIOD=28*DAY,SNOOZE=3*DAY,BK=["push","pull","squat","plank","run"],LIFTS=["squat","bench","deadlift","ohp"];
  function LV(){return root.AxLevel||(typeof require!=="undefined"?require("./levelcalc.js"):null)}
  /* due date: stored one, else 4 weeks after the profile was made (profiles from before retest existed) */
  function dueAt(p){if(!p||!p.done)return null;var r=p.retest;if(r&&typeof r.due==="number")return r.due;return typeof p.ts==="number"&&p.ts>0?p.ts+PERIOD:null}
  function due(p,now){var d=dueAt(p);return d!==null&&now>=d}
  function initial(levels,now){return {last:now,due:now+PERIOD,history:[{ts:now,levels:levels}]}}
  function snooze(p,now){var r=p&&p.retest?JSON.parse(JSON.stringify(p.retest)):{last:null,history:[]};r.due=now+SNOOZE;if(!Array.isArray(r.history))r.history=[];return r}
  function num(v){return typeof v==="number"&&isFinite(v)&&v>=0}
  /* p: stored profile, bench: new benchmark answers (null/missing keeps the old value) -> {profile, levels, old, changes, removed, added, weak} */
  function run(p,bench,now){
    var lv=LV(),old=p.levels&&typeof p.levels==="object"?JSON.parse(JSON.stringify(p.levels)):lv.calc(p).levels;
    var nb=JSON.parse(JSON.stringify(p.bench||{}));bench=bench||{};
    BK.forEach(function(k){if(num(bench[k]))nb[k]=bench[k]});
    nb.lifts=Object.assign({squat:null,bench:null,deadlift:null,ohp:null},nb.lifts||{});
    if(bench.lifts)LIFTS.forEach(function(k){if(num(bench.lifts[k]))nb.lifts[k]=bench.lifts[k]});
    var declined=p.weakAsked===true&&(p.weak||[]).length===0,oldWeak=(p.weak||[]).slice();
    var np=Object.assign({},p,{bench:nb}),A=lv.calc(np);            /* declined people stay declined: calc ignores the gap rule */
    var changes=[],k;
    lv.PAT.forEach(function(k){if(old[k]!==A.levels[k])changes.push({k:k,from:old[k],to:A.levels[k]})});
    var removed=oldWeak.filter(function(w){return A.weak.indexOf(w)<0}),added=A.weak.filter(function(w){return oldWeak.indexOf(w)<0&&!declined});
    var hist=(p.retest&&Array.isArray(p.retest.history)?p.retest.history.slice():[]);hist.push({ts:now,levels:A.levels});
    var prof=Object.assign({},np,{levels:A.levels,weak:declined?[]:A.weak,weakAsked:declined,retest:{last:now,due:now+PERIOD,history:hist.slice(-12)}});
    return {profile:prof,levels:A.levels,old:old,changes:changes,removed:removed,added:added,weak:A.weak};
  }
  var api={due:due,dueAt:dueAt,initial:initial,snooze:snooze,run:run,PERIOD:PERIOD,SNOOZE:SNOOZE};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.AxRetest=api;
})(typeof window!=="undefined"?window:this);

/* loads.js: onboarding S9. Pure helpers for gym weights. Weights are stored in kg, per set, in PR.wtLog = {exercise:{dayIdx:[kg per set]}},
   parallel to PR.setLog (reps). No UI, no storage, also runs in node. UI is in progression.js, backup cleaning in data-io.js. */
(function(root){
  var LB=2.2046,GYM=["dumbbell","barbell","machine","cable"],DI=/^\d{1,3}$/;
  function isLb(units){return units==="imperial"}
  /* shown number: lb whole, kg to 0.5 */
  function disp(kg,units){kg=+kg||0;return isLb(units)?Math.round(kg*LB):Math.round(kg*2)/2}
  function fmt(kg,units){return disp(kg,units)+(isLb(units)?" lb":" kg")}
  function lower(ex){return !!ex&&(ex.p==="squat"||ex.p==="hinge")}
  function weightable(ex){return !!ex&&Array.isArray(ex.e)&&ex.e.some(function(t){return GYM.indexOf(t)>=0})}
  /* one tap = next grid line up or down: 2.5 kg (5 kg for legs), or 5 lb (10 lb for legs); a weight off the grid snaps to it */
  function bump(kg,dir,units,isLower){
    kg=+kg||0;var up=dir>=0,out,v=isLb(units)?kg*LB:kg,st=isLb(units)?(isLower?10:5):(isLower?5:2.5),eps=1e-6;
    var q=v/st;q=up?Math.floor(q+eps)+1:Math.ceil(q-eps)-1;out=Math.max(0,q*st);
    out=isLb(units)?out/LB:out;
    return Math.min(500,Math.round(out*100)/100);
  }
  function dayWeight(arr){var w=0;(arr||[]).forEach(function(v){if(+v>0)w=+v});return w}   /* last weight used that day */
  function today(log,name,d){return dayWeight(log&&log[name]&&log[name][d])}
  /* most recent earlier day with a weight: {d, kg} or null */
  function last(log,name,cur){
    var m=log&&log[name];if(!m)return null;var best=null;
    Object.keys(m).forEach(function(k){var d=+k,w=dayWeight(m[k]);if(w>0&&d<cur&&(best===null||d>best.d))best={d:d,kg:w}});
    return best;
  }
  function best(log,name){var m=log&&log[name],b=0;if(!m)return 0;Object.keys(m).forEach(function(k){(m[k]||[]).forEach(function(v){if(+v>b)b=+v})});return b}
  /* a whole day of the same weight for n sets */
  function fill(kg,n){var a=[],i;for(i=0;i<Math.max(1,Math.min(10,n|0));i++)a.push(kg);return a}
  /* backup / import: same shape rules as setLog (60 exercises, 300 days, 10 sets), weights 0-500 kg */
  function cleanLog(src){
    if(!src||typeof src!=="object"||Array.isArray(src))return null;var out={},n=0;
    Object.keys(src).slice(0,60).forEach(function(name){
      var ob=src[name];if(!ob||typeof ob!=="object"||Array.isArray(ob))return;var dm={};
      Object.keys(ob).slice(-300).forEach(function(d){
        if(!DI.test(d)||!Array.isArray(ob[d]))return;
        var a=ob[d].slice(0,10).map(function(v){v=+v;return isFinite(v)?Math.max(0,Math.min(500,Math.round(v*100)/100)):0});
        if(a.some(function(v){return v>0}))dm[d]=a;
      });
      if(Object.keys(dm).length){out[String(name).slice(0,40)]=dm;n++}
    });
    return n?out:null;
  }
  var api={disp:disp,fmt:fmt,lower:lower,weightable:weightable,bump:bump,dayWeight:dayWeight,today:today,last:last,best:best,fill:fill,cleanLog:cleanLog};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.AxLoads=api;
})(typeof window!=="undefined"?window:this);

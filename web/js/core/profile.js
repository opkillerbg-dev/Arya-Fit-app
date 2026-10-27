/* Onboarding profile: validation + draft storage. See docs/onboarding/02_DATA_MODEL.md.
   axCleanProfile(raw,{draft}) whitelists every field, so imported or stored data can never carry junk.
   Works in the browser and in node (tests). Loaded after store.js. */
(function(root){
  var ENUM={units:["metric","imperial"],age:["under18","18-29","30-39","40-49","50-59","60+"],sex:["m","f","x"],health:["ok","check"],
    goal:["muscle","strength","fatloss","run","general"],xp:["beg","int","adv"],env:["home","homeplus","gym"],start:["today","monday"],
    equip:["backpack","pullbar","dumbbell","band","bench","rope","barbell","machine","cable","chair","wheel"],
    pat:["push","pull","legs","core","run"],want:["push","pull","legs","core","run","flex","posture"],
    protect:["knee","back","shoulder","wrist","elbow","ankle","neck"]};
  var BENCH={push:[0,500],pull:[0,200],squat:[0,1000],plank:[0,3600],run:[0,100]},LIFTS=["squat","bench","deadlift","ohp"];
  function isObj(x){return x&&typeof x==="object"&&!Array.isArray(x)}
  function en(v,list,dflt){return typeof v==="string"&&list.indexOf(v)>=0?v:(dflt===undefined?null:dflt)}
  function num(v,lo,hi){if(typeof v==="string"&&v.trim()!==""&&isFinite(+v))v=+v;return typeof v==="number"&&isFinite(v)&&v>=lo&&v<=hi?Math.round(v*10)/10:null}
  function int(v,lo,hi,dflt){if(typeof v==="string"&&v.trim()!==""&&isFinite(+v))v=+v;if(typeof v!=="number"||!isFinite(v))return dflt;return Math.max(lo,Math.min(hi,Math.round(v)))}
  function list(v,allowed,max){var o=[];if(!Array.isArray(v))return o;for(var i=0;i<v.length&&o.length<max;i++)if(allowed.indexOf(v[i])>=0&&o.indexOf(v[i])<0)o.push(v[i]);return o}
  function levels(v){if(!isObj(v))return null;var o={},ok=0;ENUM.pat.forEach(function(k){var n=int(v[k],0,5,null);if(n!==null){o[k]=n;ok++}});return ok?o:null}
  function name(s){return typeof s==="string"?s.replace(/[\u0000-\u001f<>&"]/g,"").trim().slice(0,40):""}
  function clean(raw,opt){
    var draft=!!(opt&&opt.draft);
    if(!isObj(raw))return null;
    var o={v:1,done:!draft&&raw.done===true,ts:int(raw.ts,0,4102444800000,0)};
    o.units=en(raw.units,ENUM.units,"metric");o.name=name(raw.name);
    o.ht=num(raw.ht,100,230);o.wt=num(raw.wt,30,250);o.age=en(raw.age,ENUM.age);o.sex=en(raw.sex,ENUM.sex);
    o.health=en(raw.health,ENUM.health,"ok");
    var g=isObj(raw.goal)?raw.goal:{};o.goal={main:en(g.main,ENUM.goal),extra:en(g.extra,ENUM.goal)};if(o.goal.extra===o.goal.main)o.goal.extra=null;
    o.xp=en(raw.xp,ENUM.xp);o.env=en(raw.env,ENUM.env);o.equip=list(raw.equip,ENUM.equip,12);
    var b=isObj(raw.bench)?raw.bench:{},ob={lifts:{}};
    Object.keys(BENCH).forEach(function(k){ob[k]=num(b[k],BENCH[k][0],BENCH[k][1])});
    var lf=isObj(b.lifts)?b.lifts:{};LIFTS.forEach(function(k){ob.lifts[k]=num(lf[k],0,600)});o.bench=ob;
    o.levels=levels(raw.levels);o.weak=list(raw.weak,ENUM.pat,2);o.want=list(raw.want,ENUM.want,4);o.protect=list(raw.protect,ENUM.protect,7);
    o.days=int(raw.days,2,6,null);o.mins=int(raw.mins,20,90,null);o.weeks=int(raw.weeks,4,12,null);o.start=en(raw.start,ENUM.start,"today");
    var r=isObj(raw.retest)?raw.retest:{},rh=[];
    if(Array.isArray(r.history))r.history.forEach(function(h){var lv=isObj(h)?levels(h.levels):null;if(lv)rh.push({ts:int(h.ts,0,4102444800000,0),levels:lv})});
    rh=rh.slice(-12);
    o.retest={last:int(r.last,0,4102444800000,null),due:int(r.due,0,4102444800000,null),history:rh};
    if(!draft){ /* a finished profile must be usable by the plan engine */
      if(!o.done||!o.levels||!o.goal.main||!o.env||!o.days||!o.mins||!o.weeks)return null;
      ENUM.pat.forEach(function(k){if(o.levels[k]===undefined)o.levels[k]=0})}
    return o}
  /* draft: kept outside APP until the person taps Create */
  var DK="aryaOnboardDraft";
  function draftGet(){try{var s=localStorage.getItem(DK);return s?clean(JSON.parse(s),{draft:true}):null}catch(e){return null}}
  function draftSet(p){try{var c=clean(p,{draft:true});if(!c)return false;c.step=int(p&&p.step,0,20,0);localStorage.setItem(DK,JSON.stringify(c));return true}catch(e){return false}}
  function draftClear(){try{localStorage.removeItem(DK)}catch(e){}}
  function draftStep(){try{var s=JSON.parse(localStorage.getItem(DK)||"null");return s?int(s.step,0,20,0):0}catch(e){return 0}}
  /* the profile in use (null until onboarding is finished) */
  function get(){return root.APP&&root.APP.profile&&root.APP.profile.done?root.APP.profile:null}
  function set(raw){var c=clean(raw,{draft:false});if(!c)return null;root.APP.profile=c;draftClear();try{root.save()}catch(e){}return c}
  var api={clean:clean,ENUM:ENUM,draftGet:draftGet,draftSet:draftSet,draftClear:draftClear,draftStep:draftStep,get:get,set:set};
  root.axCleanProfile=clean;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.AxProfile=api;
})(typeof window!=="undefined"?window:this);

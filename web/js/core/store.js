/* Storage safety: schema version, migrations, damaged-data recovery, snapshots.
   APP.schema = version of the saved data shape. Add a migration to AXMIG and raise AXSCHEMA when the shape changes.
   localStorage keys written here: aryaApp2.bak (daily copy), aryaApp2.premig (copy before a migration),
   aryaApp2.bad (a damaged file, kept as evidence), aryaApp2.preimport (copy before a backup import). */
var AXSCHEMA=2,
 AXMIG=[{to:1,name:"baseline",run:function(a){return a}},
  {to:2,name:"profile",run:function(a){if(!("profile" in a))a.profile=null;return a}}],
 AXSK={bak:"aryaApp2.bak",bakts:"aryaApp2.bakts",pre:"aryaApp2.premig",bad:"aryaApp2.bad",imp:"aryaApp2.preimport"},
 AXSTORE={src:"none",from:0,to:0,newer:false,error:null,ran:[]};
function axLsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function axLsSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function axParse(s){if(!s)return null;try{var o=JSON.parse(s);return o&&typeof o==="object"?o:null}catch(e){return null}}
function axValidApp(a){return !!(a&&a.plans&&typeof a.plans==="object"&&a.active&&a.plans[a.active])}
/* pure: runs migrations with to > a.schema up to target, in order. Never throws; on error returns the untouched original. */
function axRunMig(a,list,target){
  var from=+a.schema||0,res={app:a,from:from,to:from,ran:[],error:null,newer:false};
  if(from>target){res.newer=true;return res}
  var snap=JSON.stringify(a);
  try{
    list.slice().sort(function(x,y){return x.to-y.to}).forEach(function(m){
      if(m.to>from&&m.to<=target){var r=m.run(a);if(r&&typeof r==="object")a=r;a.schema=m.to;res.ran.push(m.name)}});
    if((+a.schema||0)<target)a.schema=target;
    res.app=a;res.to=a.schema
  }catch(e){res.app=JSON.parse(snap);res.to=from;res.ran=[];res.error=String(e&&e.message||e)}
  return res}
function axNote(msg){setTimeout(function(){try{toast(msg)}catch(e){}},1800)}
/* replaces the bare JSON.parse in loadApp. Returns the saved app object (migrated) or null (fresh install / legacy path). */
function axStoreRead(){
  var raw=axLsGet(KEY2),a=axParse(raw),src="main";AXSTORE={src:"none",from:0,to:0,newer:false,error:null,ran:[]};
  if(!raw)return null;
  if(!axValidApp(a)){
    axLsSet(AXSK.bad,raw);
    var b=axParse(axLsGet(AXSK.bak));
    if(axValidApp(b)){a=b;src="bak";axNote("Your data file was damaged. Restored your copy from the last daily backup.")}
    else return null}
  var before=JSON.stringify(a);
  if(src==="main"){var t=+axLsGet(AXSK.bakts)||0;
    if(Date.now()-t>20*3600*1000&&before.length<1200000){if(axLsSet(AXSK.bak,before))axLsSet(AXSK.bakts,String(Date.now()))}}
  if((+a.schema||0)<AXSCHEMA)axLsSet(AXSK.pre,before);
  var r=axRunMig(a,AXMIG,AXSCHEMA);
  AXSTORE={src:src,from:r.from,to:r.to,newer:r.newer,error:r.error,ran:r.ran};
  if(r.error)axNote("Data upgrade failed, so your data was left as it was. Please tell the developer.");
  else if(r.newer)axNote("This data came from a newer app version. Update the app before editing.");
  return r.app}
/* new/legacy data built in loadApp is already current */
function axStamp(a){if(!a)return;if(!(+a.schema>0))a.schema=AXSCHEMA;if(!("profile" in a))a.profile=null}
function axSnap(name){return axLsSet("aryaApp2."+name,JSON.stringify(APP))}

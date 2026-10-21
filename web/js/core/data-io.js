var rs=document.getElementById("rs"),arm=0;
rs.onclick=function(){
  if(!arm){arm=1;rs.textContent="Tap again to erase all";rs.classList.add("warn");setTimeout(function(){arm=0;rs.textContent="Reset all";rs.classList.remove("warn")},3500);return}
  st=APP.plans[APP.active].st={};save();arm=0;rs.textContent="Reset all";rs.classList.remove("warn");cur=Math.max(0,Math.min(ND-1,todayIdx()));render();
};
function ymd(){var d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function axMeta(){var m={build:"arya-v50",plans:0,ticks:0,runDays:0,stepDays:0,stepsTotal:0},ds=PR.ds||{};
  Object.keys(APP.plans).forEach(function(id){m.plans++;var s2=APP.plans[id].st||{};Object.keys(s2).forEach(function(k2){if(/^\d+:/.test(k2))m.ticks++;else if(/^g\d+$/.test(k2)&&s2[k2]>0)m.runDays++})});
  Object.keys(ds).forEach(function(d){m.stepDays++;m.stepsTotal+=ds[d]||0});return m}
function pack(){var o={app:"arya-28day-tracker",version:2,schema:AXSCHEMA,exported:new Date().toISOString(),active:APP.active,meta:axMeta(),prefs:PR,plans:{}};
  Object.keys(APP.plans).forEach(function(id){o.plans[id]={plan:APP.plans[id].plan,progress:APP.plans[id].st,schedMap:APP.plans[id].schedMap,workoutEdits:APP.plans[id].workoutEdits,routes:APP.plans[id].routes,rsum:APP.plans[id].rsum}});return JSON.stringify(o,null,1)}
/* daily steps already travel in prefs.ds; packFresh only refreshes them from the native counter first */
async function packFresh(){try{if(STP){await stepsPull();await stepsHist()}}catch(e){}save();return pack()}
function hm(){var d=new Date();return("0"+d.getHours()).slice(-2)+("0"+d.getMinutes()).slice(-2)}
function axLbk(){var e=$("ax-lbk");if(!e)return;e.textContent=PR.lbk?"Last export: "+new Date(PR.lbk).toLocaleString([],{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"No export yet. Export now and then."}
async function axOut(nm,txt){var PL=window.Capacitor&&Capacitor.Plugins||{};if(PL.Filesystem&&PL.Share){shareFile(nm,txt);return 2}return await dlFile(nm,txt)}
function stepsCSV(){var ds=PR.ds||{},g=sgoal(),o="date,steps,goal,goal_met\n";Object.keys(ds).sort().forEach(function(d){o+=d+","+ds[d]+","+g+","+(ds[d]>=g?"yes":"no")+"\n"});return o}
function clean(p,nd){var o={};nd=nd||ND;for(var key in p){var v=p[key],m;
  if((m=/^(\d{1,3}):(wu|cd|j|e\d{1,2}|h\d)$/.exec(key))&&+m[1]<nd&&v==1)o[key]=1;
  else if((m=/^(?:[wrgsx]|jt|wk)(\d{1,3})$/.exec(key))&&+m[1]<nd&&typeof v=="number"&&v>0&&v<200000)o[key]=Math.round(v)}return o}
function restorePrefs(pr){if(!pr||typeof pr!="object")return;var num=function(x){return typeof x=="number"&&isFinite(x)},di=/^\d{1,3}$/;
  if(pr.brain&&typeof pr.brain=="object"){var Br={};Object.keys(pr.brain).slice(-400).forEach(function(d){var x=pr.brain[d];if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!x||typeof x!="object")return;var y={};["s","e","o"].forEach(function(k){if(Number.isInteger(x[k])&&x[k]>=0&&x[k]<=2)y[k]=x[k]});if(Object.keys(y).length)Br[d]=y});if(Object.keys(Br).length)PR.brain=Br}
  ["snd","auto","gps","hap","exi","exAnim","voi","ap","met","amo"].forEach(function(k){if(pr[k]===0||pr[k]===1)PR[k]=pr[k]});
  if(typeof pr.gls==="boolean")PR.gls=pr.gls;
  if(Number.isInteger(pr.spm)&&pr.spm>=100&&pr.spm<=220)PR.spm=pr.spm;
  if(typeof pr.acc=="string"&&/^#[0-9a-f]{6}$/i.test(pr.acc))PR.acc=pr.acc;
  if(typeof pr.goal=="number"&&pr.goal>=.5&&pr.goal<=42)PR.goal=pr.goal;
  if(typeof pr.skin=="string"&&/^(classic|oldmoney|modern|professional|midnight|sunset)$/.test(pr.skin))PR.skin=pr.skin;
  if(Number.isInteger(pr.lvl)&&pr.lvl>=0&&pr.lvl<=11)PR.lvl=pr.lvl;
  if(Number.isInteger(pr.lrd)&&pr.lrd>=0&&pr.lrd<=400)PR.lrd=pr.lrd;
  if(typeof pr.rmt=="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(pr.rmt))PR.rmt=pr.rmt;
  if(pr.sore&&typeof pr.sore=="object"){PR.sore={};Object.keys(MU).forEach(function(m){if(num(pr.sore[m]))PR.sore[m]=pr.sore[m]})}
  if(pr.routes&&typeof pr.routes=="object"){var R={};Object.keys(pr.routes).slice(0,400).forEach(function(d){var a=pr.routes[d];if(!di.test(d)||!Array.isArray(a))return;
    var rs=a.slice(0,10).map(function(r){return Array.isArray(r)?r.slice(0,300).filter(function(q){return Array.isArray(q)&&q.length>=3&&num(q[0])&&num(q[1])&&num(q[2])}).map(function(q){return[q[0],q[1],q[2]]}):[]}).filter(function(r){return r.length>=2});if(rs.length)R[d]=rs});if(Object.keys(R).length)PR.routes=R}
  if(pr.reps&&typeof pr.reps=="object"){var Rp={};Object.keys(pr.reps).slice(0,40).forEach(function(n){var a=pr.reps[n];if(!Array.isArray(a))return;var r=a.slice(-400).filter(function(x){return Array.isArray(x)&&num(x[0])&&num(x[1])}).map(function(x){return[x[0],x[1]]});if(r.length)Rp[String(n).slice(0,40)]=r});if(Object.keys(Rp).length)PR.reps=Rp}
  if(pr.setLog&&typeof pr.setLog=="object"){var Sl={};Object.keys(pr.setLog).slice(0,60).forEach(function(n){var ob=pr.setLog[n];if(!ob||typeof ob!="object")return;var dm={};Object.keys(ob).slice(-300).forEach(function(d){if(di.test(d)&&Array.isArray(ob[d])){var a=ob[d].slice(0,10).map(function(v){return Math.max(0,Math.min(500,Math.round(+v||0)))});if(a.some(function(v){return v>0}))dm[d]=a}});if(Object.keys(dm).length)Sl[String(n).slice(0,40)]=dm});if(Object.keys(Sl).length)PR.setLog=Sl}
  if(Array.isArray(pr.body)){var bd=pr.body.slice(-400).filter(function(x){return Array.isArray(x)&&num(x[0])}).map(function(x){return[x[0],+x[1]||0,+x[2]||0]});if(bd.length)PR.body=bd}
  if(Array.isArray(pr.fit)){var ft=pr.fit.slice(-100).filter(function(x){return Array.isArray(x)&&num(x[0])&&num(x[1])}).map(function(x){return[x[0],x[1],+x[2]||0,+x[3]||0]});if(ft.length)PR.fit=ft}
  if(pr.rd&&typeof pr.rd=="object"){var D={};Object.keys(pr.rd).slice(0,400).forEach(function(d){var v=pr.rd[d];if(!di.test(d)||!v||typeof v!="object")return;var o={};["s","e"].forEach(function(k){if(v[k]===0||v[k]===1||v[k]===2)o[k]=v[k]});D[d]=o});if(Object.keys(D).length)PR.rd=D}
  if(pr.rdAp&&typeof pr.rdAp=="object"){var Ra={};Object.keys(pr.rdAp).slice(-400).forEach(function(d){if(/^[\w-]{1,40}:\d{1,3}$/.test(d)&&/^(light|rest)$/.test(pr.rdAp[d]))Ra[d]=pr.rdAp[d]});if(Object.keys(Ra).length)PR.rdAp=Ra}
  if(pr.rdOv&&typeof pr.rdOv=="object"){var Ro={};Object.keys(pr.rdOv).slice(-60).forEach(function(d){if(/^\d{4}-\d{2}-\d{2}$/.test(d)&&/^(full|light|rest)$/.test(pr.rdOv[d]))Ro[d]=pr.rdOv[d]});if(Object.keys(Ro).length)PR.rdOv=Ro}
   if(pr.ds&&typeof pr.ds=="object"){var Ds={};Object.keys(pr.ds).slice(0,500).forEach(function(d){var v=pr.ds[d];if(/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isInteger(v)&&v>=0&&v<=200000)Ds[d]=v});if(Object.keys(Ds).length)PR.ds=Ds}
  if(Number.isInteger(pr.sg)&&pr.sg>=1000&&pr.sg<=50000)PR.sg=pr.sg;
  syncPrefs()}
function syncPrefs(){var M={"t-snd":["snd",1],"t-gps":["gps",1],"t-auto":["auto",0],"t-hap":["hap",1],"t-exi":["exi",1],"t-voi":["voi",1],"t-apz":["ap",0],"t-met":["met",0],"t-amo":["amo",0],"t-gls":["gls",0]};
  Object.keys(M).forEach(function(id){var e=$(id);if(e)e.checked=M[id][1]?PR[M[id][0]]!==0:!!PR[M[id][0]]});
  var q=$("spm");if(q)q.value=PR.spm||160;q=$("rm-t");if(q)q.value=PR.rmt||"";theme();metro();remind(1)}
function axCleanSched(raw,days){if(!Array.isArray(raw)||raw.length>500)return null;var out=[];for(var i=0;i<raw.length;i++){var v=raw[i];if(!Number.isInteger(v)||v< -1||v>=days)return null;out.push(v)}return out.length>days?out:null}
function axCleanEdits(raw,days,plan){if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;var out={};Object.keys(raw).slice(0,500).forEach(function(k){if(!/^\d{1,3}$/.test(k)||+k>=days||!raw[k]||typeof raw[k]!=="object")return;var day={};Object.keys(raw[k]).slice(0,80).forEach(function(n){if(!/^\d{1,2}$/.test(n)||!raw[k][n]||typeof raw[k][n]!=="object")return;var v=raw[k][n],o={};if(Number.isInteger(v.sets)&&v.sets>=1&&v.sets<=10)o.sets=v.sets;if(Number.isInteger(v.reps)&&v.reps>=1&&v.reps<=50)o.reps=v.reps;if(Object.keys(o).length)day[n]=o});if(Object.keys(day).length)out[k]=day});return out}
/* run summaries (v92): {day:[{t,d,s,st,jt,wt,km:[],pt:[m,s],pp:[],ga,es,lv,lu,cd,sl}]}, every field range-checked */
function axCleanRsum(raw){if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;var out={},nn=function(x,mx){return typeof x==="number"&&isFinite(x)&&x>=0&&x<=mx},rd=function(x){return Math.round(x)};
  Object.keys(raw).slice(0,500).forEach(function(d){if(!/^\d{1,3}$/.test(d)||!Array.isArray(raw[d]))return;
    var a=raw[d].slice(0,10).map(function(r){if(!r||typeof r!=="object"||!nn(r.t,4e12)||!nn(r.d,1e6)||!nn(r.s,2e5))return null;var o={t:rd(r.t),d:rd(r.d),s:rd(r.s)};
      ["st","jt","wt","ga","es","cd"].forEach(function(k){if(nn(r[k],1e6))o[k]=rd(r[k])});
      if(nn(r.sl,3))o.sl=Math.round(r.sl*100)/100;if(typeof r.lv==="string")o.lv=r.lv.slice(0,40);if(r.lu===1||r.lu===-1)o.lu=r.lu;
      if(Array.isArray(r.km))o.km=r.km.slice(0,100).filter(function(x){return nn(x,20000)}).map(rd);
      if(Array.isArray(r.pt)&&r.pt.length===2&&nn(r.pt[0],1000)&&nn(r.pt[1],20000))o.pt=[rd(r.pt[0]),rd(r.pt[1])];
      if(Array.isArray(r.pp))o.pp=r.pp.slice(0,24).filter(function(x){return nn(x,20000)}).map(rd);
      return o}).filter(Boolean);if(a.length)out[d]=a});return Object.keys(out).length?out:null}
function axCleanRoutes(raw){if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;var out={};Object.keys(raw).slice(0,500).forEach(function(d){if(!/^\d{1,3}$/.test(d)||!Array.isArray(raw[d]))return;var rs=raw[d].slice(0,10).map(function(r){return Array.isArray(r)?r.slice(0,300).filter(function(q){return Array.isArray(q)&&q.length>=3&&typeof q[0]==="number"&&isFinite(q[0])&&typeof q[1]==="number"&&isFinite(q[1])&&typeof q[2]==="number"&&isFinite(q[2])}).map(function(q){return[q[0],q[1],q[2]]}):[]}).filter(function(r){return r.length>=2});if(rs.length)out[d]=rs});return Object.keys(out).length?out:null}
function doImport(txt){var d;try{d=JSON.parse(txt)}catch(e){d=null}
  if(!d||d.app!="arya-28day-tracker"||typeof d!="object"){toast("That isn't a tracker backup file.");return}
  if((+d.schema||1)>AXSCHEMA){toast("That backup is from a newer app version. Update the app first.");return}
  var n=0;
  if(d.version==2&&d.plans&&typeof d.plans=="object"){var np={},first=null;
    Object.keys(d.plans).slice(0,12).forEach(function(id){var e=d.plans[id],r=vplan(e&&e.plan);if(!r.plan)return;var sid=String(id).replace(/[^a-z0-9]/gi,"").slice(0,16)||("p"+n);var baseDays=r.plan.weeks*7,sm=axCleanSched(e.schedMap,baseDays);if(!sm&&id===d.active&&Array.isArray(d.prefs&&d.prefs.schedMap))sm=axCleanSched(d.prefs.schedMap,baseDays);var ed=axCleanEdits(e.workoutEdits,sm?sm.length:baseDays,r.plan);np[sid]={plan:r.plan,st:clean(e.progress||{},Math.max(baseDays,sm?sm.length:0)),schedMap:sm||undefined,workoutEdits:ed||undefined,routes:axCleanRoutes(e.routes)||undefined,rsum:axCleanRsum(e.rsum)||undefined};first=first||sid});
    if(!first){toast("No valid plans in that backup.");return}
    axSnap("preimport");APP.plans=np;var pr=d.prefs||{};restorePrefs(pr);
    var act=np[String(d.active).replace(/[^a-z0-9]/gi,"").slice(0,16)]?String(d.active).replace(/[^a-z0-9]/gi,"").slice(0,16):first;
    if(PR.routes&&np[act]&&!np[act].routes)np[act].routes=axCleanRoutes(PR.routes);delete PR.routes;
    Object.keys(np).forEach(function(i2){for(var key in np[i2].st)if(/^\d+:/.test(key))n++});
    save();activate(act);save();toast("Imported "+Object.keys(np).length+" plan(s), "+n+" ticks.");return}
  if(!d.progress||typeof d.progress!="object"){toast("That isn't a tracker backup file.");return}
  st=APP.plans[APP.active].st=clean(d.progress);save();for(var key in st)if(/^\d+:/.test(key))n++;
  closeT();render();toast("Imported "+n+" ticks into the current plan.")}
$("ex").onclick=async function(){var txt=await packFresh(),mt;try{mt=JSON.parse(txt).meta}catch(e){mt=null}
  if(!mt){hx("err");toast("Couldn't build the backup. Try Copy text.");return}
  $("bt").value=txt;var nm="arya-fit-backup-"+ymd()+"-"+hm()+".json",r=await axOut(nm,txt);
  if(!r){$("dt2").open=true;toast("Couldn't save the file. Copy the text below instead.");return}
  PR.lbk=Date.now();save();axLbk();hx("ok");
  toast((r==2?"Choose where to save. ":"Saved to Downloads. ")+mt.runDays+" run days, "+mt.stepDays+" step days.")};
$("ex-stp").onclick=async function(){await packFresh();if(!Object.keys(PR.ds||{}).length){toast("No step data yet.");return}
  var r=await axOut("arya-steps-"+ymd()+".csv",stepsCSV());if(!r)toast("Couldn't save the file.");else{hx("ok");toast(r==2?"Choose where to save the steps file.":"Steps CSV saved to Downloads.")}};
$("im").onclick=function(){$("fi").click()};
$("fi").onchange=function(){var f=this.files[0];this.value="";if(!f)return;var r=new FileReader();r.onload=function(){doImport(String(r.result))};r.readAsText(f)};
$("dt2").ontoggle=function(){if(this.open&&!$("bt").value)packFresh().then(function(t){$("bt").value=t})};
$("cp").onclick=async function(){var t=$("bt");t.value=await packFresh();
  try{navigator.clipboard.writeText(t.value).then(function(){toast("Copied")},function(){t.select();toast("Select and copy the text")})}catch(e){t.select();toast("Select and copy the text")}};
$("ld").onclick=function(){var v=$("bt").value.trim();if(!v){toast("Paste backup text first.");return}doImport(v)};


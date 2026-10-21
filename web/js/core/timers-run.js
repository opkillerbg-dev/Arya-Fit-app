var TM=null,tk=null,ac=null,wlk=null;
function fmt(n){n=Math.max(0,Math.round(n));var h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=n%60;return (h?h+":"+(m<10?"0":""):"")+m+":"+(s<10?"0":"")+s}
function unlock(){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state=="suspended")ac.resume()}catch(e){}try{if(window.speechSynthesis&&!unlock.p){unlock.p=1;speechSynthesis.getVoices();var u=new SpeechSynthesisUtterance(" ");u.volume=0;speechSynthesis.speak(u)}}catch(e){}}
function beep(n,f){try{var q=$("dt");q.classList.remove("bump");void q.offsetWidth;q.classList.add("bump")}catch(e){}try{if(PR.snd===0)throw 0;unlock();for(var j=0;j<n;j++){var o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+j*.22;o.frequency.value=f;g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.17)}}catch(e){}hx(n>=3?"finish":n==2?"walk":f>=800?"jog":"med")}
function tn(f,t,d,ty){var o=ac.createOscillator(),g=ac.createGain();o.type=ty||"triangle";o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.32,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d+.03)}
function snd(k){try{if(PR.snd===0)throw 0;unlock();var t=ac.currentTime+.01;
  if(k=="start"){tn(523,t,.15);tn(784,t+.15,.15);tn(1047,t+.3,.3)}else{tn(1047,t,.15);tn(784,t+.15,.15);tn(523,t+.3,.4)}}catch(e){}
  hx(k=="start"?"start":"finish")}
function tick(){try{if(PR.snd===0)throw 0;unlock();tn(1200,ac.currentTime+.005,.05,"square")}catch(e){}}
function $(i){return document.getElementById(i)}
function el_(){return (TM.acc+(TM.run?Date.now()-TM.last:0))/1000}
function begin(o,keep){trkOff();endT();TM=o;if(keep){TM.last=Date.now();TM.run=false;TM.lt=TM.acc/1000}else{TM.acc=0;TM.last=Date.now();TM.run=true;TM.pstart=0;TM.ph=0;TM.round=1;TM.jt=0;TM.wt=0;TM.lt=0;TM.day=(o.day!=null?o.day:cur)}
  wl();
  $("dock").hidden=false;$("dock").classList.remove("ax-mo");$("dock").classList.toggle("ax-fs",TM.mode=="iv"||TM.mode=="sw");$("dx").textContent=TM.mode=="cd"?"Close":"Save & close";document.body.classList.add("td");snd("start");
  $("gsw").hidden=!o.trk;$("ax-dxs").hidden=!o.trk;$("dsv").hidden=TM.mode=="cd";$("dsv").textContent=TM.mode=="iv"?"Save run time":"Save time";
  $("drs").hidden=false;$("dsw").hidden=TM.mode!="iv";tk=setInterval(step,250);step()}
function endT(){clearInterval(tk);tk=null;try{wlk&&wlk.release()}catch(e){}wlk=null}
function closeT(){if(TM){clrRun();nclr()}trkOff();endT();TM=null;$("dock").hidden=true;document.body.classList.remove("td")}
function startCD(sec,lab){begin({mode:"cd",total:sec,label:lab})}
function startSW(d){begin({mode:"sw",label:"Workout stopwatch",day:d})}
function startIV0(d){if(!JKM)return;d=d==null?cur:d;brk();var q=IVS[lvl()];begin({mode:"iv",seq:q[1]?[q[0],q[1]]:[86400,86400],label:JL,day:d,trk:PR.gps!==0,dist:0,steps:0,base:st["g"+d]||0});if(TM.trk)trkOn()}
function startIV(d){if(!JKM)return;axSheet("How today?",'<button class="ax-opt" id="ax-ivj"><b>Jog and walk</b><span>Follow the plan</span></button><button class="ax-opt" id="ax-ivw"><b>Walk only</b><span>Easy pace, no jogging</span></button>');
  $("ax-ivj").onclick=function(){axSheetX();startIV0(d)};
  $("ax-ivw").onclick=function(){axSheetX();startIV0(d);if(TM){TM.hold=1;TM.ph=1;TM.pstart=0;engPush()}}}
function wl(){try{if(!navigator.wakeLock||(wlk&&!wlk.released))return;navigator.wakeLock.request("screen").then(function(l){wlk=l}).catch(function(){})}catch(e){}}
var RK="aryaRun1",LK="aryaLast1",lps=0,PRUN=null,LAST=null;
function clrRun(){try{localStorage.removeItem(RK)}catch(e){}}
function persist(){if(!TM||TM.done||TM.mode=="cd"||!APP)return;try{var o={};["mode","label","day","trk","dist","steps","ph","hold","round","pstart","seq","hit","jt","wt","base","rt","sk","sdist","sst","nsens","eng","gavg"].forEach(function(q){o[q]=TM[q]});o.acc=Math.round(el_()*1000);localStorage.setItem(RK,JSON.stringify({pid:APP.active,t:Date.now(),s:o}))}catch(e){}}
var NAT=window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform(),LN=NAT&&Capacitor.Plugins.LocalNotifications,lnt=0,lnr=0;
function nfy(){if(!LN||!TM||TM.eng||TM.mode!="iv"||Date.now()-lnt<2000)return;lnt=Date.now();
  try{if(!lnr){lnr=1;LN.requestPermissions();LN.createChannel({id:"run",name:"Run progress",importance:2,vibration:false})}
  LN.schedule({notifications:[{id:7,channelId:"run",title:((TM.hold||TM.ph)?"Walking ":"Jogging ")+fmt(el_()),body:((TM.dist+(TM.base||0))/1000).toFixed(2)+" km"+(JKM?" of "+JKM+" km":"")+(TM.run?"":" | paused"),ongoing:true,autoCancel:false}]})}catch(e){}}
function nclr(){try{LN&&LN.cancel({notifications:[{id:7}]})}catch(e){}}
function hav(a,b){var R=6371000,r=Math.PI/180,dl=(b.la-a.la)*r,dn=(b.lo-a.lo)*r,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a.la*r)*Math.cos(b.la*r)*Math.sin(dn/2)*Math.sin(dn/2);return 2*R*Math.asin(Math.sqrt(x))}
var SG=9.8,SF=0,SL=0,SX=0;
function onMo(e){if(!TM||TM.mode!="iv")return;var a=e.accelerationIncludingGravity;if(!a||a.x==null)return;TM.mev=(TM.mev||0)+1;if(!TM.run||TM.nsens)return;
  var m=Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z);SG=SG*.98+m*.02;SF=SF*.7+(m-SG)*.3;var t=Date.now();
  if(SF>1.1&&SL<=1.1&&t-SX>280){TM.steps++;SX=t}SL=SF}
function onFix(p){if(!TM||TM.mode!="iv")return;var c=p.coords,acc=c.accuracy;TM.gacc=Math.round(acc);
  if(!TM.run){if(TM.aps){var q0={la:c.latitude,lo:c.longitude};if(TM.apl&&hav(TM.apl,q0)>8)apz(0);else if(!TM.apl)TM.apl=q0}if(TM.tr)TM.tr.restart();return}
  if(acc>30){TM.gmsg="Weak GPS (about "+Math.round(acc)+" m). Move to open sky.";return}
  var tr=TM.tr||(TM.tr=new AxRun.Track()),t=p.timestamp||Date.now(),g0=tr.gaps,
    pt=tr.add(c.latitude,c.longitude,acc,(c.speed!=null&&c.speed>=0)?c.speed:-1,t);
  if(tr.gaps>g0){TM.gap=1;TM.sk=TM.steps}
  if(pt){TM.dist=(TM.dbase||0)+tr.dist;TM.lm=Date.now();TM.gavg=tr.avgAcc();var ds=TM.steps-(TM.sk||0);if(tr.lastInc>0&&ds>=2){TM.sdist=(TM.sdist||0)+tr.lastInc;TM.sst=(TM.sst||0)+ds}TM.sk=TM.steps;
    (TM.rt=TM.rt||[]).push([+tr.outLa.toFixed(5),+tr.outLo.toFixed(5),t]);
    if(!TM.hit&&TM.dist+(TM.base||0)>=JKM*1000){TM.hit=1;beep(3,988);toast(JKM+" km reached. Tap Save run time.")}}
  TM.gmsg="GPS good (about "+Math.round(acc)+" m)"}
function onGerr(er){if(!TM)return;TM.gmsg=er.code==1?"Location permission denied. Allow it in site settings, or turn tracking off.":"GPS problem. Timer still works."}
function trkOn(keep){if(!keep){TM.dist=0;TM.steps=0;TM.hit=0;TM.sdist=0;TM.sst=0;TM.sk=0}TM.tr=new AxRun.Track();TM.dbase=keep?(TM.dist||0):0;TM.gmsg="Finding GPS...";SG=9.8;SF=0;SL=0;
  var BG=ENG?null:(window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.BackgroundGeolocation);
  if(ENG)engStart(keep);else if(BG)try{BG.addWatcher({backgroundTitle:"Arya Fit",backgroundMessage:"Run in progress",requestPermissions:true,stale:false,distanceFilter:2},function(l,e){if(e){onGerr({code:e.code=="NOT_AUTHORIZED"?1:2});return}if(!l)return;onFix({coords:{latitude:l.latitude,longitude:l.longitude,accuracy:l.accuracy},timestamp:l.time});step()}).then(function(id){TM?TM.nid=id:BG.removeWatcher({id:id})})}catch(e){}
  else try{if(navigator.geolocation)TM.wid=navigator.geolocation.watchPosition(onFix,onGerr,{enableHighAccuracy:true,maximumAge:0,timeout:30000});else TM.gmsg="GPS isn't available here."}catch(e){}
  try{var go=function(){window.addEventListener("devicemotion",onMo)};
    if(window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission=="function")DeviceMotionEvent.requestPermission().then(function(r){if(r=="granted")go()}).catch(function(){});
    else if(window.DeviceMotionEvent)go()}catch(e){}}
function trkOff(){try{if(ENG&&TM&&TM.eng){ENG.stop();TM.eng=0}}catch(e){}try{if(TM&&TM.nid!=null){Capacitor.Plugins.BackgroundGeolocation.removeWatcher({id:TM.nid});TM.nid=null}}catch(e){}try{if(TM&&TM.wid!=null)navigator.geolocation.clearWatch(TM.wid)}catch(e){}try{window.removeEventListener("devicemotion",onMo)}catch(e){}if(TM)TM.wid=null}
function paintG(e){if(!TM||!TM.trk)return;var km=TM.dist/1000;
  $("gd").textContent=((TM.dist+(TM.base||0))/1000).toFixed(2);$("gst").textContent=TM.steps.toLocaleString();
  $("gp").textContent=km>0.2?fmt(e/km):"--";$("gc").textContent=e>30&&TM.steps?Math.round(TM.steps/(e/60)):"--";
  $("gbar").style.width=Math.min(100,(TM.dist+(TM.base||0))/(JKM*10))+"%";
  var m=TM.gmsg||"";if(TM.gap)m+=" Signal dropped for a while, so distance may be a little low.";if(e>12&&!TM.mev&&!TM.nsens)m+=" No step sensor found.";
  $("gmsg").textContent=m}
function step(){
  if(!TM)return;var e=el_(),d=$("dock");
  if(TM.mode=="iv"){engSync();if(!TM.lm)TM.lm=Date.now();if(TM.run)TM.aps=0;if(PR.ap&&TM.trk&&TM.run&&e>20&&Date.now()-TM.lm>9000)apz(1);var kx=(TM.hold||TM.ph)?"w":"j";if(TM._k&&TM._k!=kx)phaseFx(kx);TM._k=kx;var k1=Math.floor((TM.dist+(TM.base||0))/1000);if(TM.kk==null){TM.kk=k1;TM.kmt=e;TM.kmv=((TM.dist+(TM.base||0))%1000)<50}if(k1>TM.kk){var kp=Math.round(e-TM.kmt),pc=(TM.kmv&&kp>60&&kp<1800)?". Last kilometer, "+Math.floor(kp/60)+" minutes "+(kp%60)+" seconds":"";TM.kk=k1;TM.kmt=e;TM.kmv=1;say(k1+" kilometer"+(k1>1?"s":"")+pc)}var dd=e-(TM.lt||0);TM.lt=e;if(dd>0){if(TM.hold||TM.ph)TM.wt=(TM.wt||0)+dd;else TM.jt=(TM.jt||0)+dd}}
  if(Date.now()-lps>2000){lps=Date.now();persist()}nfy();
  if(TM.mode=="cd"){var r=TM.total-e;
    if(r<=0){endT();TM.run=false;TM.done=true;d.dataset.ph="done";$("dt").textContent="Done";$("dlab").textContent=TM.label;$("dsub").textContent="Nice. Restart or close.";$("dpg").style.width="100%";$("dpp").textContent="Again";snd("stop");return}
    d.dataset.ph="cd";$("dt").textContent=fmt(Math.ceil(r));$("dlab").textContent=TM.label;$("dsub").textContent=TM.total+"s timer";$("dpg").style.width=(100-r/TM.total*100)+"%";
    if(TM.last3!=Math.ceil(r)&&r<=3.05&&r>0){TM.last3=Math.ceil(r);beep(1,660)}
  }else if(TM.mode=="iv"&&TM.hold){d.dataset.ph="walk";$("dt").textContent=fmt(e-TM.pstart);$("dlab").textContent="Walking at your pace";$("dsub").textContent="Round "+TM.round+" | total "+fmt(e);$("dpg").style.width="100%";paintG(e);$("dsw").textContent="Ready? Back to jog";$("dsw").dataset.m="walk";
  }else if(TM.mode=="iv"){var du=TM.seq[TM.ph],pe=e-TM.pstart;
    if(pe>=du){TM.pstart+=du;TM.ph^=1;if(TM.ph==0)TM.round++;beep(TM.ph?2:1,TM.ph?520:880);du=TM.seq[TM.ph];pe=e-TM.pstart}
    d.dataset.ph=TM.ph?"walk":"jog";$("dt").textContent=fmt(Math.ceil(du-pe));$("dlab").textContent=(TM.ph?"Walk":"Jog")+" now";$("dsub").textContent="Round "+TM.round+" | total "+fmt(e);$("dpg").style.width=(pe/du*100)+"%";paintG(e);$("dsw").textContent=TM.ph?"Keep walking":"Too tired? Switch to walk";$("dsw").dataset.m=TM.ph?"walk":"jog";
  }else{d.dataset.ph="cd";$("dt").textContent=fmt(e);$("dlab").textContent=TM.label;$("dsub").textContent="Running";$("dpg").style.width="0"}
  $("dpp").textContent=TM.run?"Pause":"Resume";
}
$("dpp").onclick=function(){unlock();if(!TM)return;
  if(TM.done){TM.done=false;TM.acc=0;TM.last=Date.now();TM.run=true;TM.last3=0;tk=setInterval(step,250);step();return}
  if(TM.run){TM.acc+=Date.now()-TM.last;TM.run=false}else{TM.last=Date.now();TM.run=true;if(TM.tr)TM.tr.restart()}hx(TM.run?"jog":"med");step()};
$("dsw").onclick=function(){unlock();if(!TM||TM.mode!="iv")return;var e=el_();
  if(TM.hold){TM.hold=0;TM.ph=0;TM.round++;TM.pstart=e;beep(1,880)}
  else if(TM.ph==0){TM.hold=1;TM.ph=1;TM.pstart=e;beep(2,520)}
  else{TM.hold=1;TM.pstart=e;beep(1,520)}
  step()};
$("drs").onclick=function(){if(!TM)return;TM.hold=0;TM.jt=0;TM.wt=0;TM.lt=0;TM.dist=0;TM.steps=0;TM.sdist=0;TM.sst=0;TM.sk=0;TM.tr=new AxRun.Track();TM.dbase=0;TM.rt=[];TM.kk=null;TM.hit=0;TM.acc=0;TM.last=Date.now();TM.pstart=0;TM.ph=0;TM.round=1;TM.last3=0;TM.done=false;TM.run=true;if(TM.eng)engStart(0);if(!tk)tk=setInterval(step,250);step()};
function autoSaveRun(){var dy=TM.day,iv=TM.mode=="iv",msg="";snd("stop");
  if(iv)msg=commit(snapS(),dy);else{st["w"+dy]=(st["w"+dy]||0)+Math.round(el_());save()}
  closeT();render();tvu();toast("Run saved ("+((st["g"+dy]||0)/1000).toFixed(2)+" km today)");if(iv)setTimeout(function(){try{AxRunSum.open(dy,1)}catch(e){}},500)}
$("dx").onclick=function(){if(TM&&TM.mode!="cd"&&!TM.done&&el_()>=30){autoSaveRun();return}if(TM&&!TM.done)snd("stop");closeT()};
function addRun(dy,o){var a=function(p,v){if(v>0)st[p+dy]=(st[p+dy]||0)+Math.round(v)};
  a("r",o.sec);a("g",o.dist);a("s",o.steps);a("jt",o.jt);a("wk",o.wt);
  var tot=st["g"+dy]||0,msg="";
  if(!o.trk||tot>=JKM*980)st[k(dy,"j")]=1;else msg="Saved. Total that day "+(tot/1000).toFixed(2)+" km, short of "+JKM+" km, so the run is not ticked.";
  save();return msg}
var svA=0;
function snapS(){var o={};["mode","label","day","trk","dist","steps","ph","hold","round","pstart","seq","hit","jt","wt","base","rt","sk","sdist","sst","nsens","eng","gavg"].forEach(function(q){o[q]=TM[q]});o.acc=Math.round(el_()*1000);return o}
function setLast(L){LAST=L;try{localStorage.setItem(LK,JSON.stringify(L))}catch(e){}}
function clrLast(){LAST=null;try{localStorage.removeItem(LK)}catch(e){}}
$("dsv").onclick=function(){if(!TM)return;var iv=TM.mode=="iv",tot=(TM.dist||0)+(TM.base||0);
  if(iv&&TM.trk&&JKM&&tot<JKM*980&&!svA){svA=1;var b0=$("dsv");b0.textContent="Only "+(tot/1000).toFixed(2)+" km. Tap again to save";setTimeout(function(){svA=0;if(TM)b0.textContent="Save run time"},3500);return}
  svA=0;snd("stop");var e=Math.round(el_()),dy=TM.day,msg="";
  if(iv){msg=commit(snapS(),dy)}
  else{st["w"+dy]=(st["w"+dy]||0)+e;save()}
  closeT();render();tvu();cel(dy,msg);if(msg)toast(msg);if(iv)setTimeout(function(){try{var c0=$("cel");if(c0)c0.remove();AxRunSum.open(dy,1)}catch(e){}},1100)};
var adT=0;
function commit(s,dy){var tp0=topup(s),d={sec:Math.round(s.acc/1000),dist:s.trk?s.dist:0,steps:s.trk?tp0:0,jt:s.jt,wt:s.wt,trk:s.trk},tk0=!!st[k(dy,"j")],
  pre={lvl:PR.lvl,lrd:PR.lrd,rl:axRoutes()[dy]?axRoutes()[dy].length:0,rs:(axRsum()[dy]||[]).length},msg=addRun(dy,d),L0=lvl(),lab=ivt(L0);
  saveRoute(dy,s.rt);adapt(d,dy);try{axSumAdd(dy,s,d,lab,lvl()-L0)}catch(e){}setLast({pid:APP.active,day:dy,t:Date.now(),s:s,d:d,ticked:tk0,pre:pre});return msg}
/* v92: keep a compact summary of this run (splits, pace profile, cadence, GPS quality) in the plan */
function axSumAdd(dy,s,d,lab,lu){if(!window.AxRun||!s.trk&&!d.sec)return;var est=(!s.nsens&&!s.eng&&s.trk)?Math.max(0,(d.dist||0)-(s.sdist||0)):0,
  o=AxRun.summarize({pts:s.rt,dist:d.dist,sec:d.sec,steps:d.steps,jt:d.jt,wt:d.wt,acc:s.gavg,est:est,lvl:lab,t:Date.now()});if(lu)o.lu=lu>0?1:-1;
  var R=axRsum();(R[dy]=R[dy]||[]).push(o);if(R[dy].length>10)R[dy].shift();save()}
function topup(s){if(!s.trk)return 0;var n=s.steps||0,dist=s.dist||0;
  if(s.nsens)return n;
  if(s.eng){var sk0=strideM();return Math.max(n,Math.round(dist/(sk0>0?sk0:.75)))}
  var sd=s.sdist||0,ss=s.sst||0,stride=ss>=30&&sd>0?Math.max(.5,Math.min(1.4,sd/ss)):.75,miss=dist-sd;return miss>30?Math.round(n+miss/stride):n}
function lastCard(){if(!LAST||!APP||TM||LAST.pid!=APP.active||Date.now()-LAST.t>43200000)return"";
  return '<div class="ax-card ax-undo"><h2 class="ax-h2">Run saved by mistake?</h2><p class="ax-sub">'+((LAST.d.dist||0)/1000).toFixed(2)+' km in '+fmt(LAST.d.sec)+' was saved.</p><div class="ax-chips"><button class="ax-btn" data-lu="1">Undo and continue</button><button class="ax-btn" data-ld="1">Dismiss</button></div></div>'}
function bindLast(el){var u=el.querySelector("[data-lu]"),d=el.querySelector("[data-ld]");if(u)u.onclick=undoSave;if(d)d.onclick=function(){clrLast();render();tvu()}}
function undoSave(){var L=LAST;if(!L||L.pid!=APP.active||TM)return;var d=L.d,dy=L.day;
  function sub(q,v){if(v>0){var x=(st[q+dy]||0)-Math.round(v);if(x>0)st[q+dy]=x;else delete st[q+dy]}}
  sub("r",d.sec);sub("g",d.dist);sub("s",d.steps);sub("jt",d.jt);sub("wk",d.wt);if(!L.ticked)delete st[k(dy,"j")];
  var pre=L.pre;if(pre){if(pre.lvl==null)delete PR.lvl;else PR.lvl=pre.lvl;if(pre.lrd==null)delete PR.lrd;else PR.lrd=pre.lrd;var routes= axRoutes();if(routes[dy]){routes[dy].length=Math.min(routes[dy].length,pre.rl);if(!routes[dy].length)delete routes[dy]}}var rsA=axRsum();if(rsA[dy]){rsA[dy].length=Math.min(rsA[dy].length,(pre&&pre.rs)||0);if(!rsA[dy].length)delete rsA[dy]}clearTimeout(adT);
  save();clrLast();unlock();begin(L.s,1);if(TM.trk)trkOn(1);render();tvu();toast("Save undone. Tap Resume to continue.")}
function runBtn(){var d=Dn(),g=st["g"+d]||0,c=JKM&&g>0&&g<JKM*980,t=$("tvrun");
  if(t)t.textContent=c?"Continue run ("+(g/1000).toFixed(2)+" of "+JKM+" km logged)":"Start run - "+ivt(lvl())}
function runPrompt(){var el=$("ax-hnote");el.innerHTML="";if(!PRUN||!APP||TM||PRUN.pid!=APP.active||Date.now()-PRUN.t>172800000)return;
  var o=PRUN.s;PRUN=null;clrRun();
  function fin(){if((o.acc||0)<60000)return;if(o.mode=="iv")commit(o,o.day);else{st["w"+o.day]=(st["w"+o.day]||0)+Math.round(o.acc/1000);save()}setTimeout(function(){render();toast("Your unfinished run was saved automatically")},300)}
  if(ENG&&o.mode=="iv")ENG.state().then(function(r){if(r&&r.active){o.dist=r.dist;o.acc=r.acc;o.jt=r.jt;o.wt=r.wt;o.gavg=r.gavg;if(r.sens){o.steps=r.steps;o.nsens=1}return ENG.route({from:0}).then(function(q){try{o.rt=JSON.parse(q.pts)}catch(e){}return ENG.stop()}).then(fin)}fin()}).catch(fin);else fin()}

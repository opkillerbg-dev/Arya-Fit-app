function axSheet(t,h){axGuard();$("ax-sht").textContent=t;$("ax-shb").innerHTML=h;var bg=$("ax-shbg"),sh=$("ax-sh");bg.hidden=false;sh.hidden=false;sh.scrollTop=0;document.body.classList.add("ax-sheet-open");}
function axSheetX(){try{window.axSheetGhost&&axSheetGhost()}catch(e){}var bg=$("ax-shbg"),sh=$("ax-sh");bg.hidden=true;sh.hidden=true;$("ax-shb").innerHTML="";document.body.classList.remove("ax-sheet-open")}
/* Animate only stable summary numbers once; never rewrite live run timers or GPS metrics. */
function axCountUpVisible(){if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;document.querySelectorAll(".ax-nums b,.ax-stat b,[data-count-animate]").forEach(function(el){if(el.dataset.axCounted||!el.getClientRects().length)return;var raw=(el.textContent||"").trim(),m=raw.match(/^([+-]?\d+(?:,\d{3})*(?:\.\d+)?)(.*)$/);if(!m)return;var target=Number(m[1].replace(/,/g,""));if(!Number.isFinite(target)||Math.abs(target)>1e7)return;el.dataset.axCounted="1";var suffix=m[2],start=0,begin=performance.now(),duration=460;function tick(now){var p=Math.min(1,(now-begin)/duration),ease=1-Math.pow(1-p,3),v=start+(target-start)*ease,dec=m[1].includes(".")?(m[1].split(".")[1]||"").length:0;el.textContent=v.toLocaleString(undefined,{minimumFractionDigits:dec,maximumFractionDigits:dec})+suffix;if(p<1)requestAnimationFrame(tick);else el.textContent=raw}requestAnimationFrame(tick)})}
if("requestAnimationFrame" in window){var axCountQueued=0;function axQueueCountUp(){if(axCountQueued)return;axCountQueued=1;requestAnimationFrame(function(){axCountQueued=0;axCountUpVisible()})}document.addEventListener("DOMContentLoaded",axQueueCountUp);var axCountObserver=new MutationObserver(axQueueCountUp);axCountObserver.observe(document.body,{childList:true,subtree:true});}
function axPut(i,v,m){st["x"+i]=v;save();axSheetX();render();toast(m);hx("ok")}
function axClose(){
  var i=cur,td=todayIdx(),x=st["x"+i]||0;if(td<0||i>td)return;
  if(x){delete st["x"+i];save();render();toast("Day reopened");return}
  var R=calcM(),lg=Math.max(R.quads.f,R.hams.f,R.calves.f),sr=Object.keys(R).some(function(m){return R[m].s});
  axSheet(i==td?"Close today":"Close "+dl(i),((sr||lg>.7)&&i==td?'<p class="ax-cap ax-tip">Legs still loaded. Rest or an easy walk is fine.</p>':'')+'<button class="ax-opt" id="ax-c1"><b>Rest day</b><span>Keeps your streak</span></button><button class="ax-opt" id="ax-c2"><b>Call it a day</b><span>Counts as done</span></button><button class="ax-opt" id="ax-c3"><b>Rest day, legs are sore</b><span>Eases next run one level</span></button>');
  $("ax-c1").onclick=function(){axPut(i,1,"Rest day saved. Streak kept.")};
  $("ax-c2").onclick=function(){axPut(i,2,"Day closed with what you did.")};
  $("ax-c3").onclick=function(){PR.sore=PR.sore||{};["quads","hams","calves","glutes"].forEach(function(m){PR.sore[m]=Date.now()});PR.lvl=Math.max(0,lvl()-1);PR.lrd=i;axPut(i,1,"Rest day saved. Legs marked sore, next run eased one level.")}
}
function axMore(){
  var i=cur,td=todayIdx(),ok=td>=0&&i<=td&&!st["x"+i];
  axSheet("More",(ok?'<button class="ax-opt" id="ax-m1"><b>Mark rest day</b><span>Keeps your streak</span></button>':'')+'<button class="ax-opt" id="ax-m2"><b>Add exercise</b><span>Adds to every matching weekday</span></button>');
  if(ok)$("ax-m1").onclick=function(){axPut(i,1,"Rest day saved. Streak kept.")};
  $("ax-m2").onclick=axAdd
}
function axAdd(){
  axSheet("Add exercise",'<select class="ax-field" id="ax-ced" aria-label="Day type"></select><div id="ax-cel"></div><input class="ax-field" id="ax-cen" placeholder="Exercise name"><div class="ax-two"><input class="ax-field" id="ax-ces" type="number" inputmode="numeric" placeholder="Sets"><input class="ax-field" id="ax-cer" placeholder="Reps, e.g. 10"></div><button class="ax-btn ax-pri" id="ax-ceg">Add exercise</button>');
  var sl=$("ax-ced");ceUI();var kk=KEYS[wdk(cur)];if(sl.querySelector('option[value="'+kk+'"]'))sl.value=kk;ceUI();
  sl.onchange=ceUI;
  $("ax-cel").onclick=function(e){var b=e.target.closest("button");if(!b)return;P.days[sl.value].exercises.splice(+b.dataset.x,1);setPlan(P);save();render();ceUI()};
  $("ax-ceg").onclick=function(){var d=P.days[sl.value],n=$("ax-cen").value.trim().slice(0,40);if(!d||!n){toast("Enter an exercise name.");return}
    d.exercises.push({name:n,sets:Math.max(1,Math.min(8,Math.round(+$("ax-ces").value)||3)),reps:$("ax-cer").value.trim().slice(0,20)||"10",note:""});setPlan(P);save();render();["ax-cen","ax-ces","ax-cer"].forEach(function(q){$(q).value=""});ceUI();toast("Exercise added")}
}
function applyGoal(){var g=PR&&PR.goal,b=(P&&P.jog)?P.jog.km:0;JKM=g>0&&b>0?g:b;if($("gkm"))$("gkm").textContent="km of "+JKM;if(typeof tvu=="function")tvu()}
var _sp=setPlan;setPlan=function(p){_sp(p);applyGoal()};
/* v48 haptics: native Capacitor Haptics when present, else navigator.vibrate */
var HXP=(window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.Haptics)||null,HXL=0,HXR=0;
var HXV={tap:10,tick:6,soft:14,med:24,heavy:46,ok:[14,45,26],warn:[32,60,32],err:[42,50,42,50,70],jog:[52,70,26],walk:[16,70,16],start:[70,80,36],finish:[34,60,34,60,100]};
var HXK={tap:1,tick:1,soft:1,med:2,heavy:3,ok:2,warn:3,err:3,jog:3,walk:2,start:3,finish:4};
function hx(k){try{
  if(!PR||PR.hap===0)return;var r=HXK[k];if(!r)return;var n=Date.now();
  if(r<=1&&n-HXL<70)return;if(r<HXR&&n-HXL<90)return;HXL=n;HXR=r;
  if(HXP){
    var I=function(st2,ms){setTimeout(function(){try{HXP.impact({style:st2})}catch(e){}},ms||0)};
    var N=function(t,ms){setTimeout(function(){try{HXP.notification({type:t})}catch(e){}},ms||0)};
    switch(k){
      case "tap":case "soft":I("LIGHT");break;
      case "tick":try{HXP.vibrate({duration:10})}catch(e){}break;
      case "med":I("MEDIUM");break;
      case "heavy":I("HEAVY");break;
      case "ok":N("SUCCESS");break;
      case "warn":N("WARNING");break;
      case "err":N("ERROR");break;
      case "jog":I("HEAVY");I("MEDIUM",95);break;
      case "walk":I("LIGHT");I("LIGHT",95);break;
      case "start":I("HEAVY");N("SUCCESS",130);break;
      case "finish":N("SUCCESS");I("HEAVY",260);break}
  }else if(navigator.vibrate)navigator.vibrate(HXV[k])
}catch(e){}}
function hap(p){if(typeof p=="string")return hx(p);if(Array.isArray(p))return hx(p.reduce(function(a,b){return a+b},0)>=300?"finish":"ok");hx(p<=10?"tick":p<=30?"soft":p<=100?"med":"heavy")}
document.addEventListener("change",function(e){var t=e.target;if(t&&t.classList&&t.classList.contains("sw2"))hx("tick")});
(function(){var b=document.getElementById("htest");if(b)b.onclick=function(){if(PR.hap===0){toast("Haptics are off");return}
  ["tap","tick","med","ok","jog","walk","finish"].forEach(function(k,i){setTimeout(function(){HXL=0;HXR=0;hx(k)},i*420)})}})();
/* v48 no zoom (pinch, double tap, ctrl+wheel/keys) */
["gesturestart","gesturechange","gestureend"].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});
document.addEventListener("touchmove",function(e){if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});
document.addEventListener("wheel",function(e){if(e.ctrlKey)e.preventDefault()},{passive:false});
document.addEventListener("keydown",function(e){if((e.ctrlKey||e.metaKey)&&(e.key=="+"||e.key=="-"||e.key=="="||e.key=="0"))e.preventDefault()});
function rip(e,t){if(RM||!t.matches(".btn,.tile,.qr button,.ax-db button,.ax-dsw,.ax-nav button"))return;var r=t.getBoundingClientRect(),d=Math.max(r.width,r.height)*1.6,i=document.createElement("i");i.className="rp";i.style.cssText="width:"+d+"px;height:"+d+"px;left:"+(e.clientX-r.left-d/2)+"px;top:"+(e.clientY-r.top-d/2)+"px";t.appendChild(i);setTimeout(function(){i.remove()},600)}
function cup(root){if(RM)return;root.querySelectorAll(".tile b").forEach(function(b){var m=/^([\d,]+(?:\.\d+)?)(%?)$/.exec(b.textContent);if(!m)return;var to=parseFloat(m[1].replace(/,/g,"")),dec=(m[1].split(".")[1]||"").length,t0=performance.now();(function f(n){var q=Math.min(1,(n-t0)/700),v=to*(1-Math.pow(1-q,3));b.textContent=(dec?v.toFixed(dec):Math.round(v).toLocaleString())+m[2];if(q<1)requestAnimationFrame(f)})(t0)})}
function bindExtra(){
  $("spm").value=PR.spm||160;$("spm").onchange=function(){PR.spm=Math.max(100,Math.min(220,+this.value||160));save()};
  $("t-amo").addEventListener("change",function(){setTimeout(theme,0)});$("t-gls").addEventListener("change",function(){setTimeout(theme,0)});
  $("accs").innerHTML=[["#2f5bff","Blue"],["#12b27a","Green"],["#ff7a45","Orange"],["#e0457b","Pink"],["#8a5cff","Purple"]].map(function(c){return'<button class="acc" data-c="'+c[0]+'" aria-label="'+c[1]+' accent" style="background:'+c[0]+'"></button>'}).join("");
  $("accs").onclick=function(e){var c=e.target.dataset&&e.target.dataset.c;if(c){PR.acc=c;save();theme()}};
  var SK=[["oldmoney","Old Money","#f2ecdd","#244936"],["classic","Classic","#131c36","#ff7a45"],["modern","Modern","#ffffff","#c8294f"],["professional","Professional","#ffffff","#1f5fbf"],["midnight","Midnight","#0a0b0e","#3fcfae"],["sunset","Sunset","#2a1820","#ff7a45"]];
  $("skins").innerHTML=SK.map(function(k){return'<button class="sk" data-k="'+k[0]+'"><i style="background:linear-gradient(135deg,'+k[2]+' 50%,'+k[3]+' 50%)"></i>'+k[1]+'</button>'}).join("");
  $("skins").onclick=function(e){var b=e.target.closest(".sk");if(!b)return;PR.skin=b.dataset.k;PR.acc=null;save();theme()};
  theme();metro();
  $("vtest").onclick=function(){unlock();if(ENG&&ENG.speak){ENG.speak({text:"Jog now. Voice test."}).then(function(){toast("Playing voice test")}).catch(function(){toast("No text-to-speech engine found. Install Google Speech Services.")});return}if(!window.speechSynthesis){toast("Voice is not supported on this phone.");return}say("Jog now. Voice test.",1);toast("Playing voice test")};
  $("gw").onclick=function(){unlock();gsess(GW)};$("gcd").onclick=function(){unlock();gsess(GC)};$("ax-rcd").onclick=axCd;$("ax-rrp").onclick=axReps;$("ax-rmr").onclick=axMr;
  applyGoal();
  var gi=$("goal-km");gi.value=PR.goal||"";gi.placeholder=P&&P.jog?String(P.jog.km):"";
  gi.onchange=function(){var v=parseFloat(this.value);if(v>=.5&&v<=42)PR.goal=Math.round(v*10)/10;else delete PR.goal;save();applyGoal();
    var n=0;for(var i=0;i<ND;i++){var g=st["g"+i]||0;if(JKM&&g>=JKM*980&&!st[k(i,"j")]){st[k(i,"j")]=1;n++}}
    if(n)save();render();toast(PR.goal?"Run goal set to "+PR.goal+" km"+(n?". "+n+" earlier run"+(n>1?"s":"")+" now count.":"."):"Run goal reset to the plan")};
  $("dpp").addEventListener("click",function(){engPush()});
  $("dsw").addEventListener("click",function(){engPush()});
  $("drs").addEventListener("click",function(){if(TM&&TM.eng)setTimeout(function(){engStart(0)},0)});
  document.addEventListener("visibilitychange",function(){if(!ENG||!TM||!TM.eng)return;if(document.hidden)engPush({fg:false});else{TM.erev=-1;ENG.setState({fg:true})}});
  $("ax-wprev").onclick=function(){if(cur>=7){cur-=7;render()}};
  $("ax-wnext").onclick=function(){var n=cur+7;if(n>ND-1)n=ND-1;if(Math.floor(n/7)>Math.floor(cur/7)){cur=n;render()}};
  $("ax-pclose").onclick=axClose;$("ax-pmore").onclick=axMore;$("ax-shbg").onclick=axSheetX;$("ax-shx").onclick=axSheetX;
  var npa=0;$("np-go").onclick=function(){var b=this;if(!npa){npa=1;b.textContent="Tap again to create the next plan";setTimeout(function(){npa=0;b.textContent="Generate next plan"},3500);return}npa=0;b.textContent="Generate next plan";nextPlan()};
  $("dfs").onclick=function(){$("dock").classList.remove("ax-fs","ax-mo")};
  $("ax-dmore").onclick=function(){$("dock").classList.add("ax-mo")};$("ax-dmx").onclick=function(){$("dock").classList.remove("ax-mo")};$("drs").addEventListener("click",function(){$("dock").classList.remove("ax-mo")});
  $("rm-t").value=PR.rmt||"";$("rm-t").onchange=function(){PR.rmt=this.value;save();remind()};
  $("dock").addEventListener("click",function(e){if(!this.classList.contains("ax-fs")&&e.target.closest(".ax-dm")&&TM&&TM.mode!="cd")this.classList.add("ax-fs")});
  setInterval(function(){if(document.hidden)return;var d=$("dock");if(!d.hidden&&d.classList.contains("ax-fs"))d.style.setProperty("--p",$("dpg").style.width||"0%")},400);
  document.addEventListener("pointerdown",function(e){var t=e.target.closest&&e.target.closest("button,.tile,path[data-m],.lg[data-m]");if(!t)return;if(!t.disabled)hx(t.closest("#ax-nav")||t.matches("path[data-m],.lg[data-m]")?"tick":"tap");rip(e,t)},{passive:true});
  document.addEventListener("visibilitychange",function(){if(document.hidden)persist();else if(TM)wl()});window.addEventListener("pagehide",persist);
}

var VIEWS=["home","plan","timers","prog","set","plans"];
function Dn(){return Math.max(0,Math.min(ND-1,todayIdx()))}
function go(v){if(v!="home")axGuard();VIEWS.forEach(function(x){$("ax-v-"+x).hidden=x!=v});
  document.querySelectorAll("#ax-nav button").forEach(function(b){b.classList.toggle("on",b.dataset.v==(v=="plans"?"set":v=="body"?"prog":v))});
  var e=$("ax-v-"+v);e.classList.remove("ax-in");void e.offsetWidth;e.classList.add("ax-in");[].forEach.call(e.children,function(c,i){c.style.animationDelay=i*30+"ms"});window.scrollTo(0,0);
  if(v=="home")home();if(v=="prog")prog();if(v=="timers")tvu();if(v=="set")axSl()}

function smartBrainPick(i,check){
  var si=axSrc(i),t=si<0?{r:true}:T[wdk(si)],sleep=check.s,energy=check.e,sore=check.o,why="",mode="Full",label="Full session";
  var muscleSore=false;try{var mr=calcM();muscleSore=Object.keys(mr).some(function(m){return !!mr[m].s})}catch(e){}
  if(muscleSore&&sore===0)sore=1;
  if(t.r){mode="Rest";label="Rest / optional easy walk";why="Your plan already has a recovery day today."}
  else if(sleep===0&&(energy===0||sore===2)){mode="Rest";label="Rest today";why="Poor sleep plus low energy or high soreness is a good reason to recover."}
  else if(sore===2){mode="Walk-only";label="Walk-only";why="High soreness: skip hard training and choose a comfortable walk, or rest if needed."}
  else if(sleep===0&&energy===0){mode="Rest";label="Rest today";why="Poor sleep and low energy: recovery is the priority today."}
  else if(sleep===0||energy===0||sore===1||t.m||isL(Math.floor(i/7))){mode="Light";label="Light session";why=sleep===0?"Poor sleep: keep effort easy and skip intensity.":energy===0?"Low energy: reduce effort and stop if you feel worse.":sore===1?"Some soreness: move gently and avoid pushing sore areas.":t.m?"Your plan calls for mobility, so keep today gentle.":"This is a planned lighter week; keep the effort comfortable."}
  else {mode="Full";label="Planned session";why="Your check-in looks steady. Follow the planned session at a comfortable effort."}
  return {mode:mode,label:label,why:why};
}
var BR_EDIT=0;
function smartBrainUI(){
  var el=$("ax-hbrain");if(!el)return;
  var td=todayIdx(),today=ymd(),all=PR.brain=PR.brain||{},c=all[today]||{},done=c.s!=null&&c.e!=null&&c.o!=null;
  var names={s:["Poor","Okay","Good"],e:["Low","Okay","High"],o:["None","Some","High"]};
  var rows=[ ["s","Sleep"],["e","Energy"],["o","Soreness"] ];
  var h='<div class="ax-card ax-br-card"><div class="ax-br-head"><div><p class="ax-cap">SMART TODAY</p><h2>How are you feeling?</h2></div><span class="ax-tag">On-device</span></div><p class="ax-cap" style="margin:0">Three quick taps help tailor today. Your answers stay on this phone.</p>';
  if(!done||BR_EDIT)rows.forEach(function(r){h+='<div class="ax-br-row"><span class="ax-br-label">'+r[1]+'</span><div class="ax-br-options">'+names[r[0]].map(function(n,i){return '<button class="ax-br-opt'+(c[r[0]]===i?' on':'')+'" data-br-k="'+r[0]+'" data-br-v="'+i+'" aria-pressed="'+(c[r[0]]===i)+'">'+n+'</button>'}).join('')+'</div></div>'});
  if(done){if(!BR_EDIT){var soreLabel=names.o[c.o];try{var ms=calcM();if(c.o===0&&Object.keys(ms).some(function(m){return !!ms[m].s}))soreLabel="Some (muscle log)"}catch(e){}h+='<p class="ax-cap" style="margin:0">Sleep: '+names.s[c.s]+' · Energy: '+names.e[c.e]+' · Soreness: '+soreLabel+'</p>'}var pick=td>ND-1?{label:"Keep it flexible",why:"Your plan is complete. Choose a comfortable activity based on your sleep, energy and soreness.",mode:"Light"}:smartBrainPick(Math.max(0,Math.min(ND-1,td)),c);h+='<div class="ax-br-result"><span class="ax-cap">TODAY’S RECOMMENDATION</span><b>'+pick.label+'</b><p>'+pick.why+'</p></div>';var brainSrc=axSrc(Math.max(0,Math.min(ND-1,td)));if((pick.mode==="Rest"||pick.mode==="Walk-only")&&td>=0&&td<ND&&brainSrc>=0&&!T[wdk(brainSrc)].r)h+='<button class="ax-btn ax-pri" id="ax-br-preview">Preview recovery reschedule</button><p class="ax-cap">Nothing changes until you review and apply the new schedule.</p>';h+='<button class="ax-br-opt" id="ax-br-edit">'+(BR_EDIT?'Done':'Change answers')+'</button><p class="ax-br-foot">'+((window.axRdActive&&axRdActive())?"Today's plan was adjusted by your readiness. Finish it and the day counts as complete.":"Suggestion only — your plan is unchanged. You choose what feels right.")+'</p>'}
  else h+='<p class="ax-br-foot">Complete all three to get a recommendation. You can change answers anytime.</p>';
  h+='</div>';el.innerHTML=h;
  el.querySelectorAll('[data-br-k]').forEach(function(b){b.onclick=function(){var a=PR.brain=PR.brain||{},d=a[today]||{};d[b.dataset.brK]=+b.dataset.brV;a[today]=d;var ks=Object.keys(a).sort();while(ks.length>400)delete a[ks.shift()];save();smartBrainUI()}});
  var prev=$("ax-br-preview");if(prev)prev.onclick=function(){var ix=todayIdx();if(ix<0||ix>=ND){toast("No workout to reschedule today.");return}axShiftPreview(ix)};
  var edit=$("ax-br-edit");if(edit)edit.onclick=function(){BR_EDIT=BR_EDIT?0:1;smartBrainUI()};
}

function home(){runPrompt();runBtn();stepsPaint();smartBrainUI();
  var td0=todayIdx(),ms=[];for(var q=Math.min(td0,ND)-1;q>=0&&ms.length<4;q--)if(!dayDone(q)&&!st["x"+q])ms.push(q);
  var mz=$("ax-hmiss");mz.innerHTML=ms.length?'<div class="ax-card"><p class="ax-cap">Catch up</p><div class="ax-chips">'+ms.map(function(q){return '<button class="ax-chip" data-m="'+q+'">'+DN[dt(q).getDay()]+' '+dl(q)+'</button>'}).join("")+'</div></div>':"";
  mz.querySelectorAll("button").forEach(function(b){b.onclick=function(){cur=+b.dataset.m;go("plan");render()}});
  var td=todayIdx(),i=Dn(),t=T[wdk(i)],c=cnt(i),p=Math.round(c[0]/c[1]*100);
  var tag=td<0?"Starts "+DF[START.getDay()]+" "+dl(0)+(td==-1?" (tomorrow)":" (in "+(-td)+" days)"):td>ND-1?"Plan complete":"Today";
  var lab=td<0?"Preview day 1":td>ND-1?"View last day":t.r?"View today's recovery plan":p==100?"View today":"Start today's plan";
  var h='<div class="ax-home-session-top"><span class="ax-kicker">TODAY, AT YOUR PACE</span><span class="ax-home-date">'+esc(tag)+'</span></div><div class="ax-dayrow"><div class="ax-dbadge"><small>'+DN[dt(i).getDay()]+'</small><b>'+dt(i).getDate()+'</b></div><div class="ax-home-session-title"><h2 class="ax-h2">'+ic(T[wdk(i)].ic,"ax-ic")+t.n+'</h2><p class="ax-sub">'+esc(t.s||'A little progress, on your terms.')+'</p></div></div>';
  h+='<div class="ax-home-progress"><div class="ax-home-progress-label"><span>YOUR PROGRESS</span><b>'+p+'%</b></div><div class="ax-bar"><i style="width:'+p+'%"></i></div><p class="ax-cap">'+c[0]+' of '+c[1]+' activities complete</p>'+(st["x"+i]==1?'<p class="ax-cap ax-okt">Rest is part of the plan.</p>':st["x"+i]==2?'<p class="ax-cap ax-okt">Day closed. Nice work.</p>':'')+'</div>';
  h+='<button class="ax-btn ax-pri" id="ax-hopen">'+lab+'</button>';
  $("ax-htoday").innerHTML=h;
  $("ax-hopen").onclick=function(){cur=i;go("plan");render()};
}
function prog(){
  var jts=0,wks=0,km=0,stp=0,work=0,best=0,done=0,chk=0,tot=0;
  for(var i=0;i<ND;i++){var c=cnt(i);chk+=c[0];tot+=c[1];if(c[0]==c[1])done++;
    var g=st["g"+i]||0,r=st["r"+i]||0,sp=st["s"+i]||0;km+=g;stp+=sp;jts+=st["jt"+i]||0;wks+=st["wk"+i]||0;work+=st["w"+i]||0;
    if(r&&(!g||g>=JKM*980)&&(!best||r<best))best=r}
  var T6=[[done+"/"+ND,"Days done"],[Math.round(chk/tot*100)+"%","Tasks done"],[(km/1000).toFixed(1),"Total km"],[stp.toLocaleString(),"Steps counted"],[best?fmt(best):"--","Best run time"],[work?fmt(work):"--","Workout time"],[jts?fmt(jts):"--","Total jog time"],[jts+wks?Math.round(jts/(jts+wks)*100)+"%":"--","Jog share of runs"]];
  var h='<div class="tiles two" style="margin-top:0">'+T6.map(function(x){return '<div class="tile"><b class="disp">'+x[0]+'</b><span>'+x[1]+'</span></div>'}).join("")+'</div>';
  h+='<div class="panel" style="margin-top:12px"><h3 style="margin-top:0">By week</h3>';
  for(var w=0;w<NW;w++){var a=0,b=0;for(var d=0;d<7;d++){var cc=cnt(w*7+d);a+=cc[0];b+=cc[1]}var pp=Math.round(a/b*100);
    h+='<div class="pbar"><span style="width:58px;color:var(--ink)">Week '+(w+1)+'</span><i><u style="width:'+pp+'%"></u></i><span>'+pp+'%</span></div>'}
  h+='</div>';
  axClr();$("pgv").innerHTML=h+pextra();cup($("pgv"));bindProg();axPg()}
function tvu(){runBtn();var r2=$("rprompt2");if(r2){r2.innerHTML=lastCard();bindLast(r2)}$("tvtxt").textContent=JKM?"This week: "+ivt(Math.floor(Dn()/7))+(IVS[Math.min(Math.floor(Dn()/7),IVS.length-1)][1]?", repeat until you reach ":", aim for ")+JKM+" km.":""}
function axCd(){
  axSheet("Countdown",'<div class="ax-chips"><button class="ax-chip" data-tq="30">30s</button><button class="ax-chip" data-tq="45">45s</button><button class="ax-chip" data-tq="60">60s</button><button class="ax-chip" data-tq="90">90s</button><button class="ax-chip" id="ax-rest60">Rest 60s</button></div><input class="ax-field" id="ax-tvn" type="number" inputmode="numeric" min="5" max="3600" placeholder="Custom seconds"><button class="ax-btn ax-pri" id="ax-tvg">Start</button>');
  document.querySelectorAll("#ax-shb [data-tq]").forEach(function(b){b.onclick=function(){axSheetX();unlock();startCD(+b.dataset.tq,"Countdown")}});
  $("ax-rest60").onclick=function(){axSheetX();unlock();startCD(60,"Rest")};
  $("ax-tvg").onclick=function(){var v=Math.round(+$("ax-tvn").value);if(!(v>=5&&v<=3600)){toast("Enter 5 to 3600 seconds.");return}axSheetX();unlock();startCD(v,"Countdown")}
}
function axReps(){
  axSheet("Log reps",'<select class="ax-field" id="ax-rpn" aria-label="Exercise"></select><input class="ax-field" id="ax-rpv" type="number" inputmode="numeric" placeholder="Reps"><button class="ax-btn ax-pri" id="ax-rpg">Save reps</button><div class="ax-cap" id="ax-rpl"></div>');
  repsUI();
  $("ax-rpg").onclick=function(){var n=$("ax-rpn").value,v=+$("ax-rpv").value;if(!n||!(v>0)){toast("Pick an exercise and enter reps.");return}PR.reps=PR.reps||{};(PR.reps[n]=PR.reps[n]||[]).push([Dn(),v]);save();$("ax-rpv").value="";repsUI();toast("Saved")}
}
function axMr(){
  var oh="",n0=Math.min(ND-1,Dn());for(var q=0;q<=n0;q++)oh+='<option value="'+q+'">'+DN[dt(q).getDay()]+" "+dl(q)+"</option>";
  axSheet("Log a run",'<select class="ax-field" id="ax-mrd" aria-label="Day">'+oh+'</select><div class="ax-two"><input class="ax-field" id="ax-mrk" type="number" step="0.01" inputmode="decimal" placeholder="km"><input class="ax-field" id="ax-mrt" placeholder="Time 21:02"></div><div class="ax-two"><input class="ax-field" id="ax-mrj" placeholder="Jog (opt.)"><input class="ax-field" id="ax-mrw" placeholder="Walk (opt.)"></div><input class="ax-field" id="ax-mrs" type="number" inputmode="numeric" placeholder="Steps (optional)"><button class="ax-btn ax-pri" id="ax-mrg">Add run</button>');
  $("ax-mrd").value=n0;
  $("ax-mrg").onclick=function(){var km=parseFloat($("ax-mrk").value),sec=ptime($("ax-mrt").value),j=ptime($("ax-mrj").value),w=ptime($("ax-mrw").value),stp=Math.round(+$("ax-mrs").value)||0;
    if(!(km>0&&km<100)||!(sec>0)||isNaN(j)||isNaN(w)){toast("Enter km and a time like 21:02.");return}
    var msg=addRun(+$("ax-mrd").value,{sec:sec,dist:km*1000,steps:stp,jt:j,wt:w,trk:true});axSheetX();render();toast(msg||"Run added")}
}
function bindApp(){
  document.querySelectorAll("#ax-nav button").forEach(function(b){b.onclick=function(){go(b.dataset.v)}});
    $("tvrun").onclick=function(){unlock();startIV(Dn())};$("ax-rsw").onclick=function(){unlock();startSW(Dn())};
  var M={"t-snd":["snd",1],"t-gps":["gps",1],"t-auto":["auto",0],"t-hap":["hap",1],"t-exi":["exi",1],"t-voi":["voi",1],"t-apz":["ap",0],"t-met":["met",0],"t-amo":["amo",0],"t-gls":["gls",0]};
  Object.keys(M).forEach(function(id){var e=$(id),k=M[id][0];e.checked=M[id][1]?PR[k]!==0:!!PR[k];e.onchange=function(){PR[k]=this.checked?1:0;save();if(k=="exi")render()}});
}


var ICONS=["dumbbell","run","flame","stretch","moon","sun","wind","drop","egg","timer"],IH={};
function defaultPlan(){var K=["mon","tue","wed","thu","fri","sat","sun"],days={};
  T0.forEach(function(t,i){var ty=t.r?"rest":t.m?"mobility":t.c?"circuit":"strength";
    var d={title:t.n,short:t.a,focus:t.s,icon:["dumbbell","run","flame","dumbbell","flame","stretch","moon"][i],type:ty,jogNote:t.j,exercises:t.x.map(function(e){var o={name:e[0],reps:e[2],note:e[3]};if(ty=="strength")o.sets=e[1];return o})};
    if(t.c)d.rounds=t.c;days[K[i]]=d});
  return {format:"arya-plan",version:1,name:"Home Plan",athlete:"Arya Sheladiya",start:"2026-10-04",weeks:4,lightWeeks:[4],lightSets:2,
    jog:{label:"5 km run and walk",km:5,weeks:[[60,120],[120,60],[240,60],[360,60]]},
    habits:[{name:"Water",badge:"3-4 L",note:"More on hot days and jog days.",icon:"drop"},{name:"Protein",badge:"90-115 g",note:"Eggs, paneer, dal, curd, soya chunks, chana, sprouts.",icon:"egg"},{name:"Sleep",badge:"8-9 h",note:"Muscle is built during recovery.",icon:"moon"}],days:days}}
function vplan(o){var E=[],pl={};
  function S(v,max,def){return typeof v=="string"&&v.trim()&&v.trim().length<=max?v.trim():def}
  if(!o||typeof o!="object"||o.format!="arya-plan")return {E:['Missing "format": "arya-plan" at the top.'],plan:null};
  pl.format="arya-plan";pl.version=1;
  pl.name=S(o.name,60);if(!pl.name)E.push("name is required (max 60 characters)");
  pl.athlete=S(o.athlete,40,"");
  var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(o.start||""),ok=m&&new Date(+m[1],+m[2]-1,+m[3]).getDate()==+m[3];
  if(!ok)E.push("start must be a real date like 2026-10-04");else pl.start=o.start;
  if(!(Number.isInteger(o.weeks)&&o.weeks>=1&&o.weeks<=12))E.push("weeks must be a whole number from 1 to 12");else pl.weeks=o.weeks;
  pl.lightWeeks=Array.isArray(o.lightWeeks)?o.lightWeeks.filter(function(w){return Number.isInteger(w)&&w>=1&&w<=(pl.weeks||12)}):[];
  pl.lightSets=Number.isInteger(o.lightSets)&&o.lightSets>=1&&o.lightSets<=5?o.lightSets:2;
  if(o.jog){var j=o.jog;
    if(!(typeof j.km=="number"&&j.km>=0.5&&j.km<=42))E.push("jog.km must be between 0.5 and 42");
    if(!Array.isArray(j.weeks)||!j.weeks.length||j.weeks.length>12||!j.weeks.every(function(q){return Array.isArray(q)&&q.length==2&&Number.isInteger(q[0])&&q[0]>=10&&q[0]<=7200&&Number.isInteger(q[1])&&q[1]>=0&&q[1]<=3600}))E.push("jog.weeks must be a list of [jogSeconds, walkSeconds] pairs (walk 0 means continuous)");
    else if(typeof j.km=="number")pl.jog={label:S(j.label,40,"Run"),km:j.km,weeks:j.weeks.map(function(q){return [q[0],q[1]]})}}
  if(o.habits!=null){if(!Array.isArray(o.habits)||o.habits.length>4)E.push("habits must be a list of up to 4 items");
    else pl.habits=o.habits.map(function(h,k2){var n=S(h&&h.name,30);if(!n)E.push("habit "+(k2+1)+" needs a name");return {name:n,badge:S(h&&h.badge,16,""),note:S(h&&h.note,120,""),icon:ICONS.indexOf(h&&h.icon)>=0?h.icon:"flame"}})}
  pl.days={};
  KEYS.forEach(function(k){var d=o.days&&o.days[k];if(!d||typeof d!="object"){E.push("days."+k+" is missing");return}
    var ty=d.type;if(["strength","circuit","mobility","rest"].indexOf(ty)<0){E.push("days."+k+".type must be strength, circuit, mobility or rest");return}
    var t=S(d.title,50);if(!t)E.push("days."+k+".title is required");
    var out={title:t,short:S(d.short,8,(t||"Day").split(" ")[0].slice(0,8)),focus:S(d.focus,90,""),icon:ICONS.indexOf(d.icon)>=0?d.icon:({strength:"dumbbell",circuit:"flame",mobility:"stretch",rest:"moon"})[ty],type:ty,jogNote:S(d.jogNote,160,"Easy pace."),exercises:[]};
    if(d.jog===false)out.jog=false;
    if(ty=="circuit"){if(Number.isInteger(d.rounds)&&d.rounds>=1&&d.rounds<=8)out.rounds=d.rounds;else E.push("days."+k+".rounds must be 1 to 8")}
    if(ty!="rest"){var ex=d.exercises;
      if(!Array.isArray(ex)||!ex.length||ex.length>14)E.push("days."+k+".exercises needs 1 to 14 items");
      else ex.forEach(function(e,n){var nm=S(e&&e.name,40),rp=e&&(typeof e.reps=="number"?String(e.reps):S(e.reps,20));
        if(!nm||!rp)E.push("days."+k+".exercises["+n+"] needs a name and reps");
        var it={name:nm,reps:rp,note:S(e&&e.note,160,"")};
        if(ty=="strength"){if(Number.isInteger(e&&e.sets)&&e.sets>=1&&e.sets<=10)it.sets=e.sets;else E.push("days."+k+".exercises["+n+"].sets must be 1 to 10")}
        out.exercises.push(it)})}
    pl.days[k]=out});
  return {E:E,plan:E.length?null:pl}}
function setPlan(pl){P=pl;var m=/^(\d+)-(\d+)-(\d+)$/.exec(pl.start);START=new Date(+m[1],+m[2]-1,+m[3]);NW=pl.weeks;ND=NW*7;
  T=KEYS.map(function(k){var d=pl.days[k];return {a:d.short,n:d.title,s:d.focus,ic:d.icon,r:d.type=="rest",m:d.type=="mobility",c:d.type=="circuit"?(d.rounds||1):0,
    x:d.exercises.map(function(e){return [e.name,d.type=="strength"?e.sets:(d.type=="mobility"?0:1),e.reps,e.note||""]}),j:d.jogNote||"Easy pace.",jg:d.jog!==false}});
  JKM=pl.jog?pl.jog.km:0;JL=pl.jog?pl.jog.label:"";IVS=pl.jog?pl.jog.weeks:[];
  HAB=pl.habits&&pl.habits.length?pl.habits:[];IH={};HAB.forEach(function(h,k2){IH["h"+(k2+1)]=h.icon||"flame"});
  LWS={};(pl.lightWeeks||[]).forEach(function(w){LWS[w-1]=1});LS=pl.lightSets||2;
  var rng=dl(0)+" to "+dl(ND-1)+" "+dt(ND-1).getFullYear();
  document.title=pl.name;$("ax-name").textContent=pl.athlete||"Your plan";$("ax-plan").textContent=pl.name+", "+rng;
  $("sp-name").textContent=pl.name;$("sp-sub").textContent=NW+" weeks, "+rng;
  $("tvh").textContent=JL||"Run";$("gkm").textContent="km of "+JKM;$("tvpanel").hidden=!JKM}
function activate(id){APP.active=id;var e=APP.plans[id];st=e.st;setPlan(e.plan);if(Array.isArray(e.schedMap)&&e.schedMap.length>ND)ND=e.schedMap.length;cur=Math.max(0,Math.min(ND-1,todayIdx()));$("ax-gall").innerHTML="";closeT();render();plans()}
function loadApp(){var a=axStoreRead();
  if(!a||!a.plans||!a.active||!a.plans[a.active]){var old={};try{old=JSON.parse(localStorage.getItem(OLDK)||"{}")||{}}catch(e){old={}}
    var pr={};if(old._snd===0||old._snd===1)pr.snd=old._snd;if(old._auto===0||old._auto===1)pr.auto=old._auto;if(old._gps===0||old._gps===1)pr.gps=old._gps;
    a={v:2,active:"default",prefs:pr,plans:{"default":{plan:defaultPlan(),st:{}}}};
    var pg=clean(old,28);a.plans["default"].st=pg}
  Object.keys(a.plans||{}).forEach(function(k){var pp=a.plans[k]&&a.plans[k].plan;if(pp&&pp.name==="28-Day Home Plan")pp.name="Home Plan"});
  APP=a;axStamp(a);PR=APP.prefs=APP.prefs||{};if(APP.plans[APP.active]){if(!APP.plans[APP.active].schedMap&&Array.isArray(PR.schedMap))APP.plans[APP.active].schedMap=PR.schedMap.slice();if(!APP.plans[APP.active].workoutEdits&&PR.workoutEdits&&typeof PR.workoutEdits==="object")APP.plans[APP.active].workoutEdits=PR.workoutEdits;delete PR.schedMap;delete PR.workoutEdits;if(!APP.plans[APP.active].routes&&PR.routes&&typeof PR.routes==="object")APP.plans[APP.active].routes=PR.routes;delete PR.routes}if(!PR.skin)PR.skin="oldmoney";if(typeof PR.gls!=="boolean")PR.gls=true;activate(APP.active)}
var PEND=null;
function ticksOf(e){var n=0;for(var k2 in e.st)if(/^\d+:/.test(k2))n++;return n}
function plans(){var h="",ids=Object.keys(APP.plans);
  ids.forEach(function(id){var e=APP.plans[id],pl=e.plan,on=id==APP.active;
    h+='<div class="panel"><div class="row"><span><b>'+esc(pl.name)+(on?' (active)':'')+'</b><em>'+pl.weeks+' weeks from '+esc(pl.start)+' | '+ticksOf(e)+' ticks logged</em></span></div><div class="qr">'+(on?'':'<button class="btn pri" data-use="'+id+'">Use this plan</button>')+(ids.length>1?'<button class="btn" data-del="'+id+'">Delete</button>':'')+'</div></div>'});
  var el=$("pl-list");el.innerHTML=h;
  el.querySelectorAll("[data-use]").forEach(function(b){b.onclick=function(){activate(b.dataset.use);save();toast("Plan switched");go("home")}});
  el.querySelectorAll("[data-del]").forEach(function(b){b.onclick=function(){
    if(!b.dataset.arm){b.dataset.arm=1;b.textContent="Tap again to delete";setTimeout(function(){b.dataset.arm="";b.textContent="Delete"},3500);return}
    var id=b.dataset.del;delete APP.plans[id];var nx=APP.active==id?Object.keys(APP.plans)[0]:APP.active;save();activate(nx);save();toast("Plan deleted")}})}
function chk(){var t=$("pl-t").value.trim().replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,""),o=null,res=$("pl-res");PEND=null;$("pl-add").hidden=true;
  if(!t){res.innerHTML='<p class="note">Paste or load a plan first.</p>';return}
  try{o=JSON.parse(t)}catch(e){res.innerHTML='<p class="note">That is not valid JSON. Make sure you copied the whole plan.</p>';return}
  var r=vplan(o);
  if(!r.plan){res.innerHTML='<div class="note"><b>Fix these and try again:</b><br>'+r.E.slice(0,8).map(esc).join("<br>")+(r.E.length>8?"<br>and "+(r.E.length-8)+" more":"")+'</div>';return}
  var pl=r.plan,sd=new Date(+pl.start.slice(0,4),+pl.start.slice(5,7)-1,+pl.start.slice(8));
  var lines=KEYS.map(function(k){return DN[KEYS.indexOf(k)]+": "+esc(pl.days[k].title)}).join("<br>");
  res.innerHTML='<div class="note"><b>'+esc(pl.name)+'</b><br>'+pl.weeks+' weeks from '+DN[sd.getDay()]+' '+sd.getDate()+' '+MN[sd.getMonth()]+' '+sd.getFullYear()+(pl.jog?'<br>Run: '+esc(pl.jog.label)+', '+pl.jog.km+' km':'<br>No run')+'<br><br>'+lines+'</div>';
  PEND=pl;$("pl-add").hidden=false}
function copyText(txt,ok){var t=$("pl-t");
  try{navigator.clipboard.writeText(txt).then(function(){toast(ok||"Copied")},function(){t.value=txt;t.select();toast("Select and copy the text")})}catch(e){t.value=txt;t.select();toast("Select and copy the text")}}
function guide(){return "I use a workout tracker app that loads a plan from a JSON config. Create a plan for me and reply with ONE JSON code block only, no other text.\n\nRules:\n- format must be \"arya-plan\", version 1. Required: name, start (YYYY-MM-DD), weeks (1-12), days.\n- days must have all seven keys: sun, mon, tue, wed, thu, fri, sat. Each day: title, short (max 8 chars), focus, icon (dumbbell, run, flame, stretch, moon, sun, wind, drop, egg, timer), type, jogNote.\n- type strength: exercises each need name, sets (1-10), reps (text like \"8-10\" or \"30s\"), note.\n- type circuit: needs rounds (1-8); exercises need name, reps, note (no sets).\n- type mobility: exercises need name, reps (like \"45s/leg\"), note.\n- type rest: no exercises. Add \"jog\": false on any day that should have no run.\n- jog (optional): {label, km, weeks:[[jogSeconds, walkSeconds], ...]}. One pair per week; the last pair repeats. walkSeconds 0 means continuous running.\n- lightWeeks (optional): week numbers with reduced volume; lightSets: sets used in those weeks.\n- habits (optional, up to 4): {name, badge, note, icon}.\n- The first day of the plan can be any weekday; days are matched by weekday.\n\nHere is my current plan as an example of the exact format:\n"+JSON.stringify(P)}
async function dlFile(name,txt){var dl=null;try{dl=window.claude&&await claude.use("downloads")}catch(e){dl=null}
  if(dl){try{await dl.save({filename:name,data:txt});return 1}catch(e){if(e&&e.code=="declined")return 2}}
  try{var u=URL.createObjectURL(new Blob([txt],{type:"application/json"})),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(u)},2000);return 1}catch(e){return 0}}
async function saveFile(name,txt){var r=await dlFile(name,txt);if(r==1)toast("Plan file saved");else if(!r)copyText(txt,"Couldn't save the file. Plan copied instead.")}
function bindPlans(){
  $("sp-go").onclick=function(){go("plans")};$("pl-back").onclick=function(){go("set")};
  $("pl-pick").onclick=function(){$("pl-f").click()};
  $("pl-f").onchange=function(){var f=this.files[0];this.value="";if(!f)return;var r=new FileReader();r.onload=function(){$("pl-t").value=String(r.result);chk()};r.readAsText(f)};
  $("pl-chk").onclick=chk;
  $("pl-add").onclick=function(){if(!PEND)return;var id="p"+Date.now().toString(36);APP.plans[id]={plan:PEND,st:{}};PEND=null;$("pl-t").value="";$("pl-res").innerHTML="";$("pl-add").hidden=true;save();activate(id);save();toast("Plan added and active");go("home")};
  $("pl-exp").onclick=function(){saveFile("plan-"+P.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,30)+".json",JSON.stringify(P,null,1))};
  $("pl-copy").onclick=function(){copyText(JSON.stringify(P,null,1),"Plan copied")};
  $("pl-guide").onclick=function(){copyText(guide(),"Guide copied. Paste it to Claude.")}}
function render(){stats();grid();day();home()}

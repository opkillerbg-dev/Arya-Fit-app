/* Step 5: all-day step counter. Native plugin "Steps" (StepsPlugin.java) counts with the phone's step sensor in a foreground service and keeps per-day totals; JS mirrors them into PR.ds for backup. */
var STP=NAT&&Capacitor.Plugins&&Capacitor.Plugins.Steps,SS={perm:0,sensor:1,run:0,ign:1,today:0,date:"",asked:0,sv:0,dirty:0};
function ymdOf(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function sgoal(){var g=PR.sg;return Number.isInteger(g)&&g>=1000&&g<=50000?g:8000}
function strideM(){var g=0,s2=0,i;for(i=0;i<ND;i++){var a=st["g"+i]||0,b=st["s"+i]||0;if(a>0&&b>0){g+=a;s2+=b}}return s2>=500&&g>=2000?Math.max(.55,Math.min(1.2,g/s2*.9)):.75}
function skm(n){return(n*strideM()/1000).toFixed(1)}
function stepsPrune(){var ds=PR.ds;if(!ds)return;var lim=ymdOf(new Date(Date.now()-400*864e5));Object.keys(ds).forEach(function(k){if(k<lim)delete ds[k]})}
function stepsPaint(){var e=$("ax-hsteps");if(!e)return;if(!STP){e.hidden=true;return}e.hidden=false;
  var g=sgoal(),n=SS.today,h;
  if(!SS.sensor)h='<span class="ax-cap">Steps today</span><span class="ax-cap">No step sensor on this phone.</span>';
  else if(!SS.perm)h='<span class="ax-cap">Steps today</span><span class="ax-stpn"><b>Allow step counting</b></span><span class="ax-cap">Tap to allow activity access.</span>';
  else h='<span class="ax-stph"><span class="ax-cap">Steps today</span><span class="ax-cap">'+skm(n)+' km</span></span><span class="ax-stpn"><b>'+n.toLocaleString()+'</b><span class="ax-cap">of '+g.toLocaleString()+'</span></span><span class="ax-bar"><i style="width:'+Math.min(100,Math.round(n/g*100))+'%"></i></span>';
  if(e.dataset.h!==h){e.dataset.h=h;e.innerHTML=h}}
function stepsPull(){if(!STP)return Promise.resolve();
  return STP.status().then(function(r){if(!r)return;
    SS.perm=!!r.perm;SS.sensor=r.sensor!==false;SS.run=!!r.running;SS.ign=r.ignoring!==false;SS.date=r.date||ymd();
    var n=Math.max(0,Math.min(200000,r.today|0));SS.today=n;
    if(SS.perm&&SS.sensor){PR.ds=PR.ds||{};if(PR.ds[SS.date]!==n){PR.ds[SS.date]=n;if(Date.now()-SS.sv>10000){SS.sv=Date.now();SS.dirty=0;stepsPrune();save()}else SS.dirty=1}
      if(!SS.run)STP.start().catch(function(){})}
    stepsPaint()}).catch(function(){})}
function stepsHist(){if(!STP)return Promise.resolve();return STP.history().then(function(r){var m=r&&r.map;if(!m)return;PR.ds=PR.ds||{};var ch=0;
  Object.keys(m).forEach(function(k){var v=m[k];if(/^\d{4}-\d{2}-\d{2}$/.test(k)&&Number.isInteger(v)&&v>=0&&v<=200000&&!(PR.ds[k]>=v)){PR.ds[k]=v;ch=1}});
  if(ch){stepsPrune();save()}}).catch(function(){})}
function axSteps(){
  var g=sgoal(),n=SS.today,now=new Date(),ds=PR.ds||{},vals=[],mx=g,i,bars;
  for(i=6;i>=0;i--){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i),v=i==0?n:(ds[ymdOf(d)]||0);vals.push([DN[d.getDay()].charAt(0),v,i==0]);mx=Math.max(mx,v)}
  bars=vals.map(function(x){return'<span class="ax-sb'+(x[2]?' on':'')+'" aria-label="'+x[1]+' steps"><u><i style="height:'+Math.max(3,Math.round(x[1]/mx*100))+'%"></i></u><em>'+x[0]+'</em></span>'}).join("");
  axSheet("Steps",'<div class="ax-sbig"><b>'+n.toLocaleString()+'</b><span class="ax-cap">steps today | '+skm(n)+' km | '+Math.min(100,Math.round(n/g*100))+'% of goal</span></div><div class="ax-sbars">'+bars+'</div>'
    +(SS.ign?'':'<button class="ax-opt" id="ax-sbat"><b>Keep counting in background</b><span>Turn off battery limits for Arya Fit</span></button>')
    +'<p class="ax-cap">Daily goal (steps)</p><input class="ax-field" id="ax-sg" type="number" inputmode="numeric" min="1000" max="50000" value="'+g+'" aria-label="Daily step goal"><button class="ax-btn ax-pri" id="ax-sgs">Save goal</button>');
  $("ax-sgs").onclick=function(){var v=Math.round(+$("ax-sg").value);if(!(v>=1000&&v<=50000)){toast("Goal: 1,000 to 50,000 steps");return}PR.sg=v;save();axSheetX();stepsPaint();toast("Goal saved")};
  if($("ax-sbat"))$("ax-sbat").onclick=function(){try{STP.keepAlive()}catch(e){}axSheetX()}}
function stepsInit(){var e=$("ax-hsteps");if(!STP){if(e)e.hidden=true;return}
  e.onclick=function(){if(!SS.sensor)return;if(SS.perm){axSteps();return}
    if(SS.asked){try{STP.openSettings()}catch(x){}return}
    SS.asked=1;STP.requestPermissions().catch(function(){}).then(function(){stepsPull()})};
  STP.checkPermissions().then(function(p){var a=p&&p.activity;if(a!=="granted"){SS.asked=1;if(a!=="denied")return STP.requestPermissions()}}).catch(function(){}).then(function(){stepsPull();stepsHist()});
  setInterval(function(){if(!document.hidden)stepsPull()},15000);
  document.addEventListener("visibilitychange",function(){if(document.hidden){if(SS.dirty){SS.dirty=0;save()}}else stepsPull()})}


/* Step 7: settings status line */
function axSl(){var e=$("ax-sline");if(!e)return;e.textContent=!STP?"Phone app only":!SS.sensor?"No step sensor on this phone":!SS.perm?"Off. Allow Physical activity in phone settings":"On, counting all day"}
/* Step 6: Progress segments */
var AXPS="stats";
function axClr(){["ax-ps-stats","ax-ps-hist","ax-ps-badges","ax-pbody"].forEach(function(i){$(i).innerHTML=""})}
function axPs(k){AXPS=k;["stats","body","hist","badges"].forEach(function(x){$("ax-ps-"+x).hidden=x!=k});[].forEach.call($("ax-psg").children,function(b){b.classList.toggle("on",b.dataset.ps==k);b.setAttribute("aria-pressed",b.dataset.ps==k)});if(k=="body")body()}
function axDt(n){var h=n.querySelector("h3"),d=document.createElement("details"),m=document.createElement("summary");d.className="ax-card ax-dt";m.textContent=h.textContent;h.remove();d.appendChild(m);while(n.firstChild)d.appendChild(n.firstChild);return d}
function axStp(){var ds=PR.ds||{},g=sgoal(),now=new Date(),v=[],i,t=0,n=0,bs=0,mx=g,c="",bw=10;
 for(i=27;i>=0;i--){var x=ds[ymdOf(new Date(now.getFullYear(),now.getMonth(),now.getDate()-i))]||0;v.push(x);if(x){t+=x;n++;if(x>bs)bs=x}if(x>mx)mx=x}
 if(!n)return '<div class="ax-card" style="margin-top:12px"><p class="ax-cap">Steps per day</p><p class="ax-sub">No steps yet</p></div>';
 v.forEach(function(x,k){var h=Math.round(x/mx*76);c+='<rect x="'+(k*bw+1)+'" y="'+(80-h)+'" width="8" height="'+h+'" rx="2" fill="'+(x>=g?"var(--ok)":"var(--blue)")+'"/>'});
 var gy=80-Math.round(g/mx*76);
 return '<div class="ax-card" style="margin-top:12px"><p class="ax-cap">Steps per day, last 28 days</p><svg viewBox="0 0 280 80" style="width:100%">'+c+'<line x1="0" x2="280" y1="'+gy+'" y2="'+gy+'" stroke="var(--mut)" stroke-dasharray="4 3"/></svg><div class="ax-sg3"><span><b>'+Math.round(t/n).toLocaleString()+'</b> avg</span><span><b>'+bs.toLocaleString()+'</b> best</span><span><b>'+g.toLocaleString()+'</b> goal</span></div></div>'}
function axStepHistoryHTML(){
 var ds=PR.ds||{},now=new Date(),rows=[];
 for(var i=0;i<30;i++){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-i),key=ymdOf(d),v=ds[key];if(i===0&&SS&&SS.date===key&&Number.isFinite(SS.today))v=Math.max(Number(v)||0,SS.today);if(v==null&&i>6)continue;v=Number(v)||0;rows.push('<div class="lg" style="display:flex;align-items:center;justify-content:space-between;gap:12px"><div><b>'+ (i===0?'Today':DN[d.getDay()]+' · '+d.getDate()+' '+d.toLocaleString(undefined,{month:'short'})) +'</b><div class="ax-cap">'+key+'</div></div><div style="text-align:right"><b>'+v.toLocaleString()+'</b><div class="ax-cap">steps'+(v>=sgoal()?' · Goal reached':'')+'</div></div></div>')}
 return '<div class="panel" id="ax-step-history" style="margin-top:12px"><h3 style="margin-top:0">Daily steps history</h3><p class="ax-cap">Saved on this device and included in tracker backups.</p>'+(rows.length?rows.join(''):'<p class="ax-sub">No daily step records yet.</p>')+'</div>';
}
function axPg(){var P={stats:$("ax-ps-stats"),hist:$("ax-ps-hist"),badges:$("ax-ps-badges"),body:$("ax-pbody")},k;
 for(k in P)P[k].innerHTML="";
 [].slice.call($("pgv").children).forEach(function(n){var h=n.querySelector("h3"),t=h?h.textContent:"";
  if(/^Run log/.test(t))return;
  if(/^(Body log|Fitness test)/.test(t)){P.body.appendChild(axDt(n))}
  else if(/^Badges/.test(t))P.badges.appendChild(n);
  else if(/^(Run history|No runs yet|Run map)/.test(t))P.hist.appendChild(n);
  else{P.stats.appendChild(n);if(/tiles/.test(n.className))P.stats.insertAdjacentHTML("beforeend",axStp())}});
  $("pgv").innerHTML="";
 /* Editorial section headers use only real locally stored records. */
 var head=function(target,kicker,title,note,icon){var el=$(target);if(!el)return;var subhead={stats:'The numbers',hist:'Run history',badges:'Unlocked milestones'}[icon]||title;var svg={stats:'<path d="M4 19V5M4 19H21M8 15v-4M13 15V7M18 15V3"/>',hist:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',badges:'<path d="M8 4h8l2 4-6 3-6-3 2-4Z"/><path d="m6 8-2 7 8-4 8 4-2-7M8 17l4 2 4-2"/>',body:'<path d="M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 12l3-2h6l3 2M9 10l-1 5 2 6M15 10l1 5-2 6M8 15h8"/>'}[icon]||'';el.insertAdjacentHTML('afterbegin','<div class="ax-prog-overview"><div class="ax-prog-orbit"><svg viewBox="0 0 24 24" aria-hidden="true">'+svg+'</svg></div><div><b>'+title+'</b><p>'+note+'</p></div></div><div class="ax-prog-sectionhead"><div><span>'+kicker+'</span><b>'+title+'</b></div><small>'+note+'</small></div>')};
 head('ax-ps-stats','YOUR BASELINE','Progress, in context','Your logged activity, not guesses','stats');
 head('ax-ps-hist','YOUR JOURNEY','Every session counts','Review, edit or share recorded runs','hist');
 $("ax-ps-hist").insertAdjacentHTML("beforeend",axStepHistoryHTML());
 head('ax-ps-badges','MILESTONES','Small wins, earned','Only achievements you actually unlock','badges');
 /* Body has its own editorial intro; give it a compact status strip above the map. */
 var bd=$("ax-ps-body");if(bd&&!$("ax-body-overview")){var bdo=document.createElement('div');bdo.id='ax-body-overview';bdo.className='ax-prog-overview';bdo.innerHTML='<div class="ax-prog-orbit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM6 12l3-2h6l3 2M9 10l-1 5 2 6M15 10l1 5-2 6M8 15h8"/></svg></div><div><b>Recovery atlas</b><p>Choose a muscle group to inspect recent load and soreness.</p></div>';bd.insertBefore(bdo,bd.firstChild)}
 axPs(AXPS);body()}
$("ax-psg").onclick=function(e){var b=e.target.closest("button");if(b)axPs(b.dataset.ps)};


function items(i){
  var si=axSrc(i),w=Math.floor(Math.max(0,si)/7),t=si<0?{r:true,x:[]}:T[wdk(si)],L=isL(w),o=[];if(si<0)return [["Recovery","rest","Planned rest","Rest","Recovery day; no workout scheduled."]];
  if(!t.r)o.push(["Warm-up","wu","Warm-up","5 min","Arm circles, hip circles, leg swings, squats, jumping jacks."]);
  t.x.forEach(function(e,k){
    var ov=(axEdits()[String(i)]||{})[k]||{},sets=Number.isFinite(ov.sets)?ov.sets:e[1],reps=Number.isFinite(ov.reps)?ov.reps:e[2]; var b=(t.c||e[1]===0)?reps:(L?Math.min(sets,LS):sets)+" \u00d7 "+reps;
    o.push([t.m?"Mobility":"Strength","e"+k,e[0],b,e[3]]);
  });
  if(JKM&&t.jg){var cw=!IVS[Math.min(w,IVS.length-1)][1];
    o.push([JL,"j",JKM+" km"+(cw?"":", repeat intervals"),JKM+" km",ivt(w)+". "+t.j+(cw?"":" Walk breaks are fine, just cover "+JKM+" km total. Cut the walking as you get fitter.")])}
  if(!t.r&&!t.m)o.push(["Cool-down","cd","Walk and stretch","5 min","Calves, quads, hamstrings, hips, 30 sec each."]);
  HAB.forEach(function(h,k2){o.push(["Daily habits","h"+(k2+1),h.name,h.badge,h.note])});
  return o;
}
function k(i,id){return i+":"+id}
function cnt(i){var a=items(i),n=0;a.forEach(function(x){if(st[k(i,x[1])])n++});return [n,a.length]}
function dayDone(i){var c=cnt(i);return c[0]==c[1]}
var cur=0;
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function stats(){
  var done=0,tot=0,chk=0,last=-1;
  for(var i=0;i<ND;i++){var x=st["x"+i],c=cnt(i);if(x==1)continue;tot+=c[1];chk+=c[0];if(c[0]==c[1]||x==2){done++;last=i}}
  var s=0;for(var j=last;j>=0;j--){var xj=st["x"+j];if(xj==1)continue;if(dayDone(j)||xj==2)s++;else break}
  for(var q=last+1;q<=todayIdx()-1;q++)if(st["x"+q]!=1&&st["x"+q]!=2){s=0;break}
  var p=tot?Math.round(chk/tot*100):0;
  document.getElementById("ax-ring").style.strokeDashoffset=251.3*(1-p/100);
  document.getElementById("ax-pct").textContent=p+"%";
  document.getElementById("ax-done").textContent=done;
  document.getElementById("ax-streak").textContent=s;
}
function grid(){
  var td=todayIdx(),w=Math.floor(cur/7),W=Math.ceil(ND/7),a=w*7,b=Math.min(ND,a+7),h="",i,j,ga=$("ax-gall");
  var cl=function(n){var x=st["x"+n],c=cnt(n),p=x==2?100:Math.round(c[0]/c[1]*100);return[p,(n==td?" today":"")+(n==cur?" sel":"")+(p==100&&x!=1?" done":"")+(x==1?" rest":"")]};
  var lb=function(n){var x=st["x"+n],p=cl(n)[0];return"Day "+(n+1)+", "+dl(n)+", "+(x==1?"rest day":p+"% done")};
  if(!ga.children.length){var o=START.getDay(),g="";for(i=0;i<o;i++)g+="<span></span>";
    for(i=0;i<ND;i++)g+='<button class="ax-gc" data-i="'+i+'"><span class="ax-wr"><b>'+dt(i).getDate()+'</b></span></button>';
    ga.innerHTML=g;ga.onclick=function(e){var t=e.target.closest("button");if(!t)return;cur=+t.dataset.i;render()}}
  for(j=0;j<ND;j++){var e=ga.children[j+START.getDay()],c=cl(j);e.className="ax-gc"+c[1];e.style.setProperty("--p",c[0]);e.setAttribute("aria-label",lb(j))}
  for(i=a;i<b;i++){var c2=cl(i);h+='<button class="ax-wc'+c2[1]+'" style="--p:'+c2[0]+'" data-i="'+i+'" aria-label="'+lb(i)+'"><small>'+DN[dt(i).getDay()]+'</small><span class="ax-wr"><b>'+dt(i).getDate()+'</b></span></button>'}
  var sp=$("ax-wstrip");sp.innerHTML=h;sp.onclick=function(e){var t=e.target.closest("button");if(!t)return;cur=+t.dataset.i;render()};
  $("ax-wlab").textContent="Week "+(w+1)+" of "+W;$("ax-wrng").textContent=dl(a)+" to "+dl(b-1);
  $("ax-wprev").disabled=w<=0;$("ax-wnext").disabled=w>=W-1;
}
function day(){
  var i=cur,si=axSrc(i),w=Math.floor(Math.max(0,si)/7),t=si<0?{n:"Planned rest",s:"Recovery day",ic:"moon",r:true,m:false,c:0,x:[]}:T[wdk(si)],a=items(i),c=cnt(i),td=todayIdx(),x=st["x"+i]||0,g="",h="",tg=[];
  h+='<div class="ax-session-kicker"><span class="ax-kicker">YOUR SESSION</span><span class="ax-session-index">DAY '+String(i+1).padStart(2,"0")+' / '+ND+'</span></div><div class="ax-dayrow"><div class="ax-dbadge"><small>'+DN[dt(i).getDay()]+'</small><b>'+dt(i).getDate()+'</b></div><div class="ax-dayx"><h2 class="ax-h2">'+ic(t.ic,"ax-ic")+esc(t.n)+'</h2><p class="ax-sub">Week '+(w+1)+', day '+(i+1)+' of '+ND+'</p></div></div>';
  h+='<div style="display:flex;gap:8px;margin:10px 0 14px"><button class="ax-btn" id="ax-edit-workout">Edit sets / reps</button><button class="ax-btn" id="ax-reschedule">Preview schedule</button></div>';
  if(td<0)tg.push("Starts "+dl(0)+(td==-1?", tomorrow":", in "+(-td)+" days"));else if(td==i)tg.push("Today");
  if(isL(w))tg.push("Light week");
  if(x==1)tg.push("Rest day");else if(x==2)tg.push("Closed");
  if(tg.length)h+='<div class="ax-tags">'+tg.map(function(q){return'<span class="ax-tag">'+q+'</span>'}).join("")+'</div>';
  h+='<div class="ax-session-summary"><p class="ax-cap">'+esc(t.s)+(t.c?', '+(isL(w)?Math.max(1,t.c-1):t.c)+' rounds':'')+'</p><span class="ax-session-status">'+(x==2?'Closed':(x==1||t.r)?'Rest':c[0]===c[1]?'Complete':c[0]?'In progress':'Ready when you are')+'</span></div>';
  h+='<div class="ax-prog ax-session-progress"><div class="ax-session-progress-top"><span>SESSION PROGRESS</span><b id="ax-pt">'+c[0]+' of '+c[1]+' complete</b></div><div class="ax-bar"><i id="ax-pu" style="width:'+Math.round(c[0]/c[1]*100)+'%"></i></div></div>';
  h+='<p class="ax-okt" id="ax-fin"'+(c[0]==c[1]?"":" hidden")+'>Day '+(i+1)+' complete. Nice work.</p>';
  if(st["w"+i]||st["r"+i]||st["g"+i])h+='<div class="ax-tags">'+(st["w"+i]?'<span class="ax-tag">Workout '+fmt(st["w"+i])+'</span>':'')+(st["r"+i]?'<span class="ax-tag">5 km '+fmt(st["r"+i])+'</span>':'')+(st["g"+i]?'<span class="ax-tag">'+(st["g"+i]/1000).toFixed(2)+' km</span>':'')+(st["jt"+i]||st["wk"+i]?'<span class="ax-tag">Jog '+fmt(st["jt"+i]||0)+' | Walk '+fmt(st["wk"+i]||0)+'</span>':'')+(st["s"+i]?'<span class="ax-tag">'+st["s"+i].toLocaleString()+' steps</span>':'')+'</div>';
  a.forEach(function(q){
    if(q[0]!=g){g=q[0];h+='<h3 class="ax-gh">'+ic(IG[g]||"run","ax-ic")+esc(g)+'</h3>'}
    var ck=st[k(i,q[1])],sec=0,m2,bt="";
    if(m2=/^(\d+)s/.exec(q[3]))sec=+m2[1];else if(m2=/^(\d+) min$/.exec(q[3]))sec=m2[1]*60;
    if(q[1]=="j")bt='<button class="ax-play" data-iv="1" aria-label="Start run and walk timer">'+ic("play","ax-ic")+'</button>';
    else if(sec)bt='<button class="ax-play" data-s="'+sec+'" data-l="'+esc(q[2]+(/side|leg/.test(q[3])?" (each side)":""))+'" aria-label="Start '+sec+' second timer">'+ic("play","ax-ic")+'</button>';
    h+='<label class="ax-row'+(q[1]=="j"?" ax-jog":"")+(ck?" ax-ck":"")+'"><input type="checkbox" data-g="'+esc(q[0])+'" data-id="'+q[1]+'"'+(ck?" checked":"")+'><span class="ax-bx">'+ic("check","ax-ic")+'</span><span class="ax-tx"><b>'+(IH[q[1]]?ic(IH[q[1]],"ax-ic"):'')+esc(q[2])+'</b><em>'+esc(q[4])+'</em></span><span class="ax-bd">'+esc(q[3])+'</span>'+bt+'</label>'+axExiHtml(q);
  });
  var el=$("ax-day");el.innerHTML=h;el.querySelectorAll(".ax-exi").forEach(axExiBind);
  var eb=$("ax-edit-workout"),rb=$("ax-reschedule");if(eb)eb.onclick=function(){axEditWorkout(i)};if(rb)rb.onclick=function(){axShiftPreview(i)};
  el.querySelectorAll(".ax-play").forEach(function(b){b.onclick=function(e){e.preventDefault();e.stopPropagation();unlock();b.dataset.iv?startIV():startCD(+b.dataset.s,b.dataset.l)}});
  el.querySelectorAll(".ax-row input").forEach(function(b){b.onchange=function(){
    var wd=dayDone(i),ww=weekDone(w);
    if(b.checked)st[k(i,b.dataset.id)]=1;else delete st[k(i,b.dataset.id)];hx(b.checked?"ok":"tick");
    if(b.checked&&PR.auto&&b.dataset.g=="Strength"){unlock();startCD(60,"Rest")}
    save();
    var row=b.closest(".ax-row"),bx=row.querySelector(".ax-bx");row.classList.toggle("ax-ck",b.checked);
    if(b.checked){bx.classList.remove("ax-pop");void bx.offsetWidth;bx.classList.add("ax-pop")}
    var c3=cnt(i);$("ax-pu").style.width=Math.round(c3[0]/c3[1]*100)+"%";$("ax-pt").textContent=c3[0]+" of "+c3[1]+" done";var ss=el.querySelector(".ax-session-status");if(ss)ss.textContent=st["x"+i]==2?"Closed":st["x"+i]==1?"Rest":c3[0]===c3[1]?"Complete":c3[0]?"In progress":"Ready when you are";
    $("ax-fin").hidden=c3[0]!=c3[1];stats();grid();
    if(!wd&&dayDone(i)){
      var r=$("ax-fin").getBoundingClientRect(),bx2=r.left+r.width/2,by=r.top+r.height/2;
      if(!ww&&weekDone(w)){burst(bx2,by,60);toast(allDone()?"All "+ND+" days done. You finished the plan!":"Week "+(w+1)+" complete. Great consistency.")}
      else burst(bx2,by,28);
    }
  }});
  var pc=$("ax-pclose");pc.textContent=x?"Reopen day":"Close day";pc.disabled=!(td>=0&&i<=td);
}
function weekDone(w){for(var d=0;d<7;d++)if(!dayDone(w*7+d))return false;return true}
function allDone(){for(var d=0;d<ND;d++)if(!dayDone(d))return false;return true}
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches,CC=["#ffc93c","#2f5bff","#12b27a","#ff7a45","#8b5cf6"],tt=null;
function burst(x,y,n){hx(n>40?"finish":"ok");if(RM)return;for(var j=0;j<n;j++){var e=document.createElement("i");e.className="cf";
  e.style.cssText="left:"+x+"px;top:"+y+"px;background:"+CC[j%5]+";--dx:"+Math.round(Math.random()*300-150)+"px;--dy:"+Math.round(-(Math.random()*200+60))+"px;--r:"+Math.round(Math.random()*720)+"deg";
  document.body.appendChild(e);(function(z){setTimeout(function(){z.remove()},1300)})(e)}}
function toast(m){if(/couldn't|can't|cannot|isn't|failed|blocked|\benter |no step|finish or close/i.test(m))hx("warn");var e=$("toast");e.textContent=m;e.hidden=false;e.style.animation="none";void e.offsetWidth;e.style.animation="";clearTimeout(tt);tt=setTimeout(function(){e.hidden=true},3200)}


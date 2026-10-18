/* Arya Fit v69: Hands-free workout mode (full-screen player: picture strip, set counter, rest timer, voice cues, wake lock).
   Uses existing say(), beep(), snd(), hx(), wl(), axExpHtml(), axExiBind(), items(), st, PR.setLog and the #gov overlay. */
(function(){
  "use strict";
  var HF=null,tmr=null;

  function parseSpec(badge){
    var s=String(badge||""),sets=1,reps=10,sec=0,m=/^(\d+)\s*\u00d7\s*(.+)$/.exec(s);
    if(m){sets=+m[1]||1;s=m[2].trim()}
    var sm=/^(\d+)\s*s\b/i.exec(s),mm=/^(\d+)\s*min\b/i.exec(s),rm=/^(\d+)\s*-\s*(\d+)/.exec(s);
    if(sm){sec=+sm[1]||30;reps=sec}
    else if(mm){sec=(+mm[1]||1)*60;reps=sec}
    else if(rm){reps=+rm[2]||10}
    else{var nm=/^(\d+)/.exec(s);if(nm)reps=+nm[1]||10}
    return{sets:Math.max(1,Math.min(10,sets)),reps:reps,sec:sec}
  }

  function getSteps(dayIdx){
    var out=[];
    items(dayIdx).forEach(function(q){
      if(q[0]==="Daily habits"||q[1]==="rest"||q[1]==="j")return;
      var sp=parseSpec(q[3]);
      if(q[1]==="wu"||q[1]==="cd"){sp.sets=1;sp.sec=sp.sec||300}
      out.push({cat:q[0],id:q[1],name:q[2],badge:q[3],note:q[4],sets:sp.sets,reps:sp.reps,sec:sp.sec});
    });
    return out;
  }

  function picHtml(step){
    var sl=exSlug(step.name),L=EXI[sl];
    if(!L||PR.exi===0)return'<div class="ax-hf-noimg">'+ic(IG[step.cat]||"dumbbell","ax-ic")+'<span>'+esc(step.cat)+'</span></div>';
    var im="",d="";
    for(var j=0;j<L.length;j++){im+=axExpHtml(sl,L[j],step.name);d+='<i'+(j?'':' class="on"')+'></i>'}
    return'<div class="ax-exi ax-hf-exi"><div class="ax-exs" role="group" aria-label="'+esc(step.name)+' pictures">'+im+'</div>'+(L.length>1?'<div class="ax-exd" aria-hidden="true">'+d+'</div>':'')+'</div>';
  }

  function stopTimer(){if(tmr){clearInterval(tmr);tmr=null}}

  function closeHF(saved){
    stopTimer();
    var o=$("gov");if(o)o.remove();
    if(HF&&HF.t0){
      var el=Math.round((Date.now()-HF.t0)/1000);
      if(el>=15){st["w"+HF.day]=(st["w"+HF.day]||0)+el;save()}
    }
    HF=null;
    try{if(!TM&&wlk){wlk.release();wlk=null}}catch(e){}
    render();
    if(saved)toast("Hands-free session complete!");
  }

  function startCountdown(sec,onDone){
    stopTimer();
    HF.rem=sec;
    tmr=setInterval(function(){
      if(!HF||HF.paused)return;
      HF.rem--;
      var el=$("ax-hf-clock");
      if(el)el.textContent=fmt(Math.max(0,HF.rem));
      if(HF.rem<=3&&HF.rem>0)beep(1,660);
      if(HF.rem<=0){stopTimer();beep(2,880);onDone()}
    },1000);
  }

  function logSet(step,setNum){
    if(/^e\d+$/.test(step.id)&&step.cat==="Strength"){
      PR.setLog=PR.setLog&&typeof PR.setLog==="object"?PR.setLog:{};
      PR.setLog[step.name]=PR.setLog[step.name]||{};
      var a=(PR.setLog[step.name][HF.day]||[]).slice();
      while(a.length<step.sets)a.push(0);
      if(!a[setNum-1])a[setNum-1]=step.reps;
      PR.setLog[step.name][HF.day]=a;
    }
    save();
  }

  function startWork(){
    var s=HF.list[HF.idx];
    HF.mode="work";HF.paused=false;
    say("Set "+HF.set+". "+s.name);
    paintHF();
  }

  function advanceSet(){
    if(!HF)return;
    var s=HF.list[HF.idx];
    logSet(s,HF.set);
    hx("ok");
    if(HF.set<s.sets){
      HF.mode="rest";HF.paused=false;
      say("Rest 60 seconds");
      paintHF();
      startCountdown(60,function(){if(!HF)return;HF.set++;startWork()});
    }else nextStep(true);
  }

  /* done=true: exercise finished, tick it. done=false: skipped, move on without ticking. */
  function nextStep(done){
    if(!HF)return;
    stopTimer();
    var s=HF.list[HF.idx];
    if(done){st[k(HF.day,s.id)]=1;save()}
    if(HF.idx+1>=HF.list.length){
      snd("stop");say("Workout complete. Great job.");
      closeHF(true);return;
    }
    HF.idx++;HF.set=1;HF.mode="work";HF.paused=false;
    var nx=HF.list[HF.idx];
    say(nx.name+". "+(nx.sets>1?"Set 1 of "+nx.sets:nx.badge));
    paintHF();
  }

  function prevStep(){
    if(!HF||HF.idx<=0)return;
    stopTimer();
    HF.idx--;HF.set=1;HF.mode="work";HF.paused=false;
    say(HF.list[HF.idx].name);
    paintHF();
  }

  function paintHF(){
    var o=$("gov");if(!o||!HF)return;
    stopTimer();
    var s=HF.list[HF.idx],isRest=HF.mode==="rest",dots="",timerHtml="";
    for(var j=1;j<=s.sets;j++)dots+='<span class="ax-hf-sdot'+(j<HF.set||(isRest&&j===HF.set)?" done":j===HF.set?" cur":"")+'">Set '+j+'</span>';
    if(isRest)timerHtml='<div class="ax-hf-rest"><small>REST TIMER</small><b id="ax-hf-clock">'+fmt(60)+'</b><div class="ax-hf-rbtns"><button type="button" class="ax-btn" id="ax-hf-m15">-15s</button><button type="button" class="ax-btn" id="ax-hf-p15">+15s</button></div></div>';
    else if(s.sec>0)timerHtml='<div class="ax-hf-rest work"><small>TIMED</small><b id="ax-hf-clock">'+fmt(s.sec)+'</b><button type="button" class="ax-btn" id="ax-hf-pau">Pause</button></div>';

    o.innerHTML=
      '<div class="ax-hf-top">'
        +'<button type="button" class="ax-btn ax-hf-ib" id="ax-hf-prev"'+(HF.idx<=0?' disabled':'')+'>Prev</button>'
        +'<span class="ax-hf-prog">'+(HF.idx+1)+' / '+HF.list.length+' \u00b7 '+esc(s.cat)+'</span>'
        +'<button type="button" class="ax-btn ax-hf-ib" id="ax-hf-exit">Exit</button>'
      +'</div>'
      +'<div class="ax-hf-stage">'+(isRest?'<div class="ax-hf-rnext"><small>UP NEXT \u00b7 SET '+(HF.set+1)+' OF '+s.sets+'</small><b>'+esc(s.name)+'</b><span>'+esc(s.badge)+'</span></div>':picHtml(s))+'</div>'
      +'<div class="ax-hf-info">'
        +'<h2 class="ax-hf-title">'+esc(s.name)+'</h2>'
        +'<p class="ax-hf-sub">'+esc(s.badge)+(s.note?' \u00b7 '+esc(s.note):'')+'</p>'
        +'<div class="ax-hf-sets">'+dots+'</div>'
        +timerHtml
      +'</div>'
      +'<div class="ax-hf-bar">'
        +'<button type="button" class="ax-btn ax-hf-sec" id="ax-hf-skip">'+(isRest?'Skip rest':'Skip')+'</button>'
        +'<button type="button" class="ax-btn ax-pri ax-hf-main" id="ax-hf-done">'+(isRest?'Start Set '+(HF.set+1):(HF.set<s.sets?'Done Set '+HF.set+' \u00b7 Rest':'Done \u00b7 Next'))+'</button>'
      +'</div>';

    o.querySelectorAll(".ax-exi").forEach(axExiBind);
    $("ax-hf-exit").onclick=function(){closeHF(false)};
    $("ax-hf-prev").onclick=prevStep;
    $("ax-hf-skip").onclick=function(){
      if(isRest){stopTimer();HF.set++;startWork()}else nextStep(false);
    };
    $("ax-hf-done").onclick=function(){
      if(isRest){stopTimer();HF.set++;startWork()}else advanceSet();
    };
    if(!isRest&&s.sec>0){
      startCountdown(s.sec,advanceSet);
      var pb=$("ax-hf-pau");
      if(pb)pb.onclick=function(){HF.paused=!HF.paused;pb.textContent=HF.paused?"Resume":"Pause"};
    }
    var m15=$("ax-hf-m15"),p15=$("ax-hf-p15");
    if(m15)m15.onclick=function(){HF.rem=Math.max(1,(HF.rem||0)-15);var c=$("ax-hf-clock");if(c)c.textContent=fmt(HF.rem)};
    if(p15)p15.onclick=function(){HF.rem=(HF.rem||0)+15;var c=$("ax-hf-clock");if(c)c.textContent=fmt(HF.rem)};
  }

  function startHF(dayIdx){
    if(TM){toast("Finish the active run first.");return}
    var d=dayIdx!=null?dayIdx:cur,list=getSteps(d);
    if(!list.length){toast("No exercises scheduled for this day.");return}
    unlock();wl();axGuard();
    var first=0;
    for(var i=0;i<list.length;i++){if(!st[k(d,list[i].id)]){first=i;break}}
    HF={day:d,list:list,idx:first,set:1,mode:"work",paused:false,t0:Date.now()};
    var old=$("gov");if(old)old.remove();
    var o=document.createElement("div");
    o.id="gov";o.className="ax-hf";
    document.body.appendChild(o);
    snd("start");
    var s=list[first];
    say("Starting workout. "+s.name+". "+(s.sets>1?"Set 1 of "+s.sets:s.badge));
    paintHF();
  }

  function injectBtn(){
    var eb=$("ax-edit-workout");if(!eb||$("ax-hf-launch"))return;
    if(!getSteps(cur).length)return;
    var b=document.createElement("button");
    b.type="button";b.id="ax-hf-launch";
    b.className="ax-btn ax-pri ax-hf-launch";
    b.innerHTML=ic("play","ax-ic")+'<span>Hands-free workout</span>';
    b.onclick=function(){startHF(cur)};
    eb.parentNode.insertAdjacentElement("beforebegin",b);
  }

  var _day=window.day;
  if(typeof _day==="function")window.day=function(){_day.apply(this,arguments);injectBtn()};
  window.axStartHF=startHF;
})();

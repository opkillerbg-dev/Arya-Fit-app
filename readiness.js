/* Arya Fit v65: Readiness score (0-100) on Home + non-destructive session adjustment + override.
   Standalone file. Stores only PR.rdOv (per-date override). Never writes to workoutEdits. */
(function(){
  "use strict";
  var CACHE=null,OPEN=false;      /* locks today's score/tier so finishing a workout does not flip the advice */
  var AUTO={on:false,mode:"full",day:-1};   /* read by the axEdits wrapper (no recursion into calcM) */

  function streakNow(){
    try{
      var last=-1,i,s=0;
      for(i=0;i<ND;i++){var x=st["x"+i],c=cnt(i);if(x==1)continue;if(c[0]==c[1]||x==2)last=i}
      for(var j=last;j>=0;j--){var xj=st["x"+j];if(xj==1)continue;if(dayDone(j)||xj==2)s++;else break}
      for(var q=last+1;q<=todayIdx()-1;q++)if(st["x"+q]!=1&&st["x"+q]!=2){s=0;break}
      return s;
    }catch(e){return 0}
  }

  function calc(){
    var today=ymd(),td=todayIdx(),di=Dn();
    var br=(PR.brain&&PR.brain[today])||{},rd=(PR.rd&&PR.rd[td])||{};
    var slp=br.s!=null?br.s:(rd.s!=null?rd.s:null);
    var eng=br.e!=null?br.e:(rd.e!=null?rd.e:null);
    var bSore=br.o!=null?br.o:0;
    var checked=(slp!=null&&eng!=null);

    var R=calcM(),keys=Object.keys(R),soreCnt=0,loadSum=0;
    keys.forEach(function(k){if(R[k].s)soreCnt++;loadSum+=R[k].f||0});
    var avgLoad=keys.length?loadSum/keys.length:0;

    var ds=PR.ds||{},sg=sgoal(),stp3=0,stpDays=0,now=new Date();
    for(var d=0;d<3;d++){
      var ky=ymdOf(new Date(now.getFullYear(),now.getMonth(),now.getDate()-d));
      var v=(d===0&&SS&&SS.today)?Math.max(ds[ky]||0,SS.today):(ds[ky]||0);
      if(v>0){stp3+=v;stpDays++}
    }
    var avgStp=stpDays?Math.round(stp3/stpDays):0;

    var runKm3=0,runHard=0;
    for(var r=Math.max(0,di-2);r<=di;r++){
      var km=(st["g"+r]||0)/1000;
      runKm3+=km;
      if(r===di-1&&km>=(JKM||3.5)*0.9)runHard=1;
    }
    var strk=streakNow();

    var score=72;
    if(slp===0)score-=22; else if(slp===2)score+=12;
    if(eng===0)score-=20; else if(eng===2)score+=12;
    if(bSore===1)score-=10; else if(bSore===2)score-=24;
    score-=Math.min(24,soreCnt*8+Math.round(avgLoad*14));
    if(runHard)score-=6;
    if(avgStp>sg*1.35)score-=5; else if(avgStp>=sg*0.6)score+=4;
    if(strk>=2&&strk<=6)score+=4; else if(strk>=10)score-=4;
    score=Math.max(5,Math.min(100,Math.round(score)));
    var tier=score>=75?"full":score>=45?"light":"rest";

    var sig=[slp,eng,bSore,soreCnt].join(",");
    if(CACHE&&CACHE.d===today&&CACHE.sig===sig){score=CACHE.score;tier=CACHE.tier}
    else CACHE={d:today,sig:sig,score:score,tier:tier};

    /* Only adjust the plan when the person has answered sleep + energy. */
    var rec=checked?tier:"full";
    var ov=(PR.rdOv&&PR.rdOv[today])||null;
    if(ov!=="full"&&ov!=="light"&&ov!=="rest")ov=null;
    var active=ov||rec;

    var si=axSrc(di),t=si<0?{r:true,x:[]}:T[wdk(si)];
    var isRest=!!t.r,sentence;
    if(isRest)sentence="Today is a planned recovery day. Rest up and recharge.";
    else if(ov)sentence="You chose "+ov.toUpperCase()+" for today (recommended: "+rec.toUpperCase()+").";
    else if(!checked)sentence="Answer the Smart Today check-in below to tune today's session.";
    else if(active==="full")sentence="Recovery looks good. Today's session stays at full volume.";
    else if(active==="light"){
      var wl=slp===0?"short sleep":eng===0?"low energy":(soreCnt||bSore)?"muscle soreness":"recent training load";
      sentence="Eased: 1 fewer set per strength exercise because of "+wl+".";
    }else{
      var wr=(slp===0&&eng===0)?"poor sleep and low energy":(bSore===2||soreCnt>=2)?"high soreness":"low readiness";
      sentence="Easy day: 1 set per strength exercise because of "+wr+". A walk instead of a run is fine.";
    }
    return {score:score,tier:tier,rec:rec,active:active,ov:ov,sentence:sentence,checked:checked,
            soreCnt:soreCnt,avgStp:avgStp,runKm3:runKm3,strk:strk,isRest:isRest};
  }

  /* Non-destructive adjustment: today's workout is shown trimmed; stored plan/edits are untouched.
     The person's own +/- edits (stored in workoutEdits) always win, field by field. */
  var _axEdits=window.axEdits;
  if(typeof _axEdits==="function"){
    window.axEdits=function(){
      var base=_axEdits();
      if(!AUTO.on||AUTO.mode==="full"||AUTO.day<0)return base;
      try{
        var di=AUTO.day,si=axSrc(di);if(si<0)return base;
        var t=T[wdk(si)];if(!t||!t.x||!t.x.length||t.c)return base;
        var key=String(di),man=base[key]||{},day={};
        t.x.forEach(function(e,k){
          if(!(e[1]>0))return;                         /* timed/count exercises stay as planned */
          var m=man[k]||{},o={};
          o.sets=Number.isFinite(m.sets)?m.sets:(AUTO.mode==="light"?Math.max(1,e[1]-1):1);
          if(Number.isFinite(m.reps))o.reps=m.reps;
          else if(AUTO.mode==="rest"&&/^\d+$/.test(String(e[2])))o.reps=Math.max(4,Math.round(parseInt(e[2],10)*0.7));
          day[k]=o;
        });
        var out=Object.create(base);out[key]=day;return out;
      }catch(err){return base}
    };
  }

  function render(){
    try{
      var hb=$("ax-hbrain");if(!hb||!hb.parentNode)return;
      var box=$("ax-readiness-card");
      if(!box){
        box=document.createElement("div");box.id="ax-readiness-card";box.className="ax-card ax-rd-card";
        hb.parentNode.insertBefore(box,hb);
      }
      var r=calc();
      var nOn=!r.isRest&&(r.checked||!!r.ov),nDay=Dn();
      var changed=AUTO.on!==nOn||AUTO.mode!==r.active||AUTO.day!==nDay;
      AUTO.on=nOn;AUTO.mode=r.active;AUTO.day=nDay;

      var col=r.score>=75?"var(--ok)":r.score>=45?"var(--sun)":"#d0432f";
      var modes=[["full","Full"],["light","Light"],["rest","Easy"]];
      var pills=modes.map(function(m){
        var on=r.active===m[0];
        return '<button type="button" class="ax-br-opt'+(on?' on':'')+'" data-rd-m="'+m[0]+'" aria-pressed="'+on+'">'+m[1]+(r.checked&&r.tier===m[0]&&!r.ov?' ★':'')+'</button>';
      }).join("");
      var C=2*Math.PI*26;
      var meta='<div class="ax-rd-meta"><span>'+(r.checked?'Check-in ✓':'Check-in pending')+'</span><span>'+r.soreCnt+' sore</span><span>'+(r.avgStp?r.avgStp.toLocaleString()+' steps/day':'no steps yet')+'</span><span>'+r.runKm3.toFixed(1)+' km (3d)</span><span>'+r.strk+'d streak</span></div>';
      var ovh=!r.isRest?'<div class="ax-rd-ov"><span class="ax-cap">TODAY\'S SESSION · TAP TO OVERRIDE</span><div class="ax-br-options">'+pills+'</div>'+(r.ov?'<button type="button" class="ax-rd-rst" id="ax-rd-reset">Back to recommended ('+r.rec.toUpperCase()+')</button>':'')+'</div>':'';
      box.innerHTML=
        '<div class="ax-rd-top"><div class="ax-rd-gauge"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="ax-rdt" cx="32" cy="32" r="26"/><circle class="ax-rdb" cx="32" cy="32" r="26" style="stroke:'+col+';stroke-dasharray:'+C.toFixed(1)+';stroke-dashoffset:'+(C*(1-r.score/100)).toFixed(1)+'"/></svg><b>'+r.score+'</b></div>'
        +'<div class="ax-rd-copy"><span class="ax-rd-k">READINESS · 0–100</span><p class="ax-rd-one">'+esc(r.sentence)+'</p></div></div>'
        +'<details class="ax-rd-more"'+(OPEN?' open':'')+'><summary>'+(r.ov?'Override: '+r.ov.toUpperCase()+' · details':'Details'+(r.isRest?'':' and override'))+'</summary>'+meta+ovh+'</details>';
      var dt=box.querySelector("details");
      if(dt)dt.addEventListener("toggle",function(){OPEN=dt.open});
      box.querySelectorAll("[data-rd-m]").forEach(function(b){
        b.onclick=function(){
          var m=b.getAttribute("data-rd-m"),today=ymd(),o=PR.rdOv=PR.rdOv||{};
          if(m===r.rec)delete o[today];else o[today]=m;
          var ks=Object.keys(o).sort();while(ks.length>60)delete o[ks.shift()];
          save();hx("tick");refresh();
          toast(m==="full"?"Full session":m==="light"?"Light session: 1 fewer set":"Easy session: 1 set each");
        };
      });
      var rst=$("ax-rd-reset");
      if(rst)rst.onclick=function(){delete (PR.rdOv||{})[ymd()];save();hx("tick");refresh()};
      return changed;
    }catch(err){try{console.error("readiness",err)}catch(e){}}
  }

  function refresh(){
    render();
    try{if(typeof day==="function")day()}catch(e){}
    try{if(typeof home==="function")home()}catch(e){}
  }

  /* Re-render with Smart Today (home() calls smartBrainUI() on every refresh). */
  var _sb=window.smartBrainUI;
  if(typeof _sb==="function"){
    window.smartBrainUI=function(){
      /* update the adjustment state BEFORE Home rows are drawn */
      var ret=_sb.apply(this,arguments);
      var ch=render();
      if(ch){try{if(typeof day==="function")day()}catch(e){}}
      return ret;
    };
  }

  window.axReadiness={calc:calc,render:render};
  function boot(){var ch=render();if(ch){try{day()}catch(e){}try{home()}catch(e){}}}
  if(document.readyState!=="loading")boot();else document.addEventListener("DOMContentLoaded",boot);
})();

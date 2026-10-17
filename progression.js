/* Arya Fit v68: 1-tap set logging, auto-progression hint, PR pills, deload hint.
   Reads PR.reps (manual rep log, unchanged) and PR.setLog (new: {exercise:{dayIdx:[reps per set]}}).
   Never writes workoutEdits except the same {sets,reps} shape the Edit sheet uses, and only when the person taps a hint. */
(function(){
  "use strict";
  function num(x){return typeof x==="number"&&isFinite(x)}
  function parseTarget(badge){
    var s=String(badge||""),sets=1,reps=10,isSec=false,m=/^(\d+)\s*\u00d7\s*(.+)$/.exec(s);
    if(m){sets=+m[1]||1;s=m[2].trim()}
    var rm=/^(\d+)\s*-\s*(\d+)/.exec(s);
    if(rm)reps=+rm[2]||10;
    else{var sm=/^(\d+)\s*s\b/i.exec(s);if(sm){reps=+sm[1]||30;isSec=true}else{var nm=/^(\d+)/.exec(s);if(nm)reps=+nm[1]||10}}
    return{sets:Math.max(1,Math.min(10,sets)),reps:Math.max(1,reps),isSec:isSec}
  }
  function dayBests(name){
    var map={};
    ((PR.reps&&PR.reps[name])||[]).forEach(function(e){if(Array.isArray(e)&&num(e[0])&&num(e[1])&&e[1]>0)map[e[0]]=Math.max(map[e[0]]||0,e[1])});
    var S=(PR.setLog&&PR.setLog[name])||{};
    Object.keys(S).forEach(function(d){var mx=Math.max.apply(0,[0].concat(S[d]||[]));if(mx>0)map[+d]=Math.max(map[+d]||0,mx)});
    return map
  }
  function analyze(name,cur,tSets,tReps){
    var map=dayBests(name),days=Object.keys(map).map(Number),best=0,prev=0;
    days.forEach(function(d){var v=map[d];if(v>best)best=v;if(d<cur&&v>prev)prev=v});
    var today=((PR.setLog&&PR.setLog[name]&&PR.setLog[name][cur])||[]).filter(function(v){return v>0});
    var todayMax=today.length?Math.max.apply(0,today):0;
    var past=days.filter(function(d){return d<cur}).sort(function(a,b){return a-b});
    var lastBest=past.length?map[past[past.length-1]]:0;
    var cw=Math.floor(cur/7),wk={};
    past.forEach(function(d){var w=Math.floor(d/7);wk[w]=Math.max(wk[w]||0,map[d])});
    var stalled=cw>=2&&wk[cw-1]>0&&wk[cw-2]>0&&wk[cw-1]<=wk[cw-2];
    var hit=today.length>=tSets&&today.slice(0,tSets).every(function(v){return v>=tReps});
    return{best:best,prev:prev,isPR:todayMax>0&&prev>0&&todayMax>prev,stalled:stalled,
      readyUp:hit||(lastBest>=tReps&&!stalled),nextReps:tReps+(tReps>=20?2:1),
      dSets:Math.max(1,tSets-1),dReps:Math.max(4,Math.round(tReps*.8))}
  }
  function setEdit(dayIdx,exIdx,sets,reps,msg){
    var pe=axPlan();if(!pe)return;
    pe.workoutEdits=pe.workoutEdits||{};
    var d=pe.workoutEdits[String(dayIdx)]=pe.workoutEdits[String(dayIdx)]||{};
    d[exIdx]={sets:Math.max(1,Math.min(10,sets)),reps:Math.max(1,Math.min(50,reps))};
    save();hx("ok");render();toast(msg)
  }
  function inject(){
    var el=$("ax-day");if(!el||typeof items!=="function")return;
    var dIdx=cur,list=items(dIdx);
    PR.setLog=PR.setLog&&typeof PR.setLog==="object"?PR.setLog:{};
    el.querySelectorAll(".ax-prog-strip").forEach(function(x){x.remove()});
    el.querySelectorAll(".ax-pr-pill").forEach(function(x){x.remove()});
    el.querySelectorAll(".ax-row").forEach(function(row){
      var inp=row.querySelector("input[data-id]");if(!inp)return;
      var id=inp.getAttribute("data-id");if(!/^e\d+$/.test(id))return;
      var item=null;for(var i=0;i<list.length;i++)if(list[i][1]===id){item=list[i];break}
      if(!item||item[0]!=="Strength")return;
      var name=item[2],tg=parseTarget(item[3]),exIdx=+id.slice(1),u=tg.isSec?"s":"";
      var arr=(PR.setLog[name]&&PR.setLog[name][dIdx])||[];
      var info=analyze(name,dIdx,tg.sets,tg.reps);
      var tb=row.querySelector(".ax-tx b");
      if(tb&&info.best>0){var p=document.createElement("span");p.className="ax-pr-pill"+(info.isPR?" is-new":"");p.textContent=(info.isPR?"\u2605 NEW PR ":"PR ")+info.best+u;tb.appendChild(p)}
      var strip=document.createElement("div");strip.className="ax-prog-strip";
      var chips="";
      for(var s=0;s<tg.sets;s++){var v=arr[s]||0;
        chips+='<button type="button" class="ax-set-chip'+(v>0?" done":"")+'" data-s="'+s+'">'+(v>0?"S"+(s+1)+": "+v+u:"Set "+(s+1)+" \u00b7 "+tg.reps+u)+'</button>'}
      var nudge="",ed=(axEdits()[String(dIdx)]||{})[exIdx];
      if(ed&&(num(ed.sets)||num(ed.reps))){}
      else if(info.stalled)nudge='<div class="ax-prog-nudge warn"><span>No gain for 2 weeks</span><button type="button" class="ax-nudge-btn" data-act="d">Deload '+info.dSets+"\u00d7"+info.dReps+'</button></div>';
      else if(info.readyUp)nudge='<div class="ax-prog-nudge up"><span>Target hit</span><button type="button" class="ax-nudge-btn" data-act="u">Try '+tg.sets+"\u00d7"+info.nextReps+'</button></div>';
      strip.innerHTML='<div class="ax-set-row"><span class="ax-set-lbl">1-TAP SETS</span><div class="ax-set-chips">'+chips+'</div></div>'+nudge;
      row.insertAdjacentElement("afterend",strip);
      strip.querySelectorAll(".ax-set-chip").forEach(function(b){b.onclick=function(e){
        e.preventDefault();e.stopPropagation();
        var ix=+b.getAttribute("data-s"),a=((PR.setLog[name]&&PR.setLog[name][dIdx])||[]).slice();
        while(a.length<tg.sets)a.push(0);
        var v=a[ix]||0;
        /* tap cycle: target, target+1, target-1, clear */
        a[ix]=v===0?tg.reps:v===tg.reps?tg.reps+1:v===tg.reps+1?Math.max(1,tg.reps-1):0;
        if(a.every(function(x){return !x}))delete PR.setLog[name][dIdx];
        else{PR.setLog[name]=PR.setLog[name]||{};PR.setLog[name][dIdx]=a}
        if(!Object.keys(PR.setLog[name]||{}).length)delete PR.setLog[name];
        var after=analyze(name,dIdx,tg.sets,tg.reps);
        if(after.isPR&&a[ix]>info.prev){toast("New PR on "+name+": "+a[ix]+(tg.isSec?"s":" reps"));hx("finish")}else hx(a[ix]>0?"ok":"tick");
        save();
        var all=a.slice(0,tg.sets).every(function(x){return x>0});
        if(all&&!st[k(dIdx,id)]){inp.checked=true;inp.dispatchEvent(new Event("change"))}
        inject()
      }});
      var nb=strip.querySelector(".ax-nudge-btn");
      if(nb)nb.onclick=function(e){e.preventDefault();e.stopPropagation();
        if(nb.getAttribute("data-act")==="d")setEdit(dIdx,exIdx,info.dSets,info.dReps,name+": deload "+info.dSets+"\u00d7"+info.dReps);
        else setEdit(dIdx,exIdx,tg.sets,info.nextReps,name+": "+tg.sets+"\u00d7"+info.nextReps)}
    })
  }
  function prPanel(){
    var host=$("ax-ps-badges");if(!host)return;
    var old=$("ax-pr-panel");if(old)old.remove();
    var names=rnames();if(!names.length)return;
    var cnt=0,cards=names.map(function(n){
      var best=0,m=dayBests(n);Object.keys(m).forEach(function(d){if(m[d]>best)best=m[d]});
      if(best>0)cnt++;
      return'<div class="bdg'+(best>0?" on":"")+'"><svg class="i"><use href="#i-trophy"/></svg>'+esc(n)+'<br><small>'+(best>0?"PR "+best:"No PR yet")+'</small></div>'}).join("");
    var w=document.createElement("div");w.id="ax-pr-panel";w.className="panel";
    w.innerHTML='<h3 style="margin-top:0">Exercise PRs '+cnt+"/"+names.length+'</h3><div class="bgs">'+cards+'</div><p class="key">Tap the 1-tap set chips in Plan to log reps.</p>';
    host.appendChild(w)
  }
  var _day=window.day;if(typeof _day==="function")window.day=function(){_day.apply(this,arguments);inject()};
  var _pg=window.axPg;if(typeof _pg==="function")window.axPg=function(){_pg.apply(this,arguments);prPanel()};
  var _sh=window.axShiftSt;
  if(typeof _sh==="function")window.axShiftSt=function(at){
    _sh.apply(this,arguments);
    if(!PR.setLog||typeof PR.setLog!=="object")return;
    Object.keys(PR.setLog).forEach(function(nm){var m=PR.setLog[nm],o={};if(!m||typeof m!=="object")return;
      Object.keys(m).forEach(function(d){var n=+d;if(/^\d+$/.test(d)&&n>=at)o[String(n+1)]=m[d];else o[d]=m[d]});PR.setLog[nm]=o});
    save()
  };
  try{if(typeof day==="function"&&$("ax-day")&&$("ax-day").children.length)inject()}catch(e){}
})();

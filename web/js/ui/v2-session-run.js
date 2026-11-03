/* Arya Fit V2 P3 — Session + Run presentation only; original timer/set/GPS handlers remain authoritative. */
(function(w,d){
  "use strict";
  var root=d.documentElement,day=d.getElementById("ax-day"),run=d.getElementById("ax-v-timers"),dock=d.getElementById("dock");
  var hero=null,mapCard=null,mapSvg=null,historyCard=null,observer=null,runObserver=null,frame=0,lastMapCount=-1;
  function $(id){return d.getElementById(id)}
  function active(){return root.classList.contains("v2")}
  function text(n){return n?String(n.textContent||"").trim():""}
  function safe(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
  function dayItems(){try{return typeof items==="function"?items(typeof cur==="number"?cur:0):[]}catch(e){return[]}}
  function dayName(){var n=dayItems(),i;for(i=0;i<n.length;i++)if(/^e\d+$/.test(n[i][1]))return n[i][2];return""}
  function exerciseData(name){
    try{var slug=exSlug(name),letters=EXI[slug]||"";return{slug:slug,letters:letters,src:letters?IMX+"arya-ex-"+slug+"-"+letters.charAt(0)+".webp":""}}catch(e){return{slug:"",letters:"",src:""}}
  }
  function addHero(){
    if(!day)return;
    if(!hero){hero=d.createElement("section");hero.className="v2-session-hero";hero.setAttribute("aria-label","Current workout exercise");}
    if(hero.parentNode!==day)day.insertBefore(hero,day.firstChild);
    var n=dayItems(),name="",target="",sets=0,done=0,idx=-1,i;
    for(i=0;i<n.length;i++){
      if(/^e\d+$/.test(n[i][1])&&!st[k(cur,n[i][1])]){idx=i;name=n[i][2];target=n[i][3]||"";break}
    }
    if(idx<0){for(i=0;i<n.length;i++)if(/^e\d+$/.test(n[i][1])){name=n[i][2];target=n[i][3]||"";idx=i;break}}
    var m=/^(\d+)\s*[x×]/i.exec(target);sets=m?+m[1]:1;
    try{var logs=PR.setLog&&PR.setLog[name]&&PR.setLog[name][cur]||[];for(i=0;i<logs.length;i++)if(logs[i]>0)done++}catch(e){}
    var reps=(target.match(/(?:x|×)\s*(\d+)|^(\d+)(?=\s*(?:-|s\b|$))/i)||[]),rep=reps[1]||reps[2]||target;
    var data=exerciseData(name),letter=data.letters?data.letters.charAt(frame%data.letters.length):"";
    var src=data.letters?IMX+"arya-ex-"+data.slug+"-"+letter+".webp":"";
    hero.innerHTML='<div class="v2-session-picture">'+(src?'<img src="'+safe(src)+'" alt="'+safe(name)+'" width="1024" height="1024" loading="lazy" decoding="async">':'<span class="v2-session-picture-fallback" aria-hidden="true">AF</span>')+
      (data.letters.length>1?'<button type="button" class="v2-session-frame" aria-label="Show next exercise position">A / B</button>':"")+'</div>'+
      '<div class="v2-session-lockup"><p class="v2-session-eyebrow">SET '+Math.min(done+1,Math.max(1,sets))+' OF '+Math.max(1,sets)+'</p><h2>'+safe(name||"Your session")+'</h2><div class="v2-session-number"><strong>'+safe(rep||"—")+'</strong><span>'+(/(?:s|min)\b/i.test(String(target))?"TIME":"REPS")+'</span></div><div class="v2-session-quick"><button type="button" class="v2-session-hf">Hands-free</button><button type="button" class="v2-session-voice" aria-pressed="'+(PR&&PR.voi!==0?'true':'false')+'">Voice '+(PR&&PR.voi!==0?'On':'Off')+'</button></div></div>';
    var flip=hero.querySelector(".v2-session-frame");if(flip)flip.onclick=function(){frame++;addHero()};
    var hf=hero.querySelector(".v2-session-hf"),voice=hero.querySelector(".v2-session-voice");
    if(hf)hf.onclick=function(){var b=$("ax-hf-launch");if(b)b.click();else if(typeof w.axStartHF==="function")w.axStartHF(cur)};
    if(voice)voice.onclick=function(){PR.voi=PR.voi===0?1:0;save();voice.textContent="Voice "+(PR.voi?"On":"Off");voice.setAttribute("aria-pressed",PR.voi?"true":"false")};
  }
  function enhanceDay(){
    if(!active()||!day||day.hidden)return;
    addHero();
    day.classList.add("v2-session-ready");
  }
  function routePoints(){
    try{
      var pts=w.TM&&w.TM.rt||[],out=[],i,lat0,lon0,scale=1,minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
      if(pts.length<2)return"";
      lat0=pts[0][0]*Math.PI/180;
      var stride=Math.max(1,Math.ceil(pts.length/200));
      for(i=0;i<pts.length;i+=stride){var x=(pts[i][1]-pts[0][1])*Math.cos(lat0),y=-(pts[i][0]-pts[0][0]);out.push([x,y]);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}
      if(pts.length>1&&stride>1){i=pts.length-1;var lx=(pts[i][1]-pts[0][1])*Math.cos(lat0),ly=-(pts[i][0]-pts[0][0]);out.push([lx,ly]);minX=Math.min(minX,lx);maxX=Math.max(maxX,lx);minY=Math.min(minY,ly);maxY=Math.max(maxY,ly)}
      scale=Math.min(260/Math.max(.00001,maxX-minX),150/Math.max(.00001,maxY-minY));
      return out.map(function(p){return(20+(p[0]-minX)*scale).toFixed(1)+","+(18+(p[1]-minY)*scale).toFixed(1)}).join(" ");
    }catch(e){return""}
  }
  function ensureMap(){
    if(!run)return;
    if(!mapCard){mapCard=d.createElement("section");mapCard.className="v2-run-map-card";mapCard.innerHTML='<div class="v2-run-map-head"><b>LIVE ROUTE</b><span id="v2-run-map-state">Waiting for GPS</span></div><svg viewBox="0 0 300 190" role="img" aria-label="GPS route map"><polyline id="v2-run-route" points="" /></svg><p>GPS route appears here while tracking is active.</p>';}
    var panel=$("tvpanel");if(panel&&mapCard.parentNode!==run)run.insertBefore(mapCard,panel.nextSibling);
    mapSvg=mapCard.querySelector("#v2-run-route");
    if(!historyCard){historyCard=d.createElement("section");historyCard.className="v2-run-history";historyCard.innerHTML='<div class="v2-run-history-head"><h2>Run history</h2><span>RECENT</span></div><div class="v2-run-history-list"></div>';}
    if(mapCard.parentNode===run&&historyCard.parentNode!==run)mapCard.parentNode.insertBefore(historyCard,mapCard.nextSibling);
  }
  function updateHistory(){
    if(!historyCard)return;
    var list=historyCard.querySelector(".v2-run-history-list"),rows=[],i,data,sum,pace;
    try{if(w.AxRunSum&&typeof w.AxRunSum.data==="function")for(i=(w.ND||28)-1;i>=0&&rows.length<5;i--){data=w.AxRunSum.data(i);if(!data||!data.sum)continue;sum=data.sum;pace=sum.d>100?fmt(sum.s/(sum.d/1000)):"--";rows.push('<div class="v2-run-history-row"><span class="v2-run-history-mark" aria-hidden="true">↗</span><span class="v2-run-history-copy"><b>'+safe(data.date||("Day "+(i+1)))+'</b><small>'+((sum.d||0)/1000).toFixed(2)+' km · '+safe(fmt(sum.s||0))+'</small></span><strong>'+safe(pace)+'</strong></div>')}}
    catch(e){}
    list.innerHTML=rows.length?rows.join(""):'<p class="v2-run-history-empty">Your saved runs will appear here.</p>';
  }
  function updateMap(){
    if(!active()||!run||run.hidden)return;
    ensureMap();
    var count=w.TM&&w.TM.rt?w.TM.rt.length:0;
    if(count===lastMapCount)return;
    lastMapCount=count;
    var pts=routePoints(),state=$("v2-run-map-state");
    if(mapSvg)mapSvg.setAttribute("points",pts);
    if(state)state.textContent=w.TM&&w.TM.trk?(pts?"GPS route active":"Finding GPS…"):"Route preview";
    mapCard.classList.toggle("has-route",!!pts);
  }
  function visibleRun(){
    if(!active()||!run||run.hidden)return;
    run.classList.add("v2-run-ready");ensureMap();updateMap();updateHistory();
  }
  function clearV2(){
    if(hero&&hero.parentNode)hero.parentNode.removeChild(hero);
    if(mapCard&&mapCard.parentNode)mapCard.parentNode.removeChild(mapCard);
    if(historyCard&&historyCard.parentNode)historyCard.parentNode.removeChild(historyCard);
    if(day)day.classList.remove("v2-session-ready");
    if(run)run.classList.remove("v2-run-ready");
    mapSvg=null;lastMapCount=-1;
  }
  function bind(){
    if(day&&!observer){observer=new MutationObserver(function(){if(active()&&!day.hidden)enhanceDay()});observer.observe(day,{childList:true})}
    if(run&&!runObserver){runObserver=new MutationObserver(function(){if(active()&&!run.hidden)visibleRun()});runObserver.observe(run,{attributes:true,attributeFilter:["hidden"]})}
    var dockObserver=new MutationObserver(function(){if(active()&&dock&&!dock.hidden)updateMap()});
    if(dock)dockObserver.observe(dock,{attributes:true,childList:true,subtree:true,characterData:true});
    d.addEventListener("click",function(e){
      if(!active())return;
      if(e.target.closest&&e.target.closest("#ax-v-plan"))w.setTimeout(enhanceDay,30);
      if(e.target.closest&&e.target.closest("#ax-v-timers"))w.setTimeout(visibleRun,30);
    });
    if(w.AxV2&&typeof w.AxV2.apply==="function"){
      var old=w.AxV2.apply;
      w.AxV2.apply=function(){var r=old.apply(this,arguments);if(active()){enhanceDay();visibleRun()}else clearV2();return r};
    }
    enhanceDay();visibleRun();
  }
  if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",bind);else bind();
})(window,document);

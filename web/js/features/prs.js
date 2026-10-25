/* Strava-style best efforts and PRs. Efforts come from AxRun.bestEfforts (stored per run as `be`; older runs are rebuilt from their saved route).
   Rank is all-time across every plan: 1 = PR, then 2nd and 3rd. */
(function(){
  var LAB={400:"400 m",805:"½ mile",1000:"1 km",1609:"1 mile",3219:"2 mile",5000:"5 km",10000:"10 km",15000:"15 km",16093:"10 mile",20000:"20 km",21097:"Half marathon",42195:"Marathon"};
  var CSS=".pr-row{display:flex;align-items:center;gap:10px;padding:9px 2px;border-bottom:1px solid var(--line)}.pr-row:last-child{border-bottom:0}"+
    ".pr-row>span:nth-child(2){text-align:right;min-width:128px}.pr-d{flex:1;font-weight:700;color:var(--ink)}.pr-t{font-weight:800;font-size:16px;color:var(--ink);font-variant-numeric:tabular-nums}"+
    ".pr-s{font-size:12px;color:var(--mut)}.pr-b{display:inline-block;min-width:34px;text-align:center;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:800;color:#fff;background:var(--mut)}"+
    ".pr-b.r1{background:#c9971c}.pr-b.r2{background:#8f99a4}.pr-b.r3{background:#a8643a}.pr-b.f{background:var(--cell);color:var(--ink);border:1px solid var(--line)}"+
    ".pr-g{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0 10px}.pr-g div{background:var(--cell);border:1px solid var(--line);border-radius:14px;padding:10px 12px}"+
    ".pr-g b{display:block;font-size:19px;color:var(--ink);font-variant-numeric:tabular-nums}.pr-g i{font-style:normal;font-size:12px;color:var(--mut)}";
  function css(){if(document.getElementById("ax-pr-css"))return;var s=document.createElement("style");s.id="ax-pr-css";s.textContent=CSS;document.head.appendChild(s)}
  function E(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function pace(s,D){return D>=100&&s>0?fmt(s/(D/1000))+" /km":""}
  function when(r){if(r.t>0)try{return new Date(r.t).toLocaleDateString([],{month:"short",day:"numeric"})}catch(e){}return "Day "+(r.dy+1)}
  /* every run in every plan that has efforts: {pid,dy,src,i,t,be}. src r = saved summary, q = route only (older runs) */
  function allRuns(){
    var out=[];if(!window.AxRun||!window.APP||!APP.plans)return out;
    Object.keys(APP.plans).forEach(function(pid){
      var p=APP.plans[pid]||{},rs=p.rsum||{},rt=p.routes||{};
      Object.keys(rs).forEach(function(dy){var a=rs[dy];if(!Array.isArray(a))return;
        a.forEach(function(r,i){var be=r&&r.be;
          if(!be&&Array.isArray(rt[dy])&&rt[dy].length===a.length){be=AxRun.bestEfforts(rt[dy][i]);if(!Object.keys(be).length)be=null}
          if(be)out.push({pid:pid,dy:+dy,src:"r",i:i,t:r.t||0,be:be})})});
      Object.keys(rt).forEach(function(dy){if(rs[dy]&&rs[dy].length)return;var a=rt[dy];if(!Array.isArray(a))return;
        a.forEach(function(pts,i){var be=AxRun.bestEfforts(pts);if(Object.keys(be).length)out.push({pid:pid,dy:+dy,src:"q",i:i,t:0,be:be})})})});
    return out}
  /* {meters:[{s,r}] fastest first} */
  function table(){
    var runs=allRuns(),T={};
    AxRun.EFFORTS.forEach(function(D){var a=[];runs.forEach(function(r){var s=r.be[D];if(s>0)a.push({s:s,r:r})});
      a.sort(function(x,y){return x.s-y.s||x.r.t-y.r.t});if(a.length)T[D]=a});
    return T}
  function ident(dy){
    var pid=APP.active,rs=window.axRsum?axRsum()[dy]:null,rt=window.axRoutes?axRoutes()[dy]:null;
    if(rs&&rs.length)return{pid:pid,dy:dy,src:"r",i:rs.length-1};
    if(rt&&rt.length)return{pid:pid,dy:dy,src:"q",i:rt.length-1};
    return null}
  /* this run's efforts with their all-time rank */
  function forRun(dy,T){
    var id=ident(dy),out=[];if(!id)return out;T=T||table();
    Object.keys(T).forEach(function(D){var a=T[D];
      for(var k=0;k<a.length;k++){var r=a[k].r;
        if(r.pid===id.pid&&r.dy===id.dy&&r.src===id.src&&r.i===id.i){
          out.push({D:+D,s:a[k].s,rank:k+1,n:a.length,delta:k===0&&a.length>1?a[1].s-a[0].s:0});break}}});
    out.sort(function(x,y){return x.D-y.D});return out}
  function badge(e){
    if(e.rank===1)return e.n>1?'<span class="pr-b r1">PR</span>':'<span class="pr-b f">First</span>';
    if(e.rank===2)return'<span class="pr-b r2">2nd</span>';
    if(e.rank===3)return'<span class="pr-b r3">3rd</span>';
    return""}
  /* "PR 5 km" pills for the hero of the run summary: only efforts that beat an earlier best */
  function pills(D){
    var h="";try{forRun(D.dy).filter(function(e){return e.rank===1&&e.delta>0}).sort(function(a,b){return b.D-a.D}).slice(0,2)
      .forEach(function(e){h+='<span class="rs-pill g">PR '+E(LAB[e.D])+'</span>'})}catch(x){}
    return h}
  function section(D){
    try{var ef=forRun(D.dy);if(!ef.length)return"";css();
      var h='<div class="rs-sec">Best efforts</div><div>';
      ef.forEach(function(e){h+='<div class="pr-row"><span class="pr-d">'+E(LAB[e.D])+'</span>'+
        '<span><span class="pr-t">'+fmt(e.s)+'</span><br><span class="pr-s">'+(e.delta>0?'−'+fmt(e.delta)+' vs old PR · ':'')+E(pace(e.s,e.D))+'</span></span>'+badge(e)+'</div>'});
      return h+'</div>'}catch(x){return""}}
  var PREF=[1000,1609,5000,10000,400,805,3219,15000,16093,20000,21097,42195];
  function card(){
    var rh=document.getElementById("rhist");if(!rh||document.getElementById("ax-prcard"))return;
    var T=table(),keys=PREF.filter(function(D){return T[D]}).slice(0,4);if(!keys.length)return;css();
    var h='<h3 style="margin-top:0">Best efforts</h3><div class="pr-g">';
    keys.forEach(function(D){var b=T[D][0];h+='<div><b>'+fmt(b.s)+'</b><i>'+E(LAB[D])+' · '+E(when(b.r))+'</i></div>'});
    h+='</div><button class="btn" data-prs="1">All best efforts</button>';
    var c=document.createElement("div");c.className="panel";c.id="ax-prcard";c.innerHTML=h;rh.parentNode.insertBefore(c,rh)}
  function openAll(){
    if(!window.axSheet)return;css();var T=table(),h="",any=0;
    AxRun.EFFORTS.forEach(function(D){var a=T[D];if(!a)return;any=1;
      h+='<div class="pr-row"><span class="pr-d">'+E(LAB[D])+'</span><span><span class="pr-t">'+fmt(a[0].s)+'</span><br><span class="pr-s">'+E(pace(a[0].s,D))+' · '+E(when(a[0].r))+'</span></span><span class="pr-b r1">PR</span></div>';
      for(var k=1;k<Math.min(3,a.length);k++)h+='<div class="pr-row" style="padding:3px 2px 3px 18px"><span class="pr-d pr-s">'+(k+1)+(k===1?"nd":"rd")+'</span><span class="pr-s">'+fmt(a[k].s)+' · '+E(when(a[k].r))+'</span></div>'});
    axSheet("Best efforts",any?h+'<p class="pr-s" style="margin-top:12px">Fastest time over each distance inside any run, pauses excluded. Older runs use their saved route, so they are approximate.</p>':'<p class="pr-s">No efforts yet. Finish a GPS run of at least 400 m.</p>')}
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-prs]");if(b){e.preventDefault();e.stopPropagation();openAll()}},true);
  var _pr=window.prog;
  if(typeof _pr==="function")window.prog=function(){var r=_pr.apply(this,arguments);try{card()}catch(e){}return r};
  window.AxPR={table:table,forRun:forRun,pills:pills,section:section,openAll:openAll,allRuns:allRuns,LAB:LAB};
})();

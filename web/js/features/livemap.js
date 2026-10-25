/* Live route map in the run panel: offline SVG trace of the last ~1.2 km, with your position. No tiles, no network. */
(function(){
  var el=null,lastKey="";
  function host(){
    if(el&&el.isConnected)return el;
    var g=document.getElementById("gmsg");if(!g||!g.parentNode)return null;
    el=document.createElement("div");el.id="ax-lmap";el.hidden=true;el.style.cssText="margin-top:8px";
    g.parentNode.insertBefore(el,g.nextSibling);return el}
  function dm(a,b){var R=6371000,r=Math.PI/180,dl=(b[0]-a[0])*r,dn=(b[1]-a[1])*r,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dn/2)*Math.sin(dn/2);return 2*R*Math.asin(Math.sqrt(x))}
  /* pts: [[lat,lon,t],...]; returns svg text or "" */
  function svg(pts,paused,win){
    var n=pts.length;if(n<3)return"";
    var i=n-1,acc=0;while(i>0&&acc<(win||1200)){acc+=dm(pts[i-1],pts[i]);i--}
    var w=pts.slice(i),step=Math.max(1,Math.ceil(w.length/160)),q=[];
    for(var k=0;k<w.length;k+=step)q.push(w[k]);if(q[q.length-1]!==w[w.length-1])q.push(w[w.length-1]);
    var la0=q[0][0],lo0=q[0][1],kx=Math.cos(la0*Math.PI/180),M=111320;
    var xy=q.map(function(p){return[(p[1]-lo0)*kx*M,-(p[0]-la0)*M]});
    var x0=Math.min.apply(0,xy.map(function(p){return p[0]})),x1=Math.max.apply(0,xy.map(function(p){return p[0]})),
        y0=Math.min.apply(0,xy.map(function(p){return p[1]})),y1=Math.max.apply(0,xy.map(function(p){return p[1]}));
    var W=320,H=120,pad=14,sx=Math.max(x1-x0,60),sy=Math.max(y1-y0,60),sc=Math.min((W-2*pad)/sx,(H-2*pad)/sy),
        ox=(W-(x1-x0)*sc)/2,oy=(H-(y1-y0)*sc)/2;
    function px(p){return[ox+(p[0]-x0)*sc,oy+(p[1]-y0)*sc]}
    var d="";xy.forEach(function(p,j){var c=px(p);d+=(j?"L":"M")+c[0].toFixed(1)+" "+c[1].toFixed(1)});
    var e=px(xy[xy.length-1]),col=paused?"var(--mut,#8a8f98)":"var(--ok)",h='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Live route" style="width:100%;height:auto;display:block;border-radius:14px;background:var(--cell);border:1px solid var(--line)">';
    h+='<path d="'+d+'" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
    if(i===0){var s=px(xy[0]);h+='<circle cx="'+s[0].toFixed(1)+'" cy="'+s[1].toFixed(1)+'" r="5" fill="var(--card)" stroke="var(--blue)" stroke-width="2"/>'}
    h+='<circle cx="'+e[0].toFixed(1)+'" cy="'+e[1].toFixed(1)+'" r="11" fill="'+col+'" opacity=".25"/><circle cx="'+e[0].toFixed(1)+'" cy="'+e[1].toFixed(1)+'" r="6" fill="'+col+'" stroke="var(--card)" stroke-width="2.5"/>';
    if(paused)h+='<text x="'+(W-10)+'" y="18" text-anchor="end" font-size="11" font-weight="700" fill="var(--ink)">Paused</text>';
    return h+"</svg>"}
  function render(){
    var h=host();if(!h)return;
    var T=window.TM,dock=document.getElementById("dock");
    var on=T&&T.mode==="iv"&&T.trk&&!T.done&&T.rt&&T.rt.length>=3&&dock&&!dock.hidden;
    if(!on){if(!h.hidden){h.hidden=true;lastKey=""}return}
    var key=T.rt.length+"|"+(T.run?1:0);if(key===lastKey&&!h.hidden)return;lastKey=key;
    var s=svg(T.rt,!T.run);h.innerHTML=s;h.hidden=!s}
  setInterval(render,1500);
  window.AxLiveMap={svg:svg,render:render};
})();

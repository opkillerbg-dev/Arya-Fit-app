/* Arya Fit v73: offline route map. Adds a "Route" button to each run in Progress > History; opens a clean SVG line map
   (start/end dots, km markers, distance and time) from the saved GPS points in axRoutes(). No tiles, no internet. */
(function(){
  "use strict";

  function hav(a,b){
    var R=6371000,r=Math.PI/180,dl=(b[0]-a[0])*r,dn=(b[1]-a[1])*r,
        x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dn/2)*Math.sin(dn/2);
    return 2*R*Math.asin(Math.min(1,Math.sqrt(x)));
  }

  function mapSvg(runs){
    var W=340,H=340,pad=22,all=[];
    runs.forEach(function(r){r.forEach(function(p){if(p&&isFinite(p[0])&&isFinite(p[1]))all.push(p)})});
    if(all.length<2)return"";
    var lat0=all.reduce(function(s,p){return s+p[0]},0)/all.length,kx=Math.cos(lat0*Math.PI/180);
    var xs=all.map(function(p){return p[1]*kx}),ys=all.map(function(p){return -p[0]});
    var x0=Math.min.apply(0,xs),x1=Math.max.apply(0,xs),y0=Math.min.apply(0,ys),y1=Math.max.apply(0,ys),
        sc=Math.min((W-2*pad)/((x1-x0)||1e-6),(H-2*pad)/((y1-y0)||1e-6)),
        ox=(W-(x1-x0)*sc)/2,oy=(H-(y1-y0)*sc)/2;
    function px(p){return[ox+(p[1]*kx-x0)*sc,oy+(-p[0]-y0)*sc]}
    var h='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Route map" style="width:100%;height:auto;display:block;border-radius:18px;background:var(--cell);border:1px solid var(--line)">',marks="";
    runs.forEach(function(r){
      var pts=r.filter(function(p){return p&&isFinite(p[0])&&isFinite(p[1])});
      if(pts.length<2)return;
      var d="",acc=0,nextK=1000;
      pts.forEach(function(p,i){
        var q=px(p);d+=(i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1);
        if(i){
          acc+=hav(pts[i-1],p);
          while(acc>=nextK){marks+='<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="9" fill="var(--card)" stroke="var(--blue)" stroke-width="2"/><text x="'+q[0].toFixed(1)+'" y="'+(q[1]+3.5).toFixed(1)+'" text-anchor="middle" font-size="10" font-weight="700" fill="var(--ink)">'+(nextK/1000)+'</text>';nextK+=1000}
        }
      });
      h+='<path d="'+d+'" fill="none" stroke="var(--blue)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
      var s=px(pts[0]),e=px(pts[pts.length-1]);
      marks+='<circle cx="'+s[0].toFixed(1)+'" cy="'+s[1].toFixed(1)+'" r="7" fill="var(--ok)" stroke="var(--card)" stroke-width="3"/><circle cx="'+e[0].toFixed(1)+'" cy="'+e[1].toFixed(1)+'" r="7" fill="#d9534f" stroke="var(--card)" stroke-width="3"/>';
    });
    return h+marks+'</svg>';
  }

  function openRoute(d){
    var runs=axRoutes()[d];
    if(!runs||!runs.length){toast("No route saved for this run.");return}
    var svg=mapSvg(runs);
    if(!svg){toast("This route has too few GPS points.");return}
    var km=(st["g"+d]||0)/1000,t=st["r"+d]||0;
    axSheet("Route · "+dl(d),svg+'<div style="display:flex;gap:14px;justify-content:space-between;margin-top:12px"><span><b>'+km.toFixed(2)+' km</b><br><small>distance</small></span><span><b>'+fmt(t)+'</b><br><small>time</small></span><span><b>'+(km&&t?fmt(t/km):"--")+'</b><br><small>per km</small></span></div><p class="ax-sub" style="margin-top:10px"><span style="color:var(--ok)">●</span> start &nbsp; <span style="color:#d9534f">●</span> finish &nbsp; Circles mark each km. Drawn from your saved GPS points, no internet needed.</p>');
  }

  function addButtons(){
    document.querySelectorAll("#rhist .lg").forEach(function(row){
      if(row.querySelector("[data-rt]"))return;
      var ed=row.querySelector("[data-ed]");if(!ed)return;
      var d=+ed.getAttribute("data-ed");
      if(!axRoutes()[d])return;
      var b=document.createElement("button");b.className="btn";b.setAttribute("data-rt",d);b.textContent="Route";
      ed.parentNode.insertBefore(b,ed);ed.parentNode.insertBefore(document.createTextNode(" "),ed);
    });
  }

  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-rt]");
    if(b){e.preventDefault();e.stopPropagation();openRoute(+b.getAttribute("data-rt"))}
  },true);

  var _pg=window.axPg;
  if(typeof _pg==="function")window.axPg=function(){var r=_pg.apply(this,arguments);try{addButtons()}catch(e){}return r};
  var _pr=window.prog;
  if(typeof _pr==="function")window.prog=function(){var r=_pr.apply(this,arguments);try{addButtons()}catch(e){}return r};
  window.axRouteMap=openRoute;
})();

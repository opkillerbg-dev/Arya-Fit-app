/* Arya Fit v92: after-run summary.
   Opens right after a run is saved (and from Progress > History > Summary): distance, time, pace, best km, steps,
   cadence, stride, a pace-coloured route map, per-km splits, a pace profile, jog/walk share, comparison with the
   last run and plain-language notes. Data comes from the run summary saved by commit() (APP.plans[..].rsum);
   older runs are rebuilt from their saved route and day totals. */
(function(){
  "use strict";

  var CSS=
  ".rs-hero{text-align:center;padding:4px 0 12px}"+
  ".rs-big{font-size:64px;line-height:1;font-weight:700;letter-spacing:-.02em;color:var(--ink)}"+
  ".rs-big small{font-size:22px;font-weight:600;color:var(--mut);margin-left:6px;letter-spacing:0}"+
  ".rs-sub{color:var(--mut);font-size:14px;margin-top:8px}"+
  ".rs-badges{margin-top:10px}"+
  ".rs-pill{display:inline-block;padding:4px 11px;border-radius:999px;font-size:12px;font-weight:700;background:var(--cell);border:1px solid var(--line);color:var(--ink);margin:2px 3px}"+
  ".rs-pill.g{background:var(--ok);border-color:var(--ok);color:#fff}"+
  ".rs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 4px}"+
  ".rs-t{background:var(--cell);border:1px solid var(--line);border-radius:14px;padding:10px 6px;text-align:center}"+
  ".rs-t b{display:block;font-size:20px;line-height:1.15;color:var(--ink)}"+
  ".rs-t i{display:block;font-style:normal;font-size:10.5px;letter-spacing:.07em;color:var(--mut);margin-top:4px;text-transform:uppercase}"+
  ".rs-sec{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin:18px 2px 8px;font-weight:700}"+
  ".rs-bars{display:grid;gap:7px}"+
  ".rs-r{display:grid;grid-template-columns:46px 1fr 48px;align-items:center;gap:8px;font-size:13px;color:var(--mut)}"+
  ".rs-r u{display:block;height:14px;border-radius:7px;background:var(--blue);opacity:.8;text-decoration:none}"+
  ".rs-r.f u{background:var(--ok);opacity:1}"+
  ".rs-r b{text-align:right;color:var(--ink);font-weight:700}"+
  ".rs-jw{display:flex;height:14px;border-radius:7px;overflow:hidden;background:var(--cell);border:1px solid var(--line)}"+
  ".rs-jw span{display:block;height:100%}"+
  ".rs-leg{display:flex;justify-content:space-between;font-size:12.5px;color:var(--mut);margin-top:6px}"+
  ".rs-note{margin:8px 2px;font-size:14px;line-height:1.45;color:var(--ink)}"+
  ".rs-note.m{color:var(--mut);font-size:13px}"+
  ".rs-act{display:flex;gap:10px;margin:18px 0 6px}.rs-act .ax-btn{flex:1}";

  function css(){
    if(document.getElementById("ax-rs-css"))return;
    var s=document.createElement("style");s.id="ax-rs-css";s.textContent=CSS;document.head.appendChild(s);
  }
  function E(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function pace(s){return s>0?fmt(s):"--"}
  function lastOf(a){return a&&a.length?a[a.length-1]:null}

  /* ---------- data ---------- */
  function sumOf(dy){
    var o=lastOf(axRsum()[dy]);if(o)return o;
    var pts=lastOf(axRoutes()[dy]),g=st["g"+dy]||0,r=st["r"+dy]||0;
    if(!pts&&!(g&&r))return null;
    var d=AxRun.summarize({pts:pts,dist:g,sec:r,steps:st["s"+dy]||0,jt:st["jt"+dy]||0,wt:st["wk"+dy]||0,t:0});
    d.t=0;d.dv=1;return d;
  }
  function latestDay(){
    for(var i=ND-1;i>=0;i--){if(lastOf(axRsum()[i])||(st["g"+i]>0&&st["r"+i]>0))return i}
    return null;
  }
  /* everything the sheet and the share card need for one run day */
  function data(dy){
    if(dy==null)dy=latestDay();
    if(dy==null)return null;
    var sum=sumOf(dy);if(!sum)return null;
    var pts=lastOf(axRoutes()[dy]),prev=null,maxD=0,minBest=0,j;
    for(j=dy-1;j>=0;j--){
      var s2=sumOf(j);if(!s2)continue;
      if(!prev&&s2.d>0&&s2.s>0)prev=s2;
      if(s2.d>maxD)maxD=s2.d;
      if(s2.km&&s2.km.length){var b=Math.min.apply(0,s2.km);if(!minBest||b<minBest)minBest=b}
    }
    var best=0,worst=0;
    if(sum.km&&sum.km.length){best=Math.min.apply(0,sum.km);worst=Math.max.apply(0,sum.km)}
    var D={dy:dy,sum:sum,pts:pts,prev:prev,best:best,worst:worst,
      avg:sum.d>=100&&sum.s>0?sum.s/(sum.d/1000):0,
      pbLong:sum.d>=500&&maxD>0&&sum.d>maxD+50,
      pbKm:best>0&&minBest>0&&best<minBest-2,
      date:DN[dt(dy).getDay()]+" "+dl(dy)};
    D.notes=notes(D);
    return D;
  }

  /* ---------- plain-language notes ---------- */
  function notes(D){
    var s=D.sum,out=[],p=D.prev,i;
    if(!p)out.push("First recorded run. Every run after this one gets compared with the last.");
    else if(s.d>=100&&p.d>=100&&s.s>0&&p.s>0){
      var a=s.s/(s.d/1000),b=p.s/(p.d/1000),df=Math.round(a-b);
      if(Math.abs(df)<=3)out.push("Pace about the same as your last run ("+pace(a)+" /km).");
      else out.push(pace(Math.abs(df))+" /km "+(df<0?"faster":"slower")+" than your last run ("+pace(a)+" vs "+pace(b)+").");
      var dd=s.d-p.d;
      if(Math.abs(dd)>=100)out.push((dd>0?"Further":"Shorter")+" by "+(Math.abs(dd)/1000).toFixed(2)+" km than last time.");
    }
    if(s.pp&&s.pp.length>=8){
      var h=s.pp.length>>1,f=0,l=0;
      for(i=0;i<h;i++)f+=s.pp[i];
      for(i=s.pp.length-h;i<s.pp.length;i++)l+=s.pp[i];
      f/=h;l/=h;
      if(f>0&&(f-l)/f>.04)out.push("Faster second half: you finished stronger than you started.");
    }
    if(s.jt>0&&s.wt>=0&&s.jt+s.wt>=120)out.push("Jogging was "+Math.round(s.jt/(s.jt+s.wt)*100)+"% of your moving time.");
    if(s.lu===1&&typeof ivt==="function")out.push("Level up. Next run: "+ivt(lvl())+".");
    else if(s.lu===-1&&typeof ivt==="function")out.push("Easing back a level. Next run: "+ivt(lvl())+".");
    return out;
  }

  /* ---------- pace-coloured route map (also used for the share card via colours()) ---------- */
  function project(pts,W,H,pad){
    var lat0=pts.reduce(function(a,p){return a+p[0]},0)/pts.length,kx=Math.cos(lat0*Math.PI/180),
        xs=pts.map(function(p){return p[1]*kx}),ys=pts.map(function(p){return -p[0]}),
        x0=Math.min.apply(0,xs),x1=Math.max.apply(0,xs),y0=Math.min.apply(0,ys),y1=Math.max.apply(0,ys),
        sc=Math.min((W-2*pad)/((x1-x0)||1e-6),(H-2*pad)/((y1-y0)||1e-6)),
        ox=(W-(x1-x0)*sc)/2,oy=(H-(y1-y0)*sc)/2;
    return pts.map(function(p,i){return[ox+(xs[i]-x0)*sc,oy+(ys[i]-y0)*sc]});
  }
  /* 0 (slow) .. 1 (fast) for every segment, smoothed */
  function speeds(pts){
    var v=[],i;
    for(i=1;i<pts.length;i++){
      var d=AxRun.hav(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1]),t=(pts[i][2]-pts[i-1][2])/1000;
      v.push(t>0?d/t:0);
    }
    var sm=v.map(function(x,k){var a=0,n=0;for(var q=Math.max(0,k-2);q<=Math.min(v.length-1,k+2);q++){a+=v[q];n++}return a/n});
    var s2=sm.slice().sort(function(a,b){return a-b}),lo=s2[Math.floor(s2.length*.1)],hi=s2[Math.floor(s2.length*.9)];
    return sm.map(function(x){return Math.max(0,Math.min(1,(x-lo)/((hi-lo)||1)))});
  }
  function kmMarks(pts){
    var m=[],acc=0,nx=1000,i;
    for(i=1;i<pts.length;i++){
      acc+=AxRun.hav(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1]);
      while(acc>=nx){m.push([i,nx/1000]);nx+=1000}
    }
    return m;
  }
  function routeSvg(pts){
    if(!pts||pts.length<5)return"";
    var W=340,H=250,P=project(pts,W,H,22),f=speeds(pts),h="",i;
    for(i=1;i<P.length;i++){
      h+='<line x1="'+P[i-1][0].toFixed(1)+'" y1="'+P[i-1][1].toFixed(1)+'" x2="'+P[i][0].toFixed(1)+'" y2="'+P[i][1].toFixed(1)+'" stroke="hsl('+Math.round(f[i-1]*120)+',72%,46%)" stroke-width="5" stroke-linecap="round"/>';
    }
    kmMarks(pts).forEach(function(m){
      var q=P[m[0]];
      h+='<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="9" fill="var(--card)" stroke="var(--ink)" stroke-width="1.5"/><text x="'+q[0].toFixed(1)+'" y="'+(q[1]+3.6).toFixed(1)+'" text-anchor="middle" font-size="10" font-weight="700" fill="var(--ink)">'+m[1]+'</text>';
    });
    var a=P[0],z=P[P.length-1];
    h+='<circle cx="'+a[0].toFixed(1)+'" cy="'+a[1].toFixed(1)+'" r="7" fill="var(--ok)" stroke="var(--card)" stroke-width="3"/><circle cx="'+z[0].toFixed(1)+'" cy="'+z[1].toFixed(1)+'" r="7" fill="#d9534f" stroke="var(--card)" stroke-width="3"/>';
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Route coloured by pace" style="width:100%;height:auto;display:block;border-radius:16px;background:var(--cell);border:1px solid var(--line)">'+h+'</svg>';
  }

  /* ---------- splits and profile ---------- */
  function splitRows(s){
    var rows=[],all=(s.km||[]).slice();
    if(!all.length&&!s.pt)return"";
    var best=all.length?Math.min.apply(0,all):0,worst=all.length?Math.max.apply(0,all):0;
    all.forEach(function(sec,i){
      var w=best===worst?100:Math.round(40+60*(worst-sec)/(worst-best));
      rows.push('<div class="rs-r'+(all.length>1&&sec===best?" f":"")+'"><span>km '+(i+1)+'</span><u style="width:'+w+'%"></u><b>'+pace(sec)+'</b></div>');
    });
    if(s.pt&&s.pt[0]>=50&&s.pt[1]>0){
      var pp=s.pt[1]/(s.pt[0]/1000),w2=best===worst||!all.length?70:Math.max(25,Math.min(100,Math.round(40+60*(worst-pp)/(worst-best))));
      rows.push('<div class="rs-r"><span>'+(s.pt[0]/1000).toFixed(2)+' km</span><u style="width:'+w2+'%"></u><b>'+pace(pp)+'</b></div>');
    }
    return '<div class="rs-bars">'+rows.join("")+'</div>';
  }
  function profileSvg(pp){
    if(!pp||pp.length<6)return"";
    var W=340,H=96,pl=6,pr=6,pt=10,pb=16,mn=Math.min.apply(0,pp),mx=Math.max.apply(0,pp),sp=(mx-mn)||1,n=pp.length,
        X=function(i){return pl+(W-pl-pr)*i/(n-1)},Y=function(v){return pt+(H-pt-pb)*((v-mn)/sp)}, /* faster (smaller) is higher */
        d="",i;
    for(i=0;i<n;i++)d+=(i?"L":"M")+X(i).toFixed(1)+" "+Y(pp[i]).toFixed(1);
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Pace over the run" style="width:100%;height:auto;display:block">'+
      '<path d="'+d+'L'+X(n-1).toFixed(1)+' '+(H-pb)+'L'+X(0).toFixed(1)+' '+(H-pb)+'Z" fill="var(--blue)" opacity=".13"/>'+
      '<path d="'+d+'" fill="none" stroke="var(--blue)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>'+
      '<text x="'+pl+'" y="'+(H-3)+'" font-size="10.5" fill="var(--mut)">start</text><text x="'+(W-pr)+'" y="'+(H-3)+'" text-anchor="end" font-size="10.5" fill="var(--mut)">finish</text></svg>'+
      '<div class="rs-leg"><span>Fastest '+pace(mn)+' /km</span><span>Slowest '+pace(mx)+' /km</span></div>';
  }

  /* ---------- the sheet ---------- */
  function tile(v,l){return'<div class="rs-t"><b>'+v+'</b><i>'+l+'</i></div>'}
  function html(D,fresh){
    var s=D.sum,km=s.d/1000,h="",q=AxRun.quality(s.ga,s.es||0,s.d);
    var hasD=s.d>=100;
    h+='<div class="rs-hero"><div class="rs-big disp">'+(hasD?km.toFixed(2)+'<small>km</small>':fmt(s.s))+'</div>'+
       '<div class="rs-sub">'+E(D.date)+(s.lv?' · '+E(s.lv):'')+'</div>';
    var bd="";
    if(D.pbLong)bd+='<span class="rs-pill g">Longest run so far</span>';
    if(D.pbKm)bd+='<span class="rs-pill g">Fastest km so far</span>';
    if(bd)h+='<div class="rs-badges">'+bd+'</div>';
    h+='</div><div class="rs-grid">'+
       tile(fmt(s.s),"Time")+tile(hasD?pace(D.avg):"--","Avg pace /km")+tile(D.best?pace(D.best):"--","Best km")+
       tile(s.st?s.st.toLocaleString():"--","Steps")+tile(s.cd?s.cd:"--","Cadence spm")+tile(s.sl?s.sl.toFixed(2):"--","Stride m")+'</div>';
    var rs=routeSvg(D.pts);
    if(rs)h+='<div class="rs-sec">Route</div>'+rs+'<p class="rs-note m">Green is faster, red is slower. Circles mark each km.</p>';
    var sp=splitRows(s);
    if(sp)h+='<div class="rs-sec">Pace per km</div>'+sp;
    var pf=profileSvg(s.pp);
    if(pf)h+='<div class="rs-sec">Pace over the run</div>'+pf;
    if(s.jt>0&&s.jt+(s.wt||0)>=60){
      var tot=s.jt+(s.wt||0),jp=Math.round(s.jt/tot*100);
      h+='<div class="rs-sec">Jog and walk</div><div class="rs-jw"><span style="width:'+jp+'%;background:var(--blue)"></span><span style="width:'+(100-jp)+'%;background:var(--sun);opacity:.8"></span></div>'+
         '<div class="rs-leg"><span>Jog '+fmt(s.jt)+'</span><span>Walk '+fmt(s.wt||0)+'</span></div>';
    }
    if(D.notes.length){
      h+='<div class="rs-sec">Notes</div>';
      D.notes.forEach(function(n){h+='<p class="rs-note">'+E(n)+'</p>'});
    }
    if(hasD){
      var gq=q.k==="good"?"GPS was good ("+s.ga+" m average accuracy).":q.k==="ok"?"GPS was fair ("+s.ga+" m average). Distance is likely within a few percent.":q.k==="weak"?"GPS was weak"+(s.ga?" ("+s.ga+" m average)":"")+", so distance and pace are less certain. Open sky helps.":"";
      if(gq)h+='<p class="rs-note m">'+gq+(s.es>0?" About "+(s.es/1000).toFixed(2)+" km of steps were filled in from your stride.":"")+(s.dv?" Rebuilt from the saved route.":"")+'</p>';
    }
    h+='<div class="rs-act"><button class="ax-btn ax-pri" id="rs-share">Share run card</button><button class="ax-btn" id="rs-x">Close</button></div>';
    return h;
  }

  function open(dy,fresh){
    if(window.AxRun==null)return;
    var D=data(dy);
    if(!D){if(!fresh)toast("No run summary yet.");return}
    /* right after saving, only show it for a run that was really just saved */
    if(fresh&&D.sum.t&&Date.now()-D.sum.t>120000)return;
    if(fresh&&TM)return;
    css();
    axSheet(fresh?"Run saved":"Run summary",html(D,fresh));
    var b=document.getElementById("ax-shb");
    var sh=b&&b.querySelector("#rs-share"),x=b&&b.querySelector("#rs-x");
    if(sh)sh.onclick=function(){if(window.AxRunCard)AxRunCard.share(D.dy)};
    if(x)x.onclick=axSheetX;
    hx("ok");
  }

  /* ---------- Progress > History: a Summary button on every run row ---------- */
  function addButtons(){
    document.querySelectorAll("#rhist .lg").forEach(function(row){
      if(row.querySelector("[data-rsum]"))return;
      var ed=row.querySelector("[data-ed]");if(!ed)return;
      var d=+ed.getAttribute("data-ed");
      if(!sumOf(d))return;
      var b=document.createElement("button");b.className="btn";b.setAttribute("data-rsum",d);b.textContent="Summary";
      ed.parentNode.insertBefore(b,ed);ed.parentNode.insertBefore(document.createTextNode(" "),ed);
    });
  }
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("[data-rsum]");
    if(b){e.preventDefault();e.stopPropagation();open(+b.getAttribute("data-rsum"),0)}
  },true);
  var _pg=window.axPg;
  if(typeof _pg==="function")window.axPg=function(){var r=_pg.apply(this,arguments);try{addButtons()}catch(e){}return r};
  var _pr=window.prog;
  if(typeof _pr==="function")window.prog=function(){var r=_pr.apply(this,arguments);try{addButtons()}catch(e){}return r};

  window.AxRunSum={open:open,data:data,routeSvg:routeSvg,project:project,speeds:speeds,kmMarks:kmMarks,latestDay:latestDay};
})();

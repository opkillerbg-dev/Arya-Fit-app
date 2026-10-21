/* Arya Fit v92: run share card (1080x1350 PNG, skin-aware colours like the weekly card).
   Route coloured by pace, big distance, time / pace / steps, per-km split bars and one note.
   Replaces the old plain card behind "Share run card" and is used by the summary sheet. */
(function(){
  "use strict";

  function cssVar(n,fb){try{var v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return v||fb}catch(e){return fb}}
  function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
  function fit(ctx,txt,x,y,maxW,wt,px,fam){var s=px;ctx.font=wt+" "+s+"px "+fam;while(s>14&&ctx.measureText(txt).width>maxW){s-=2;ctx.font=wt+" "+s+"px "+fam}ctx.fillText(txt,x,y)}
  function pace(s){return s>0?fmt(s):"--"}

  function draw(D){
    var cv=document.createElement("canvas");cv.width=1080;cv.height=1350;
    var ctx=cv.getContext("2d"),dark=typeof axIsDark==="function"?axIsDark():false,
        bg=cssVar("--bg",dark?"#0c1510":"#eee7d7"),card=cssVar("--card",dark?"#142019":"#faf6eb"),
        ink=cssVar("--ink",dark?"#e9eee4":"#202b22"),mut=cssVar("--mut",dark?"#a2b09f":"#716f60"),
        blue=cssVar("--blue",dark?"#85b99a":"#28533d"),ok=cssVar("--ok",dark?"#9bc9a6":"#477653"),
        sun=cssVar("--sun","#a98542"),line=cssVar("--line",dark?"#293a31":"#d8cdb5"),
        onC=dark?"#08110b":"#ffffff",SANS="system-ui, sans-serif",SERIF="Georgia, serif",
        s=D.sum,hasD=s.d>=100,L=dark?60:42;

    ctx.textAlign="left";
    ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
    ctx.strokeStyle=line;ctx.lineWidth=3;rrect(ctx,36,36,1008,1278,44);ctx.stroke();

    var pill="ARYA FIT  \u00b7  RUN";
    ctx.font="800 22px "+SANS;
    var pw=Math.ceil(ctx.measureText(pill).width)+52;
    ctx.fillStyle=blue;rrect(ctx,76,82,pw,48,24);ctx.fill();
    ctx.fillStyle=onC;ctx.fillText(pill,102,114);
    ctx.fillStyle=mut;ctx.textAlign="right";
    fit(ctx,D.date.toUpperCase(),1004,114,1004-(76+pw+30),"700",26,SANS);
    ctx.textAlign="left";

    /* hero number */
    ctx.fillStyle=ink;
    var big=hasD?(s.d/1000).toFixed(2):fmt(s.s);
    ctx.font="700 190px "+SERIF;
    var bw=ctx.measureText(big).width;
    ctx.fillText(big,70,300);
    ctx.fillStyle=mut;ctx.font="600 54px "+SANS;
    if(hasD)ctx.fillText("km",70+bw+18,300);
    var sub=(s.lv?s.lv:"")+(s.lv&&P&&P.name?"  \u00b7  ":"")+(P&&P.name?P.name:"");
    if(sub){ctx.fillStyle=mut;fit(ctx,sub,76,352,928,"500",28,SANS)}

    /* route panel */
    var PX=76,PY=384,PW=928,PH=440;
    ctx.fillStyle=card;ctx.strokeStyle=line;ctx.lineWidth=2;rrect(ctx,PX,PY,PW,PH,34);ctx.fill();ctx.stroke();
    var pts=D.pts;
    if(pts&&pts.length>=5&&window.AxRunSum){
      var P2=AxRunSum.project(pts,PW,PH,52),f=AxRunSum.speeds(pts),i;
      ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=12;
      for(i=1;i<P2.length;i++){
        ctx.strokeStyle="hsl("+Math.round(f[i-1]*120)+",70%,"+L+"%)";
        ctx.beginPath();ctx.moveTo(PX+P2[i-1][0],PY+P2[i-1][1]);ctx.lineTo(PX+P2[i][0],PY+P2[i][1]);ctx.stroke();
      }
      AxRunSum.kmMarks(pts).forEach(function(m){
        var q=P2[m[0]],x=PX+q[0],y=PY+q[1];
        ctx.fillStyle=card;ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,17,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.fillStyle=ink;ctx.font="800 19px "+SANS;ctx.textAlign="center";ctx.fillText(String(m[1]),x,y+7);ctx.textAlign="left";
      });
      var a=P2[0],z=P2[P2.length-1];
      ctx.lineWidth=5;ctx.strokeStyle=card;
      ctx.fillStyle=ok;ctx.beginPath();ctx.arc(PX+a[0],PY+a[1],14,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle="#d9534f";ctx.beginPath();ctx.arc(PX+z[0],PY+z[1],14,0,Math.PI*2);ctx.fill();ctx.stroke();
    }else{
      ctx.fillStyle=mut;ctx.textAlign="center";fit(ctx,"No route recorded for this run",PX+PW/2,PY+PH/2+10,PW-80,"600",32,SANS);ctx.textAlign="left";
    }

    /* three tiles */
    var tiles=[[fmt(s.s),"TIME",blue],[hasD?pace(D.avg):"--","AVG PACE /KM",ok],
               [s.st?s.st.toLocaleString():(s.cd?String(s.cd):"--"),s.st?"STEPS":"CADENCE",sun]];
    tiles.forEach(function(t,k){
      var tx=76+k*316,ty=848,tw=296;
      ctx.fillStyle=card;ctx.strokeStyle=line;ctx.lineWidth=2;rrect(ctx,tx,ty,tw,150,30);ctx.fill();ctx.stroke();
      ctx.fillStyle=t[2];fit(ctx,t[1],tx+28,ty+46,tw-56,"800",20,SANS);
      ctx.fillStyle=ink;fit(ctx,t[0],tx+28,ty+118,tw-56,"700",58,SERIF);
    });

    /* splits */
    var SY=1022,SH=150;
    ctx.fillStyle=card;ctx.strokeStyle=line;ctx.lineWidth=2;rrect(ctx,76,SY,928,SH,30);ctx.fill();ctx.stroke();
    var km=(s.km||[]).slice(0,10);
    if(km.length>=1){
      var mn=Math.min.apply(0,km),mx=Math.max.apply(0,km),n=km.length,gap=14,bwid=Math.min(70,(928-80-gap*(n-1))/n),
          tw2=bwid*n+gap*(n-1),x0=76+(928-tw2)/2;
      km.forEach(function(sec,k){
        var hh=mn===mx?46:22+36*(mx-sec)/(mx-mn),x=x0+k*(bwid+gap),y=SY+SH-44-hh;
        ctx.fillStyle=(n>1&&sec===mn)?ok:blue;ctx.globalAlpha=(n>1&&sec===mn)?1:.8;
        rrect(ctx,x,y,bwid,hh,10);ctx.fill();ctx.globalAlpha=1;
        ctx.fillStyle=ink;ctx.textAlign="center";ctx.font="700 20px "+SANS;ctx.fillText(pace(sec),x+bwid/2,SY+SH-16);
      });
      ctx.textAlign="left";
      ctx.fillStyle=mut;ctx.font="800 18px "+SANS;ctx.fillText("PACE PER KM",104,SY+34);
    }else{
      ctx.fillStyle=mut;ctx.textAlign="center";fit(ctx,s.jt>0?"Jog "+fmt(s.jt)+"  \u00b7  Walk "+fmt(s.wt||0):"Splits appear after the first full km",76+464,SY+SH/2+10,830,"600",30,SANS);ctx.textAlign="left";
    }

    /* footer note */
    var note=D.pbKm?"Fastest km so far: "+pace(D.best)+" /km.":D.pbLong?"Longest run so far.":
      (D.best?"Best km "+pace(D.best)+" /km"+(s.cd?"  \u00b7  "+s.cd+" steps/min":""):(s.cd?s.cd+" steps per minute":"One run at a time."));
    ctx.fillStyle=blue;rrect(ctx,76,1192,928,92,30);ctx.fill();
    ctx.fillStyle=onC;fit(ctx,note,112,1250,856,"700",34,SERIF);
    return cv;
  }

  function showPreview(url){
    var old=$("gov");if(old)old.remove();
    axGuard();
    var o=document.createElement("div");o.id="gov";
    o.innerHTML='<img src="'+url+'" alt="Run card" style="max-width:90%;max-height:72vh;border-radius:18px;box-shadow:0 16px 40px rgba(0,0,0,.4)"><p class="key">Take a screenshot to share it.</p><div class="qr"><button class="btn" id="ax-rc-x">Close</button></div>';
    document.body.appendChild(o);
    $("ax-rc-x").onclick=function(){o.remove();URL.revokeObjectURL(url)};
  }

  function share(dy){
    if(!window.AxRunSum){return}
    var D=AxRunSum.data(dy);
    if(!D){toast("No run to share yet.");return}
    hx("ok");
    var cv=draw(D),name="arya-fit-run-"+D.dy+".png",
        PL=(window.Capacitor&&Capacitor.Plugins)||{},FS=PL.Filesystem,SH=PL.Share;
    function fallback(){
      cv.toBlob(function(bl){
        if(!bl)return;
        var f=new File([bl],name,{type:"image/png"});
        if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:"My run"}).catch(function(){});
        else showPreview(URL.createObjectURL(bl));
      });
    }
    if(FS&&SH){
      FS.writeFile({path:name,data:cv.toDataURL("image/png").split(",")[1],directory:"CACHE"})
        .then(function(r){return SH.share({title:"My run",url:r.uri})})
        .catch(fallback);
      return;
    }
    fallback();
  }

  window.AxRunCard={draw:draw,share:share};
  window.shareCard=function(){share()};
})();

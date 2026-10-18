/* Arya Fit v71: Weekly review share card (1080x1350 PNG, skin-aware colours, native Share with web fallback).
   Adds "Share weekly review card" to the "This week" panel (Progress > Stats) and to the Quick actions sheet. */
(function(){
  "use strict";

  function cssVar(n,fb){
    try{var v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return v||fb}catch(e){return fb}
  }
  function rrect(c,x,y,w,h,r){
    c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
  }
  /* draw text, shrinking the font until it fits maxW */
  function fit(ctx,txt,x,y,maxW,wt,px,fam){
    var s=px;ctx.font=wt+" "+s+"px "+fam;
    while(s>14&&ctx.measureText(txt).width>maxW){s-=2;ctx.font=wt+" "+s+"px "+fam}
    ctx.fillText(txt,x,y);
  }

  function gatherWeek(){
    var td=Math.max(0,Math.min(ND-1,todayIdx())),W=Math.floor(td/7),a=W*7,b=Math.min(ND,a+7);
    var km=0,dn=0,rs=0,jt=0,wk=0,stp=0,mv=0,days=[],ds=PR.ds||{};
    for(var i=a;i<b;i++){
      var g=(st["g"+i]||0)/1000,x=st["x"+i]||0,done=!!(dayDone(i)||x===2),c=cnt(i);
      km+=g;jt+=st["jt"+i]||0;wk+=st["wk"+i]||0;
      if(x===1)rs++;else if(done)dn++;
      var d=dt(i),sd=ds[ymdOf(d)]||(i===todayIdx()&&SS&&SS.today?SS.today:0)||st["s"+i]||0;
      stp+=sd;
      items(i).forEach(function(it){if(it[0]==="Strength"&&st[k(i,it[1])])mv++});
      days.push({lbl:DN[d.getDay()],date:d.getDate(),done:done,rest:x===1,pct:c[1]?c[0]/c[1]:0,km:g});
    }
    var sk=parseInt(($("ax-streak")||{}).textContent,10)||0;
    return{wNum:W+1,range:dl(a)+" - "+dl(b-1),who:(P&&P.athlete)||"",plan:(P&&P.name)||"Training plan",
      km:km,dn:dn,tot:b-a,rs:rs,stp:stp,mv:mv,strk:sk,jogPct:(jt+wk)>0?Math.round(jt/(jt+wk)*100):null,days:days};
  }

  function drawCard(w){
    var cv=document.createElement("canvas");cv.width=1080;cv.height=1350;
    var ctx=cv.getContext("2d"),dark=typeof axIsDark==="function"?axIsDark():false,
        bg=cssVar("--bg",dark?"#0c1510":"#eee7d7"),card=cssVar("--card",dark?"#142019":"#faf6eb"),
        ink=cssVar("--ink",dark?"#e9eee4":"#202b22"),mut=cssVar("--mut",dark?"#a2b09f":"#716f60"),
        blue=cssVar("--blue",dark?"#85b99a":"#28533d"),ok=cssVar("--ok",dark?"#9bc9a6":"#477653"),
        sun=cssVar("--sun","#a98542"),line=cssVar("--line",dark?"#293a31":"#d8cdb5"),
        onC=dark?"#08110b":"#ffffff",SANS="system-ui, sans-serif",SERIF="Georgia, serif";

    ctx.textAlign="left";
    ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
    ctx.strokeStyle=line;ctx.lineWidth=3;rrect(ctx,36,36,1008,1278,44);ctx.stroke();

    var pill="ARYA FIT  \u00b7  WEEK "+w.wNum;
    ctx.font="800 22px "+SANS;
    var pw=Math.ceil(ctx.measureText(pill).width)+52;
    ctx.fillStyle=blue;rrect(ctx,76,82,pw,48,24);ctx.fill();
    ctx.fillStyle=onC;ctx.fillText(pill,102,114);
    ctx.fillStyle=mut;ctx.textAlign="right";
    fit(ctx,w.range.toUpperCase(),1004,114,1004-(76+pw+30),"700",26,SANS);
    ctx.textAlign="left";

    ctx.fillStyle=ink;fit(ctx,"Weekly Review.",76,220,928,"700",74,SERIF);
    ctx.fillStyle=mut;fit(ctx,(w.who?w.who+"  \u00b7  ":"")+w.plan,76,268,928,"500",30,SANS);

    ctx.fillStyle=card;ctx.strokeStyle=line;ctx.lineWidth=2;rrect(ctx,76,310,928,220,34);ctx.fill();ctx.stroke();
    var cw=928/w.days.length;
    w.days.forEach(function(d,i){
      var cx=76+cw*i+cw/2;
      ctx.textAlign="center";ctx.fillStyle=mut;ctx.font="700 22px "+SANS;ctx.fillText(d.lbl.toUpperCase(),cx,362);
      ctx.beginPath();ctx.arc(cx,426,38,0,Math.PI*2);
      if(d.done){ctx.fillStyle=ok;ctx.fill()}
      else if(d.rest){ctx.strokeStyle=mut;ctx.lineWidth=3;ctx.setLineDash([6,6]);ctx.stroke();ctx.setLineDash([])}
      else{ctx.strokeStyle=line;ctx.lineWidth=4;ctx.stroke()}
      ctx.fillStyle=d.done?onC:ink;ctx.font="700 28px "+SANS;
      ctx.fillText(d.done?"\u2713":d.rest?"R":String(d.date),cx,436);
      ctx.fillStyle=mut;ctx.font="600 20px "+SANS;
      ctx.fillText(d.km>0?d.km.toFixed(1)+" km":d.rest?"Rest":Math.round(d.pct*100)+"%",cx,498);
    });
    ctx.textAlign="left";

    var tiles=[
      [w.dn+" / "+w.tot,"DAYS DONE"+(w.rs?"  \u00b7  "+w.rs+" REST":""),ok],
      [w.km.toFixed(1)+" km","DISTANCE",blue],
      [w.stp.toLocaleString(),"STEPS",sun],
      [w.strk+" day"+(w.strk===1?"":"s"),"STREAK  \u00b7  "+w.mv+" STRENGTH MOVES",ok]];
    tiles.forEach(function(t,i){
      var tx=76+(i%2)*476,ty=560+Math.floor(i/2)*260;
      ctx.fillStyle=card;ctx.strokeStyle=line;ctx.lineWidth=2;rrect(ctx,tx,ty,452,236,34);ctx.fill();ctx.stroke();
      ctx.fillStyle=t[2];fit(ctx,t[1],tx+34,ty+56,384,"800",21,SANS);
      ctx.fillStyle=ink;fit(ctx,t[0],tx+34,ty+152,384,"700",64,SERIF);
    });

    ctx.fillStyle=blue;rrect(ctx,76,1104,928,150,32);ctx.fill();
    ctx.fillStyle=onC;fit(ctx,"Consistency over intensity.",114,1168,852,"700",36,SERIF);
    fit(ctx,(w.jogPct!=null?"Jog share "+w.jogPct+"%  \u00b7  ":"")+"Small steps count. Rest counts too.",114,1214,852,"500",25,SANS);
    return cv;
  }

  function showPreview(url){
    var old=$("gov");if(old)old.remove();
    axGuard();
    var o=document.createElement("div");o.id="gov";
    o.innerHTML='<img src="'+url+'" alt="Weekly review card" style="max-width:90%;max-height:72vh;border-radius:18px;box-shadow:0 16px 40px rgba(0,0,0,.4)"><p class="key">Take a screenshot to share it.</p><div class="qr"><button class="btn" id="ax-wk-x">Close</button></div>';
    document.body.appendChild(o);
    $("ax-wk-x").onclick=function(){o.remove();URL.revokeObjectURL(url)};
  }

  function shareWeeklyCard(){
    hx("ok");
    var w=gatherWeek(),cv=drawCard(w),
        PL=(window.Capacitor&&Capacitor.Plugins)||{},FS=PL.Filesystem,SH=PL.Share;
    function fallback(){
      cv.toBlob(function(bl){
        if(!bl)return;
        var f=new File([bl],"arya-fit-week-"+w.wNum+".png",{type:"image/png"});
        if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:"Arya Fit week "+w.wNum}).catch(function(){});
        else showPreview(URL.createObjectURL(bl));
      });
    }
    if(FS&&SH){
      FS.writeFile({path:"arya-fit-week-"+w.wNum+".png",data:cv.toDataURL("image/png").split(",")[1],directory:"CACHE"})
        .then(function(r){return SH.share({title:"Arya Fit week "+w.wNum,url:r.uri})})
        .catch(fallback);
      return;
    }
    fallback();
  }

  function injectWeekBtn(){
    var sec=$("ax-ps-stats");if(!sec||$("ax-wk-share"))return;
    var ps=sec.querySelectorAll(".panel");
    for(var i=0;i<ps.length;i++){
      var h=ps[i].querySelector("h3");
      if(h&&/This week/i.test(h.textContent)){
        var b=document.createElement("button");
        b.type="button";b.id="ax-wk-share";b.className="btn pri w";b.style.marginTop="10px";
        b.textContent="Share weekly review card";b.onclick=shareWeeklyCard;
        ps[i].appendChild(b);break;
      }
    }
  }

  var _pg=window.axPg;
  if(typeof _pg==="function")window.axPg=function(){_pg.apply(this,arguments);injectWeekBtn()};

  var _more=window.axTopMore;
  if(typeof _more==="function")window.axTopMore=function(){
    _more.apply(this,arguments);
    var b=$("ax-shb");
    if(b&&!$("ax-q-wk")){
      var o=document.createElement("button");
      o.className="ax-opt";o.id="ax-q-wk";
      o.innerHTML="<b>Share weekly review card</b><span>Image of this week's days, km and steps</span>";
      o.onclick=function(){axSheetX();setTimeout(shareWeeklyCard,60)};
      b.appendChild(o);
    }
  };
  window.shareWeeklyCard=shareWeeklyCard;
})();

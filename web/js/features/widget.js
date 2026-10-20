/* Arya Fit v86: home-screen widgets bridge. Sends the widgets today's plan text, step goal, streak and the current skin colours.
   Steps themselves are read natively by the widget (live). Native side: AppWidgetPlugin + WidgetKit.java. */
(function(){
  "use strict";
  var tm=null;
  function PL(){return window.__axWidget||(window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AppWidget)||null}

  /* any CSS colour (hex, rgb, color-mix, color()) -> #rrggbb via a 1px canvas */
  function hex(v){
    try{
      var el=document.createElement("i");el.style.color=v;el.style.display="none";document.body.appendChild(el);
      var c=getComputedStyle(el).color;document.body.removeChild(el);
      var cv=document.createElement("canvas");cv.width=cv.height=1;var x=cv.getContext("2d");
      x.fillStyle="#000";x.fillRect(0,0,1,1);x.fillStyle=c;x.fillRect(0,0,1,1);
      var d=x.getImageData(0,0,1,1).data;
      return "#"+[d[0],d[1],d[2]].map(function(n){return("0"+n.toString(16)).slice(-2)}).join("");
    }catch(e){return""}
  }
  function colors(){
    var o={};[["bg","--bg"],["card","--card"],["ink","--ink"],["mut","--mut"],["blue","--blue"],["ok","--ok"],["sun","--sun"],["line","--line"]]
      .forEach(function(p){var h=hex("var("+p[1]+")");if(h)o[p[0]]=h});
    return o;
  }

  function payload(){
    var i=Math.max(0,Math.min(ND-1,todayIdx())),src=axSrc(i),t=src<0?null:T[wdk(src)],c=cnt(i);
    var rest=src<0||st["x"+i]==1;
    try{stats()}catch(e){}
    var streak=parseInt((document.getElementById("ax-streak")||{}).textContent,10)||0;
    return{date:ymd(),goal:sgoal(),title:rest?"Rest day":(t&&t.n)||"Workout",kicker:"TODAY \u00b7 DAY "+(i+1)+" OF "+ND,
      done:c[0],total:c[1],rest:rest,streak:streak,c:colors()};
  }

  function send(){
    var p=PL();if(!p)return;
    try{p.update({json:JSON.stringify(payload())})}catch(e){}
  }
  function later(){if(tm)return;tm=setTimeout(function(){tm=null;send()},2500)}

  var _save=window.save;
  if(typeof _save==="function")window.save=function(){var r=_save.apply(this,arguments);later();return r};
  document.addEventListener("visibilitychange",function(){if(document.hidden)send()});
  setTimeout(send,4000);
  window.axWidgetSync=send;
})();

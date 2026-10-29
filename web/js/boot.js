/* Arya Fit v116: SMART loading screen. The splash no longer ends on a fixed timer: after the work below it waits until the app is measurably stable
   (AxBootGate: a clean 1 s of animation frames at the screen's own refresh rate, no blocked main thread, service worker finished installing,
   no files still arriving). Strict first; after 6 s of visible time it accepts mild jitter; after 11 s it goes anyway so a weak phone never hangs.
   Time while the app is in the background does not count. Result of the last start: window.axBootInfo.
   Arya Fit v90: staged startup behind the logo splash.
   Stage 1 (critical): page load, web fonts (capped), hero picture decoded.
   Stage 2 (warm-up, capped at WARM ms): build and lay out the other tabs while the splash still covers them, so the first tap on Progress,
     Run or Plan does not pay for first-time work. Tabs are NOT shown or un-hidden (observers watch the hidden attribute); each one is only
     given a temporary inline display + visibility:hidden so the browser computes its style and layout once.
   The splash ends when stage 1 and 2 are done and it has been up for at least MIN ms; hard caps below end it anyway.
   Leftover warm-up work continues in idle time after the app is shown. axBusy(text)/axBusyDone() = small pill for slow jobs (shows after 400 ms). */
(function(){
  "use strict";
  var MIN=450,WARM=4000,WALL=22000,done=false,t0=Date.now();
  function now(){return window.performance&&performance.now?performance.now():Date.now()-t0}
  function msg(t){var m=document.getElementById("ax-boot-msg");if(m&&!done)m.textContent=t}
  function bars(){try{if(window.syncSystemBarStyle)syncSystemBarStyle()}catch(e){}}

  /* white status/nav icons while the dark splash is up (the page may load before the native bridge exists, so retry) */
  function light(){try{if(window.AxInsets)AxInsets.style(true)}catch(e){}}
  light();setTimeout(light,250);setTimeout(light,900);

  function finish(){
    if(done)return;done=true;
    var b=document.getElementById("ax-boot");
    document.documentElement.classList.remove("ax-booting");
    bars();
    if(b){b.classList.add("ax-boot-out");setTimeout(function(){if(b.parentNode)b.parentNode.removeChild(b)},380)}
    startIdle();
  }
  window.axBootDone=finish;

  function wait(p,ms){return Promise.race([p,new Promise(function(r){setTimeout(r,ms)})])}

  /* ---------- stage 1 ---------- */
  var loaded=new Promise(function(res){if(document.readyState==="complete")res();else window.addEventListener("load",res)});
  var fl=document.querySelector("link[data-ax-font]");
  var fontCss=new Promise(function(res){
    if(!fl||fl.sheet){res();return}
    fl.addEventListener("load",res);fl.addEventListener("error",res)});
  var fonts=wait(fontCss,900).then(function(){return document.fonts&&document.fonts.ready?document.fonts.ready:0});
  var imgs=Promise.all([].slice.call(document.images).filter(function(i){return i.loading!=="lazy"&&i.src}).map(function(i){return i.decode?i.decode().catch(function(){}):0}));

  /* ---------- stage 2: warm-up tasks, cheapest-to-skip last ---------- */
  var tasks=[
    ["prog",function(){try{if(window.prog)prog()}catch(e){}}],
    ["timers",function(){try{if(window.tvu)tvu()}catch(e){}}],
    ["set",function(){try{if(window.axSl)axSl()}catch(e){}}],
    ["plan",0],["plans",0]
  ];
  function layoutOnce(v){
    var e=document.getElementById("ax-v-"+v);if(!e||!e.hidden)return;   /* only tabs that are currently hidden */
    var old=e.getAttribute("style");
    try{
      var st=e.style;st.setProperty("display","block","important");st.setProperty("visibility","hidden","important");
      st.setProperty("position","absolute","important");st.setProperty("left","0");st.setProperty("right","0");st.setProperty("top","0");
      void e.offsetHeight;                                              /* style + layout happen here, once */
      if(v==="plan"||v==="timers")[].slice.call(e.querySelectorAll("img")).slice(0,6).forEach(function(i){   /* exercise pictures: fetch + decode now, not on the first tap */
        try{i.loading="eager";if(i.decode)i.decode().catch(function(){})}catch(z){}});
    }catch(x){}
    finally{if(old==null)e.removeAttribute("style");else e.setAttribute("style",old)}
  }
  function runTask(t){try{if(t[1])t[1]();layoutOnce(t[0])}catch(e){}}
  function tick(fn){setTimeout(fn,0)}
  function warm(deadline){
    return new Promise(function(res){
      var q=tasks;
      (function next(){
        if(!q.length||now()>=deadline||done){res();return}
        var t=q.shift();runTask(t);tick(next);
      })();
    });
  }

  /* leftovers run one per idle slot after the first screen is shown */
  var idleOn=false;
  function startIdle(){
    if(idleOn||!tasks.length)return;idleOn=true;
    var ric=window.requestIdleCallback||function(f){return setTimeout(function(){f({timeRemaining:function(){return 8}})},120)};
    (function next(){
      if(!tasks.length)return;
      ric(function(d){
        if(document.hidden){setTimeout(next,1000);return}
        if(d&&d.timeRemaining&&d.timeRemaining()<6){next();return}
        runTask(tasks.shift());next();
      },{timeout:2000});
    })();
  }

  /* ---------- stage 3: service worker (first install or an update copies every file: that is what made the first launches choppy) ---------- */
  function swSettled(){
    return new Promise(function(res){
      try{
        if(!("serviceWorker" in navigator)||!/^https?:/.test(location.protocol)){res();return}
        var tries=0;
        (function find(){
          var p=window.axSwP;
          if(!p){if(++tries>12){res();return}setTimeout(find,100);return}          /* registration is requested right after load */
          p.then(function(reg){
            if(!reg){res();return}
            var settled=false;
            function over(){if(!settled){settled=true;res()}}
            function track(w){
              if(!w||w.state==="activated"||w.state==="redundant"){over();return}
              w.addEventListener("statechange",function(){if(w.state==="activated"||w.state==="redundant")over()});
            }
            if(reg.installing||reg.waiting){msg("Updating");track(reg.installing||reg.waiting);return}
            var u=false;
            reg.addEventListener("updatefound",function(){u=true;msg("Updating");track(reg.installing)});
            setTimeout(function(){if(!u)over()},1200);                              /* grace for an update check to report back */
          },function(){res()});
        })();
      }catch(e){res()}
    });
  }
  /* files still arriving? (resource timing: quiet for 400 ms) */
  function netQuiet(){
    return new Promise(function(res){
      var end=now()+3000;
      (function look(){
        var last=0;
        try{var r=performance.getEntriesByType("resource");for(var i=Math.max(0,r.length-40);i<r.length;i++)last=Math.max(last,r[i].responseEnd||0)}catch(e){}
        if(now()-last>=400||now()>end)res();else setTimeout(look,150);
      })();
    });
  }

  /* ---------- stage 4: wait until frames are stable ---------- */
  function settle(){
    return new Promise(function(res){
      if(!window.AxBootGate){res({ok:true,tier:"nogate",reason:"nogate"});return}
      var g=AxBootGate.create(),raf=0,lagT=0,po=null,lastTick=now(),stop=false,shown=0;
      function end(v){
        if(stop)return;stop=true;cancelAnimationFrame(raf);clearInterval(lagT);try{if(po)po.disconnect()}catch(e){}
        document.removeEventListener("visibilitychange",vc);res(v);
      }
      function vc(){if(document.hidden)g.reset()}
      document.addEventListener("visibilitychange",vc);
      try{
        po=new PerformanceObserver(function(l){l.getEntries().forEach(function(e){g.busy(e.startTime+e.duration,e.duration)})});
        po.observe({entryTypes:["longtask"]});
      }catch(e){po=null}
      /* timer-lag probe: works where the long-task API does not */
      lagT=setInterval(function(){var t=now(),d=t-lastTick-100;lastTick=t;if(d>=50&&!document.hidden)g.busy(t,d)},100);
      (function loop(){
        raf=requestAnimationFrame(function(t){
          g.frame(t);
          var v=g.check(t);
          if(v.ok){end(v);return}
          var vis=g.visibleMs();
          if(vis>6000&&shown<2){shown=2;msg("Almost there, still settling")}
          else if(vis>1500&&!shown){shown=1;msg("Making sure it runs smoothly")}
          window.axBootInfo={fps:v.fps,base:Math.round(g.base()*10)/10,reason:v.reason,visible:v.visible};
          loop();
        });
      })();
    });
  }

  Promise.all([wait(loaded,2500),fonts.then?wait(fonts,1700):0,wait(imgs,1200)]).then(function(){
    msg("Getting things ready");
    var sw=swSettled();                                                       /* runs alongside the warm-up */
    return warm(now()+WARM).then(function(){return wait(sw,9000)});
  }).then(function(){return wait(netQuiet(),3500)}).then(function(){
    return new Promise(function(r){setTimeout(r,Math.max(0,MIN-now()))});
  }).then(settle).then(function(v){
    window.axBootInfo={fps:v.fps||0,base:v.base||0,tier:v.tier,reason:v.reason,visible:v.visible||0,ms:Math.round(now())};
    finish();
  });
  setTimeout(finish,WALL);                                                    /* last-resort wall clock, only if something above never reports back */

  /* busy pill for slow jobs */
  var n=0,tm=null,pill=null;
  function ensure(){
    if(pill)return pill;
    pill=document.createElement("div");pill.id="ax-busy";pill.setAttribute("role","status");pill.hidden=true;
    pill.innerHTML='<i></i><span></span>';document.body.appendChild(pill);return pill;
  }
  window.axBusy=function(text){
    n++;var p=ensure();p.querySelector("span").textContent=text||"Working...";
    if(!tm&&p.hidden)tm=setTimeout(function(){tm=null;if(n>0)p.hidden=false},400);
  };
  window.axBusyDone=function(){
    n=Math.max(0,n-1);if(n)return;
    if(tm){clearTimeout(tm);tm=null}
    if(pill)pill.hidden=true;
  };

  var _pf=window.packFresh;
  if(typeof _pf==="function")window.packFresh=function(){
    axBusy("Preparing backup...");
    var r;try{r=_pf.apply(this,arguments)}catch(e){axBusyDone();throw e}
    return Promise.resolve(r).then(function(v){axBusyDone();return v},function(e){axBusyDone();throw e});
  };
})();

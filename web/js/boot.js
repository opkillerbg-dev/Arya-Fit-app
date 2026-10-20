/* Arya Fit v90: staged startup behind the logo splash.
   Stage 1 (critical): page load, web fonts (capped), hero picture decoded.
   Stage 2 (warm-up, capped at WARM ms): build and lay out the other tabs while the splash still covers them, so the first tap on Progress,
     Run or Plan does not pay for first-time work. Tabs are NOT shown or un-hidden (observers watch the hidden attribute); each one is only
     given a temporary inline display + visibility:hidden so the browser computes its style and layout once.
   The splash ends when stage 1 and 2 are done and it has been up for at least MIN ms; hard caps below end it anyway.
   Leftover warm-up work continues in idle time after the app is shown. axBusy(text)/axBusyDone() = small pill for slow jobs (shows after 400 ms). */
(function(){
  "use strict";
  var MIN=450,WARM=900,HARD=3400,done=false,t0=Date.now();
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

  Promise.all([wait(loaded,2500),fonts.then?wait(fonts,1700):0,wait(imgs,1200)]).then(function(){
    msg("Getting things ready");
    return warm(now()+WARM);
  }).then(function(){
    var rest=Math.max(0,MIN-now());
    setTimeout(function(){requestAnimationFrame(function(){requestAnimationFrame(finish)})},rest);
  });
  setTimeout(finish,HARD);
  setTimeout(function(){var m=document.getElementById("ax-boot-msg");if(m&&!done)m.textContent="Still loading. First start can take a moment."},2200);

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

/* Arya Fit v74: smart loading. Covers startup with a splash until the first screen is ready (render done, fonts and hero decoded, two frames painted),
   and offers axBusy(text)/axBusyDone() for slow jobs: the pill only appears if the job takes longer than 400 ms.
   While booting, blur effects and animations are switched off (html.ax-booting) so the first frames are cheaper. */
(function(){
  "use strict";
  var done=false,t0=Date.now();

  function finish(){
    if(done)return;done=true;
    var b=document.getElementById("ax-boot");
    document.documentElement.classList.remove("ax-booting");
    if(b){b.classList.add("ax-boot-out");setTimeout(function(){if(b.parentNode)b.parentNode.removeChild(b)},300)}
  }
  window.axBootDone=finish;

  function wait(p,ms){return Promise.race([p,new Promise(function(r){setTimeout(r,ms)})])}

  var loaded=new Promise(function(res){if(document.readyState==="complete")res();else window.addEventListener("load",res)});
  var fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
  var imgs=Promise.all([].slice.call(document.images).filter(function(i){return i.loading!=="lazy"&&i.src}).map(function(i){return i.decode?i.decode().catch(function(){}):0}));

  Promise.all([wait(loaded,2500),wait(fonts,1200),wait(imgs,1200)]).then(function(){
    requestAnimationFrame(function(){requestAnimationFrame(finish)});
  });
  setTimeout(finish,3000);
  setTimeout(function(){var m=document.getElementById("ax-boot-msg");if(m&&!done)m.textContent="Still loading. First start can take a moment."},2000);

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

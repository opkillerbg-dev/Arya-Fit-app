/* Arya Fit v70: Animated exercises. Cross-fades the A/B/C/D frames in a loop with a Play/Pause pill.
   Wraps axExiBind() so it works in Plan cards and in Hands-free mode (#gov.ax-hf). Keeps the v64 clothing tint masks. */
(function(){
  "use strict";
  var MSPF=1150;

  function setFrame(box,s,idx){
    var fr=s.children,n=fr.length;
    if(!n)return;
    idx=((idx%n)+n)%n;
    box._axFi=idx;
    for(var i=0;i<n;i++)fr[i].classList.toggle("ax-on",i===idx);
    var dd=box.querySelector(".ax-exd");
    if(dd&&dd.children.length===n)for(var j=0;j<n;j++)dd.children[j].className=j===idx?"on":"";
  }

  function setBtn(btn,playing){
    if(!btn)return;
    btn.setAttribute("aria-pressed",playing?"true":"false");
    btn.setAttribute("aria-label",playing?"Pause exercise animation":"Play exercise animation");
    btn.innerHTML=playing
      ?'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg><span>Pause</span>'
      :'<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg><span>Play</span>';
  }

  function clearTm(box){if(box._axTm){clearInterval(box._axTm);box._axTm=null}}

  function stopAnim(box,s,btn){
    clearTm(box);
    var idx=box._axFi||0;
    box.classList.remove("ax-anim");
    setBtn(btn,false);
    for(var i=0;i<s.children.length;i++)s.children[i].classList.remove("ax-on");
    try{s.scrollTo({left:idx*Math.max(1,s.clientWidth),behavior:"instant"})}catch(e){s.scrollLeft=idx*Math.max(1,s.clientWidth)}
    if(typeof axExiDots==="function")axExiDots(box);
  }

  function startAnim(box,s,btn){
    clearTm(box);
    if(s.children.length<2)return;
    var cur=box.classList.contains("ax-anim")?(box._axFi||0):Math.round(s.scrollLeft/Math.max(1,s.clientWidth));
    s.scrollLeft=0;
    box.classList.add("ax-anim");
    setFrame(box,s,cur);
    setBtn(btn,true);
    box._axTm=setInterval(function(){
      if(!box.isConnected){clearTm(box);return}   /* box was re-rendered: stop its timer */
      if(document.hidden)return;
      if(s.children.length<2){stopAnim(box,s,btn);return}
      setFrame(box,s,(box._axFi||0)+1);
    },MSPF);
  }

  function enhanceBox(box){
    if(!box||box._axEnh)return;
    var s=box.querySelector(".ax-exs");
    if(!s||s.children.length<2)return;
    box._axEnh=1;
    var btn=document.createElement("button");
    btn.type="button";btn.className="ax-ex-play";
    box.appendChild(btn);
    btn.addEventListener("click",function(e){
      e.preventDefault();e.stopPropagation();
      hx("tick");
      if(box.classList.contains("ax-anim")){PR.exAnim=0;save();stopAnim(box,s,btn)}
      else{PR.exAnim=1;save();startAnim(box,s,btn)}
    });
    /* While playing, a tap on the picture advances one frame; when paused the original scroll handler runs. */
    s.addEventListener("click",function(e){
      if(!box.classList.contains("ax-anim"))return;
      e.stopImmediatePropagation();
      hx("tick");
      setFrame(box,s,(box._axFi||0)+1);
    },true);
    if(PR.exAnim!==0&&!RM)startAnim(box,s,btn);else stopAnim(box,s,btn);
  }

  var _bind=window.axExiBind;
  if(typeof _bind==="function")window.axExiBind=function(box){_bind.apply(this,arguments);enhanceBox(box)};

  var _err=window.axExiErr;
  if(typeof _err==="function")window.axExiErr=function(im){
    var box=im&&im.closest&&im.closest(".ax-exi");
    _err.apply(this,arguments);
    if(box&&box.isConnected){
      var s=box.querySelector(".ax-exs"),btn=box.querySelector(".ax-ex-play");
      if(s&&s.children.length<2){clearTm(box);box.classList.remove("ax-anim");if(btn)btn.remove()}
    }
  };
})();

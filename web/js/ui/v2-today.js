/* Arya Fit V2 P2 — Today presentation. Reuses existing plan data and controls. */
(function(w,d){
  "use strict";
  var root=d.documentElement,home=d.getElementById("ax-v-home"),hero=null,up=null,week=null,coach=null,busy=false,coachButton=null,coachParent=null,coachNext=null,coachText=null,coachLabel=null;
  if(!home)return;
  function el(tag,cls){var n=d.createElement(tag);n.className=cls;return n}
  function safe(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
  function active(){return root.classList.contains("v2")}
  function currentIndex(){try{return typeof Dn==="function"?Dn():Math.max(0,Math.min((window.ND||1)-1,todayIdx()))}catch(e){return 0}}
  function getDay(i){try{var si=typeof axSrc==="function"?axSrc(i):i;return si<0?{n:"Planned rest",s:"Recovery day",r:1,x:[]}:T[wdk(si)]}catch(e){return{n:"Today's session",s:"Move at your pace",x:[]}}}
  function counts(i){try{var a=items(i),n=0;a.forEach(function(q){if(st[k(i,q[1])])n++});return[n,a.length,a]}catch(e){return[0,0,[]]}}
  function ensure(){
    if(!hero){hero=el("div","v2-today-hero");hero.setAttribute("aria-live","polite");hero.hidden=true;home.appendChild(hero)}
    if(!up){up=el("section","v2-today-section v2-up-next");up.hidden=true;home.appendChild(up)}
    if(!week){week=el("section","v2-today-section v2-this-week");week.hidden=true;home.appendChild(week)}
    if(!coach){coach=el("section","v2-today-section v2-coach-section");coach.hidden=true;home.appendChild(coach)}
  }
  function exerciseImage(name){try{var slug=exSlug(name),letters=EXI[slug];if(!letters)return"";return"images/exercises/arya-ex-"+slug+"-"+letters.charAt(0)+".webp"}catch(e){return""}}
  function render(){
    if(busy)return;busy=true;
    try{
      ensure();if(!active()){hero.hidden=up.hidden=week.hidden=coach.hidden=true;busy=false;return}
      hero.hidden=up.hidden=week.hidden=coach.hidden=false;
      var i=currentIndex(),t=getDay(i),c=counts(i),left=Math.max(0,c[1]-c[0]),w=Math.floor(i/7)+1,day=(i%7)+1;
      var words=String(t.n||"Today's workout").trim().split(/\s+/),last=words.length>1?words.pop():"day",first=words.join(" ");
      if(!first){first=last;last="day"}
      hero.innerHTML='<p class="v2-today-eyebrow">WEEK '+w+' · DAY '+day+'</p><h1 class="v2-today-title">'+safe(first)+'<em>'+safe(last)+'</em></h1><div class="v2-today-metric"><strong>'+left+'</strong><span>'+(left===1?"activity":"activities")+' left today</span></div>';
      up.innerHTML='<div class="v2-today-section-head"><h2>Up next</h2><span>'+c[0]+'/'+c[1]+' done</span></div><div class="v2-today-cards">'+c[2].filter(function(q){return /^e\d+$/.test(q[1])}).slice(0,8).map(function(q){var src=exerciseImage(q[2]);return'<article class="v2-today-card"><div class="v2-today-thumb">'+(src?'<img src="'+src+'" alt="" width="1024" height="1024" loading="lazy" decoding="async">':'<span class="v2-today-placeholder">AF</span>')+'</div><b>'+safe(q[2])+'</b><small>'+safe(q[3])+'</small></article>'}).join("")+'</div>';
      var days=[],base=Math.max(0,Math.floor(i/7)*7),limit=Math.min((window.ND||28),base+7);
      for(var j=base;j<limit;j++){var dt=getDay(j),weekItems=counts(j)[2].filter(function(q){return /^e\d+$/.test(q[1])}),weekSrc=weekItems.length?exerciseImage(weekItems[0][2]):"";days.push('<div class="v2-week-day"><strong>'+(j+1)+'</strong>'+(weekSrc?'<img src="'+weekSrc+'" alt="" width="1024" height="1024" loading="lazy" decoding="async">':'<i aria-hidden="true">·</i>')+'<span>'+safe(dt.n||"Recovery")+'</span></div>')}
      week.innerHTML='<div class="v2-today-section-head"><h2>This week</h2><span>WEEK '+w+'</span></div><div class="v2-week-list">'+days.join("")+'</div>';
      var btn=d.getElementById("ax-coach-open");
      if(btn){
        if(!coachButton){coachButton=btn;coachParent=btn.parentNode;coachNext=btn.nextSibling;coachText=btn.textContent;coachLabel=btn.getAttribute("aria-label")}
        if(!coach.querySelector(".v2-coach-row")){
          var row=el("div","v2-coach-row"),ico=el("span","v2-coach-icon"),copy=el("span","v2-coach-copy"),title=el("b",""),sub=el("small","");
          ico.setAttribute("aria-hidden","true");ico.innerHTML="<svg viewBox=\"0 0 24 24\" width=\"21\" height=\"21\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"><path d=\"M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z\"/></svg>";title.textContent="Coach";sub.textContent="Plan guidance and weekly adjustments";
          copy.appendChild(title);copy.appendChild(sub);row.appendChild(ico);row.appendChild(copy);row.appendChild(btn);coach.innerHTML='<div class="v2-today-section-head"><h2>Coach</h2></div>';coach.appendChild(row);
        }
        btn.setAttribute("aria-label","Open Coach");if(btn.textContent!=="Open")btn.textContent="Open";
      }
    }catch(e){}
    busy=false;
  }
  function restoreCoach(){[hero,up,week,coach].forEach(function(n){if(n&&n.parentNode)n.parentNode.removeChild(n)});hero=up=week=coach=null;if(coachButton&&coachParent){if(coachButton.parentNode!==coachParent){if(coachNext&&coachNext.parentNode===coachParent)coachParent.insertBefore(coachButton,coachNext);else coachParent.appendChild(coachButton)}if(coachButton.textContent!==coachText)coachButton.textContent=coachText;if(coachLabel===null)coachButton.removeAttribute("aria-label");else coachButton.setAttribute("aria-label",coachLabel)}}
  function sync(){if(active())render();else restoreCoach()}
  var _home=w.home;if(typeof _home==="function")w.home=function(){var r=_home.apply(this,arguments);sync();return r};
  if(typeof MutationObserver!=="undefined"){var mo=new MutationObserver(function(ms){var external=false;for(var z=0;z<ms.length;z++){var target=ms[z].target;if(target===hero||target===up||target===week||target===coach||(coach&&coach.contains(target)))continue;external=true;break}if(external&&!busy&&active())render()});mo.observe(home,{childList:true,subtree:true,characterData:true})}
  if(w.AxV2&&typeof w.AxV2.apply==="function"){var _apply=w.AxV2.apply;w.AxV2.apply=function(){var r=_apply.apply(this,arguments);sync();return r}}
  d.addEventListener("DOMContentLoaded",sync);w.addEventListener("load",sync);sync();
})(window,document);

/* Arya Fit V2 shell: navigation, active-session shortcut and account popover. */
(function(w,d){
  "use strict";
  if(!d)return;
  var root=d.documentElement,wrap=null,full=null,collapsed=null,mini=null,miniCollapsed=null,avatar=null,pop=null,scrim=null,fade=null,host=null,lastY=0,collapsedState=false,raf=0,listenersReady=false,delegated=false,navObserver=null,dockObserver=null,hfObserver=null;
  function $(id){return d.getElementById(id)}
  function icon(name){
    var paths={
      home:'<path d="M3.5 10.5 12 3.5l8.5 7M5.5 9.5v10h13v-10M9 19.5v-6h6v6"/>',
      plan:'<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
      run:'<path d="m13 3-3 7h5l-4 11 3-9H9z"/>',
      progress:'<path d="M4 19V5M4 19h17M8 15l3-4 3 2 5-7"/>',
      search:'<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
      play:'<path d="m8 5 11 7-11 7z"/>',
      pause:'<path d="M8 5v14M16 5v14"/>',
      more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.3v-2.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2H15v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1z"/>',
      profile:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.2 3.1-4.8 7-4.8s6.2 1.6 7 4.8"/>',
      backup:'<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(paths[name]||paths.home)+'</svg>';
  }
  function activeView(){var ids=["home","plan","timers","prog","set","plans"],i,e;for(i=0;i<ids.length;i++){e=$("ax-v-"+ids[i]);if(e&&!e.hidden)return ids[i]}return "home"}
  function label(v){return v==="timers"?"Run":v==="prog"?"Progress":v==="plan"?"Plan":v==="set"?"Settings":v==="plans"?"Plans":"Today"}
  function setActive(v){
    var tabs=full?full.querySelectorAll("[data-v]"):[],i,cur;
    for(i=0;i<tabs.length;i++){if(tabs[i].getAttribute("data-v")===(v==="plans"?"plan":v))tabs[i].setAttribute("aria-current","page");else tabs[i].removeAttribute("aria-current")}
    cur=collapsed&&collapsed.querySelector(".v2-current-tab");
    if(avatar)avatar.hidden=(v!=="home");
    if(cur){cur.innerHTML=icon(v==="timers"?"run":v==="prog"?"progress":(v==="plan"||v==="plans")?"plan":v==="set"?"settings":"home");cur.setAttribute("aria-label",label(v)+" tab")}
  }
  function closePopover(){if(!pop)return;pop.classList.remove("is-open");scrim.classList.remove("is-open");avatar.setAttribute("aria-expanded","false")}
  function route(v){if(typeof w.go==="function")w.go(v);setActive(v);closePopover()}
  function openExercises(){closePopover();if(typeof w.axAdd==="function"){if(activeView()!=="plan")route("plan");w.setTimeout(function(){try{w.axAdd();var e=$("ax-cen");if(e){e.setAttribute("placeholder","Search exercises");e.focus()}}catch(x){}},90)}else route("plan")}
  function popToggle(){var open=!pop.classList.contains("is-open");pop.classList.toggle("is-open",open);scrim.classList.toggle("is-open",open);avatar.setAttribute("aria-expanded",open?"true":"false")}
  function makePopover(){
    avatar=d.createElement("button");avatar.type="button";avatar.className="v2-avatar";avatar.setAttribute("aria-label","Account and settings");avatar.setAttribute("aria-expanded","false");avatar.innerHTML='<span class="v2-avatar-mark">A</span>';
    scrim=d.createElement("div");scrim.className="v2-popover-scrim";scrim.addEventListener("click",closePopover);
    pop=d.createElement("section");pop.className="v2-popover v2-glass";pop.setAttribute("aria-label","Account menu");
    pop.innerHTML='<h2 class="v2-popover-title">Your account</h2><div class="v2-popover-account">AERUNO <span style="float:right;color:var(--v2-accent)">●</span><br><small>Personal training space</small></div><button type="button" class="v2-pop-row" data-action="profile">'+icon("profile")+'<span>Profile</span></button><button type="button" class="v2-pop-row" data-action="settings">'+icon("settings")+'<span>Settings</span></button><button type="button" class="v2-pop-row" data-action="backup">'+icon("backup")+'<span>Backup / Export</span></button>';
    avatar.addEventListener("click",popToggle);
    pop.addEventListener("click",function(e){var b=e.target.closest("[data-action]");if(!b)return;var a=b.getAttribute("data-action");closePopover();if(a==="backup"){var x=$("ex");if(x)x.click()}else route("set")});
    d.body.appendChild(avatar);d.body.appendChild(scrim);d.body.appendChild(pop);
  }
  function miniExercise(){
    try{var a=typeof items==="function"?items(typeof cur==="number"?cur:0):[],i;
      for(i=0;i<a.length;i++)if(/^e\\d+$/.test(a[i][1])&&!st[k(cur,a[i][1])])return a[i][2];
      for(i=0;i<a.length;i++)if(/^e\\d+$/.test(a[i][1]))return a[i][2]
    }catch(e){}return""
  }
  function sessionInfo(){
    var hf=$("gov"),dock=$("dock"),tm=w.TM,title,sub="",t,lab,desc,ex="",src="",im;
    if(hf&&hf.classList.contains("ax-hf")){
      title=(hf.querySelector(".ax-hf-title")||{}).textContent||"Workout";
      sub=(hf.querySelector(".ax-hf-prog")||{}).textContent||"Hands-free session";
      im=hf.querySelector(".ax-exi img");if(im)src=im.getAttribute("src")||im.src||"";
      return{title:title,sub:sub,running:true,src:src,handsfree:true}
    }
    if(!dock||dock.hidden||!tm)return null;
    ex=tm.mode==="cd"?(tm.label||""):"";
    title=tm.mode==="iv"?"Run":tm.mode==="cd"?(tm.label||"Timer"):ex||tm.label||"Workout";
    t=$("dt");lab=$("dlab");desc=$("dsub");
    if(tm.mode==="iv"&&lab&&lab.textContent)title="Run";
    if(t&&t.textContent)sub=t.textContent;if(desc&&desc.textContent)sub+=(sub?" · ":"")+desc.textContent;
    if(tm.mode==="cd"&&ex&&w.EXI&&w.exSlug&&w.EXI[w.exSlug(ex)])sub="Exercise timer · "+(tm.run?"In progress":"Paused");
    try{if(ex&&w.EXI&&w.exSlug&&w.IMX){var clean=ex.replace(/\s*\([^)]*\)\s*$/,""),sl=w.exSlug(clean),fr=w.EXI[sl];if(fr)src=w.IMX+"arya-ex-"+sl+"-"+fr.charAt(0)+".webp"}}catch(e){}
    return{title:title,sub:sub||(tm.run?"In progress":"Paused"),running:!!tm.run,src:src};
  }
  function paintMini(el,s){var title,sub,play,thumb;if(!el)return;el.classList.toggle("is-visible",!!s);if(!s)return;title=el.querySelector(".v2-mini-copy b");sub=el.querySelector(".v2-mini-copy span");play=el.querySelector("[data-mini-play]");thumb=el.querySelector(".v2-mini-thumb");if(title)title.textContent=s.title;if(sub)sub.textContent=s.sub;if(thumb){thumb.innerHTML=s.src?'<img src="'+s.src+'" alt="" width="1024" height="1024" loading="lazy" decoding="async">':icon("run");var im=thumb.querySelector("img");if(im)im.onerror=function(){thumb.innerHTML=icon("run")}}if(play){play.innerHTML=icon(s.running?"pause":"play");play.setAttribute("aria-label",s.running?"Pause session":"Resume session")}}
  function miniAction(el,e){var target=e.target.closest("button"),hf=$("gov");if(target&&target.hasAttribute("data-mini-play")){if(hf&&hf.classList.contains("ax-hf")){var hp=$("ax-hf-pau");if(hp)hp.click()}else{var p=$("dpp");if(p)p.click()}syncMini();return}if(hf&&hf.classList.contains("ax-hf")){hf.scrollIntoView({block:"start"});return}var tm=w.TM;if(tm&&tm.mode==="iv"){route("timers")}else if(tm&&tm.mode==="sw"){route("plan");w.setTimeout(function(){var dk=$("dock");if(dk)dk.classList.add("ax-fs")},80)}else{var m=$("ax-dmore");if(m)m.click()}var dk2=$("dock");if(dk2)dk2.classList.remove("ax-mo")}
  function syncMini(){var s=sessionInfo();paintMini(mini,s);paintMini(miniCollapsed,s)}
  function build(){
    if(!root.classList.contains("v2")||$("v2-shell-controls"))return;
    var hostEl=d.createElement("div"),fadeEl=d.createElement("div"),miniEl=d.createElement("div"),bottomRow=d.createElement("div"),navWrap=d.createElement("div"),items=[ ["home","home","Today"],["plan","plan","Plan"],["timers","run","Run"],["prog","progress","Progress"] ],i,it,b,search,current,search2;
    hostEl.id="v2-shell-controls";hostEl.className="v2-shell-controls";host=hostEl;fadeEl.className="v2-top-fade";fade=fadeEl;
    miniEl.className="v2-mini v2-glass";miniEl.innerHTML='<span class="v2-mini-thumb" aria-hidden="true">'+icon("run")+'</span><span class="v2-mini-copy"><b>Session</b><span>In progress</span></span><button type="button" class="v2-mini-action" data-mini-play aria-label="Pause session">'+icon("pause")+'</button><button type="button" class="v2-mini-action" data-mini-open aria-label="Open session controls">'+icon("more")+'</button>';
    miniEl.addEventListener("click",function(e){miniAction(miniEl,e)});mini=miniEl;
    bottomRow.className="v2-bottom-row";navWrap.className="v2-nav-wrap";wrap=navWrap;
    full=d.createElement("nav");full.className="v2-nav v2-glass";full.setAttribute("aria-label","Main navigation");
    for(i=0;i<items.length;i++){it=items[i];b=d.createElement("button");b.type="button";b.className="v2-tab";b.setAttribute("data-v",it[0]);b.innerHTML=icon(it[1])+"<span>"+it[2]+"</span>";(function(v){b.addEventListener("click",function(){route(v)})})(it[0]);full.appendChild(b)}
    
    collapsed=d.createElement("div");collapsed.className="v2-collapsed";
    miniCollapsed=miniEl.cloneNode(true);miniCollapsed.className="v2-mini v2-mini-collapsed v2-glass";miniCollapsed.addEventListener("click",function(e){miniAction(miniCollapsed,e)});
    current=d.createElement("button");current.type="button";current.className="v2-current-tab v2-glass";current.setAttribute("aria-label","Current tab");current.addEventListener("click",function(){route(activeView())});collapsed.appendChild(current);collapsed.appendChild(miniCollapsed);
    search2=d.createElement("button");search2.type="button";search2.className="v2-icon-button v2-search-button v2-glass";search2.setAttribute("aria-label","Search exercises");search2.innerHTML=icon("search");search2.addEventListener("click",openExercises);
    navWrap.appendChild(full);navWrap.appendChild(collapsed);bottomRow.appendChild(navWrap);bottomRow.appendChild(search2);hostEl.appendChild(miniEl);hostEl.appendChild(bottomRow);d.body.appendChild(fadeEl);d.body.appendChild(hostEl);
    makePopover();setActive(activeView());
    var oldNav=$("ax-nav");if(oldNav){if(navObserver)navObserver.disconnect();navObserver=new MutationObserver(function(){setActive(activeView())});navObserver.observe(oldNav,{subtree:true,attributes:true,attributeFilter:["class"]})}
    var dock=$("dock");if(dock){if(dockObserver)dockObserver.disconnect();dockObserver=new MutationObserver(syncMini);dockObserver.observe(dock,{attributes:true,childList:true,subtree:true,characterData:true,attributeFilter:["hidden","class"]});syncMini()}
    if(!delegated){delegated=true;d.addEventListener("click",function(e){if(e.target.closest&&e.target.closest("#ax-v-home,#ax-v-plan,#ax-v-timers,#ax-v-prog,#ax-v-set"))setActive(activeView())})}
  }
  function onScroll(){if(raf)return;raf=w.requestAnimationFrame(function(){raf=0;var y=w.pageYOffset||root.scrollTop||0,dir=w.AxV2&&w.AxV2.scrollDirection?w.AxV2.scrollDirection(lastY,y,{collapsed:collapsedState}):(y>lastY?"down":"up");if(y<12)collapsedState=false;else if(dir==="down"&&y>24)collapsedState=true;else if(dir==="up")collapsedState=false;if(wrap)wrap.classList.toggle("is-collapsed",collapsedState);if(host)host.classList.toggle("is-collapsed",collapsedState);lastY=y})}
  function init(){if(root.classList.contains("v2"))build();if(!listenersReady){listenersReady=true;w.addEventListener("scroll",onScroll,{passive:true});w.addEventListener("pageshow",syncMini);d.addEventListener("visibilitychange",syncMini)}}
  if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",init);else init();
  var oldApply=w.AxV2&&w.AxV2.apply;
  if(w.AxV2&&oldApply){w.AxV2.apply=function(){oldApply();if(root.classList.contains("v2")){if(!$("v2-shell-controls"))build()}else{var h=$("v2-shell-controls"),a=d.querySelector(".v2-avatar"),p=d.querySelector(".v2-popover"),s=d.querySelector(".v2-popover-scrim"),f=d.querySelector(".v2-top-fade");if(h)h.remove();if(a)a.remove();if(p)p.remove();if(s)s.remove();if(f)f.remove();if(navObserver)navObserver.disconnect();if(dockObserver)dockObserver.disconnect()}}}
})(window,document);

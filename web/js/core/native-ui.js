/* v64 native insets bridge (MainActivity exposes window.AxInsets; absent in browser/PWA, then env() alone is used) */
document.addEventListener("contextmenu",function(e){if(!/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))e.preventDefault()});
/* v67 floating controls: menu drawer, start, quick actions */
var AXI={home:'<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',plan:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',ok:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',save:'<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 19h14"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',plus:'<path d="M12 5v14M5 12h14"/>',heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'};
function axDrItem(id,ic,t,sub){return '<button class="ax-dr-it" id="'+id+'" type="button"><svg viewBox="0 0 24 24">'+AXI[ic]+'</svg><span><b>'+t+'</b>'+(sub?'<em>'+esc(sub)+'</em>':'')+'</span></button>'}
function axDrawer(on){var d=$("ax-drawer"),sc=$("ax-dscrim");if(!d)return;
  if(on){axDrawerFill();axGuard();hx("soft")}
  d.classList.toggle("on",!!on);sc.classList.toggle("on",!!on);d.setAttribute("aria-hidden",on?"false":"true");document.body.classList.toggle("ax-drawer-open",!!on)}
function axDrawerFill(){var td=todayIdx(),inP=td>=0&&td<ND,nm=(P&&P.name)||"Your plan",who=(P&&P.athlete)||"",xs=st["x"+Dn()];
  var tag=td<0?"Starts soon":td>ND-1?"Plan complete":"Day "+(td+1)+" of "+ND;
  var h='<div class="ax-dr-head"><span class="ax-dr-mark"><svg viewBox="0 0 24 24"><path d="M3 18l6-9 4 6 3-4 5 7z"/></svg></span><div><b>Arya Fit</b><em>'+esc(who||"Your training")+'</em></div></div><p class="ax-dr-plan">'+esc(nm)+' · '+esc(tag)+'</p>'
   +axDrItem("ax-dr-home","home","Home","Today at a glance")+axDrItem("ax-dr-plan","plan","Today's plan","Open and tick today's activities")
   +(inP?axDrItem("ax-dr-close","ok",xs?"Reopen today":"Close today",xs?"Day is closed":"Rest day or call it a day"):"")
   +'<div class="ax-dr-sep"></div>'+axDrItem("ax-dr-plans","swap","Plans","Switch, import or export a plan")+axDrItem("ax-dr-add","plus","Add exercise","To a day of the current plan")
   +axDrItem("ax-dr-exp","save","Export backup","Save everything to a file")
   +'<div class="ax-dr-sep"></div>'+axDrItem("ax-dr-set","gear","Settings")+axDrItem("ax-dr-about","info","About and credits");
  $("ax-drawer").innerHTML=h;
  var b=function(id,fn){var e=$(id);if(e)e.onclick=function(){axDrawer(false);setTimeout(fn,60)}};
  b("ax-dr-home",function(){go("home")});b("ax-dr-plan",function(){cur=Dn();go("plan");render()});
  b("ax-dr-close",function(){cur=Dn();go("plan");render();axClose()});
  b("ax-dr-plans",function(){go("plans")});b("ax-dr-add",function(){cur=Dn();go("plan");render();axAdd()});
  b("ax-dr-exp",function(){$("ex").click()});b("ax-dr-set",function(){go("set")});
  b("ax-dr-about",function(){go("set");var c=$("ax-credits");if(c){c.open=true;setTimeout(function(){c.scrollIntoView({behavior:"smooth",block:"start"})},140)}})}
function axTopMore(){var td=todayIdx(),inP=td>=0&&td<ND,xs=st["x"+Dn()];
  axSheet("Quick actions",(inP?'<button class="ax-opt" id="ax-q1"><b>'+(xs?"Reopen today":"Close today")+'</b><span>'+(xs?"Day is closed":"Rest day or call it a day")+'</span></button>':'')
   +'<button class="ax-opt" id="ax-q2"><b>Smart Today check-in</b><span>Sleep, energy and soreness</span></button><button class="ax-opt" id="ax-q3"><b>Add exercise</b><span>To a day of the current plan</span></button><button class="ax-opt" id="ax-q4"><b>Export backup</b><span>Save everything to a file</span></button>');
  var q=function(id,fn){var e=$(id);if(e)e.onclick=function(){axSheetX();setTimeout(fn,60)}};
  q("ax-q1",function(){cur=Dn();go("plan");render();axClose()});
  q("ax-q2",function(){go("home");window.axBrainOpen&&axBrainOpen();var e=$("ax-hbrain");if(e)e.scrollIntoView({behavior:"smooth",block:"center"})});
  q("ax-q3",function(){cur=Dn();go("plan");render();axAdd()});q("ax-q4",function(){$("ex").click()})}
$("ax-tmenu").onclick=function(){axDrawer(true)};$("ax-dscrim").onclick=function(){axDrawer(false)};
$("ax-tgo").onclick=function(){hx("med");cur=Dn();go("plan");render();window.scrollTo(0,0)};
$("ax-tmore").onclick=axTopMore;
function axSI(t,r,b,l){var st=document.documentElement.style;try{syncSystemBarStyle()}catch(e){}st.setProperty("--ax-si-t",(+t||0)+"px");st.setProperty("--ax-si-b",(+b||0)+"px");requestAnimationFrame(function(){try{axNavH()}catch(e){}})}
function axSIPull(){try{if(window.AxInsets){var v=String(AxInsets.get()).split(",");axSI(v[0],v[1],v[2],v[3])}}catch(e){}}
window.axSI=axSI;axSIPull();window.addEventListener("resize",axSIPull);document.addEventListener("visibilitychange",axSIPull);
function axIsDark(){try{var rs=getComputedStyle(document.documentElement);if(!String(rs.getPropertyValue("--bg")).trim())return null;
  var e=document.createElement("i");e.style.cssText="position:absolute;width:0;height:0;visibility:hidden;color:var(--bg)";document.body.appendChild(e);var c=getComputedStyle(e).color;e.remove();
  var n=String(c).match(/-?[\d.]+/g);if(!n||n.length<3)return null;var f=/^color\(/.test(c)?255:1;return(0.299*n[0]*f+0.587*n[1]*f+0.114*n[2]*f)<128}catch(x){return null}}
/* Status bar and navigation bar icons: black on light themes, white on dark themes. Decided from the real page background colour, not from the OS setting. */
function syncSystemBarStyle(){var h=document.documentElement,dark=axIsDark();
  if(dark===null){var sk=h.getAttribute("data-skin")||"classic";dark=h.getAttribute("data-theme")==="dark"||(!h.hasAttribute("data-theme")&&!!(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches))||sk==="midnight"||sk==="sunset"||!!PR.amo}
  try{var mt=document.querySelector('meta[name="theme-color"]');if(mt){var bc=getComputedStyle(h).getPropertyValue("--bg").trim();if(bc)mt.setAttribute("content",bc)}}catch(e0){}
  try{var cap=window.Capacitor,bar=cap&&cap.Plugins&&cap.Plugins.StatusBar;if(bar){var q=function(r){if(r&&r.catch)r.catch(function(){})};q(bar.setOverlaysWebView({overlay:true}));/* Capacitor Style.Dark = light icons for dark backgrounds */q(bar.setStyle({style:dark?"DARK":"LIGHT"}))}}catch(e1){}
  try{if(window.AxInsets)AxInsets.style(!!dark)}catch(e2){}}

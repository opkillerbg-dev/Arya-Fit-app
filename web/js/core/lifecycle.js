/* Step 8b: Android back button (history guard entry; native app only) */
var AXG=0;
function axGuard(){if(AXG||!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()))return;try{history.pushState({g:1},"");AXG=1}catch(e){}}
function axView(){for(var i=0;i<VIEWS.length;i++)if(!$("ax-v-"+VIEWS[i]).hidden)return VIEWS[i];return"home"}
/* v96: one function decides what "back" means. Returns 1 if it closed or went back something, 0 when already at the Home screen with nothing open.
   Used by the native back button (js/features/backnav.js, @capacitor/app) and by the history fallback below. */
function axBack(){var d=$("dock"),c=$("cel"),g;
 if($("ax-drawer").classList.contains("on")){axDrawer(false);return 1}
 if(window.AxOnboard&&AxOnboard.back())return 1;
 if(window.axSetBack&&axSetBack())return 1;
 if(!$("ax-sh").hidden){axSheetX();return 1}
 if(c){c.remove();return 1}
 g=$("gov");if(g){var hx_=$("ax-hf-exit");if(hx_)hx_.click();else g.remove();return 1}
 if(!d.hidden&&d.classList.contains("ax-mo")){d.classList.remove("ax-mo");return 1}
 if(!d.hidden&&d.classList.contains("ax-fs")){d.classList.remove("ax-fs");return 1}
 var v=axView();
 if(v=="plans"){go("set");return 1}
 if(v!="home"){go("home");return 1}
 return 0}
window.addEventListener("popstate",function(){AXG=0;if(axBack()){axGuard();return}toast("Press back again to exit");setTimeout(axGuard,2200)});
axGuard();
try{PRUN=JSON.parse(localStorage.getItem(RK))}catch(e){PRUN=null}
try{LAST=JSON.parse(localStorage.getItem(LK))}catch(e){LAST=null}
/* v90: register the service worker after the first screen is up (it downloads and caches the whole app, which competed with startup) */
window.addEventListener("load",function(){setTimeout(function(){try{if("serviceWorker" in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register("sw.js")}catch(e){}},2500)});
/* v48 auto-close: any plan day older than yesterday that is still open gets closed (rest if nothing done, "call it a day" if partly done) */
function axAutoClose(){try{if(!APP||!st)return 0;var td=todayIdx(),lim=Math.min(td-2,ND-1),n=0;
  for(var q=0;q<=lim;q++){if(st["x"+q]||dayDone(q))continue;var c=cnt(q),act=c[0]>0||(st["g"+q]||0)>0||(st["r"+q]||0)>0||(st["w"+q]||0)>0;st["x"+q]=act?2:1;n++}
  if(n)save();return n}catch(e){return 0}}
var AC_TD=null;
function axAcRun(){var n=axAutoClose();if(n){render();toast("Auto-closed "+n+(n>1?" past days":" past day"));hx("ok")}}
setInterval(function(){var t=todayIdx();if(AC_TD!==null&&t!==AC_TD)axAcRun();AC_TD=t},60000);
document.addEventListener("visibilitychange",function(){if(!document.hidden)axAcRun()});
function axNavH(){var n=document.getElementById("ax-nav");if(n)document.documentElement.style.setProperty("--ax-navh",Math.round(n.getBoundingClientRect().height)+"px")}
axNavH();window.addEventListener("resize",axNavH);window.addEventListener("load",axNavH);try{if(window.ResizeObserver)new ResizeObserver(axNavH).observe(document.getElementById("ax-nav"))}catch(e){}
loadApp();bindApp();bindPlans();bindExtra();if(!TM)nclr();if(PR.rmt)remind(1);go("home");stepsInit();AC_TD=todayIdx();axAcRun();axLbk();setTimeout(stats,250);

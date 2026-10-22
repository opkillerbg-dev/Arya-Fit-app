/* Arya Fit v96: Android back button through Capacitor's own event (@capacitor/app).
   Back closes whatever is open, then goes from any tab to Home; on Home the first press shows "Press back again to exit" and a second
   press within 2.2 s exits. The older history trick in core/lifecycle.js (kept as a fallback when the plugin is missing) relied on the
   WebView keeping a history entry, which it can skip, so back exited the app straight away. */
(function(){
  "use strict";
  var NAT=window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform(),AP=NAT&&Capacitor.Plugins&&Capacitor.Plugins.App,pend=0,tm=null;
  if(!AP||!AP.addListener)return;
  try{
    var r=AP.addListener("backButton",function(){
      var ok=0;try{ok=axBack()}catch(e){}
      if(ok){pend=0;return}
      if(pend){try{AP.exitApp()}catch(e){}return}
      pend=1;try{toast("Press back again to exit")}catch(e){}
      clearTimeout(tm);tm=setTimeout(function(){pend=0},2200)});
    if(r&&r.catch)r.catch(function(){})
  }catch(e){}
})();

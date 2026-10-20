/* Arya Fit v73: backup nudge. Export already opens the Android share sheet (pick Google Drive there).
   This adds a Home reminder card when the last backup is old, and a Drive tip under the Export button. */
(function(){
  "use strict";
  var WEEK=7*864e5,SNOOZE=3*864e5;

  function stale(){
    var now=Date.now();
    if(PR.bkz&&now<PR.bkz)return false;
    if(window.axSyncOk&&axSyncOk())return false;  /* auto sync is keeping a copy */
    if(PR.lbk)return now-PR.lbk>WEEK;
    var td=todayIdx();return td>=3;  /* never backed up and the plan is under way */
  }
  function ago(){
    if(!PR.lbk)return "You have never saved a backup.";
    var d=Math.floor((Date.now()-PR.lbk)/864e5);return "Your last backup was "+d+" day"+(d===1?"":"s")+" ago.";
  }

  function paintNudge(){
    var old=$("ax-bk-nudge"),anchor=$("ax-hbrain");
    if(!stale()){if(old)old.remove();return}
    if(old||!anchor||!anchor.parentNode)return;
    var c=document.createElement("div");
    c.id="ax-bk-nudge";c.className="ax-card";
    c.innerHTML='<p class="ax-cap">Back up</p><p class="ax-sub">'+ago()+' If you change phones or reinstall, progress is lost without one. Choose Google Drive in the share sheet.</p><div class="ax-chips"><button type="button" class="ax-btn ax-pri" id="ax-bk-go">Back up now</button><button type="button" class="ax-btn" id="ax-bk-later">Later</button></div>';
    anchor.parentNode.insertBefore(c,anchor);
    $("ax-bk-go").onclick=function(){c.remove();$("ex").click()};
    $("ax-bk-later").onclick=function(){PR.bkz=Date.now()+SNOOZE;save();c.remove()};
  }

  function tip(){
    var l=$("ax-lbk");if(!l||$("ax-bk-tip"))return;
    var p=document.createElement("p");p.id="ax-bk-tip";p.className="ax-lbk";
    p.textContent="Tip: in the share sheet choose Google Drive to keep a copy off the phone. Import it here after a reinstall.";
    l.parentNode.insertBefore(p,l.nextSibling);
  }

  var _home=window.home;
  if(typeof _home==="function")window.home=function(){var r=_home.apply(this,arguments);try{paintNudge();tip()}catch(e){}return r};
  try{tip()}catch(e){}
})();

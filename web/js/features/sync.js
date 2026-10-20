/* Arya Fit v85: auto sync. Keeps one sync file (pick Google Drive, or any folder, once) up to date and pulls newer data on open.
   Native side: SyncFilePlugin (Android document picker, persistable permission, silent read/write). No Google Cloud project needed.
   Rule: never overwrite either side silently when both changed; ask. */
(function(){
  "use strict";
  var KEY="axSync",END="\n#END",MIN_GAP=20000,busy=false,lastPush=0;

  function SF(){return window.__axSyncFile||(window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.SyncFile)||null}
  function load(){var o={};try{o=JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){}
    if(!o.devId)o.devId=Math.random().toString(36).slice(2,10);return o}
  var S=load();
  function keep(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

  function hash(txt){
    var t=String(txt).replace(/"exported":\s*"[^"]*",?/,""),h=5381;
    for(var i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;
    return String(h);
  }
  function when(ts){return new Date(ts).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}

  function readRemote(){
    return SF().read().then(function(r){
      var t=String((r&&r.text)||"");
      var cut=t.indexOf(END);if(cut>=0)t=t.slice(0,cut);
      t=t.trim();if(!t)return{env:null};
      try{var e=JSON.parse(t);if(e&&e.app==="arya-fit-sync"&&typeof e.data==="string"&&e.ts)return{env:e}}catch(x){}
      return{env:null,bad:true};
    });
  }

  function push(txt,h){
    var ts=Date.now(),env={app:"arya-fit-sync",v:1,ts:ts,dev:S.devId,data:txt};
    return SF().write({text:JSON.stringify(env)+END}).then(function(){
      S.baseTs=ts;S.baseHash=h;S.last=ts;S.err="";keep();lastPush=ts;
    });
  }

  function applyRemote(env){
    doImport(env.data);
    S.baseTs=env.ts;S.baseHash=hash(pack());S.last=Date.now();S.err="";keep();
  }

  function isFresh(){try{var m=axMeta();return !m.ticks&&!m.runDays&&m.stepDays<=1}catch(e){return false}}

  function ask(env,txt,h,quiet){
    if(quiet)return Promise.resolve();
    return new Promise(function(res){
      axSheet("Which copy do you want?",
        '<p class="ax-sub">The sync file was saved '+esc(when(env.ts))+'. This phone also has changes. Pick one. The other is replaced.</p>'
        +'<div class="ax-chips"><button type="button" class="ax-btn ax-pri" id="ax-sy-use">Use the synced copy</button><button type="button" class="ax-btn" id="ax-sy-keep">Keep this phone</button></div>');
      var done=false;
      function fin(f){if(done)return;done=true;try{axSheetX()}catch(e){}Promise.resolve(f&&f()).then(res,res)}
      $("ax-sy-use").onclick=function(){fin(function(){applyRemote(env);paint()})};
      $("ax-sy-keep").onclick=function(){fin(function(){return push(txt,h).then(paint)})};
    });
  }

  /* one pass: reason = "open" | "tick" | "hide" | "now" | "link" */
  function sync(reason){
    var sf=SF();
    if(!sf||!S.on||busy)return Promise.resolve();
    busy=true;var quiet=(reason==="hide"),loud=(reason==="now"||reason==="link");
    if(loud&&window.axBusy)axBusy("Syncing...");
    return readRemote().then(function(rr){
      return packFresh().then(function(txt){
        var h=hash(txt),dirty=h!==S.baseHash,env=rr.env;
        if(rr.bad){S.err="The sync file isn't an Arya Fit file.";keep();return}
        if(!env){return push(txt,h)}                              /* empty file: first push */
        if(env.ts===S.baseTs){                                    /* remote unchanged since our last sync */
          if(dirty&&(loud||Date.now()-lastPush>MIN_GAP))return push(txt,h);
          return;
        }
        if(env.data&&hash(env.data)===h){S.baseTs=env.ts;S.baseHash=h;S.last=Date.now();keep();return}  /* same content */
        if(!dirty||isFresh()){                                    /* nothing of ours to lose */
          if(quiet)return;
          applyRemote(env);toast("Synced from your sync file.");return;
        }
        return ask(env,txt,h,quiet);                              /* both sides changed */
      });
    }).then(function(){S.err="";keep()},function(e){
      S.err=String((e&&e.message)||e||"failed");
      if(/permission/i.test(S.err))S.err="Access to the sync file was lost. Turn sync off and on again.";
      keep();if(loud)toast("Sync problem: "+S.err);
    }).then(function(){busy=false;if(window.axBusyDone&&loud)axBusyDone();paint()});
  }

  /* ---------- settings card ---------- */
  function paint(){
    var st=$("ax-sy-st");if(!st)return;
    var sf=SF();
    if(!sf){st.textContent="Available in the Android app.";["ax-sy-on","ax-sy-open","ax-sy-now","ax-sy-off"].forEach(function(i){var b=$(i);if(b)b.hidden=true});return}
    if(S.on){
      st.textContent="On"+(S.name?" · "+S.name:"")+(S.last?" · synced "+when(S.last):"")+(S.err?" · "+S.err:"");
    }else st.textContent="Off. Keeps your progress in one file you choose (Google Drive works) and updates it by itself.";
    $("ax-sy-on").hidden=!!S.on;$("ax-sy-open").hidden=!!S.on;$("ax-sy-now").hidden=!S.on;$("ax-sy-off").hidden=!S.on;
  }

  function link(mode){
    SF().pick({mode:mode}).then(function(r){
      S.on=1;S.name=(r&&r.name)||"";S.baseTs=0;S.baseHash="";S.last=0;S.err="";keep();paint();
      return sync("link");
    }).catch(function(e){var m=String((e&&e.message)||e||"");if(!/cancel/i.test(m))toast("Couldn't link the file: "+m)});
  }

  function mount(){
    var anchor=$("ax-bk-tip")||$("ax-lbk");if(!anchor||$("ax-sy"))return;
    var d=document.createElement("div");d.id="ax-sy";d.className="ax-card";
    d.innerHTML='<h2 class="ax-h2">Auto sync</h2><p class="ax-sub">Pick a file once, for example in Google Drive. The app then updates it quietly when you leave the app and checks it when you open the app. On a new phone, choose the same file.</p><p class="ax-lbk" id="ax-sy-st"></p><div class="ax-chips"><button type="button" class="ax-btn ax-pri" id="ax-sy-on">Turn on (Choose where to save)</button><button type="button" class="ax-btn" id="ax-sy-open">Use an existing sync file</button><button type="button" class="ax-btn ax-pri" id="ax-sy-now">Sync now</button><button type="button" class="ax-btn" id="ax-sy-off">Turn off</button></div>';
    anchor.parentNode.insertBefore(d,anchor.nextSibling);
    $("ax-sy-on").onclick=function(){toast("Choose Google Drive, pick a folder, then Save.");setTimeout(function(){link("create")},500)};
    $("ax-sy-open").onclick=function(){toast("Choose your existing sync file.");setTimeout(function(){link("open")},500)};
    $("ax-sy-now").onclick=function(){sync("now")};
    $("ax-sy-off").onclick=function(){
      var sf=SF();Promise.resolve(sf&&sf.unlink()).catch(function(){}).then(function(){S.on=0;S.name="";S.baseTs=0;S.baseHash="";S.err="";keep();paint();toast("Auto sync is off. The file stays where it is.")});
    };
    paint();
  }

  /* when to sync */
  document.addEventListener("visibilitychange",function(){if(document.hidden)sync("hide")});
  setInterval(function(){if(!document.hidden)sync("tick")},10*60*1000);
  window.axSyncOk=function(){return !!(S.on&&S.last&&Date.now()-S.last<3*864e5)};
  window.axSync={run:sync,state:function(){return S}};

  setTimeout(function(){mount();sync("open")},3500);
  var _h=window.home;if(typeof _h==="function")window.home=function(){var r=_h.apply(this,arguments);try{mount()}catch(e){}return r};
})();

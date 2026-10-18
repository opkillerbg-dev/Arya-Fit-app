/* Arya Fit v73: online exercise library (yuhonas/free-exercise-db, public domain).
   Downloaded only when the user taps Download in Settings, cached in IndexedDB, then works offline.
   Feeds Swap exercise (more same-muscle alternatives) and a search box in Add exercise. */
(function(){
  "use strict";
  var URLS=["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json",
            "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json"];
  var MAP={abdominals:"abs",chest:"chest",shoulders:"shoulders",biceps:"biceps",triceps:"triceps",lats:"back","middle back":"back","lower back":"back",traps:"back",quadriceps:"quads",glutes:"glutes",abductors:"glutes",hamstrings:"hams",calves:"calves"};
  var DB="aryafit-lib",ST="kv",LIB=[],META=null;

  function idb(){
    return new Promise(function(res,rej){
      var r=indexedDB.open(DB,1);
      r.onupgradeneeded=function(){r.result.createObjectStore(ST)};
      r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)};
    });
  }
  function kvGet(key){return idb().then(function(db){return new Promise(function(res,rej){var q=db.transaction(ST).objectStore(ST).get(key);q.onsuccess=function(){res(q.result)};q.onerror=function(){rej(q.error)}})})}
  function kvSet(key,val){return idb().then(function(db){return new Promise(function(res,rej){var t=db.transaction(ST,"readwrite");t.objectStore(ST).put(val,key);t.oncomplete=res;t.onerror=function(){rej(t.error)}})})}
  function kvDel(key){return idb().then(function(db){return new Promise(function(res,rej){var t=db.transaction(ST,"readwrite");t.objectStore(ST).delete(key);t.oncomplete=res;t.onerror=function(){rej(t.error)}})})}

  function slim(a){
    var out=[];
    a.forEach(function(e){
      if(!e||typeof e.name!=="string")return;
      var pm=(e.primaryMuscles||[]).map(function(m){return MAP[String(m).toLowerCase()]}).filter(Boolean);
      if(!pm.length)return;
      var eq=e.equipment?String(e.equipment).toLowerCase():"body only";
      out.push({n:e.name.slice(0,60),m:pm[0],s:(e.secondaryMuscles||[]).map(function(m){return MAP[String(m).toLowerCase()]}).filter(Boolean).slice(0,3),q:eq,l:String(e.level||"").slice(0,12),t:((e.instructions||[]).slice(0,2).join(" ")).slice(0,200)});
    });
    return out;
  }

  function load(){
    return Promise.all([kvGet("list"),kvGet("meta")]).then(function(r){
      if(Array.isArray(r[0])&&r[0].length){LIB=r[0];META=r[1]||null}
      refresh();
    }).catch(function(){});
  }

  function fetchOne(i){
    if(i>=URLS.length)return Promise.reject(new Error("fail"));
    var ctl=window.AbortController?new AbortController():null,to=setTimeout(function(){if(ctl)ctl.abort()},25000);
    return fetch(URLS[i],ctl?{signal:ctl.signal}:{}).then(function(r){clearTimeout(to);if(!r.ok)throw new Error("http");return r.json()}).catch(function(){clearTimeout(to);return fetchOne(i+1)});
  }

  function download(){
    setStatus("Downloading...");
    if(window.axBusy)axBusy("Downloading library...");
    return fetchOne(0).then(function(raw){
      if(!Array.isArray(raw)||raw.length<50)throw new Error("bad");
      var s=slim(raw);if(s.length<50)throw new Error("bad");
      LIB=s;META={t:Date.now(),n:s.length};
      return Promise.all([kvSet("list",s),kvSet("meta",META)]);
    }).then(function(){refresh();toast("Library ready: "+LIB.length+" exercises")})
      .catch(function(){setStatus("Couldn't download. Check your internet and try again.")})
      .then(function(){if(window.axBusyDone)axBusyDone()});
  }

  function clearLib(){LIB=[];META=null;return Promise.all([kvDel("list"),kvDel("meta")]).then(refresh).catch(refresh)}

  function bodyOnly(e){return e.q==="body only"||e.q==="none"||e.q==="other"}

  var API=window.axLib={
    ready:function(){return LIB.length>0},
    prim:function(name){var k=String(name).toLowerCase();for(var i=0;i<LIB.length;i++)if(LIB[i].n.toLowerCase()===k)return LIB[i].m;return null},
    /* same-muscle names; bodyweight first, and only bodyweight unless allowEquip */
    byMuscle:function(m,allowEquip){return LIB.filter(function(e){return e.m===m&&(allowEquip||bodyOnly(e))}).map(function(e){return e.n})},
    search:function(q,max){
      q=String(q||"").toLowerCase().trim();if(q.length<2)return[];
      var r=LIB.filter(function(e){return e.n.toLowerCase().indexOf(q)>=0});
      r.sort(function(a,b){return (bodyOnly(b)?1:0)-(bodyOnly(a)?1:0)||a.n.length-b.n.length});
      return r.slice(0,max||6).map(function(e){return e.n});
    }
  };

  function setStatus(t){var e=$("ax-lib-st");if(e)e.textContent=t}
  function refresh(){
    var e=$("ax-lib-st");if(!e)return;
    e.textContent=LIB.length?LIB.length+" exercises saved"+(META&&META.t?" · updated "+new Date(META.t).toLocaleDateString([],{month:"short",day:"numeric"}):"")+". Works offline.":"Not downloaded. About 1 MB, needs internet once.";
    var b=$("ax-lib-dl");if(b)b.textContent=LIB.length?"Update":"Download";
    var c=$("ax-lib-clr");if(c)c.hidden=!LIB.length;
  }

  function mountCard(){
    var cr=$("ax-credits");if(!cr||$("ax-lib"))return;
    var d=document.createElement("div");d.id="ax-lib";d.className="ax-card";
    d.innerHTML='<h2 class="ax-h2">Online exercise library</h2><p class="ax-sub">More exercises for Swap and Add exercise, from the free-exercise-db project (public domain).</p><p class="ax-lbk" id="ax-lib-st"></p><div class="ax-chips"><button type="button" class="ax-btn ax-pri" id="ax-lib-dl">Download</button><button type="button" class="ax-btn" id="ax-lib-clr" hidden>Remove</button></div>';
    cr.parentNode.insertBefore(d,cr);
    $("ax-lib-dl").onclick=download;$("ax-lib-clr").onclick=clearLib;
    refresh();
  }

  /* search box in Add exercise */
  var _add=window.axAdd;
  if(typeof _add==="function")window.axAdd=function(){
    _add.apply(this,arguments);
    try{
      var inp=$("ax-cen");if(!inp)return;
      var box=document.createElement("div");box.className="ax-sw-list";box.hidden=true;inp.parentNode.insertBefore(box,inp.nextSibling);
      inp.addEventListener("input",function(){
        var r=API.search(inp.value,6);
        if(!r.length){box.hidden=true;box.innerHTML="";return}
        box.innerHTML=r.map(function(x){return'<button type="button" class="ax-btn" data-n="'+esc(x)+'">'+esc(x)+'</button>'}).join("");
        box.hidden=false;
      });
      box.addEventListener("click",function(e){var b=e.target.closest("button[data-n]");if(!b)return;inp.value=b.getAttribute("data-n");box.hidden=true});
    }catch(e){}
  };

  mountCard();
  load();
})();

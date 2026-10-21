/* Arya Fit v91: Run weather. A Home card that says whether now (or which hour today/tomorrow) is a good time to run.
   Data: Open-Meteo (free, no key). Location: the phone's location, asked ONLY when the person taps "Turn on", rounded to 2 decimals (about 1 km),
   stored in localStorage "axWx" on this phone only (not in the tracker data, not in backups). Offline: shows the last forecast for up to 12 h.
   The scoring functions are pure and exported for tests/weather.test.js. */
(function(){
  "use strict";
  var KEY="axWx",FRESH=45*60e3,KEEP=12*3600e3,RUN_FROM=5,RUN_TO=21;

  /* ---------- pure logic ---------- */
  /* h: {a: feels-like C, p: rain chance %, r: rain mm, w: wind km/h, u: UV, c: weather code} -> 0..100 */
  function score(h){
    var a=+h.a,s=100;
    if(a<7)s-=(7-a)*3;else if(a>17)s-=(a-17)*4;
    s-=Math.max(0,(+h.p||0)-10)*.6;
    s-=(+h.r||0)*12;
    s-=Math.max(0,(+h.w||0)-18)*1.2;
    s-=Math.max(0,(+h.u||0)-6)*5;
    var c=+h.c||0;
    if(c>=95)s-=60;else if((c>=71&&c<=77)||c===85||c===86)s-=30;else if(c===45||c===48)s-=10;
    return Math.max(0,Math.min(100,Math.round(s)));
  }
  function two(n){return(n<10?"0":"")+n}
  function keyOf(d){return d.getFullYear()+"-"+two(d.getMonth()+1)+"-"+two(d.getDate())+"T"+two(d.getHours())+":00"}
  /* hourly: Open-Meteo hourly object (arrays). Returns [{k:"2026-10-21T14:00",hr:14,a,t,p,r,w,u,c,s}] */
  function hoursOf(hourly){
    var t=(hourly&&hourly.time)||[],o=[];
    for(var i=0;i<t.length;i++){
      var g=function(n,d){var v=hourly[n]&&hourly[n][i];return v==null?d:+v};
      var h={k:t[i],hr:parseInt(String(t[i]).slice(11,13),10),a:g("apparent_temperature",g("temperature_2m",15)),t:g("temperature_2m",15),
        p:g("precipitation_probability",0),r:g("precipitation",0),w:g("wind_speed_10m",0),u:g("uv_index",0),c:g("weather_code",0)};
      h.s=score(h);o.push(h);
    }
    return o;
  }
  /* now: Date. Looks at the next 24 hours; "run window" is 05:00 to 21:00. */
  function pick(hours,now){
    var nk=keyOf(now),list=hours.filter(function(h){return h.k>=nk}).slice(0,24);
    var win=list.filter(function(h){return h.hr>=RUN_FROM&&h.hr<=RUN_TO});
    var cur=list.length&&list[0].k===nk?list[0]:null,best=null;
    win.forEach(function(h){if(!best||h.s>best.s)best=h});
    return{now:cur,nowInWindow:!!cur&&cur.hr>=RUN_FROM&&cur.hr<=RUN_TO,best:best,list:list};
  }
  function hourLabel(hr){return new Date(2000,0,1,hr).toLocaleTimeString([],{hour:"numeric"})}
  function dayWord(h,now){return h.k.slice(0,10)===keyOf(now).slice(0,10)?"":" tomorrow"}
  function verdict(p,now){
    var b=p.best;if(!b)return{lvl:"bad",title:"No forecast for the run window",sub:""};
    var n=p.nowInWindow?p.now:null;
    if(n&&n.s>=75)return{lvl:"good",title:"Good time to run now",at:n};
    if(b.s>=70)return{lvl:"good",title:"Best around "+hourLabel(b.hr)+dayWord(b,now),at:b};
    if(b.s>=50)return{lvl:"ok",title:"Fair at best, around "+hourLabel(b.hr)+dayWord(b,now),at:b};
    return{lvl:"bad",title:"Poor running weather. A walk or indoor session is smarter.",at:b};
  }
  function notes(h){
    var o=[];
    if(h.c>=95)o.push("Thunderstorm risk: stay indoors.");
    else if(h.p>=60||h.r>=1)o.push("Rain is likely: wear a shell or move it indoors.");
    if(h.a>=30)o.push("Hot: go early or late and carry water.");
    else if(h.a<=0)o.push("Freezing: warm up inside and watch for ice.");
    if(h.w>=35)o.push("Strong wind: run into it first, finish with it behind you.");
    if(h.u>=8)o.push("High UV: sunscreen and a cap.");
    return o.slice(0,2);
  }
  function fmtT(c,u){return Math.round(u==="f"?c*9/5+32:c)+"°"}
  function fmtW(k,u){return u==="f"?Math.round(k*.621)+" mph":Math.round(k)+" km/h"}
  function line(h,u){return fmtT(h.a,u)+" feels like · rain "+Math.round(h.p)+"% · wind "+fmtW(h.w,u)}

  var API={score:score,hoursOf:hoursOf,pick:pick,verdict:verdict,notes:notes,keyOf:keyOf,fmtT:fmtT};
  if(typeof module!=="undefined"&&module.exports)module.exports=API;
  if(typeof window==="undefined"||typeof document==="undefined")return;
  var home=document.getElementById("ax-v-home");if(!home)return;
  window.AxWx=API;

  /* ---------- storage ---------- */
  function load(){try{var o=JSON.parse(localStorage.getItem(KEY));return o&&typeof o==="object"?o:{}}catch(e){return{}}}
  function put(o){try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
  var W=load(),busy=false;

  /* ---------- location + forecast ---------- */
  function getPos(){
    return new Promise(function(res,rej){
      if(!navigator.geolocation){rej(new Error("nogeo"));return}
      navigator.geolocation.getCurrentPosition(function(p){res(p.coords)},function(e){rej(e)},{enableHighAccuracy:false,timeout:12000,maximumAge:3600e3});
    });
  }
  function r2(n){return Math.round(n*100)/100}
  function fetchWx(lat,lon){
    var ctl=window.AbortController?new AbortController():null,tm=setTimeout(function(){if(ctl)ctl.abort()},9000);
    var url="https://api.open-meteo.com/v1/forecast?latitude="+lat+"&longitude="+lon+
      "&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,uv_index,weather_code"+
      "&forecast_days=2&timezone=auto&wind_speed_unit=kmh";
    return fetch(url,ctl?{signal:ctl.signal}:{}).then(function(r){clearTimeout(tm);if(!r.ok)throw new Error("http "+r.status);return r.json()})
      .then(function(j){if(!j||!j.hourly||!j.hourly.time)throw new Error("bad data");return j.hourly},function(e){clearTimeout(tm);throw e});
  }
  function refresh(force){
    if(!W.on||busy)return Promise.resolve();
    if(!force&&W.d&&Date.now()-W.t<FRESH){paint();return Promise.resolve()}
    busy=true;paint();
    var go=function(c){
      return fetchWx(c.lat,c.lon).then(function(h){W.d=h;W.t=Date.now();W.err=0;put(W)});
    };
    var stale=!W.lat||Date.now()-(W.pt||0)>6*3600e3;
    var p=stale?getPos().then(function(c){W.lat=r2(c.latitude);W.lon=r2(c.longitude);W.pt=Date.now();put(W);return{lat:W.lat,lon:W.lon}},function(){if(W.lat!=null)return{lat:W.lat,lon:W.lon};throw new Error("noloc")}):Promise.resolve({lat:W.lat,lon:W.lon});
    return p.then(go).catch(function(){W.err=1}).then(function(){busy=false;paint()});
  }

  /* ---------- UI ---------- */
  var ICO={
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    cloud:'<path d="M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.3A3.4 3.4 0 0 1 17 18z"/>',
    rain:'<path d="M7 14a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.3A3.4 3.4 0 0 1 17 14z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>',
    snow:'<path d="M7 14a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.3A3.4 3.4 0 0 1 17 14z"/><path d="M8 18h.01M12 20h.01M16 18h.01"/>',
    bolt:'<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>'
  };
  function icoOf(c){c=+c||0;return c>=95?"bolt":(c>=71&&c<=77)||c===85||c===86?"snow":(c>=51&&c<=67)||(c>=80&&c<=82)?"rain":c===0||c===1?"sun":"cloud"}
  function svg(n){return'<svg class="ax-wx-i" viewBox="0 0 24 24" aria-hidden="true">'+ICO[n]+'</svg>'}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

  function css(){
    if(document.getElementById("ax-wx-css"))return;
    var s=document.createElement("style");s.id="ax-wx-css";
    s.textContent=".ax-wx-card{display:flex;flex-direction:column;gap:6px;padding:12px 14px;text-align:left;width:100%;cursor:pointer}"+
      ".ax-wx-top{display:flex;justify-content:space-between;align-items:center}"+
      ".ax-wx-main{display:flex;gap:12px;align-items:center}"+
      ".ax-wx-main b{display:block;font-size:15px;line-height:1.25}.ax-wx-main span{display:block;font-size:12.5px;color:var(--mut)}"+
      ".ax-wx-i{width:34px;height:34px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;color:var(--blue)}"+
      ".ax-wx-pill{font:700 11px/1 system-ui,sans-serif;padding:5px 9px;border-radius:99px;letter-spacing:.04em;color:#fff}"+
      ".ax-wx-pill.good{background:var(--ok,#2f7d4f)}.ax-wx-pill.ok{background:var(--sun,#c98a1b)}.ax-wx-pill.bad{background:#c0432f}"+
      ".ax-wx-note{margin:0}"+
      ".ax-wx-row{display:flex;gap:8px;margin-top:4px}.ax-wx-row .ax-btn{flex:1}"+
      ".ax-wx-slim{display:flex;justify-content:space-between;align-items:center;padding:9px 14px;font-size:13px;color:var(--mut)}"+
      ".ax-wx-slim button{font:700 13px/1 system-ui,sans-serif;color:var(--blue);background:none;border:0;padding:6px 0 6px 12px}"+
      ".ax-wx-hrs{display:flex;gap:6px;overflow-x:auto;padding:4px 0 10px}"+
      ".ax-wx-h{flex:none;width:46px;text-align:center;font-size:11px;color:var(--mut)}"+
      ".ax-wx-h u{display:block;height:46px;border-radius:8px;background:var(--line,#ddd);position:relative;margin:4px 0;text-decoration:none;overflow:hidden}"+
      ".ax-wx-h u i{position:absolute;left:0;right:0;bottom:0;border-radius:8px}"+
      ".ax-wx-h b{display:block;color:var(--ink);font-size:12px}"+
      ".ax-wx-h.best u{outline:2px solid var(--blue);outline-offset:1px}"+
      ".ax-wx-c{font-size:11px;color:var(--mut);margin-top:8px}";
    document.head.appendChild(s);
  }
  function box(){
    var b=document.getElementById("ax-wx-card");
    if(!b){b=document.createElement("div");b.id="ax-wx-card";b.className="ax-card ax-wx-card";home.appendChild(b)}
    return b;
  }
  function setHtml(b,h,cls){if(b.dataset.h!==h){b.dataset.h=h;b.innerHTML=h}if(b.className!==cls)b.className=cls;b.onclick=null}
  function lvlCol(s){return s>=75?"var(--ok,#2f7d4f)":s>=50?"var(--sun,#c98a1b)":"#c0432f"}

  function paint(){
    css();var b=box();
    if(W.on===1){
      var hrs=W.d&&Date.now()-W.t<KEEP?hoursOf(W.d):null;
      if(!hrs){
        setHtml(b,'<div class="ax-wx-top"><span class="ax-cap">RUN WEATHER</span></div><div class="ax-wx-main">'+svg("cloud")+'<div><b>'+(busy?"Checking the forecast…":"Can’t load the forecast")+'</b><span>'+(busy?"One moment":"Tap to try again")+'</span></div></div>',"ax-card ax-wx-card");
        b.onclick=function(){refresh(true)};return;
      }
      var now=new Date(),p=pick(hrs,now),v=verdict(p,now),at=v.at||p.best;
      if(!at){b.hidden=true;return}b.hidden=false;
      var nt=notes(at),u=W.u==="f"?"f":"c",age=Date.now()-W.t,stale=age>FRESH?'<span>Updated '+(age<3600e3?Math.round(age/60e3)+" min":Math.round(age/3600e3)+" h")+' ago'+(W.err?" (offline)":"")+'</span>':"";
      setHtml(b,'<div class="ax-wx-top"><span class="ax-cap">RUN WEATHER</span><span class="ax-wx-pill '+v.lvl+'">'+(v.lvl==="good"?"GOOD":v.lvl==="ok"?"FAIR":"POOR")+'</span></div>'+
        '<div class="ax-wx-main">'+svg(icoOf(at.c))+'<div><b>'+esc(v.title)+'</b><span>'+esc(line(at,u))+'</span>'+stale+'</div></div>'+
        (nt.length?'<p class="ax-cap ax-wx-note">'+esc(nt.join(" "))+'</p>':""),"ax-card ax-wx-card");
      b.onclick=sheet;return;
    }
    if(W.dismissed||W.on===0){
      setHtml(b,'<span>Run weather is off</span><button type="button" id="ax-wx-on2">Turn on</button>',"ax-card ax-wx-slim");
      var t=document.getElementById("ax-wx-on2");if(t)t.onclick=enable;return;
    }
    setHtml(b,'<div class="ax-wx-top"><span class="ax-cap">RUN WEATHER</span></div><div class="ax-wx-main">'+svg("sun")+'<div><b>See if it’s a good time to run</b><span>Uses your phone’s location once, only to ask a weather service for the forecast. Nothing else leaves your phone.</span></div></div>'+
      '<div class="ax-wx-row"><button type="button" class="ax-btn ax-pri" id="ax-wx-on">Turn on</button><button type="button" class="ax-btn" id="ax-wx-no">Not now</button></div>',"ax-card ax-wx-card");
    document.getElementById("ax-wx-on").onclick=enable;
    document.getElementById("ax-wx-no").onclick=function(){W.on=0;W.dismissed=1;put(W);paint()};
  }

  function enable(){
    if(busy)return;busy=true;
    getPos().then(function(c){
      W={on:1,lat:r2(c.latitude),lon:r2(c.longitude),pt:Date.now(),u:W.u||"c"};put(W);busy=false;return refresh(true);
    },function(e){
      busy=false;
      var denied=e&&e.code===1;
      if(window.toast)toast(denied?"Location is off for Arya Fit. Allow it in phone settings to use run weather.":"Couldn’t get your location. Try again outside or with location on.");
      paint();
    });
  }

  function sheet(){
    if(!W.on||!W.d||!window.axSheet)return;
    var hrs=hoursOf(W.d),now=new Date(),p=pick(hrs,now),u=W.u==="f"?"f":"c",best=p.best;
    var cols=p.list.slice(0,14).map(function(h){
      var inWin=h.hr>=RUN_FROM&&h.hr<=RUN_TO;
      return'<div class="ax-wx-h'+(best&&h.k===best.k?" best":"")+'"><u title="score '+h.s+'"><i style="height:'+(inWin?h.s:0)+'%;background:'+lvlCol(h.s)+'"></i></u><b>'+fmtT(h.a,u)+'</b>'+hourLabel(h.hr).replace(" ","").toLowerCase()+'<br>'+Math.round(h.p)+'%</div>';
    }).join("");
    var v=verdict(p,now);
    axSheet("Run weather",'<div class="ax-wx-main">'+svg(icoOf((v.at||{}).c))+'<div><b>'+esc(v.title)+'</b><span>'+(v.at?esc(line(v.at,u)):"")+'</span></div></div>'+
      '<p class="ax-cap" style="margin:10px 0 0">Next hours: bar = how good for running (05:00 to 21:00), then feels-like and rain chance.</p><div class="ax-wx-hrs">'+cols+'</div>'+
      '<div class="ax-wx-row"><button type="button" class="ax-btn" id="ax-wx-u">Show '+(u==="c"?"°F and mph":"°C and km/h")+'</button><button type="button" class="ax-btn" id="ax-wx-rf">Refresh now</button></div>'+
      '<button type="button" class="ax-opt" id="ax-wx-off" style="margin-top:10px"><b>Turn off run weather</b><span>Forgets your saved location on this phone</span></button>'+
      '<p class="ax-wx-c">Weather data by Open-Meteo.com. Forecasts are guidance, not a safety guarantee: use your own judgement.</p>');
    var $=function(i){return document.getElementById(i)};
    $("ax-wx-u").onclick=function(){W.u=u==="c"?"f":"c";put(W);paint();sheet()};
    $("ax-wx-rf").onclick=function(){if(window.axSheetX)axSheetX();refresh(true)};
    $("ax-wx-off").onclick=function(){W={on:0,dismissed:1,u:W.u};put(W);if(window.axSheetX)axSheetX();paint();if(window.toast)toast("Run weather is off")};
  }

  /* start after the splash is gone; refresh when the app comes back to the front and the forecast is old */
  function ready(f){if(!document.getElementById("ax-boot"))f();else setTimeout(function(){ready(f)},250)}
  ready(function(){paint();if(W.on===1)setTimeout(function(){refresh(false)},400)});
  document.addEventListener("visibilitychange",function(){if(!document.hidden&&W.on===1)refresh(false)});
  setInterval(function(){if(!document.hidden&&W.on===1)paint()},10*60e3);
})();

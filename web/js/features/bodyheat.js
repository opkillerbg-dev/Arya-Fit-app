/* Arya Fit v72: Body tab "Week volume" heatmap. Toggle between Recovery (existing) and Week volume (sets per muscle this plan week).
   Wraps body(); recolours the existing SVG muscles and swaps the detail card. Counts ticked Strength items via items() and MX weights. */
(function(){
  "use strict";
  var TG=10; /* weighted sets per muscle per week treated as "target met" */

  function weekVol(){
    var td=Math.max(0,Math.min(ND-1,todayIdx())),a=Math.floor(td/7)*7,b=Math.min(ND,a+7),V={},S={};
    Object.keys(MU).forEach(function(m){V[m]=0;S[m]=[]});
    for(var i=a;i<b;i++){
      items(i).forEach(function(x){
        if(x[0]!=="Strength"||!st[k(i,x[1])])return;
        var sets=/\u00d7/.test(x[3])?parseInt(x[3],10)||2:2;
        for(var q=0;q<MX.length;q++)if(MX[q][0].test(x[2])){
          for(var m in MX[q][1])if(V[m]!=null){V[m]+=sets*MX[q][1][m];if(MX[q][1][m]>=.8&&S[m].indexOf(x[2])<0)S[m].push(x[2])}
          break;
        }
      });
    }
    return{v:V,s:S};
  }

  function r1(n){return Math.round(n*10)/10}
  function tag(v){return v>=TG?"TARGET MET":v>=5?"BUILDING":v>0?"LOW":"NONE YET"}

  function paint(){
    var bsd=$("bsd");if(!bsd||!bsd.parentNode)return;
    var box=$("ax-bm");
    if(!box){
      box=document.createElement("div");box.id="ax-bm";box.className="ax-bm";
      box.innerHTML='<button type="button" data-bm="rec">Recovery</button><button type="button" data-bm="vol">Week volume</button>';
      box.onclick=function(e){var b=e.target.closest("button");if(!b)return;PR.bmode=b.getAttribute("data-bm")==="vol"?"vol":0;save();body()};
      bsd.parentNode.insertBefore(box,bsd);
    }
    var vol=PR.bmode==="vol";
    box.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-pressed",(b.getAttribute("data-bm")==="vol")===vol?"true":"false")});
    if(!vol)return;

    var W=weekVol(),V=W.v;
    document.querySelectorAll("#bsv [data-m]").forEach(function(n){
      var m=n.getAttribute("data-m");if(V[m]==null)return;
      n.classList.remove("bh-sore");n.style.fill=bhc(Math.min(1,V[m]/TG));
    });

    var v=V[bsel]||0,fr=Math.min(1,v/TG),src=W.s[bsel]||[],det=$("bdet");
    if(det)det.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div><span class="ax-kicker">THIS WEEK</span><b style="font-size:20px;margin-top:5px">'+esc(MU[bsel][0])+'</b></div><span class="ax-bm-tag">'+tag(v)+'</span></div>'
      +'<p style="margin:10px 0 0;font-size:13px;color:var(--mut)">'+(v>0?r1(v)+' of about '+TG+' sets done this week.':'No sets logged for it this week yet.')+(src.length?' Main work: '+esc(src.slice(0,3).join(", "))+'.':'')+'</p>'
      +'<div class="ax-muscle-meter"><span style="width:'+Math.round(fr*100)+'%;background:var(--blue)"></span></div>'
      +'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--mut)"><span>Weekly sets</span><b>'+r1(v)+' / '+TG+'</b></div>'
      +'<p style="margin:12px 0 0;font-size:12px;color:var(--mut)">Counts ticked strength exercises in this plan week. Supporting muscles count partly. Around 10 sets a week per muscle is a common general target, not a rule. Runs are not counted here.</p>';

    var bl=$("blist");
    if(bl){
      bl.querySelectorAll(".ax-muscle-pick").forEach(function(btn){
        var m=btn.getAttribute("data-m"),x=V[m]||0,dot=btn.querySelector(".ax-mp-dot"),sm=btn.querySelector("small"),c=bhc(Math.min(1,x/TG));
        if(dot){dot.style.color=c;dot.style.background=c}
        if(sm)sm.textContent=r1(x)+" / "+TG+" sets";
      });
      var kp=bl.querySelector(".key");
      if(kp){
        var low=Object.keys(MU).filter(function(m){return V[m]<TG}).sort(function(a,b){return V[a]-V[b]}).slice(0,3);
        kp.textContent=low.length?"Needs more this week: "+low.map(function(m){return MU[m][0]+" ("+r1(V[m])+")"}).join(", ")+".":"Every muscle group reached about "+TG+" sets this week.";
      }
    }
  }

  var _b=window.body;
  if(typeof _b==="function")window.body=function(){var r=_b.apply(this,arguments);try{paint()}catch(e){}return r};
})();

/* Arya Fit v72: Swap exercise. In "Edit workout" each exercise gets a Swap button listing same-muscle alternatives from the app's own library.
   Non-destructive: stored per plan in axPlan().swaps[dayIndex][exerciseIndex]={from,to}; items() shows the swapped name. Base plan is never changed. */
(function(){
  "use strict";
  var SKIP=/stretch|cat[- ]cow|child|pose|walk|jog|run\b|warm|cool/i;

  function swaps(){var p=axPlan();p.swaps=p.swaps&&typeof p.swaps==="object"?p.swaps:{};return p.swaps}

  function prim(n){
    for(var q=0;q<MX.length;q++)if(MX[q][0].test(n)){
      var b=null,bw=0;for(var m in MX[q][1])if(MX[q][1][m]>bw){bw=MX[q][1][m];b=m}
      return b;
    }
    return null;
  }
  function pretty(sl){var s=sl.replace(/-/g," ").replace(/\b(push|pull|sit|step|chin) ups\b/,"$1-ups");return s.charAt(0).toUpperCase()+s.slice(1)}

  function pool(){
    var seen={},out=[];
    function add(n){var key=exSlug(n);if(!n||seen[key]||SKIP.test(n))return;seen[key]=1;out.push(n)}
    for(var d in T){var t=T[d];if(!t||t.m||t.c||!t.x)continue;t.x.forEach(function(e){add(e[0])})}
    Object.keys(EXI).forEach(function(sl){add(pretty(sl))});
    return out;
  }

  function lib(){return window.axLib&&axLib.ready()?axLib:null}
  function candidates(day,orig,n){
    var L=lib(),p=prim(orig)||(L&&L.prim(orig));if(!p)return[];
    var have={};
    items(day).forEach(function(q){have[exSlug(q[2])]=1});
    have[exSlug(orig)]=1;
    var c=pool().filter(function(x){return !have[exSlug(x)]&&prim(x)===p});
    c.sort(function(a,b){return (EXI[exSlug(b)]?1:0)-(EXI[exSlug(a)]?1:0)});
    c=c.slice(0,6);
    if(L&&c.length<6){
      L.byMuscle(p,false).forEach(function(x){var key=exSlug(x);if(c.length<8&&!have[key]&&!c.some(function(y){return exSlug(y)===key}))c.push(x)});
    }
    return c;
  }

  var _items=window.items;
  if(typeof _items==="function")window.items=function(i){
    var a=_items.apply(this,arguments);
    try{
      var sw=(axPlan().swaps||{})[String(i)];if(!sw)return a;
      return a.map(function(q){
        var m=/^e(\d+)$/.exec(q[1]),s=m&&sw[m[1]];
        if(!s||!s.to)return q;
        var c=q.slice();c[2]=s.to;c[4]="Swapped in for "+s.from+". Same sets and reps.";return c;
      });
    }catch(e){return a}
  };

  var _ed=window.axEditWorkout;
  if(typeof _ed==="function")window.axEditWorkout=function(i){
    _ed.apply(this,arguments);
    try{
      var src=axSrc(i);if(src<0)return;
      var t=T[wdk(src)],sw=swaps()[String(i)]||{},cards=$("ax-shb").querySelectorAll(".ax-card");
      cards.forEach(function(card,n){
        if(!t.x[n]||t.m||t.c)return;
        var orig=t.x[n][0],cur=sw[n]&&sw[n].to||orig,b0=card.querySelector("b");
        if(b0&&cur!==orig)b0.textContent=cur;
        var btn=document.createElement("button");
        btn.type="button";btn.className="ax-btn ax-sw-btn";btn.textContent="Swap exercise";
        var list=document.createElement("div");list.className="ax-sw-list";list.hidden=true;
        btn.onclick=function(){
          if(!list.hidden){list.hidden=true;return}
          var cs=candidates(i,orig,n),h="";
          if(cur!==orig)h+='<button type="button" class="ax-btn" data-to="">Back to original: '+esc(orig)+'</button>';
          cs.forEach(function(x){h+='<button type="button" class="ax-btn" data-to="'+esc(x)+'">'+esc(x)+(EXI[exSlug(x)]?"":" (no picture)")+'</button>'});
          if(!h)h='<p class="ax-sub">No close alternatives for this one.</p>';
          if(!lib())h+='<p class="ax-sub">Want more options? Download the online library in Settings.</p>';
          list.innerHTML=h;list.hidden=false;
        };
        list.onclick=function(e){
          var o=e.target.closest("button[data-to]");if(!o)return;
          var to=o.getAttribute("data-to"),all=swaps(),day=all[String(i)]=all[String(i)]||{};
          if(!to)delete day[n];else day[n]={from:orig,to:to};
          if(!Object.keys(day).length)delete all[String(i)];
          save();axSheetX();render();toast(to?"Swapped to "+to:"Back to "+orig);
        };
        card.appendChild(btn);card.appendChild(list);
      });
    }catch(e){}
  };
})();

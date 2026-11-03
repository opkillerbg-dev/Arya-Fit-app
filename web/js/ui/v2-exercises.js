/* Arya Fit V2 P6 — exercise discovery layered over the existing add-exercise sheet. */
(function(w,d){
  "use strict";
  var root=d.documentElement,oldAdd=w.axAdd,pattern="all",equipment="all",query="",frame={};
  function $(id){return d.getElementById(id)}
  function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
  function data(){return w.AxExDb&&Array.isArray(AxExDb.all)?AxExDb.all:[]}
  function picture(ex,side){try{var slug=w.exSlug? w.exSlug(ex.n):ex.id,a=w.EXI&&w.EXI[slug];if(!a)return"";var ch=side||a.charAt(0);if(a.indexOf(ch)<0)ch=a.charAt(0);return"images/exercises/arya-ex-"+slug+"-"+ch+".webp"}catch(e){return""}}
  function matches(ex){var q=query.toLowerCase();return(!q||ex.n.toLowerCase().indexOf(q)>=0||ex.cue.toLowerCase().indexOf(q)>=0)&& (pattern==="all"||ex.p===pattern) && (equipment==="all"||ex.e.indexOf(equipment)>=0)}
  function results(){var a=data().filter(matches),html="";if(!a.length)return'<p class="v2-ex-empty">No exercises match. Try another search or filter.</p>';a.slice(0,80).forEach(function(ex){var src=picture(ex);html+='<button type="button" class="v2-ex-row" data-ex-id="'+esc(ex.id)+'"><span class="v2-ex-thumb">'+(src?'<img src="'+src+'" alt="" width="1024" height="1024" loading="lazy" decoding="async">':'<span>AF</span>')+'</span><span class="v2-ex-copy"><b>'+esc(ex.n)+'</b><small>'+esc(ex.p)+' · '+esc(ex.e.join(", "))+'</small></span><span class="v2-ex-arrow" aria-hidden="true">›</span></button>'});return html}
  function paint(){var box=$("v2-ex-results");if(box)box.innerHTML=results()}
  function detail(id){var ex=null,a=data();for(var i=0;i<a.length;i++)if(a[i].id===id){ex=a[i];break}if(!ex)return;
    var side=frame[id]||"a",src=picture(ex,side),other=side==="a"?"b":"a";
    var h='<div class="v2-ex-detail"><div class="v2-ex-detail-picture">'+(src?'<img src="'+src+'" alt="'+esc(ex.n)+' demonstration, frame '+side.toUpperCase()+'" width="1024" height="1024">':'<span>Illustration unavailable</span>')+'</div><div class="v2-ex-frame-actions"><button type="button" data-frame="a" data-id="'+esc(id)+'" aria-pressed="'+(side==="a")+'">A</button><button type="button" data-frame="b" data-id="'+esc(id)+'" aria-pressed="'+(side==="b")+'">B</button></div><p class="v2-ex-meta">'+esc(ex.p)+' · '+esc(ex.e.join(", "))+' · Level '+(ex.L+1)+'</p><p class="v2-ex-cue">'+esc(ex.cue)+'</p><p class="v2-ex-reps">Suggested range <b>'+esc(ex.reps||"8–12")+'</b></p><button type="button" class="v2-ex-add" data-add-ex="'+esc(ex.n)+'">Add to current day</button></div>';
    w.axSheet(ex.n,h);
    var sh=$("ax-shb");sh.querySelectorAll("[data-frame]").forEach(function(b){b.onclick=function(){frame[id]=b.getAttribute("data-frame");detail(id)}});
    var add=sh.querySelector("[data-add-ex]");if(add)add.onclick=function(){var name=add.getAttribute("data-add-ex");w.axSheetX();w.axAdd();var inp=$("ax-cen");if(inp){inp.value=name;inp.focus()}};
  }
  function addLibrary(){var inp=$("ax-cen"),host=$("ax-shb");if(!inp||!host||!root.classList.contains("v2"))return;
    if($("v2-ex-browser"))$("v2-ex-browser").remove();
    var box=d.createElement("section");box.id="v2-ex-browser";box.className="v2-ex-browser";
    box.innerHTML='<label class="v2-ex-search-label" for="ax-cen">Find an exercise</label><div class="v2-ex-filters"><button type="button" data-pattern="all" aria-pressed="true">All</button><button type="button" data-pattern="push">Push</button><button type="button" data-pattern="pull">Pull</button><button type="button" data-pattern="legs">Legs</button><button type="button" data-pattern="core">Core</button><button type="button" data-pattern="run">Run</button></div><div class="v2-ex-equipment"><label for="v2-ex-equip">Equipment</label><select id="v2-ex-equip"><option value="all">Any equipment</option><option value="body">Bodyweight</option><option value="chair">Chair</option><option value="backpack">Backpack</option><option value="dumbbell">Dumbbell</option><option value="band">Band</option><option value="pullbar">Pull-up bar</option><option value="bench">Bench</option><option value="rope">Rope</option><option value="wheel">Ab wheel</option><option value="barbell">Barbell</option><option value="machine">Machine</option><option value="cable">Cable</option><option value="dipbar">Dip bars</option></select></div><div id="v2-ex-results" class="v2-ex-results" aria-live="polite"></div><p class="v2-ex-note">Choose an exercise to view its picture and coaching cue. You can still enter a custom exercise below.</p>';
    inp.parentNode.insertBefore(box,inp.nextSibling);query="";pattern="all";equipment="all";
    inp.setAttribute("aria-label","Search exercise library or enter a custom exercise");inp.addEventListener("input",function(){query=inp.value.trim();paint()});
    box.querySelectorAll("[data-pattern]").forEach(function(b){b.onclick=function(){pattern=b.getAttribute("data-pattern");box.querySelectorAll("[data-pattern]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b))});paint()}});
    var eq=$("v2-ex-equip");eq.onchange=function(){equipment=eq.value;paint()};
    box.addEventListener("click",function(e){var b=e.target.closest("[data-ex-id]");if(b)detail(b.getAttribute("data-ex-id"))});paint();
  }
  function init(){if(typeof oldAdd!=="function"||w.axAdd.__v2Exercise)return;var wrapped=function(){var r=oldAdd.apply(this,arguments);if(root.classList.contains("v2"))addLibrary();return r};wrapped.__v2Exercise=true;w.axAdd=wrapped}
  if(w.axAdd)init();else d.addEventListener("DOMContentLoaded",init);
  var ap=w.AxV2&&w.AxV2.apply;if(w.AxV2&&ap){w.AxV2.apply=function(){var r=ap.apply(this,arguments);if(!root.classList.contains("v2")){var b=$("v2-ex-browser");if(b)b.remove()}return r}}
})(window,document);

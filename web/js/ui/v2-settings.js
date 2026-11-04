/* Arya Fit V2 P6 — grouped Settings hub and Appearance controls; original settings nodes remain moved, never rebuilt. */
(function(w,d){
  "use strict";
  var root=d.documentElement,done=false;
  function $(id){return d.getElementById(id)}
  function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
  function accent(){return w.PR&&PR.v2Accent||"green"}
  function theme(){return w.PR&&PR.v2Theme||"dark"}
  function applyTheme(v){if(!w.PR)return;PR.v2Theme=v;w.save&&save();root.setAttribute("data-theme",v);if(w.AxV2&&AxV2.apply)AxV2.apply()}
  function addAppearance(){var p=$("ax-sp-look"),body=p&&p.querySelector(".ax-sp-c");if(!body||$("v2-appearance-controls"))return;
    var box=d.createElement("section");box.id="v2-appearance-controls";box.className="v2-settings-group";
    box.innerHTML='<h3>INTERFACE</h3><div class="v2-settings-row"><span><b>Theme</b><small>Choose how Arya Fit looks.</small></span><div class="v2-segment" role="group" aria-label="Theme"><button type="button" data-theme-choice="dark">Dark</button><button type="button" data-theme-choice="light">Light</button><button type="button" data-theme-choice="system">System</button></div></div><div class="v2-settings-row v2-accent-row"><span><b>Accent colour</b><small>One colour across the interface.</small></span><div class="v2-accent-picker" role="group" aria-label="Accent colour"><button data-accent-choice="green" aria-label="Green"></button><button data-accent-choice="blue" aria-label="Blue"></button><button data-accent-choice="ruby" aria-label="Ruby"></button><button data-accent-choice="teal" aria-label="Teal"></button><button data-accent-choice="orange" aria-label="Orange"></button><button data-accent-choice="gold" aria-label="Gold"></button></div></div><div class="v2-settings-row"><span><b>Glass effects</b><small>Balance depth and battery use.</small></span><select id="v2-fx-choice" aria-label="Glass effects"><option value="auto">Auto</option><option value="full">Full</option><option value="lite">Lite</option><option value="solid">Solid</option></select></div><label class="v2-settings-row"><span><b>Liquid glass</b><small>Refracting glass on the nav and buttons. Chrome/Android only.</small></span><input type="checkbox" id="v2-liquid"></label><label class="v2-settings-row"><span><b>Reduce animation</b><small>Use simpler transitions and static reveals.</small></span><input type="checkbox" id="v2-reduce-motion"></label><label class="v2-settings-row"><span><b>Classic look</b><small>Switch back to the original Arya Fit interface.</small></span><input type="checkbox" id="v2-classic-look"></label>';
    body.insertBefore(box,body.firstChild);
    box.querySelectorAll("[data-theme-choice]").forEach(function(b){b.onclick=function(){applyTheme(b.getAttribute("data-theme-choice"));sync()}});
    box.querySelectorAll("[data-accent-choice]").forEach(function(b){b.onclick=function(){var a=b.getAttribute("data-accent-choice");if(w.PR){PR.v2Accent=a==="green"?"":a;save()}root.setAttribute("data-accent",a);sync()}});
    var fx=$("v2-fx-choice");fx.value=(w.PR&&PR.v2Fx)||"auto";var lq=$("v2-liquid");if(lq){lq.checked=!(w.PR&&PR.v2Liquid===0);lq.disabled=!(w.AxLiquid&&AxLiquid.supported());lq.onchange=function(){if(w.AxLiquid)AxLiquid.set(lq.checked)}}fx.onchange=function(){if(w.PR){if(fx.value==="auto")delete PR.v2Fx;else PR.v2Fx=fx.value;save()}if(w.AxV2)AxV2.apply()};
    var rm=$("v2-reduce-motion");rm.checked=!!(w.PR&&PR.v2ReduceMotion);rm.onchange=function(){if(w.PR){PR.v2ReduceMotion=rm.checked?1:0;save()}root.setAttribute("data-v2-motion",rm.checked?"reduce":"full")};
    var classic=$("v2-classic-look");if(classic){classic.checked=false;classic.onchange=function(){if(classic.checked&&w.AxV2)AxV2.setEnabled(false);classic.checked=false}};
    sync();
  }
  function sync(){var t=theme();if(w.AxV2)AxV2.apply();else root.setAttribute("data-theme",t);var box=$("v2-appearance-controls");if(!box)return;box.querySelectorAll("[data-theme-choice]").forEach(function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-theme-choice")===t))});box.querySelectorAll("[data-accent-choice]").forEach(function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-accent-choice")===accent()))});var c=$("v2-classic-look");if(c)c.checked=false}
  function decorateHub(){var hub=$("ax-sm");if(!hub)return;var search=$("v2-settings-search");if(!search){search=d.createElement("input");search.type="search";search.id="v2-settings-search";search.placeholder="Search settings";search.setAttribute("aria-label","Search settings");hub.insertBefore(search,hub.firstChild);search.addEventListener("input",function(){var q=search.value.toLowerCase();hub.querySelectorAll("[data-sp]").forEach(function(b){b.hidden=q&&b.textContent.toLowerCase().indexOf(q)<0})})}
    if(hub.querySelector(".v2-settings-card"))return;
    var old=hub.querySelector(".ax-sm-card"),rows=old?old.querySelectorAll("[data-sp]"):hub.querySelectorAll("[data-sp]"),groups=[{t:"TRAINING",keys:["plan","run"]},{t:"APP EXPERIENCE",keys:["look","alert"]},{t:"YOUR DATA",keys:["data","about"]}],i,j,card,head,b;
    groups.forEach(function(g){card=d.createElement("section");card.className="ax-card ax-sm-card v2-settings-card";head=d.createElement("h3");head.className="v2-settings-group-title";head.textContent=g.t;card.appendChild(head);g.keys.forEach(function(k){for(j=0;j<rows.length;j++){b=rows[j];if(b.getAttribute("data-sp")===k){b.setAttribute("aria-label",b.textContent.replace(/\s+/g," ").trim());card.appendChild(b);break}}});if(card.querySelector("[data-sp]"))hub.appendChild(card)});
    if(old)old.remove();
  }
  function enhance(){if(!root.classList.contains("v2"))return;decorateHub();addAppearance();}
  function watch(){var sec=$("ax-v-set");if(sec&&w.MutationObserver){var mo=new MutationObserver(function(){if(root.classList.contains("v2"))enhance()});mo.observe(sec,{childList:true,subtree:true})}enhance()}
  if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",function(){setTimeout(watch,500)});else setTimeout(watch,500);
  if(w.AxV2&&w.AxV2.apply){var old=w.AxV2.apply;w.AxV2.apply=function(){var r=old.apply(this,arguments);if(root.classList.contains("v2"))enhance();else{var b=$("v2-appearance-controls"),s=$("v2-settings-search");if(b)b.remove();if(s)s.remove()}return r}}
})(window,document);

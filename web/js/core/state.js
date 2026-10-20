var KEY2="aryaApp2",OLDK="arya28v1",APP=null,st={},PR={},P=null,ND=28,NW=4,T=[],JKM=0,JL="",IVS=[],HAB=[],LWS={},LS=2;
function save(){try{localStorage.setItem(KEY2,JSON.stringify(APP))}catch(e){}}
var DN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],DF=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var START=new Date(2026,9,4),MN=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],KEYS=["sun","mon","tue","wed","thu","fri","sat"];
function dt(i){return new Date(START.getFullYear(),START.getMonth(),START.getDate()+i)}
function dl(i){var d=dt(i);return d.getDate()+" "+MN[d.getMonth()]}
function wdk(i){return (START.getDay()+i)%7}
function isL(w){return !!LWS[w]}
function mm(x){return x%60==0?(x/60)+" min":x+" sec"}
function ivt(w){var q=IVS[Math.min(w,IVS.length-1)];if(!q)return"";return q[1]?mm(q[0])+" jog, "+mm(q[1])+" walk":"Continuous jog"}
function todayIdx(){var n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate());return Math.round((m-START)/86400000)}
var T0=[
{a:"Push",n:"Push day",s:"Chest, shoulders, triceps",x:[["Push-ups",3,"8-10","Straight body line, chest near floor. Knees down if needed."],["Pike push-ups",3,"6-8","Hips high, lower head toward floor."],["Chair dips",3,"8-10","Elbows to 90 degrees, slow lowering."],["Diamond push-ups",2,"5-8","Hands together under chest. Knees down is fine."],["Plank",3,"30s","Squeeze glutes and abs, no sagging."]],j:"Easy pace, right after strength. Stretch chest and shoulders."},
{a:"Legs",n:"Legs and glutes",s:"Quads, hamstrings, glutes, calves",x:[["Bodyweight squats",3,"15","Sit back, chest up, 3 sec down."],["Reverse lunges",3,"10/leg","Back knee nearly touches floor."],["Glute bridges",3,"15","Squeeze glutes 1 sec at the top."],["Calf raises",3,"15","Rise high, pause, lower slowly."],["Wall sit",3,"30s","Thighs parallel to the floor."]],j:"Very easy pace today, legs are tired. Slow is fine."},
{a:"Core",n:"Core and conditioning",s:"Abs, obliques, lower back",x:[["Leg raises",3,"10","Lower back pressed down, lower slowly."],["Crunches",3,"12","Lift shoulder blades only."],["Mountain climbers",3,"20s","Knees to chest fast, hips low."],["Russian twists",3,"10/side","Rotate the torso, not just arms."],["Dead bug",3,"8/side","Lower opposite arm and leg, back flat."],["Side plank",2,"20s/side","Hips lifted, body straight."]],j:"Easy to steady pace, keep a consistent rhythm."},
{a:"Pull",n:"Pull day",s:"Back, rear shoulders, biceps",x:[["Table or towel rows",3,"8-10","Pull chest up, squeeze shoulder blades."],["Superman hold",3,"12","Lift arms and legs, squeeze back."],["Reverse snow angels",3,"12","Face down, sweep arms hips to overhead."],["Backpack curls",3,"10","Curl up, lower in 3 sec."],["Backpack bent-over row",2,"10","Flat back, pull bag to belly."]],j:"Easy pace after strength. Stretch lats, chest and biceps."},
{a:"Full",n:"Full body circuit",s:"Do as a circuit, rest 60-90 sec between rounds",c:3,x:[["Burpees",1,"6","Step instead of jumping if needed."],["Squat jumps",1,"10","Land softly with bent knees."],["Incline push-ups",1,"10","Hands on table or chair."],["Bear crawls",1,"20s","Knees hover 2 inches off floor."],["Plank to push-up",1,"6","Press up one arm at a time."]],j:"Easy pace, you will be tired, keep it relaxed."},
{a:"Stretch",n:"Mobility and best jog",s:"Recovery and stretching, about 20 min",m:1,x:[["Cat-cow",0,"10 reps","Arch and round the back slowly."],["World's greatest stretch",0,"5/side","Deep lunge, rotate chest up, hold 3 sec."],["Hamstring stretch",0,"45s/leg","Sit, one leg straight, reach for toes."],["Hip flexor stretch",0,"45s/side","Half-kneeling, squeeze back glute."],["Child's pose",0,"60s","Sit back on heels, breathe slowly."]],j:"Your steadiest jog of the week. Slightly faster, still able to talk."},
{a:"Rest",n:"Rest day and recovery jog",s:"No strength training today",r:1,x:[],j:"Slowest pace. If very sore, jog 2 min / walk 2 min but still cover 5 km."}
];
var ICD=["dumbbell","run","flame","dumbbell","flame","stretch","moon"],IG={"Warm-up":"sun","Strength":"dumbbell","Mobility":"stretch","5 km run and walk":"run","Cool-down":"wind","Daily habits":"flame"},IH={h1:"drop",h2:"egg",h3:"moon"};
function ic(n,c){return '<svg class="'+(c||"i")+'"><use href="#i-'+n+'"/></svg>'}
var IV=["1 min jog, 2 min walk","2 min jog, 1 min walk","4 min jog, 1 min walk","6 min jog, 1 min walk"];
function axPlan(){return APP&&APP.plans&&APP.plans[APP.active]?APP.plans[APP.active]:null}
function axSched(){var e=axPlan();return e&&Array.isArray(e.schedMap)?e.schedMap:[]}
function axEdits(){var e=axPlan();return e&&e.workoutEdits&&typeof e.workoutEdits==="object"?e.workoutEdits:{}}
function axRoutes(){var e=axPlan();if(!e)return {};e.routes=e.routes&&typeof e.routes==="object"?e.routes:{};return e.routes}
function axSrc(i){var m=axSched();return m.length?(i<m.length?m[i]:i):i}
function axShiftSt(at){var out={};Object.keys(st).forEach(function(k){var m=/^(\d+)(?=:)/.exec(k),d=/^([wrgsx]|jt|wk)(\d+)$/.exec(k);if(m&&+m[1]>=at)out[(+m[1]+1)+k.slice(m[1].length)]=st[k];else if(d&&+d[2]>=at)out[d[1]+(+d[2]+1)]=st[k];else out[k]=st[k]});st=out;APP.plans[APP.active].st=st;var plan=axPlan(),edits=plan&&plan.workoutEdits;if(edits&&typeof edits==="object"){var moved={};Object.keys(edits).forEach(function(k){var n=+k;if(/^\d+$/.test(k)&&n>=at)moved[String(n+1)]=edits[k];else moved[k]=edits[k]});plan.workoutEdits=moved}
 var routes=plan&&plan.routes;if(routes&&typeof routes==="object"){var rr={};Object.keys(routes).forEach(function(k){var n=+k;if(/^\d+$/.test(k)&&n>=at)rr[String(n+1)]=routes[k];else rr[k]=routes[k]});plan.routes=rr}}
function axShiftPreview(i){
 var old=[],neu=[],end=Math.min(ND,i+7);
 for(var j=i;j<end;j++){var os=axSrc(j),ot=os<0?null:T[wdk(os)];old.push((j+1)+'. '+dl(j)+': '+(ot?ot.n:'Rest'))}
 var currentMap=axSched();var map=currentMap.length?currentMap.slice():Array.from({length:ND},function(_,n){return n});map.splice(i,0,-1);
 for(var j=i;j<Math.min(map.length,i+8);j++){var ns=map[j],nt=ns<0?null:T[wdk(ns)];neu.push((j+1)+'. '+dl(j)+': '+(nt?nt.n:'Rest'))}
 axSheet('Preview schedule change','<p class="ax-sub">Move this workout and following sessions forward by one day. Nothing changes until you confirm.</p><div class="ax-card"><p class="ax-cap">CURRENT SCHEDULE</p>'+old.map(function(x){return'<p>'+esc(x)+'</p>'}).join('')+'</div><div class="ax-card"><p class="ax-cap">PROPOSED SCHEDULE</p>'+neu.map(function(x){return'<p>'+esc(x)+'</p>'}).join('')+'</div><div style="display:flex;gap:8px"><button class="ax-btn" id="ax-shift-cancel">Cancel</button><button class="ax-btn ax-pri" id="ax-shift-apply">Apply change</button></div>');
 $('ax-shift-cancel').onclick=axSheetX;
 $('ax-shift-apply').onclick=function(){if(i<todayIdx()){toast('Past days cannot be rescheduled');return}if(TM){toast('Finish or close the active run before changing the schedule.');return}if(Object.keys(st).some(function(k){return k.indexOf(i+':')===0})||(st['g'+i]||st['r'+i]||st['s'+i]||st['w'+i]||st['jt'+i]||st['wk'+i])){toast('This day has recorded activity. Choose a future day to reschedule.');return}var currentMap=axSched();var map=currentMap.length?currentMap.slice():Array.from({length:ND},function(_,n){return n});map.splice(i,0,-1);var pe=axPlan();pe.schedMap=map;axShiftSt(i);ND=map.length;if(typeof clrLast==='function')clrLast();save();axSheetX();cur=i;render();toast('Schedule shifted. Workout history retained.')};
}
function axEditWorkout(i){
 var src=axSrc(i);if(src<0){toast('This is a planned rest day');return}var t=T[wdk(src)],key=String(i),ed=axEdits()[key]||{},h='<p class="ax-sub">Adjust this day only using + and −.</p>';
 t.x.forEach(function(e,n){var v=ed[n]||{},sets=Number.isFinite(v.sets)?v.sets:e[1],reps=Number.isFinite(v.reps)?v.reps:parseInt(e[2],10)||8;h+='<div class="ax-card" style="margin:10px 0"><b>'+esc(e[0])+'</b><div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span>Sets</span><div><button class="ax-btn" data-ed="sets" data-n="'+n+'" data-d="-1">−</button> <b id="ax-ed-s'+n+'">'+sets+'</b> <button class="ax-btn" data-ed="sets" data-n="'+n+'" data-d="1">+</button></div></div><div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span>Reps</span><div><button class="ax-btn" data-ed="reps" data-n="'+n+'" data-d="-1">−</button> <b id="ax-ed-r'+n+'">'+reps+'</b> <button class="ax-btn" data-ed="reps" data-n="'+n+'" data-d="1">+</button></div></div></div>'});
 h+='<button class="ax-btn ax-pri" id="ax-ed-save">Save workout changes</button>';axSheet('Edit workout · '+dl(i),h);
 $('ax-shb').querySelectorAll('[data-ed]').forEach(function(b){b.onclick=function(){var n=+b.dataset.n,k=b.dataset.ed,pe=axPlan(),all=pe.workoutEdits=pe.workoutEdits||{},day=all[key]=all[key]||{},v=day[n]=day[n]||{},e=t.x[n],sets=Number.isFinite(v.sets)?v.sets:e[1],reps=Number.isFinite(v.reps)?v.reps:parseInt(e[2],10)||8;v[k]=Math.max(1,Math.min(k==='sets'?10:50,(k==='sets'?sets:reps)+(+b.dataset.d)));$('ax-ed-'+(k==='sets'?'s':'r')+n).textContent=v[k]}});
 $('ax-ed-save').onclick=function(){save();axSheetX();render();toast('Workout updated')};
}


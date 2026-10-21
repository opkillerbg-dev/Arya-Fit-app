// Synthetic GPS run generator + old/new distance filters (tuning harness)
function rng(seed){var s=seed>>>0||1;return function(){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
function gauss(r){var u=Math.max(1e-9,r()),v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
var R=6371000,D2R=Math.PI/180;
function hav(a,b,c,d){var dl=(c-a)*D2R,dn=(d-b)*D2R,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a*D2R)*Math.cos(c*D2R)*Math.sin(dn/2)*Math.sin(dn/2);return 2*R*Math.asin(Math.sqrt(x))}
// build truth: winding path, jog 4min/walk 1min, one stop, returns fixes list
function gen(seed,o){o=o||{};var r=rng(seed),sig=o.sig||3.5,wh=o.white||1.2,tau=o.tau||8,rho=Math.exp(-1/tau);
  var lat0=40.7,lon0=-74,mx=1/(111320),my=1/(111320*Math.cos(lat0*D2R));
  var x=0,y=0,hd=r()*6.28,t=0,fixes=[],ex=0,ey=0,tdist=0,total=o.total||3500,seg=0,turnIn=100+r()*150;
  var stopAt=o.stop===false?-1:1200+r()*600,stopLeft=0,gapAt=o.gap===false?-1:2000+r()*500,gapLeft=0;
  while(tdist<total){
    var ph=(t%300)<240?0:1,v=ph?1.4:2.9+0.3*gauss(r);v=Math.max(0.8,v);
    if(stopAt>0&&tdist>=stopAt&&!stopLeft&&stopAt>0){stopLeft=20;stopAt=-1}
    var tv=v;if(stopLeft>0){tv=0;stopLeft--}
    // heading change
    turnIn-=tv;if(turnIn<=0){hd+=(r()<.5?-1:1)*(Math.PI/2*(0.6+r()*0.8));turnIn=80+r()*200}
    x+=Math.cos(hd)*tv;y+=Math.sin(hd)*tv;tdist+=tv;t+=1;
    ex=rho*ex+Math.sqrt(1-rho*rho)*sig*gauss(r);ey=rho*ey+Math.sqrt(1-rho*rho)*sig*gauss(r);
    var nx=x+ex+wh*gauss(r),ny=y+ey+wh*gauss(r);
    var acc=3+r()*4;if(r()<0.02){nx+=(r()<.5?-1:1)*(18+r()*10);ny+=(r()<.5?-1:1)*(18+r()*10);acc=6+r()*4}
    if(gapAt>0&&tdist>=gapAt&&!gapLeft){gapLeft=40;gapAt=-1}
    if(gapLeft>0){gapLeft--;continue}
    var spd=Math.max(0,tv+0.25*gauss(r));
    fixes.push({la:lat0+ny*mx,lo:lon0+nx*my,acc:acc,spd:spd,t:t*1000});
  }
  return{fixes:fixes,truth:tdist};
}
function oldAlgo(fixes){var d=0,last=null;fixes.forEach(function(f){if(f.acc>30)return;if(last){var dts=(f.t-last.t)/1000;if(dts>25){last=f;return}var dd=hav(last.la,last.lo,f.la,f.lo);if(dd<3)return;if(dd/Math.max(dts,.001)>8)return;d+=dd}last=f});return d}
module.exports={gen:gen,oldAlgo:oldAlgo,hav:hav,rng:rng,gauss:gauss};
// variants of the Doppler channel for robustness tests
module.exports.withSpeed=function(fixes,mode,seed){var r=rng(seed||5);return fixes.map(function(f,i){var o=Object.assign({},f);
  if(mode=="none")o.spd=-1;else if(mode=="zero")o.spd=0;else if(mode=="bias8")o.spd=f.spd*1.08;else if(mode=="low8")o.spd=f.spd*0.92;
  else if(mode=="chord"){ // speed derived from position differences (noisy), like some devices
    if(i>0){var p=fixes[i-1];o.spd=Math.min(12,hav(p.la,p.lo,f.la,f.lo)/Math.max(.2,(f.t-p.t)/1000))}else o.spd=0}
  return o})};

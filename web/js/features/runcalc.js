/* Arya Fit v92: run maths. Pure functions, no DOM, so they run in Node tests too.
   - Track: live GPS filter (accuracy-weighted smoothing, distance gate, stop and glitch rejection, gap bridging).
     native/java/RunTrack.java is the same algorithm; keep the two in step (tests/runcalc.test.js checks the JS one).
   - splits(): per-km splits and an even-distance pace profile from a full-resolution route.
   - summarize(): the compact record saved after a run (APP.plans[..].rsum). */
(function(root){
  "use strict";
  var R=6371000,D2R=Math.PI/180;
  var CFG={maxAcc:30,lockAcc:22,maxSpeed:8,gapS:25,gapMax:4.5,minStep:4,stepAcc:.5,sa:.2,still:.4};

  function hav(a1,o1,a2,o2){
    var dl=(a2-a1)*D2R,dn=(o2-o1)*D2R,
        x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a1*D2R)*Math.cos(a2*D2R)*Math.sin(dn/2)*Math.sin(dn/2);
    return 2*R*Math.asin(Math.min(1,Math.sqrt(x)));
  }

  /* ---------- live GPS filter ----------
     Constant-velocity Kalman filter in local metres (x east, y north). Both axes share one covariance, so it is
     computed once. Measurement noise = reported accuracy squared. On top of it: a distance gate (anchor point),
     stop detection from the Doppler speed, wild-fix rejection and a straight-line bridge over short signal gaps. */
  var M=111320;
  function Track(cfg){
    this.c={};for(var k in CFG)this.c[k]=(cfg&&cfg[k]!=null)?cfg[k]:CFG[k];
    this.dist=0;this.fixes=0;this.used=0;this.dropped=0;this.lastAcc=-1;this.locked=false;
    this.accSum=0;this.accN=0;this.outLa=0;this.outLo=0;this.lastInc=0;this.bad=0;this.gaps=0;
    this.sumS=0;this.sumC=0;this.pSpd=-1;this.fastT=0;
    this.has=false;
  }
  /* Forget the filter state (pause, resume), keep the totals. */
  Track.prototype.restart=function(){this.has=false;this.bad=0;this.pSpd=-1};
  /* Doppler speed (spd) is the accurate part of GPS. We integrate it next to the chord length of the smoothed
     track; when the two roughly agree, chord steps are scaled down to the Doppler total (never up). If the device
     reports no usable speed, or the two disagree a lot, the scale stays 1 and only the smoothed chord counts. */
  Track.prototype.scale=function(){
    if(this.sumC<150)return 1;
    var q=this.sumS/this.sumC;if(q<.7||q>1.15)return 1;
    return Math.max(.85,Math.min(1,q));
  };
  Track.prototype._init=function(la,lo,acc,t){
    this.oLa=la;this.oLo=lo;this.kx=Math.cos(la*D2R)*M;
    if(!this.fastT)this.fastT=t;
    this.x=0;this.y=0;this.vx=0;this.vy=0;
    this.pp=acc*acc;this.pv=0;this.vv=9;this.lt=t;this.has=true;this.bad=0;
    this.ax=0;this.ay=0;this.aT=t;
  };
  Track.prototype._pos=function(){this.outLa=this.oLa+this.y/M;this.outLo=this.oLo+this.x/this.kx};
  /* la/lo degrees, acc metres (<=0 unknown), spd m/s (<0 unknown), t ms (any monotonic clock).
     Returns true when the fix adds a route point (this.outLa/outLo = smoothed point). */
  Track.prototype.add=function(la,lo,acc,spd,t){
    var c=this.c;this.fixes++;this.lastAcc=acc;
    if(!(acc>0))acc=15;
    if(acc>c.maxAcc){this.dropped++;return false}
    if(!this.locked){if(acc>c.lockAcc){this.dropped++;return false}this.locked=true}
    this.accSum+=acc;this.accN++;
    if(!this.has){this._init(la,lo,acc,t);this._pos();this.lastInc=0;return true}
    var dt=(t-this.lt)/1000;
    if(dt<=.05){this.dropped++;return false}
    if(dt>c.gapS){
      this.gaps++;
      /* signal was lost: bridge with a straight line when the speed is plausible, then start the filter again */
      var zx=(lo-this.oLo)*this.kx,zy=(la-this.oLa)*M,dg=Math.sqrt((zx-this.ax)*(zx-this.ax)+(zy-this.ay)*(zy-this.ay)),
          ok=dg>=3&&dg/((t-this.aT)/1000)<=c.gapMax;
      if(ok){this.dist+=dg;this.lastInc=dg;this.used++}else this.lastInc=0;
      this._init(la,lo,acc,t);this._pos();this.pSpd=-1;return true;
    }
    var zx2=(lo-this.oLo)*this.kx,zy2=(la-this.oLa)*M,
        qa=c.sa*c.sa,d2=dt*dt,d3=d2*dt,d4=d3*dt,
        pp=this.pp+2*dt*this.pv+d2*this.vv+qa*d4/4,
        pv=this.pv+dt*this.vv+qa*d3/2,
        vv=this.vv+qa*d2,
        px=this.x+this.vx*dt,py=this.y+this.vy*dt,
        rx=zx2-px,ry=zy2-py,dev=Math.sqrt(rx*rx+ry*ry),S=pp+acc*acc;
    /* a wild fix (far outside what the filter expects, faster than anyone runs) must not drag the track */
    if(dev>4*Math.sqrt(S)&&dev/dt>c.maxSpeed*1.5&&this.bad<3){this.bad++;this.dropped++;return false}
    this.bad=0;
    var sp=spd>=0?(spd<c.still?0:spd):-1;
    if(sp>=0&&this.pSpd>=0)this.sumS+=.5*(sp+this.pSpd)*dt;
    this.pSpd=sp;
    var k1=pp/S,k2=pv/S;
    this.x=px+k1*rx;this.y=py+k1*ry;this.vx+=k2*rx;this.vy+=k2*ry;
    this.pp=(1-k1)*pp;this.pv=(1-k1)*pv;this.vv=vv-k2*pv;
    /* "standing still" is only believed from a speed channel that has shown real movement within 2 minutes;
       a device that reports a constant 0 would otherwise freeze the distance */
    if(spd>=1)this.fastT=t;
    var still=spd>=0&&spd<c.still&&t-this.fastT<=120000;
    if(still){this.vx*=.5;this.vy*=.5}
    this.lt=t;
    var ex=this.x-this.ax,ey=this.y-this.ay,d=Math.sqrt(ex*ex+ey*ey),need=Math.max(c.minStep,c.stepAcc*acc);
    if(d<need||(still&&d<acc))return false;
    var v=d/((t-this.aT)/1000);
    if(v>c.maxSpeed||(spd>=0&&v>2.5*spd+3)){this.dropped++;return false}
    this.sumC+=d;var inc=d*this.scale();
    this.dist+=inc;this.lastInc=inc;this.used++;
    this.ax=this.x;this.ay=this.y;this.aT=t;this._pos();
    return true;
  };
  Track.prototype.avgAcc=function(){return this.accN?this.accSum/this.accN:0};

  /* ---------- splits and pace profile ----------
     pts: [[lat,lng,tMs],...] full resolution, time order. pauses: gaps longer than gapS between two points
     are not counted as time (screen-off gaps are rare here because the native engine keeps recording).
     Returns {km:[sec per full km], part:[meters,sec]|null, pp:[sec/km per even bucket], dist, sec, best, worst} */
  function splits(pts,opt){
    opt=opt||{};var gapS=opt.gapS||25,nb=opt.buckets||20;
    var cum=[0],tt=[0],i,d,dtm,gaps=0;
    if(!pts||pts.length<2)return{km:[],part:null,pp:[],dist:0,sec:0,best:0,worst:0};
    for(i=1;i<pts.length;i++){
      d=hav(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1]);dtm=(pts[i][2]-pts[i-1][2])/1000;
      if(!(dtm>0))dtm=0;
      /* a long gap with almost no distance is a pause, not slow running */
      if(dtm>gapS&&d<dtm*.5){dtm=0;gaps++}
      cum.push(cum[i-1]+d);tt.push(tt[i-1]+dtm);
    }
    var total=cum[cum.length-1],secT=tt[tt.length-1];
    function tAt(m){ /* time at cumulative distance m, linear inside the segment */
      if(m<=0)return 0;if(m>=total)return secT;
      var lo=0,hi=cum.length-1;
      while(hi-lo>1){var mid=(lo+hi)>>1;if(cum[mid]<=m)lo=mid;else hi=mid}
      var span=cum[hi]-cum[lo];return tt[lo]+(span>0?(tt[hi]-tt[lo])*(m-cum[lo])/span:0);
    }
    var km=[],n=Math.floor(total/1000),prev=0,k;
    for(k=1;k<=n;k++){var tk=tAt(k*1000);km.push(Math.round(tk-prev));prev=tk}
    var restM=total-n*1000,part=restM>=50?[Math.round(restM),Math.round(secT-prev)]:null;
    var pp=[],bw=total/nb;
    if(total>=200){for(k=0;k<nb;k++){var a=tAt(k*bw),b=tAt((k+1)*bw);pp.push(Math.round((b-a)/(bw/1000)))}}
    var best=0,worst=0;
    km.forEach(function(s){if(!best||s<best)best=s;if(s>worst)worst=s});
    return{km:km,part:part,pp:pp,dist:total,sec:secT,best:best,worst:worst,gaps:gaps};
  }

  /* ---------- the saved record ----------
     s: {pts, dist(m), sec, steps, jt, wt, trk, acc(avg gps m), est(m estimated from steps), lvl(label), t(end ms)}
     Keeps it small: about 150 bytes plus the per-km list. */
  function summarize(s){
    var o={t:s.t||Date.now(),d:Math.round(s.dist||0),s:Math.round(s.sec||0)};
    if(s.steps>0)o.st=Math.round(s.steps);
    if(s.jt>0)o.jt=Math.round(s.jt);
    if(s.wt>0)o.wt=Math.round(s.wt);
    var sp=s.pts&&s.pts.length>=5?splits(s.pts):null;
    if(sp&&sp.dist>=100){
      o.km=sp.km;if(sp.part)o.pt=sp.part;if(sp.pp.length)o.pp=sp.pp;
    }
    if(s.acc>0)o.ga=Math.round(s.acc);
    if(s.est>30)o.es=Math.round(s.est);
    if(s.lvl)o.lv=String(s.lvl).slice(0,40);
    var mv=(o.jt||0)+(o.wt||0)||o.s;
    if(o.st&&mv>=60)o.cd=Math.round(o.st/(mv/60));           /* cadence, steps per minute */
    if(o.st>=30&&o.d>=100)o.sl=Math.round(o.d/o.st*100)/100; /* stride, metres */
    return o;
  }

  /* quality label from average GPS accuracy (m) and share of estimated distance */
  function quality(avgAcc,est,dist){
    var share=dist>0?est/dist:0;
    if(!(avgAcc>0))return{k:"none",t:"No GPS"};
    if(avgAcc<=8&&share<.05)return{k:"good",t:"GPS good"};
    if(avgAcc<=15&&share<.15)return{k:"ok",t:"GPS fair"};
    return{k:"weak",t:"GPS weak"};
  }

  /* Auto-pause detector. "Moving" only from positive evidence (Doppler speed, displacement beyond GPS noise, steps);
     "still" only while GOOD GPS fixes keep arriving with no evidence for stillMs. Weak or missing GPS never pauses. */
  function Move(t0){this.lastMove=t0||0;this.lastGood=0;this.ax=null;this.steps=-1;this.ev=[]}
  Move.stillMs=20000;
  Move.prototype.mark=function(t){this.lastMove=t;this.ev.push(t);if(this.ev.length>16)this.ev.shift()};
  Move.prototype.fix=function(t,la,lo,acc,spd,steps){
    if(steps>=0){if(this.steps>=0&&steps>this.steps)this.mark(t);this.steps=steps}
    if(!(acc>0&&acc<=30)){if(t>this.lastMove)this.lastMove=t;return}
    this.lastGood=t;
    if(spd>=.3)this.mark(t);
    if(!this.ax)this.ax={la:la,lo:lo};else if(hav(this.ax.la,this.ax.lo,la,lo)>=Math.max(4,.6*acc)){this.mark(t);this.ax={la:la,lo:lo}}};
  Move.prototype.still=function(t){return t-this.lastMove>=Move.stillMs&&t-this.lastGood<=10000};
  Move.prototype.recent=function(t,win){var n=0;for(var i=0;i<this.ev.length;i++)if(t-this.ev[i]<=win)n++;return n};

  var api={Move:Move,Track:Track,splits:splits,summarize:summarize,quality:quality,hav:hav,CFG:CFG};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.AxRun=api;
})(typeof window!=="undefined"?window:this);

/* GPX 1.1 export of a saved run route. Works in the browser and in node (tests). */
(function(root){
  function esc(x){return String(x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  function hav(a1,o1,a2,o2){var R=6371000,r=Math.PI/180,dl=(a2-a1)*r,dn=(o2-o1)*r,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a1*r)*Math.cos(a2*r)*Math.sin(dn/2)*Math.sin(dn/2);return 2*R*Math.asin(Math.sqrt(x))}
  function iso(t){return typeof t==="number"&&isFinite(t)&&t>9e11?new Date(t).toISOString():""}
  function p2(n){return(n<10?"0":"")+n}
  /* pts: [[lat,lon,epochMs],...]. A pause (long gap, almost no movement) starts a new <trkseg> so viewers do not draw a speed spike. */
  function build(pts,o){
    o=o||{};var gapS=o.gapS||25,n=pts.length,t0=iso(pts[0][2]);
    var h=['<?xml version="1.0" encoding="UTF-8"?>',
      '<gpx version="1.1" creator="Arya Fit" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">',
      '<metadata><name>'+esc(o.name||"Arya Fit run")+'</name>'+(t0?'<time>'+t0+'</time>':'')+'</metadata>',
      '<trk><name>'+esc(o.name||"Arya Fit run")+'</name>'+(o.desc?'<desc>'+esc(o.desc)+'</desc>':'')+'<type>running</type><trkseg>'];
    for(var i=0;i<n;i++){
      if(i>0){var dt=(pts[i][2]-pts[i-1][2])/1000,d=hav(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1]);
        if(dt>gapS&&d<dt*.5)h.push('</trkseg><trkseg>')}
      var tm=iso(pts[i][2]);
      h.push('<trkpt lat="'+(+pts[i][0]).toFixed(6)+'" lon="'+(+pts[i][1]).toFixed(6)+'">'+(tm?'<time>'+tm+'</time>':'')+'</trkpt>')}
    h.push('</trkseg></trk></gpx>');return h.join("\n")}
  function fileName(pts,dy){var t=pts&&pts[0]&&pts[0][2];
    if(typeof t==="number"&&t>9e11){var d=new Date(t);return"Arya-Run-"+d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())+".gpx"}
    return"Arya-Run-day"+((dy|0)+1)+".gpx"}
  function exportRun(D){
    var pts=D&&D.pts;if(!pts||pts.length<5){toast("No route saved for this run.");return}
    var s=D.sum||{},desc=(s.d>=100?(s.d/1000).toFixed(2)+" km in "+fmt(s.s||0):"");
    var txt=build(pts,{name:"Arya Fit run"+(D.date?" · "+D.date:""),desc:desc});
    Promise.resolve(axOut(fileName(pts,D.dy),txt)).then(function(r){
      if(r===1)toast("GPX saved");else if(!r&&typeof copyText==="function")copyText(txt,"Couldn't save the file. GPX copied instead.")}).catch(function(){})}
  var api={build:build,fileName:fileName,exportRun:exportRun};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.AxGpx=api;
})(typeof window!=="undefined"?window:this);

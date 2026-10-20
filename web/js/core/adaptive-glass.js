(function(){
  var root=document.documentElement;
  try {
    var mq=window.matchMedia&&window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
    var conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    var saveData=!!(conn&&conn.saveData);
    var mem=Number(navigator.deviceMemory)||0;
    var cores=Number(navigator.hardwareConcurrency)||0;
    /* Conservative signals only: don't disable glass just because a device lacks reporting APIs. */
    var constrained=saveData||(mem>0&&mem<=3)||(cores>0&&cores<=4);
    if(mq||constrained) root.classList.add('ax-lite-glass');
    root.setAttribute('data-glass-mode',root.classList.contains('ax-lite-glass')?'efficient':'full');
  } catch(e) { root.setAttribute('data-glass-mode','full'); }
})();

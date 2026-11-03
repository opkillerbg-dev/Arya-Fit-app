const V2 = require("../web/js/ui/v2-core.js");
let n=0,bad=0;function ok(x,m){n++;if(!x){bad++;console.log("FAIL",m)}}
ok(V2.chooseFx({reason:"stable",tier:"strict",fps:60,base:16.7})==="full","strict stable chooses full");
ok(V2.chooseFx({reason:"stable",tier:"strict",fps:52,base:16.7})==="lite","under 90% refresh chooses lite");
ok(V2.chooseFx({reason:"stable",tier:"relaxed",fps:60,base:16.7})==="lite","relaxed chooses lite");
ok(V2.chooseFx({reason:"timeout"})==="solid","timeout chooses solid");
ok(V2.chooseFx({reason:"stable",tier:"strict",fps:60,base:16.7},{forced:"solid"})==="solid","manual tier wins");
ok(V2.chooseFx({}, {reducedTransparency:true})==="solid","reduced transparency chooses solid");
ok(V2.scrollDirection(0,25,{collapsed:false})==="down","scroll down detected");
ok(V2.scrollDirection(100,70,{collapsed:true})==="up","scroll up detected");
ok(V2.scrollDirection(100,108,{collapsed:true,direction:"down"})==="down","hysteresis holds state");
console.log(bad?bad+" of "+n+" failed":"v2 core: "+n+" checks ok");process.exit(bad?1:0);

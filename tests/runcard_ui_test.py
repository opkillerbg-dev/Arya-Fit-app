#!/usr/bin/env python3
"""Real-browser test of the run share card: formats, transparent sticker, PR chips, preview flow. Run from repo root."""
import subprocess, sys, time, os, base64
from playwright.sync_api import sync_playwright
PORT = "8890"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
SEED = """
(function(){var p=APP.plans[APP.active],T=Date.now()-3600000*30;
 function route(v){var a=[],la=40.7,lo=-74,t=T;for(var i=0;i<1700;i++){a.push([la,lo,t]);la+=v*Math.cos(i/90)/111195;lo+=v*Math.sin(i/90)/85000;t+=1000}return a}
 var r1=route(2.6),r2=route(3.0);
 saveRoute(0,r1);saveRoute(1,r2);
 p.rsum={"0":[AxRun.summarize({pts:r1,dist:4400,sec:1700,t:T+1700000})],"1":[AxRun.summarize({pts:r2,dist:5100,sec:1700,t:T+86400000+1700000})]};
 p.st["g0"]=4400;p.st["r0"]=1700;p.st["g1"]=5100;p.st["r1"]=1700;save()})()
"""
def has_gold(pg, mode):
    return pg.evaluate("""(m)=>{var D=AxRunSum.data(1),cv=AxRunCard.draw(D,m),c=cv.getContext('2d');
      var d=c.getImageData(560,196+(m==='story'?190:0),440,120).data;for(var i=0;i<d.length;i+=4)if(Math.abs(d[i]-201)<6&&Math.abs(d[i+1]-151)<6&&Math.abs(d[i+2]-28)<6)return true;return false}""", mode)
try:
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel="chrome")
        except Exception: b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 390, "height": 844}); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load"); pg.wait_for_timeout(1500); pg.evaluate(SEED)
        dims = pg.evaluate("""['post','story','sticker'].map(m=>{var c=AxRunCard.draw(AxRunSum.data(1),m);return[c.width,c.height]})""")
        check("post 1080x1350, story 1080x1920, sticker 1080x1350", dims == [[1080, 1350], [1080, 1920], [1080, 1350]], dims)
        a = pg.evaluate("""(()=>{var D=AxRunSum.data(1);return['post','story','sticker'].map(m=>AxRunCard.draw(D,m).getContext('2d').getImageData(3,3,1,1).data[3])})()""")
        check("post and story are opaque, sticker corner is transparent", a == [255, 255, 0], a)
        check("PR chip is drawn on the post card", has_gold(pg, "post"))
        check("PR chip is drawn on the story card", has_gold(pg, "story"))
        check("no PR chip on the older, slower run", not pg.evaluate("""(()=>{var D=AxRunSum.data(0),c=AxRunCard.draw(D,'post').getContext('2d'),d=c.getImageData(560,196,440,120).data;for(var i=0;i<d.length;i+=4)if(Math.abs(d[i]-201)<6&&Math.abs(d[i+1]-151)<6&&Math.abs(d[i+2]-28)<6)return true;return false})()"""))
        pg.evaluate("AxRunSum.open(1,0)"); pg.wait_for_timeout(500); pg.evaluate("document.getElementById('rs-share').click()"); pg.wait_for_timeout(700)
        check("share opens a preview with format chips", pg.evaluate("!!document.getElementById('ax-rc-i')&&document.querySelectorAll('#ax-rc-f [data-m]').length===3"))
        pg.evaluate("document.querySelector('#ax-rc-f [data-m=story]').click()"); pg.wait_for_timeout(500)
        check("Story chip switches the preview to 1080x1920", pg.evaluate("document.getElementById('ax-rc-i').naturalHeight") == 1920)
        pg.screenshot(path="/tmp/rc_prev.png")
        for m in ("post", "story", "sticker"):
            u = pg.evaluate("m=>AxRunCard.draw(AxRunSum.data(1),m).toDataURL('image/png')", m); open(f"/tmp/rc_{m}.png", "wb").write(base64.b64decode(u.split(",")[1]))
        pg.evaluate("document.querySelector('#ax-rc-x').click()")
        check("close removes the preview", pg.evaluate("!document.getElementById('gov')"))
        check("no page errors", not errs, errs); b.close()
finally: srv.kill()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

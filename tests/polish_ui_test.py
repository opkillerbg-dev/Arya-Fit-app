#!/usr/bin/env python3
"""S11 polish: the onboarding wizard on small phones (360x640, 320x568), with screen-reader names, focus, reduced motion and text contrast
across every skin (normal and AMOLED). Run from the repo root."""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8905"; root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(n, c, i=""):
    print(("ok   " if c else "FAIL ") + n + ("" if c else "  -> " + str(i)))
    if not c: fails.append(n)
CONTRAST = """()=>{
 const parse=c=>{c=c.trim();let m;if(m=c.match(/^color\\(srgb\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)(?:\\s*\\/\\s*([\\d.]+))?\\)/))return [m[1]*255,m[2]*255,m[3]*255,m[4]===undefined?1:+m[4]];
   const a=c.match(/[\\d.]+/g).map(Number);return [a[0],a[1],a[2],a.length>3?a[3]:1]};
 const lum=c=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2])};
 const bgOf=el=>{let e=el;while(e){const b=parse(getComputedStyle(e).backgroundColor);if(b[3]>0.9)return b;e=e.parentElement}return [255,255,255,1]};
 const out=[];
 document.querySelectorAll('#ax-ob *').forEach(el=>{
   if(!el.offsetParent&&el.id!=='ax-ob')return;
   if(el.closest('[aria-hidden=true]'))return;
   const own=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
   if(!own)return;
   const cs=getComputedStyle(el),l1=lum(parse(cs.color)),l2=lum(bgOf(el)),r=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
   const size=parseFloat(cs.fontSize),bold=parseInt(cs.fontWeight)>=700,large=size>=24||(size>=18.66&&bold),need=large?3:4.5;
   if(r<need)out.push((el.className||el.tagName)+' "'+own.slice(0,24)+'" '+r.toFixed(2)+' < '+need);
 });
 return out}"""
LAYOUT = """()=>{
 document.getAnimations().forEach(a=>{try{a.finish()}catch(e){}});   /* measure the settled layout, the slide-in is clipped by overflow-x:hidden */
 const ob=document.getElementById('ax-ob'),bd=document.getElementById('ob-bd'),vh=window.innerHeight,vw=window.innerWidth,bad=[];
 if(!ob)return ['no wizard'];
 if(getComputedStyle(bd).overflowX!=='hidden')bad.push('slide-in not clipped');
 if(bd.scrollWidth>bd.clientWidth+1)bad.push('body scrolls sideways '+bd.scrollWidth+'>'+bd.clientWidth);
 if(ob.scrollWidth>ob.clientWidth+1)bad.push('overlay too wide');
 const nav=ob.querySelector('.ob-nav').getBoundingClientRect();if(nav.bottom>vh+1||nav.top<0)bad.push('nav off screen '+Math.round(nav.top)+'-'+Math.round(nav.bottom)+' of '+vh);
 const pri=ob.querySelector('.ob-nav .ob-pri');if(pri){const r=pri.getBoundingClientRect();if(r.bottom>vh+1||r.right>vw+1||r.left<-1)bad.push('main button off screen')}
 ob.querySelectorAll('button').forEach(b=>{if(!b.offsetParent)return;const r=b.getBoundingClientRect();if(r.height<47.5&&!b.classList.contains('ob-wt-b'))bad.push('small target '+(b.innerText||b.getAttribute('aria-label'))+' '+Math.round(r.height))});
 ob.querySelectorAll('input').forEach(i=>{if(!i.offsetParent)return;if(i.getBoundingClientRect().height<47.5)bad.push('small input '+i.id)});
 return bad}"""
NAMES = """()=>{
 const ob=document.getElementById('ax-ob'),bad=[];
 ob.querySelectorAll('button,input').forEach(e=>{if(!e.offsetParent)return;
   const lab=e.id&&ob.querySelector('label[for="'+e.id+'"]'),wrap=e.closest('label');
   const name=(e.getAttribute('aria-label')||e.innerText||(wrap&&wrap.innerText)||(lab&&lab.innerText)||'').replace(/\\s+/g,' ').trim();
   if(!name)bad.push('unnamed '+e.tagName+'#'+e.id+'.'+e.className)});
 ob.querySelectorAll('[role=group]').forEach(g=>{if(!g.getAttribute('aria-label'))bad.push('unnamed group '+g.className)});
 if(ob.querySelectorAll('h1').length!==1)bad.push('h1 count '+ob.querySelectorAll('h1').length);
 const pr=ob.querySelector('[role=progressbar]');if(pr&&!pr.getAttribute('aria-label'))bad.push('progressbar unnamed');
 return bad}"""
def draft(step): return "localStorage.setItem('aryaOnboardDraft',JSON.stringify({step:%d,xp:'int',env:'homeplus',equip:['pullbar','dumbbell'],health:'check',age:'under18',goal:{main:'muscle',extra:'run'},days:4,mins:45,weeks:8,start:'today',bench:{push:50,pull:3,squat:30,plank:90}}))" % step
PROFILE = """(()=>{const now=Date.now(),b={push:50,pull:3,squat:30,plank:45,run:null,lifts:{squat:null,bench:null,deadlift:null,ohp:null}};
 const p0={done:true,ts:now-30*864e5,xp:'int',env:'homeplus',equip:['pullbar','backpack'],goal:{main:'muscle',extra:null},days:4,mins:45,weeks:8,start:'today',bench:b,weak:['pull'],weakAsked:true,want:[],protect:[],health:'ok',age:'30-39',name:'Arya',wt:76,ht:178};
 const A=AxLevel.calc(p0);p0.levels=A.levels;p0.retest={last:now-30*864e5,due:now-1000,history:[{ts:now-30*864e5,levels:A.levels}]};return !!AxProfile.set(p0)})()"""
def screens(pg, fn):
    """call fn(label) for welcome, steps 1-9, then the retest and edit screens (needs a profile)"""
    pg.evaluate("localStorage.removeItem('aryaOnboardDraft')"); pg.evaluate("AxOnboard.close();AxOnboard.open()"); pg.wait_for_timeout(80); fn("welcome"); pg.evaluate("AxOnboard.close()")
    for st in range(1, 10):
        pg.evaluate(draft(st)); pg.evaluate("AxOnboard.close();AxOnboard.open()"); pg.wait_for_timeout(80); fn("step %d" % st); pg.evaluate("AxOnboard.close()")
def profile_screens(pg, fn):
    pg.evaluate("AxOnboard.close();AxOnboard.open({retest:true})"); pg.wait_for_timeout(80); fn("retest bench"); pg.evaluate("document.getElementById('ob-next').click()"); pg.wait_for_timeout(80); fn("retest results"); pg.evaluate("AxOnboard.close()")
    pg.evaluate("AxOnboard.open({fromProfile:true,edit:true})"); pg.wait_for_timeout(80)
    for _ in range(8): pg.evaluate("document.getElementById('ob-next').click()")
    pg.wait_for_timeout(80); fn("edit review"); pg.evaluate("AxOnboard.close()")
try:
    with sync_playwright() as pw:
        try: b = pw.chromium.launch(channel="chrome")
        except Exception: b = pw.chromium.launch()
        errs = []
        for (w, h) in [(360, 640), (320, 568)]:
            ctx = b.new_context(viewport={"width": w, "height": h}); pg = ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
            pg.goto(URL, wait_until="load"); pg.wait_for_timeout(1500); pg.add_style_tag(content="*,*::before,*::after{transition:none!important}")
            bad = []
            def lay(label):
                for x in pg.evaluate(LAYOUT): bad.append(label + ": " + x)
            screens(pg, lay)
            pg.evaluate(PROFILE); profile_screens(pg, lay)
            check("%dx%d: no sideways scroll, nav and main button on screen, targets >= 48 px on all 13 screens" % (w, h), not bad, bad[:5])
            ctx.close()
        ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        pg.goto(URL, wait_until="load"); pg.wait_for_timeout(1500); pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important}")
        bad = []
        def nm(label):
            for x in pg.evaluate(NAMES): bad.append(label + ": " + x)
        screens(pg, nm); pg.evaluate(PROFILE); profile_screens(pg, nm)
        check("every button, input and group has a screen-reader name; one heading per screen; progress is named", not bad, bad[:6])
        pg.evaluate(draft(2)); pg.evaluate("AxOnboard.open()"); pg.wait_for_timeout(100)
        check("after a screen change focus moves to the screen content (so TalkBack reads it)", pg.evaluate("document.activeElement&&document.activeElement.id")=="ob-bd")
        check("the dialog is labelled and modal", pg.evaluate("(()=>{const o=document.getElementById('ax-ob');return o.getAttribute('role')==='dialog'&&o.getAttribute('aria-modal')==='true'&&!!o.getAttribute('aria-label')})()"))
        pg.evaluate("AxOnboard.close()")
        # reduced motion: no slide animation
        ctx.close()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce"); pg = ctx.new_page(); pg.goto(URL, wait_until="load"); pg.wait_for_timeout(1500)
        pg.evaluate(draft(3)); pg.evaluate("AxOnboard.open()"); pg.wait_for_timeout(100)
        check("reduced motion: no slide-in animation", pg.evaluate("getComputedStyle(document.getElementById('ob-bd')).animationName") == "none")
        ctx.close()
        # contrast in every skin, normal and AMOLED
        ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); pg.goto(URL, wait_until="load"); pg.wait_for_timeout(1500)
        pg.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important}")
        skins = pg.evaluate("[...new Set([...document.querySelectorAll('.sk')].map(b=>b.dataset.k))]")
        check("found the app skins", len(skins) >= 5, skins)
        for amo in (False, True):
            for sk in skins:
                pg.evaluate("([s,a])=>{PR.skin=s;PR.amo=a;theme()}", [sk, amo]); bad = []
                def ct(label):
                    for x in pg.evaluate(CONTRAST): bad.append(label + ": " + x)
                screens(pg, ct)
                check("text contrast (WCAG AA) on all 10 screens: %s%s" % (sk, " + AMOLED" if amo else ""), not bad, bad[:4])
        check("no page errors", not errs, errs)
        ctx.close(); b.close()
finally:
    srv.terminate()
print("FAILED: " + ", ".join(fails) if fails else "ALL OK"); sys.exit(1 if fails else 0)

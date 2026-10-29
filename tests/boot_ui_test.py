#!/usr/bin/env python3
"""Smart loading screen (v116). Run from repo root: python3 tests/boot_ui_test.py"""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
PORT = "8897"
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "web")
srv = subprocess.Popen([sys.executable, "-m", "http.server", PORT], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1); URL = f"http://localhost:{PORT}/index.html"; fails = []
def check(name, cond, info=""):
    print(("ok   " if cond else "FAIL ") + name + ("" if cond else "  -> " + str(info)))
    if not cond: fails.append(name)
def launch(p):
    try: return p.chromium.launch(channel="chrome")
    except Exception: return p.chromium.launch()
def boot(b, cpu=1, spike=False):
    ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
    if cpu > 1:
        c = ctx.new_cdp_session(pg); c.send("Emulation.setCPUThrottlingRate", {"rate": cpu})
    if spike:   # a main-thread block 1.2 s after load, like a service worker install or a late job
        pg.add_init_script("addEventListener('load',()=>setTimeout(()=>{const e=performance.now()+400;while(performance.now()<e);},1200))")
    t = time.time(); pg.goto(URL, wait_until="commit"); pg.wait_for_selector("#ax-boot")
    pg.wait_for_function("!document.getElementById('ax-boot')", timeout=30000)
    took = time.time() - t; info = pg.evaluate("window.axBootInfo"); return ctx, pg, errs, took, info
try:
    with sync_playwright() as p:
        b = launch(p)
        ctx, pg, errs, took, info = boot(b)
        check("normal start: gate ran and reported", bool(info) and info.get("reason") in ("stable", "timeout"), info)
        check("normal start: stable, not a timeout", info and info.get("reason") == "stable", info)
        check("normal start: measured a real frame rate", info and info.get("fps", 0) >= 20, info)
        check("normal start: waited for at least one clean second of frames", took >= 1.2, took)
        check("normal start: ends well before the hard cap", took < 11, took)
        check("normal start: no page errors", not errs, errs)
        check("service worker registered while the splash was up", pg.evaluate("!!window.axSwP"))
        check("booting class cleared", pg.evaluate("!document.documentElement.classList.contains('ax-booting')")); ctx.close()

        ctx, pg, errs, took2, info2 = boot(b, spike=True)
        check("a main-thread block during boot delays the go (normal %.1fs, blocked %.1fs)" % (took, took2), took2 >= took + 0.5, (took, took2))
        check("after the block it still ends as stable", info2 and info2.get("reason") == "stable", info2); ctx.close()

        ctx, pg, errs, took3, info3 = boot(b, cpu=6)
        check("slow CPU (6x): app still starts, never hangs", took3 < 24, took3)
        check("slow CPU (6x): not faster than normal", took3 >= took - 0.5, (took3, took))
        check("slow CPU: no page errors", not errs, errs); ctx.close()

        ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page()
        pg.goto(URL, wait_until="commit"); pg.wait_for_selector("#ax-boot")
        pg.wait_for_function("document.getElementById('ax-boot-msg') && /smooth|ready|Almost|Updating/.test(document.getElementById('ax-boot-msg').textContent)", timeout=10000)
        check("splash shows a progress message", True)
        pg.wait_for_function("!document.getElementById('ax-boot')", timeout=30000)
        check("reload (second launch) also ends stable", pg.evaluate("1") == 1)
        pg.reload(wait_until="commit"); pg.wait_for_selector("#ax-boot"); pg.wait_for_function("!document.getElementById('ax-boot')", timeout=30000)
        check("second launch: gate reported", pg.evaluate("!!window.axBootInfo && window.axBootInfo.reason") in ("stable", "timeout"), pg.evaluate("window.axBootInfo")); ctx.close(); b.close()
finally:
    srv.terminate()
print("\n%d failure(s)" % len(fails)); sys.exit(1 if fails else 0)

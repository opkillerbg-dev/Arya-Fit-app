#!/usr/bin/env python3
"""Generates every app-icon asset from variants.json using headless Chromium (Playwright).
Run from the repo root:  python3 tools/icons/make_icons.py        (needs: pip install playwright && playwright install chromium)
Writes: native/res/drawable-nodpi/ic_{bg,fg}_<id>.png, native/res/drawable-nodpi/ic_mono.png,
        native/res/mipmap-anydpi-v26/ic_launcher_<id>(_round).xml, native/res/mipmap-<dpi>/ic_launcher_<id>.png (legacy),
        web/icons/icon-*.png (default = first variant), tools/icons/preview.png"""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
cfg = json.load(open(os.path.join(os.path.dirname(__file__), "variants.json")))
M = cfg["mark"]; V = cfg["variants"]

def bg_svg(v, rx=0):
    a, b = v["bg"]
    extra = ""
    if v["glass"]:
        extra = ('<circle cx="30" cy="22" r="46" fill="url(#hl)"/>'
                 '<rect width="108" height="108" rx="%s" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>' % rx)
    return ('<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient>'
            '<radialGradient id="hl"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>'
            '<rect width="108" height="108" rx="%s" fill="url(#g)"/>%s') % (a, b, rx, extra)

def fg_svg(v, mono=False, scale=1.0):
    ink = "#000" if mono else v["ink"]
    acc = "#000" if mono else v["accent"]
    x, y, r = M["dot"]
    shadow = '' if (mono or not v["glass"]) else '<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.6" flood-color="#2a2f8a" flood-opacity=".35"/></filter>'
    f = ' filter="url(#sh)"' if shadow else ''
    t = 'translate(54 54) scale(%s) translate(-54 -54)' % scale
    return ('<defs>%s</defs><g transform="%s"%s><path d="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"/>'
            '<circle cx="%s" cy="%s" r="%s" fill="%s"/></g>') % (shadow, t, f, M["stroke"], ink, M["sw"], x, y, r, acc)

def page(inner, size):
    return '<html><body style="margin:0;background:transparent"><svg id="s" xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 108 108">%s</svg></body></html>' % (size, size, inner)

def write(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True); open(path, "wb").write(data)

with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page()
    def shot(inner, size, path, transparent=True):
        pg.set_viewport_size({"width": size, "height": size}); pg.set_content(page(inner, size))
        write(path, pg.locator("#s").screenshot(omit_background=transparent))
    res = os.path.join(ROOT, "native", "res")
    for v in V:
        i = v["id"]
        shot(bg_svg(v), 432, os.path.join(res, "drawable-nodpi", "ic_bg_%s.png" % i), False)
        shot(fg_svg(v), 432, os.path.join(res, "drawable-nodpi", "ic_fg_%s.png" % i))
        xml = ('<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
               '  <background android:drawable="@drawable/ic_bg_%s"/>\n  <foreground android:drawable="@drawable/ic_fg_%s"/>\n'
               '  <monochrome android:drawable="@drawable/ic_mono"/>\n</adaptive-icon>\n') % (i, i)
        write(os.path.join(res, "mipmap-anydpi-v26", "ic_launcher_%s.xml" % i), xml.encode())
        # legacy (API < 26): rounded square, mark slightly larger than the adaptive safe zone
        legacy = bg_svg(v, 24) + fg_svg(v, scale=1.22)
        for d, px in (("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144), ("xxxhdpi", 192)):
            shot(legacy, px, os.path.join(res, "mipmap-%s" % d, "ic_launcher_%s.png" % i))
    shot(fg_svg(V[0], mono=True), 432, os.path.join(res, "drawable-nodpi", "ic_mono.png"))
    d = V[0]
    shot(bg_svg(d, 24) + fg_svg(d, scale=1.22), 192, os.path.join(ROOT, "web", "icons", "icon-192.png"))
    shot(bg_svg(d, 24) + fg_svg(d, scale=1.22), 512, os.path.join(ROOT, "web", "icons", "icon-512.png"))
    shot(bg_svg(d, 0) + fg_svg(d), 512, os.path.join(ROOT, "web", "icons", "icon-512-maskable.png"), False)
    # preview sheet
    def uq(svg, i):  # unique ids so several icons can share one HTML page
        return svg.replace('id="g"', 'id="g_%s"' % i).replace('url(#g)', 'url(#g_%s)' % i).replace('id="hl"', 'id="hl_%s"' % i).replace('url(#hl)', 'url(#hl_%s)' % i).replace('id="sh"', 'id="sh_%s"' % i).replace('url(#sh)', 'url(#sh_%s)' % i)
    cells = "".join('<div style="text-align:center;font:12px sans-serif;color:#333"><svg width="132" height="132" viewBox="0 0 108 108" style="border-radius:30px;display:block">%s%s</svg>%s</div>' % (uq(bg_svg(v), v["id"]), uq(fg_svg(v), v["id"]), v["name"]) for v in V)
    small = "".join('<svg width="%d" height="%d" viewBox="0 0 108 108" style="border-radius:24%%">%s%s</svg>' % (s, s, bg_svg(V[0]), fg_svg(V[0], scale=1.22)) for s in (96, 64, 48, 32, 24))
    pg.set_viewport_size({"width": 940, "height": 330})
    pg.set_content('<html><body style="margin:0;padding:18px;background:#e9e6df;font-family:sans-serif"><div style="display:flex;gap:18px">%s</div><div style="display:flex;gap:16px;align-items:end;margin-top:22px">%s</div></body></html>' % (cells, small))
    pg.screenshot(path=os.path.join(ROOT, "tools", "icons", "preview.png"))
    br.close()
print("icons generated")

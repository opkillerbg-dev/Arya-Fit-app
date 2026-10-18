#!/usr/bin/env python3
"""Fails the build early, with a clear message, if the web app references a file that is not in web/.
Catches the classic mistake: a new module is loaded by index.html but was never uploaded."""
import json, os, re, sys
W = "web"
bad = []
def need(path, why):
    if not os.path.isfile(os.path.join(W, path)):
        bad.append("%s  (%s)" % (path, why))
idx = open(os.path.join(W, "index.html"), encoding="utf-8").read()
for m in re.finditer(r'<script[^>]+src="([^":]+)"', idx): need(m.group(1), "script in index.html")
for m in re.finditer(r'<link[^>]+href="([^":#]+\.(?:css|webmanifest))"', idx): need(m.group(1), "link in index.html")
sw = open(os.path.join(W, "sw.js"), encoding="utf-8").read()
shell = re.search(r"SHELL=\[(.*?)\]", sw)
for f in re.findall(r'"([^"]+)"', shell.group(1) if shell else ""):
    if f != "./": need(f, "sw.js SHELL")
for ic in json.load(open(os.path.join(W, "manifest.webmanifest")))["icons"]: need(ic["src"], "manifest icon")
for f in ["images/hero/arya-run-hero.webp", "images/anatomy/arya-anatomy-atlas.webp", "images/exercises/arya-ex-push-ups-a.webp"]:
    need(f, "required image")
need("icons/icon-512-maskable.png", "adaptive icon source")
if bad:
    print("::error::missing files in web/:\n  " + "\n  ".join(bad)); sys.exit(1)
n = len(os.listdir(os.path.join(W, "images", "exercises")))
print("web check ok. exercise pictures:", n)

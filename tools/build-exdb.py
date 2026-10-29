#!/usr/bin/env python3
"""Regenerates the inline data of web/js/features/exdb.js from docs/onboarding/exercises.seed.json (the file to edit for content).
Run from the repo root:  python3 tools/build-exdb.py   (tests/exdb.test.js fails if the two ever differ)."""
import json, re, sys
seed = json.load(open("docs/onboarding/exercises.seed.json", encoding="utf-8"))["ex"]
path = "web/js/features/exdb.js"; s = open(path, encoding="utf-8").read()
data = json.dumps(seed, separators=(",", ":"), ensure_ascii=False)
new, n = re.subn(r"(  var EX=)\[.*?\];\n", lambda m: m.group(1) + data + ";\n", s, count=1, flags=re.S)
if n != 1: sys.exit("could not find 'var EX=[...]' in " + path)
open(path, "w", encoding="utf-8").write(new); print("exdb.js updated:", len(seed), "exercises")

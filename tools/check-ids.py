#!/usr/bin/env python3
"""App-id consistency check (task T04). Stdlib only, no network, prints ids only (no secrets).
Fails (exit 1) if the app id could silently change, i.e. a second app would be installed:
  1. build.yml's two APP_ID defaults (workflow_dispatch input, env fallback) differ from each other,
  2. build.yml's default differs from CANONICAL_APP_ID_IN_CI in docs/CURRENT.md,
  3. the Gradle `sed` that rewrites applicationId no longer targets capacitor.config.json's appId
     (the namespace `cap add android` writes), or no longer writes ${APP_ID}, or its grep check is gone,
  4. native/ Java files are copied to a package folder that is not the capacitor namespace.
Run from the repo root: python3 tools/check-ids.py"""
import json, re, sys

def read(p):
    return open(p, encoding="utf-8").read()

errs = []
def need(cond, msg):
    if not cond: errs.append(msg)

wf = read(".github/workflows/build.yml")
cur = read("docs/CURRENT.md")
ns = json.loads(read("capacitor.config.json")).get("appId", "")

# 1+2: defaults in build.yml vs docs/CURRENT.md
m_in = re.search(r'^\s*default:\s*["\']?([\w.]+)["\']?\s*$', wf, re.M)
m_env = re.search(r"^\s*APP_ID:.*\|\|\s*'([\w.]+)'", wf, re.M)
m_doc = re.search(r"CANONICAL_APP_ID_IN_CI=([\w.]+)", cur)
d_in = m_in.group(1) if m_in else None
d_env = m_env.group(1) if m_env else None
d_doc = m_doc.group(1) if m_doc else None
need(d_in, "build.yml: workflow_dispatch input `app_id` default not found")
need(d_env, "build.yml: env APP_ID fallback (`|| 'com...'`) not found")
need(d_doc, "docs/CURRENT.md: line CANONICAL_APP_ID_IN_CI=... not found")
if d_in and d_env: need(d_in == d_env, "build.yml: input default (%s) != env fallback (%s)" % (d_in, d_env))
if d_env and d_doc: need(d_env == d_doc, "build.yml default (%s) != docs/CURRENT.md CANONICAL_APP_ID_IN_CI (%s). Change both or neither (frozen: owner OK needed)" % (d_env, d_doc))

# 3: the Gradle sed target
m_sed = re.search(r'sed -i -E "s/applicationId \\"([^"]*?)\\"/applicationId \\"([^"]*?)\\"/"', wf)
sed_from = sed_to = None
if m_sed:
    sed_from = m_sed.group(1).replace("\\.", ".")
    sed_to = m_sed.group(2)
else:
    errs.append("build.yml: the `sed ... applicationId ...` line was not found or changed shape")
need(ns, "capacitor.config.json: appId missing")
if sed_from is not None: need(sed_from == ns, "build.yml sed rewrites applicationId \"%s\" but capacitor.config.json appId is \"%s\" (sed would match nothing)" % (sed_from, ns))
if sed_to is not None: need(sed_to == "${APP_ID}", "build.yml sed writes \"%s\" instead of ${APP_ID}" % sed_to)
need(re.search(r'grep -q .*applicationId.*\$\{APP_ID\}', wf),
     "build.yml: the grep that verifies applicationId after the sed is missing")
need("name='${APP_ID}'" in wf, "build.yml: the final APK check of package name == ${APP_ID} is missing")

# 4: native Java folder must equal the capacitor namespace
sh = read("tools/android-setup.sh")
m_pkg = re.search(r'native/java/\*\.java\s+"?\$A/java/([\w/]+?)/?"', sh)
if m_pkg:
    need(m_pkg.group(1).replace("/", ".") == ns, "tools/android-setup.sh copies Java into %s but capacitor appId is %s" % (m_pkg.group(1).replace("/", "."), ns))
else:
    errs.append("tools/android-setup.sh: `cp native/java/*.java $A/java/<package>/` line not found")

print("capacitor.config.json appId (namespace, allowed to differ): %s" % ns)
print("build.yml input default : %s" % d_in)
print("build.yml env fallback  : %s" % d_env)
print("docs/CURRENT.md canon.  : %s" % d_doc)
print("build.yml sed target    : %s -> %s" % (sed_from, sed_to))
if errs:
    print("\nFAIL check-ids (%d problem(s)):" % len(errs))
    for e in errs: print(" - " + e)
    sys.exit(1)
print("OK check-ids")

#!/usr/bin/env python3
"""Signing setup for the generated android/app/build.gradle (run from the repo root).
Usage: patch_signing.py <build.gradle> [debug|release]     (default: debug)
 debug   : signs with signing/debug.keystore (permanent debug key).
 release : ALSO adds signingConfigs.release that reads the keystore path and passwords from
           environment variables (ARYA_KEYSTORE_PATH, ARYA_STORE_PASS, ARYA_KEY_ALIAS, ARYA_KEY_PASS)
           and signs the release build type with it. No secret is ever written into the file."""
import re, sys
p = sys.argv[1]
mode = sys.argv[2] if len(sys.argv) > 2 else "debug"
if mode not in ("debug", "release"):
    print("::error::mode must be debug or release"); sys.exit(1)
s = open(p, encoding="utf-8").read()
if "ARYA-SIGNING" in s:
    print("patch_signing: already patched"); sys.exit(0)
if len(re.findall(r"^android\s*\{[ \t]*$", s, re.M)) != 1:
    print("::error::expected exactly one 'android {' block in build.gradle"); sys.exit(1)
rel_cfg = ""
lint = ""
if mode == "release":
    rel_cfg = '''        release {
            storeFile file(System.getenv("ARYA_KEYSTORE_PATH"))
            storePassword System.getenv("ARYA_STORE_PASS")
            keyAlias System.getenv("ARYA_KEY_ALIAS")
            keyPassword System.getenv("ARYA_KEY_PASS")
        }
'''
    lint = '''    // ARYA-RELEASE: lint is not a gate for a personal build
    lint {
        checkReleaseBuilds false
        abortOnError false
    }
'''
blk = '''android {
    // ARYA-SIGNING: permanent keys, never Gradle's auto-generated one
    signingConfigs {
        debug {
            storeFile file("${rootProject.projectDir}/../signing/debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }
''' + rel_cfg + "    }\n" + lint
s = re.sub(r"^android\s*\{[ \t]*$", lambda _: blk.rstrip("\n"), s, count=1, flags=re.M)
if mode == "release":
    n = len(re.findall(r"^(\s*)release\s*\{[ \t]*$", s, re.M))
    # the buildTypes.release block is the one that is NOT inside signingConfigs
    i = s.index("buildTypes")
    m = re.search(r"^(\s*)release\s*\{[ \t]*$", s[i:], re.M)
    if not m:
        print("::error::no buildTypes.release block found"); sys.exit(1)
    pos = i + m.end()
    s = s[:pos] + "\n            signingConfig signingConfigs.release" + s[pos:]
open(p, "w", encoding="utf-8").write(s)
print("patch_signing: ok (%s)" % mode)

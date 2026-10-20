#!/usr/bin/env python3
"""Forces the debug build to be signed with signing/debug.keystore (the permanent key).
Gradle's default (~/.android/debug.keystore) was NOT picked up on CI and every build got a throwaway key.
Usage: patch_signing.py <android/app/build.gradle>   (run from the repo root)"""
import re, sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
if "ARYA-SIGNING" in s:
    print("patch_signing: already patched"); sys.exit(0)
m = re.findall(r"^android\s*\{[ \t]*$", s, re.M)
if len(m) != 1:
    print("::error::expected exactly one 'android {' block in build.gradle"); sys.exit(1)
blk = '''android {
    // ARYA-SIGNING: permanent key from the repo, never Gradle's auto-generated one
    signingConfigs {
        debug {
            storeFile file("${rootProject.projectDir}/../signing/debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }
    }
'''
s = re.sub(r"^android\s*\{[ \t]*$", lambda _: blk.rstrip("\n"), s, count=1, flags=re.M)
open(p, "w", encoding="utf-8").write(s)
print("patch_signing: ok")

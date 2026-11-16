# AERUNO / Arya Fit: current state (read this instead of HANDOFF.md)

Updated 2026-11-15, repo v150. Keep this file under 100 lines. When a fact changes, change it here.

## What it is
Offline-first workout, run and step tracker. Public name **AERUNO**, internal codename `arya` / `ax-` / `aryaApp2` (never rename these: it would wipe user data).
Web app in `web/` (plain HTML/CSS/ES5 JavaScript, no framework, no build step) wrapped by Capacitor 6 into an Android APK. Native Java in `native/java/` (MainActivity, RunService, RunEnginePlugin, StepsPlugin, NotifKit, ...).

## Identity facts (verified from the repo, 2026-11-15)
- `CANONICAL_APP_ID_IN_CI=com.arya.fit3` (`.github/workflows/build.yml` default `APP_ID`; CI rewrites `applicationId` in Gradle and checks the final APK).
- `capacitor.config.json` `appId` is `com.arya.fit`. That is the Java package / namespace used when the Android project is created, NOT the installed app id. Do not "fix" it to match.
- Signing: `signing/debug.keystore` (public repo) signs every APK; CI checks its SHA-256 against `signing/EXPECTED_SHA256.txt`. `signing/EXPECTED_RELEASE_SHA256.txt` exists but build.yml does not use it.
## Baseline facts (from the owner's Actions screenshot, 2026-11-16)
- Latest known-good build: **Build APK #128**, commit `c2009d6` on `main`, file `Arya-Fit-build128.apk`, versionCode 29913562, all three jobs green (test, browser-test, build, 2 min 15 s total).
- Summary printed: package `com.arya.fit3`; signing key sha256 `3c1ec75f1f379a9a6d5fe80751665f3c53618edeb0e1f2bfde215fe02040a180`, "matches expected" and identical to `signing/EXPECTED_SHA256.txt` (checked).
- So the live build uses `com.arya.fit3` and the public debug key. Still UNVERIFIED: that the owner's installed phone app is that same id/key. Easy proof: installing a newer build over the old one keeps the data and does not ask to uninstall.
- Warnings on that run (not failures): GitHub is forcing Node-20 actions to run on Node 24 (`checkout@v4`, `setup-node@v4`, `upload-artifact@v4`) and `setup-java@v4` is deprecated. See task T15.

## How a change reaches the phone
1. An assistant produces `update.zip` (only changed files, same folder layout as the repo).
2. Owner uploads `update.zip` to the repo root. Workflow `apply-update.yml` unpacks, commits, then runs `build.yml`.
3. `build.yml`: Node 20, Java 17, `npm install` (no lockfile yet), `npx cap add android`, patch scripts in `tools/`, Gradle debug build, versionCode = minutes since 1970 (`date +%s / 60`; e.g. 29913562 in run #128), run number is shown separately, artifact `arya-fit-apk`.
4. Workflow files inside update.zip need the repo secret `ARYA_PAT`.

## Tests (run before every delivery)
```
python3 tools/check-web.py
for t in tests/*.test.js; do node $t; done          # 16 files
for t in tests/*_test.py; do python3 $t; done       # 34 files, Playwright; Chrome or Chromium
```
Known flake: `tests/boot_ui_test.py` timing check ("a main-thread block during boot delays the go") fails on slow machines, also on the untouched original. CI today runs only `tests/store.test.js` (required) and `tests/browser_test.py` (never blocks).

## Where things are
- `web/js/core` engines and views, `web/js/features`, `web/js/ui` (Home, Settings, help, V2 look), `web/css`.
- `web/sw.js` service worker: bump the cache name (`arya-vNNN`) and the About version (`web/js/ui/settings.js`) on every change under `web/`.
- `docs/v1-simplify/BLUEPRINT.md` V1 simplification (P0-P9 done, stranger test pending). `docs/v2/` V2 look spec (opt-in beta "New look").
- `docs/HANDOFF.md` very long history (about 180 KB). Do NOT read it whole. New log entries go in `docs/log/`.

## Product state
V1 tabs: Today, Plan, Move, Progress, Me. Step-counting notification is hidden (blocked channel `arya_steps_off`). New installs get a Starter plan and a calm first week. Not yet tested by real new users (Diwali). Native Java edits since v141 were never compiled by an assistant; the first CI build is their test.

## Known gaps (from the stability audit, see `docs/tasks/BACKLOG.md`)
No lockfile; CI gates are thin; signing key is public; installed app id unverified; GPS background, step counter after reboot and hidden-notification behaviour untested on a real device; docs partly stale.

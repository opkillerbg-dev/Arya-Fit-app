# Arya Fit: HANDOFF (latest, consolidated)

**Read order:** `ARYA-FIT-VISION.md` (vision + roadmap) -> `ARYA-FIT-BRIEF.md` (user + objectives) -> this file (state + technical map).
**Last updated:** 2026-10-13. v36 adds animated collapsible settings drawers, chevrons, and disables long-press text selection on app UI while preserving selection in inputs. Service worker cache `arya-v34`. Keep this file updated at the end of EVERY change.
**Live repo (public, readable):** github.com/opkillerbg-dev/Arya-Fit-app. If you have bash with network, `git clone` it and read the real files. Do not trust pasted copies, because a stale build workflow once hid a whole feature (see section 6).

## 1. What this is
Single-file workout app for one user (`index.html`, plain HTML/CSS/JS, no framework), now an Android APK: Capacitor 6 wraps it, GitHub Actions builds a debug APK signed with the repo's fixed `debug.keystore` so updates install over the old app. Package `com.arya.fit`. Phone: OnePlus, OxygenOS 16, Android 16. The user works from the phone only (GitHub web upload, no PC, no Android Studio) and wants SHORT replies.

User purpose: get back in shape (never jogged, about 1.5 years inactive). 28-day home plan from 2026-10-04: strength days plus jog/walk run days. Current run goal about 3.5 km. Their schedule is irregular (late nights in festival season), so missed days must be treated as normal rest, not failure.

## 2. Files in the repo root
`index.html` app | `sw.js` service worker | `manifest.webmanifest`, `icon-192/512/512-maskable.png` | `package.json` (Capacitor 6, background-geolocation, local-notifications, filesystem, share) | `capacitor.config.json` | `debug.keystore` (NEVER delete or replace) | `StepsPlugin.java` | `RunService.java` | `RunEnginePlugin.java` | `HANDOFF.md` | `.github/workflows/build.yml`.

**build.yml must contain all of these** (check the live file every time):
- Pins `ubuntu-24.04`.
- `cp RunService.java RunEnginePlugin.java StepsPlugin.java` into `android/app/src/main/java/com/arya/fit/`.
- Overwrites `MainActivity.java` and calls `registerPlugin(RunEnginePlugin.class)` and `registerPlugin(StepsPlugin.class)` (also requests 120 Hz).
- Manifest seds: permissions (location, foreground service location + health, ACTIVITY_RECOGNITION, notifications, boot, battery-optimisation request, exact alarm), services (`RunService`, `StepsPlugin$Svc` type `health`), boot receiver (`StepsPlugin$Boot`), and `<queries>` for `android.intent.action.TTS_SERVICE` (needed for native speech on Android 11+).
- Adaptive icon from the maskable PNG, copies `debug.keystore`, `./gradlew assembleDebug`, uploads artifact `arya-fit-apk`.

## 3. Current app state
**UI (redesign finished):** 5 bottom tabs Home, Plan, Run (view id `timers`), Progress, Settings. All new UI uses the `ax-` prefix. Home = status ring card, optional Catch-up chips, Steps card `#ax-hsteps` (only in the APK), and a Today card pinned to the bottom with ONE primary button. Plan = week strip + "All days" grid + day checklist + sticky Close day. Progress = segmented Stats | Body | History | Badges. Settings = 5 collapsible groups (Run, Voice & alerts, Look, Data & backup, Plan tools). Bottom-sheet helper: `axSheet(title,html)` / `axSheetX()`, option rows `.ax-opt`.

**Features:** plan ticks, jog/walk run timer with adaptive levels, GPS route + per-km splits, full-screen run mode (time ring, distance, pace, one Pause, one Walk/Jog switch; "More" holds steps, restart, finish), stopwatch/countdown/rest 60 s, warm-up and cool-down guide, rep log, body log, fitness test, readiness, race predictor, weekly summary, pace trend, badges, body muscle map with sore marking, 6 skins + accent + black theme, run history edit/delete/CSV/GPX, share card, daily reminder, custom exercises, next-28-days generator, Close a day (rest / call it a day / rest with sore legs; rest days keep the streak), editable run goal, backup export via native share sheet, Android Back handling (`axGuard`).

**Smart Brain update (new in v32; phone confirmation pending):**
1. Home has an on-device daily check-in for sleep, energy and soreness, plus a Full / Light / Walk-only / Rest recommendation with a short reason.
2. The recommendation is guidance only; it does not rewrite the workout plan. Answers are stored in `PR.brain` by local date and included in backup import/export.
3. The rules work offline. Existing marked muscle soreness can make the recommendation more conservative. Busy mode and auto-rescheduling remain the next phase.

**Added in the latest update pack (repo has it, user confirmation pending):**
1. **Native voice:** WebView has no `speechSynthesis`. `RunEnginePlugin.speak({text})` uses native `TextToSpeech`. JS `say()` and the Test voice button use `ENG.speak` when available; while a native run is active (`TM.eng`) JS stays silent so cues are not doubled. Needs the manifest `<queries>` entry and a speech engine (Speech Services by Google).
2. **Walk-only start:** `startIV(d)` now opens a sheet "How today?" (`#ax-ivj` Jog and walk / `#ax-ivw` Walk only). The old body is `startIV0(d)`. Walk only calls `startIV0` then sets `TM.hold=1; TM.ph=1; TM.pstart=0; engPush()`; the Walk/Jog switch can still change it.
3. **Glass look:** toggle `#t-gls` in Settings > Look, pref `PR.gls`, class `html.gls`. CSS block "Glass look" at the end of `<style>`: frosted `.ax-card`, `.ax-nav`, `.ax-sh` using `color-mix` + `backdrop-filter`, and a soft glow on `body::before` built from theme vars (`--blue`, `--ok`, `--sun`). Off by default; not applied to Run mode. Gotcha: the old stylesheet had `body::before{display:none!important}`, so the glass rule must set `display:block!important; animation:none!important`.

**Confirmed working on the phone:** web version, APK install, GPS run, undo-save, body map, all-day step counter (after the build.yml fix), new 5-tab UI.
**Not yet confirmed:** native voice and Test voice, walk-only start, glass look, screen-off run engine (GPS + cues), notification Pause/Switch buttons, auto-save on close, Close a day, run goal, share-sheet export, 120 Hz smoothness, boot restart of the step service.

## 4. All-day step counter (native, `StepsPlugin.java`, plugin name `Steps`)
- Hardware `TYPE_STEP_COUNTER` feeds foreground service `StepsPlugin$Svc` (type `health`, notification "N steps today"). Per-day totals in SharedPreferences `arya_steps` (keys `d_yyyy-MM-dd`, about 400 days). `StepsPlugin$Boot` restarts after boot/app update. Needs runtime permission ACTIVITY_RECOGNITION ("Physical activity"); the app asks once per launch.
- Methods: `status()` {sensor, perm, running, today, date, ignoring}, `start()`, `history()`, `requestPermissions()/checkPermissions()`, `openSettings()`, `keepAlive()`.
- JS: `STP` (= `Capacitor.Plugins.Steps`, evaluated at load; falsy means plugin missing and the Home card stays hidden), `SS`, `stepsInit()`, `stepsPull()` (every 15 s while visible), `stepsPaint()`, `axSteps()` sheet, `sgoal()` (default 8000, `PR.sg`), `strideM()`, `skm()`. Data `PR.ds` = {"yyyy-mm-dd": steps}. Settings > Run shows a status line (`#ax-sline`, `axSl()`); "Phone app only" there means the plugin is missing from the installed APK.
- Limits: steps while the service is killed by battery management are credited at the next reading (cap 30,000); distance is steps x stride (estimate); web build cannot count all day.

## 5. Technical map (all in index.html)
- **Storage:** `aryaApp2` (APP: plans, prefs `PR`, ticks `st`), `aryaRun1` (crash recovery), `aryaLast1` (undo save), legacy `arya28v1`. Never change keys or shapes; old backups must import (`clean`, `restorePrefs`, `doImport`).
- **Plan:** `defaultPlan`, `items(i)`, `dayDone`, `todayIdx`, `Dn`, `dt`, `dl`. Ticks `st["<day>:<id>"]`; closed days `st["x"+day]` (1 rest, 2 closed).
- **Run:** `startIV0`/`startIV`, `startCD`, `begin(o,keep)`, `step`, `trkOn/trkOff`, `onFix`, `paintG`, `addRun`, `commit(s,day)`, `autoSaveRun`, dock `#dock` (`.ax-dk`, state classes `ax-fs`, `ax-mo`, `ax-dflip`). Per-day run data in `st`: `g` metres, `s` steps, `r` seconds, `w` workout secs, `jt`/`wk` jog/walk secs. `TM` = timer state (`TM.hold`, `TM.ph`, `TM.pstart`, `TM.eng`).
- **Native run engine:** `RunService.java` (foreground service, own GPS, interval timer, cues in background, notification with Pause/Switch) + `RunEnginePlugin.java` (start, setState, state, route, stop, speak). JS: `ENG`, `engStart`, `engPush`, `engSync`. JS is master while visible, native when hidden.
- **Prefs `PR`:** snd, auto, gps, hap, voi, ap, met, spm, amo, gls, acc, skin, sore, lvl, lrd, routes, reps, body, fit, rd, rmt, goal, ds, sg.
- **Other functions:** `adapt/brk/lvl` (levels), `saveRoute`, `shareCard`, `pextra`..`pextra5`, `prog`, `axPs`, `axStp`, `body`, `readiness`, `theme`, `say`, `phaseFx`, `remind`, `nfy`, `axClose`, `axMore`, `axAdd`, `axCd`, `axReps`, `axMr`, `nextPlan`, `applyGoal`.
- **Notifications:** LocalNotifications id 7 live run, id 9 daily reminder.
- **Conventions:** new classes/ids use `ax-`; never reuse old names (a `.wk` clash once broke Home); use CSS vars for colours (skins and accent only change vars; primary button text uses `--ax-onblue`); `ic(name,"ax-ic")` for icons; tokens `--ax-s1..s6`, `--ax-t1..t5`, `--ax-r1..r3`, `--ax-tap` 48 px; `[hidden]{display:none!important}`; `body.td .ax-wrap{padding-bottom:430px}` when the dock shows; keep `.i` CSS and `ic()` default (badges use them).

## 6. Lessons and rules (each one cost us time)
1. Bump `sw.js` cache on every change. Never write `open(p,"w").write(open(p).read())` (empties the file).
2. Patch with Python using `assert s.count(old)==1`; syntax-check with `new Function` on every `<script>`; validate YAML with `yaml.safe_load`; test in headless Chromium (Playwright, chromium at `/opt/pw-browsers/chromium-*`) with stubbed `window.Capacitor.Plugins` (`Steps`, `RunEngine`, Filesystem, Share); LOOK at screenshots (390x844, light and dark).
3. **A green build does not prove the native code was built.** The live `build.yml` once lacked the plugin copy, registration and manifest lines, so the APK ran without steps and native voice. Verify the live file against section 2, and verify on the phone (Settings > Run > Step counting; Android app permissions should list "Physical activity").
4. Android WebView has no `speechSynthesis`; use native TTS plus the `<queries>` manifest entry.
5. Old CSS fights back: when a style does not show, inspect computed styles first (the `body::before{display:none!important}` case).
6. Java was never compiled locally against the real Android SDK (only `StepsPlugin.java` against hand-written stubs). If CI fails, ask for the red error text; likely suspects are `StepsPlugin.java`, `RunService.java`, `RunEnginePlugin.java`.
7. Same-named APKs: the phone may install an old `app-debug.apk` from Downloads. Ask the user to install the newest artifact and add a visible build number in Settings (planned).
8. Run-mode steps still use devicemotion/GPS (they stop with the screen off unless the native engine runs). Optional improvement: feed run steps from the hardware counter.
9. Test files (`test/plan.py run.py dock.py steps.py prog.py set.py back.py`) were in earlier zips but are not in the repo; ask for them or recreate from the stub pattern.

## 7. Delivery workflow
User sends nothing but screenshots and results. You deliver ONE zip per change with only changed files plus a one-line "where each goes" list:
- `index.html`, `sw.js`, `*.java`, `package.json` -> repo root via GitHub "Add file > Upload files".
- `build.yml` -> `.github/workflows/build.yml` via the pencil icon (select all, paste, commit).
- Then Actions > top run > Artifacts > `arya-fit-apk` > install over the old app (export a backup first in Settings > Data & backup).
Do not re-explain these steps; the user knows them.

## 8. Roadmap (see ARYA-FIT-VISION.md for detail)
1. **Smart brain (no API):** daily check-in (sleep, energy, soreness), "Smart Today" (full / light / walk-only / rest with a one-line reason), Busy mode (date ranges, "late night tonight"; protects streak, shifts plan), auto-reschedule skipped days, sleep-aware nudges, weekly auto-adjust, recovery gate from body-map soreness.
2. **AI coach (Gemini free tier, Groq fallback):** key pasted in Settings, never committed; sends only small stats summaries; returns structured JSON; the user approves every change; falls back to the brain offline.
3. App lock (PIN/fingerprint), then optional login + cloud backup (Firebase/Supabase).
4. Backlog: home-screen widget, heart-rate, progress photos, set-by-set logging, release signing, Node 22 / setup-java v5 / pinned plugin versions, visible build number.

## 9. If you are a new AI taking over
Clone the live repo (or ask the user for current `index.html`, `sw.js`, `package.json`, `build.yml`, the three `.java` files). Check section 2 against the live `build.yml`. Ask what the user saw for the "Not yet confirmed" list in section 3 before changing those features. Then start Phase 1 of the roadmap.


## UI update v33 (2026-10-13)
- Refined glassmorphism for app cards, legacy panels/tiles, navigation and sheets; glass is enabled by default only when no saved user preference exists. A saved opt-out is preserved.
- Added restrained high-refresh-friendly transitions for taps, tab content, sheets, navigation and progress. Uses transform/opacity and respects `prefers-reduced-motion`.
- This is a rendering/style update; no storage keys, workout records, native Java, or build workflow changed.
- Service worker cache bumped to `arya-v34`. CSS animations are optimized for a 120 Hz display but do not force the device refresh rate or guarantee 120 FPS.


## v34 visual refresh (2026-10-13)
- Added locally bundled `arya-run-hero.webp` (custom-generated image, no runtime image fetch) and a branded Home hero panel.
- Added stronger editorial section headers to Plan, Run and Progress; refined Smart Today, stat card and primary action surfaces.
- Added reduced-motion and reduced-transparency fallbacks.
- Bumped service worker cache to `arya-v34` and precaches the local hero asset.
- No storage keys, workout logic, Java plugins or build workflow changed.
- Validation: JavaScript syntax checks and browser rendering still need to be run before treating this pack as fully tested.


## 10. v37 Progress redesign
- Updated `index.html` styles and Progress section headers for Stats, Body, History and Badges. The design uses existing stored data only; no new storage keys or native files.
- Body recovery calculations, muscle selection, soreness toggles, readiness check-in and existing progress/history actions are preserved.
- `sw.js` cache version is `arya-v37`.
- JavaScript syntax validation passed. Browser interaction/screenshot and Android build should still be checked after install.

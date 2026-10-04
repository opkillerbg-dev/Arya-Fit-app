# Arya Fit: handoff notes

## What this is
Single-file workout app (`index.html`, plain HTML/CSS/JS, no framework) for one user. It started as a web PWA on Netlify and is now an Android APK: Capacitor 6 wraps the same file, GitHub Actions builds a debug APK (`build.yml`), signed with a fixed `debug.keystore` stored in the repo root so updates install over the old app. The user works only from a phone (GitHub web uploads, no PC, no Android Studio). Package id `com.arya.fit`. Phone: OnePlus, OxygenOS 16.

## Files
`index.html` app | `sw.js` service worker (cache `arya-v12`) | `manifest.webmanifest`, `icon-192/512/512-maskable.png` | `package.json` (Capacitor 6, background-geolocation ^1.2, local-notifications ^6.1) | `capacitor.config.json` | `build.yml` (copy at `.github/workflows/build.yml`).
Workflow: copies web files to `www/`, `cap add android`, `cap sync`, writes adaptive icon from the maskable PNG, overwrites `MainActivity.java` (requests 120 Hz), seds extra permissions into the manifest, `./gradlew assembleDebug`, uploads `arya-fit-apk`.

## Code map (all in index.html)
- Plan: `defaultPlan`, `items(i)`, `dayDone`, `todayIdx`, `Dn`, `dt(i)`, `dl(i)`. 28 days from START 2026-10-04. Ticks in `st["<day>:<id>"]`.
- Run timer: `startIV`, `startCD`, `begin(o,keep)`, `step`, `el_`, `trkOn/trkOff`, `onFix`, `paintG`, `addRun`, dock markup `#dock`. Full-screen mode = `.dock.fs` CSS.
- Run data per day in `st`: `g` metres, `s` steps, `r` seconds, `w` workout secs, `jt`/`wk` jog/walk secs. `clean()` on import only accepts those key shapes.
- Crash recovery: localStorage `aryaRun1` (`persist`, `runPrompt`); undo-save: `aryaLast1` (`snapS`, `setLast`, `lastCard`).
- Prefs object `PR` (inside `APP`, saved by `save()`): snd, auto, gps, hap, voi, ap, met, spm, amo, acc, sore, lvl, lrd, routes, reps, body, fit, rd, rmt.
- Adaptive levels: `lvl`, `brk`, `adapt`. Routes: `saveRoute`, `pextra3`, `shareCard`. Progress extras: `pextra`, `pextra2`, `pextra3`, `pextra4`, `bindProg`. Body tab: `calcM`, `body`, `fig`, `readiness`. Others: `guide`, `apz`, `metro`, `theme`, `say`, `phaseFx`, `cel`, `remind`, `nfy`, `hap`, `rip`, `cup`.
- Native bridge: `Capacitor.Plugins.BackgroundGeolocation.addWatcher` feeds `onFix`; `LocalNotifications` id 7 = live run notification, id 9 = daily reminder.

## Confirmed working by the user
Web version through backups/offline; APK installs, GPS run works, undo-save, body map (after redraw). Everything after "UI perf update" below was NOT confirmed on the phone.

## Never run on a device (all built blind, only syntax-checked)
Perf update (backdrop-filter removed, 120 Hz request, live notification), adaptive icon step, full-screen run mode + flat theme + week strip, phase animation, finish celebration, voice cues, weekly summary, pace trend, daily reminder, adaptive levels, route map, auto-pause, cadence beat, guided warm-up/cool-down, rep log, body log, fitness test, readiness, accent/black theme, share card.

## Session 2 result (tested in headless Chromium with Capacitor stubs; still NOT run on a device)
Fixed and verified: (1) duplicate `guide` function broke guided warm-up/cool-down; session now `gsess`. (2) `doImport` lost most prefs; new `restorePrefs`/`syncPrefs` validate and restore all of them (no-op on invalid or empty data). (3) Run save path is now `commit(s,day)`, used by Save and crash-prompt Save; undo restores `PR.lvl/lrd/routes`; crash-save now also stores route and adapts level. (4) Auto-pause matches the real pause handler: OK, no change. (5) `beep`/`snd` ignored the haptics setting and the metronome buzzed every beat: now uses `hap()` and silent `tick()`. (6) Stale live notification cleared at boot; reminder re-armed at boot (`remind(1)`); notification small icon `ic_stat_run` added by workflow + `capacitor.config.json`. (7) `say()` no longer cancels when idle, primes on first tap, Settings has a Test voice button. (8) Screen-off mitigations: late GPS fixes (gap over 25 s) add straight-line distance if speed is plausible; steps are topped up from GPS distance and learned stride at save (`topup`, fields `sk,sdist,sst`). (9) Workflow pinned to `ubuntu-24.04`, Node 22, plugin versions `~` ranges. CSS: dead blur rules removed, 5 main screens pixel-identical to before; the `!important` stack was left on purpose.

## Still open (needs a real device or bigger work)
- Screen-off behaviour: does the WebView keep running and do fixes arrive? Test one run with the screen off. Real fix is the native foreground-service plugin below.
- `speechSynthesis` in the APK: use Settings > Test voice.
- Two notifications while running (plugin foreground notification is static, live one shows time and km). Inherent until the native service exists.
- `PR.lvl/lrd/routes/reps/rd` are global, not per plan: move into `APP.plans[id]` when the plan generator is built.
- Safe area: Capacitor 6 targets SDK 34, so the WebView sits below the status bar and `env()` insets are 0. Revisit if you move to Capacitor 7 (SDK 35 edge-to-edge).
- Debug APK only; release signing not done. SCHEDULE_EXACT_ALARM: plugin falls back to inexact alarms if not granted, so reminders can be late.

## Not built
Next-28-days plan generator (needs the plan-load API behind `doImport`), progress photos, home-screen widget, heart-rate, cloud backup (user said not now).

## Biggest next task
Native background engine: a custom Capacitor plugin with a Java foreground service that owns the run timer, interval phases, GPS and cues, with notification buttons (Pause, Switch jog/walk), and JS reading state on resume. Today everything lives in JS.

## Working with the user
Wants very short replies and few tokens. Deliver changes as small zips; user uploads `index.html`/`sw.js` via GitHub "Upload files" and edits `.github/workflows/build.yml` with the pencil. Always syntax-check JS (`new Function` on each `<script>`), validate YAML, and test in headless Chromium with mocked geolocation and Capacitor stubs before shipping. Bump the `sw.js` cache version on each change.

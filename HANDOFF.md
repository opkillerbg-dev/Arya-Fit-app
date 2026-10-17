# Arya Fit: HANDOFF (latest, consolidated)

**Read order:** `ARYA-FIT-VISION.md` (vision + roadmap) -> `ARYA-FIT-BRIEF.md` (user + objectives) -> this file (state + technical map).
**Last updated:** 2026-10-16. Service worker cache `arya-v57`.
**Live repo (public, readable):** github.com/opkillerbg-dev/Arya-Fit-app. If you have bash with network, `git clone` it and read the real files. Do not trust pasted copies, because a stale build workflow once hid a whole feature (see section 6).

## 1. What this is
Single-file workout app for one user (`index.html`, plain HTML/CSS/JS, no framework), now an Android APK: Capacitor 6 wraps it, GitHub Actions builds a debug APK signed with the repo's fixed `debug.keystore` so updates install over the old app. Package `com.arya.fit`. Phone: OnePlus, OxygenOS 16, Android 16. The user works from the phone only (GitHub web upload, no PC, no Android Studio) and wants SHORT replies.

User purpose: get back in shape (never jogged, about 1.5 years inactive). 28-day home plan from 2026-10-04: strength days plus jog/walk run days. Current run goal about 3.5 km. Their schedule is irregular (late nights in festival season), so missed days must be treated as normal rest, not failure.

## 2. Files in the repo root
`index.html` app | `sw.js` service worker | `arya-run-hero.webp`, `arya-anatomy-atlas.webp` (images; `build.yml` must copy `arya-*.webp` into `www/`, and `sw.js` SHELL must only list files that exist) | `manifest.webmanifest`, `icon-192/512/512-maskable.png` | `package.json` (Capacitor 6, background-geolocation, local-notifications, filesystem, share) | `capacitor.config.json` | `debug.keystore` (NEVER delete or replace) | `StepsPlugin.java` | `RunService.java` | `RunEnginePlugin.java` | `HANDOFF.md` | `.github/workflows/build.yml`.

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
- `sw.js` cache version is `arya-v38`.
- JavaScript syntax validation passed. Browser interaction/screenshot and Android build should still be checked after install.


## v38 Body atlas rebuild (2026-10-14)
- Reworked body-map SVG silhouettes and muscle regions while preserving existing `MU`, `calcM()`, `PR.sore`, and storage schema.
- Increased atlas display height; selected muscle panel now shows an estimated recent-load meter and status pill. Added keyboard activation for SVG muscle regions.
- Refined glass panel, recovery scale, muscle list, and progress tile interactions. Cache version `arya-v38`.
- JS syntax checked and browser smoke test attempted; Android build/native code not changed.


## v39 Body Atlas redesign (2026-10-14)
- `index.html` uses bundled `arya-anatomy-atlas.webp` for a detailed front/back anatomy visual. The illustration is neutral reference art; it does not falsely encode activity data.
- Live workout load and soreness remain computed by existing `calcM()` / `body()` logic. Select a muscle group from the accessible button grid to inspect its real stored status and use existing soreness controls.
- `sw.js` cache is `arya-v39` and precaches `arya-anatomy-atlas.webp` for offline use.
- No localStorage keys, plan data, native Java files, or build workflow changed.
- Validation performed: JavaScript syntax checks. Browser screenshot/interaction and Android build still require on-device verification.


## v40 theme update (2026-10-14)
- Old Money is now the default for users with no saved skin, and is first in Settings > Look.
- Updated Old Money palette: parchment, deep forest green, muted brass, soft olive; headings use restrained editorial serif with clean sans-serif UI text. Glass cards and navigation use warm translucent surfaces.
- Classic is stored explicitly as `classic`, so selecting it remains possible after restart. Existing explicit theme preferences are preserved.
- No storage keys or workout logic changed. Cache bumped to `arya-v40`.


## Update v41 — Theme system
- Refined palettes for Old Money, Modern, Professional, Midnight and Sunset.
- Old Money is the default when no theme preference is saved; explicit theme selection is preserved.
- Fixed Black theme (`PR.amo`) so each theme gets its own coherent dark palette instead of inheriting a generic black override.
- Applied palette tokens consistently to cards, navigation, form controls and primary actions.
- Added reduced-motion fallback. No storage keys or native files changed.
- Cache version: `arya-v41`.
- Validation: JavaScript syntax checked; Android build/browser screenshot still needs device verification.


## v42 timer refinement (2026-10-14)
- Refined minimized run dock and full-screen timer for clearer hierarchy, larger legible numeric values, improved button feedback, and glass surfaces.
- Full-screen timer now uses theme tokens for background, text, controls, ring and More sheet rather than hard-coded black/grey, fixing contrast across Old Money and other themes in both dark/light modes.
- No timer JavaScript logic, storage keys, native files or build workflow changed. Service worker cache: arya-v42.
- Validation performed: JS syntax check pending after packaging; Android/browser visual testing not claimed.


## v43 schedule + workout editing
- Day detail has `Edit sets / reps` with +/- controls. Values are stored in `PR.workoutEdits` by calendar day and exercise index; base plan is not mutated.
- `Preview schedule` displays the current and proposed next days. Apply inserts a planned recovery day at the selected future day, shifts the schedule map forward, and shifts indexed day records in `st` to preserve day association.
- Schedule mapping is stored in `PR.schedMap`; `-1` means a planned recovery day. Verify date mapping, all day data, and repeated shifts on device before relying on it.
- Cache is `arya-v43`. No build workflow or native Java files changed.


## v44 update (2026-10-14)
- Smart Brain remains fully on-device. Its recommendation now uses the shifted schedule mapping, and when today's check-in recommends **Rest** or **Walk-only** on a workout day, it offers **Preview recovery reschedule**. The preview shows current vs proposed schedule; nothing changes unless the user taps Apply.
- Fixed schedule-shift indexing so day-indexed checklist ticks, closed-day flags, run totals, and workout-edit overrides at/after the insertion move forward together. Existing plan storage keys remain unchanged.
- Progress > History now includes **Daily steps history**, showing dated daily totals (including today's current reading) and goal status.
- Backup export now awaits the native step counter's latest status and historical map before serializing `PR.ds`. Import validates and restores the per-date `PR.ds` map; it remains inside the existing `prefs` backup object, preserving compatibility with version-2 backups.
- Tests run for v44: inline JavaScript syntax; Smart Brain mode decisions (Full/Light/Walk-only/Rest); schedule-shift movement of checklist/run/closed-day records and workout edits; static wiring for steps history, pre-export sync, import restoration, and service-worker cache version.
- Not tested here: full browser interaction, actual Android native sensor behavior, Android APK build, and end-to-end export/import on the phone. Back up current data before installing/testing.


## v45 workflow audit and fixes (2026-10-14)
- Schedule mappings, workout overrides, and run routes are stored per plan instead of globally, preventing a schedule change in one plan from affecting another plan.
- Schedule insertion shifts day-indexed checklist/progress, run totals, workout overrides, and route history together. Applying a schedule change is blocked during an active run or when the selected day already contains recorded activity, avoiding moving completed work into a different date.
- Version-2 backups now serialize per-plan `schedMap`, `workoutEdits`, and `routes`; import validates those records and allows progress through extended schedule days. Legacy global schedule/edit/route fields are migrated to the active plan.
- Restored the glass-look preference (`gls`) from backups.
- Daily steps history is in Progress > History. Export awaits a fresh native step status and native history before serializing `PR.ds`; daily totals remain in the existing preferences backup object.
- Tests completed for v45: JavaScript syntax; no duplicate HTML IDs; schedule shift moves checklist/progress, workout overrides and route data; schedule/edit/route import validators; extended-day progress validation; backup serialization retaining per-plan metadata and step history.
- Not completed: full interactive browser test (headless browser did not finish startup in this environment), physical Android step-sensor test, real file export/import on Android, and GitHub Actions APK build. Do not describe these as passed.


## v46 body atlas interaction fix (2026-10-14)
- Replaced the decorative atlas image inside `#bsv` at render time with the existing SVG anatomy shapes (`fig(BB...)` and `fig(BP...)`). The individual muscle paths are now keyboard/touch clickable and select the matching muscle detail panel.
- Marked-sore regions now fill amber, with a darker outline, rather than only receiving a dotted outline. Recovered/worked regions retain load coloring. Corrected front/back captions.
- `sw.js` cache bumped to `arya-v46`.
- Tests: JavaScript syntax and basic static wiring checks. Not tested in a real Android WebView; verify SVG hit targets and visuals on device before treating as fully validated.


## v47 readability fix (2026-10-14, tested in headless Chromium, not on a phone)
Problems found in the v45/v46 UI review and phone screenshots:
- The bottom nav was see-through: Old Money skin sets `--card:rgba(250,246,235,.88)` and **glass look (`html.gls`) is ON by default in this skin**, so page text bled through the nav and the Close day bar.
- The sticky Stats/Body/History/Badges bar in Progress was translucent and floated over the scrolled heading text.
- Body atlas: the SVG already contains its own FRONT/BACK text and `.ax-atlas-caption` added a second one (overlapping); the stage had a dark gray box that clashed with the cream theme; figure feet were clipped by `overflow:hidden`.
Fix = one CSS block appended at the end of `<style>` (search `v47`): nav background solid (`var(--bg)`) normally and 97% + blur under glass; sticky Progress tabs solid `var(--bg)` with an 8 px halo; `.ax-pbar` gradient reaches opaque in 22 px; `.ax-atlas-svg text{display:none}` (caption row remains); stage background `color-mix(in srgb,var(--ink) 11%,var(--bg))`, no center line, `overflow:visible`. `sw.js` cache `arya-v47`. No JS changed.
Rule learned: never use translucent surfaces for fixed or sticky bars; check computed `background-color` alpha when a skin defines `--card` with alpha.

## Known state of the repo and build (checked on the live repo 2026-10-14)
- Live repo: `build.yml` already copies `arya-*.webp` and sets an increasing Android versionCode; both webp files are present; live `sw.js` was `arya-v45` before v46/v47 were uploaded.
- Verified by tests: v46 atlas works (34 tappable muscle paths, tap selects, Mark as sore turns the path amber `#f4c95d` with dashed outline, no JS errors).
- NOT verified on a real phone: v46/v47 visuals, native voice, walk-only start, Smart Brain check-in, screen-off run engine, boot restart of the step service, GitHub Actions build of the latest Java.

## UI review backlog (honest design feedback, in priority order; not yet done)
1. **Home is too long.** Hero + status + Catch-up + Smart Today check-in push the Today card and its Start button below the fold. Home should be about today: shrink the hero (about 160 px), collapse the check-in to one line after it is answered, fold Catch-up into one chip.
2. **Progress clutter:** the heading "Progress, in context" appears twice, an empty decorative circle sits top-right and looks like a bug, and four "--" tiles show before any data exists (hide until data).
3. **Small gray serif text** (captions, nav labels about 11-12 px) is hard to read outdoors: raise size and darken.
4. **Body atlas:** v46 dropped the detailed anatomy artwork for flat SVG shapes. Option: overlay interactive regions on `arya-anatomy-atlas.webp` (needs careful tracing and an alignment test); the image is currently unused but still in `sw.js` SHELL.
5. Dark mode has not been reviewed on a phone (a headless render stayed in light). Ask the user for a dark screenshot.
6. Roadmap (see ARYA-FIT-VISION.md): Smart Brain phase 2 (Busy mode, auto-reschedule), Gemini coach, app lock, login.

## Delivery checklist for this file set
Upload `index.html` and `sw.js` to the repo root, replace `HANDOFF.md`, install the newest APK from Actions, then ask the user what they saw for every item in "NOT verified on a real phone".


## v48 small improvements (2026-10-15, tested in headless Chromium with stubs, not on a phone)
- **Haptics:** new `hx(name)` engine near the old `hap()` (kept as a shim). Uses `@capacitor/haptics` (added to `package.json`; `build.yml` unchanged, `cap sync` registers it) via `Capacitor.Plugins.Haptics`, falls back to `navigator.vibrate`. Names: tap, tick, soft, med, heavy, ok, warn, err, jog, walk, start, finish. Pointer-down on buttons = tap (nav and body-map = tick), switches = tick, Pause/Resume, Jog/Walk phase change (`beep`), run start/stop, saves (`axPut`), burst, and warning toasts. Weak haptics are throttled so a strong one is never cut by a tap. Settings > Voice & alerts > Test haptics plays them all. `PR.hap===0` silences everything.
- **No zoom:** viewport `maximum-scale=1, user-scalable=no`, CSS `html{touch-action:pan-x pan-y}`, JS blocks gesture events, multi-touch move and ctrl+wheel/keys.
- **Auto-close:** `axAutoClose()` closes every plan day older than yesterday that is still open and not done: `x=2` if anything was ticked or a run/workout was recorded, else `x=1` (rest, keeps streak). Runs at launch, on app resume and when the date rolls over; toast "Auto-closed N past days". Days can still be reopened with Close day.
- **Export:** daily steps were already in the backup as `prefs.ds` (not duplicated). Now every export path (button, Copy text, text box) refreshes steps from the native counter first (`packFresh`). Backup has a `meta` block (build, plans, ticks, runDays, stepDays, stepsTotal), file name `arya-fit-backup-YYYY-MM-DD-HHMM.json`, result check before saving, toast with counts, `PR.lbk` "Last export" line, and a new **Export steps CSV** button (`stepsCSV()`). Import ignores `meta`; old backups still import.
- Not verified on a phone: real haptic feel on the OnePlus, Haptics plugin build in Actions, auto-close after a real date change.

## v49 bottom bars fix (2026-10-15)
- Page text was visible through or between the bottom bars. Fix = CSS block `v48b` at the end of `<style>`: nav is fully opaque in every skin (also under glass), Plan "Close day" bar (`.ax-pbar`) is a solid `var(--bg)` bar, bottom sheets (`.ax-sh`) are opaque, and the Close day bar, mini run dock and page bottom padding follow the real nav height through `--ax-navh` (set by `axNavH()` with a ResizeObserver), so large system fonts cannot open a gap.
- Tested in headless Chromium at normal and enlarged nav height. Not seen on the phone yet. If text still shows, ask for a screenshot and check which element it is.

## v50 exercise pictures (2026-10-15, tested in headless Chromium, not on a phone)
- 59 WebP files `arya-ex-<slug>-<letter>.webp` in the repo root (1024x1024, q92, method 6, about 33 KB each, 1.93 MB total). `build.yml` already copies `arya-*.webp`.
- `index.html`: `EXI` object (slug -> letters that exist) near `items()`. Plan day rows get a swipe or tap strip with dots (`axExiHtml`, `axExiBind`). A missing file removes itself (`axExiErr`); no entry in `EXI` means the plain text row. `EXA` maps the plan names that do not slugify directly. **When new pictures arrive: add the file to the repo and add its letter to `EXI`.**
- Settings > Voice & alerts > **Exercise pictures** toggle (`PR.exi`, default on, saved in backups).
- `sw.js` `SHELL` was NOT extended with images; the runtime cache stores them on first view. Cache is `arya-v50`.
- Still missing: glute-bridges-b, superman-hold, squat-jumps-a. Old-style placeholders (darker olive clothes, replace later): backpack-rows-a/b, hip-flexor-stretch-a, side-plank-a, table-rows-a/b, reverse-snow-angels-a/b.


## v51 last three exercise pictures (2026-10-15, syntax checked, not run on a phone)
- Added `arya-ex-glute-bridges-b.webp`, `arya-ex-superman-hold-a.webp`, `arya-ex-squat-jumps-a.webp`. All 62 planned images now exist (62 files in the repo root). `EXI` updated: `glute-bridges:"ab"`, `superman-hold:"a"`, `squat-jumps:"abc"`. `sw.js` cache `arya-v51`. No other code changed.
- Conversion: background blended to exact `#faf6eb` and every pixel within 6 levels of it snapped flat (removes faint lighter boxes); the new images had a more saturated teal mat, so the mat colour was shifted to match its neighbours (glute-bridges-a / squat-jumps-b). Glute B was registered to A by mat width, left edge and bottom. Superman was fitted to 86 percent of the canvas width like the other lying poses. Squat-jumps A scale (0.65) is an estimate from head size and visual comparison with B/C, because the original PNGs of B/C are not available; the mat length differs a little between A, B and C.
- Still placeholders (darker olive clothes, replace when regenerated): backpack-rows-a/b, hip-flexor-stretch-a, side-plank-a, table-rows-a/b, reverse-snow-angels-a/b.
- Not verified on a phone: the strips for these three exercises.


## v52 images moved into folders (2026-10-15, headless-tested, not run on a phone)
- New layout: `images/exercises/` (62 `arya-ex-<slug>-<letter>.webp`), `images/hero/arya-run-hero.webp`, `images/anatomy/arya-anatomy-atlas.webp`. Icons (`icon-192.png`, `icon-512.png`, `icon-512-maskable.png`) and `manifest.webmanifest` STAY in the repo root for now (the adaptive icon step in build.yml reads the maskable PNG from the root).
- Rule: every new image goes into its own subfolder of `images/`, never into the repo root.
- `build.yml`: the www copy line no longer copies `arya-*.webp`. It copies `images/` into `www/images`, then fails the build if the hero, the atlas or `arya-ex-push-ups-a.webp` is missing and prints the number of exercise pictures. Everything else in build.yml is unchanged.
- `index.html`: `IMX="images/exercises/"` prefix for the exercise strips, hero CSS url and atlas img src point at the new folders.
- `sw.js`: cache `arya-v52`; SHELL lists `images/hero/...` and `images/anatomy/...`. If those files are missing the whole service worker install fails, so the images must be in the repo before this sw.js is.
- `setup-images.yml` is a ONE-TIME workflow (`workflow_dispatch`): it unzips `arya-images.zip` from the repo root, moves the old root hero and atlas into `images/`, deletes the zip and commits. Delete it from the repo after use.
- The owner had not uploaded anything since v44, so this index.html contains ALL changes v45 to v52, `package.json` carries the Haptics plugin, and the 62 exercise pictures are new to the repo.
- Upload order: 1) `arya-images.zip` to the root, 2) create `.github/workflows/setup-images.yml`, 3) run it from the Actions tab, 4) upload index.html, sw.js, package.json, HANDOFF.md, 5) edit build.yml last. Builds started in between may fail; only the last one counts.
- Verified: build.yml YAML parses, the new copy step and the setup workflow were simulated in a scratch git repo, index.html inline script syntax check passed, and headless Chromium loaded the exercise pictures from `images/exercises/` for six exercises. NOT verified: the hero and atlas files themselves (not in the container), a real APK build, anything on a phone.


## v53 body atlas redesign (2026-10-16, headless-tested, not run on a phone)
- Replaced the 34 hand-drawn polygons with real anatomy paths from **react-native-body-highlighter** (MIT, notice in `THIRD-PARTY-NOTICES.md`, credit line in the Body tab). Male front and back, one view at a time with a Front/Back toggle (`bside`, `bsd` buttons). Data in `BHF`, `BHB`, `BHOF` (outline), `BHOB`; library slug to app muscle map in `BHM` (deltoids to shoulders; abs + obliques to abs; trapezius, upper-back, lower-back to back; quadriceps to quads; gluteal to glutes; hamstring to hams; chest, biceps, triceps, calves unchanged). Head, hair, neck, forearms, hands, knees, tibialis, adductors, ankles and feet are drawn as neutral non-tappable parts because the app does not track them.
- Selecting a muscle (tap or the list) switches the side automatically (`bsync`; back, glutes and hamstrings always go to Back). Selected = gold outline (`--sun`), sore = amber fill, load = green ramp from `--card` to `--blue` so it works in every skin (Midnight checked visually).
- Legend is now cream to green (no rainbow); amber key line added. Subtitle now says "Tap a muscle to see its load and recovery".
- Fixed: FRONT/BACK labels were swapped (old caption row); the faint vertical line through the whole card (`.ax-body-map:before` center gradient, now hidden); the muddy stage box.
- `sw.js` cache `arya-v53`; `images/anatomy/arya-anatomy-atlas.webp` removed from SHELL (unused). The file stays in the repo because `build.yml` still checks that it exists; it can be deleted together with that `test -f` line later.
- Old `fig`, `BB`, `BP`, `SIL`, `SH` code is now dead (kept to keep the change small). Safe to delete in a cleanup.
- Verified in headless Chromium (390x844): front and back render, real tap on quads selects quads, toggle works, picking Hamstrings in the list flips to Back, no JS errors. NOT verified: on a phone, tap accuracy on small muscles with a thumb, scrolling feel.
- Not touched: the odd cream blob around the sticky Progress tab bar and the half-hidden "recovery status." text behind it (seen in the owner's screenshot).


## v54 credits section (2026-10-16, headless-tested, not run on a phone)
- Removed the "Body art: react-native-body-highlighter" credit line from the Body tab hint (the owner did not want it there).
- Added Settings > **About and credits** (`<details id="ax-credits">`, last card in `#ax-v-set`): app name and version text, "Created by Arya Sheladiya" (name taken from the plan's `athlete` field; edit the literal text in that block if the credit should say something else), "Built with" (Capacitor, MIT, and its plugins), and "Body map art" (react-native-body-highlighter, MIT, ELABBASSI Hicham). This satisfies the MIT notice together with `THIRD-PARTY-NOTICES.md` in the repo.
- The version text in that block ("v54") is a literal string. Update it on each release together with the `sw.js` cache name (`arya-v54`).
- Verified in headless Chromium: the section renders and expands, no JS errors. Not verified on a phone.


## UI update v55 (2026-10-16) — Old Money × Liquid Glass 50/50
- Refined the existing UI in `index.html`; no full rewrite and no changes to workout logic, storage keys, saved records, native Java files, signing key, or build workflow.
- Strengthened the Old Money palette (warm ivory, forest green, olive, restrained brass), editorial headings, home hero framing, progress ring, card depth, and button feedback.
- Reworked bottom navigation into a floating, rounded translucent glass bar with a clear active state. Glass is concentrated on selected surfaces; essential workout/settings content remains more opaque for legibility.
- The existing Glass look setting remains supported; the existing default-on behavior is preserved, and saved user preferences are not overwritten. Reduced-transparency and reduced-motion fallbacks remain.
- Bumped service-worker cache from `arya-v54` to `arya-v55`.
- Validation: JavaScript syntax check passed; Python HTML parser passed; CSS parser found no parse errors; service-worker cache is `arya-v55`. Headless browser render/interaction testing was blocked by the environment (`ERR_BLOCKED_BY_ADMINISTRATOR`), so visual browser interaction and Android phone behavior remain unverified. No Android APK build claimed.


## v56 UI rendering correction (2026-10-16)
- Kept the v55 Old Money × Liquid Glass design and existing app logic.
- Corrected the sticky Plan action rail: `Close day` now keeps the Close day button 8px above the navigation while the opaque action-rail background meets the floating navigation edge. The Plan screen now reserves the correct bottom space so the rail stays aligned at both mid-scroll and true bottom; other screens retain their prior content clearance. Safe-area insets are included.
- Updated the About/Credits version label and service-worker cache name to v56 so installed clients can receive the corrected stylesheet.
- Headless browser checks cover 320×568, 360×640, 393×852, 430×932 and 768×1024 layouts, all five tabs, scroll boundaries, the Close day sheet, Glass Look/theme toggles, the bundled hero/exercise images, and the interactive anatomy SVG. See the delivery test report; Android/device behavior still requires phone testing.


## v57 UI phases 5–7 (2026-10-16) — progress motion, sheets, theme consistency
- Added tabular number styling and short count-up treatment for visible summary numbers only; live run timers/GPS values are not selected by the animation logic. Honors reduced-motion preference.
- Refined shared bottom sheets with a clearer dim/blur scrim, top handle, sticky translucent header, safe-area padding, bounded height, and internal scrolling. Preserved existing sheet open/close actions and content.
- Unified focus-visible states, theme-aware border/ink treatment, and glass shadow rules across existing palettes. Added reduced-transparency fallback for sheet scrim/header.
- Bumped service-worker cache to `arya-v57`.
- Validation for this phase: Node JavaScript syntax check passed; Python HTML parse passed; duplicate IDs check found none. Full headless-browser rendering/interactions are intentionally deferred until all eight UI steps are implemented, as requested by the user. No Android build/device test claimed.


## v58 — adaptive glass performance safeguards (2026-10-16)
- Added a conservative automatic low-effects mode for devices reporting deviceMemory <= 3 GB, hardwareConcurrency <= 4, or Data Saver enabled; also respects `prefers-reduced-transparency: reduce`.
- Efficient mode disables costly backdrop filters and heavy surface shadows while preserving the palette, borders, and core glass-inspired layout.
- Devices that do not report performance capabilities remain in full visual mode; no aggressive frame-rate polling or continuous performance monitoring was added.
- Service-worker cache bumped to `arya-v58`.
- Must complete headless browser regression checks after the final UI phase; physical Android performance still requires device verification.


## v59 — Heavy Liquid Glass bottom navigation
- Added a stronger, layered Liquid Glass treatment to the floating bottom navigation when Glass Look is enabled on capable devices: 38px blur, boosted saturation, reflective sheen, bright rim, inner highlights, deeper shadow, and a luminous active-tab capsule.
- Kept the navigation geometry and safe-area padding unchanged to avoid reintroducing overlap with Close the day.
- The existing adaptive lightweight mode and reduced-transparency preference explicitly disable the heavy effect and keep an opaque, lightweight navigation surface.
- Service-worker cache updated to `arya-v59`.
- Static checks only; full headless-browser and physical-device verification must be run before treating this as fully verified.


## v60 — Edge-to-edge display
- Android window draws edge-to-edge behind transparent status and navigation bars via WindowCompat in the generated MainActivity. Existing build workflow remains the source of the native activity.
- Added Capacitor StatusBar plugin dependency for theme-aware status icon contrast; the web theme function requests overlay mode and updates icon style where the plugin bridge is exposed.
- HTML uses `viewport-fit=cover`, paints the canvas background through the system-bar regions, and retains `env(safe-area-inset-*)` spacing for content and bottom navigation. Heavy Liquid Glass bottom navigation is retained.
- Requires a fresh Android build. Headless browser and physical-device rendering must be checked before treating this as verified; browser-only preview cannot verify native system-bar behavior.


## v61 — Home dashboard + workout experience refinement
- Refined Home's progress summary and Today session card with clearer hierarchy, status/date labels, legible progress percentage, and a more deliberate primary action.
- Refined Plan workout header, session status, progress module, exercise rows, exercise image frames, and bottom action styling.
- Session status updates when exercise checkboxes are toggled; existing plan logic, progress keys, edit/reschedule controls, timer controls, and Close/Reopen day behavior remain unchanged.
- Service worker cache bumped to `arya-v61`.
- Validation status: source-level checks only unless a separate browser/device test report confirms more. Full headless browser rendering, bottom scrolling, interaction, and Android/device verification must be run before calling this release fully verified.

## v62 — Run and Progress visual refinement
- Refined Run screen introduction and run-start card with restrained layered surfaces, stronger type hierarchy, clearer primary action, and improved list-row touch states.
- Refined Progress segmented navigation, statistics tiles, editorial overview cards, weekly progress bars, and recovery map container.
- Added narrow-screen tuning for widths at or below 360px and forced-colors fallback. Reduced-motion preference is respected.
- No run tracking logic, stored data keys, native Android code, signing key, or GitHub Actions workflow changed.
- Service worker cache version advanced to `arya-v62`.
- Verification must distinguish static source checks from full headless browser rendering/interactions and Android-device testing; do not claim the latter unless run.


## v63 — Theme-aware exercise clothing
- Preserves the original Old Money exercise artwork exactly.
- Adds one reusable alpha mask for each of the 62 existing WebP exercise illustrations in `images/exercise-masks/`. Masks isolate the saturated dark-green clothing while excluding the pale sage mat and most dark outlines. Small disconnected green accents are filtered out to avoid recoloring shoe details.
- For Modern, Professional, Midnight, and Sunset skins, visible exercise images are recolored at runtime using canvas HSL color replacement that preserves original lightness/shading. Generated variants are cached in memory for the session.
- If a mask/canvas operation fails, the original image remains available. No new artwork generation or duplicated per-theme images.
- Service worker cache version: `arya-v63`.
- Validation in this update: source syntax and asset/mask consistency checks; full headless-browser rendering remains unverified in the current environment.


## v64 — fix pass on v63 (2026-10-16; headless-tested in Chromium 390x844 over http; NOT run on a phone; Java NOT compiled)
Source: ARYA-FIT-FIX-BRIEF-v63.md. Cache `arya-v64`, About-credits label now `v64` (it was stuck at v56).

**1. Theme clothing is now CSS-only (replaces the v63 canvas recolor).**
- Removed `AX_TINT_PALETTES`, `axTintExerciseImage`, `axBuildExerciseTint`, `axTintAllExerciseImages` and the call in `theme()`. No canvas, no blobs, no JS on skin change.
- `axExpHtml(slug,letter,name)` builds `<span class="ax-exp"><img base><span class="ax-ext" style="mask-image:url(images/exercise-masks/...png)"><img same file></span></span>`. `.ax-ext` is hidden in Old Money (so Old Money is pixel-identical to v63: max pixel difference 0). In Modern / Professional / Midnight / Sunset it shows a grayscale, brightened copy of the art, cut out by the clothing mask and multiplied (`mix-blend-mode:multiply`) by the skin colour `--ex-c`. Shading is kept, colour is exactly the skin colour, no muddy dark tones, and it is correct on first paint (no green flash).
- Colours (`html[data-skin=...] .ax-ext`): modern `#d8335c`, professional `#2f72d6`, midnight `#8d93e8` (periwinkle; clearly different from the green art), sunset `#ff7a45`. Brightness lift is `--ex-k` (default 3.8) in `.ax-ext>img`.
- `axExiErr` removes the whole `.ax-exp`; swipe, tap-to-advance, dots and scroll-snap were tested and still work.
- Measured: skin switch to correct colour about 20 to 40 ms (v63: 2.76 s for 13 images on desktop). No JS errors.
- Cream image background in dark skins (Midnight/Sunset) is unchanged: it reads as a photo card. Originals were not touched.
- **Mask bugs found and fixed** (6 masks replaced, files in `images/exercise-masks/`): `side-plank-a` and `table-rows-a` were EMPTY (never recolored in v63), `reverse-snow-angels-a/b` and `table-rows-b` covered only a small patch of the clothes, `backpack-rows-b` missed the shirt. New masks were made by colour segmentation (dark green/olive clothing, noise removed) after checking it agrees with the good masks (IoU 0.83 to 0.99). Other 56 masks unchanged.

**2. Edge-to-edge finished (needs a fresh APK build; this is the part most likely to need a fix after the first run).**
- `package.json`: added `@capacitor/status-bar ^6.0.0`.
- `build.yml` MainActivity heredoc now: keeps `registerPlugin(RunEnginePlugin/StepsPlugin)` and the 120 Hz request; calls `WindowCompat.setDecorFitsSystemWindows(w,false)`, transparent status and navigation bars, `setNavigationBarContrastEnforced(false)` (API 29+); reads the real insets with `ViewCompat.setOnApplyWindowInsetsListener` and publishes them to the page (`window.axSI(t,r,b,l)` via `evaluateJavascript`, pushed on every change, at +400 ms, +1800 ms and onResume, plus a JS interface `window.AxInsets.get()` / `.style(dark)`). Because edge-to-edge disables `adjustResize`, the activity pads `android.R.id.content` by the keyboard (IME) height so inputs stay visible.
- `index.html`: all 22 `env(safe-area-inset-top/bottom,0px)` uses now go through `--ax-sat` / `--ax-sab` = `max(env(...), --ax-si-t/-b)`, so it works whether or not the WebView reports env(). `axSI()` also re-runs `axNavH()` (the nav height changes with the inset; without this the Close day bar overlapped the nav). Tested with simulated insets top 48 / bottom 24: header clears the status bar, nav floats above the gesture bar, Close day bar sits 8 px above the nav exactly as with zero insets.
- **Bug fixed in `syncSystemBarStyle`:** the style was inverted (Capacitor `Style.Dark` means light icons for dark backgrounds). It now sends `DARK` for dark skins and also calls `AxInsets.style(dark)` for status and navigation bar icons.
- If the CI build fails, ask for the red error text: the only new native code is `MainActivity` (written against androidx.core 1.x APIs; not compiled here, there is no Android SDK or javac in the test container). If edge-to-edge looks wrong on the phone, the quick revert is to restore the old MainActivity heredoc (without the WindowCompat block); the CSS falls back to env() alone.

**3. Housekeeping.** Removed dead old body-map code (`SIL`, `SH`, `BP`, `BB`, `fig`). `hc()` is still used and was kept. `sw.js` SHELL still does not list the images (runtime cache handles them; masks are cached the same way). Still to do by hand: delete `.github/workflows/setup-images.yml` from the repo (one-time workflow, already used). Duplicate HTML id `gov` still exists (minor).

**Verified (headless Chromium, stubbed, over http):** 12-exercise gallery in all 5 skins, Plan screen in Modern and Midnight, strip swipe/click/dots/error handling, Old Money pixel-identical, inset simulation, JS syntax, YAML parse. **NOT verified:** anything on a real phone (colours on the OnePlus screen, scroll feel with masks, real WebView insets, keyboard resize, status/nav icon colours), the GitHub Actions build with the new MainActivity, mix-blend-mode/mask performance in Android WebView (Chrome engine, expected fine).


## v65 — Readiness score 0-100 on Home (2026-10-16; headless-tested in Chromium 390x844, NOT run on a phone)
- New file `readiness.js` (repo root; `build.yml` copies it into `www/`; loaded by `<script src="readiness.js">` at the end of `index.html`). Drafted by Gemini, reviewed and rewritten by Claude. Gemini's draft had bugs: it trimmed every workout when no check-in existed (baseline 72 = "light"), wrote `_rdAuto/_manual` flags into `workoutEdits` (backup import `axCleanEdits` would strip them), flipped advice after the workout was ticked, rendered twice per refresh, and claimed it eased the run (it does not).
- Card `#ax-readiness-card` sits above Smart Today. Score uses: Smart Today check-in (`PR.brain` / `PR.rd`), muscle soreness and load (`calcM()`), 3-day step average (`PR.ds`, `SS.today`), recent run km, streak. Tiers: >=75 Full, 45-74 Light, <45 Easy.
- The plan is adjusted only when sleep and energy were answered, or the person tapped an override. Adjustment is non-destructive: `readiness.js` wraps `axEdits()` so `items()` shows today's strength sets trimmed (Light: -1 set; Easy: 1 set, reps x0.7 where reps are plain numbers). Timed/count exercises keep their time. Stored `workoutEdits` are never modified; the person's own +/- edits win field by field. Today's score and tier are locked per day for the same check-in answers (memory only), so ticking exercises does not change the advice.
- Override buttons Full / Light / Easy live inside "Details" (collapsed to keep Home short). Stored in `PR.rdOv["yyyy-mm-dd"]` (last 60 kept), restored by `restorePrefs`.
- `sw.js` cache `arya-v65`; `readiness.js` is NOT in SHELL (runtime cache handles it, same as images). Credits label now v65.
- Known quirk: Smart Today still says "Suggestion only — your plan is unchanged"; it is now only partly true. The +/- edit sheet shows planned values, not the trimmed ones.
- Verified: Light/Easy/Full values on 4 strength days, manual edit wins, stored edits stay `{}`, override and reset, reload keeps state, backup `prefs.rdOv`, 5 skins, no JS errors. NOT verified: phone, native build.


## v66 — readiness changes the real plan, status bar icons, app-shell start (2026-10-17; headless-tested in Chromium 390x844 with stubs; NOT run on a phone; no Java changed)
**1. Readiness now changes the plan (readiness.js).** Reason: the v65 version only showed trimmed sets, so an easy day with a skipped run or skipped exercises still said "incomplete". Now the adjusted plan is the plan.
- Light = 1 fewer set per strength exercise (unchanged). Easy = fewer exercises (first 60 percent, at least 2; on circuit days the burpee/jump/mountain-climber moves are dropped instead), 1 set, reps x0.7, and the run row becomes "Easy 20 min walk or jog" (id `j` stays, so a real run still ticks it). Wrapped `window.items` (list) and `window.axEdits` (sets/reps). Ids (`e0`, `e1`, `j`) never change, so stored ticks keep working. Person's own +/- edits still win.
- **Persistence:** the applied mode is stored per plan day in `PR.rdAp["<planId>:<dayIndex>"]` = `light|rest` (written by `render()` while the day is today, removed when back to Full). Without it, yesterday would have jumped back to the full list at midnight and lost its completion. Restored by `restorePrefs`. Tested: tick all adjusted items = day done; after midnight the day is still done with the same 9 of 9.
- Smart Today foot text now says the plan was adjusted when `axRdActive()` is true. Card and toasts reworded ("Plan shortened for today ... Finish it and the day counts as complete.").
- Known: the +/- edit sheet still steps from the stored (planned) values; Easy day hides some exercises from the list, so they cannot be edited that day.
**2. Status bar and nav bar icons.** Cause found: `syncSystemBarStyle` used the OS dark-mode setting, so on a phone in dark mode with a light skin (Old Money, Modern, Professional) the icons were white on cream. Now `axIsDark()` reads the real `--bg` colour of the page (luminance < 128 = dark) and sends `DARK` (white icons) or `LIGHT` (black icons) to the StatusBar plugin and to `AxInsets.style`. Re-synced on theme change and on every native inset push (start, +400 ms, +1800 ms, resume). `<meta name="theme-color">` follows `--bg`. Tested in 6 skins x OS light/dark plus AMOLED. Needs the build that contains the v64 MainActivity; if icons are still wrong after that, send a screenshot.
**3. App shell.** `overscroll-behavior:none` on html/body, long-press context menu blocked outside inputs. Cache `arya-v66`, credits label v66.


## v67 — ChatGPT-style shell (2026-10-17; headless-tested in Chromium 390x844 with simulated insets; NOT run on a phone; no Java changed)
Source: owner screenshot of v65 (ugly pink blur under the status bar, icons unreadable) and of the ChatGPT app as the reference (transparent status bar, content scrolls under it, floating round/pill glass buttons at the top, floating bar at the bottom).
- **Blur removed.** The pink smear was the fixed `html.gls body::before` ambient glow (accent colour at 10% 6%). Moved lower (8% 46%) and dimmer. New fixed `#ax-sbf` fades the page background colour over the status bar (flat colour, no blur) so icons stay readable on any skin.
- **Content scrolls under the status bar.** `:root` top padding removed; `.ax-wrap` top padding is now `--ax-sat + 62px` (clears the floating buttons); Progress sticky tab bar top is `--ax-sat + 62px`; toast moved to `top: --ax-sat + 66px`.
- **Floating top controls `#ax-top`** (fixed, z 14, glass like the bottom nav): left round button = menu drawer; right pill = Start (opens today's plan, `cur=Dn(); go("plan")`) and More (Quick actions sheet).
- **Drawer `#ax-drawer`** (slides from the left, scrim `#ax-dscrim`, Back closes it via the existing `axGuard`/`popstate`): Home, Today's plan, Close or Reopen today (`axClose`), Plans (`go("plans")`), Add exercise (`axAdd`), Export backup (clicks `#ex`), Settings, About and credits (opens `#ax-credits`). Built by `axDrawerFill()` each time it opens, so labels follow the day state. Quick actions sheet (`axTopMore`): Close/Reopen today, Smart Today check-in (scrolls to `#ax-hbrain`), Add exercise, Export backup.
- Tested: drawer open/close, Back closes drawer, Plans, Start, Quick actions, close today, layout (top bar bottom 104 px, first content 110 px, no overlap on Home/Plan/Progress/Settings), no JS errors. NOT verified: on a phone (real insets, glass blur cost, thumb reach), other skins visually (only Modern + glass was looked at).
- Cache `arya-v67`, credits label v67.


## v68 — 1-tap sets, PR pills, progression and deload hints (2026-10-17; drafted by Gemini, rewritten by Claude; headless-tested with stubs, NOT run on a phone)
- New `progression.js` (copied into `www/` by `build.yml`; loaded after `readiness.js`). Wraps `day()` (adds a strip under each Strength row: 1-tap set chips, PR pill, hint), `axPg()` (Exercise PRs panel under Progress > Badges) and `axShiftSt()` (moves `PR.setLog` keys with the schedule).
- Data: new `PR.setLog[exercise][dayIdx] = [reps per set]`, sanitised in `restorePrefs` (backup import). `PR.reps` (manual rep log) is read but never written; PR = best of both.
- Chip tap cycle: target, target+1, target-1, clear. All sets logged auto-ticks the exercise row. Hint "Try N x reps+1" (target hit, or last session met target and not stalled) and "Deload" (no weekly-best gain across two earlier weeks) write the usual `workoutEdits[day][n]={sets,reps}` for that day only, after a tap.
- Fixed vs Gemini draft: removed the `_manual` flag written into `workoutEdits`; removed mirroring into `PR.reps` (a wrong tap left a phantom PR forever); the broken `wMax` line; one render path. sw.js: version only. Cache `arya-v68`, label v68.
- Not verified: phone, native build.


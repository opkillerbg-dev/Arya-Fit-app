# Arya Fit: HANDOFF (latest, consolidated)

**Read order:** `ARYA-FIT-VISION.md` (vision + roadmap) -> `ARYA-FIT-BRIEF.md` (user + objectives) -> this file (state + technical map).
**Last updated:** 2026-10-22. Service worker cache `arya-v99`. **Repo layout changed in v81: see section 2. File names in older log entries below are the pre-v81 flat names; map them with the table in section 2.**
**Live repo (public, readable):** github.com/opkillerbg-dev/Arya-Fit-app. If you have bash with network, `git clone` it and read the real files. Do not trust pasted copies, because a stale build workflow once hid a whole feature (see section 6).

## 1. What this is
Single-file workout app for one user (`index.html`, plain HTML/CSS/JS, no framework), now an Android APK: Capacitor 6 wraps it, GitHub Actions builds a debug APK signed with the repo's fixed `debug.keystore` so updates install over the old app. Package `com.arya.fit`. Phone: OnePlus, OxygenOS 16, Android 16. The user works from the phone only (GitHub web upload, no PC, no Android Studio) and wants SHORT replies.

User purpose: get back in shape (never jogged, about 1.5 years inactive). 28-day home plan from 2026-10-04: strength days plus jog/walk run days. Current run goal about 3.5 km. Their schedule is irregular (late nights in festival season), so missed days must be treated as normal rest, not failure.

## 2. Repo layout (since v81)
```
web/                     the app, served as-is. Capacitor webDir is "web"; CI no longer copies a file list
  index.html  sw.js  manifest.webmanifest
  css/liquid.css
  js/boot.js             loaded last
  js/ui/                 settings.js home.js motion.js
  js/features/           readiness progression handsfree animate weekly bodyheat swap backup library routemap builder
  icons/                 icon-192.png icon-512.png icon-512-maskable.png
  images/                hero anatomy exercise-masks exercises
native/java/             MainActivity.java RunService.java RunEnginePlugin.java StepsPlugin.java (CI copies into com/arya/fit/)
native/res/              arya_splash.xml, arya_splash_icon.xml, ic_launcher(_round).xml (adaptive icon)
tools/                   check-web.py  android-setup.sh  patch-manifest.sh  patch_splash.py
signing/debug.keystore   NEVER delete or replace (new key = old app cannot be updated)
docs/                    HANDOFF.md  THIRD-PARTY-NOTICES.md
package.json  capacitor.config.json  .gitignore  README.md  .github/workflows/build.yml
```
Old flat name -> new path: `*.js` features -> `web/js/features/`; `settings.js home.js motion.js` -> `web/js/ui/`; `boot.js` -> `web/js/boot.js`; `liquid.css` -> `web/css/`; `icon-*.png` -> `web/icons/`; `images/` -> `web/images/`; `index.html sw.js manifest.webmanifest` -> `web/`; `*.java` -> `native/java/`; `debug.keystore` -> `signing/`; docs -> `docs/`. The old "copy list into www/" in `build.yml` is gone: Capacitor reads `web/` directly.

**build.yml must still do all of these** (now implemented by the scripts; check the live files every time):
- Pins `ubuntu-24.04`; copies `signing/debug.keystore` to `~/.android/`.
- `python3 tools/check-web.py` (fails fast if index.html / sw.js SHELL / manifest reference a missing file, or hero/atlas/push-ups images are missing).
- `npx cap add android && npx cap sync android`; version code = run number; `applicationId` com.arya.fit2.
- `tools/android-setup.sh`: blank native splash (`patch_splash.py`), copies `native/java/*.java` (incl. MainActivity: transparent bars, insets bridge, 120 Hz, `registerPlugin(RunEnginePlugin)` and `registerPlugin(StepsPlugin)`), adaptive icon from the maskable PNG, manifest seds (`tools/patch-manifest.sh`: permissions, `RunService`, `StepsPlugin$Svc` type health, `StepsPlugin$Boot` receiver, TTS `<queries>`).
- `./gradlew assembleDebug`, apksigner verify, upload artifact `arya-fit-apk`.

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

## 7. Delivery workflow (since v84)
Every change is delivered as ONE file: `update.zip`, with the repo files at the zip root in their real folders (`web/...`, `native/...`, `tools/...`, `docs/...`) and an optional `DELETE.txt` (one repo path per line) for files to remove. The user uploads it to the repo root with GitHub "Add file > Upload files". The workflow `.github/workflows/apply-update.yml` then unpacks it over the repo, applies DELETE.txt, commits, removes update.zip and starts the APK build with `gh workflow run build.yml`. Nothing else for the user to do except download the APK from Actions > latest run > Artifacts (export a backup first: Settings > Data & backup).
- The zip must be named exactly `update.zip`. Files at the root or inside one wrapper folder both work.
- `.github/` inside the zip is IGNORED (GitHub tokens cannot edit workflow files). If `build.yml` or another workflow changes, give it as a separate file and tell the user to paste it with the pencil icon. Rare.
- `build.yml` ignores pushes that only touch `update.zip`, `docs/**` or `README.md`, so doc-only updates do not trigger builds.
- Always build the zip from the repo tree, always include HANDOFF.md changes, always list stale files in DELETE.txt (renamed or removed files), never make the user create folders.
Do not re-explain this to the user; they know it.

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

## v69 — Hands-free workout mode (2026-10-17; drafted by Gemini, reviewed and fixed by Claude; headless-tested with stubs, NOT run on a phone; no Java changed)
- New `handsfree.js` (copied into `www/` by `build.yml`; loaded after `progression.js`; runtime-cached, not in SHELL). Wraps `day()` to add a "Hands-free workout" button above Edit sets / reps on any day with steps (warm-up, strength/mobility, cool-down; habits and run excluded). Steps come from `items()`, so readiness-adjusted plans and manual edits are respected.
- Full-screen player in the existing `#gov` overlay (class `ax-hf`): picture strip, set pills, one big Done button, Skip, Prev, Exit, 60 s rest timer (-15/+15), auto countdown for timed moves and warm-up/cool-down, voice via `say()`, wake lock via `wl()`. Blocked while a run is active.
- Done Set logs target reps into `PR.setLog[name][day]` (Strength only); finishing the last set ticks the row. Skip does NOT tick. Exit adds elapsed seconds (15 s or more) to `st["w"+day]`. Back button clicks Exit (popstate branch in index.html).
- Fixed vs Gemini draft: `#gov b`/`#gov i` CSS (id specificity) was overriding hands-free fonts; Skip used to tick the exercise; paused state leaked across steps; Back used a wrong id; removed an unused init call. Cache `arya-v69`, label v69.
- Not verified: phone (picture height, native TTS between sets, wake lock).

## v70 — Animated exercise pictures (2026-10-17; drafted by Gemini, reviewed by Claude; headless-tested, NOT run on a phone; no Java changed)
- New `animate.js` (copied into `www/` by `build.yml`; loaded after `handsfree.js`; runtime-cached). Wraps `axExiBind()` and `axExiErr()`. Multi-frame exercises cross-fade A/B/C/D (1150 ms per frame, .48 s opacity) with a glass Play/Pause pill (`.ax-ex-play`). Single-frame exercises get no pill. Works in Plan cards and Hands-free (`#gov.ax-hf`); clothing tint masks (`.ax-ext`) sit inside each frame, so they are unchanged.
- While playing, tapping the picture advances one frame; paused = the old swipe/tap strip. Preference `PR.exAnim` (0 = paused, default playing; skipped when reduced motion is on); added to the `restorePrefs` list (backup import).
- Fixed vs Gemini draft: the per-box timer was never cleared after a re-render (leaked one interval per render); simplified the play/pause markup into `setBtn`.
- Known: every box on a day plays at once; pausing one stops the others only after the next render.
- Not verified: phone (smoothness, pill covering the art).

## v71 — Weekly review share card (2026-10-17; drafted by Gemini, reviewed and fixed by Claude; headless-tested, NOT run on a phone; no Java changed)
- New `weekly.js` (copied into `www/` by `build.yml`; loaded after `animate.js`; runtime-cached). Adds "Share weekly review card" under the "This week" panel (Progress > Stats, via wrapped `axPg`) and in the Quick actions sheet (wrapped `axTopMore`, appended to `#ax-shb`).
- Draws a 1080x1350 canvas PNG with the active skin's CSS variables: 7-day strip, days done, km, steps (PR.ds / SS.today / st["s"+i]), streak (read from `#ax-streak`), strength moves, jog share. Shares through Capacitor Filesystem (CACHE) + Share, else `navigator.share({files})`, else a preview overlay in `#gov`.
- Fixed vs Gemini draft: tile and header text overflowed the card (added `fit()` shrink-to-width and a measured header pill); "done" now uses `dayDone()` like the "This week" panel; the "strength sets" label counted ticked exercises, so it now says strength moves; no hard-coded athlete name (uses `P.athlete` if set); removed a fake Save button that did nothing in the WebView.
- Not verified: phone share sheet, how it looks on the OnePlus.

## v72 — Body week-volume heatmap + Swap exercise (2026-10-17; written by Claude, headless-tested, NOT run on a phone; no Java changed)
- `bodyheat.js`: Body tab gets a Recovery / Week volume toggle (`#ax-bm`, `PR.bmode`). Week volume recolours the existing SVG muscles (`bhc()`) by weighted ticked Strength sets this plan week (sets x `MX` weights; target about 10 sets, a common general guide, not a rule), replaces `#bdet` and the `#blist` labels, and lists the 3 lowest groups. Wraps `body()`. Runs are not counted. Recovery mode is unchanged.
- `swap.js`: "Swap exercise" button on each card in Edit workout (wraps `axEditWorkout`). Alternatives = same primary muscle (`MX` match) from plan templates `T` + `EXI` picture slugs, deduped by `exSlug`, picture-first, max 6, plus "Back to original". Stored non-destructively in `axPlan().swaps[day][n]={from,to}`; `items()` wrapper shows the new name and a "Swapped in for X" note (same sets and reps; base plan untouched). Not in backup export yet. Setlog history is keyed by name, so a swapped exercise starts fresh history.
- Both files copied by `build.yml`, loaded after `weekly.js`; cache `arya-v72`, label v72.
- Not verified: phone layout of the toggle and swap list.


## v73 — Backup nudge, online exercise library, offline route map (2026-10-17; written by Claude; tested headless with a MOCKED network, NOT run on a phone and never against the real GitHub URL)
- `backup.js`: Export already opens the Android share sheet (user picks Drive there). Added a Home card (`#ax-bk-nudge`, wraps `home()`) when no backup exists after plan day 3 or the last one (`PR.lbk`) is over 7 days old; "Later" snoozes 3 days (`PR.bkz`); a Drive tip under the Export button. No automatic Drive sync (needs a Google Cloud project, OAuth plugin and Java).
- `library.js`: Settings card "Online exercise library" (`#ax-lib`). Download fetches free-exercise-db `dist/exercises.json` (raw.githubusercontent.com, jsDelivr as fallback; URL path NOT verified against the live repo), slims it (name, primary muscle mapped to `MU` keys, equipment, level, 2 instruction lines) and stores it in IndexedDB (`aryafit-lib`). `window.axLib` = `ready/prim/byMuscle/search`. Used by Swap (adds bodyweight same-muscle names, up to 8) and by a search box under the name field in Add exercise. Works offline after one download. Notice added to THIRD-PARTY-NOTICES.md. Library exercises have no pictures.
- `routemap.js`: "Route" button on each run in Progress > History (rows with a saved route); opens a sheet with an offline SVG line map from `axRoutes()[day]` (start/finish dots, km circles, distance/time/pace). No tiles, no internet. Share card does not include the map yet.
- Not verified: real download, phone layout, IndexedDB on the Android WebView.
- Cache `arya-v73`, label v73. `build.yml` copies the 3 new files.

## v74 — Smart loading screen + busy pill (2026-10-17; written by Claude; headless-tested at 6x CPU throttle, NOT run on a phone)
- Cause of the first-open lag was not measurable here: at 1x the startup JS is about 150 ms (hot spots: `axNavH` forced layout, `go`); the rest is parse, style, layout and paint on a big single page. The splash masks the unsettled first frames; it does not make the work smaller.
- `index.html` body start: `#ax-boot` splash (name, thin bar, message) + inline CSS + a 6 s failsafe script that removes it even if `boot.js` never runs. `html.ax-booting` turns off animations, transitions and backdrop-filter until ready (cheaper first frames).
- `boot.js` (loaded last): hides the splash after load, fonts and non-lazy images decoded, then 2 animation frames (hard cap 3 s; "Still loading" text after 2 s). `window.axBootDone()`.
- `axBusy(text)` / `axBusyDone()`: a small pill (`#ax-busy`) that only appears if the job lasts over 400 ms. Used by `packFresh()` (backup) and the library download.
- Cache `arya-v74`, label v74, `build.yml` copies `boot.js`.
- If the lag remains: ask the user for a screen recording; consider lazy-building the Progress, Body and Settings views, and trimming `backdrop-filter` layers.
- Auto Google Drive sync is NOT built. Option found: `@codetrix-studio/capacitor-google-auth` (Capacitor 6, v3.4, returns `accessToken`, accepts `scopes`) with scope `drive.appdata` and the Drive REST API. Needs a Google Cloud project, an Android OAuth client for `com.arya.fit` with the repo debug keystore SHA-1 (65:A6:95:A7:79:B7:39:01:EB:E8:B8:66:A8:AD:B0:F7:2F:CE:A9:BD), package.json change and Java plugin registration. Untestable here; a wrong plugin config can break the APK build, so do it as its own version.


## v75 — Settings hub (2026-10-17; headless-tested, NOT run on a phone; no Java changed)
- Settings was six stacked accordions plus the library card. Now `#ax-v-set` is a menu (`#ax-sm`) of 6 rows with live subtitles: Appearance, Run & tracking, Sound & feedback, Plan & exercises, Data & backup, About. Each opens a page (`#ax-sp-<key>`) with a round back button.
- New `settings.js` (copied by `build.yml`, loaded after `library.js`). It MOVES the existing nodes into pages, so all ids and handlers are unchanged (`t-gps`, `skins`, `ex`, `rs`, `sp-go` ...). Exercise pictures toggle moved from Voice to Appearance. `#ax-lib` (library.js) is moved into Plan & exercises. If the old markup is not found, it leaves the accordion untouched.
- `#ax-credits` stays as a hidden anchor (library.js inserts before it); its `open` setter opens the About page, so Drawer > About still works. Android Back closes a page first (`window.axSetBack`, hooked in the popstate handler). Leaving Settings resets to the menu.
- Cache `arya-v75`, label v75. Not verified: phone layout.


## v76 — Liquid Glass layer (2026-10-17; headless-tested in 4 skins at 390x844, NOT run on a phone; no Java changed)
- New `liquid.css` (`<link>` at the end of `<head>`, copied by `build.yml`, listed in `sw.js` SHELL). Pure paint on top of the existing styles; active only with `html.gls` and NOT `html.ax-lite-glass` (efficient mode) and not `prefers-reduced-transparency`. Glass look off = the old look unchanged.
- Recipe: richer 5-blob ambient field (`body::before`), translucent fill + specular diagonal highlight, bright top rim (inset 1.5px), inner glow, soft drop shadow, 20 px blur + 1.9 saturation on cards, 30 px on floating chrome (nav, top pill, drawer), 38 px on sheets. Tinted-glass primary button, glass chips/inputs, glass active-tab capsule, press scale .97.
- Tokens `--lq-f1/f2/spec/rim/rim2/sh/glow` switch for dark skins (midnight, sunset, black theme, classic in OS dark). Nested cards do not blur twice. `.ax-pbar` and `.ax-dk` keep their opaque clarity, gain the rim only.
- Testing gotcha: headless Chromium trips `ax-lite-glass` (efficient mode), which hides all of this; remove the class in tests.
- Cache `arya-v76`, label v76. Not verified: phone scroll performance with many backdrop-filter layers; if it janks, lower the 20px card blur or add `contain:paint` to `.ax-card`.


## v77 — Startup: no native splash flash (2026-10-18; build step dry-run only, NOT built or run on a phone; no Java changed)
- Problem: Android 12+ always shows its own splash (dark window + launcher icon) before the WebView, then our `#ax-boot` loading screen, then the app.
- `build.yml` new step "Blank native splash" (after `cap add android`): writes `values/arya_splash.xml` (`arya_splash_bg` #eee7d7 = Old Money bg) and a 1dp transparent `drawable/arya_splash_icon.xml`, then python-patches `AppTheme.NoActionBarLaunch` in `values/styles.xml` (items `windowSplashScreenBackground`, `windowSplashScreenAnimatedIcon`, `windowSplashScreenAnimationDuration=0`, and `android:background` -> the colour). If the style is not found or its parent is not `Theme.SplashScreen` it prints styles.xml and warns, leaving the native splash as is (read the log). Android cannot remove the system splash window itself; this makes it a blank cream frame.
- `index.html`: tiny script at the top of `<head>` sets `data-skin` from `localStorage aryaApp2.prefs.skin` (default oldmoney), so `#ax-boot` already uses the saved theme colour instead of the classic/dark `--bg` (it used to flash the wrong colour).
- Limit: native splash colour is fixed cream, so users on Midnight/Sunset still see cream for ~0.2 s. Fix later via a Java-set window background if it bothers.
- Cache `arya-v77`, label v77.


## v78 — Smarter Home order (2026-10-18; headless-tested at 390x844, NOT run on a phone; no Java changed)
- Home was 7 stacked cards with the actual Today card last (~1100 px down). New `home.js` (copied by `build.yml`, loaded after `settings.js`) MOVES the existing nodes into this order: compact hero (176 px, tagline/bottom row hidden) > `#ax-hnote` run prompt > `#ax-htoday` (Today + Start button) > `#ax-hmiss` catch up > `.ax-stat` progress ring > `#ax-hsteps` > `#ax-readiness-card` > `#ax-hbar` (new toggle bar) > `#ax-hbrain` (Smart Today, collapsed by default via `.ax-cl`) > `#ax-bk-nudge` (backup, last).
- A MutationObserver on `#ax-v-home` re-applies the order when readiness.js / backup.js insert their nodes (they insert before `#ax-hbrain`). No ids or handlers changed.
- Toggle bar label switches to "Check-in / Done for today" when `#ax-br-edit` exists. Quick actions > Smart Today check-in now expands it (`window.axBrainOpen`, one-line patch in the `ax-q2` handler).
- Not changed: Plan, Run, Progress tabs, drawer, Quick actions list, Settings (v75).
- Cache `arya-v78`, label v78.


## v79 — Not a "28-day app" anymore (2026-10-18; headless-tested, NOT run on a phone; no Java changed)
- Plan length was already dynamic (`setPlan`: `ND=weeks*7`, import allows 1-12 weeks), so this is copy/branding only. No logic changed.
- Renamed: page `<title>` "Arya Fit - Workout Tracker"; `manifest.webmanifest` name "Arya Fit"; Home sub-line placeholder "Your plan"; built-in default plan name "Home Plan"; generated plans end "(next plan)"; button "Generate next plan"; toast "New plan ready"; Plan tools text "Create the next plan from your progress."; plan-complete message "Your plan is complete."; Settings row subtitle "Plans, next plan, library".
- `loadApp` renames any saved plan named exactly "28-Day Home Plan" to "Home Plan" (display name only; storage keys such as `arya28v1` and the 28-day default schedule content are unchanged). "Steps per day, last 28 days" is a real 28-day window and stays.
- Still true: the built-in starter plan is 4 weeks; imported plans can be 1-12 weeks.
- Cache `arya-v79`, label v79.


## v80 — Build my plan + one motion language (2026-10-18; headless-tested at 390x844, NOT run on a phone; no Java changed)
**Build my plan (`builder.js`, copied by build.yml, loaded after `home.js`)**
- 3-step sheet using the existing `axSheet`/`axSheetX`: (1) goal Strength / Fit and lean / Run further + level, (2) 3-6 workout days, 4/6/8/12 weeks, start Today or Next Monday, (3) running goal None/3/5/8/10 km, habits, plan name. Entry points: Settings > Plan & exercises (row "Build my plan"), Plans view (panel above "Add a plan"). `window.axBuildPlan()` opens it; `axBuildPlan.test(opts)` returns `{ok,E}` for tests.
- Generates a normal `arya-plan` object -> `vplan()` -> `APP.plans[id]` -> `activate` like "Add and use this plan". All 960 option combinations validate. Exercises are picked by name from `T0`, so pictures, notes, Swap and progression work. Week templates: 3 = Full A / Full B / Circuit (+ Sun stretch); 4 = Push, Legs, Pull, Circuit (+ Wed stretch); 5 = Push, Legs, Core, Pull, Circuit; 6 = adds Sat stretch. Beginner = easier push/core lists, 2-3 sets, 2 circuit rounds; Intermediate = full lists, 3-4 sets (4 for Strength goal), 3 rounds. Deload (`lightWeeks`) every 4th week.
- Running: 3 (beginner) or 4 (intermediate) run days per week (+1 for Run further, max 5), placed on rest/stretch/circuit days first; other days get `jog:false`. Jog/walk intervals ramp from 1 min (beginner) or 3 min (intermediate) to a goal-based final jog, walk shrinks to 0 at the end for 8-10 km. "No running" omits `jog` entirely (JKM=0; Run tab just hides the run card).
- Habits: Water 2-3 L, Protein every meal, Sleep 7-9 h (generic, not the old personal numbers). Athlete name is copied from the current plan.

**Motion (`motion.js`, copied by build.yml, loaded last before routemap/boot; skipped entirely under prefers-reduced-motion)**
- `go()` is wrapped to set `html[data-dir]` (f/b); tab content slides in from the right going forward and the left going back with a 30 ms stagger (overrides the old up-only rise via `!important`).
- `axSheetX()` in index.html now calls `window.axSheetGhost()` first: a cloned, id-less copy of the sheet and scrim animates out for 220 ms while the real sheet closes instantly (no logic race). Covers scrim taps and back button too.
- Settings pages slide in from the right, the menu returns from the left; the Home check-in unfolds. Shared easing for toggles/chips/rows.
- liquid.css fix: `.btn.pri` (Use this plan, Add and use this plan, Build, Download) is now tinted-glass primary; before it got the neutral glass and white-on-light text was unreadable.
- Cache `arya-v80`, label v80. Not verified on a phone: slide timing feel, ghost sheet on slow devices.


## v81 — Repo reorganized (2026-10-18; headless-tested; CI scripts proven equal to the old inline steps in a dry run, NOT built on real CI yet)
- Moved everything into `web/ native/ tools/ signing/ docs/` (section 2). `index.html` script/link paths, `sw.js` SHELL, manifest icon paths and `capacitor.config.json` (`webDir` "web") updated. No app code changed. Script order in `index.html` is unchanged.
- `build.yml` shrank from about 130 lines to about 50: the inline MainActivity, splash, icon and manifest heredocs became real files (`native/`, `tools/`). A dry run against a fake Android project produced a byte-identical `android/` tree to the old inline steps.
- New `tools/check-web.py` guard (a module loaded by index.html but never uploaded, like the missing `home.js` in v80, now fails the build with the file name).
- Added `.gitignore` (android/, www/, node_modules/, apk), a real `README.md`.
- Cache `arya-v81`, label v81.
- FIRST BUILD WATCH: if CI fails, the likely places are `tools/android-setup.sh` paths or `webDir`. Send the log.


## v82 — Freeze fix + lighter graphics (2026-10-18; headless-tested; not yet on a phone)
- BUG (v80/v81): tapping "How are you feeling?" froze the whole app. Cause: `motion.js` watched `#ax-hbrain` class changes and, on every change while open, added the animation class `ax-m-drop`; that class change re-triggered the same watcher, forever (microtask loop, UI thread never returns). Fix: react only to the collapsed -> open transition. Reproduced in headless Chromium before the fix (page unresponsive), 6 taps + 40 rapid toggles fine after.
- Why restart showed a black screen: the hung WebView process was still alive, so reopening the app resumed the stuck process. Force stop (App info > Force stop) clears it; data is not touched.
- Safety nets: `motion.js` and `home.js` now have storm breakers (more than 60 / 80 triggers in one second disconnects their observers instead of freezing). `home.js` only writes label text when it changed.
- Lag: `liquid.css` no longer blurs content cards (backdrop blur over a soft background is invisible and the most expensive thing when scrolling); card shadow stack cut from 5 layers to 3; floating chrome blur 30 -> 18 px, sheets 38 -> 22 px, scrim and chips no blur.
- New Settings > Appearance > **Smooth mode** (`localStorage axLite`, applied by a tiny head script before first paint, adds `html.ax-lite-glass` which switches the glass layer off and shortens animations). Off by default; independent of app data.
- Lesson (add to rules): never write a MutationObserver that mutates the attribute it observes. Always compare previous and new state, or add a counter breaker.
- Cache `arya-v82`, label v82.


## v83 — Measured optimization (2026-10-18; headless-profiled at 4x CPU throttle; not yet on a phone)
Measured first (Playwright + CDP, 390x844 @2x, 4x CPU). Findings: warm boot about 1.4 s at 4x (about 0.35 s on a real phone) so startup is fine; per tab switch about 26 ms real, no layout thrash (one forced layout per `go`); my modules (motion, home) add no measurable cost; no always-running animations or rAF loops; DOM 965 nodes. Headless software rendering cannot show GPU cost, but removing blur on the fixed bars was the one change that visibly cut slow scroll frames on Home (5 -> 0 of 460).
What shipped:
- `js/ui/perf.js` (new, zero idle cost): (1) while the page scrolls, `html.ax-scrolling` turns off backdrop blur on `#ax-nav`, the top pill and `#ax-tmenu` (blur over moving content is recomputed every frame) and returns it 160 ms after the scroll stops; closed drawer never holds a blur layer. (2) Governor: samples frame times only during a scroll; if two separate scrolls (30+ frames each) have 15% or more frames slower than 40 ms, Smooth mode switches on once with a toast. Needs 8 s after launch, ignores background. Manual choice in Settings > Appearance sets `axLiteAuto=user` and the governor never touches it again. Stored in `localStorage axLite` / `axLiteAuto`. Test hooks: `axPerf.bursts()`, `axPerf.enable()`.
- Idle wakeups: metronome timer 2.7/s -> 0.5/s when metronome is off (2 s) and 2/s when on but not running; dock progress poll 250 -> 400 ms and skipped when the app is hidden.
- Removed `will-change:transform` from the 9 Smart Today option buttons (9 permanent GPU layers).
- `preconnect` to the Google Fonts hosts.
- Tried and rejected (measured, no real gain): bundling the 16 scripts into one file (DCL -15% at 4x, not worth a build step; revisit if boot ever matters), `content-visibility:auto` on cards (no change), non-blocking fonts (would make the boot splash end before fonts arrive).
- Still open: fonts come from Google over the network on every launch. Self-hosting needs the woff2 files (DM Sans 400/500/700, Barlow Condensed 600/700) committed under `web/fonts/` plus an `@font-face` block; I cannot download them from the sandbox. If the user can supply them, it removes the last external request and makes offline launch instant.
- Cache `arya-v83`, label v83.


## v84 — New logo + 6 switchable app icons (2026-10-18; headless-tested incl. a dry run of the native setup; NOT built on CI or seen on a phone)
- Mark: a bold **A** with a stride leg and a sun/head dot (reads as runner, mountain and sunrise; works as one colour). Geometry lives in `tools/icons/variants.json` (`mark.stroke`, `mark.dot`), the same numbers are copied into `web/js/features/appicon.js`, the hero badge and the loading screen in `index.html`.
- Six icons, one per theme: oldmoney (default), midnight, sunset, classic (navy + gold), professional, glass. Colours in `variants.json`. `python3 tools/icons/make_icons.py` (needs `pip install playwright`, `playwright install chromium`) regenerates everything: `native/res/drawable-nodpi/ic_bg_*.png ic_fg_*.png ic_mono.png` (adaptive layers, 432 px), `native/res/mipmap-anydpi-v26/ic_launcher_<id>.xml` (adaptive + Android 13 themed `<monochrome>`), `native/res/mipmap-*dpi/ic_launcher_<id>.png` (legacy, API < 26), `web/icons/icon-192/512/512-maskable.png` (PWA, default icon), `tools/icons/preview.png`.
- Native switching: `native/java/AppIconPlugin.java` (`@CapacitorPlugin(name="AppIcon")`, `get()` / `set({name})`) enables one `<activity-alias>` (com.arya.fit.IconOldMoney ... IconGlass) and disables the rest with DONT_KILL_APP. Registered in `MainActivity` next to the other plugins. `tools/patch_icons.py` (called by `tools/android-setup.sh`) removes MainActivity's MAIN/LAUNCHER filter and adds the 6 aliases (only Old Money enabled). Alias names in Java, the python script and the manifest must stay in sync. `android-setup.sh` copies the res tree, makes `ic_launcher` and `ic_launcher_round` copies of Old Money and deletes Capacitor's template foreground pieces.
- UI: Settings > Appearance > App icon (3x2 grid) + "Match app theme" (follows `data-skin`, 1.5 s debounce; Modern uses Glass). Choice also stored in `localStorage axIcon` / `axIconMatch`. In a browser (no plugin) it only remembers.
- Dry run: fake Capacitor-style manifest -> 6 aliases, LAUNCHER filter gone from MainActivity, every referenced resource exists, services/TTS patches intact. Not compiled: `AppIconPlugin.java` (no javac/Android SDK in the sandbox). If CI fails, the error will be in that file or a duplicate-resource clash; send the log.
- Deleted vs v83: `native/res/mipmap-anydpi-v26/ic_launcher.xml` and `ic_launcher_round.xml` (old maskable-PNG based). Delete them from the repo, otherwise they are copied and then overwritten (harmless but untidy).
- Known Android behaviour: the launcher can take a few seconds to show the new icon, and some launchers briefly remove the icon. Themed icons (Android 13+) need the user to enable "Themed icons" in wallpaper settings.
- Cache `arya-v84`, label v84.


## Tooling note (after v84): one-file updates (2026-10-18; simulated end to end in a throwaway git repo, never run on real GitHub yet)
- Added `.github/workflows/apply-update.yml` (trigger: push touching `update.zip`; permissions contents+actions write). Tested by simulation: files copied into their folders, DELETE.txt applied (unsafe paths like `../x` skipped), `.github/` in the zip skipped with a warning, update.zip removed, commit pushed, build started. Pushes made with GITHUB_TOKEN do not trigger other workflows, so the workflow starts the build itself via `gh workflow run build.yml` (build.yml has `workflow_dispatch`).
- First-time setup by the user: create `.github/workflows/apply-update.yml` once (Add file > Create new file, paste), paste the new `build.yml` (adds `paths-ignore`).

## v85 — Auto sync through a file you choose (2026-10-18; web logic tested headless against a MOCK of the native plugin; the Java is NOT compiled and nothing was run on a phone or against real Google Drive)
- Why not Google sign-in: `@codetrix-studio/capacitor-google-auth` is marked "virtually archived" by its own README; its successor (Capgo social-login) tracks newer Capacitor majors and needs a Google Cloud project, Web + Android OAuth clients, MainActivity changes and token refresh handling. Too many unverifiable moving parts for a repo that cannot be tested here. This version needs no Google account code and no Cloud project.
- How it works: `native/java/SyncFilePlugin.java` (`SyncFile`, registered in MainActivity) uses Android's document picker once (`pick({mode:"create"|"open"})`, ACTION_CREATE_DOCUMENT / ACTION_OPEN_DOCUMENT, persistable read+write permission stored as a URI in SharedPreferences `arya_sync`). Then `read()` / `write({text})` / `status()` / `unlink()` work silently. If the user picks Google Drive in the picker, the Drive app syncs that file to the cloud; any other folder or cloud app that offers a document provider also works.
- `web/js/features/sync.js` (loaded after routemap.js): card "Auto sync" under Data & backup (anchored after `#ax-bk-tip`/`#ax-lbk`). State in `localStorage axSync` (not in backups): `on, name, baseTs, baseHash, last, err, devId`. File = `{"app":"arya-fit-sync","v":1,"ts","dev","data":<pack() text>}` followed by `\n#END` (reader cuts at `#END`, so leftover bytes from a provider that does not truncate are harmless).
- Sync pass (`axSync.run(reason)`): on open (3.5 s after start), every 10 min while visible, on `visibilitychange` hidden (quiet, no dialogs), and the "Sync now" button. Rules: remote `ts` equals our `baseTs` -> push if local content hash changed (20 s minimum gap except Sync now); remote changed and we have nothing new (or this is a fresh install: no ticks, no run days) -> apply with `doImport`; both changed -> sheet "Use the synced copy / Keep this phone". Never silent overwrite when both sides changed. Hash ignores the `exported` field.
- `backup.js`: the Home backup reminder stays quiet while auto sync has worked in the last 3 days (`axSyncOk()`).
- Known limits: last writer wins between keep/use choices; two phones editing at once is not merged; the Drive document provider can lag a few seconds before another phone sees the file; deleting the file in Drive makes the next pass push a fresh one; if Android revokes the permission the card says to turn sync off and on. Android 11+ only shows Drive in the picker if the Drive app is installed and signed in.
- Not verified: Java compile, picker flow, writes to a real Drive file, a second phone. If CI fails, the error will be in `SyncFilePlugin.java` (imports `androidx.activity.result.ActivityResult`, `ActivityCallback`); send the log.
- Cache `arya-v85`, label v85.

## v86 — Home-screen widgets: Steps, Today, Overview (2026-10-18; drawing code NOT compiled, nothing run on a phone; previews made with a Pillow mock that mirrors the layout numbers)
- Three native Android widgets, all drawn as bitmaps (Canvas) so they look the same everywhere and follow the app's skin: `native/java/WidgetKit.java` (all drawing + `push/updateAll/ping`), `StepsWidgetProvider`, `TodayWidgetProvider`, `ComboWidgetProvider`, `AppWidgetPlugin` (Capacitor plugin `AppWidget`, registered in MainActivity).
  - **Steps** (dedicated, default 2x2, resizable): square = big progress ring with live step count; wide (aspect over 1.45) = ring with percent, "STEPS TODAY", big number, goal line and 7 day bars (today highlighted). Goal reached turns the ring green.
  - **Today** (4x2): kicker "TODAY · DAY n OF 28", workout name, "x of y done", progress bar, plus a steps ring on the right. Shows "Open Arya Fit" when the app has not written today's data yet.
  - **Overview** (4x2): three tiles: workout ring (done/total or Rest), steps ring (compact like 8.4k), flame + streak number.
- Data: steps and the last 7 days are read live from `StepsPlugin` SharedPreferences (`arya_steps`, keys `d_yyyy-MM-dd`). `StepsPlugin.credit()` calls `WidgetKit.ping(c)` (at most every 45 s) so the widgets follow the step counter. Everything else comes from `web/js/features/widget.js`: it sends `{date, goal, title, kicker, done, total, rest, streak, c:{bg,card,ink,mut,blue,ok,sun,line}}` (colours resolved from the current CSS variables to hex) to `AppWidget.update`, debounced 2.5 s after `save()`, on `visibilitychange` hidden, and 4 s after start. Stored in SharedPreferences `arya_widget` key `json`; plan fields count only when `date` equals today.
- Build wiring: `native/res/layout/widget_image.xml`, `native/res/xml/widget_{steps,today,combo}_info.xml`, `native/res/values/arya_widgets.xml`, preview PNGs `native/res/drawable-nodpi/widget_preview_*.png`, `tools/patch_widgets.py` (adds 3 `<receiver>` entries) and 5 new lines in `tools/android-setup.sh`. Update period 30 min (system minimum) plus the step pings and app writes.
- Tapping a widget opens the app (PendingIntent, FLAG_IMMUTABLE).
- Steps widget sizes: resizable down to 1 cell either way (`minResizeWidth/Height` 40dp). Layouts by shape: 1 wide x 2+ tall = ring on top with number and goal below (`drawStepsTall`); 2+ wide x 1 tall = ring left, number and goal right (`drawStepsShort`); tiny square hides the small labels; normal square and wide layouts unchanged. Card corner radius shrinks on small widgets (28 percent of the short side, max 26dp). Today and Overview stay 4x2 style.
- If CI fails, the error is most likely in `WidgetKit.java` (never compiled) or the XML infos (`targetCellWidth`/`description` need compileSdk 31 or newer). Send the log.
- Not verified: compile, real fonts (device serif is narrower than the preview font), sizes on the phone's launcher, dark skin colours on a real home screen, battery cost of the step pings.
- Cache `arya-v86`, label v86. This update also contains v85 (auto sync) if it was not applied yet.

## v87 — Split the monolith (2026-10-20; headless-tested)
- `index.html` 368 KB -> 48 KB. Inline `<script>` (931 lines) -> `web/js/core/*.js` (12 files + `adaptive-glass.js`); 5 inline `<style>` blocks -> `web/css/*.css`. Same load order and same position in the page, so cascade and global scope are unchanged.
- Verified: concatenated core files are byte-identical to the old inline script; `node --check` passes; headless Chromium shows zero page errors, zero 404s and pixel-identical screenshots of all 5 tabs vs the old build.
- Gotcha fixed: CSS moved into `css/` needs `../` for relative `url()` (hero image). Rule: use `../images/...` in anything under `web/css/`.
- Gotcha: function hoisting no longer spans files. `var _sp=setPlan` (patch of `setPlan`) must load after `setPlan`; that is why `sheets-views.js` holds both. Any new top-level code that calls or patches a function must live in the same file as it or a later one.
- `lifecycle.js` runs the app init (`loadApp(); bindApp(); ... go("home")`); keep it the last core file.
- Still classic scripts, not ES modules: inline `onclick=` handlers and cross-file monkey patches need globals. ES-module conversion is a later step, file by file.
- SW cache `arya-v87`; SHELL now lists the new css/js files.

## v87b — Permanent fix for "package conflicts with existing package" (2026-10-20; CI logic tested locally, APK build not run here)
Causes of that Android error: (a) APK signed with a different key than the installed app, (b) lower versionCode than installed, (c) an old same-named `app-debug.apk` installed by mistake. This update removes all three.
- `signing/EXPECTED_SHA256.txt` = fingerprint of the permanent key. `build.yml` fails the build if the keystore OR the finished APK is signed with anything else, so a bad-key APK can never be produced.
- versionCode = minutes since 1970 (always increases, independent of `run_number`, which resets if a workflow is recreated). versionName = `1.<run>`.
- APK file is now `Arya-Fit-build<run>.apk` (no more `app-debug.apk`). Run summary lists package, versionCode and key fingerprint.
- `applicationId` comes from env `APP_ID` (default `com.arya.fit2`); manual run (Actions > Build APK > Run workflow) accepts `app_id` for a one-time clean install (e.g. `com.arya.fit3`).
- `web/js/build-info.js` is a stub; CI overwrites it with `{run, code, id}` and Settings > About shows "build N" (matches the Actions run number).
- `build.yml` is NOT applied by `update.zip` (workflows must be pasted by hand).
- One-time recovery if the installed app still refuses updates: Settings > Data & backup > export; run workflow with app_id `com.arya.fit3`; install; import backup; uninstall the old app. After that every build updates in place because the key is guarded.

## v87c — Root cause of the install conflict found (2026-10-20, from a failed CI run #70)
- The new fingerprint guard blocked build #70: APK was signed with `571d2a3f...`, not the permanent `3c1ec75f...`. So Gradle never used `signing/debug.keystore`: copying it to `~/.android/` is not enough on CI, and every build got a throwaway key. That is why no build could update the previous one.
- Fix: `tools/patch_signing.py` adds an explicit `signingConfigs.debug` pointing at `signing/debug.keystore` (marker `ARYA-SIGNING`); `build.yml` runs it after the version step. The guard stays: any APK with another key fails the build.
- Every APK installed so far has a throwaway key, so the first build signed with the permanent key needs ONE clean install (new `app_id`, e.g. `com.arya.fit3`, backup export/import). After that, updates install in place.

## v88 — Storage versioning, migrations, recovery, tests (2026-10-20; unit + real-browser tested, APK not built here)
- `web/js/core/store.js` (loads before `sheets-views.js`). `APP.schema` = version of the saved data shape (`AXSCHEMA`, now 1 = baseline). To change the data shape: add `{to:N,name,run(a)}` to `AXMIG`, raise `AXSCHEMA` to N, add a test. A migration that throws leaves the data untouched.
- `loadApp()` now calls `axStoreRead()`: daily copy `aryaApp2.bak` (kept only if <1.2M chars), copy before any migration `aryaApp2.premig`, a damaged main file is saved to `aryaApp2.bad` and the daily copy is restored (before this, a damaged file silently reset to the default plan and the next save overwrote it). Data from a NEWER schema is never modified and the user is warned.
- Backups now carry `schema`; importing a backup from a newer app is refused; every import first saves `aryaApp2.preimport` (manual undo).
- Tests: `node tests/store.test.js` (14 unit tests, no deps) and `python3 tests/browser_test.py` (real browser: old, damaged and newer data, export/import round trip, all views). CI: `test` job gates `build`; `browser-test` is informational.
- Tick keys are `<day>:<wu|cd|j|e#|h#>` plus `x#`, `w#`, `r#`, `g#`, `s#`, `jt#`, `wk#`; `clean()` drops anything else on import (a test once used `1:0` and correctly lost it).
- Default `app_id` is now `com.arya.fit3`. Keep it unless a clean install is needed again.
- Signing: still the permanent DEBUG key (personal use). Keep a private copy of `signing/debug.keystore` outside GitHub. A Play Store release key / AAB is NOT set up and would force another clean install.


## v89 — Release signing key + Play bundle (2026-10-20; CI logic and Gradle patch tested locally, APK/AAB NOT built here, nothing run on a phone)
- New permanent RELEASE key (`aryafit` alias, PKCS12, valid to 2126). Public fingerprint is in `signing/EXPECTED_RELEASE_SHA256.txt` (`236bfe2f...d04a`). The keystore and passwords live ONLY in 4 GitHub secrets: `ARYA_KEYSTORE_B64`, `ARYA_STORE_PASS`, `ARYA_KEY_PASS`, `ARYA_KEY_ALIAS`. Never commit `arya-release.keystore` or `GITHUB-SECRETS.txt` (both are in `.gitignore`). Keep a private copy outside GitHub: losing it means a clean install again and no Play updates.
- `build.yml`: new step "Release key" decodes the secret into `$RUNNER_TEMP`, fails if its fingerprint is not the expected one, sets `BUILD_MODE=release`. Without secrets it falls back to `BUILD_MODE=debug` (old behaviour, with a warning). In release mode CI runs `assembleRelease bundleRelease`, verifies the APK and the AAB are signed with the release key, and uploads artifacts `arya-fit-apk` (`Arya-Fit-build<run>.apk`) and `arya-fit-aab`.
- `tools/patch_signing.py <gradle> [debug|release]`: release mode adds `signingConfigs.release` reading path and passwords from environment variables (no secret in any file), sets `signingConfig` on `buildTypes.release`, and turns lint off for release builds.
- Default `app_id` is now `com.arya.fit4` so the new build installs next to the old app. Release keys differ from every earlier key, so this ONE clean install is unavoidable: export a backup in the old app, install the new APK, import the backup, then uninstall the old app. After that every build updates in place.
- Unverified risks: first real `assembleRelease`/`bundleRelease` run (lint block syntax, R8 is off), WebView behaviour in a non-debuggable build, Play Console upload.

## v89b — update.zip now applies workflow files too (2026-10-20; apply logic simulated in a throwaway git repo with a local remote and a stub `gh`: PAT, no PAT, invalid YAML; NOT run on real GitHub)
- Why: `build.yml` had to be pasted by hand and kept being forgotten or replaced. Now it travels inside `update.zip` as `.github/workflows/build.yml`.
- GitHub forbids the built-in token to change workflow files, so `apply-update.yml` uses repo secret `ARYA_PAT` for checkout and push (classic token: `repo` + `workflow`; fine-grained: Contents + Workflows read/write). Without the secret it behaves as before: `.github/` in the zip is skipped with a warning.
- Order inside the job: unpack -> validate every workflow YAML in the zip (one invalid file aborts everything, nothing is applied) -> DELETE.txt (`.github/workflows/*.yml` may be deleted with the PAT, never `apply-update.yml`) -> copy -> commit with `[skip ci]` -> push -> `gh workflow run build.yml` (retries 3 times), so the build runs the build.yml just pushed. `[skip ci]` prevents a second push-triggered build and a re-trigger of this workflow by the zip deletion.
- `apply-update.yml` is itself updatable by zip, but a broken version would stop the pipeline: the first install of this version must be pasted by hand.
- This supersedes the older note "build.yml is NOT applied by update.zip".

## v90 — Logo splash + staged startup (2026-10-20; headless-tested at 1x and 4x CPU, unit + browser tests pass; the native splash change is NOT built or seen on a phone)
- **Look:** full-screen brand green (`#1e3b2b`, same colour as the native splash) with the real logo mark (288 px, centred), wordmark, hairline progress and a status line. Fixed brand colours on purpose, not skin colours: the Android 12+ system splash is the same solid colour with `ic_fg_oldmoney.png` (the launcher foreground) as its icon at the same 288 dp size and centre, so the hand-off to the web splash has no jump. Simulated overlay of both: logo pixels match (only the web-only wordmark and bar differ). Exit: fade plus logo grows 14 percent.
- **Native:** `native/res/values/arya_splash.xml` colour, `tools/patch_splash.py` now points `windowSplashScreenAnimatedIcon` at `@drawable/ic_fg_oldmoney`. `arya_splash_icon.xml` is no longer referenced. If the real phone shows a size jump or a clipped logo, adjust the web `.ax-bl` size (288) first.
- **Startup stages (`boot.js`):** stage 1 critical = page load, web-fonts stylesheet (cap 900 ms), fonts ready, hero decoded. Stage 2 warm-up (budget 900 ms): runs `prog()`, `tvu()`, `axSl()` and gives every hidden tab one forced style + layout pass; plan/timers pictures are fetched and decoded. Splash stays at least 450 ms, hard cap 3.4 s (inline failsafe 6 s). Leftover tasks run in idle time after the app is shown. Message line: "Loading your plan" -> "Getting things ready".
- **Rules:** warm-up must NEVER toggle the `hidden` attribute (motion.js and settings.js observe it); it uses an inline `display:block!important; visibility:hidden` for one layout read and restores the previous `style` attribute. `toast()` now waits while `#ax-boot` exists, so startup messages (for example "data file was damaged") are never shown behind the splash.
- **Fonts:** the Google Fonts stylesheet is now non-blocking (`media=print` + onload swap, `data-ax-font`, noscript fallback). Before, a slow or absent network could hold the very first paint. System-bar icons are set light while the dark splash is up (`AxInsets.style(true)`, retried) and `syncSystemBarStyle()` restores the skin style when it ends. Service worker registration moved to 2.5 s after load (it downloads the whole app and competed with startup). Still open: self-hosted font files (needs the woff2 files from the user).
- **Measured (4x CPU throttle, Google Fonts blocked, 9 runs, medians; first tap = time to second frame):** Progress 121 -> 86 ms, Run 159 -> 96 ms, Settings 89 -> 66 ms, Plan unchanged (210 -> 209: its cost is paint/raster of the picture cards, not warmable while hidden). Splash ends about 60 ms later at 4x (1670 -> 1731 ms) because of the 450 ms minimum and the warm-up; at 1x the app is shown sooner (715 -> 596 ms).
- Tests: `tests/browser_test.py` gained 7 startup checks (logo present, splash removed, only Home visible, no leftover inline styles, tabs still switch, font link non-blocking, no page errors); the old "damaged data: user told" check waits for the 1.8 s notice (it was timing-flaky before).
- Cache `arya-v90`, About label v90.

## v91 — Run weather (2026-10-21; unit + headless browser tests with a mocked forecast pass; NOT run on a phone, real Open-Meteo and the Android location prompt untested)
- Decision: **Health Connect shelved.** The user has no watch or other app writing health data (phone only), so it would add almost nothing over the existing step sensor, and no existing Capacitor plugin was safe (ubie-oss `capacitor-health-connect` peers on Capacitor 5, no sleep, no de-duplicated totals; Capawesome's is paid and needs Capacitor 8; mley's `capacitor-health` Capacitor 6 support unverified). Revisit when a watch exists: write our own read-only Java plugin (Health Connect needs minSdk 26 and the Play "Health apps declaration"). Suggested order after weather: Supabase sync only if multi-device is wanted.
- New `web/js/features/weather.js` (loaded after widget.js, before boot.js; `ax-wx-card` is in the Home ORDER in `home.js`, after steps). A Home card: verdict (Good now / Best around 6 pm / Fair / Poor, with "tomorrow" when the best hour is after midnight), feels-like, rain chance, wind, up to two notes (storm, rain, heat, freezing, wind, UV). Tap opens a sheet: next 14 hours as score bars with feels-like and rain, °C/°F toggle, Refresh, **Turn off (forgets the location)**, Open-Meteo credit (CC BY attribution is required, keep it).
- Privacy: location is asked ONLY when the person taps "Turn on" (`navigator.geolocation`, Capacitor's WebChromeClient raises the Android prompt; the manifest already has location permissions). Stored rounded to 2 decimals (about 1 km) in `localStorage axWx` (NOT in `aryaApp2`, so never in backups or sync; a test checks the backup text). Coordinates are re-read at most every 6 h, otherwise the saved ones are used.
- Data: Open-Meteo `v1/forecast` (free, no key), hourly feels-like, rain chance and amount, wind, UV, weather code, 2 days, `timezone=auto`. 9 s timeout, cached up to 12 h (fresh for 45 min), refresh on app resume. Offline with no cache: a "tap to try again" card, never an error toast. The service worker does not touch cross-origin API calls (it only caches same-origin and Google Fonts).
- Scoring (`score()` in weather.js, pure, 19 unit tests in `tests/weather.test.js`): start 100; feels-like outside 7..17 C (heat 4 points per degree, cold 3); rain chance above 10 percent, rain mm, wind above 18 km/h, UV above 6; thunderstorm -60, snow -30, fog -10. Run window 05:00 to 21:00, looks 24 h ahead. Good >= 75 now, or best >= 70 later; Fair >= 50; else Poor ("a walk or indoor session is smarter", it never overrides the plan).
- States: invite (Turn on / Not now), on, slim "Run weather is off - Turn on" row (after Not now or Turn off). `window.AxWx` exposes the pure functions.
- Browser tests added (12): no prompt or storage before opt-in, verdict after opt-in, rounded location, not in backup, card position on Home, sheet credit, turn-off forgets location, offline retry card, no page errors.
- Not done on purpose: tying the verdict to today's plan (for example suggesting the walk-only option when a run day has Poor weather). Good next small step once the card is proven on the phone.
- Cache `arya-v91`, About label v91. This zip also contains the v90 startup files (cumulative).

## v92 — Run system: GPS accuracy, real step counts, run summary and run card (2026-10-21; unit + headless browser tests pass; Java compiled against hand-written Android stubs only; NOT run on a phone)
**Findings in the old code (fixed):** (1) native-engine runs saved steps = counted steps + distance/0.75 (`topup()` assumed JS had measured `sdist`, which only the web GPS path does), roughly doubling run steps; (2) while a native run was active and the screen on, `say()` returned early, so Jog/Walk/km voice only played in the background; (3) the Restart button did not reset the native engine; (4) raw GPS chords overcounted distance (simulation: +17% to +50% on noisy tracks).
- **GPS filter** (`native/java/RunTrack.java`, pure Java; same algorithm in `web/js/features/runcalc.js` `Track`, keep both in step): constant-velocity Kalman filter in local metres (noise = reported accuracy), first fix must be <=22 m, fixes >30 m dropped, anchor distance gate (max(4 m, 0.5 x accuracy)), stop detection from Doppler speed (only trusted from a speed channel that has shown >=1 m/s in the last 2 min), wild-fix rejection, straight-line bridge over gaps >25 s when <=4.5 m/s, and Doppler calibration: chord steps are scaled down (0.85..1, never up) to the integrated Doppler speed when the two agree within 70..115 percent. Simulation (tests/gps_sim.js, 40 runs per case): typical noise old +28% -> new -0.3%; noisy +50% -> ~0%; no speed channel +4.7%; speed stuck at 0 -1%. Java and JS give identical distance, point and drop counts on 60 simulated runs.
- **Native `RunService`**: uses `RunTrack`; hardware `TYPE_STEP_COUNTER` counts run steps (works with the screen off, pauses excluded; needs "Physical activity", `RunEnginePlugin` now asks for it too); `state()` adds steps, sens, gacc, gavg, goff, fx, fd, gap; GPS-off detection; km voice cue includes the pace of the last km (JS does the same in the foreground).
- **Page**: `engSync` takes `r.steps` when `r.sens` (then `TM.nsens`, phone-motion guess off); status line shows GPS accuracy / Finding GPS / Weak GPS / GPS is off; `topup()` returns the exact count for `nsens`, `max(count, dist/stride)` for native runs without sensor, old logic for the web path; web `onFix` uses `AxRun.Track`.
- **Run summary** (`runsummary.js`): opens after Save (and Progress > History > Summary, which also rebuilds older runs from route + totals): distance, time, avg pace, best km, steps, cadence, stride, pace-coloured route with km markers, per-km split bars, pace profile, jog/walk share, comparison with last run, "longest run" / "fastest km" badges, GPS quality note.
- **Run card** (`runcard.js`, replaces the old `shareCard`): 1080x1350, skin-aware, route by pace, big distance, time / pace / steps, split bars, one note.
- **Storage**: new per-plan `rsum` {day:[{t,d,s,st,jt,wt,km,pt,pp,ga,es,lv,lu,cd,sl}]} (max 10 per day). Export includes it, import validates it (`axCleanRsum`), schedule shift moves it, delete run and undo-save trim it. Existing keys untouched; old backups import as before.
- **Tests**: `node tests/runcalc.test.js` (16 checks), `python3 tests/run_ui_test.py` (stubbed RunEngine, full save flow, summary, card, validator, shift). `build.yml` still only runs `store.test.js`; add the new node test there when `ARYA_PAT` is handy.
- **Verify on the phone**: Settings > Run step line shows Physical activity allowed; a run shows "GPS good (N m)"; steps after a run are close to distance / stride (not double); compare distance with a known 400 m track lap; summary opens after Save; Share run card. If CI fails, suspects are `RunService.java` / `RunTrack.java` (compiled only against stubs).
- Cache `arya-v92`, About label v92.

## v93 (2026-10-21)
- Exercise animations are paused by default; each picture plays only after its Play pill is tapped (per picture, not remembered, no timers running otherwise). `PR.exAnim` is no longer read or written (kept in the backup key list so old backups import).
- Removed the top-right Start-today's-plan play button (`#ax-tgo`) and its handler; the Plan tab is still one tap away in the bottom bar. v93 includes everything from v92 in the same update.zip.

## v94 — Better notifications + merged v93 / build.yml (2026-10-22; Java compiled against hand-written Android stubs, NotifText unit-tested, node + browser tests pass; NOT built by real CI, NOT run on a phone)
- **Steps notification redesigned** (`native/java/NotifKit.java`, wording in `NotifText.java`): title `6,284 steps`, line `79% of 8,000 · 1,716 to go`, native progress bar to the goal, sub-text = streak (`4-day streak`) or `Today`, accent colour from the skin (green once the goal is hit). Expanded view adds km walked, today's plan (`Today: Lower body · 2 of 5 done` / `Rest day today`) and `Yesterday X · 7-day avg Y`.
- **Data source:** goal, stride, plan, streak and colours come from the widget JSON (pref `arya_widget`/`json`), so no new bridge. `widget.js` now also sends `stride` (= `strideM()`). If the JSON is missing or from another day the plan line is hidden and goal defaults to 8000, stride 0.75.
- **Staleness bug fixed:** the old code dropped any update inside a 5 s window and then stayed stale until the next step. `Svc` now uses a trailing throttle (Handler, 4 s) so the last value is always shown; day rollover also refreshes. Screen-on (`ACTION_SCREEN_ON` receiver) flushes the batched sensor events (`SensorManager.flush`) and refreshes, so the count is current when you open the shade.
- **Goal-reached alert:** one notification per day when the count crosses the goal while the service is running (own channel `arya_goal`, default importance; mute it in Android settings > Notifications > Goal reached). Never fires for an already-passed goal after a restart (`ga` pref stores the day it was handled). Positive-only: there is no "you are behind" nudge.
- **Icon:** new monochrome footprints vector `native/res/drawable/ic_stat_arya.xml` (copied by `tools/android-setup.sh`) is the small icon for steps, goal and run notifications. `capacitor.config.json` pointed LocalNotifications (daily reminder, web run) to `ic_stat_run`, which never existed, so Android showed its generic fallback icon; it now points to `ic_stat_arya`.
- **Run notification** (`RunService.notif`): `2.31 km · 6:12 /km · round 3` (average pace; `--` until 50 m), new icon and accent colour.
- **Test:** `tests/NotifTextTest.java` (run command in its header; not part of CI).
- **Merged:** v93 (animations paused by default, top-right play button removed) and the newer `build.yml` (release/debug variant, `com.arya.fit4`, AAB option, runcalc + weather + run_ui tests). The repo copy of build.yml was stale (`com.arya.fit3`, debug only, store.test only).
- **build.yml needs:** the 4 secrets `ARYA_KEYSTORE_B64`, `ARYA_STORE_PASS`, `ARYA_KEY_ALIAS`, `ARYA_KEY_PASS` (otherwise every release build stops on purpose), and the first release-signed app installs next to the old one as `com.arya.fit4` (export a backup first, import it in the new app). Emergency: Run workflow > variant `debug`.
- Unverified on a phone: look of the notification on OxygenOS 16, screen-on refresh timing, goal alert, dismiss behaviour (Android 14+ lets users swipe the foreground notification away; the next step update posts it again).

## v95 — Smart daily reminder + notification settings (2026-10-22; browser-tested with stubbed plugins, Java compiled against stubs, NOT run on a phone)
- **Smart reminder** (`remind()` in `run-extras.js`): instead of one repeating "Time to move", it schedules the next 7 days one by one (ids 9..15, one-shot `schedule.at`) with that day's workout name (`Lower body. Ready when you are.`). Skipped: rest days (`st["x"+i]==1` or no source day), days already fully ticked, and a time that has already passed today. Because only 7 days are ever scheduled, reminders stop on their own if the app is not opened for a week (no nagging). Re-planned when the app opens, when the time is changed, and when the app is left (`visibilitychange` in `widget.js`).
- **Settings > Voice & alerts**: new switches "Goal reached alert" (`PR.nga`, default on) and "Compact steps notification" (`PR.ncp`, default off). Both are in the backup key whitelist and in both toggle maps (`sheets-views.js`, `data-io.js syncPrefs`). The step goal itself is still edited in the Steps sheet (`PR.sg`).
- **Bridge:** `widget.js` payload now also carries `nga` and `ncp`; `NotifKit.Info` reads them (`goalAlert`, `compact`). Compact = no expanded text, same bar. A change reaches the notification on its next refresh (the payload is sent ~2.5 s after any save).
- **Test:** `tests/reminder_test.py` (added to the non-blocking `browser-test` job in build.yml).
- Unverified on a phone: that the 7 one-shot reminders fire on time with Doze (`allowWhileIdle` is set), and the look of the new switches in the settings sheet.

## v96 — Android back button fixed (2026-10-22; browser-tested with a stubbed App plugin, NOT run on a phone, NOT built by real CI)
- **Symptom:** back from any screen closed the app. **Cause:** the old guard in `core/lifecycle.js` (Step 8b) depended on an extra history entry pushed at startup without a tap; the WebView can skip such entries, so `goBack()` had nothing to pop and Capacitor exited. Also, after the first "Press back again" the guard was never re-armed.
- **Fix:** new dependency `@capacitor/app` (`package.json`, `^6.0.0`; `cap sync` registers it in CI). `web/js/features/backnav.js` listens to its `backButton` event, so Capacitor no longer decides by itself. Behaviour: close what is open (menu, settings sub-page, sheet, celebration, overlay, expanded run dock) -> from any tab go to Home (Plans -> Settings) -> on Home the first press shows "Press back again to exit", a second press within 2.2 s calls `App.exitApp()`.
- `lifecycle.js` now has one function `axBack()` (returns 1 when it handled the press) used by both the plugin listener and the old history popstate handler, which stays as a fallback if the plugin is missing and now re-arms itself after 2.2 s. `#gov` overlays without the hands-free exit button are now closed by back (before, nothing happened).
- A run in progress is never stopped by back (it only collapses the dock).
- **Test:** `tests/backnav_test.py` (in the non-blocking `browser-test` job).
- Unverified on a phone: that `@capacitor/app` installs and registers in CI, and the feel on Android 13+ gesture navigation.

## v97 — Minimized run panel layout (2026-10-22; checked in a 412 px browser viewport, from a phone screenshot)
- **Seen on the phone:** the run panel (`#dock`, not fullscreen) overlapped the floating bottom nav, and Pause was squeezed to "Pa" next to Restart / Save run time / Save & close.
- **Cause:** `.ax-dk:not(.ax-fs){bottom:calc(var(--ax-navh) - 1px)}` ignored that the nav floats `8px + safe-area` above the screen edge (`.ax-pbar` had been fixed for this, the dock had not). The buttons inside `.ax-dxp` (`display:contents`) did not get `flex:1`, so a wide font squeezed `#dpp`.
- **Fix (css/run-polish.css, appended):** the panel is a floating card (12 px side margins, 24 px radius) 8 px above the nav, scrolls if taller than the screen; all four buttons are equal columns (Pause slightly wider), 13 px, long labels wrap to two lines.
- Fullscreen run view (`.ax-fs`) is untouched.

## v98 — Smart week (coach) (2026-10-22; engine unit-tested, full flow browser-tested incl. break + auto-close cases; NOT run on a phone)
- **What:** reads everything the app knows and proposes the next 7 days, including a comeback after a break. Nothing changes until the person taps Apply; Undo restores the exact previous schedule and edits. Entry points: Home card above today's plan (shown after a break of 5+ days, in the last two days of a plan week, or when the plan is about to end; "Not now" hides it for the day) and Settings > Plan & exercises > Smart week.
- **Files:** `web/js/features/coachcalc.js` (pure engine, `AxCoach`, tests/coachcalc.test.js, in the blocking CI test job), `web/js/features/coach.js` (history gathering, preview sheet, apply/undo, Home card; tests/coach_ui_test.py in browser-test).
- **Modes (rules in `recommend()`):** `start` (no history), `restart` (28+ days off: 3 sessions, max 2 sets, run level 0), `comeback` (10-27 days: 3 sessions, -1 set, first session max 2 sets, run level -1), `easeback` (5-9 days: first session -1 set), `rebuild` (the week after a reset: full sessions, original sets, run level +1 toward the pre-break peak), `progress` (adherence >= 85% over the last 14 days and lifts not declining: +1 set on the first two exercises, run level +1 if the person ran recently), `hold` (50-85%), `lighten` (< 50%: one session and one set less, kind wording), `deload` (4 solid weeks in a row, never twice in a row). Adherence is measured since the last reset so a break never counts against the weeks after it.
- **How it writes:** only `plan.schedMap` (day -> source index; `(d % 7) + 7*level` keeps the weekday template and picks the run/walk interval level; `-1` = rest) and `plan.workoutEdits` (`{sets}` only; hand-made edits are never overwritten, coach edits are tracked in `plan.coach.owned`). `plan.coach = {log, owned, last, dismiss}`. The schedule extends past day 28 (ND grows) when the window crosses the plan end.
- **Reading history (important):** `axAutoClose()` turns every missed day into x=1 (rest) and any day with even one tick (a habit counts) into x=2, so `x` alone is never used. Activity = run/GPS/workout time, a ticked exercise (`e*`) or run (`j`), or a day closed by hand with nothing ticked. A strength day counts as planned even if auto-close made it "rest"; days the coach set to rest have no template and are not counted. Other plans only add "active that day" so a break is measured across plans.
- **Bug fixed on the way:** `grid()` in `core/plan-ui.js` built the calendar once and crashed when the plan length changed (the existing "insert rest day" had the same latent problem); it now rebuilds when `children.length !== START.getDay()+ND`.
- **Known limits:** circuit days cannot have fewer sets (the sheet says "one round fewer"); the run distance goal (JKM) is plan-wide so only the interval level changes; the backup import (`axCleanSched`) only keeps schedules longer than the plan, so after a restore the coach's rest conversions may be lost while the sets edits stay; run level uses the active plan only. Not medical advice (stated in the sheet).
- Unverified on a phone: feel of the card/sheet, and whether the rules suit the person's real weeks. Tune the thresholds in `coachcalc.js` (all in `recommend()`).

## v99 — Choose the voice engine and voice (natural / open-source voices) (2026-10-22; Java compiled against stubs, picker browser-tested with a stubbed plugin; NOT heard on a phone, NOT built by real CI)
- **Why:** every cue used the phone's default text-to-speech (robotic). Android lets any installed TTS *engine* provide the voice, and open-source neural engines exist (SherpaTTS on F-Droid, GPL-3.0; VoxSherpa TTS; both run Piper-style voices offline and register as a system engine). So the app now lets the person pick engine + voice + speed instead of bundling a model (a model is 50-100 MB, has its own licence, and would still not cover custom exercise names).
- **Native:** new `native/java/VoiceKit.java` (pref `arya_voice`: `engine` package name, `voice` name, `rate` percent 50-160, default 95). `create()` binds the chosen engine and **falls back to the phone default** if it is missing or fails, `apply()` sets language/voice/speed/pitch and the navigation-guidance audio usage, `speak()` ducks music with audio focus while a cue plays and releases it afterwards, `list()` returns installed engines and the bound engine's English/Hindi/Gujarati voices. `RunEnginePlugin` (app open) and `RunService` (screen off, reads the pref when a run starts) both use it. New plugin methods: `voiceList`, `voiceSet({engine?,voice?,rate?})` (a new engine is re-bound and its voice resets), `voiceSettings` (phone TTS settings), `openUrl` (only f-droid.org / github.com). The manifest already had the `<queries>` entry for `TTS_SERVICE` that Android 11+ needs to see other engines.
- **Web:** `web/js/features/voice.js` + a block under Settings > Sound & feedback (hidden outside the phone app): engine select, voice select (offline voices first, English before Hindi/Gujarati, internet voices last), speed slider, "Phone voice settings", "Get SherpaTTS (free)". Test with the existing Play button.
- **Wording:** cues are fuller sentences for better intonation: `Jog now.` / `Walk now.` (native and web), `2 kilometers. Last kilometer, 6 minutes 10 seconds.`; the test phrase now includes a kilometer announcement.
- **Test:** `tests/voice_ui_test.py` (browser-test job).
- **Backlog if the system-engine route is not enough:** (1) pre-rendered clip pack: a `tools/` script runs Piper on a PC for the closed phrase set (Jog now, Walk now, numbers, units, library exercise names), ships ~1-2 MB of audio, native plays it with SoundPool; custom names fall back to TTS. (2) sherpa-onnx inside the APK (heavy: +30-90 MB, JNI, licences).
- Unverified on a phone: how the cue sounds with a neural engine (first cue after a long pause can be slower while the engine wakes), music ducking on the person's player, and engine switching on OxygenOS.


## v93b — build.yml re-issued on the latest repo (2026-10-22)
- The live `build.yml` was STILL the debug-only file (default fit3, no release step); the v93 release version had not been pasted. Re-issued as `.github/workflows/build.yml`: release-signed APK (default `com.arya.fit4`, inputs `variant`, `aab`), needs the 4 `ARYA_*` secrets, fails instead of falling back to debug.
- CI tests are now globbed: the blocking job runs every `tests/*.test.js`; the informational job runs every `tests/*_test.py`. New tests are picked up without editing the workflow. `tests/NotifTextTest.java` is still manual (the runner/container has no javac check).
- iOS: not built. Needs a macOS runner, `@capacitor/ios`, Swift versions of the Android-only plugins (steps, run engine, notifications, voice) and an Apple Developer account (99 USD/year) to sign an installable IPA.

## v100 — Auto-pause rewrite + live route map (2026-10-22; unit + simulated-clock browser tests incl. native-engine stub; NOT run on a phone)
- **Why auto-pause was bad:** it paused when no GPS point had been *accepted* for 9 s. The tracker only accepts a point after >=4 m (or 0.5x accuracy) of travel and treats Doppler speed <0.4 m/s as "still", so a slow walk gets a point every 10-25 s. Weak GPS (>30 m) also counted as "not moving". While paused, fixes were thrown away and the filter restarted, so every false pause also lost the metres walked until resume (needed >8 m). Reproduced: old build paused during a 0.4 m/s walk and counted 21.8 m of 48 m.
- **New:** `AxRun.Move` (in `runcalc.js`). Movement = positive evidence only: Doppler >=0.3 m/s, displacement beyond GPS noise (>=max(4 m, 0.6x accuracy)), or step-counter increase. Still = >=20 s (`Move.stillMs`) with no evidence AND good GPS fixes arriving (<=10 s old). Weak/missing GPS never pauses. Resume = 2 evidence events within 6 s. While auto-paused the tracker keeps running, so slow walking is credited; manual pause is unchanged.
- **Two paths:** web/GPS-in-page runs feed `Move` from `onFix`. Native-engine runs (the APK; GPS is processed in Java, `onFix` never runs) now start a raw-GPS watcher `apWatch()/apFix()` in `timers-run.js`, only to feed the detector and resume the engine. In native mode the few metres walked during the 2-3 s resume detection are not credited (the engine drops fixes while paused; Java was not touched because it cannot be compiled here). Screen off: the page is throttled, so auto-pause simply does not trigger (it never pauses by mistake).
- **Live map:** `js/features/livemap.js` adds `#ax-lmap` under the GPS line in the run dock: offline SVG of the last ~1.2 km, your position dot (grey + "Paused" when paused). No tiles/network; a tile basemap would need a provider/key.
- Tests: `tests/automove.test.js` (11), `tests/autopause_ui_test.py` (web + stubbed native run). Tune `Move.stillMs` or the 0.3 m/s Doppler threshold if the phone disagrees.
- SW cache `arya-v100`.

## v101 — Strava-style PRs and best efforts (2026-10-22; unit + real-browser tested; not run on a phone)
- `AxRun.bestEfforts(pts)` (runcalc.js): fastest time over 400 m, ½ mile, 1 km, 1 mile, 2 mile, 5 km, 10 km, 15 km, 10 mile, 20 km, half marathon, marathon inside one run. Exact for the piecewise-linear time/distance curve (window start or end sits on a point), pauses excluded with the same rule as `splits`, speeds >9 m/s dropped as GPS errors. `summarize()` stores it as `be:{meters:seconds}` (<200 bytes); `axCleanRsum` keeps it on import.
- `js/features/prs.js` (`AxPR`): all-time ranking across every plan. Rank 1 = "PR" (gold, with the gain over the old PR; "First" if nothing to compare), 2nd/3rd medals. Runs saved before v101 have no `be`: it is rebuilt from their saved route when the saved-summary and route lists line up, or from the route alone (route points are thinned to 250, so old efforts are approximate). Nothing is written back.
- UI: run summary gets "PR 5 km" pills and a Best efforts section (also on the "Run saved" sheet); Progress gets a Best efforts card (1 km, 1 mile, 5 km, 10 km first) with an "All best efforts" sheet showing the top 3 per distance.
- Rank is all-time, not "at the time of the run": an old run that has since been beaten shows 2nd/3rd instead of PR.
- Tests: `tests/efforts.test.js` (8), `tests/prs_ui_test.py`. SW cache bumped.

## v102 — GPX export (2026-10-22; unit + real-browser tested incl. a real file download; not run on a phone)
- `js/features/gpx.js` (`AxGpx`): `build(pts,{name,desc})` makes GPX 1.1 (`<type>running</type>`, ISO `<time>` on every point, a new `<trkseg>` after a pause = gap >25 s with <0.5 m/s), `exportRun(D)` sends it through `axOut()`: native = Android share sheet (pick Strava, Drive, Files...), web = file download, last resort = clipboard.
- Run summary sheet: "Export GPX" button, only when the run has a saved route (>=5 points). Exports the LAST route of that plan day, like the summary itself.
- Saved route resolution doubled: `saveRoute` keeps up to ~500 points (was ~250); both import cleaners in `data-io.js` accept up to 520 points (they would otherwise cut the end of a route). Storage cost ~18 KB per run; the daily backup in store.js is skipped above 1.2M characters, so watch total size if you do many runs per day.
- Not included: elevation (`<ele>`): altitude is not recorded yet (needs `RunTrack.java`/`RunService.java`, which cannot be compiled here), heart rate, bulk export of many runs.
- Tests: `tests/gpx.test.js` (7), `tests/gpx_ui_test.py` (downloads and parses the real file).

## v103 — Run share card upgrade (2026-10-22; real-browser tested + visually checked; not run on a phone)
- "Share run card" now opens a preview (`#gov`) with three formats: **Post** 1080x1350 (as before), **Story** 1080x1920 (content kept between y~270 and y~1634, clear of Instagram's top/bottom UI), **Sticker** (transparent PNG: white text with soft shadow, outlined pace-coloured route, for putting over a photo). Last choice is remembered until the app restarts. Share sends the chosen canvas through the existing Filesystem+Share path (native) or Web Share / preview (browser). `AxRunCard.draw(D,mode)`, `AxRunCard.send(cv,name)`.
- New on every format: gold **PR chips** (largest 1-2 efforts that beat an older best, from `AxPR`), a time-of-day title ("Evening run" from `t - s`), a slow->fast legend for the route colours, and a "New PR · 5 km in 28:20 (−0:50)" footer when there is a PR.
- Layout is parameterised (`T0` shift, `PH0` panel height); tiles, splits and footer follow the panel, so changing one number re-flows the card.
- Test: `tests/runcard_ui_test.py` (sizes, transparent corner, PR chip pixels on post and story, no chip on a slower run, preview flow).

## v104 — Onboarding + personalised plan: BLUEPRINT ONLY (2026-10-22; docs, no code changed)
- New folder `docs/onboarding/` (read `00_START_HERE.md` first): UX spec (questions), data model (`APP.profile`, schema 2), level tables + weak-point rule, plan engine design, exercise DB (`exercises.seed.json`, 108 exercises, validated), 12-step roadmap (S0-S11) with acceptance criteria, and a prompt to hand to another AI.
- Core idea: a level 0-5 per movement pattern (push, pull, legs, core, run) from benchmarks (push-ups, pull-ups, squats, plank, run), a weak pattern = 2+ levels below the strongest (50 push-ups vs 5 pull-ups -> pull is weak and gets priority), plan from a pure tested function that outputs the existing `arya-plan` format.
- Nothing is implemented yet. Next: S0 (profile storage + schema 2 migration).

## v105 — Onboarding S0: profile storage, schema 2 (2026-10-22; unit + real-browser tested; no UI yet)
- `AXSCHEMA` 1 -> 2 (`core/store.js`): migration `profile` adds `APP.profile = null`; `axStamp` gives fresh data `profile:null`. Old data keeps a `premig` copy as before.
- New `core/profile.js` (after `store.js`; also runs in node): `axCleanProfile(raw,{draft})` whitelists every field per `docs/onboarding/02_DATA_MODEL.md` (enums, clamps, out-of-range body numbers -> null, lists deduped/capped, name stripped, unknown keys and `__proto__` dropped; a finished profile needs goal, env, levels, days, mins, weeks or it is rejected; missing levels filled with 0). `AxProfile`: `clean`, `get()` (finished profile or null), `set(raw)` (clean, store, `save()`, clear draft), `draftGet/draftSet/draftClear/draftStep` (`localStorage aryaOnboardDraft`, separate from `APP`).
- Backup: `pack()` now writes `profile`; `doImport` applies `axCleanProfile(d.profile)` when valid, otherwise keeps the current profile (older backups without one never wipe it). Newer-schema backups are still refused.
- Tests: `tests/profile.test.js` (13), `tests/profile_ui_test.py`; `store.test.js` and `browser_test.py` updated for schema 2. SW cache bumped and `profile.js` added to the shell list.
- Next: S1 exercise DB (`exdb.js` + `data/exercises.json` from `docs/onboarding/exercises.seed.json`).

## v106 — Onboarding S1: exercise DB (2026-10-27; unit tested; no UI yet)
- New `js/features/exdb.js` (`AxExDb`, also node): 108 exercises inline (no fetch, so it works offline and at first paint). `all`, `byId`, `byName`, `ladder(g)`, `filter({env,equip,avoid,p,g})`, `ladders`. Home = body/chair + owned gear only; gym = everything; `avoid` drops exercises tagged with that body area.
- Seed fixes (also in `docs/onboarding/exercises.seed.json`): `squat-jumps` L3 -> 2 and `nordic-curl-negatives` L5 -> 4 so every ladder has no gaps. Levels still need the S10 QA pass.
- `index.html` loads it after `profile.js`; SW cache `arya-v106`, `exdb.js` added to the shell list. Test: `tests/exdb.test.js` (8).
- Next: S2 level engine (`features/levelcalc.js`).

## v107 — Onboarding S2: level engine (2026-10-27; unit tested; no UI yet)
- New `js/features/levelcalc.js` (`AxLevel.calc(profile)`, also node): levels 0-5 for push/pull/legs/core/run from `profile.bench` using the tables in `docs/onboarding/03`; skipped benchmarks use experience (beg 1, int 2, adv 3) and are listed in `skipped`; gym lifts (kg / body weight) raise a level by at most 1 (squat and deadlift -> legs, bench and OHP -> push; deadlift mapping is my choice); knee in `protect` lowers legs by 1.
- Weak points: level <= top-2 or picked in `want`, max 2, biggest gap first; run only when goal is run. Note: for the owner example (push 5, pull 2, legs 3, core 3) the literal rule also flags legs/core (gap 2), so `weak` is `["pull","legs"]`; pull is always first. Spec 03 text says only pull; S3/S5 can show just `weak[0]` as the headline if wanted.
- Also returns `start` (levels one lower for the ramp-in week 1) and `caps` (gentle: max 2 sets, long rest, no max tests; under 18: no max/weighted tests, 12-set session cap).
- `index.html` loads it after `exdb.js`; SW cache `arya-v107` with the file in the shell list. Test: `tests/levelcalc.test.js` (9).
- Next: S3 plan engine (`features/plangen.js`).

## v108 — Onboarding S3: plan engine (2026-10-27; unit tested incl. the real vplan(); not run in a browser or on a phone; no UI yet)
- New `js/features/plangen.js` (`AxPlanGen.build(profile, AxExDb, {now, notes, athlete})` -> `{plan, gen, notes}`, also node). Pure and deterministic (`now` is injected). `opts.notes` = built-in `{name:{reps,note}}` map (builder.js `notes()` already builds it from T0); S6 must pass it so built-in exercises keep their notes.
- Pipeline as in `docs/onboarding/04`: levels (`AxLevel`) -> split by days (2 Full A/B, 3 A/B/A, 4 Upper/Lower x2, 5 PPL + Upper/Lower, 6 PPL x2) -> weekly sets per pattern (beg 7 / int 10 / adv 14, muscle +2, strength -1; weak x1.4 up to +4, taken from the strongest pattern, never below 6) -> exercise per slot (ladder step from week-1 level, variety, built-in picture bonus, equipment and protected areas filtered) -> session budget (20 min 8 sets ... 60 min 24, under 18 cap 12) -> pull sets >= 0.8 x push.
- Weak pattern goes first in its sessions; if days >= 3 it also gets short 2-set practice slots until it appears in 3 sessions. Run goal (days >= 4) turns one strength day into an "Easy run" day (days 2-3 keep all strength days); fat loss adds one circuit day unless days = 6. Run plan reuses builder `intervals`. Gym lifts: "Start about X kg" (60% of the entered weight) on barbell squat/bench/deadlift/OHP style exercises, otherwise "find a weight for 10 reps, 2 left in the tank".
- Not doable in the `arya-plan` format: per-week set ramps (+1 set at weeks 3 and 5). The plan is one weekly template; light weeks are 4/8/12 as in builder, and Coach adjusts from week 2. Reps are generic by level unless a built-in note gives them (S10 content QA).
- Tests: `tests/plangen.test.js` (10): owner example, deterministic, 2-6 days, run, fat loss, safety, gym, notes, dates, and 500 random profiles through the real `vplan()` (every exercise exists, no protected area, equipment, sets <= budget, pull >= 0.8 push, weak >= 3x, rest day, < 50 ms). A Playwright check (`plangen_ui_test.py`) is not written yet.
- Next: S4 wizard shell + screens 0-3 (`features/onboard.js`).

## v109 — Onboarding S4: wizard shell + screens 0-3 (2026-10-27; browser tested in Chromium, not on a phone)
- New `js/features/onboard.js` (`AxOnboard`): full-screen overlay `#ax-ob` (z 9000, below the splash), one question per screen, progress bar, Back, Skip, big tap targets, labels on every control, strings in one `STR` object. Screens: 0 Welcome (Start / Skip, use a standard plan), 1 You (name, units, height, weight with +/- steppers and keyboard, age band, sex, under-18 note), 2 Health check (No / Yes / Not sure; Yes and Not sure -> `health:"check"` + doctor note), 3 Goal (main + optional extra, extra can't equal main). After screen 3 a temporary "Saved, rest in the next update" screen with Close.
- Draft: every answer calls `AxProfile.draftSet({...,step})`; `open()` resumes the draft and step (capped at 3 until S5). Answers are stored metric (imperial typed in ft/in/lb is converted). Skip defaults: you -> empty, health -> `check` (safe), goal -> `general`.
- Android back: `lifecycle.js axBack()` calls `AxOnboard.back()` first (step back, or close on screen 0; the draft is kept).
- First-run trigger exists (`isFresh()`: no profile, not skipped, one plan, no activity keys; `x<n>` keys are auto-closed past days, not activity) but `AUTOSTART=false` so fresh installs do NOT see the wizard until S6 can create a plan. S6 flips it to true. Until then it opens only via `AxOnboard.open()` (console / tests).
- `index.html` loads it after `plangen.js`; SW cache `arya-v109`. Test: `tests/onboard_ui_test.py` (28 checks incl. resume, units conversion, Android back, skip defaults, 360 px layout, 48 px buttons). Existing `backnav_test`, `profile_ui_test`, `browser_test` still pass.
- Next: S5 screens 4-8 (experience, where + equipment, benchmarks, weak points + protect, schedule) in `onboard.js`; raise the step cap from 3 and `TOTAL` stays 9.

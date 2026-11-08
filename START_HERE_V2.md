# START HERE: AERUNO (formerly Arya Fit) V2 briefing (written for an AI that has never seen this project)

Repo state: **v139** (service-worker cache `arya-v139`, About shows `AERUNO · v139`). Public name is now **AERUNO** with the AF monogram (see `docs/brand/README.md`); internal codenames `arya`/`ax-`/`com.arya.fit`/`aryaApp2` are intentionally unchanged. Briefing written 2026-11-06, rebrand added 2026-11-07.

## 0. The owner and the ground rules (read first, they save everyone's time)
- The owner (Dhruv) works **only from an Android phone**. No PC, no terminal, no unzipping over a folder. Everything reaches him as a zip uploaded through the GitHub website.
- **Tokens/usage are limited and he has been burned by wasted work.** Rules that follow from that:
  1. If a request is ambiguous or the approach differs from what he asked, **say so before building**, in 3-5 lines, and let him choose. (Example of what went wrong: he asked to use the GitHub project `liquid-glass-studio`; it cannot refract live app content; an AI built its own substitute without asking first. He rejected it.)
  2. If he says "copy this library", **copy the library's real code** (check the licence, add credit). Do not write your own version and call it the same thing.
  3. Never claim something works unless you ran it. Say plainly what you could not verify (real phone, GPS, voice, battery).
  4. Short replies: what changed, what to check on the phone, what is next. Do not read `docs/HANDOFF.md` whole (175 KB): read only the last ~60 lines.
- The app is **offline, private, bundled**: no CDN, no network fonts, no analytics, no framework, no build step. Plain ES5-style classic scripts and plain CSS.
- Do not touch the "engines" (plan generator, level/coach/progression/run calculators, store, profile and any file that has a node test). V2 is a **presentation layer**.

## 1. What the app is
Arya Fit: an offline fitness PWA (plan generator, workouts with exercise pictures, run/walk intervals with GPS, progress, coach, voice, backups), shipped as an Android APK built with Capacitor (`capacitor.config.json`, `native/`, `signing/`). The owner runs the APK on an Android phone, so the engine is **Chromium/Android WebView**. Code lives in `web/` (index.html, sw.js, `js/core`, `js/features`, `js/ui`, `css`). Views (sections): `#ax-v-home` (Today), `#ax-v-plan`, `#ax-v-timers` (labelled Run), `#ax-v-prog` (Progress), `#ax-v-set` (Settings hub), `#ax-v-plans`. Navigation is `go('home'|'plan'|'timers'|'prog'|'set'|'plans')`. V1 settings builder: `web/js/ui/settings.js` (exports `window.axSettingsHub.show(key)`).

## 2. What V2 is
V2 is a complete visual rebuild (cinematic, dark-first, poster typography, glass controls) layered **on top of** the old UI (V1). It is switched by `html.v2`. With V2 off the app must look exactly like before. **V1 is the MAIN UI. V2 is an opt-in BETA** (owner decision, v138): new installs start on V1, there is no "try the new look" popup, and anyone who had V2 only because it used to be the default was moved back to V1 once (`PR.v2Rst`). Users turn V2 on in Settings > Appearance > "New look (beta)" (`#t-v2`). V2 may become the default again only after the optimisation work in TODO A0 is done and the owner approves.

Switch and API (`web/js/ui/v2-core.js`): `AxV2.setEnabled(true|false)`, `AxV2.apply()`, `AxV2.setTheme`, `AxV2.setFx`, `AxV2.setAccent`. Preferences live in the global `PR` object, saved with `save()`: `PR.v2` (1/0), `PR.v2Theme` (`dark|light|system`), `PR.v2Liquid` (`0` = glass off), `PR.v2LiquidP` (object of changed glass parameters).
Attributes on `<html>`: `class="v2"`, `data-theme="dark|light"`, `data-fx="full|lite|solid"` (effects tier), `data-liquid="1"` (refracting glass active), `data-skin` (V1 skin: oldmoney, modern, professional, midnight, sunset, classic).

### File map (all V2 code is new files; V1 files were barely touched)
| File | Role |
|---|---|
| `js/ui/v2-core.js` + `css/v2/tokens.css` | AxV2 API, theme/fx/accent, design tokens (`--v2-bg --v2-surface --v2-surface-2 --v2-text --v2-text-2 --v2-line --v2-accent --v2-accent-ink ...`) |
| `js/ui/v2-shell.js` + `shell.css`, `components.css` | floating nav pill + collapsing on scroll, round buttons, mini-session pill, Today avatar + popover, host `#v2-shell-controls` |
| `js/ui/v2-today.js` + `today.css` | Today hero (poster title + editorial italic last word), cards, coach row (uses a PROXY button; real `#ax-coach-open` stays in Settings) |
| `js/ui/v2-session-run.js` + `session-run.css` | Plan day session hero (exercise picture, name, big number), Run screen/dock/sheets overrides, "Close day" bar offset |
| `js/ui/v2-plan.js` + `plan.css` | Plan view (week strip, All days, plan tools) |
| `js/ui/v2-progress.js` + `progress.css` | Progress view |
| `js/ui/v2-exercises.js`, `v2-settings.js` + `exercises-settings.css` | exercise discovery over the add-exercise sheet; Settings hub grouping, search, appearance controls, onboarding styling |
| `js/ui/v2-polish.js` + `polish.css` | P7: one-time "try the new look" introduction, global accessibility labels (aria-label on unlabeled buttons/inputs), light-theme and onboarding contrast fixes |
| `css/v2/bridge.css` | **Root-cause fix**: maps every V1 skin variable (`--bg --card --ink --mut --line --blue --hero --bar --glass --gline --cell`) onto V2 tokens under `html.v2`, sets html/body background and `color-scheme`. Loaded late. |
| `js/ui/v2-liquid.js` + `css/v2/liquid.css` | Real refracting glass for small floating controls. Engine functions are **copied verbatim** from `github.com/archisvaze/liquid-glass` (MIT; licence in `docs/licenses/`, credit in `docs/THIRD-PARTY-NOTICES.md`). Our code is only the wiring (per-size SVG filters, targets, toggle). Public API `window.AxLiquid` (`set, sync, supported, isOn, params, defaults, presets, setParam, preset, reset, matches, refresh, rebuild`). Chromium only. |
| `js/ui/v2-glass-studio.js` + `glass-studio.css` | Settings > Glass studio page (live preview, presets, sliders) and the Settings hub upgrades (2x2 quick toggles, tinted icon tiles, sticky sub-page headers) |
| `js/ui/v2-type.js` + `css/v2/typography.css` + `fonts.css` | Typography unification (see section 5) |
| `web/v2-kit.html` | design kit page used during the rebuild |
Load order matters: everything is a classic `<script>`/`<link>` in `web/index.html`, and **every new file must also be listed in the `SHELL` array in `web/sw.js`** (offline cache); `python3 tools/check-web.py` enforces this.

Fonts (bundled, Latin subset only): `Arya UI` = Inter (files for 400 and 700 only; weights 400-500 use the 400 file, 600-800 use the 700 file), `Arya Display` = Big Shoulders Display 900 (weights 800-900), `Arya Editorial` = Instrument Serif italic 400. There is no medium/semibold, which is why body text looks flat.

## 3. How work is tested
- Static: `python3 tools/check-web.py` (run from the repo root). Node: `for t in tests/*.test.js; do node $t; done`.
- Browser: `python3 tests/<name>_test.py` (Playwright + Chromium; each test starts its own `http.server`; V2 tests use ports 8973-8976). Run in small batches; `boot_ui_test.py` and `browser_test.py` need 100-170 s limits. `tests/reminder_test.py` fails on every tree (see TODO B1).
- Playwright tips: V2 nav collapses on scroll and intercepts clicks, so navigate with `page.evaluate("go('plan')")`; the demo plan runs 4 Oct to 31 Oct 2026 so fake the date with an init script (class D extends Date, offset from `Date.now()`); backdrop-filter and SVG filters DO render in headless Chromium; use `device_scale_factor=2` for screenshots; view at 360x800 (phone).
- New V2 tests to copy as templates: `v2_shell_test.py`, `v2_restday_test.py`, `v2_liquid_test.py`, `v2_glass_studio_test.py`, `v2_type_test.py`.

## 4. How work is delivered to the owner
- Deliver ONE file named **`update.zip`** with only changed/added files, paths from the repo root, **no wrapper folder** (build it with Python `zipfile`). He uploads that single file to the repo root on github.com; the workflow `.github/workflows/apply-update.yml` unpacks it, commits, pushes, and `build.yml` builds the APK. Files listed in `DELETE.txt` inside the zip are deleted.
- `.github/` files inside a zip are skipped unless the repo secret `ARYA_PAT` exists (classic token with `repo` + `workflow`). Do not rely on changing workflows.
- GitHub sometimes answers the push with `Internal Server Error` (HTTP 500). That is transient: re-run the job, or send a smaller delta zip.
- Every delivery: bump the cache name `V` in `web/sw.js`, update the About string in `web/js/ui/settings.js` (`Arya Fit · vNNN`), list new files in `index.html` AND `SHELL`, append a dated entry at the END of `docs/HANDOFF.md`, run all tests, and answer in about 5 lines.
- When he needs to share the whole project with another AI he gets the whole repo zipped with one wrapper folder `Arya-Fit-app-main/`.

## 5. Typography state (what exists, what is missing)
Poster style = `Arya Display` uppercase for titles/headings/big numbers + `Arya Editorial` italic accent on the LAST word of a title. Applied to: Today hero, Today/Plan day titles (`.ax-dayx h2.ax-h2`, `.ax-home-session-title h2.ax-h2`, accent via `v2-type.js`), group headings `h3.ax-gh`, session hero name/number (`.v2-session-lockup`), Today count and section heads. Selectors must be ID-level (`html.v2 body #ax-v-plan ...`) with `!important` because `session-run.css`/`today.css` contain ID rules. Everything else (lists, cards, body text) is still plain Inter 400/700.

## 6. Bug classes we already hit (do not repeat)
1. **V1 cream leaking into V2.** V1 skins + `html.gls .ax-card{background:...!important}` + skin variables paint cream cards with white text. Do NOT patch class by class: fix at the variable level (`bridge.css`), and when you must override, use `html.v2 body #id .x` specificity with explicit background, color AND font-family.
2. **MutationObserver loops hang the whole app.** A rest-day fix removed the session hero, which re-fired the observer, which re-inserted the hero: infinite loop, app froze on load. Also: never run heavy callbacks on `<html>` class mutations (it broke `browser_test`). Make observers idempotent and compare state before acting.
3. **Never reparent V1 nodes that V1 code looks up by id.** Moving `#ax-coach-open` into Today stopped Settings from creating its "Personalise my plan" row. Use proxy buttons that call the real element.
4. **Hook both** `AxV2.apply` and `go()`, and re-enhance after V1 re-renders via `innerHTML` (V1 re-paints the Settings hub, day card and week strip). Internal calls bypass `window.go` wrappers.
5. **Layering:** global sheet `#ax-sh` z-index 120 (scrim 119); fullscreen run dock `#dock.ax-fs` inset 0, z 95; floating dock must sit above the mini pill (`body.td`); "Close day" bar `.ax-pbar` bottom offset 108px to clear the nav pill.
6. **Safe areas:** `:root` has padding for the status bar, so `<html>`'s own background shows under the fade (it was cream). `bridge.css` sets html/body background.
7. **Only some font weights exist** (see section 2); set `font-synthesis:none` and do not request unbundled families.
8. **Date-dependent demo plan** makes tests and screenshots look empty after 31 Oct 2026: fake the date.
9. **Tests depend on ids and visible text.** Keep ids; V2 must not rename V1 elements.
10. **Process:** do not build before confirming an ambiguous approach; do not invent a substitute when asked to copy something; say what is unverified.

## 7. TODO LIST (prioritised; "AC" = acceptance criteria)
### A0. Gate for making V2 the default again (owner: "V2 is not ready and not optimised enough")
Do not flip the default (`web/js/core/sheets-views.js` fresh-install block + the `v2Rst` migration in `v2-core.js` + the early class script in `index.html` line 5) until ALL of: (a) measured smooth scrolling and no jank on a mid-range Android phone with glass on and off; (b) battery/CPU cost of SVG-filter glass and sheets acceptable, or glass auto-disables on weak devices (`data-fx` tiers); (c) every screen finished and consistent (items A1, A2, B3, B5, C below); (d) cold-start time not worse than V1; (e) owner signs off on his phone. The V2 tests opt in with `v2on(pg)`; `tests/v1_default_test.py` guards the default and the one-time migration, update it when the default changes.

### A. Requested by the owner, not done yet
- **A1 Glass quality (owner: "needs improvement, later").** Today the nav pill, round buttons, avatar, mini pill and popover use the archisvaze engine with the demo's default numbers (made for a 300x200 panel). Work: (a) tune bezel/thickness/blur for small controls (pill ~254x64, circles ~56) so it reads as iOS-style glass; (b) page text behind the nav pill stays too crisp/competes with the tab labels: improve legibility (blur ordering, tint, or per-element presets); (c) measure cost on a mid-range Android phone, throttle `AxLiquid.rebuild` during slider drags, cap target count; (d) verify light theme glass; (e) decide whether sheets/toasts/cards should get it (heavier, riskier); (f) keep frosted fallback for non-Chromium. AC: owner approves on his phone; `v2_liquid_test.py` and `v2_glass_studio_test.py` pass.
- **A2 Typography (owner: "cool but not totally").** (a) Body/list text only has Inter 400/700: add a variable font (Inter, Geist or Manrope, all OFL) bundled as woff2 (the owner must supply the files; sandboxes have no internet), update `fonts.css`, `SHELL`, `check-web.py`; (b) Typography settings page like Glass studio (text size S/M/L, title style poster/clean/serif, number style, live preview, saved in `PR`); (c) respect the Android system font scale; (d) audit EVERY screen for plain-vs-poster consistency: Run/timers, Progress sub-tabs (Body, History, Badges), Exercises library and detail, Plans, Settings sub-pages, sheets, drawer, onboarding; (e) no text below 12px, tabular numerals for stats/timers; (f) light-theme check. AC: `v2_type_test.py` extended to those screens; owner approves.
- **A3 Naming (spec locked rule 7).** The spec forbids Apple trademarks in the UI. The UI currently says "Liquid glass" (Settings, quick toggle) and a preset "iOS 26". Ask the owner, then rename (e.g. "Glass effects", preset "Default"). Code comments may keep the names.

### B. Known bugs and tech debt
- **B1** `tests/reminder_test.py` fails on every tree because it assumes a current demo plan. Fix by using a fixed fake date or generating the plan relative to today.
- **B2** The toast "Auto-closed N past days" appears at every boot in the sandbox (expired demo plan). Check on a real install that it appears once, and not on every launch.
- **B3** After `AxV2.setEnabled(false)` about 16 hidden `.v2-*` nodes/classes remain (Settings group titles, `v2-settings-card`, etc.). Spec says zero V2 DOM when off. Clean up on the `apply` hook.
- **B4** About version string is hand-edited in `settings.js`; derive it from the build (see `web/js/build-info.js`/SW cache name).
- **B5** Possible leftover V1 serif (Georgia) on screens other than Today (scan computed `font-family` for Georgia/serif in every view and skin).
- **B6** `boot_ui_test.py` is slow and `browser_test.py` flaked once; raise timeouts or find the cause.
- **B7** Docs out of date: `CHATGPT_START.md` (mentions arya-v120, "unzip over your project"), `docs/v2/PROMPT_P6_P7.md` (finished), `V2_UI_SPEC.md` (says V2 default OFF). Refresh or delete.
- **B8** `web/v2-kit.html` is still shipped; decide whether to keep it in the APK.

### C. QA never done on a real phone (the sandbox cannot test these)
GPS runs and live map under V2, voice/hands-free, step counter card, widgets/notifications, backup import/export, fresh-install onboarding with each skin, every view in light theme (contrast scan), tap targets >= 44px, focus rings, `prefers-reduced-motion`, TalkBack, tablet/landscape rules (`min-width:700px`), low-end device performance and battery with glass on, `data-fx` auto tiers.

### D. Release
Final QA, then APK build/signing (`build.yml`, `signing/`). Decide on version naming and release notes (`docs/RELEASE_NOTES.md`).

## 8. Reading order for you
1. This file. 2. `AGENTS.md` and `AI_BRIEF.md`. 3. `docs/v2/V2_UI_SPEC.md` section 0.5, 1 (locked rules), 6 (performance). 4. `docs/v2/DESIGN_DECISIONS.md`. 5. The last ~60 lines of `docs/HANDOFF.md` (newest entries at the bottom). Then grep, do not open `web/index.html` or `web/css/base.css` whole.

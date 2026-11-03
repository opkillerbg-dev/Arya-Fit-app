# Brief for the next AI: Arya Fit

Give this file together with the latest repo zip. Read this first, then the files it points to.

## What it is
Arya Fit: a workout app (plain JavaScript in `web/`, packaged as an Android APK with Capacitor by GitHub Actions). Everything stays on the phone. The owner wants short replies and low token use.

## State: v116 (smart loading screen, see HANDOFF v116), onboarding blueprint S0 to S11 is complete
A first-launch wizard builds a personalised plan (levels, equipment, weak point, protected areas, schedule), with a 4-week retest, a Coach link and gym weights. Still open: the owner has not yet signed off `docs/onboarding/08_QA_CHECKLIST.md`; 77 of 108 exercises have no picture; level history (`profile.retest.history`) is stored but not charted; weight is per exercise per day, not per set; hands-free mode logs reps only.

## Read, in this order
1. `docs/HANDOFF.md`: newest entries at the bottom (v106 to v115) say exactly what each step built and why.
2. `docs/onboarding/00_START_HERE.md` and `01` to `07` (spec). `docs/RELEASE_NOTES.md` (user-facing summary).
3. `docs/onboarding/08_QA_CHECKLIST.md` (generated exercise review table).

## Map
- Profile storage `core/profile.js` · exercises `features/exdb.js` (generated) · levels `levelcalc.js` · plan engine `plangen.js` · wizard `onboard.js` · entries for existing users `onboard-entry.js` · retest `retest.js` · gym weights `loads.js` + `progression.js` · Coach `coach.js`, `coachcalc.js`.
- Exercise content lives in `docs/onboarding/exercises.seed.json`. After editing it run `python3 tools/build-exdb.py` (regenerates `exdb.js`) and `python3 tools/qa-report.py` (regenerates the QA checklist).

## Rules
- Classic scripts only (ES5 style, no modules, no libraries, no build step). A new file needs a `<script>` tag in `web/index.html` and an entry in the `SHELL` list in `web/sw.js`; bump the cache name `V` in `sw.js` on every change.
- Engines are pure (no UI, no storage, `module.exports` for node); UI goes in separate files. Every feature gets a node test (`tests/*.test.js`) and, if it has UI, a Playwright test (`tests/*_test.py`).
- Generated plans must pass the app's real `vplan()`. Never overwrite a person's plan: add a new one and activate it.
- Profile is stored metric. Skipping the health question means gentle mode. Never store a minor's age or any self-harm or health inference.

## Next job: V2 UI rebuild
Full spec in `docs/v2/V2_UI_SPEC.md`, reference screenshots in `docs/v2/reference/`, short rules in `AGENTS.md`. Picture prompts for the 77 missing exercise pictures: `docs/art/EXERCISE_IMAGE_PROMPTS.md`.

## Check before every delivery (from the repo root)
```
python3 tools/check-web.py
for t in tests/*.test.js; do node $t; done
for t in tests/*_test.py; do python3 $t; done      # needs Playwright + Chromium
```
All pass at v115. CI (`.github/workflows/build.yml`) runs `check-web.py` first: it fails if `index.html` or `sw.js` mention a file that is missing.

## How the owner applies your work (important)
- The owner uploads ONE file named `update.zip` to the repo root; the workflow `apply-update.yml` unpacks it over the repo. Zip only changed files, with paths from the repo root.
- If two zips are uploaded close together GitHub skips the one in between, and the repo ends up with `index.html` pointing at files that never arrived (this broke the build once). So: tell the owner to upload one zip at a time and wait for the "Apply update" run to finish.
- When the owner gives you the latest repo zip, diff your working tree against it and put every file that differs into `update.zip` (not just the latest step), then check: repo zip + your `update.zip` must equal your working tree.
- After each step: add a dated entry to `docs/HANDOFF.md`, tick `00_START_HERE.md`.

## Gotchas
- Other scripts wrap `go()` and `home()`; to react to a screen being shown, watch the view's `hidden` attribute (see `onboard-entry.js`).
- Settings is a hub; the new rows are on the Plan page (`[data-sp='plan']`).
- Autostart of the wizard is skipped in automated browsers unless `window.__AX_OB_AUTO` is set. Use `AxProfile.clean(x, {draft:true})` for drafts. `x<n>` keys in a plan's `st` are auto-closed past days, not activity.
- The app's `html.amo button` CSS rule overrides button colours; the wizard uses `#ax-ob` selectors to beat it. Known app issue outside the wizard: classic skin + AMOLED shows dark text on black.
- Disable CSS transitions when measuring colours or layout in tests.

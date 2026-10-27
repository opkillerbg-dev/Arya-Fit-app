# Onboarding + Personalised Plan: START HERE

**Goal.** First launch asks short, tap-based questions (body, goal, home or gym, what he can do now, weak points, schedule), then builds a plan that fits him. No account, no network, all on the phone. Re-runnable later; retests every 4 weeks.

**Read in this order (each file is short):** 01 UX spec, 02 data model, 03 levels and weak points, 04 plan engine, 05 exercise DB (+ `exercises.seed.json`), 06 roadmap (the steps), 07 prompt for another AI.

## Design decisions (already made)
1. **Level per movement pattern**, never one global level. 50 push-ups + 5 pull-ups = push 5, pull 2 -> pull is a weak point and gets priority.
2. Benchmarks decide the level. "Beginner / Intermediate / Pro" is only a cross-check and a safe default.
3. The plan comes from a **pure, deterministic, unit-tested function** `profile -> arya-plan`. No AI, no randomness, no network.
4. Output is the **existing `arya-plan` format** (see `web/js/features/builder.js`, function `build`) so Home, Swap, Progression, Coach (Smart week), Run, Share all keep working.
5. Existing users are never forced into it. They get a Home card and a Settings row.
6. Honest limits: not medical advice; one health question; under-18 gets safer caps.

## What already exists (reuse, do not rewrite)
`builder.js` 3-step "Build my plan" (home bodyweight only, 2 levels); `coachcalc.js/coach.js` weekly adaptation; `progression.js` (`PR.setLog`) rep logging and PRs; `readiness.js`; `swap.js`; `library.js` optional online exercise list; `store.js` schema + migrations (`AXSCHEMA`); 31 built-in exercises with pictures in `T0` (`core/state.js`); `tests/` + CI.
**Missing:** profile, gym exercises, pull-up ladder, per-pattern levels, weak-point logic, onboarding UI, retest.

## Project rules (learned the hard way)
- Classic `<script>` files, shared globals, **no ES modules**. Load order matters; hoisting does not cross files. New feature file = add its `<script>` to `web/index.html`, bump `web/sw.js` version, add tests.
- Pure logic goes in a file that also works in node (`module.exports` pattern at the end of `features/runcalc.js`) so it can be unit tested without a browser.
- No `javac`/Android SDK in the dev sandbox: **do not edit Java** unless you can compile it.
- Data shape change = bump `AXSCHEMA` in `core/store.js` and add a migration + test. Backup import cleaners live in `core/data-io.js`; they drop unknown fields, so add new ones there.
- Verify before every hand-off: `python3 tools/check-web.py`, `for t in tests/*.test.js; do node $t; done`, `for t in tests/*_test.py; do python3 $t; done`.
- Hand-off = `update.zip` containing only files that changed vs the last repo zip the owner uploaded, plus a `docs/HANDOFF.md` entry (`## vNNN ...`). Never touch `signing/`.

## Status (tick as steps finish; details in 06)
- [x] S0 profile storage (v105)  - [x] S1 exercise DB (v106)  - [x] S2 level engine (v107)  - [x] S3 plan engine (v108)
- [ ] S4 wizard shell + body screens  - [ ] S5 level/equipment/weak-point screens  - [ ] S6 review + create plan
- [ ] S7 existing users  - [ ] S8 retest + coach link  - [ ] S9 gym loads  - [ ] S10 content QA  - [ ] S11 polish

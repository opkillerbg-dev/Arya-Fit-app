# 06 Roadmap: execute one step at a time

Each step = small, testable, shippable as an `update.zip`. Do not start a step before the previous one passes its tests. Size: S < 1 h, M 1-3 h, L 3+ h.

| Step | Do | Files | Done when |
|---|---|---|---|
| **S0** M | Profile storage: `APP.profile`, schema 2 migration, `axCleanProfile`, `pack/doImport` carry it. | `core/store.js`, `core/data-io.js`, `tests/store.test.js` | old data loads, profile survives export/import, bad values clamped |
| **S1** M | Exercise DB: ship the seed, `exdb.js` helpers, SW cache. | `data/exercises.json`, `features/exdb.js`, `tests/exdb.test.js` | ids unique, every ladder contiguous, filter works for home/gym/avoid |
| **S2** M | Level engine from 03 (levels, weak points, gym ratios, skipped answers, safety flags). | `features/levelcalc.js`, `tests/levelcalc.test.js` | owner example (50 push, 5 pull) -> pull weak; tables from 03 covered |
| **S3** L | Plan engine from 04. | `features/plangen.js`, `tests/plangen.test.js`, `tests/plangen_ui_test.py` | all invariants hold over 500 random profiles; output passes real `vplan()` in the browser |
| **S4** M | Wizard shell + screens 0-3 (welcome, you, health, goal): overlay, progress, back, draft save/resume, first-run trigger. | `features/onboard.js` (+CSS in file), `index.html`, `tests/onboard_ui_test.py` | close/reopen resumes; back works; skipped answers get defaults |
| **S5** L | Screens 4-8 (experience, where + equipment, benchmarks, weak points + protect, schedule). | `features/onboard.js` | every option reaches `profile`; weak-point message matches S2 |
| **S6** M | Review screen, Create plan (`vplan` -> `APP.plans[id]` -> `activate`), done screen, `gen` link. Keep old builder as "Advanced". | `features/onboard.js`, `features/builder.js` (rename entry only) | first run ends on Home with week 1 |
| **S7** S | Existing users: Home card, Settings "Personalise my plan" and "My profile". No overwrite of their plan. | `ui/home.js`, `ui/settings.js` | old backup users see card, nothing changes until they opt in |
| **S8** M | Retest sheet every 4 weeks, level update, weak point removal, Coach reads `gen.weak` (+1 weak-pattern set in `progress` mode). | `features/retest.js`, `features/coachcalc.js`, tests | gap closed -> priority dropped; coach tests still pass |
| **S9** M | Gym loads: weight field per set in `PR.setLog`, start-weight notes, progression hints. | `features/progression.js`, `core/data-io.js` | weight logged, shown, survives backup |
| **S10** M | Content QA: cues for every exercise, fix levels and avoid tags, medical wording, copy review. | `data/exercises.json` | reviewer checklist signed off |
| **S11** S | Polish: small screens (360 dp), TalkBack labels, dark mode, full regression, release notes. | all | all tests green, HANDOFF entry |

**Per-step recipe:** read `00`, the spec file for the step, and only the code files listed; write pure logic + unit tests first; then UI + a Playwright test (pattern: `tests/prs_ui_test.py`); run all checks (see 00); add `## vNNN` to `docs/HANDOFF.md`; build `update.zip` with changed files only.

**Risks and decisions.** Strength standards and ladder levels are approximations (S10 review). Health question is a prompt to see a doctor, not a diagnosis. Images for new exercises are the long pole (text cues first). Large option sets must stay one-tap; if a screen needs scrolling on 360 dp, split it. Keep the engine free of UI and storage so it can be reused for the retest and for "regenerate plan".

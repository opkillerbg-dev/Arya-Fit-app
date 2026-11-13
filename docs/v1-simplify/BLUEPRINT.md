# V1 Simplification Blueprint (AERUNO)

**Goal:** a stranger who only knows "it's a fitness app" can open AERUNO and, without help, (1) know what to do today, (2) do it, (3) see that it counted, (4) find everything else by looking in ONE obvious place.
**Scope:** V1 only (V2 is an opt-in beta; do not touch `v2-*` files). **No features removed.** Things move, merge, rename or collapse.
**Basis:** code audit of repo v141 (`index.html`, `sheets-views.js`, `native-ui.js`, `home.js`, `settings.js`, `onboard*.js`). No screenshot audit yet: Phase 0 adds it.

## 1. Principles
1. One screen, one job. If you cannot say what a tab is for in six words, it is doing too much.
2. One home per action. Every action lives in ONE primary place; other places may link, not duplicate.
3. Today first. On open, the answer to "what do I do now?" is the biggest thing on screen.
4. Show less, reveal on tap. Advanced items go behind "More" / "Advanced", never deleted.
5. Plain words. No app-private terms (Smart Today, Catch up, Close day, Smart week, skin, Glass look) without a plain label.
6. Nothing owner-specific in a stranger's first minute (name, dates, "ask Claude").

## 2. What confuses a newcomer today (evidence)
| # | Problem | Where in code |
|---|---|---|
| A | First screen shows the owner's built-in "Home Plan" and the name "Arya Sheladiya", start date 2026-10-04, before the person has said anything. Wizard is skippable and a Home card nags later. | `sheets-views.js` default plan; `index.html` `#ax-name`; `onboard.js` AUTOSTART |
| B | Home can stack up to ~13 cards: note, today, catch-up, ring stat, steps, weather, readiness, bar, "Smart Today", backup nudge, personalise nudge, retest nudge, coach. No clear primary. | `home.js` ORDER + `onboard-entry.js`, `coach.js`, `backup.js`, `readiness.js` |
| C | Same action in many places: **Add exercise** x3 (drawer, top "..." sheet, Plan "More"); **Export backup** x3 (+ Settings); **Close/Reopen today** x4 (Plan button, drawer, top "...", Plan "Mark rest day"); **Plans** (drawer + Settings). | `native-ui.js` drawer + `axTopMore`, `sheets-views.js` `axMore` |
| D | Two menus on top of five tabs: left drawer (8 items) AND "..." quick actions (4 items) AND bottom nav. Three navigation systems. | `native-ui.js` |
| E | Run tab is a toolbox: Start run + Stopwatch, Countdown, Warm-up, Cool-down, Log reps, Log run by hand. A gym user sees "Run Walk Repeat" and no obvious place to start a gym session. | `index.html` `#ax-v-timers` |
| F | Exercise library, Plans, Smart week, Personalise, My profile all hide in Settings > "Plan & exercises". These are core content, not settings. | `settings.js`, `library.js`, `onboard-entry.js` |
| G | Settings mixes preferences with features: 6 skins, Black theme, Glass look, Smooth mode, New look (beta), Nudges, GPS, voice, backup, reset. | `settings.js` |
| H | Progress has 4 equal sub-tabs (Stats, Body, History, Badges); "Body" (recovery map) is jargon-heavy. | `index.html` `#ax-v-prog` |
| I | Copy written for the owner/AI workflow: "Ask Claude for a plan", "Copy plan guide for Claude". | `index.html` `#ax-v-plans` |

## 3. Target structure (5 tabs kept, each with one job)
| Tab | New name | One job | Contains |
|---|---|---|---|
| Home | **Today** | "What do I do now?" | ONE hero card (today's session + big Start/Continue button), steps ring (small), then at most 2 contextual cards. Everything else folds into a single "More for today" row (check-in, weather, readiness). |
| Plan | **Plan** | "My week, and how to change it" | Week strip + day (as now). Top-right "..." = Manage: Add exercise, Switch/import plan, Exercise library, Smart week, Redo my setup. This is the ONLY home for those. |
| Run | **Move** (or keep "Run", see D1) | "Start a workout or run now, outside the plan" | Big Start run button. "Tools" list collapsed under it: stopwatch, countdown, warm-up, cool-down, log reps, log a run. |
| Progress | **Progress** | "Am I improving?" | Overview first (streak, week, steps, runs, badges summary). Sub-tabs reduced to Overview / History / Recovery (Badges folds into Overview; Body renamed Recovery). |
| Settings | **Me** (or keep "Settings") | "My profile, reminders, data" | 5 rows only: Profile & goals, Reminders, Appearance, Data & backup, About & help. Everything technical under "Advanced". |

**Remove the left drawer.** It duplicates the tabs. Keep the top "..." sheet only as a 2-item contextual shortcut (Close/Reopen today, Check-in), or drop it. Result: ONE navigation system (bottom tabs) + ONE per-screen menu.

### Where each action lives after the change
| Action | Primary home | Allowed shortcuts |
|---|---|---|
| Start today's session | Today hero button | Plan day card |
| Close day / rest day | Plan day card (one button; "rest day" becomes an option inside the Close sheet) | none |
| Add exercise | Plan "..." > Manage | none |
| Switch / import / export plan | Plan "..." > Manage > Plans | none |
| Exercise library | Plan "..." > Manage > Exercises (also a Plan sub-link) | none |
| Backup / restore | Me > Data & backup | Home backup nudge (links there) |
| Reminders / nudges / step goal | Me > Reminders | none |
| Check-in (sleep, energy, soreness) | Today > "More for today" | none |

## 4. Implementation approach (fits the repo rules)
- **Move nodes, never rebuild them** (same method as `settings.js`): keep every existing id and handler so tests, V2 observers and widgets keep working.
- Classic ES5, no libraries, no build step. New code in new files only when needed; list in `index.html` and the `SHELL` list in `web/sw.js`; bump the cache name every delivery.
- Text changes are labels only: do not rename ids, storage keys (`aryaApp2`) or the app id.
- One phase per delivery. Each phase ends with: `python3 tools/check-web.py`, all node tests, the Playwright tests for touched screens, a `docs/HANDOFF.md` entry, `update.zip` of changed files (owner uploads one zip at a time).
- Never hide a feature with no path to it: every "moved" item gets a test that the new path opens it.

## 5. Phases
**P0 Baseline (no behaviour change).** Playwright screenshots of every tab and every Settings page on a fresh profile and on a profile with a plan. Save under `docs/v1-simplify/before/`. Write the glossary of old label to new label (section 6). Gate: owner approves names + decisions D1-D4.

**P1 First minute.** Replace the owner's built-in plan for new installs with a neutral "Starter plan" and no athlete name (name shown only after the person types it). Welcome screen of 3 lines: what the app does, what it needs (activity permission for steps, optional GPS), "Set up my plan (2 min)" or "Use the starter plan". Home never shows the "Personalise" card to someone who just finished or skipped the wizard (use the same flag). Existing users untouched.

**P2 Today diet.** Rework `home.js` ORDER: hero card first, steps ring second, everything else inside one collapsible "More for today". One-time nudges (backup, retest, coach, personalise) share ONE slot and show one at a time by priority. Empty states say what to do ("Rest day. Nothing to do. Walk if you like.").

**P3 One navigation.** Remove the drawer and de-duplicate quick actions per section 3 table. Keep the drawer code behind a flag for one release so rollback is a one-line change. Plan gets the "..." Manage sheet; Exercise library and Plans are reachable from it.

**P4 Move tab.** One primary Start card. Tools collapsed into a "Tools" list below. Rename rows in plain words ("Stopwatch", "Rest timer", "Warm-up (4 min)", "Cool-down (4 min)", "Log reps", "Add a run by hand").

**P5 Plan tab.** Add the Manage sheet (P3), move Smart week and "Redo my setup / My profile" into it, plain copy for "Close day" ("Finish day").

**P6 Progress.** Overview first with the 4-5 numbers a beginner understands; Badges folded in; "Body" becomes "Recovery" with a one-line explainer shown once.

**P7 Me (Settings).** Five rows. Skins, Glass look, Smooth mode, New look (beta), glass studio go under Appearance > Advanced. Run and tracking: GPS + step goal first, rest under Advanced. Replace "Ask Claude / guide for Claude" copy with plain text; keep the feature under Plans > "Make a plan with an AI assistant (advanced)".

**P8 Help layer.** One-time coach marks (max 3, dismissible, never repeat) on first Today, Plan and Move visit. A "How it works" page in Me > About & help (60 seconds: Today, Plan, Move, Progress). Every empty state gets one sentence + one button.

**P9 Stranger test + sign-off.** See section 7. Update `docs/RELEASE_NOTES.md`.

## 6. Label glossary (draft, for owner approval in P0)
| Now | Proposed |
|---|---|
| Home | Today |
| Smart Today / "How are you feeling?" | Daily check-in |
| Catch up | Missed days |
| Close day / Close today | Finish day |
| Smart week | Plan my next week |
| Plan tools | (dissolved into Plan > Manage) |
| Run (tab) | Move (D1) |
| Look / Appearance skins | Appearance (skins under Advanced) |
| Voice & alerts | Reminders / Sound |
| Body (Progress) | Recovery |
| Plans > "Add a plan" (Claude text) | Import a plan |

## 7. Stranger test (the acceptance gate)
Five people who have never seen the app, fresh install, no help, phone in hand. Pass = at least 4 of 5 complete each task in the time shown.
1. Start today's workout. (30 s)
2. Mark it done and say whether the app counted it. (30 s)
3. Find how many steps they took today. (15 s)
4. Change the daily reminder time. (45 s)
5. Back up their data. (45 s)
Also record: first tap, any "what is this?" comment, any screen where they went back twice. Fix by moving things, not by adding explanations.

## 8. Decisions (owner said: do what is best; the bold defaults are APPLIED)
- **D1** Run tab: **keep as "Move" with run first** / keep "Run" / fold into Today as a Quick start sheet.
- **D2** Settings tab name: **Me** / keep Settings.
- **D3** Drawer: **remove** / keep as menu with 3 items.
- **D4** Starter plan for people who skip setup: **neutral 3-day beginner full-body + walking** / the existing Home Plan with the owner's name removed.

## 9. Out of scope / risks
- V2 look is untouched; V2 observers key off V1 ids, so ids must not change.
- Widgets, step service, backups, plan format, storage keys: untouched.
- Moving the library and plans out of Settings changes where existing users find them: P3 ships a one-time "Moved to Plan > ..." hint.
- Risk: Today diet hides weather/readiness for users who like them. Mitigation: "More for today" remembers open/closed.

## 10. Progress log
- **P0 done (v142):** `tools/shots-v1.py` + baseline screenshots in `docs/v1-simplify/before/`. Fresh-install finding: Home showed "Plan complete" (built-in plan ran 4-31 Oct), the owner's name, a "never saved a backup" nag, a weather prompt, a readiness score and a coach card before any activity.
- **P1 done (v142):** new installs get a neutral Starter plan (beginner, 3 full-body days, no equipment, starts today, no name, plus a gentle 2 km run/walk so the Run tab keeps its Start button). Calm first days: weather prompt, readiness card and Smart week card wait until 3 days or 3 ticks (`axQuiet()`, `PR.born`; older/restored installs never quiet). Welcome copy says what the app is; skip button says "starter plan". Home name placeholder neutral. Test: `tests/v1_starter_test.py`.
- **Found while doing P1 (feeds P4):** the Run tab's Start run button is hidden for any plan without a run (`#tvpanel` hidden when `JKM` is 0), so every wizard plan with a non-running goal has no Start run. P4 must make Start run always available (free run).
- **P2 done (v143):** Home = Today card, missed days, progress ring, steps, ONE nudge (priority: personalise, retest, Smart week, backup; the next one appears when one is dismissed), then one collapsible "More for today" (check-in, readiness, weather; open/closed remembered in `localStorage axHomeMore`, default closed). Banner shortened. Rest-day Today card shows "Next workout: ...". Labels: Smart Today -> Daily check-in, Catch up -> Missed days. V2 look keeps the old flat order. Tests: `tests/v1_home_test.py`.
- **P3 done (v144):** left drawer button hidden (code kept behind `AX_DRAWER=false` in `native-ui.js` for one release). Top "..." = Close/Reopen today + Daily check-in only. Plan's bottom button is now a labelled **Manage** sheet: Add exercise, Switch/import/export plan, Personalise my plan, Smart week, More plan tools (library, profile, next plan, quick builder). Rest day lives only in the Close day sheet. Settings hub lost its "Plan & exercises" row (5 rows now); the page still exists and opens from Manage, Back returns to Plan. Plans view Back returns to Plan. One-time "Plan tools moved" card in Settings for established installs. Backup lives only in Settings > Data & backup. Tests: `tests/v1_nav_test.py`; three older tests re-pointed to the new path.
- **P4 done (v145):** tabs are now Today, Plan, Move, Progress, Me. Move: heading "Start moving", one Start card that is ALWAYS there (plans with no run get "Free run": Run or Walk, GPS time/distance/route, no target, no goal toast, no level change; plans with a run keep "Start run - ..." and the weekly goal). Tools (workout stopwatch, rest timer, warm-up, cool-down, log reps, add a run by hand) are one collapsed card. Free runs never become "Best run time". Starter plan no longer carries an invented run block. Test: `tests/v1_move_test.py`.
- **P5 done (v146):** Plan wording. Close day -> Finish day (button, sheet "Finish today", options "Rest day / Skip training, keep your streak" and "Finish with what I did"), Preview schedule -> Reschedule, Edit sets / reps -> Edit sets and reps, All days -> See all days, Smart week -> Plan my next week (Manage, plan tools, coach card "NEXT WEEK", toasts), plan-tools page titled "Plan tools". Rest days already explain themselves, so no extra text was added. Test: `tests/v1_plan_test.py`.
- **P6 done (v147):** Progress has 3 tabs: Overview, History, Recovery. Badges moved into Overview (their pane `ax-ps-badges` still exists and shows with the stats pane; `axPs('badges')` lands on Overview). Duplicate "Progress, in context" headers removed (one header per section). Four numbers up front (Days finished, Activities done, Total km, Steps counted); Best run time, Workout time, Time jogging, Jogging vs walking folded under "More numbers". Empty state card ("Nothing here yet...") until something is finished. Recovery keeps its own one-line intro; the duplicate "Recovery atlas" strip is gone. Test: `tests/v1_progress_test.py`.
- **P7 done (v148):** Settings tab is "Me". Five rows: Appearance, Run & steps, Reminders & sound, Data & backup, About. Each of Appearance / Run & steps / Reminders & sound has a collapsed "Advanced" fold holding the rarely used rows (Glass look, Smooth mode, New look (beta); Auto-pause, Cadence beat, BPM, Auto rest timer; Test voice, Voice engine, Test haptics). Rows are moved, never rebuilt, so all toggles keep working. Plans screen copy no longer names a product ("Copy guide for an AI assistant"). Test: `tests/v1_me_test.py`.
- **Deliberately not done in P7:** a separate "Profile & goals" row (profile editing is reached from Plan > Manage > Personalise; adding a second path would break one-home-per-action) and renaming About to "About & help" (that happens in P8 together with the help page).
- **Next:** P8 help layer (How it works page, coach marks, empty states), P9 stranger test + sign-off.

# AERUNO stranger test (P9 sign-off)

**Who:** 5 people who have never seen the app. Not friends who helped build it. They only know "it is a fitness app".
**Setup:** a fresh install of the latest APK on their own phone (or yours, after clearing app data). Do it on a day that has a workout in the plan. Do NOT explain anything. Sit beside them and stay quiet. Use a stopwatch.
**Say only this:** "This is a fitness app. Please do these five things. Think out loud. I can't help."

## Tasks (pass = done inside the time, without help)
| # | Task | Time limit | Expected path (do not tell them) | Taps in the dry run |
|---|---|---|---|---|
| 1 | Start today's workout | 30 s | Today > big button | 1 |
| 2 | Mark it done, then tell me whether the app counted it | 30 s | tick an exercise > Finish day > Finish with what I did (Today then shows it) | 3 |
| 3 | Find how many steps you took today | 15 s | Progress tab > Steps counted | 1 |
| 4 | Change the daily reminder time | 45 s | Me > Reminders & sound > Daily reminder | 2 + set time |
| 5 | Back up your data | 45 s | Me > Data & backup > Export backup | 2 + 1 |

Pass bar for sign-off: at least 4 of 5 testers pass each task.

## Record per tester (one row each)
| Tester | T1 s | T2 s | T3 s | T4 s | T5 s | First tap on the first screen | Said "what is this?" about | Went back twice on |
|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | |
| 2 | | | | | | | | |
| 3 | | | | | | | | |
| 4 | | | | | | | | |
| 5 | | | | | | | | |

Write "FAIL" instead of seconds if they gave up or needed help.

## How to read the result
- A task that 2+ testers fail: the path is hidden or mislabelled. Fix by MOVING or RENAMING (blueprint principle 2), not by adding explanation text.
- Same "what is this?" from 2+ testers: rename that thing (glossary in BLUEPRINT.md section 6).
- Same screen they go back from twice: the label on the button that led there is wrong.
- Tips (P8) may appear on first visit. If a tester ignores them and still passes, they are fine. If a tester needs a tip to pass, the screen itself still has a problem.

## Also ask at the end (30 seconds)
1. "What is this app for?" (one sentence)
2. "What would you tap first tomorrow morning?"
3. "Anything you saw and did not understand?"

## After the round
Put the filled table in `docs/v1-simplify/STRANGER_RESULTS.md`, list fixes, rerun `tests/v1_stranger_test.py`, bump the version, then run a second round of 3 testers on the fixes.

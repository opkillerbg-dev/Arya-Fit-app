# 04 Plan engine (`web/js/features/plangen.js`, pure, node-testable)

`AxPlanGen.build(profile, exdb) -> {plan, gen, notes[]}`. Same input = same output. `plan` is an `arya-plan` object exactly like `builder.js build()` returns: `{format:"arya-plan",version:1,name,athlete,start,weeks,lightWeeks,lightSets,days:{mon..sun:{title,short,focus,icon,type:"strength|circuit|mobility|rest",exercises:[...],jog?,jogNote?}},jog?,habits?}`. Copy the exercise row format and the `jog` interval logic from `builder.js` (`dayObj`, `intervals`).

## Pipeline
1. **Levels + weak points** from 03 (`levelcalc.js`, pure).
2. **Session budget** from minutes: sets per session = 20 min: 8, 30: 12, 45: 18, 60: 24 (about 2.5 min per set incl. rest; circuits count rounds x moves). Warm-up/stretch not counted.
3. **Split** by days per week (home and gym): 2 = Full A/B. 3 = Full A/B/A (rotate). 4 = Upper/Lower x2. 5 = Push/Pull/Legs + Upper/Lower. 6 = Push/Pull/Legs x2. Goal Run further replaces one strength day by an easy run day; "Lose fat" adds one circuit day. Weekday placement: spread, never the same pattern on consecutive days if avoidable; rest/mobility fill the rest (reuse `WEEKS` layout idea from builder).
4. **Weekly set targets per pattern** (push, pull, squat, hinge, core): beginner 6-8, intermediate 9-12, advanced 12-16 (goal Build muscle +2, Get stronger -1 sets but heavier, Fat loss +circuit). Weak pattern x1.4 (cap +4), subtracted from the strongest pattern (never below 6). Spread over the days that train that pattern; each pattern at least 2 sessions/week, weak ones at least 3.
5. **Exercise selection** per slot from `exdb`: filter by environment/equipment, remove anything whose `av` contains a protected area, pick the ladder step from level (03). Score = ladder fit + variety (avoid repeating the same exercise more than twice/week) + built-in picture bonus (`b:1`). Weak pattern slot goes first in the session. Include a pull/push balance check (pulling sets >= pushing sets).
6. **Progression across weeks**: week 1 test week (-1 level, reps to log), weeks ramp +1 set at weeks 3 and 5 for strength days, `lightWeeks` every 4th week (reuse builder: `[4,8,12]`, `lightSets:2`), last week = retest prompt. Coach (Smart week) continues from there.
7. **Running** (if goal run or the person asked): reuse builder `intervals(km)`; start length from `levels.run`; run days placed on circuit/mobility/rest days first.
8. **Gym loads**: if lifts were entered, suggest start weight = 60% of the estimated 8-rep weight in the exercise note; otherwise note "find a weight you can do 10 reps with, 2 left in the tank".
9. **Names and notes**: plan name from goal + weak point ("Strength Plan: pull focus"); each strength day `focus` mentions the weak point if present. Notes use the T0 text for built-in exercises, otherwise the `note` field in the exdb.
10. **gen** = `{v:1,ts,levels,weak,inputsHash}`.

## Invariants (all tested)
Output passes `vplan()`; every exercise exists in the exdb; no protected-area exercise; equipment respected; session sets <= budget; pull sets >= 0.8 x push sets; weak pattern frequency >= 3 when days >= 3; rest day at least 1/week; deterministic; < 50 ms.

## Worked example (the owner's case)
Home + pull-up bar, 4 days, 45 min, goal Build muscle, push-ups 50+, pull-ups 3-5, squats 50-99, plank 90-179 -> levels push 5, pull 2, legs 4, core 4 -> weak: pull. Week: Mon Upper (Negative/Pull-ups first, Feet-elevated rows, Decline push-ups, Pike push-ups), Tue Lower (Bulgarian split squat, Glute bridge variants, Calf), Thu Upper (Chin-ups, Band-assisted pull-ups, Archer push-ups), Fri Lower + core; pull-up practice mini-sets Wed and Sun.

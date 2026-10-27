# 01 UX spec: the questions

**Rules.** Full-screen sheet over the app. One question per screen, big tap targets (>= 48 dp), progress bar, Back always works (also Android back), every screen has **Not sure / Skip** with a safe default. Draft saved after each answer (`localStorage aryaOnboardDraft`), so closing the app resumes. About 2 minutes. Copy is plain, kind, no jargon. Each screen has a one-line "why we ask".

**When it shows.** Fresh install (no `APP.profile`, no run/workout history) right after the splash. Existing users: Home card "Personalise your plan (2 min)" + Settings > Plan & exercises > "Personalise my plan". Never forced.

| # | Screen | Options |
|---|---|---|
| 0 | Welcome | "A few quick questions so your plan fits you. Stays on your phone." [Start] [Skip, use a standard plan] |
| 1 | You | Name (optional). Units cm/kg or ft-in/lb. Height and weight (stepper or keyboard). Age band: under 18, 18-29, 30-39, 40-49, 50-59, 60+. Sex: male, female, prefer not to say (only for strength standards). |
| 2 | Health check | "Has a doctor ever said you should not exercise, or do you get chest pain or dizziness when you do?" No / Yes / Not sure. Yes or Not sure -> kind note to check with a doctor first, plan starts in "gentle" mode. |
| 3 | Goal | Pick 1 main (+ optional 1 extra): Build muscle, Get stronger, Lose fat and stay fit, Run further, General fitness. |
| 4 | Experience | Beginner (new or inconsistent), Intermediate (1-3 years steady), Advanced (3+ years). Cross-check only. |
| 5 | Where | Home, no equipment / Home with some equipment / Gym. "Some equipment" opens a checklist: pull-up bar, dumbbells, bands, bench, jump rope, backpack (default on). |
| 6 | What can you do | Benchmarks, one card each, with a short "how to count" hint and the exercise picture: **Push-ups** (0-2 / 3-9 / 10-19 / 20-34 / 35-49 / 50+), **Pull-ups** (can't hang / hang only / 1-2 / 3-5 / 6-9 / 10-14 / 15+), **Squats** (under 15 / 15-29 / 30-49 / 50-99 / 100+), **Plank** (under 20 s / 20-44 / 45-89 / 90-179 / 3 min+), **Running non-stop** (can't / about 1 km / 3 km / 5 km / 10 km+). Gym or dumbbells: optional best working weights for squat, bench, deadlift, overhead press (kg/lb) or "I don't know yet". Rule shown: "Good form, as many as you can." |
| 7 | Weak points | System shows its finding, e.g. "Pulling looks like your weakest link: 5 pull-ups vs 50 push-ups. Make it a priority?" [Yes, recommended] [No]. Then chips "Anything you want to improve?" (pull-ups, push-ups, legs, core, running, flexibility, posture) and "Anything we should protect?" (knees, lower back, shoulders, wrists, elbows, none). |
| 8 | Schedule | Days per week 2-6 (recommended one highlighted), session length 20 / 30 / 45 / 60 min, plan length 4 / 8 / 12 weeks, start today or next Monday. |
| 9 | Review | "Your starting levels" bars (Push, Pull, Legs, Core, Run) with plain words (Starter ... Strong), weak-point note, 7-day strip with workout names, one-line reason per choice. [Create my plan] [Change answers]. |
| 10 | Done | Opens Home on the first workout. Toast: "Plan ready. Week 1 is deliberately easy." |

**Edge cases.** Skipped benchmark -> level from experience (beginner 1, intermediate 2, advanced 3) and week 1 becomes a test week. Height/weight skipped -> not used. Age under 18 -> no max-effort tests prescribed, volume cap, note. Imperial/metric stored as metric. All answers editable later in Settings > "My profile". Accessibility: labels on every control, number inputs have a keyboard fallback, no colour-only meaning. Strings kept in one object so translation is possible later.

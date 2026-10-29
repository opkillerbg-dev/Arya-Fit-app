# Release notes: personalised plans (v106 to v115)

## What is new
- **First launch asks a few questions (about 2 minutes)** and builds a plan for you: your levels in push, pull, legs, core and running, what equipment you have, what you want to improve, what to protect, and how many days and minutes you have. You can skip any screen. "Skip, use a standard plan" keeps the old behaviour.
- **Weak point first.** If one pattern (for example pulling) is much behind the others, it is trained first in each session and at least 3 times a week.
- **Safe by default.** Skipping the health question starts in gentle mode (fewer sets, longer rests, no max tests). Protected areas (knees, lower back, shoulders, wrists, elbows) leave out the exercises that load them. Week 1 is deliberately easy.
- **Retest every 4 weeks.** Home shows "Time to retest"; tap what you can do now and your levels and priorities update. A closed gap removes the priority; Coach adds an extra set to weak-point exercises on step-up weeks.
- **Gym weights.** Dumbbell, barbell, machine and cable exercises get a weight control (kg or lb), a start weight from the lifts you typed in, last session's weight carried over, and a "Try heavier" nudge when you hit all your reps. Weights are saved in backups.
- **For existing users:** Home card "Personalise your plan", and Settings > Plan: "Personalise my plan", "My profile" (edit answers) and "Retest my levels". Your current plan is never overwritten; a new plan is added next to it.
- 108 exercises with a one-line how-to for each (77 have text only, no picture yet). Home plans never include dips, inverted rows or barbell exercises that need gear you do not have.

## Polish in this version
- Works on small phones (320 and 360 px wide), with big tap targets, screen-reader names for every control and readable text in all skins including AMOLED.
- The wizard keeps itself readable even where the app's classic skin in AMOLED mode has dark text on a dark background.

## Known gaps
- Pictures for the 77 new exercises; the exercise review in `docs/onboarding/08_QA_CHECKLIST.md` still needs a person to sign it off.
- Weight is set per exercise per day, not per individual set; hands-free mode logs reps only.
- Level history (stored after each retest) is not charted yet.
- Pre-existing: in the classic skin with AMOLED on, parts of the app outside the wizard show dark text on a dark background.

## v116
- Smarter start-up: the loading screen now waits until the app is actually smooth (steady animation, nothing still installing) instead of a fixed time. Usually about 2 seconds, up to 11 seconds on a slow moment, then it opens anyway.

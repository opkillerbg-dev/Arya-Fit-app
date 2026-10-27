# 05 Exercise database

`exercises.seed.json` (108 exercises, validated: unique ids, all 31 built-in exercises matched by exact name).
Record: `{id, n:name, p:pattern(push|pull|squat|hinge|core|cardio|mobility), g:ladder group, L:step 0-5 inside the ladder, e:[equipment tags], av:[body areas to protect], env:["home","gym"], b:1 if the app already has pictures and notes}`.
Equipment tags: body, chair, backpack, band, pullbar, dumbbell, barbell, bench, cable, machine, rope, wheel. `env` "home" = every tag is in {body, chair, backpack, band, pullbar, dumbbell, bench, rope, wheel}; gym includes everything.
Avoid tags: knee, back, shoulder, wrist, elbow, ankle, neck.
Ladders (g): pushup, bench, dip, vpush, pullup, row, pullacc, squat, single, squatx, hinge, calf, core, cardio, mobility. A ladder step = same movement, harder by leverage or load. Engine moves along L.

**Status: draft.** Levels and avoid tags need a QA pass (S10). Pictures exist only for `b:1`; for the rest show text cues. Option: fetch images from the optional online library (`features/library.js`) when the person is online; never block on it.
**Runtime module `exdb.js`:** loads the JSON (inline in a `<script>` data file or fetched from `data/`, cached by the service worker), exposes `byId`, `ladder(g)`, `filter({env,equip,avoid})`. Add per-exercise `cue` (one sentence) and `reps` default as content is written.
**Adding exercises:** keep names unique and stable (they are keys in `PR.setLog` and swap). Never rename a `b:1` name.

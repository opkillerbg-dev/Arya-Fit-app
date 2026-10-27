# 02 Data model

**Where.** `APP.profile` (new, top level next to `APP.plans`). Draft only in `localStorage aryaOnboardDraft` until Create. Local only, never uploaded. It is included in backups.

```json
{ "v":1, "done":true, "ts":1730000000000,
  "units":"metric", "name":"", "ht":178, "wt":76, "age":"30-39", "sex":"m|f|x",
  "health":"ok|check",
  "goal":{"main":"muscle|strength|fatloss|run|general","extra":null},
  "xp":"beg|int|adv",
  "env":"home|homeplus|gym",
  "equip":["backpack","pullbar","dumbbell","band","bench","rope","barbell","machine","cable"],
  "bench":{"push":50,"pull":5,"squat":50,"plank":90,"run":5,"lifts":{"squat":null,"bench":null,"deadlift":null,"ohp":null}},
  "levels":{"push":5,"pull":2,"legs":3,"core":3,"run":3},
  "weak":["pull"], "want":["pull"], "protect":["shoulder"],
  "days":4, "mins":45, "weeks":8, "start":"today|monday",
  "retest":{"last":1730000000000,"due":1732500000000,"history":[{"ts":0,"levels":{}}]} }
```
Ranges: `ht` 100-230 cm, `wt` 30-250 kg, `bench.*` raw numbers (reps, seconds, km), `levels` 0-5, `days` 2-6, `mins` 20-90, `weeks` 4-12. Unknown fields are dropped on import.

**Plan link.** Next to the plan (not inside the `arya-plan` object, `vplan()` may strip extras): `APP.plans[id].gen = {v:1, ts, levels:{...}, weak:[...], inputsHash}`. Lets the engine regenerate, explain "why", and lets Coach read weak patterns.

**Migration.** `core/store.js`: `AXSCHEMA` 1 -> 2, migration `{to:2,name:"profile",run:a=>{a.profile=a.profile||null;return a}}`. Add tests in `tests/store.test.js`.

**Backup.** `pack()` writes `profile`; `doImport` + a new `axCleanProfile()` in `core/data-io.js` validates every field against the ranges above (whitelist, clamp, enums). Backups from a newer schema are already refused.

**Not stored.** No medical details beyond the single `health` flag, no photos, no contacts.

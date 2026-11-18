# Task backlog (stability and release hardening, then product)

Source: the stability audit the owner shared on 2026-11-15, checked against repo v150. Rules: `docs/WORKFLOW.md`. State: `docs/CURRENT.md`.
Sizes: S = under one short session, M = one full session, L = split it first. "Who": ANY = any assistant, text only; BROWSER = needs a sandbox with Chrome/Playwright; OWNER = only the owner can do it; DEVICE = needs the owner's phone.
Status key: [ ] open, [~] in progress (write who/when), [x] done (write log file name).

## Phase 1: no identity, key or data changes (safe to start now)

### [x] T01 Record the baseline facts  (OWNER, S, lane DOCS)  DONE 2026-11-16, see docs/CURRENT.md "Baseline facts" and docs/log/2026-11-16_baseline.md. Leftover closed 2026-11-16: the owner confirmed new builds install over the old app as an update (same id and key).
Goal: fill in what only the owner can see so nobody guesses.
Steps: (1) open the latest green run of "Build APK" in GitHub Actions and copy the summary lines "package: ..." and "signing key sha256: ..."; (2) on the phone: Settings > Apps > AERUNO, note the version; (3) note the last APK that worked well and the commit/version (e.g. v150); (4) send these 4 lines to any assistant, which writes them into `docs/CURRENT.md` under "Baseline facts".
Done when: CURRENT.md has installed app id (if known), signing fingerprint, last known-good version and where that APK is saved.

### [ ] T02 Lockfile and `npm ci`  (OWNER then ANY, S+S, lanes CI)
T02a OWNER: on a computer or GitHub Codespace run `npm install --package-lock-only` in the repo root and upload the new `package-lock.json` (no assistant sandbox here has network access).
T02b ANY (after T02a): in `package.json` replace `^` ranges with the exact versions found in the lockfile; in `build.yml` replace `npm install` with `npm ci`.
Acceptance: lockfile committed; CI step is `npm ci`; a CI run installs without changing the lockfile. Frozen: do not upgrade any dependency in this card.

### [ ] T03 CI gates  (ANY writes, OWNER runs, S/M, lane CI)
Goal: CI runs what we run locally.
Steps: (1) job `test` (required, blocks the APK): `python3 tools/check-web.py` and every `tests/*.test.js`; (2) new job `ui-tests` (starts as non-blocking, `continue-on-error: true`, clearly named "optional"): installs Playwright, runs every `tests/*_test.py` one after another, prints a pass/fail summary table, uploads logs as an artifact; (3) `boot_ui_test.py` retried once before it counts as failed; (4) comment in the workflow saying when `ui-tests` becomes required (after 5 green runs in a row); (5) workflow edits need secret `ARYA_PAT`.
Acceptance: a deliberately failing node test blocks the build (try it on a branch); UI summary is visible in the run; APK still builds.

### [ ] T04 App-id consistency check  (ANY, S, lane CI)
Goal: no accidental second app.
Steps: add `tools/check-ids.py` that reads `capacitor.config.json` (namespace `com.arya.fit`, allowed), `APP_ID` default in `build.yml`, and the line `CANONICAL_APP_ID_IN_CI=...` in `docs/CURRENT.md`; exits 1 if build.yml's default differs from CURRENT.md or if the Gradle `sed` target no longer matches. Run it in the required `test` job. Print both values, never secrets.
Acceptance: passes now; fails if someone edits only one of the two files (show the failing output). Frozen: do not change the app id.

### [x] T05 Permissions inventory  (ANY, S, lane DOCS)  DONE 2026-11-16, see docs/PERMISSIONS.md and docs/log/2026-11-16_T05.md
Goal: `docs/PERMISSIONS.md`: one table of every Android permission/service/receiver the built APK declares, why it exists, which feature uses it, when the app asks, what happens if denied.
Steps: read `tools/patch-manifest.sh`, `tools/android-setup.sh`, `tools/patch_widgets.py`, `native/` (grep `uses-permission`, `foregroundServiceType`, `requestPermissions`). Mark anything you cannot find a user for as "check before removing". Do NOT remove any permission.
Acceptance: every declared permission has a purpose line; unknowns listed.

### [x] T06 Docs cleanup  (ANY, M, lane DOCS)  DONE 2026-11-17 together with the repo cleanup, see docs/log/2026-11-17_repo-cleanup.md
Steps: (1) move `docs/HANDOFF.md` to `docs/archive/HANDOFF_through_v150.md`; (2) new short `docs/HANDOFF.md` = pointer to CURRENT.md, WORKFLOW.md, BACKLOG.md, `docs/log/` and the archive; (3) fix stale text in `README.md`, `AI_BRIEF.md`, `START_HERE_V2.md`, `CHATGPT_START.md` (version numbers, "current job = V2 rebuild", old package ids) by pointing them to CURRENT.md instead of repeating facts; (4) keep every rule from AGENTS.md that is still true.
Acceptance: a new assistant needs only AGENTS.md, CURRENT.md, WORKFLOW.md, one task card. No file claims a different app id than CURRENT.md.

### [x] T07 Device test checklist (write)  (ANY, S, lane DOCS)  DONE 2026-11-16, see docs/DEVICE_TEST.md
Goal: `docs/DEVICE_TEST.md` the owner can follow on the OnePlus in about 30 minutes, with tick boxes and "what to note". Cover: fresh install; update over an old build; backup export/import round trip; free run with screen locked for 10 min; run while using another app; GPS loss (tunnel/airplane mode); stop run; no duplicate run saved; location/activity permission denied and revoked later; battery saver on; step count after closing the app, after reboot, across midnight, after a time-zone change; **step counting with the hidden notification (channel `arya_steps_off`) still rising after 1 hour with screen off**; Play Protect pop-up behaviour; widgets if present.
Acceptance: each test has steps, expected result, a place to write the result.

### [ ] T08 Data-safety tests  (ANY, M, lane TESTS)
Goal: map audit section 7 to existing `tests/store.test.js` cases and add only the missing ones as node tests: interrupted import keeps old data; newer-schema data is not overwritten by an older app; corrupted storage recovery message; large history (e.g. 2,000 runs/step days) loads and exports. No storage, schema or backup-format changes.
Acceptance: list "covered / added" per item in the log; all node tests pass.

### [ ] T09 Make the boot timing test robust  (BROWSER, S, lane TESTS)
`tests/boot_ui_test.py` check "a main-thread block during boot delays the go" is timing-based and flaky on slow machines (fails on the original too). Make it measure relative delay robustly (e.g. median of 3 runs, or compare event order not seconds). Do not weaken what it protects.
Acceptance: 5 consecutive passes in the sandbox.

## Phase 2: decisions and device work (owner involved)

### [ ] T10 Decision paper: app id, signing key and Google Play  (ANY writes, OWNER decides, M, lane DOCS)
Write `docs/decisions/SIGNING_AND_PLAY.md` with options, costs and a recommendation. Cover: A keep everything and document the risk; B new private release key stored only in GitHub secrets, one-time clean reinstall using the app's backup export/import (recommended to do together with Play); C APK signature-lineage rotation (keeps in-place updates on Android 9+, more complex); Play App Signing, upload key, internal/closed testing track, current new-account testing rules (check the current Play Console rules before stating them); effect on the Play Protect "looks safe" pop-up; what must be backed up and who holds the key. No code, no key changes.
Acceptance: the owner can pick A, B or C from the paper alone.

### [ ] T11 Run the device checklist  (OWNER + DEVICE, M)
Run `docs/DEVICE_TEST.md` (T07: D1 to D16, about 30 minutes now plus checks over a day) and send the filled results to an assistant, which writes `docs/log/` and opens new cards for each failure.

## Phase 3: only after Phase 1 and the decision

### [ ] T12 Implement the signing / app-id decision  (L: split in 3 cards first, lanes NATIVE+CI)
Do nothing until T10 is decided and T01 and T11 are done. Split into: secrets setup guide, workflow change with fingerprint check, migration guide for users (export backup, install, import). Needs the owner's explicit OK at each step (WORKFLOW rule 6).

### [ ] T13 Fix what the stranger test found  (BROWSER, M each, lane APP)
After the 5-person round (`docs/v1-simplify/STRANGER_TEST.md`), one card per failed task. Fix by moving or renaming, then rerun `tests/v1_stranger_test.py` and a 3-person second round.

### [ ] T14 Make `ui-tests` required in CI  (ANY, S, lane CI)
After 5 green CI runs of the optional job (T03), remove `continue-on-error` and make the APK build `needs` it.

### [ ] T15 Update deprecated GitHub Actions  (ANY writes, OWNER runs, S, lane CI)
Why: the Build APK run shows 4 warnings. GitHub forced Node-20 actions onto Node 24 on 2026-06-02 and removed Node 20 from runners on 2026-09-16, so builds still work today but depend on that forcing; `setup-java@v4` is flagged as deprecated.
Steps: in `.github/workflows/build.yml` and `apply-update.yml` bump `actions/checkout`, `actions/setup-node`, `actions/setup-java`, `actions/upload-artifact` to the first major version whose release notes say Node 24 (look them up on each action's GitHub releases page; do not guess). Change only version tags. Leave the project's own `node-version: 20` and `java-version: 17` alone (different thing: the app toolchain; review separately later).
Acceptance: one Build APK run, all jobs green, the Node/setup-java warnings gone, the APK still reports package `com.arya.fit3` and the same signing sha256. Needs the `ARYA_PAT` secret to apply workflow edits. Do together with T03 (same file).

### [ ] T16 Print the merged manifest in CI  (ANY writes, OWNER runs, S, lane CI)
Why: `docs/PERMISSIONS.md` could not list permissions added by Capacitor and the plugins (they are only visible in the built APK).
Steps: in the `build` job, after the APK exists, add a step that runs `$ANDROID_HOME/build-tools/*/aapt2 dump permissions <apk>` (or `aapt dump permissions`) and appends the list, plus `aapt2 dump badging` lines for services/receivers if available, to `$GITHUB_STEP_SUMMARY`. Do this in the same edit as T03/T15 (same file).
Acceptance: the run summary shows the full permission list; the owner pastes it to an assistant, which fills section B of `docs/PERMISSIONS.md` and removes "NOT VERIFIED".

## Suggested order
T02a (owner, 10 minutes) -> T03+T15+T16 (same workflow file, one assistant), T04, T05, T06, T07 in parallel in different lanes -> T02b -> T08, T09 -> T10 -> T11 -> decision -> T12 -> T14. T13 whenever stranger results arrive.

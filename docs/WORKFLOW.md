# Shared workflow (several assistants, several accounts, one repo)

Why this exists: the owner has no paid plan, so each account hits its usage limit quickly. Work is split into small task cards (`docs/tasks/BACKLOG.md`) that any account or any assistant (Claude, ChatGPT, others) can finish in ONE session and hand over cleanly.

## 1. Rules that make sharing safe
1. **One task per session.** Pick the first unclaimed card whose dependencies are done. Do only that card.
2. **Lanes = disjoint folders.** Each card names its lane. Two accounts may work at the same time only in different lanes, so their `update.zip` files never overwrite each other.

| Lane | Files it may change |
|---|---|
| CI | `.github/`, `tools/` (except `shots-v1.py`), `package.json`, `package-lock.json` |
| DOCS | `docs/`, `README.md`, `AGENTS.md`, `AI_BRIEF.md`, `START_HERE_V2.md` |
| TESTS | `tests/` |
| APP | `web/` |
| NATIVE | `native/`, `signing/` |

3. **No file outside your lane.** If you need one, stop and write it under "Needs" in your log entry.
4. **Logs do not collide.** Do not append to `docs/HANDOFF.md`. Write `docs/log/YYYY-MM-DD_<task-id>.md` (max 25 lines: what changed, tests run and results, what is untested, next step).
5. **Version bump only for APP or NATIVE work** (`web/sw.js` cache name and the About version in `web/js/ui/settings.js`). Check the current number first. Other lanes never bump.
6. **Frozen without the owner's explicit OK:** application id, signing key/keystore, storage key `aryaApp2`, storage schema, backup format, native service architecture, UI redesign, removing features. Ask first, in the log under "Needs owner".
7. **Save usage:** read `AGENTS.md`, `docs/CURRENT.md`, `docs/WORKFLOW.md`, your task card. Do not read `docs/HANDOFF.md` whole or open `web/index.html` / `web/css/base.css` whole; use `grep -n` and `sed -n`.

## 2. Session protocol
Start
1. Owner downloads the NEWEST repo zip (after the last update.zip finished applying) and attaches it with the start prompt below.
2. Confirm the version in `web/sw.js` (`arya-vNNN`) matches `docs/CURRENT.md`. If not, say so and stop.

Do
3. Work on a copy. Keep changes small and independent.
4. Run what you can: `python3 tools/check-web.py`, `node tests/*.test.js`, and (if you have a browser) the Python UI tests relevant to your change. **If you cannot run tests, write "UNTESTED" in the log and in your reply.**

Finish
5. Write the log entry. Build `update.zip` with ONLY changed or new files (same paths as the repo). Add a `DELETE.txt` if files must be removed.
6. Reply to the owner in 5 lines or less: what was done, what was run, what is untested, which card is next.

## 3. If you run out of usage mid-task
Stop at a state where everything passes. Either deliver a smaller `update.zip` that is complete on its own, or deliver nothing and write `docs/log/WIP_<task-id>.md` (done so far, exact next steps, files touched, tests to run). The next account reads that file and continues. Never hand over a half-finished change inside `update.zip`.

## 4. Verify before apply
Anything produced without a browser (UNTESTED) goes through a **verify session** first: an account with a sandbox unpacks the repo, applies the zip, runs the full test suite, and reports pass/fail. Only then does the owner upload it. Native Java and workflow changes are verified by the first CI run: owner reports the Actions result back.

## 5. Definition of done (every card)
- Acceptance lines on the card are true, each with evidence (command output or screenshot name).
- Existing tests still pass; new behaviour has a test where the lane allows it.
- Log entry written, `update.zip` contains only intended files.
- Nothing in section 1 rule 6 changed.

## 6. Start prompt (copy into any assistant, attach the repo zip)
```
You are working on the AERUNO / Arya Fit repo (zip attached). Follow docs/WORKFLOW.md exactly.
Read only: AGENTS.md, docs/CURRENT.md, docs/WORKFLOW.md, and the task card <TASK-ID> in docs/tasks/BACKLOG.md.
Do ONLY card <TASK-ID>, inside its lane. Do not touch frozen things (WORKFLOW section 1 rule 6).
If you cannot run tests, say UNTESTED. Finish with: docs/log entry + update.zip (changed files only) + a 5-line reply.
If you are about to run out of usage, stop at a green state and write docs/log/WIP_<TASK-ID>.md.
```

## 7. Suggested split across accounts
Account 1 CI lane, Account 2 DOCS lane, Account 3 TESTS lane, Account 4 owner-device checks (owner runs, assistant writes the checklist), Account 5 verify sessions and APP/NATIVE work (needs a sandbox). Lanes never overlap, so these can run on the same day.

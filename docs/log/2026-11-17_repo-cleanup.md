# 2026-11-17 repo cleanup (Claude)
- Base: the owner's repo zip (28). It matched the assistant's working copy except two leftover screenshot folders.
- Removed: `.agents/` (third-party AI design toolkit, 3.8 MB, unused by the build), `docs/v2/reference/` (6 screenshots of another app, 4.3 MB), `docs/v1-simplify/after_p1`, `after_p2`, and most of the other V1 screenshots (kept 8 small JPEGs).
- Moved to `docs/archive/`: AI_BRIEF.md, CHATGPT_START.md, START_HERE_V2.md, the 190 KB HANDOFF history, the V2 spec notes (`docs/archive/v2/`). Archived files carry an ARCHIVED banner. `docs/HANDOFF.md` is now a short pointer. T06 done.
- Kept on purpose: `signing/debug.keystore` (the build needs it; changing it would stop updates installing over the old app, see T10), `docs/onboarding/` (the exercise seed file is read by `tools/build-exdb.py`, `tools/qa-report.py` and `tests/exdb.test.js`), licenses and third-party notices, all of `web/`, `native/`, `tools/`, `tests/`, `.github/`.
- Updated references: AGENTS.md, README.md, docs/CURRENT.md, docs/WORKFLOW.md, BACKLOG, onboarding notes.
- No app code touched, no version bump. Old files remain in git history (removal from history was not done).

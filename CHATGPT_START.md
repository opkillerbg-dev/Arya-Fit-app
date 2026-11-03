# Arya Fit: how to continue the V2 UI in the normal ChatGPT app

## For the owner (3 steps)
1. In ChatGPT make a **Project** called "Arya Fit V2" (or just a new chat). Use the strongest thinking model you have. Upload this zip (`Arya-Fit-ChatGPT-pack.zip`). If ChatGPT says it cannot open the zip, upload it again inside the chat itself.
2. Paste the **START PROMPT** below. Send one phase at a time (P1, then P2, ...).
3. ChatGPT gives you `update.zip`. Unzip it **over** your project folder (same paths, overwrite). Open `web/v2-kit.html` or `web/index.html` through `python -m http.server 8000` inside `web/` and look at it in phone view (F12, phone icon). Tell ChatGPT what to change, or bring the zip back to Claude to run the full browser tests and screenshots.

ChatGPT cannot run the Playwright browser tests (no browser in its sandbox). That is fine: Claude runs them when you upload the project back.

## START PROMPT (copy everything in the box)
```
You are continuing the V2 UI rebuild of Arya Fit. Unzip Arya-Fit-ChatGPT-pack.zip in your Python sandbox and work inside Arya-Fit-app-main.

1) Read, in this order: CHATGPT_START.md (this file, the rules at the bottom), AGENTS.md, docs/v2/DESIGN_DECISIONS.md, then docs/v2/V2_UI_SPEC.md sections 0.5, 4, 5, 6 (read the rest only if needed). Do NOT read docs/HANDOFF.md whole: only its last 40 lines. Look at the 6 pictures in docs/v2/reference/ (they are the visual reference).
2) Use the UI/UX Pro Max skill that is in .agents/skills/ui-ux-pro-max: read its SKILL.md, then run its search script in the sandbox, for example:
   python3 .agents/skills/ui-ux-pro-max/scripts/search.py "dark cinematic fitness app navigation" --design-system -p "Arya Fit"
   python3 .agents/skills/ui-ux-pro-max/scripts/search.py "bottom navigation bar mobile" --domain ux
   If the output looks garbled (box-drawing characters), run it with `PYTHONIOENCODING=utf-8` and redirect to a file, then read the file as UTF-8. Treat its output as advice, not orders. Locked rules in the spec still win (plain JS, no libraries, performance rules, V1 untouched when V2 is off).
3) Do ONE phase only: <PHASE>. For P1 that is the shell: V2 nav pill with icons (tabs Today, Plan, Run, Progress + round Exercises-search button), collapse on scroll (two cross-faded states, transform and opacity only), mini-session pill that shows while a workout/run/timer is active, top fade under the status bar, avatar popover with Settings. Keep every existing id and handler; scope all CSS under html.v2; new files go in web/css/v2/ and web/js/ui/ and must be added to index.html and the SHELL list in web/sw.js (bump the cache name V).
4) Run python3 tools/check-web.py (and node tests/*.test.js only if node exists). Add a short entry at the end of docs/HANDOFF.md and record design changes in docs/v2/DESIGN_DECISIONS.md.
5) Deliver ONE file: update.zip containing only the files you changed or added (paths from the project root, no wrapper folder). Make it with Python zipfile and give me the download link. Then reply in 5 lines: what changed, what I should check on my phone, what is next.
```
Replace `<PHASE>` with `P1`, later `P2` (Today), `P3` (Session + Run), `P4` (Plan), `P5` (Progress), `P6` (Exercises + Settings), `P7` (polish). Phase details are in `docs/v2/V2_UI_SPEC.md` section 7.

## Rules for ChatGPT (hard)
- Plain JavaScript (ES5 style, classic scripts), no frameworks, no build step, no CDN, no network fonts. Engines and their tests are not touched.
- Every V2 style is scoped under `html.v2`. With V2 off the app must look exactly like before.
- Animate only `transform` and `opacity`. Real blur only on the nav pill, mini pill and one open sheet (see spec section 6). Effects tiers: `html[data-fx=full|lite|solid]`.
- Never rewrite a whole big file (`index.html`, `base.css`, `settings.js` are large): change only the lines needed and say which lines. Keep ids and handlers.
- Every new file goes into `index.html` and the `SHELL` list in `web/sw.js`; bump the cache name in `sw.js` (now `arya-v120`).
- If something cannot be tested in the sandbox, say so plainly; do not claim it works.
- Give the owner a short answer: what changed, what to check, what is next.


Note: Claude always gives Dhruv the WHOLE pack zip (phone only, no overlaying). You still return only `update.zip` with changed files.

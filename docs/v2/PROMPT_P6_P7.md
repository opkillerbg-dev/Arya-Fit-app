# Prompt for ChatGPT: finish V2 (P6 + P7 in one pass)

Continue the V2 UI rebuild of Arya Fit. Unzip Arya-Fit-ChatGPT-pack.zip in your Python sandbox, work inside Arya-Fit-app-main. Read first: CHATGPT_START.md, AGENTS.md, docs/v2/V2_UI_SPEC.md (0.5), docs/v2/DESIGN_DECISIONS.md, docs/v2/CLAUDE_HANDOFF_NOTE.md, and only the TAIL of docs/HANDOFF.md. Use the UI/UX Pro Max skill in .agents/skills.

TASK (finish V2, one pass):
P6: Exercises (library, search, exercise detail, picture/A-B viewer, filters, custom exercise forms) + Settings hub (grouped settings list in BitChord style: icon rows, grouped cards, toggles, accent picker, effects/theme, data import/export, reminders, voice, plan management, About). Also all remaining global UI: drawer (#ax-drawer), toasts, confirm dialogs, onboarding, boot/splash, empty states, inputs/selects/steppers, the Smart Today card and the Today avatar popover.
P7: polish. (a) Light theme for V2 (tokens under html.v2[data-theme=light] or existing theme switch; true black stays default dark). (b) Accessibility: contrast >= 4.5:1 body text, tap targets >= 44px, visible focus rings, aria-labels, prefers-reduced-motion, screen-reader order. (c) Fix open gaps: duplicate "Progress, in context" header in Progress; hero exercise title tight at top of session hero card; stray "TIME" label near stopwatch hero; Today avatar overlapping the big title; V2 off must remove ALL V2 DOM (.v2-today-* nodes still stay hidden in DOM). (d) Make V2 the DEFAULT for new installs and for existing users after a one-time "Try the new look" prompt, keep Settings toggle "Classic look" to go back; V1 code stays. (e) Remove nothing from V1 behaviour.

Rules: presentation layer only, all existing IDs/handlers/data/persistence unchanged, scoped under html.v2. New files: list in index.html AND SHELL in web/sw.js; bump cache (currently arya-v127) by one.

MISTAKES ALREADY MADE (do not repeat):
1. V1 cream leaks into V2: V1 skins (html[data-skin=oldmoney]) and glass (html.gls .ax-card{background:...!important}) force cream backgrounds, dark text, Georgia; V1 also has ID selectors like `#ax-v-prog .ax-pseg` and sticky mask shadows `0 0 0 8px var(--bg)`. Fix: give EVERY V2 node explicit background, color AND font-family; write selectors as `html.v2 body #id .x` (match V1 ID specificity) with !important where V1 uses it; restyle inner parts too (.ax-bd, .ax-exs, .ax-chip, .ax-opt, summary/details, inputs, selects, toasts, rings .ax-wr/.ax-fs conic-gradients, box-shadow rings).
2. White text on cream: always set background and color together.
3. Global sheets (#ax-sh) must be dark and above nav pill (z 120/119); floating #dock above mini pill (body.td); fullscreen dock inset:0 z 95.
4. Hooking AxV2.apply is not enough (callers use internal function): also hook go(), and re-enhance after innerHTML re-renders (idempotent). NEVER put a MutationObserver on <html> that runs on every class change: it broke tests/browser_test.py ("damaged data: user told"). Act only when the `v2` class actually flips (compare previous state).
5. Live toggle with NO reload (AxV2.setEnabled) both ways; off leaves no V2 DOM/classes.
6. Playwright: V2 nav collapses on scroll and intercepts clicks, use page.evaluate("go('plan')"); wait_for_function(expr, arg=..., timeout=...) keyword args; fake date with add_init_script (demo plan ended 31 Oct 2026; tests/reminder_test.py fails for that reason, not your bug). Run Python UI tests in small batches (each 20-40 s, total >5 min).
7. Fonts bundled: Inter 400/700, Big Shoulders Display 900, Instrument Serif italic only.
8. Do not claim what you could not verify; say plainly (no real browser/phone).
9. Lean: no big rewrites of V1 files, no reprinting unchanged files.

SELF-CHECK: python3 tools/check-web.py; all node tests/*.test.js; all Python UI tests you can; bisect any failure by disabling your scripts one by one. Scan every view (home, plan, timers, prog, exercises, settings, drawer, sheets) at 390x844 under html.v2 AND light theme for light backgrounds on dark theme (luminance>170, alpha>.5) and low contrast; fix every hit.

DELIVER: ONE file update.zip, only changed/added files (paths from project root, no wrapper), made with Python zipfile, plus docs/HANDOFF.md entry appended. Reply in 5 lines: what changed, what to check on my phone, what you could not verify, what is next (final Claude QA + APK build).

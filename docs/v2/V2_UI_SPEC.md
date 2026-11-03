# Arya Fit V2: UI rebuild spec

For: Codex / Antigravity / any coding AI. Owner: wants a "proper" new UI called **V2**. Read section 0.5 first (what is locked and what is yours to improve), then the rest of this file, then `AI_BRIEF.md` and `docs/HANDOFF.md` (newest entries last), then look at every picture in `docs/v2/reference/`.

## 0. Goal in one paragraph
Rebuild the look and navigation of Arya Fit (workout app, plain JS in `web/`, Android APK through Capacitor) in the style of the reference screenshots: **dark, picture-first, floating glass navigation, big rounded cards in horizontal rows, grouped settings cards, one accent colour**. The references are screenshots of a music player (BitChord). We copy the *layout ideas and feel only*, and are encouraged to go beyond them. Music features, names, text, icons and artwork are NOT copied. Every feature of Arya Fit keeps working; only presentation, navigation and screen layout change.

## 0.5 How strict is this file? (read before everything else)
The owner is installing a **UI/UX Pro Max** design skill and wants the AI to use its own design judgment to make the UI *better than this file describes*. So this spec has three levels:
- **LOCKED (never change):** section 1 (technical rules), section 2 (facts about the app), section 6 (effects tiers and performance), and the data/privacy rules in `AI_BRIEF.md`. These protect the app from breaking, dropping frames or losing data.
- **GUIDED (strong defaults, improve them if you can):** sections 3 to 5 and 7: the look, tokens, type, components, screen map and phase order. They are a starting point, not a cage. If your design skill or your own judgment finds a better layout, spacing, colour, hierarchy, motion or flow, **do it**, as long as the LOCKED rules and the acceptance checklist still pass.
- **FREE (your call):** anything this file does not mention: micro-interactions, empty states, illustrations, icon style, copy tone, extra screens or flows that make the app feel more premium, small features that fit the theme.

**Workflow**
1. Before writing code, run the UI/UX Pro Max skill on this file and the screenshots in `docs/v2/reference/`. Ask it for a design direction for a dark, picture-first, cinematic fitness app (style, palette and accent options, font pairing, spacing, motion, component patterns, UX checks). Use whatever it offers (guidelines, searchable style/palette/font data, checklists) rather than guessing.
2. Write `docs/v2/DESIGN_DECISIONS.md`: the direction you chose, anything you changed from sections 3 to 5, and one line of reason for each change. Keep it short.
3. Build the component kit page first (P0, `web/v2-kit.html`) so the owner can judge the look on a phone before the screens are built. If you have two strong directions, offer both as two kit variants (one switch, `html[data-look=a|b]`) and let the owner pick.
4. After each phase, review your own screens critically like a senior product designer (hierarchy, contrast, spacing, thumb reach, empty and error states, one-handed use, motion that explains rather than decorates) and fix what is weak before delivering.
5. **When this file and good design disagree, good design wins, except where LOCKED.** Write the deviation in `DESIGN_DECISIONS.md`.
6. Do not ask the owner for permission on small design choices; decide, record, move on. Ask only when a choice changes scope (adding or removing a feature) or cannot be undone.

## 1. Non-negotiable rules (LOCKED)
1. **No framework, no library, no build step, no modules.** Classic scripts, ES5 style, like the rest of the app. Plain CSS (variables, grid, flex, `color-mix` allowed because the app already uses it).
2. **Do not touch the engines** (`features/plangen.js`, `levelcalc.js`, `coachcalc.js`, `progression.js`, `runcalc.js`, `store.js`, `profile.js` and every file with a node test). V2 only changes UI files, CSS and markup.
3. **Keep every existing `id`, `data-*` hook and handler.** Move or restyle nodes, never rebuild them (see the comment at the top of `js/ui/settings.js`: "Existing nodes are MOVED, never rebuilt"). Other scripts wrap `go()` and `home()` and watch views' `hidden` attribute; do not break that.
4. **Scope everything under `html.v2`.** V2 must be switchable (Settings > Appearance > "New look (V2)", default OFF until the owner signs off), so the old UI keeps working during the whole migration. New CSS lives in new files; do not add more `!important` layers to the old files.
5. **Performance is a feature.** The owner already fought frame drops (see v116 smart loading screen, `js/features/bootgate.js`). Rules in section 6 are mandatory.
6. **Offline and private.** No network fonts (today's Google Fonts links are removed under V2), no CDNs, no analytics. Everything is bundled and listed in the `SHELL` list of `web/sw.js`; bump the cache name `V` on every change; every new file also needs a `<script>` or `<link>` tag in `web/index.html` (CI `tools/check-web.py` fails otherwise).
7. **Do not copy code, assets, icons or text** from BitChord or any other app. Do not use Apple trademarks in the UI ("Liquid Glass" may appear in code comments only; in the UI call it "Glass effects").
8. Health and privacy rules from `AI_BRIEF.md` still apply (metric storage, no health inference, never overwrite a plan).

## 2. What the app is today (facts to build on)
- Views (sections): `#ax-v-home`, `#ax-v-plan`, `#ax-v-timers` (labelled **Run** in the nav), `#ax-v-prog` (Progress), `#ax-v-set` (Settings hub), `#ax-v-plans`. Day card `#ax-day`, workout drawer `#ax-drawer`, progress ring `#ax-ring`, Coach `#ax-coach-open`, boot splash `#ax-boot`.
- Nav today: `<nav id="ax-nav" class="ax-nav">` with 5 buttons `data-v="home|plan|timers|prog|set"` labelled Home, Plan, Run, Progress, Settings. A heavy glass style for it already exists in `css/heavy-glass-nav.css` (many `!important` rules) with a lite fallback class `ax-lite-glass` set by `js/core/adaptive-glass.js`.
- Skins: `html[data-skin=oldmoney|modern|professional|midnight|sunset]` plus classic; dark via `html.amo` (AMOLED) and `data-theme`. Variables in `css/base.css`: `--bg --card --ink --mut --line --blue --bluet --ok --okt --sun --hero`. Fonts: DM Sans, Barlow Condensed loaded from Google Fonts over the network (not bundled); Old Money forces Georgia with `!important`.
- Exercise pictures: `web/images/exercises/arya-ex-<slug>-<a|b|c|d>.webp` (1024x1024, flat illustration on cream #FAF6EB) and masks `web/images/exercise-masks/*.png` that recolour the clothing per skin. Mapping in `js/core/exercise-media.js` (`EXI`, `exSlug`). A picture can be missing; handle it.
- Known mess to avoid repeating: `css/base.css` (96 KB) plus patch layers (`heavy-glass-nav.css`, `liquid.css`, `perf-fallback.css`, `run-polish.css`) fight each other with `!important`. V2 starts clean.
- Tests: 18 Playwright files (`tests/*_test.py`) and 13 node tests. They depend on ids and visible text. Keep them green with V2 OFF, and add V2 versions.

## 3. Reference pictures (`docs/v2/reference/`)
| File | What it shows | What to take |
|---|---|---|
| `01-home-floating-nav-mini-player.jpg` | Home. Large square cards in a horizontal row, big bold section titles ("Albums & singles"), titles under cards with a grey second line. Bottom: a floating **glass pill** with 3 tabs (active tab in a lighter inner pill, icon + label) and a separate **round glass search button**; above it a **glass mini-player pill** (thumbnail, title, subtitle, play, next). | Card rows, section titles, floating nav pill + round button, mini pill |
| `02-scrolled-collapsed-nav-list-rows.jpg` | Same home scrolled. The nav has **collapsed**: a small round Home button on the left, the mini-player pill in the middle, round search on the right. Content also has compact list rows (thumb, title, grey subtitle, three-dot), a wide card row, and 2x2 collage cards. Top edge fades/blurs under the status bar. | Collapse-on-scroll nav, list rows, progressive blur at the top edge |
| `03-account-popover-glass.jpg` | Account switcher as a **glass popover** with large rounded corners: title, current account with check, rows with icon + label (Add, Manage, Settings). Background dimmed. | Profile popover from an avatar button |
| `04-settings-hub-grouped-cards.jpg` | Settings: collapsing **large title** (huge, heavy), round glass **back button** top-left, a **search field**, rows grouped in rounded dark cards with hairline dividers, icon left, title + grey description, chevron right, small value text ("Lossless"), "IN USE" chip, toggle. Section label in small caps ("AUDIO QUALITY"). | Settings layout |
| `05-appearance-toggles-effects.jpg` | Appearance page: **segmented control** (System / Light / Dark), font row, and toggles each with a one-line explanation: "Reduce animation", "Reduce dynamic blur", "Liquid Glass ... uses more GPU", "Progressive Blur", full-screen cover art. Green toggles. | Effects settings and toggle style |
| `06-settings-long-list-toggles.jpg` | Long list of toggles/rows with explanations, same style. | Row component variety |

Ignore status-bar content, the network-speed text, the floating avatar bubble top-right and everything music-specific.

## 4. Design language (GUIDED: strong defaults, improve freely)
### 4.1 Tokens (put in `web/css/v2/tokens.css`, all under `html.v2`)
```
--v2-bg: #000;                 /* true black (OLED) */
--v2-surface: #1c1c1e;         /* cards, grouped rows */
--v2-surface-2: #2c2c2e;       /* raised: active tab pill, chips, segmented thumb */
--v2-line: rgba(255,255,255,.08);
--v2-line-strong: rgba(255,255,255,.22);  /* outline numerals, ghost text */
--v2-text: #fff;
--v2-text-2: rgba(255,255,255,.62);   /* subtitles, descriptions */
--v2-text-3: rgba(255,255,255,.38);   /* disabled, hints */
--v2-accent: #30d158;          /* default accent (toggles, active states, progress) */
--v2-accent-ink: #04210e;      /* text on accent */
--v2-danger: #ff453a;
--v2-glass-fill: rgba(40,40,44,.55);   /* Full tier, under blur */
--v2-glass-solid: #232326;             /* Lite/Solid tiers, no blur */
--v2-glass-edge: rgba(255,255,255,.14);/* 1px border */
--v2-glass-hi: rgba(255,255,255,.10);  /* top inner highlight */
--r-card: 28px; --r-group: 24px; --r-sheet: 32px; --r-btn: 16px; --r-pill: 999px;
--sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:24px; --sp-6:32px;
--tap: 48px;                   /* minimum touch target (never below 44) */
--ease: cubic-bezier(.2,.8,.2,1); --dur-1:140ms; --dur-2:240ms; --dur-3:380ms;
```
**Accents** (user choice, replaces the 5 skins in V2): Green `#30d158` (default), Blue `#4f7bff`, Ruby `#ff3b5c`, Teal `#3fcfae`, Orange `#ff7a45`, Gold `#e8c15a`. Setting `html[data-accent=...]` only changes `--v2-accent` and `--v2-accent-ink`. Light theme is **phase 7, later**: build every colour through tokens so a light token set can be added without touching components.

### 4.2 Typography: cinematic, poster-grade (replaces the old "system stack only" idea)
**Intent:** the app should read like a film title sequence and a sports poster: huge confident headlines, tiny widely-spaced labels, big numbers, and one elegant italic accent word. Contrast of scale is the whole trick: very big next to very small, very heavy next to very light. Think movie poster, Nike campaign, A24 title card.

**Fact about today's app:** `web/index.html` loads DM Sans and Barlow Condensed from Google Fonts over the network (lines 16-17). Offline or on a bad connection they never arrive and the app silently shows system fonts, and the request competes with boot. **V2 bundles all fonts locally** (woff2, Latin subset) and removes the Google Fonts links under V2.

**Font set (max 3 families, all SIL OFL, free to bundle; add each to `docs/THIRD-PARTY-NOTICES.md`):**
| Role | Family (default) | Weights | Used for |
|---|---|---|---|
| Display | **Big Shoulders Display** (alt: Anton, or Barlow Condensed 800) | 800, 900 | Hero titles, day names, giant numbers. Tall condensed, UPPERCASE, poster feel |
| Editorial accent | **Instrument Serif** italic (alt: Playfair Display italic) | 400 italic | ONE word per headline for contrast ("Push *day*"), quotes, end cards |
| UI / body | **Inter** variable (alt: system stack) | 400-800 | Everything else: rows, buttons, descriptions, settings |
Rules: Latin subset only, `font-display: swap`, total of all font files **<= 160 KB**, every file in the `SHELL` list in `web/sw.js`, preloaded by `boot.js` (the boot gate already waits for `document.fonts`). Provide a fallback stack for each (`"Arial Narrow", Impact` for display, `Georgia` for serif, `system-ui` for UI) with `size-adjust`/`ascent-override` on the `@font-face` fallbacks so nothing jumps when the real font arrives. Hindi/Gujarati and other scripts fall back to system fonts: never force the display face onto them (use `:lang()` or `unicode-range`).

**Type scale (use clamp so it follows screen width; design at 390 px):**
| Token | Spec | Example |
|---|---|---|
| `--t-hero` | Display 900, `clamp(56px, 17vw, 84px)`, line-height .88, UPPERCASE, letter-spacing -.01em | "PUSH DAY" on Today |
| `--t-title` | Display 800, 40px / .92, UPPERCASE | Page titles: PROGRESS, PLAN |
| `--t-section` | Display 800, 28px / 1, UPPERCASE, +.02em | Section headers over card rows |
| `--t-numeral` | Display 900, `clamp(64px, 22vw, 112px)`, `font-variant-numeric: tabular-nums`, line-height .8 | Reps, streak, kcal, pace, weight |
| `--t-eyebrow` | UI 700, 11px, UPPERCASE, **+.28em** tracking, accent colour | "WEEK 3 · DAY 2", "NEXT UP" |
| `--t-accent` | Serif italic 400, 1.15x the size of the line it sits in, normal case, tracking 0 | the one word in *italic* |
| `--t-card` | UI 700, 17px / 1.2 | Card titles |
| `--t-body` | UI 500, 16-17px / 1.4, `--v2-text-2` for secondary | Descriptions |
| `--t-caption` | UI 600, 12px, +.04em | Chips, hints |
Never set long text in the display face or in all caps; display + caps only for 1-3 words per line. Minimum body size 15px. Everything uses `rem`/`clamp` so the Android system font-size setting still scales it (test at 130%).

**Composition techniques (the "graphic designer" part):**
1. **Eyebrow + hero + accent word.** Three-line lockup: tiny tracked eyebrow, giant condensed title, and one italic serif word. Example: `WEEK 3 · DAY 2` / `PUSH` / *day*. Left-aligned, tight line-height, 16px gutter.
2. **Scale contrast.** Always pair a giant element with a tiny one on the same screen; avoid mid-sized everything.
3. **Giant numerals** for the one number that matters on a screen (current rep, streak, weight, pace). Unit is tiny, tracked, and sits on the numeral's baseline.
4. **Outline numerals / ghost text** as static decoration: `-webkit-text-stroke: 1.5px var(--v2-line-strong)`, transparent fill, very low contrast, behind content (e.g. a huge "03" behind the day card). Static only; never animate stroke text.
5. **Text over pictures:** only on a bottom-up scrim (`linear-gradient(to top, rgba(0,0,0,.75), transparent 60%)`), never on a blurred layer; keep contrast >= 4.5:1.
6. **Cinematic title cards** for moments: workout start ("PUSH *day*" with a 600 ms reveal), PR achieved, and workout complete, which is a full-screen end card: giant "DONE." then stats in a credits-style column (eyebrow label, numeral value, repeated). Keep each under 2 seconds and skippable with a tap; none in Solid tier except the static card.
7. **Reveal animation = line mask:** each headline line sits in an `overflow:hidden` wrapper and its inner span slides up with `transform: translateY(100%) -> 0` (+ `opacity`), 380ms `--ease`, 60ms stagger per line. Transform and opacity only. **Never animate letter-spacing, font-size, font-weight or filter/blur on text** (layout/paint cost). Respect "Reduce animation" (show the final state at once).
8. **Gradient text** only for one hero element at most, static (`background-clip: text`), from `--v2-text` to a 60% tint of the accent; no animated gradients.
9. **Alignment & rhythm:** one left edge per screen, 8pt grid, section titles always 24px above their row and 12px below; do not centre long titles; centre only numerals on the Session screen and end cards.
10. **Wordmark:** "ARYA FIT" set in Display 900 with +.12em tracking and an accent dot; used on the splash (`#ax-boot`), Settings > About and the end card. The splash may reveal the wordmark with the line-mask technique; it must not delay the smart boot gate.
11. **Microcopy voice:** short, confident, verbs first ("Start", "Next up", "Log set"). Headline case: display lines UPPERCASE; everything else sentence case.

**Performance and quality rules for type:** no `text-shadow` glows on large areas (one 1px dark shadow max for text on pictures), no `filter: drop-shadow` on text, no per-letter DOM splitting beyond a hero title of <= 12 letters, no web-font loading after boot, headings use `text-wrap: balance` where supported, `font-kerning: normal`, `text-rendering: optimizeSpeed` on long lists. Check the display font at 2 sizes on a real phone: condensed fonts get hard to read below 24px, so never use Display under 24px.

### 4.3 Components (build each once in `web/css/v2/components.css`, reuse everywhere)
1. **Nav pill (`.v2-nav`)**: floating, `left/right: 16px`, `bottom: calc(12px + var(--ax-sab))`, height 64, radius pill, glass. Tabs are icon over 11px label, equal width; active tab = inner pill (`--v2-surface-2` + soft highlight) that slides between tabs using `transform` only. Next to it a separate **round action button** (64x64, glass) .
2. **Collapsed nav**: on scroll down (after 24px, direction-aware with hysteresis) the pill cross-fades to a compact state: round button of the current tab (left), **mini-session pill** (middle, if a session is active), round action button (right). On scroll up or at top it expands back. Implement as two stacked DOM states cross-faded with `opacity` + `transform`. **Never animate width/height/left/right.**
3. **Mini-session pill (`.v2-mini`)**: glass pill above the nav (gap 8px), height 64, shows only while a workout, run or timer is active. Left: 48px rounded thumbnail (the current exercise picture from `exercise-media.js`, or an icon for runs/timers). Middle: title (exercise or "Run"), subtitle ("Set 2 of 4 · 0:45" or distance/time). Right: play/pause and next. Tap opens the full session (existing drawer `#ax-drawer` / Run view `#ax-v-timers`; reuse them, restyled). Thin progress hairline along the bottom edge is optional.
4. **Section header**: 24px/800 title, optional "See all" text button right.
5. **Card row (`.v2-row-cards`)**: horizontal scroller, `scroll-snap-type: x proximity`, 16px side padding, 12px gap, **next card peeks** (card width = (100vw - 16*2 - 12) / 2 so about 1.9 cards show). Card = square picture with `--r-card`, title (17/700, single line, ellipsis) and a grey second line below. Picture area uses `object-fit: cover`; exercise pictures are cream, so give their tile a neutral dark plate (`--v2-surface`) with the picture inset 6% to keep edges calm.
6. **Wide card** (about 1.2 cards visible) for the day's workout / featured items; **collage card** (2x2 of exercise pictures) for plans or categories.
7. **List row (`.v2-li`)**: 64px high, 56px thumb (radius 14), title, grey subtitle, trailing three-dot or chevron or value.
8. **Grouped card (`.v2-group`)** for settings: `--v2-surface`, `--r-group`, rows separated by 1px `--v2-line` inset from the icon edge. **Row (`.v2-setting`)**: optional 24px icon, title 17/500, description 15/500 grey (wraps), trailing: chevron / value text / chip ("IN USE") / **toggle**.
9. **Toggle**: 51x31, off `--v2-surface-2`, on `--v2-accent`, white knob that moves with `transform`.
10. **Segmented control**: 3 options, `--v2-surface` track, `--v2-surface-2` thumb that slides with `transform`.
11. **Large collapsing title** for top-level pages (Settings, Progress): 34/800 at the top that shrinks into a small centred title in the top bar while scrolling (opacity + transform, no layout animation). **Round glass back button** (48px) on sub-pages.
12. **Search field**: 48px, `--v2-surface`, radius 16, icon left, used in Settings and Exercises.
13. **Sheet / popover**: `--r-sheet`, glass, dimmed scrim `rgba(0,0,0,.5)`, opens with `transform: translateY` + `opacity`. Profile popover (ref 03) opens from an avatar button top-right of Home.
14. **Top edge fade**: a fixed gradient from `--v2-bg` to transparent under the status bar (height = safe-area-top + 24px). This is the cheap replacement for "progressive blur".
15. **Primary button** (accent fill, `--v2-accent-ink` text, radius 16, 52px), **secondary** (`--v2-surface-2`), **text button**.
16. **Chips** (small pills), **progress ring/bar** in accent, **empty states** (picture + one line + one button).

## 5. Information architecture (GUIDED: proposed; improve if you find a better flow)
Nav tabs (4 + round button): **Today** (`home`), **Plan** (`plan`), **Run** (`timers`), **Progress** (`prog`); round button = **Exercises search** (opens the library/search sheet from `features/library.js`). **Settings** moves behind the avatar button top-right of Today (popover: Profile, Settings, Backup/Export), exactly like ref 03/04. Keep `data-v` values so the existing `go()` works; add a hidden `set` route.
Screens and what each gets:
- **Today**: greeting + avatar button; hero "Today's workout" wide card with Start; progress ring/streak as a compact row; rows: "Up next" (exercise cards from the day's plan), "Your plan this week" (collage cards), "Recent PRs", Coach entry (`#ax-coach-open`) as a list row; weather/readiness as small chips only if present today.
- **Plan**: week strip, day list rows, plan switcher cards (`#ax-v-plans`), generate/retest entries (`[data-sp='plan']` rows move into a grouped card).
- **Session** (mini pill expands): big exercise picture (A/B frames flip like today), title, set/reps/weight, timer, play/pause, next/previous, voice / hands-free toggles as small buttons. Reuse existing timer and set-logging code.
- **Run**: GPS run controls, live stats big numerals, map card; history as list rows.
- **Progress**: large title, summary cards row, PR list rows, body heat map card, badges row, history list.
- **Exercises**: search field, filter chips (pattern, equipment), card rows by pattern; detail sheet with pictures and cues.
- **Settings** (hub): search field, grouped cards (Account & Profile, Plan & Coach, Training, Run, Appearance, Sound & Voice, Data & Backup, About). Appearance page = ref 05: Theme segmented control, Accent colour row, **Effects** group (see 6), "New look (V2)" toggle.

## 6. Effects tiers and performance (LOCKED, mandatory)
Three tiers set on the root: `html[data-fx="full|lite|solid"]`.
- **full**: real `backdrop-filter: blur(24px) saturate(1.6)` on **at most three** elements at once: the nav pill, the mini pill, and one open sheet/popover. Everything else is flat colour.
- **lite**: no `backdrop-filter` anywhere; glass = `--v2-glass-solid` + 1px edge + top highlight gradient.
- **solid**: no gradients, no shadows beyond one 1px edge; no transitions except opacity.
Rules:
1. Choose the tier automatically after boot from `window.axBootInfo` (set by `js/boot.js` / `AxBootGate`): `reason==="stable"` and `tier==="strict"` and `fps >= 0.9 * refresh` -> **full**; `tier==="relaxed"` -> **lite**; `reason==="timeout"` -> **solid**. Also respect `prefers-reduced-motion` and `prefers-reduced-transparency` (force lite or solid) and the old `ax-lite-glass` signals from `js/core/adaptive-glass.js`.
2. Settings > Appearance > Effects offers **Auto / Full / Lite / Solid** plus "Reduce animation" (all motion off, sheets just appear). Store the choice with the app's existing settings store (read `core/store.js` first, do not invent a new storage scheme).
3. A **runtime guard** watches frames for 5 s after every screen change in the first minute; if more than 3 hitches (frame > 2.5x the refresh interval) occur it steps the tier down once and remembers it until the owner resets to Auto.
4. Animate **only `transform` and `opacity`**. Never animate width, height, top/left, margin, box-shadow, filter or backdrop-filter. Use `will-change` only on the nav, mini pill and sheets, and remove it when idle.
5. No blur on scrolling content, no blur inside lists, no full-screen blurred layers, no animated gradients/mesh behind content, no looping animations while a workout timer runs.
6. Images: `loading="lazy"`, `decoding="async"`, fixed `width`/`height` or `aspect-ratio` so nothing shifts; card rows render only visible cards plus 2 (simple windowing or `content-visibility: auto` with `contain-intrinsic-size`).
7. Budgets to verify: 60 fps scrolling on the Today screen with 4x CPU throttle in Chromium for the **lite** tier; the boot gate must still report `stable` in `tests/boot_ui_test.py` with V2 ON; no layout shift on first paint; JS added by V2 under 40 KB total, CSS under 60 KB.

## 7. Build plan (GUIDED: default order, one phase per delivery)
- **P0 Foundations**: `css/v2/tokens.css`, `components.css`, `shell.css`; `js/ui/v2-core.js` (toggle `html.v2`, accent, fx tier, scroll direction helper); Settings toggle "New look (V2)" (default OFF); `docs/v2/V2_COMPONENTS.md` listing every component with HTML snippet; a hidden test page `web/v2-kit.html` (not in nav) showing all components for visual review. Node test for the tier-choice and scroll-direction logic.
- **P1 Shell**: V2 nav pill + round button + collapse-on-scroll + mini-session pill + top edge fade + avatar popover. Old nav hidden under `html.v2`. Playwright: nav routes to each view, collapse/expand, mini pill appears when a session starts.
- **P2 Today** (first screen to get the full cinematic lockup, giant numerals and reveal; also bundle fonts in P0: `web/fonts/*.woff2`, `@font-face` in `css/v2/fonts.css`, SHELL list, notices).
- **P3 Session + Run**.
- **P4 Plan + Plans**.
- **P5 Progress**.
- **P6 Exercises + Settings** (hub, Appearance, all rows moved into grouped cards without losing a single setting).
- **P7 Polish**: light theme tokens, accessibility pass (contrast >= 4.5:1 for text, focus order, labels, reduce motion), remove dead V1 CSS only after the owner signs off, make V2 the default.
Each phase: all old tests pass with V2 OFF, new Playwright test passes with V2 ON at 390x844 and 360x800, `python3 tools/check-web.py` OK, SW cache bumped, `docs/HANDOFF.md` entry (what, why, how to tune), screenshots of every changed screen saved in `docs/v2/shots/` (V2 ON, full and lite).

## 8. Open decisions (decide with your design skill, record in `DESIGN_DECISIONS.md`; defaults below if unsure)
1. Tabs: 4 + round Exercises button, Settings behind avatar (default as in section 5).
2. Skins: V2 uses dark + accent colours; the 5 old skins stay for V1 only (default). The exercise picture masks keep recolouring the clothing from the chosen accent (hook up in P2 using the existing mask code).
3. Fonts: Big Shoulders Display + Instrument Serif italic + Inter, bundled locally (default, section 4.2). If a font file cannot be obtained, use the listed alternates or the fallback stack and say so in HANDOFF.
4. Light theme: after P6 (default).

## 9. Acceptance checklist (every screen)
- Feels premium and coherent, at least as strong as the reference feel: true black, heavy type, rounded surfaces, floating glass nav, one accent, and the cinematic type lockups of section 4.2 (eyebrow + giant condensed title + one serif italic word, giant numerals).
- Fonts load offline, no layout jump when they arrive, no Display face under 24px, text stays readable at 130% system font size.
- No horizontal page scroll; works at 360, 390, 412 px wide and with large system font; safe areas respected (status bar, gesture bar).
- Touch targets >= 44 px; every icon button has an `aria-label`; focus ring visible.
- No text copied from the references; no music wording anywhere.
- Works with a missing exercise picture, empty plan, first launch (wizard), and long text (ellipsis, no overlap).
- fx tiers all render correctly; `solid` has no blur or shadow.
- Old UI untouched when V2 is OFF; all existing tests still pass.

## 10. Delivery
- Working in the git repo directly (Codex / Antigravity with repo access): normal commits, one branch per phase, then skip the `update.zip` flow.
- Working from a zip: follow `AI_BRIEF.md` (one `update.zip` with every changed file, paths from the repo root; repo zip + update.zip must equal the working tree; the owner uploads one zip at a time and waits for "Apply update").
- Always run before delivering: `python3 tools/check-web.py`, `for t in tests/*.test.js; do node $t; done`, `for t in tests/*_test.py; do python3 $t; done`.
- Keep replies to the owner short; list what changed, what to check on the phone, and what is next.

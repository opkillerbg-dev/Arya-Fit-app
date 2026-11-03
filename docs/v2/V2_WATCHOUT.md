# Arya Fit V2 — Watchout / Final QA Register

**Created:** 2026-11-03  
**Baseline:** V2 P7 implementation, cache `arya-v129`  
**Purpose:** Record all outstanding issues identified during the full V2 audit before final QA and APK release.

This is a watchlist, not a claim that every item has been reproduced on a phone. Items are marked **Confirmed by source inspection**, **Needs runtime verification**, or **Release-process gap**. Do not close an item solely because a static check passes.

## P0 — Fix before calling V2 release-ready

### 1. V1 stopwatch `TIME` label can be hidden by V2 polish code
- **Status:** Confirmed by source inspection.
- **Location:** `web/js/ui/v2-polish.js` (`fixTime`, `viewFix`, `observe`).
- **Finding:** `fixTime()` hides `#dlab` when its text is `TIME`, and the dock observer calls it without checking whether `html.v2` is enabled. `viewFix()` also calls it unconditionally. This can alter the Classic/V1 timer presentation.
- **Required:** Gate the V2-only correction behind the V2 state and restore the original label visibility when V2 is disabled. Verify stopwatch, interval timer and V1 mode.

### 2. About card still displays a hardcoded version
- **Status:** Confirmed by source inspection; contradicts the earlier v129 handoff note.
- **Location:** `web/index.html`, `#ax-credits .ax-cr-hero`.
- **Finding:** The About card still contains the literal `v86`, while `web/js/ui/settings.js` derives its About subtitle from `window.AXBUILD`. `web/js/build-info.js` is loaded separately, but the About card is not wired to it.
- **Required:** Use one shared build-version source for the Settings row and About card. Confirm the displayed version matches the generated APK `versionName`. Remove stale literals.

### 3. Minimum touch target sizes are inconsistent
- **Status:** Confirmed by source inspection.
- **Locations:** `web/css/v2/shell.css`, `components.css`, `exercises-settings.css`, `today.css`.
- **Findings:** The mini-session actions are 42×42 px expanded and 36×36 px collapsed; the Today Coach button is 42×42 px; the appearance theme segments are 40 px high; accent swatches are 27×27 px.
- **Required:** Make clickable hit areas at least 44×44 CSS px (prefer 48 px for primary Android controls). Small visual swatches may remain visually small if their hit area is expanded. Recheck spacing and overlap at 320, 360 and 390 px widths.

### 4. V2-off cleanup needs a real DOM-count regression test
- **Status:** Needs runtime verification; user previously observed about 16 hidden V2 nodes remaining after switching V2 off.
- **Locations:** `v2-core.js`, `v2-polish.js`, `v2-shell.js`, `v2-today.js`, `v2-session-run.js`, `v2-settings.js`, `v2-exercises.js`.
- **Finding:** v129 added cleanup paths, but the previous browser environment could not run the live toggle test. Static inspection is not enough to prove every generated node, class, observer and moved control is restored.
- **Required:** Toggle V2 on/off repeatedly without reload. Assert no injected `.v2-*` DOM remains, no V2-ready classes/attributes remain, original Coach/control placement and Settings rows are restored, observers are disconnected, and no V2 CSS affects Classic.

### 5. Fresh-install V2 must not request Google Fonts
- **Status:** Likely boot-order defect confirmed by source inspection; verify network requests in a browser.
- **Location:** `web/index.html` head bootstrap and Google Fonts loader.
- **Finding:** The early loader checks only whether `html.v2` is already present. A fresh install has no saved V2 preference, so the class is not present at that point; the loader can append the Google Fonts stylesheet before later boot logic chooses the new-install V2 default.
- **Required:** Resolve the initial V2/default state before deciding whether to inject the V1 Google Fonts link. A fresh V2 install must use bundled fonts and make no Google Fonts request; Classic mode must preserve its original font behavior.

## P1 — Performance, visual consistency and accessibility

### 6. Runtime frame-hitch guard is missing
- **Status:** Confirmed by source inspection against the stated V2 spec.
- **Location:** V2 boot/performance integration (`v2-core.js`, `perf.js` and boot flow).
- **Finding:** A boot-time stability/effects choice exists, but no runtime guard was found that monitors frame hitches after screen changes during the first minute and steps down the effects tier when needed.
- **Required:** Add a bounded, low-overhead runtime monitor. Respect manual effects selection and reduced-motion/transparency settings; do not silently override explicit user choices. Test on a lower-powered Android device.

### 7. Full effects blur budget may exceed the allowed layers
- **Status:** Needs runtime verification.
- **Locations:** `web/css/v2/shell.css`, `session-run.css`, `components.css`.
- **Finding:** Full effects applies blur to shell elements and the popover; `session-run.css` also applies blur to `#dock`. Check the number of simultaneously blurred surfaces for expanded/collapsed nav, active mini-session, open popover/sheet and timer dock.
- **Required:** Enforce the spec limit: navigation pill, mini-session pill and at most one open sheet/popover. Avoid a fourth simultaneous blur layer. Check WebView support and scroll performance.

### 8. Solid effects tier is not fully solid
- **Status:** Confirmed by source inspection.
- **Locations:** `components.css`, `plan.css`, `session-run.css`, `progress.css`, `polish.css`.
- **Finding:** Some gradients remain in Solid mode, including generic glass surfaces and decorative hero/week/ring treatments. Existing overrides remove some blur/shadows but do not consistently flatten every decorative gradient.
- **Required:** Solid mode should use flat surfaces, no backdrop blur, no decorative gradients and minimal/no shadows while preserving semantic progress indicators.

### 9. Switch animates background colour
- **Status:** Confirmed by source inspection.
- **Location:** `web/css/v2/components.css`, `.v2-switch i`.
- **Finding:** The switch transitions `background`, while the locked motion rule allows only `transform` and `opacity`.
- **Required:** Remove the background-colour transition. Keep the thumb movement on `transform`; honour `prefers-reduced-motion`.

### 10. Text scaling at 130% has not been verified
- **Status:** Needs runtime verification.
- **Locations:** Global V2 controls, forms, Settings and exercise sheets.
- **Finding:** Several components use fixed pixel font sizes and some form controls use forced 16 px styling. It has not been established that long labels, grouped settings, sheets and buttons remain readable without clipping or horizontal overflow at 130% text scaling.
- **Required:** Test both themes at 130% text scaling and Android display-size changes. Fix clipping, truncation of essential labels, overlap and sideways scrolling.

### 11. Contrast needs a computed-style scan, not token-only review
- **Status:** Needs runtime verification.
- **Finding:** Token pairs were inspected, but actual computed foreground/background pairs across all states, themes, disabled controls, placeholders, charts and overlays were not measured in a real browser.
- **Required:** Scan all screens in Dark and Light at 390×844; require 4.5:1 for normal body text and 3:1 for large text/UI graphics where applicable. Include disabled/placeholder states and the Old Money V1 skin underneath V2.

### 12. Font leakage in Light theme needs regression coverage
- **Status:** Needs runtime verification; a scoped font reset was added in v129.
- **Finding:** V1 Old Money skin applies Georgia with high specificity. The v129 reset is intended to prevent serif leakage while retaining intentional display/editorial faces, but no real computed-style scan was available.
- **Required:** Inspect every card in Light theme. Body/UI text must use bundled Inter; only explicitly designated display/editorial elements may use Big Shoulders Display or Instrument Serif. Check Settings, exercise cards, Plan, Progress, sheets, drawer and toast.

## P2 — Test and release-process gaps

### 13. Dedicated V2 UI tests are incomplete
- **Status:** Confirmed coverage gap.
- **Finding:** Existing Node tests and general browser tests do not provide dedicated end-to-end coverage for Exercises filters/A-B viewer/custom forms, Settings grouping/search/appearance controls, Light theme, repeated live-toggle cleanup, or all effects tiers.
- **Required:** Add focused browser tests for these paths, including keyboard/focus behavior and persistence after reload/backup restore.

### 14. Required V2 screenshots are missing
- **Status:** Confirmed documentation/QA gap.
- **Finding:** The V2 screenshot evidence folder required by the spec (`docs/v2/shots/`) is absent from this project snapshot.
- **Required:** Capture Today, Plan, Session, Run, Progress tabs, Exercises library/detail/A-B viewer, Settings, drawer, toast, sheet, onboarding, splash, Dark/Light themes and Full/Lite/Solid effects at phone viewport sizes. Include V2-off comparison.

### 15. GitHub Actions browser tests do not block release
- **Status:** Confirmed by workflow inspection.
- **Location:** `.github/workflows/build.yml`.
- **Finding:** The browser-test job uses `continue-on-error: true`, so browser failures do not block the APK build.
- **Required:** Before release, make the browser suite a required passing check (or explicitly document a temporary exception and keep APK release gated on a manual QA sign-off).

### 16. Raw JS/CSS size budgets need clarification
- **Status:** Confirmed discrepancy; interpretation needs owner decision.
- **Finding:** The earlier audit measured approximately 49.7 KiB V2 JavaScript and 118.2 KiB V2 CSS, above the stated raw-source budgets of 40 KiB and 60 KiB. Compressed transfer size is smaller, but the spec does not state whether the budget is raw or compressed.
- **Required:** Define whether budgets apply to raw source, gzip or Brotli. If raw, reduce or split the implementation without runtime dependencies; if compressed, record measured gzip/Brotli sizes and enforce them in CI.

## Final acceptance gate

Do not mark V2 complete until:
1. P0 items are fixed and covered by repeatable tests.
2. V1/Classic visual and behavioral parity is checked with V2 off.
3. All V2 screens pass Dark/Light, effects-tier, accessibility, 130% text scaling and 44px+ hit-target checks.
4. Browser tests pass in real Chromium; no test job is silently allowed to fail.
5. A real Android phone check confirms install, offline launch, persistence, workout logging, GPS/run/timer, notifications/reminders, backup restore and repeated V2/Classic switching.
6. The final APK version matches the About screen and release metadata.

**Audit limitation:** This register was prepared from source inspection and available automated checks. A full Playwright/computed-style scan and physical Android-device test were not available in this environment. Items marked for runtime verification must remain open until those checks are performed.

# Design tokens (N02)

Source of truth is the code: `ui/theme/Color.kt`, `Dimens.kt`, `Type.kt`, `Theme.kt`. Direction and contrast rules: `AGENTS.md` section 7. Everything here is UNTESTED on a device until the owner checks the specimen screen.

## Colors (`AerunoColors`; Palette A "Deep Heritage", owner-selected 2026-11-20)
Brand: ivory (`Background`) #F3EFE4, deepForest #1F3B30, terracotta #C97855. Neutrals: surface #FFFEFA, surfaceAlt #E7E2D6, sage #DCE5D7, text #202A23, textMuted #646E65, border #D8D9CE. Semantic: danger #B55345. Left over, unused: brass #A98542.

Changes vs N01: olive, old forest and old deepForest removed (deepForest merged); terracotta added; background #F5F2E8 to #F3EFE4; textMuted #687167 to #646E65 (the darker ivory dropped the old value to 4.4).

Material mapping (`Theme.kt`): primary deepForest / onPrimary ivory; secondary terracotta / onSecondary text; tertiary brass; secondaryContainer sage / onSecondaryContainer deepForest.

Contrast (WCAG, computed 2026-11-20): text on ivory 12.9; textMuted on ivory 4.6, surface 5.2; ivory on deepForest 10.6; terracotta on ivory 2.9, on surface 3.3; text on terracotta 4.45; deepForest on terracotta 3.65; danger on ivory 4.3, on surface 4.9. Terracotta is for fills, lines, icons and large decorative display only. Terracotta buttons use text-colored labels (4.45, just under 4.5).

## Spacing and radii (`Spacing`, `Radii`, unchanged)
Spacing dp: 4, 8, 12, 16, 20, 24, 32, 40. Radii dp: button 12, chip 14, icon button 16, card 22, hero 28, nav 28, sheet 28.

## Fonts (`AerunoFonts`, `res/font`)
| Role | Family | Files | Use |
|---|---|---|---|
| Display | Big Shoulders Display, Black 900 | `big_shoulders_display_black.ttf` | Hero numbers, screen and workout titles. Short and big. Never paragraphs. |
| Accent | Instrument Serif, Italic | `instrument_serif_italic.ttf` | Editorial accent, one per screen at most. Never body copy. |
| UI | Inter, Regular 400 + Bold 700 | `inter_regular.ttf`, `inter_bold.ttf` | Everything else. |

Only these weights exist. No Medium or SemiBold, so none is requested (no faked weights).

## Type scale (`AerunoType`, sp, size/line height)
heroStat 72/66 (tracking -0.5), displayLarge 60/55, displayMedium 44/40 (tracking 0.3), screenTitle 36/33 (tracking 0.3) (all Big Shoulders Black); accentLarge 40/44, accentMedium 28/32 (Instrument Serif Italic); headline 22/28, cardTitle 18/24 (Inter Bold); bodyLarge 16/24, body 14/20, caption 11/16 (Inter Regular); button 15/20 (Inter Bold); label 12/16 (Inter Bold, tracking 0.8, write text in uppercase); timer 32/36, statCompact 28/32 and statNumber 22/28 (Inter Bold, `tnum`). statCompact is for small stats beside the 64 sp hero number.

`AerunoTypography` maps these onto the Material text slots, so any Material component also uses AERUNO fonts.

## Known limits
- Big Shoulders has no `tnum` feature and its digit widths differ (the "1" is narrow). Big stats are not tabular. Timers use Inter.
- The bundled font files are web subsets (about 220 to 520 glyphs, Latin). The specimen "Glyph check" shows whether the characters we need exist. Anything outside Latin will fall back to the system font.
- Condensed display sizes (52 to 64 sp) are first guesses. Tune after the phone check.
- Font files came from the legacy app's `web/fonts` (WOFF2) converted to TTF by the owner's previous session. Not byte-compared with upstream.

## Display rules (N02 refinement 2)
- Big Shoulders is already condensed with tall capitals (cap height 0.80 em). We do not stretch or scale it; "taller" means a larger real size, "tighter" means line height about 0.92 em (stacked lines are about 0.12 em apart).
- Uppercase text, 1 to 3 words. Mixed case, sentences and anything over about 12 characters per line goes in Inter.
- Widest sample: "LOWER BODY" at 60 sp is about 284 dp (summed glyph advances), which fits a 360 dp phone with 20 dp side padding. Narrower phones wrap it onto two lines, which is fine.
- Pair with an Instrument Serif italic accent line above, at most one per screen.

## Status bar and insets
The scroll content carries `safeDrawingPadding()` inside the scroll, so the first screen starts below the status bar and the last item clears the navigation bar. A fixed ivory `Spacer` with `windowInsetsTopHeight(WindowInsets.statusBars)` is drawn above the scroll, so scrolled text passes beneath that cover instead of under the clock and icons. Cause of the overlap: with edge-to-edge, the status bar is transparent and the top padding scrolled away with the content.

### Status bar icons
`MainActivity` calls `enableEdgeToEdge` with `SystemBarStyle.light(...)` for both bars, and `themes.xml` sets `windowLightStatusBar` and `windowLightNavigationBar`. This gives dark icons on the light screen. The default (auto) follows the phone's dark mode, which caused the white icons seen in N02.

## Licenses
SIL Open Font License 1.1, one file per family in `app/src/main/assets/font-licenses/`, so they ship inside the APK. Copyright lines checked 2026-11-20 against upstream-derived sources:
- Big Shoulders Display: "Copyright 2019 The Big Shoulders Project Authors (https://github.com/xotypeco/big_shoulders)". Matches the font file and the license text published by Font Squirrel.
- Instrument Serif: "Copyright 2022 The Instrument Serif Project Authors (https://github.com/Instrument/instrument-serif)". Matches the font file, the upstream `OFL.txt` header as copied in a public repo, and Google Fonts' METADATA.
- Inter: upstream `LICENSE.txt` header is "Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter)" (seen in a package mirror quoting it). The file now uses that exact line; the font metadata says "Copyright 2016".
No Reserved Font Name appears in any of these notices. The license body is the standard OFL 1.1 text; the raw upstream files themselves could not be downloaded here, so this was not a byte-for-byte comparison.

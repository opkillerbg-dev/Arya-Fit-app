package com.aeruno.nativeprototype.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.aeruno.nativeprototype.R

/**
 * Bundled fonts (res/font, no downloads). Licenses: assets/font-licenses/.
 * Only the weights that are actually bundled are declared, so nothing is faked.
 */
object AerunoFonts {
    /** Big Shoulders Display Black (900). Short, big, emphatic text only. */
    val Display = FontFamily(Font(R.font.big_shoulders_display_black, FontWeight.Black))

    /** Instrument Serif Italic. Editorial accent, used sparingly. */
    val Accent = FontFamily(Font(R.font.instrument_serif_italic, FontWeight.Normal, FontStyle.Italic))

    /** Inter Regular + Bold. All UI, body, buttons, labels, numbers. */
    val Ui = FontFamily(
        Font(R.font.inter_regular, FontWeight.Normal),
        Font(R.font.inter_bold, FontWeight.Bold),
    )
}

/** Type scale (AGENTS.md section 7, as revised in N02). Sizes are sp. */
object AerunoType {
    // Display: Big Shoulders Black. Real size changes only, no stretching or scaling of the letters.
    // The font is already condensed with tall capitals (cap height 0.80 em), so "taller" comes from
    // larger sizes and "tighter" from line height about 0.92 em (stacked lines sit about 0.12 em apart).
    // Use for uppercase text of 1 to 3 words. Sentences and mixed case go in Inter.
    val heroStat = TextStyle(fontFamily = AerunoFonts.Display, fontWeight = FontWeight.Black, fontSize = 72.sp, lineHeight = 66.sp, letterSpacing = (-0.5).sp)
    val displayLarge = TextStyle(fontFamily = AerunoFonts.Display, fontWeight = FontWeight.Black, fontSize = 60.sp, lineHeight = 55.sp)
    val displayMedium = TextStyle(fontFamily = AerunoFonts.Display, fontWeight = FontWeight.Black, fontSize = 44.sp, lineHeight = 40.sp, letterSpacing = 0.3.sp)
    val screenTitle = TextStyle(fontFamily = AerunoFonts.Display, fontWeight = FontWeight.Black, fontSize = 36.sp, lineHeight = 33.sp, letterSpacing = 0.3.sp)

    // Accent: Instrument Serif Italic.
    val accentLarge = TextStyle(fontFamily = AerunoFonts.Accent, fontWeight = FontWeight.Normal, fontStyle = FontStyle.Italic, fontSize = 40.sp, lineHeight = 44.sp)
    val accentMedium = TextStyle(fontFamily = AerunoFonts.Accent, fontWeight = FontWeight.Normal, fontStyle = FontStyle.Italic, fontSize = 28.sp, lineHeight = 32.sp)

    // UI: Inter.
    val headline = TextStyle(fontFamily = AerunoFonts.Ui, fontWeight = FontWeight.Bold, fontSize = 22.sp, lineHeight = 28.sp)
    val cardTitle = TextStyle(fontFamily = AerunoFonts.Ui, fontWeight = FontWeight.Bold, fontSize = 18.sp, lineHeight = 24.sp)
    val bodyLarge = TextStyle(fontFamily = AerunoFonts.Ui, fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 24.sp)
    val body = TextStyle(fontFamily = AerunoFonts.Ui, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 20.sp)
    val button = TextStyle(fontFamily = AerunoFonts.Ui, fontWeight = FontWeight.Bold, fontSize = 15.sp, lineHeight = 20.sp, letterSpacing = 0.2.sp)
    /** Use with uppercase text. */
    val label = TextStyle(fontFamily = AerunoFonts.Ui, fontWeight = FontWeight.Bold, fontSize = 12.sp, lineHeight = 16.sp, letterSpacing = 0.8.sp)
    val caption = TextStyle(fontFamily = AerunoFonts.Ui, fontWeight = FontWeight.Normal, fontSize = 11.sp, lineHeight = 16.sp)

    // Numbers: Inter with tabular figures (equal-width digits). Big Shoulders has no "tnum" feature.
    val timer = TextStyle(fontFamily = AerunoFonts.Ui, fontWeight = FontWeight.Bold, fontSize = 32.sp, lineHeight = 36.sp, fontFeatureSettings = "tnum")
    /** Compact stat values next to a hero number (N02 refinement). */
    val statCompact = TextStyle(fontFamily = AerunoFonts.Ui, fontWeight = FontWeight.Bold, fontSize = 28.sp, lineHeight = 32.sp, fontFeatureSettings = "tnum")
    val statNumber = TextStyle(fontFamily = AerunoFonts.Ui, fontWeight = FontWeight.Bold, fontSize = 22.sp, lineHeight = 28.sp, fontFeatureSettings = "tnum")
}

/** Maps the scale onto Material slots so any Material component also gets AERUNO fonts. */
val AerunoTypography = Typography(
    displayLarge = AerunoType.displayLarge,
    displayMedium = AerunoType.displayMedium,
    displaySmall = AerunoType.screenTitle,
    headlineLarge = AerunoType.screenTitle,
    headlineMedium = AerunoType.headline,
    headlineSmall = AerunoType.cardTitle,
    titleLarge = AerunoType.headline,
    titleMedium = AerunoType.cardTitle,
    titleSmall = AerunoType.button,
    bodyLarge = AerunoType.bodyLarge,
    bodyMedium = AerunoType.body,
    bodySmall = AerunoType.caption,
    labelLarge = AerunoType.button,
    labelMedium = AerunoType.label,
    labelSmall = AerunoType.caption,
)

package com.aeruno.nativeprototype.ui.specimen

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsTopHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import com.aeruno.nativeprototype.ui.theme.AerunoColors
import com.aeruno.nativeprototype.ui.theme.AerunoType
import com.aeruno.nativeprototype.ui.theme.Radii
import com.aeruno.nativeprototype.ui.theme.Spacing

/**
 * N02 type specimen. Mock text only. Shows font pairing, the type scale, UI samples,
 * a glyph check, the palette and the spacing/radii scales so the owner can judge them on the phone.
 */
@Composable
fun TypeSpecimenScreen() {
    Surface(modifier = Modifier.fillMaxSize(), color = AerunoColors.Background) {
        Box(modifier = Modifier.fillMaxSize()) {
            // The safe-area padding sits INSIDE the scroll content: the first screen starts below the
            // status bar, the last item clears the navigation bar, and nothing is cut off.
            Column(
                modifier = Modifier
                    .verticalScroll(rememberScrollState())
                    .safeDrawingPadding()
                    .padding(horizontal = Spacing.s20, vertical = Spacing.s24),
                verticalArrangement = Arrangement.spacedBy(Spacing.s32),
            ) {
                PairingSection()
                DisplaySection()
                StatsSection()
                HierarchySection()
                UiSamplesSection()
                GlyphSection()
                PaletteSection()
                SpacingSection()
            }
            // Status-bar cover: same ivory as the screen, exactly the height of the status bar, drawn
            // above the scrolling content. At the top it is invisible; while scrolling, text passes
            // beneath it instead of under the clock and icons.
            Spacer(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .fillMaxWidth()
                    .windowInsetsTopHeight(WindowInsets.statusBars)
                    .background(AerunoColors.Background),
            )
        }
    }
}

@Composable
private fun Section(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(Spacing.s12)) {
        Text(text = title.uppercase(), style = AerunoType.label, color = AerunoColors.TextMuted)
        content()
    }
}

@Composable
private fun Panel(content: @Composable ColumnScope.() -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = Radii.card,
        color = AerunoColors.Surface,
        border = BorderStroke(1.dp, AerunoColors.Border),
    ) {
        Column(
            modifier = Modifier.padding(Spacing.s20),
            verticalArrangement = Arrangement.spacedBy(Spacing.s12),
            content = content,
        )
    }
}

@Composable
private fun PairingSection() {
    Section("N02 type specimen") {
        Column {
            Text("Today’s plan", style = AerunoType.accentLarge, color = AerunoColors.Terracotta)
            Text("LOWER BODY", style = AerunoType.displayLarge, color = AerunoColors.DeepForest)
        }
        Text(
            "Serif italic accent over a condensed display. Inter carries everything you read or tap.",
            style = AerunoType.body,
            color = AerunoColors.TextMuted,
        )
    }
}

@Composable
private fun DisplaySection() {
    Section("Display") {
        Panel {
            Text("Heavy day", style = AerunoType.accentMedium, color = AerunoColors.Terracotta)
            Text("LEG DAY", style = AerunoType.displayLarge, color = AerunoColors.DeepForest)
            Spacer(Modifier.height(Spacing.s8))
            Text("LOWER\nBODY", style = AerunoType.displayLarge, color = AerunoColors.DeepForest)
            Spacer(Modifier.height(Spacing.s8))
            Text("WEEK 3 · PUSH", style = AerunoType.displayMedium, color = AerunoColors.DeepForest)
            Text("GOOD MORNING", style = AerunoType.screenTitle, color = AerunoColors.DeepForest)
            Spacer(Modifier.height(Spacing.s4))
            Text(
                "Uppercase, 1 to 3 words, tight leading. Sentences and mixed case stay in Inter.",
                style = AerunoType.caption,
                color = AerunoColors.TextMuted,
            )
        }
    }
}

@Composable
private fun StatsSection() {
    Section("Numbers") {
        Panel {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom,
            ) {
                StatBlock("8,420", "Steps", AerunoType.heroStat)
                StatBlock("42", "Minutes", AerunoType.statCompact)
                StatBlock("4", "Streak", AerunoType.statCompact)
            }
        }
    }
}

@Composable
private fun StatBlock(value: String, label: String, valueStyle: TextStyle) {
    Column {
        Text(value, style = valueStyle, color = AerunoColors.DeepForest)
        Text(label.uppercase(), style = AerunoType.label, color = AerunoColors.TextMuted)
    }
}

private data class Spec(val name: String, val style: TextStyle, val sample: String, val note: String)

@Composable
private fun HierarchySection() {
    val specs = listOf(
        Spec("heroStat", AerunoType.heroStat, "8,420", "Big Shoulders 900 · 72/66"),
        Spec("statCompact", AerunoType.statCompact, "42", "Inter Bold · tnum · 28/32"),
        Spec("displayLarge", AerunoType.displayLarge, "LOWER BODY", "Big Shoulders 900 · 60/55"),
        Spec("displayMedium", AerunoType.displayMedium, "35 MIN", "Big Shoulders 900 · 44/40"),
        Spec("screenTitle", AerunoType.screenTitle, "GOOD MORNING", "Big Shoulders 900 · 36/33"),
        Spec("accentLarge", AerunoType.accentLarge, "Keep it simple", "Instrument Serif Italic · 40/44"),
        Spec("accentMedium", AerunoType.accentMedium, "Strong week ahead", "Instrument Serif Italic · 28/32"),
        Spec("headline", AerunoType.headline, "Warm-up circuit", "Inter Bold · 22/28"),
        Spec("cardTitle", AerunoType.cardTitle, "Goblet squat", "Inter Bold · 18/24"),
        Spec("bodyLarge", AerunoType.bodyLarge, "Push through the whole foot.", "Inter Regular · 16/24"),
        Spec("body", AerunoType.body, "Rest 45 seconds between sets.", "Inter Regular · 14/20"),
        Spec("button", AerunoType.button, "Start workout", "Inter Bold · 15/20"),
        Spec("label", AerunoType.label, "SETS · REPS", "Inter Bold · 12/16 · tracking 0.8"),
        Spec("caption", AerunoType.caption, "Last session · 3 days ago", "Inter Regular · 11/16"),
    )
    Section("Hierarchy") {
        Panel {
            specs.forEachIndexed { index, spec ->
                if (index > 0) Spacer(Modifier.height(Spacing.s4))
                Text(spec.sample, style = spec.style, color = AerunoColors.Text)
                Text("${spec.name} · ${spec.note}", style = AerunoType.caption, color = AerunoColors.TextMuted)
            }
        }
    }
}

@Composable
private fun UiSamplesSection() {
    Section("UI samples") {
        Panel {
            Text("Warm-up circuit", style = AerunoType.headline, color = AerunoColors.Text)
            Text("Goblet squat", style = AerunoType.cardTitle, color = AerunoColors.Text)
            Text(
                "Keep your chest tall and push through the whole foot. Rest 45 seconds between sets.",
                style = AerunoType.bodyLarge,
                color = AerunoColors.Text,
            )
            Text("SETS · REPS", style = AerunoType.label, color = AerunoColors.TextMuted)
            Text("Last session · 3 days ago", style = AerunoType.caption, color = AerunoColors.TextMuted)
            Row(horizontalArrangement = Arrangement.spacedBy(Spacing.s12)) {
                Button(
                    onClick = {},
                    shape = Radii.button,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AerunoColors.DeepForest,
                        contentColor = AerunoColors.Background,
                    ),
                ) { Text("Start workout", style = AerunoType.button) }
                Button(
                    onClick = {},
                    shape = Radii.button,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AerunoColors.Terracotta,
                        contentColor = AerunoColors.Text,
                    ),
                ) { Text("Add set", style = AerunoType.button) }
            }
            Spacer(Modifier.height(Spacing.s4))
            Text(
                "Timer digits. With equal-width digits (tnum) the first three boxes are the same width. The last one is not tnum.",
                style = AerunoType.caption,
                color = AerunoColors.TextMuted,
            )
            listOf("88:88", "11:11", "00:00").forEach { t ->
                Text(t, style = AerunoType.timer, color = AerunoColors.DeepForest, modifier = Modifier.background(AerunoColors.Sage))
            }
            Text(
                "11:11",
                style = AerunoType.timer.copy(fontFeatureSettings = null),
                color = AerunoColors.DeepForest,
                modifier = Modifier.background(AerunoColors.Sage),
            )
            Text(
                "Steps 8,420 · Active 42 min · Streak 4",
                style = AerunoType.statNumber,
                color = AerunoColors.Text,
            )
        }
    }
}

@Composable
private fun GlyphSection() {
    val glyphs = "0123456789 ’“”—–·°×%&@#"
    Section("Glyph check") {
        Panel {
            Text("Big Shoulders", style = AerunoType.caption, color = AerunoColors.TextMuted)
            Text(glyphs, style = AerunoType.displayMedium, color = AerunoColors.Text)
            Text("Instrument Serif Italic", style = AerunoType.caption, color = AerunoColors.TextMuted)
            Text(glyphs, style = AerunoType.accentMedium, color = AerunoColors.Text)
            Text("Inter Regular", style = AerunoType.caption, color = AerunoColors.TextMuted)
            Text(glyphs, style = AerunoType.bodyLarge, color = AerunoColors.Text)
            Text("Inter Bold", style = AerunoType.caption, color = AerunoColors.TextMuted)
            Text(glyphs, style = AerunoType.cardTitle, color = AerunoColors.Text)
        }
    }
}

private val swatches: List<Pair<String, Color>> = listOf(
    "ivory" to AerunoColors.Background,
    "deepForest" to AerunoColors.DeepForest,
    "terracotta" to AerunoColors.Terracotta,
    "surface" to AerunoColors.Surface,
    "surfaceAlt" to AerunoColors.SurfaceAlt,
    "sage" to AerunoColors.Sage,
    "text" to AerunoColors.Text,
    "textMuted" to AerunoColors.TextMuted,
    "border" to AerunoColors.Border,
    "danger" to AerunoColors.Danger,
    "brass" to AerunoColors.Brass,
)

@Composable
private fun PaletteSection() {
    Section("Palette") {
        swatches.chunked(3).forEach { rowItems ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(Spacing.s8),
            ) {
                rowItems.forEach { (name, color) -> Swatch(name, color, Modifier.weight(1f)) }
            }
        }
        Text(
            "Brand: ivory, deepForest, terracotta (first row). Terracotta: fills, lines, icons, large decorative type only. Not small text on ivory or surface.",
            style = AerunoType.caption,
            color = AerunoColors.TextMuted,
        )
    }
}

@Composable
private fun Swatch(name: String, color: Color, modifier: Modifier) {
    val lum = color.luminance()
    val contrastWithText = (maxOf(lum, AerunoColors.Text.luminance()) + 0.05f) / (minOf(lum, AerunoColors.Text.luminance()) + 0.05f)
    val contrastWithIvory = (maxOf(lum, AerunoColors.Background.luminance()) + 0.05f) / (minOf(lum, AerunoColors.Background.luminance()) + 0.05f)
    val onColor = if (contrastWithText >= contrastWithIvory) AerunoColors.Text else AerunoColors.Background
    val hex = "#%06X".format(color.toArgb() and 0xFFFFFF)
    Box(
        modifier = modifier
            .height(76.dp)
            .background(color, Radii.button)
            .border(1.dp, AerunoColors.Border, Radii.button)
            .padding(Spacing.s8),
        contentAlignment = Alignment.BottomStart,
    ) {
        Column {
            Text(name, style = AerunoType.label, color = onColor)
            Text(hex, style = AerunoType.caption, color = onColor)
        }
    }
}

@Composable
private fun SpacingSection() {
    val steps = listOf(4, 8, 12, 16, 20, 24, 32, 40)
    val radii = listOf("12" to Radii.button, "14" to Radii.chip, "16" to Radii.iconButton, "22" to Radii.card, "28" to Radii.hero)
    Section("Spacing and radii") {
        Panel {
            steps.forEach { step ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("s$step", style = AerunoType.caption, color = AerunoColors.TextMuted, modifier = Modifier.width(32.dp))
                    Box(modifier = Modifier.width(step.dp).height(12.dp).background(AerunoColors.DeepForest))
                }
            }
            Spacer(Modifier.height(Spacing.s8))
            Row(horizontalArrangement = Arrangement.spacedBy(Spacing.s8)) {
                radii.forEach { (label, shape) ->
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .background(AerunoColors.Sage, shape)
                            .border(1.dp, AerunoColors.Border, shape),
                        contentAlignment = Alignment.Center,
                    ) { Text(label, style = AerunoType.caption, color = AerunoColors.Text) }
                }
            }
        }
    }
}

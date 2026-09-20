package com.smartquiz.practice.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartquiz.practice.R
import com.smartquiz.practice.ui.theme.JamsBoxBg
import com.smartquiz.practice.ui.theme.JamsBoxNavy
import com.smartquiz.practice.ui.theme.JamsBoxOrange

/**
 * JamsBox QT Official Header Branding Component
 *
 * Layout:
 * [ ORIGINAL LOGO ]  JamsBox QT
 *                    EDUCATIONAL QUIZ PLATFORM
 *
 * - Keeps original logo/icon on the LEFT.
 * - Places the new JamsBox QT typography on the RIGHT.
 * - First line: "JamsBox" (Navy #0B1A40) + " " + "QT" (Orange #F97316), ExtraBold (weight 800).
 * - Second line: "EDUCATIONAL QUIZ PLATFORM" (Navy #0B1A40), all uppercase, Medium weight (500),
 *   letter spacing ~3px (2.5-3sp), positioned directly below "JamsBox QT".
 */
@Composable
fun JamsBoxHeaderBranding(
    modifier: Modifier = Modifier,
    iconSize: Dp = 38.dp,
    titleSize: TextUnit = 18.sp,
    taglineSize: TextUnit = 7.5.sp,
    letterSpacing: TextUnit = 2.5.sp
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // [ ORIGINAL LOGO ] on the LEFT
        Image(
            painter = painterResource(id = R.drawable.ic_launcher_foreground),
            contentDescription = "JamsBox QT Official Logo",
            modifier = Modifier.size(iconSize)
        )

        Spacer(modifier = Modifier.width(10.dp))

        // Typography on the RIGHT
        Column(
            verticalArrangement = Arrangement.Center
        ) {
            // Line 1: JamsBox QT
            Text(
                text = buildAnnotatedString {
                    withStyle(
                        style = SpanStyle(
                            color = JamsBoxNavy,
                            fontWeight = FontWeight.ExtraBold
                        )
                    ) {
                        append("JamsBox")
                    }
                    append(" ")
                    withStyle(
                        style = SpanStyle(
                            color = JamsBoxOrange,
                            fontWeight = FontWeight.ExtraBold
                        )
                    ) {
                        append("QT")
                    }
                },
                fontSize = titleSize,
                fontFamily = FontFamily.SansSerif,
                lineHeight = titleSize * 1.15f
            )

            Spacer(modifier = Modifier.height(2.dp))

            // Line 2: Tagline
            Text(
                text = "EDUCATIONAL QUIZ PLATFORM",
                color = JamsBoxNavy,
                fontSize = taglineSize,
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Medium,
                letterSpacing = letterSpacing,
                lineHeight = taglineSize * 1.2f
            )
        }
    }
}

/**
 * Centered / Card variant with original logo on the left and typography on the right.
 */
@Composable
fun JamsBoxLogo(
    modifier: Modifier = Modifier,
    iconSize: Dp = 46.dp,
    titleSize: TextUnit = 22.sp,
    taglineSize: TextUnit = 9.sp,
    letterSpacing: TextUnit = 3.sp,
    backgroundColor: Color = JamsBoxBg,
    contentPadding: PaddingValues = PaddingValues(horizontal = 16.dp, vertical = 12.dp)
) {
    Row(
        modifier = modifier
            .background(backgroundColor)
            .padding(contentPadding),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        // [ ORIGINAL LOGO ] on the LEFT
        Image(
            painter = painterResource(id = R.drawable.ic_launcher_foreground),
            contentDescription = "JamsBox QT Official Logo",
            modifier = Modifier.size(iconSize)
        )

        Spacer(modifier = Modifier.width(12.dp))

        // Typography on the RIGHT
        Column(
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = buildAnnotatedString {
                    withStyle(
                        style = SpanStyle(
                            color = JamsBoxNavy,
                            fontWeight = FontWeight.ExtraBold
                        )
                    ) {
                        append("JamsBox")
                    }
                    append(" ")
                    withStyle(
                        style = SpanStyle(
                            color = JamsBoxOrange,
                            fontWeight = FontWeight.ExtraBold
                        )
                    ) {
                        append("QT")
                    }
                },
                fontSize = titleSize,
                fontFamily = FontFamily.SansSerif,
                lineHeight = titleSize * 1.15f
            )

            Spacer(modifier = Modifier.height(3.dp))

            Text(
                text = "EDUCATIONAL QUIZ PLATFORM",
                color = JamsBoxNavy,
                fontSize = taglineSize,
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Medium,
                letterSpacing = letterSpacing,
                lineHeight = taglineSize * 1.2f
            )
        }
    }
}

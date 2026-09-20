package com.smartquiz.practice.ui.navigation

/**
 * Screen routes used for Jetpack Compose Navigation.
 */
sealed class Screen(val route: String) {
    object Home : Screen("home")
    object MathLab : Screen("math_lab")
    object Bookmarks : Screen("bookmarks")
    object Quiz : Screen("quiz")
    object Result : Screen("result")
    object History : Screen("history")
    object HistoryDetail : Screen("history_detail/{attemptId}") {
        fun createRoute(attemptId: String) = "history_detail/$attemptId"
    }
    object Settings : Screen("settings")
}

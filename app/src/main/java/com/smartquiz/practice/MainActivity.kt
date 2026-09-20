package com.smartquiz.practice

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.smartquiz.practice.ui.navigation.Screen
import com.smartquiz.practice.ui.screens.*
import com.smartquiz.practice.ui.theme.SmartQuizTheme
import com.smartquiz.practice.viewmodel.QuizViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: QuizViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SmartQuizTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SmartQuizAppNavigation(viewModel = viewModel)
                }
            }
        }
    }
}

@Composable
fun SmartQuizAppNavigation(viewModel: QuizViewModel) {
    val navController = rememberNavController()
    val uiState by viewModel.uiState.collectAsState()
    var showStartupLoading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        // Short startup screen: keeps app launch smooth without delaying Gemini work.
        delay(700)
        showStartupLoading = false
    }

    if (showStartupLoading) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            CircularProgressIndicator()
            Spacer(modifier = Modifier.height(16.dp))
            Text("JamsBoxQT")
            Spacer(modifier = Modifier.height(6.dp))
            Text("Loading...")
        }
        return
    }

    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        // 1. Home Screen
        composable(Screen.Home.route) {
            HomeScreen(
                viewModel = viewModel,
                uiState = uiState,
                onStartQuiz = {
                    navController.navigate(Screen.Quiz.route)
                },
                onNavigateToHistory = {
                    navController.navigate(Screen.History.route)
                },
                onNavigateToSettings = {
                    navController.navigate(Screen.Settings.route)
                },
                onNavigateToMathLab = {
                    navController.navigate(Screen.MathLab.route)
                },
                onNavigateToBookmarks = {
                    navController.navigate(Screen.Bookmarks.route)
                }
            )
        }

        // 1b. Math Lab Screen
        composable(Screen.MathLab.route) {
            MathLabScreen(
                viewModel = viewModel,
                uiState = uiState,
                onBack = { navController.popBackStack() },
                onNavigateToBookmarks = { navController.navigate(Screen.Bookmarks.route) },
                onNavigateToQuiz = { navController.navigate(Screen.Quiz.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
            )
        }

        // 1c. Bookmarks Screen
        composable(Screen.Bookmarks.route) {
            BookmarksScreen(
                viewModel = viewModel,
                uiState = uiState,
                onBack = { navController.popBackStack() },
                onNavigateToQuiz = { navController.navigate(Screen.Quiz.route) }
            )
        }

        // 2. Active Quiz Screen
        composable(Screen.Quiz.route) {
            QuizScreen(
                viewModel = viewModel,
                uiState = uiState,
                onSubmitSuccess = {
                    // Navigate to Result and remove Quiz from back stack
                    navController.navigate(Screen.Result.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                    }
                },
                onExitConfirmed = {
                    navController.popBackStack(Screen.Home.route, false)
                }
            )
        }

        // 3. Quiz Result & Review Screen
        composable(Screen.Result.route) {
            ResultScreen(
                viewModel = viewModel,
                uiState = uiState,
                onRetryQuiz = {
                    viewModel.retryQuiz()
                    navController.navigate(Screen.Quiz.route) {
                        popUpTo(Screen.Home.route) { inclusive = false }
                    }
                },
                onNewQuiz = {
                    viewModel.exitQuiz()
                    navController.popBackStack(Screen.Home.route, false)
                },
                onNavigateToHistory = {
                    navController.navigate(Screen.History.route)
                }
            )
        }

        // 4. Quiz History Screen
        composable(Screen.History.route) {
            HistoryScreen(
                viewModel = viewModel,
                uiState = uiState,
                onNavigateBack = {
                    navController.popBackStack()
                },
                onSelectHistoryItem = { item ->
                    navController.navigate(Screen.HistoryDetail.createRoute(item.id))
                }
            )
        }

        // 5. History Detail Screen
        composable(
            route = Screen.HistoryDetail.route,
            arguments = listOf(navArgument("attemptId") { type = NavType.StringType })
        ) {
            HistoryDetailScreen(
                uiState = uiState,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }

        // 6. Settings Screen
        composable(Screen.Settings.route) {
            SettingsScreen(
                viewModel = viewModel,
                uiState = uiState,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}

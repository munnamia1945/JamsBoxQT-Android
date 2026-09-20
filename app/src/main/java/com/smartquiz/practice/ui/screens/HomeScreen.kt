package com.smartquiz.practice.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.WarningAmber
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.smartquiz.practice.model.QuestionType
import com.smartquiz.practice.model.QuizMode
import com.smartquiz.practice.ui.components.JamsBoxHeaderBranding
import com.smartquiz.practice.ui.components.JamsBoxLogo
import com.smartquiz.practice.ui.theme.BluePrimary
import com.smartquiz.practice.ui.theme.BlueLight
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Menu
import com.smartquiz.practice.ui.theme.WarningAmber
import com.smartquiz.practice.viewmodel.QuizUiState
import com.smartquiz.practice.viewmodel.QuizViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: QuizViewModel,
    uiState: QuizUiState,
    onStartQuiz: () -> Unit,
    onNavigateToHistory: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onNavigateToMathLab: () -> Unit = {},
    onNavigateToBookmarks: () -> Unit = {}
) {
    val sampleTopics = listOf(
        "Android Activity",
        "Machine Learning",
        "Database Management System",
        "Computer Networks",
        "Operating Systems",
        "Data Structures"
    )

    val questionCounts = listOf(20, 30, 40, 50, 60, 100, 150)
    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    JamsBoxHeaderBranding(
                        iconSize = 36.dp,
                        titleSize = 18.sp,
                        taglineSize = 7.5.sp,
                        letterSpacing = 2.2.sp
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { paddingValues ->
        var isNavMenuExpanded by remember { mutableStateOf(false) }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(scrollState)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {

            // Compact hamburger-style toggle button directly below header on the LEFT
            Box(modifier = Modifier.wrapContentSize(Alignment.TopStart)) {
                OutlinedButton(
                    onClick = { isNavMenuExpanded = !isNavMenuExpanded },
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp),
                    modifier = Modifier.height(36.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = MaterialTheme.colorScheme.onSurface
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.Menu,
                        contentDescription = "Menu",
                        modifier = Modifier.size(20.dp)
                    )
                }

                DropdownMenu(
                    expanded = isNavMenuExpanded,
                    onDismissRequest = { isNavMenuExpanded = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("Settings", fontSize = 14.sp, fontWeight = FontWeight.Medium) },
                        leadingIcon = {
                            Icon(Icons.Default.Settings, contentDescription = null, modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isNavMenuExpanded = false
                            onNavigateToSettings()
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("History", fontSize = 14.sp, fontWeight = FontWeight.Medium) },
                        leadingIcon = {
                            Icon(Icons.Default.History, contentDescription = null, modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isNavMenuExpanded = false
                            onNavigateToHistory()
                        }
                    )
                    DropdownMenuItem(
                        text = {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Bookmarks", fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                val count = uiState.generalBookmarks.size + uiState.mathMcqBookmarks.size + uiState.mathSolutionBookmarks.size
                                if (count > 0) {
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Badge { Text("$count", fontSize = 11.sp) }
                                }
                            }
                        },
                        leadingIcon = {
                            Icon(Icons.Default.Bookmark, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(18.dp))
                        },
                        onClick = {
                            isNavMenuExpanded = false
                            onNavigateToBookmarks()
                        }
                    )
                }
            }

            // API Key Missing Warning Banner
            if (!uiState.hasApiKey) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.WarningAmber,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Gemini API Key Required",
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onErrorContainer
                            )
                            Text(
                                text = "Please enter your own API key in Settings to generate questions.",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onErrorContainer
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = onNavigateToSettings,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error
                            ),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("Setup", fontSize = 12.sp)
                        }
                    }
                }
            }

            // ==========================================
            // MATH LAB SECTION (User Request)
            // ==========================================
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFFFFF7ED) // Light warm amber/orange
                ),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Calculate,
                                contentDescription = null,
                                tint = Color(0xFFF97316),
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "MATH LAB",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF0B1A40)
                            )
                        }
                        Text(
                            text = "NEW",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFF97316),
                            modifier = Modifier
                                .background(Color(0xFFFFEDD5), RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Chapter-wise MCQ generator, step-by-step problem solver, math history & dedicated bookmarks.",
                        fontSize = 12.sp,
                        color = Color(0xFF475569)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // 4 Action Buttons as requested
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = onNavigateToMathLab,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(vertical = 10.dp, horizontal = 4.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF0B1A40))
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Math MCQ", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Text("Generator", fontSize = 10.sp, color = Color.Gray)
                            }
                        }

                        OutlinedButton(
                            onClick = onNavigateToMathLab,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(vertical = 10.dp, horizontal = 4.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF0B1A40))
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Math", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Text("Solver", fontSize = 10.sp, color = Color.Gray)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = onNavigateToMathLab,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(vertical = 10.dp, horizontal = 4.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF0B1A40))
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Math", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Text("History", fontSize = 10.sp, color = Color.Gray)
                            }
                        }

                        Button(
                            onClick = onNavigateToBookmarks,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(vertical = 10.dp, horizontal = 4.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316))
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Math", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                Text("Bookmarks", fontSize = 10.sp)
                            }
                        }
                    }
                }
            }

            // Academic Exam Preparation Header
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = BlueLight
                ),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Academic Exam Preparation",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = BluePrimary
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Practice any subject with AI-generated exam questions, countdown timer, and comprehensive answer reviews.",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // 1. Enter Topic
            Text(
                text = "1. Enter Exam Topic",
                fontWeight = FontWeight.SemiBold,
                fontSize = 16.sp
            )
            OutlinedTextField(
                value = uiState.topic,
                onValueChange = { viewModel.onTopicChange(it) },
                label = { Text("Topic or Subject") },
                placeholder = { Text("e.g. Android Activity, Machine Learning") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                shape = RoundedCornerShape(10.dp)
            )

            // Quick Topic suggestions
            Text(
                text = "Suggestions:",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(sampleTopics) { sample ->
                    SuggestionChip(
                        onClick = { viewModel.onTopicChange(sample) },
                        label = { Text(sample, fontSize = 12.sp) }
                    )
                }
            }

            Divider()

            // 2. Question Type
            Text(
                text = "2. Question Type",
                fontWeight = FontWeight.SemiBold,
                fontSize = 16.sp
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                QuestionTypeCard(
                    title = "MCQ",
                    description = "4 Options (A, B, C, D)",
                    isSelected = uiState.questionType == QuestionType.MCQ,
                    modifier = Modifier.weight(1f)
                ) {
                    viewModel.onQuestionTypeChange(QuestionType.MCQ)
                }

                QuestionTypeCard(
                    title = "Very Short",
                    description = "Typed Short Answers",
                    isSelected = uiState.questionType == QuestionType.VERY_SHORT,
                    modifier = Modifier.weight(1f)
                ) {
                    viewModel.onQuestionTypeChange(QuestionType.VERY_SHORT)
                }
            }

            Divider()

            // 3. Number of Questions
            Text(
                text = "3. Number of Questions",
                fontWeight = FontWeight.SemiBold,
                fontSize = 16.sp
            )
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(questionCounts) { count ->
                    FilterChip(
                        selected = uiState.questionCount == count,
                        onClick = { viewModel.onQuestionCountChange(count) },
                        label = {
                            Text(
                                text = "$count Qs",
                                fontWeight = if (uiState.questionCount == count) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    )
                }
            }

            Divider()

            // 4. Quiz Mode (Timed / Untimed)
            Text(
                text = "4. Quiz Mode",
                fontWeight = FontWeight.SemiBold,
                fontSize = 16.sp
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                QuizModeCard(
                    title = "Timed Mode",
                    detail = "${uiState.questionCount} min (${uiState.questionCount} Qs)",
                    isSelected = uiState.quizMode == QuizMode.TIMED,
                    modifier = Modifier.weight(1f)
                ) {
                    viewModel.onQuizModeChange(QuizMode.TIMED)
                }

                QuizModeCard(
                    title = "Untimed Mode",
                    detail = "No time limit",
                    isSelected = uiState.quizMode == QuizMode.UNTIMED,
                    modifier = Modifier.weight(1f)
                ) {
                    viewModel.onQuizModeChange(QuizMode.UNTIMED)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Start Quiz Button
            Button(
                onClick = {
                    // Open the dedicated Quiz screen immediately. It shows a generation
                    // loader, then turns into the playable quiz when Gemini responds.
                    if (uiState.hasApiKey) {
                        onStartQuiz()
                        viewModel.startQuiz(onSuccess = {})
                    } else {
                        viewModel.startQuiz(onSuccess = onStartQuiz)
                    }
                },
                enabled = !uiState.isGenerating && uiState.topic.isNotBlank(),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.PlayArrow, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Start Quiz",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            // Error display
            if (uiState.errorMessage != null) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = uiState.errorMessage,
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            }
        }
    }

    // Generating Quiz Loading Dialog
    if (uiState.isGenerating) {
        Dialog(onDismissRequest = { /* Cannot dismiss while generating */ }) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface
                ),
                elevation = CardDefaults.cardElevation(8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.primary,
                        strokeWidth = 4.dp,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Text(
                        text = "Generating your quiz...",
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "For topic: \"${uiState.topic}\"",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun QuestionTypeCard(
    title: String,
    description: String,
    isSelected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) BlueLight else MaterialTheme.colorScheme.surface
        ),
        border = CardDefaults.outlinedCardBorder(enabled = isSelected)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = title,
                fontWeight = FontWeight.Bold,
                color = if (isSelected) BluePrimary else MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = description,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun QuizModeCard(
    title: String,
    detail: String,
    isSelected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) BlueLight else MaterialTheme.colorScheme.surface
        ),
        border = CardDefaults.outlinedCardBorder(enabled = isSelected)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = title,
                fontWeight = FontWeight.Bold,
                color = if (isSelected) BluePrimary else MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = detail,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

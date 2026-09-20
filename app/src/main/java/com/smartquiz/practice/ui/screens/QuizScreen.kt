package com.smartquiz.practice.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartquiz.practice.model.QuestionType
import com.smartquiz.practice.model.QuizMode
import com.smartquiz.practice.ui.theme.BlueLight
import com.smartquiz.practice.ui.theme.BluePrimary
import com.smartquiz.practice.ui.theme.ErrorRed
import com.smartquiz.practice.ui.theme.Slate100
import com.smartquiz.practice.ui.theme.Slate700
import com.smartquiz.practice.viewmodel.QuizUiState
import com.smartquiz.practice.viewmodel.QuizViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuizScreen(
    viewModel: QuizViewModel,
    uiState: QuizUiState,
    onSubmitSuccess: () -> Unit,
    onExitConfirmed: () -> Unit
) {
    var showExitDialog by remember { mutableStateOf(false) }
    var showSubmitDialog by remember { mutableStateOf(false) }

    // Intercept hardware/system back button
    BackHandler {
        showExitDialog = true
    }

    // Submission can happen from the timer as well as from the Submit button.
    // Keep navigation in the screen so both paths always open the Result screen.
    LaunchedEffect(uiState.lastResult, uiState.isQuizActive) {
        if (uiState.lastResult != null && !uiState.isQuizActive && uiState.currentQuestions.isNotEmpty()) {
            onSubmitSuccess()
        }
    }

    val questions = uiState.currentQuestions
    if (questions.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize().padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            if (uiState.isGenerating) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator()
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Generating your quiz...", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Please wait. Your new quiz screen is being prepared.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            } else {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = uiState.errorMessage ?: "No active quiz.",
                        color = if (uiState.errorMessage != null) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedButton(onClick = onExitConfirmed) { Text("Back to Home") }
                }
            }
        }
        return
    }

    val currentIndex = uiState.currentQuestionIndex
    val currentQuestion = questions.getOrNull(currentIndex) ?: questions[0]
    val totalCount = questions.size
    val currentAnswer = uiState.userAnswers[currentQuestion.id]
    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = uiState.topic,
                        maxLines = 1,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { showExitDialog = true }) {
                        Icon(Icons.Default.Close, contentDescription = "Exit Quiz")
                    }
                },
                actions = {
                    // Timer or Untimed indicator
                    if (uiState.quizMode == QuizMode.TIMED) {
                        val isLowTime = uiState.remainingTimeSeconds < 120
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = if (isLowTime) MaterialTheme.colorScheme.errorContainer else BlueLight,
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Timer,
                                    contentDescription = null,
                                    tint = if (isLowTime) ErrorRed else BluePrimary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = viewModel.formatSeconds(uiState.remainingTimeSeconds),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = if (isLowTime) ErrorRed else BluePrimary
                                )
                            }
                        }
                    } else {
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = Slate100,
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Text(
                                text = "Untimed",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                                color = Slate700
                            )
                        }
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Linear Progress Bar
            val progress = (currentIndex + 1).toFloat() / totalCount.toFloat()
            LinearProgressIndicator(
                progress = progress,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp),
                color = MaterialTheme.colorScheme.primary,
                trackColor = Slate100
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .padding(16.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    // Question Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Question ${currentIndex + 1} of $totalCount",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = if (currentAnswer != null) "Answered" else "Unanswered",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (currentAnswer != null) BluePrimary else MaterialTheme.colorScheme.outline
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Question Text Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        ),
                        border = CardDefaults.outlinedCardBorder()
                    ) {
                        Text(
                            text = currentQuestion.question,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            lineHeight = 24.sp,
                            modifier = Modifier.padding(16.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Options or Input
                    if (uiState.questionType == QuestionType.MCQ) {
                        Text(
                            text = "Select one answer:",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        currentQuestion.options.forEach { option ->
                            val isSelected = currentAnswer?.selectedOption == option
                            McqOptionRow(
                                optionText = option,
                                isSelected = isSelected,
                                onClick = {
                                    viewModel.selectMcqOption(currentQuestion.id, option)
                                }
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                    } else {
                        // Very Short Question Text Input
                        Text(
                            text = "Your Answer:",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = currentAnswer?.textAnswer.orEmpty(),
                            onValueChange = { text ->
                                viewModel.enterTextAnswer(currentQuestion.id, text)
                            },
                            placeholder = { Text("Type your short answer here...") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2,
                            maxLines = 4,
                            shape = RoundedCornerShape(10.dp)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Keep answers concise (1-5 words or short key terms).",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.outline
                        )
                    }
                }

                // Bottom Navigation & Submit Actions
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 24.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.previousQuestion() },
                            enabled = currentIndex > 0,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Previous")
                        }

                        if (currentIndex < totalCount - 1) {
                            Button(
                                onClick = { viewModel.nextQuestion() },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("Next")
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(16.dp))
                            }
                        } else {
                            Button(
                                onClick = { showSubmitDialog = true },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary
                                ),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Submit")
                            }
                        }
                    }

                    if (currentIndex < totalCount - 1) {
                        Spacer(modifier = Modifier.height(8.dp))
                        TextButton(
                            onClick = { showSubmitDialog = true },
                            modifier = Modifier.align(Alignment.CenterHorizontally)
                        ) {
                            Text("Submit Quiz Early (${uiState.userAnswers.size}/$totalCount answered)")
                        }
                    }
                }
            }
        }
    }

    // Exit Quiz Confirmation Dialog
    if (showExitDialog) {
        AlertDialog(
            onDismissRequest = { showExitDialog = false },
            title = { Text("Exit Quiz?") },
            text = { Text("Your current quiz progress will be lost and will not be recorded in history.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showExitDialog = false
                        viewModel.exitQuiz()
                        onExitConfirmed()
                    }
                ) {
                    Text("Exit Quiz", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                Button(onClick = { showExitDialog = false }) {
                    Text("Continue Quiz")
                }
            }
        )
    }

    // Submit Quiz Confirmation Dialog
    if (showSubmitDialog) {
        val answeredCount = uiState.userAnswers.size
        val unansweredCount = totalCount - answeredCount
        AlertDialog(
            onDismissRequest = { showSubmitDialog = false },
            title = { Text("Submit Quiz?") },
            text = {
                Text(
                    if (unansweredCount > 0)
                        "You have $unansweredCount unanswered question(s). Are you sure you want to finish and view your results?"
                    else
                        "All questions have been answered. Ready to view your score and review?"
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showSubmitDialog = false
                        viewModel.submitQuiz {}
                    }
                ) {
                    Text("Yes, Submit")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSubmitDialog = false }) {
                    Text("Review More")
                }
            }
        )
    }
}

@Composable
fun McqOptionRow(
    optionText: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) BlueLight else MaterialTheme.colorScheme.surface
        ),
        border = CardDefaults.outlinedCardBorder(enabled = isSelected)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            RadioButton(
                selected = isSelected,
                onClick = onClick,
                colors = RadioButtonDefaults.colors(
                    selectedColor = BluePrimary
                )
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = optionText,
                fontSize = 15.sp,
                color = if (isSelected) BluePrimary else MaterialTheme.colorScheme.onSurface,
                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal
            )
        }
    }
}

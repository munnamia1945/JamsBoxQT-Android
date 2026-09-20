package com.smartquiz.practice.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Help
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartquiz.practice.model.QuestionType
import com.smartquiz.practice.model.QuizQuestion
import com.smartquiz.practice.model.UserAnswer
import com.smartquiz.practice.ui.theme.*
import com.smartquiz.practice.viewmodel.QuizUiState
import com.smartquiz.practice.viewmodel.QuizViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResultScreen(
    viewModel: QuizViewModel,
    uiState: QuizUiState,
    onRetryQuiz: () -> Unit,
    onNewQuiz: () -> Unit,
    onNavigateToHistory: () -> Unit
) {
    val result = uiState.lastResult

    if (result == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No result available.")
        }
        return
    }

    val scorePercentage = result.percentage.toInt()
    val gradeColor = when {
        scorePercentage >= 80 -> SuccessGreen
        scorePercentage >= 50 -> WarningAmber
        else -> ErrorRed
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Quiz Result", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Summary Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = result.topic,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "${result.questionType.displayName} • ${result.mode.displayName}",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Score Circle
                        Box(
                            modifier = Modifier
                                .size(110.dp)
                                .clip(CircleShape)
                                .background(gradeColor.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "$scorePercentage%",
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = gradeColor
                                )
                                Text(
                                    text = "${result.score}/${result.totalQuestions}",
                                    fontSize = 13.sp,
                                    color = Slate700,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Metrics Grid
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            MetricItem(
                                label = "Correct",
                                value = result.correctCount.toString(),
                                color = SuccessGreen
                            )
                            MetricItem(
                                label = "Wrong",
                                value = result.wrongCount.toString(),
                                color = ErrorRed
                            )
                            MetricItem(
                                label = "Unanswered",
                                value = result.unansweredCount.toString(),
                                color = Slate500
                            )
                            MetricItem(
                                label = "Time",
                                value = viewModel.formatSeconds(result.timeTakenSeconds),
                                color = BluePrimary
                            )
                        }
                    }
                }
            }

            // Action Buttons
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = {
                                viewModel.retryQuiz()
                                onRetryQuiz()
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Retry Quiz")
                        }

                        OutlinedButton(
                            onClick = onNewQuiz,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Home, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("New Quiz")
                        }
                    }

                    OutlinedButton(
                        onClick = onNavigateToHistory,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.History, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("View Saved History")
                    }

                    Button(
                        onClick = { viewModel.bookmarkWholeQuiz() },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316))
                    ) {
                        Icon(Icons.Default.Bookmark, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Bookmark This Quiz / Questions")
                    }
                }
            }

            // Review Heading
            item {
                Text(
                    text = "Question-by-Question Review",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            // Question Review List
            itemsIndexed(result.questions) { index, question ->
                val answer = result.userAnswers[question.id]
                ReviewQuestionCard(
                    index = index + 1,
                    question = question,
                    answer = answer,
                    questionType = result.questionType
                )
            }
        }
    }
}

@Composable
fun MetricItem(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            fontSize = 12.sp,
            color = Slate500
        )
    }
}

@Composable
fun ReviewQuestionCard(
    index: Int,
    question: QuizQuestion,
    answer: UserAnswer?,
    questionType: QuestionType
) {
    val isAnswered = answer != null && (!answer.selectedOption.isNullOrBlank() || !answer.textAnswer.isNullOrBlank())
    val isCorrect = answer?.isCorrect == true

    val cardBorderColor = when {
        !isAnswered -> Slate300
        isCorrect -> SuccessGreen
        else -> ErrorRed
    }

    val statusIcon = when {
        !isAnswered -> Icons.Default.Help
        isCorrect -> Icons.Default.Check
        else -> Icons.Default.Close
    }

    val statusColor = when {
        !isAnswered -> Slate500
        isCorrect -> SuccessGreen
        else -> ErrorRed
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Header with status indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Q$index",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.primary
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = statusIcon,
                        contentDescription = null,
                        tint = statusColor,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = when {
                            !isAnswered -> "Unanswered"
                            isCorrect -> "Correct"
                            else -> "Incorrect"
                        },
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = statusColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Question Text
            Text(
                text = question.question,
                fontWeight = FontWeight.SemiBold,
                fontSize = 15.sp,
                lineHeight = 21.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            // User's answer
            val userDisplay = when {
                !isAnswered -> "Not answered"
                questionType == QuestionType.MCQ -> answer?.selectedOption ?: "None"
                else -> answer?.textAnswer ?: "None"
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (!isAnswered) Slate100 else if (isCorrect) SuccessLight else ErrorLight,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(10.dp)) {
                    Text(
                        text = "Your Answer:",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Slate700
                    )
                    Text(
                        text = userDisplay,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (!isAnswered) Slate700 else if (isCorrect) SuccessGreen else ErrorRed
                    )
                }
            }

            // If incorrect or unanswered, show correct answer clearly
            if (!isCorrect) {
                Spacer(modifier = Modifier.height(6.dp))
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = SuccessLight,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = "Correct Answer:",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Slate700
                        )
                        Text(
                            text = question.correctAnswer,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = SuccessGreen
                        )
                    }
                }
            }

            // Explanation
            if (question.explanation.isNotBlank()) {
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "Explanation:",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = question.explanation,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 18.sp
                )
            }
        }
    }
}

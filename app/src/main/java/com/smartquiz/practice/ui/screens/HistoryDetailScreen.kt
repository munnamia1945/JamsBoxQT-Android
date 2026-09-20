package com.smartquiz.practice.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartquiz.practice.model.QuestionType
import com.smartquiz.practice.ui.theme.BluePrimary
import com.smartquiz.practice.ui.theme.ErrorRed
import com.smartquiz.practice.ui.theme.SuccessGreen
import com.smartquiz.practice.ui.theme.WarningAmber
import com.smartquiz.practice.viewmodel.QuizUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryDetailScreen(
    uiState: QuizUiState,
    onNavigateBack: () -> Unit
) {
    val item = uiState.selectedHistoryItem

    if (item == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Record not found.")
        }
        return
    }

    val percentage = item.percentage.toInt()
    val badgeColor = when {
        percentage >= 80 -> SuccessGreen
        percentage >= 50 -> WarningAmber
        else -> ErrorRed
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(item.topic, maxLines = 1, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
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
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Exam Summary",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = badgeColor.copy(alpha = 0.12f)
                            ) {
                                Text(
                                    text = "$percentage% Score",
                                    color = badgeColor,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Text(text = "Topic: ${item.topic}", fontSize = 14.sp)
                        Text(text = "Format: ${item.questionType}", fontSize = 14.sp)
                        Text(text = "Mode: ${item.mode}", fontSize = 14.sp)
                        Text(text = "Total Questions: ${item.totalQuestions}", fontSize = 14.sp)
                        Text(text = "Score: ${item.score}/${item.totalQuestions}", fontSize = 14.sp)
                        Text(text = "Time Taken: ${item.timeTakenFormatted}", fontSize = 14.sp)
                        Text(text = "Completed: ${item.formattedDate}", fontSize = 14.sp, color = MaterialTheme.colorScheme.outline)
                    }
                }
            }

            item {
                Text(
                    text = "Saved Questions & Answers",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 6.dp)
                )
            }

            val isMcq = item.questionType.contains("MCQ", ignoreCase = true)
            itemsIndexed(item.questions) { index, question ->
                val answer = item.userAnswers[question.id]
                ReviewQuestionCard(
                    index = index + 1,
                    question = question,
                    answer = answer,
                    questionType = if (isMcq) QuestionType.MCQ else QuestionType.VERY_SHORT
                )
            }
        }
    }
}

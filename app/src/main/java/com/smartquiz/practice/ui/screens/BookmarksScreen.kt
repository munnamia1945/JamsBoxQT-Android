package com.smartquiz.practice.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartquiz.practice.ui.theme.BluePrimary
import com.smartquiz.practice.viewmodel.QuizUiState
import com.smartquiz.practice.viewmodel.QuizViewModel

enum class BookmarkTab {
    ALL,
    GENERAL,
    MATH_MCQ,
    MATH_SOL
}

sealed class BookmarkDeleteTarget {
    data class General(val id: String, val title: String) : BookmarkDeleteTarget()
    data class MathMcq(val id: String, val title: String) : BookmarkDeleteTarget()
    data class MathSolution(val id: String, val title: String) : BookmarkDeleteTarget()
}

enum class ClearBookmarksCategory {
    GENERAL,
    MATH
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookmarksScreen(
    viewModel: QuizViewModel,
    uiState: QuizUiState,
    onBack: () -> Unit,
    onNavigateToQuiz: () -> Unit
) {
    var activeTab by remember { mutableStateOf(BookmarkTab.ALL) }
    var searchQuery by remember { mutableStateOf("") }
    var singleDeleteTarget by remember { mutableStateOf<BookmarkDeleteTarget?>(null) }
    var clearCategoryTarget by remember { mutableStateOf<ClearBookmarksCategory?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Bookmark,
                            contentDescription = null,
                            tint = Color(0xFFF97316),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "BOOKMARKS",
                            fontWeight = FontWeight.Black,
                            fontSize = 18.sp,
                            color = Color(0xFF0B1A40)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Search Input
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                placeholder = { Text("Search by topic, chapter, or question...") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            )

            // Category Filter Pills
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                FilterChip(
                    selected = activeTab == BookmarkTab.ALL,
                    onClick = { activeTab = BookmarkTab.ALL },
                    label = { Text("All (${uiState.generalBookmarks.size + uiState.mathMcqBookmarks.size + uiState.mathSolutionBookmarks.size})") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = activeTab == BookmarkTab.GENERAL,
                    onClick = { activeTab = BookmarkTab.GENERAL },
                    label = { Text("General (${uiState.generalBookmarks.size})") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = activeTab == BookmarkTab.MATH_MCQ,
                    onClick = { activeTab = BookmarkTab.MATH_MCQ },
                    label = { Text("Math MCQ (${uiState.mathMcqBookmarks.size})") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = activeTab == BookmarkTab.MATH_SOL,
                    onClick = { activeTab = BookmarkTab.MATH_SOL },
                    label = { Text("Solutions (${uiState.mathSolutionBookmarks.size})") },
                    modifier = Modifier.weight(1f)
                )
            }

            // Bookmarks List
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                // 1. General Bookmarks
                if (activeTab == BookmarkTab.ALL || activeTab == BookmarkTab.GENERAL) {
                    if (uiState.generalBookmarks.isNotEmpty()) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF))
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 12.dp, vertical = 8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        "General Bookmarks (${uiState.generalBookmarks.size})",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = BluePrimary
                                    )
                                    TextButton(
                                        onClick = { clearCategoryTarget = ClearBookmarksCategory.GENERAL },
                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Delete,
                                            contentDescription = null,
                                            tint = Color(0xFFDC2626),
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            "Clear All General Bookmarks",
                                            color = Color(0xFFDC2626),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }

                    val filteredGeneral = uiState.generalBookmarks.filter {
                        searchQuery.isBlank() || it.topic.contains(searchQuery, ignoreCase = true)
                    }
                    items(filteredGeneral) { item ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("GENERAL QUIZ", fontWeight = FontWeight.Bold, color = BluePrimary, fontSize = 11.sp)
                                    IconButton(
                                        onClick = {
                                            singleDeleteTarget = BookmarkDeleteTarget.General(
                                                id = item.id,
                                                title = item.topic.ifBlank { item.title }
                                            )
                                        },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Gray)
                                    }
                                }
                                Text(item.title, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text("${item.questionCount} Questions • ${item.formattedDate}", fontSize = 12.sp, color = Color.Gray)
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(
                                    onClick = {
                                        viewModel.attemptGeneralQuizBookmark(item) {
                                            onNavigateToQuiz()
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(containerColor = BluePrimary),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Attempt Quiz")
                                }
                            }
                        }
                    }
                }

                // 2. Math Bookmarks Header (Clear All Math Bookmarks)
                if (activeTab == BookmarkTab.ALL || activeTab == BookmarkTab.MATH_MCQ || activeTab == BookmarkTab.MATH_SOL) {
                    val totalMath = uiState.mathMcqBookmarks.size + uiState.mathSolutionBookmarks.size
                    if (totalMath > 0 && activeTab != BookmarkTab.ALL) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF7ED))
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 12.dp, vertical = 8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        "Math Bookmarks ($totalMath)",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = Color(0xFFC2410C)
                                    )
                                    TextButton(
                                        onClick = { clearCategoryTarget = ClearBookmarksCategory.MATH },
                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Delete,
                                            contentDescription = null,
                                            tint = Color(0xFFDC2626),
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            "Clear All Math Bookmarks",
                                            color = Color(0xFFDC2626),
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // 2. Math MCQ Bookmarks
                if (activeTab == BookmarkTab.ALL || activeTab == BookmarkTab.MATH_MCQ) {
                    val filteredMathMcqs = uiState.mathMcqBookmarks.filter {
                        searchQuery.isBlank() || it.chapter.contains(searchQuery, ignoreCase = true) ||
                                it.topic.contains(searchQuery, ignoreCase = true) ||
                                it.question.contains(searchQuery, ignoreCase = true)
                    }
                    items(filteredMathMcqs) { item ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("${item.chapter.uppercase()} • ${item.difficulty.uppercase()}", fontWeight = FontWeight.Bold, color = Color(0xFFF97316), fontSize = 11.sp)
                                    IconButton(
                                        onClick = {
                                            singleDeleteTarget = BookmarkDeleteTarget.MathMcq(
                                                id = item.id,
                                                title = "${item.chapter} MCQ: ${item.question}"
                                            )
                                        },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Gray)
                                    }
                                }
                                Text(item.question, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Correct: ${item.correctAnswer}", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = BluePrimary)
                                Text(item.explanation, fontSize = 11.sp, color = Color.DarkGray)
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(
                                    onClick = {
                                        viewModel.attemptMathMcqBookmark(item) {
                                            onNavigateToQuiz()
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316)),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Solve Question")
                                }
                            }
                        }
                    }
                }

                // 3. Math Solution Bookmarks
                if (activeTab == BookmarkTab.ALL || activeTab == BookmarkTab.MATH_SOL) {
                    val filteredSolutions = uiState.mathSolutionBookmarks.filter {
                        searchQuery.isBlank() || it.chapter.contains(searchQuery, ignoreCase = true) ||
                                it.topic.contains(searchQuery, ignoreCase = true) ||
                                it.problem.contains(searchQuery, ignoreCase = true)
                    }
                    items(filteredSolutions) { item ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("MATH SOLUTION • ${item.chapter.uppercase()}", fontWeight = FontWeight.Bold, color = Color(0xFFF97316), fontSize = 11.sp)
                                    IconButton(
                                        onClick = {
                                            singleDeleteTarget = BookmarkDeleteTarget.MathSolution(
                                                id = item.id,
                                                title = "${item.chapter} Solution: ${item.problem}"
                                            )
                                        },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Gray)
                                    }
                                }
                                Text(item.problem, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                Spacer(modifier = Modifier.height(4.dp))
                                item.solutionSteps.take(2).forEachIndexed { i, step ->
                                    Text("${i + 1}. $step", fontSize = 12.sp, color = Color.DarkGray)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Final: ${item.finalAnswer}", fontWeight = FontWeight.Black, fontSize = 13.sp, color = BluePrimary)
                            }
                        }
                    }
                }
            }
        }
    }

    // Single Bookmark Delete Confirmation Dialog
    if (singleDeleteTarget != null) {
        val target = singleDeleteTarget!!
        val itemTitle = when (target) {
            is BookmarkDeleteTarget.General -> target.title
            is BookmarkDeleteTarget.MathMcq -> target.title
            is BookmarkDeleteTarget.MathSolution -> target.title
        }
        AlertDialog(
            onDismissRequest = { singleDeleteTarget = null },
            title = {
                Text("Delete this bookmark?", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            },
            text = {
                Column {
                    Text(itemTitle, fontSize = 13.sp, fontWeight = FontWeight.Medium, maxLines = 2)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Only this selected bookmark will be deleted. All other bookmarks remain unchanged.",
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        when (target) {
                            is BookmarkDeleteTarget.General -> viewModel.deleteGeneralBookmark(target.id)
                            is BookmarkDeleteTarget.MathMcq -> viewModel.deleteMathMcqBookmark(target.id)
                            is BookmarkDeleteTarget.MathSolution -> viewModel.deleteMathSolutionBookmark(target.id)
                        }
                        singleDeleteTarget = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626))
                ) {
                    Text("Delete", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { singleDeleteTarget = null }) {
                    Text("Cancel", color = Color.DarkGray)
                }
            }
        )
    }

    // Clear All Bookmarks Confirmation Dialog
    if (clearCategoryTarget != null) {
        val cat = clearCategoryTarget!!
        AlertDialog(
            onDismissRequest = { clearCategoryTarget = null },
            title = {
                Text(
                    "Are you sure you want to delete all bookmarks in this section?",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            },
            text = {
                Column {
                    Text(
                        if (cat == ClearBookmarksCategory.GENERAL) "Section: General Bookmarks" else "Section: Math Bookmarks",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "This will delete all bookmarks belonging to this section only. Quiz History, Settings, API Keys, and other bookmark categories will remain untouched.",
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (cat == ClearBookmarksCategory.GENERAL) {
                            viewModel.clearGeneralBookmarks()
                        } else {
                            viewModel.clearMathBookmarks()
                        }
                        clearCategoryTarget = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626))
                ) {
                    Text("Clear All", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { clearCategoryTarget = null }) {
                    Text("Cancel", color = Color.DarkGray)
                }
            }
        )
    }
}

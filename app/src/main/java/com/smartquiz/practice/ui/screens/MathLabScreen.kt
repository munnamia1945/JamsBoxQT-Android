package com.smartquiz.practice.ui.screens

import android.content.Context
import android.net.Uri
import android.util.Base64
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import java.io.ByteArrayOutputStream
import com.smartquiz.practice.util.PdfExport

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartquiz.practice.model.MathDifficulty
import com.smartquiz.practice.model.MathHistoryItem
import com.smartquiz.practice.model.MathSolution
import com.smartquiz.practice.ui.theme.BluePrimary
import com.smartquiz.practice.viewmodel.QuizUiState
import com.smartquiz.practice.viewmodel.QuizViewModel

val MATH_CHAPTER_LIST = listOf(
    "Arithmetic",
    "Number System",
    "Algebra",
    "Linear Equations",
    "Quadratic Equations",
    "Exponents",
    "Logarithms",
    "Ratio & Proportion",
    "Percentage",
    "Profit & Loss",
    "Average",
    "Geometry",
    "Coordinate Geometry",
    "Mensuration",
    "Permutation & Combination",
    "Probability",
    "Statistics",
    "Set Theory",
    "Functions",
    "Sequence & Series",
    "Trigonometry",
    "Calculus",
    "Other / Custom Topic"
)

enum class MathLabTab {
    MCQ_GEN,
    SOLVER,
    HISTORY
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MathLabScreen(
    viewModel: QuizViewModel,
    uiState: QuizUiState,
    onBack: () -> Unit,
    onNavigateToBookmarks: () -> Unit,
    onNavigateToQuiz: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    var activeTab by remember { mutableStateOf(MathLabTab.MCQ_GEN) }

    // MCQ Gen state
    var selectedChapter by remember { mutableStateOf("Algebra") }
    var customTopic by remember { mutableStateOf("") }
    var questionCount by remember { mutableIntStateOf(20) }
    var selectedDifficulty by remember { mutableStateOf(MathDifficulty.MEDIUM) }

    val context = androidx.compose.ui.platform.LocalContext.current

    // Solver state
    var solverChapter by remember { mutableStateOf("Algebra") }
    var solverTopic by remember { mutableStateOf("") }
    var typedProblem by remember { mutableStateOf("") }
    var selectedFileBase64 by remember { mutableStateOf<String?>(null) }
    var selectedFileMime by remember { mutableStateOf<String?>(null) }
    var selectedFileName by remember { mutableStateOf<String?>(null) }

    fun readBase64(context: Context, uri: Uri): String? = runCatching {
        context.contentResolver.openInputStream(uri)?.use { input ->
            val out = ByteArrayOutputStream()
            input.copyTo(out)
            Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
        }
    }.getOrNull()

    val photoPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            selectedFileBase64 = readBase64(context = context, uri = uri)
            selectedFileMime = context.contentResolver.getType(uri) ?: "image/jpeg"
            selectedFileName = uri.lastPathSegment ?: "Selected photo"
        }
    }
    val pdfPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            selectedFileBase64 = readBase64(context = context, uri = uri)
            selectedFileMime = "application/pdf"
            selectedFileName = uri.lastPathSegment ?: "Selected PDF"
        }
    }
    var solverMode by remember { mutableStateOf("TYPED") } // TYPED, PHOTO, PDF

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
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
                actions = {
                    IconButton(onClick = onNavigateToBookmarks) {
                        Icon(
                            Icons.Default.Bookmark,
                            contentDescription = "Bookmarks",
                            tint = Color(0xFFF97316)
                        )
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
            // 4 Navigation Cards as requested by user
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { activeTab = MathLabTab.MCQ_GEN },
                    colors = CardDefaults.cardColors(
                        containerColor = if (activeTab == MathLabTab.MCQ_GEN) Color(0xFFFFF7ED) else Color.White
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Icon(Icons.Default.Quiz, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("MCQ Generator", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }

                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { activeTab = MathLabTab.SOLVER },
                    colors = CardDefaults.cardColors(
                        containerColor = if (activeTab == MathLabTab.SOLVER) Color(0xFFFFF7ED) else Color.White
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Icon(Icons.Default.Calculate, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Math Solver", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }

                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { activeTab = MathLabTab.HISTORY },
                    colors = CardDefaults.cardColors(
                        containerColor = if (activeTab == MathLabTab.HISTORY) Color(0xFFFFF7ED) else Color.White
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Icon(Icons.Default.History, contentDescription = null, tint = Color(0xFF0B1A40), modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Math History", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }

                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigateToBookmarks() },
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Icon(Icons.Default.Bookmark, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Bookmarks", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }

            // Tab Content
            when (activeTab) {
                MathLabTab.MCQ_GEN -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Text("1. Select Chapter / Topic", fontWeight = FontWeight.Bold, fontSize = 13.sp)

                        var expanded by remember { mutableStateOf(false) }
                        OutlinedCard(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { expanded = !expanded },
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(selectedChapter, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            }
                        }

                        DropdownMenu(
                            expanded = expanded,
                            onDismissRequest = { expanded = false }
                        ) {
                            MATH_CHAPTER_LIST.forEach { chapter ->
                                DropdownMenuItem(
                                    text = { Text(chapter) },
                                    onClick = {
                                        selectedChapter = chapter
                                        expanded = false
                                    }
                                )
                            }
                        }

                        OutlinedTextField(
                            value = customTopic,
                            onValueChange = { customTopic = it },
                            label = { Text("Specific / Custom Topic (Optional)") },
                            placeholder = { Text("e.g. Quadratic Formula, Factoring") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )

                        Text("2. Number of Questions", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            listOf(10, 20, 30, 40, 50).forEach { count ->
                                FilterChip(
                                    selected = questionCount == count,
                                    onClick = { questionCount = count },
                                    label = { Text("$count") },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }

                        Text("3. Difficulty Level", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            MathDifficulty.values().forEach { diff ->
                                FilterChip(
                                    selected = selectedDifficulty == diff,
                                    onClick = { selectedDifficulty = diff },
                                    label = { Text(diff.displayName) },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Button(
                            onClick = {
                                val topicName = if (customTopic.isNotBlank()) customTopic.trim() else selectedChapter
                                if (uiState.hasApiKey) {
                                    onNavigateToQuiz()
                                    viewModel.startMathQuiz(selectedChapter, topicName, selectedDifficulty, questionCount) {}
                                } else {
                                    viewModel.startMathQuiz(selectedChapter, topicName, selectedDifficulty, questionCount) {
                                        onNavigateToQuiz()
                                    }
                                }
                            },
                            enabled = !uiState.isGenerating,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316))
                        ) {
                            if (uiState.isGenerating) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(18.dp),
                                    color = Color.White,
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("GENERATING...", fontWeight = FontWeight.Bold)
                            } else {
                                Icon(Icons.Default.PlayArrow, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("GENERATE MATH MCQs", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                MathLabTab.SOLVER -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Modes: Typed, Photo, PDF
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf("TYPED" to "Typed", "PHOTO" to "Photo", "PDF" to "PDF").forEach { (modeKey, modeTitle) ->
                                FilterChip(
                                    selected = solverMode == modeKey,
                                    onClick = {
                                        solverMode = modeKey
                                        if (modeKey == "PHOTO") photoPicker.launch("image/*")
                                        if (modeKey == "PDF") pdfPicker.launch("application/pdf")
                                        if (modeKey == "TYPED") {
                                            selectedFileBase64 = null
                                            selectedFileMime = null
                                            selectedFileName = null
                                        }
                                    },
                                    label = { Text(modeTitle) },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }

                        OutlinedTextField(
                            value = solverTopic,
                            onValueChange = { solverTopic = it },
                            label = { Text("Chapter / Topic") },
                            placeholder = { Text("e.g. Algebra") },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        )

                        if (solverMode != "TYPED") {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC))
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(selectedFileName ?: "No file selected", fontSize = 13.sp, modifier = Modifier.weight(1f))
                                    TextButton(onClick = {
                                        if (solverMode == "PHOTO") photoPicker.launch("image/*") else pdfPicker.launch("application/pdf")
                                    }) { Text("Choose") }
                                }
                            }
                        }

                        OutlinedTextField(
                            value = typedProblem,
                            onValueChange = { typedProblem = it },
                            label = { Text("Enter Math Problem") },
                            placeholder = { Text("e.g. Solve 2x² - 5x + 2 = 0") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 3,
                            shape = RoundedCornerShape(12.dp)
                        )

                        Button(
                            onClick = {
                                viewModel.solveMathProblem(solverChapter, solverTopic.ifBlank { solverChapter }, typedProblem, selectedFileBase64, selectedFileMime)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                        ) {
                            if (uiState.isSolvingMath) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                            } else {
                                Icon(Icons.Default.Calculate, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("SOLVE", fontWeight = FontWeight.Bold)
                            }
                        }

                        // Display solution if available
                        uiState.currentMathSolution?.let { sol ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White)
                            ) {
                                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text("Problem:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color.Gray)
                                    Text(sol.problem, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)

                                    Divider()
                                    Text("Step-by-Step Solution:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = BluePrimary)
                                    sol.solutionSteps.forEachIndexed { i, step ->
                                        Text("${i + 1}. $step", fontSize = 13.sp)
                                    }

                                    Divider()
                                    Text("Final Answer:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFFF97316))
                                    Text(sol.finalAnswer, fontWeight = FontWeight.Black, fontSize = 15.sp)

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        OutlinedButton(
                                            onClick = { viewModel.saveCurrentMathSolutionToHistory() },
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Text("Save Solution", fontSize = 12.sp)
                                        }
                                        Button(
                                            onClick = { viewModel.saveCurrentMathSolutionToBookmark() },
                                            modifier = Modifier.weight(1f),
                                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316))
                                        ) {
                                            Text("☆ Bookmark", fontSize = 12.sp)
                                        }
                                        OutlinedButton(
                                            onClick = {
                                                val solNow = uiState.currentMathSolution
                                                if (solNow != null) {
                                                    val fileName = "JamsBox_${System.currentTimeMillis()}.pdf"
                                                    val uri = PdfExport.createDownloadsUri(context.contentResolver, fileName)
                                                    if (uri != null) {
                                                        PdfExport.exportSolution(context.contentResolver, uri, solNow.chapter, solNow.topic, solNow.problem, solNow.solutionSteps, solNow.finalAnswer, solNow.formattedDate)
                                                    }
                                                }
                                            },
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Text("PDF", fontSize = 12.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                MathLabTab.HISTORY -> {
                    if (uiState.mathHistoryList.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("No Math History yet. Solved problems and MCQ attempts appear here.", color = Color.Gray)
                        }
                    } else {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(uiState.mathHistoryList) { item ->
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = Color.White)
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(item.chapter, fontWeight = FontWeight.Bold, color = Color(0xFFF97316), fontSize = 12.sp)
                                            Text(item.formattedDate, fontSize = 11.sp, color = Color.Gray)
                                        }
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(item.topic, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)

                                        if (item.type == "MCQ_ATTEMPT") {
                                            Text("Score: ${item.score}/${item.questionCount} (${item.percentage?.toInt()}%)", fontSize = 12.sp, color = BluePrimary)
                                            Spacer(modifier = Modifier.height(6.dp))
                                            Button(
                                                onClick = {
                                                    viewModel.attemptMathHistory(item) {
                                                        onNavigateToQuiz()
                                                    }
                                                },
                                                modifier = Modifier.fillMaxWidth(),
                                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF97316))
                                            ) {
                                                Text("Attempt Again")
                                            }
                                        } else {
                                            item.problem?.let { Text(it, maxLines = 2, fontSize = 12.sp, color = Color.DarkGray) }
                                            Spacer(modifier = Modifier.height(4.dp))
                                            item.finalAnswer?.let { Text("Ans: $it", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = BluePrimary) }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

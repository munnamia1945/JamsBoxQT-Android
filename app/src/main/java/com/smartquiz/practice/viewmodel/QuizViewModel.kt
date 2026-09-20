package com.smartquiz.practice.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.smartquiz.practice.data.PreferencesManager
import com.smartquiz.practice.data.QuizRepository
import com.smartquiz.practice.model.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

data class QuizUiState(
    // Home configuration
    val topic: String = "Android Development",
    val questionType: QuestionType = QuestionType.MCQ,
    val questionCount: Int = 20,
    val quizMode: QuizMode = QuizMode.TIMED,
    val isGenerating: Boolean = false,
    val errorMessage: String? = null,
    val infoMessage: String? = null,

    // Active Quiz state
    val currentQuestions: List<QuizQuestion> = emptyList(),
    val currentQuestionIndex: Int = 0,
    val userAnswers: Map<Int, UserAnswer> = emptyMap(),
    val remainingTimeSeconds: Long = 0,
    val totalTimeSeconds: Long = 0,
    val isQuizActive: Boolean = false,
    val isMathQuiz: Boolean = false,
    val mathChapter: String? = null,
    val mathDifficulty: MathDifficulty = MathDifficulty.MEDIUM,

    // Result state
    val lastResult: QuizResult? = null,

    // General History state
    val historyList: List<QuizHistoryItem> = emptyList(),
    val selectedHistoryItem: QuizHistoryItem? = null,

    // Math Lab & Bookmarks state
    val mathHistoryList: List<MathHistoryItem> = emptyList(),
    val generalBookmarks: List<GeneralQuizBookmark> = emptyList(),
    val mathMcqBookmarks: List<MathMcqBookmark> = emptyList(),
    val mathSolutionBookmarks: List<MathSolutionBookmark> = emptyList(),

    // Math Solver state
    val isSolvingMath: Boolean = false,
    val currentMathSolution: MathSolution? = null,

    // Settings state
    val apiKeyInput: String = "",
    val isTestingApiKey: Boolean = false,
    val apiKeyTestResult: String? = null,
    val hasApiKey: Boolean = false
)

class QuizViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: QuizRepository = QuizRepository(PreferencesManager(application))

    private val _uiState = MutableStateFlow(QuizUiState())
    val uiState: StateFlow<QuizUiState> = _uiState.asStateFlow()

    private var timerJob: Job? = null
    private var quizStartTimeMillis: Long = 0

    init {
        loadSettings()
        loadHistory()
        loadBookmarks()
        loadMathHistory()
    }

    fun loadSettings() {
        val key = repository.getApiKey()
        _uiState.update {
            it.copy(
                apiKeyInput = key,
                hasApiKey = key.isNotBlank()
            )
        }
    }

    fun loadHistory() {
        val history = repository.getQuizHistory()
        _uiState.update { it.copy(historyList = history) }
    }

    fun loadBookmarks() {
        val general = repository.getGeneralBookmarks()
        val mathMcqs = repository.getMathMcqBookmarks()
        val mathSolutions = repository.getMathSolutionBookmarks()
        _uiState.update {
            it.copy(
                generalBookmarks = general,
                mathMcqBookmarks = mathMcqs,
                mathSolutionBookmarks = mathSolutions
            )
        }
    }

    fun loadMathHistory() {
        val mathHist = repository.getMathHistory()
        _uiState.update { it.copy(mathHistoryList = mathHist) }
    }

    fun onTopicChange(newTopic: String) {
        _uiState.update { it.copy(topic = newTopic, errorMessage = null) }
    }

    fun onQuestionTypeChange(newType: QuestionType) {
        _uiState.update { it.copy(questionType = newType) }
    }

    fun onQuestionCountChange(newCount: Int) {
        _uiState.update { it.copy(questionCount = newCount) }
    }

    fun onQuizModeChange(newMode: QuizMode) {
        _uiState.update { it.copy(quizMode = newMode) }
    }

    fun onApiKeyInputChange(newKey: String) {
        _uiState.update { it.copy(apiKeyInput = newKey, apiKeyTestResult = null) }
    }

    fun saveApiKey() {
        val key = _uiState.value.apiKeyInput.trim()
        repository.saveApiKey(key)
        _uiState.update {
            it.copy(
                hasApiKey = key.isNotBlank(),
                infoMessage = "API Key saved securely on device."
            )
        }
    }

    fun clearApiKey() {
        repository.clearApiKey()
        _uiState.update {
            it.copy(
                apiKeyInput = "",
                hasApiKey = false,
                infoMessage = "API Key cleared."
            )
        }
    }

    fun testApiKey() {
        val key = _uiState.value.apiKeyInput.trim()
        if (key.isBlank()) {
            _uiState.update { it.copy(apiKeyTestResult = "Please enter your Gemini API key.", errorMessage = null) }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isTestingApiKey = true, apiKeyTestResult = null, errorMessage = null) }
            val result = repository.testApiKey(key)
            result.onSuccess { msg ->
                _uiState.update { it.copy(isTestingApiKey = false, apiKeyTestResult = msg) }
            }.onFailure { err ->
                _uiState.update { it.copy(isTestingApiKey = false, apiKeyTestResult = err.message ?: "Invalid or unauthorized Gemini API key.") }
            }
        }
    }

    // --- 1. Start General Quiz ---
    fun startQuiz(onSuccess: () -> Unit) {
        val state = _uiState.value
        val topic = state.topic.trim()
        if (topic.isBlank()) {
            _uiState.update { it.copy(errorMessage = "Please enter a topic name.") }
            return
        }

        if (!state.hasApiKey) {
            _uiState.update { it.copy(errorMessage = "Gemini API Key is required. Please set it in Settings.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isGenerating = true, errorMessage = null) }
            val result = repository.fetchQuizQuestions(topic, state.questionType, state.questionCount)

            result.onSuccess { questions ->
                val totalSeconds = state.questionCount.toLong() * 60
                _uiState.update {
                    it.copy(
                        isGenerating = false,
                        currentQuestions = questions,
                        currentQuestionIndex = 0,
                        userAnswers = emptyMap(),
                        remainingTimeSeconds = totalSeconds,
                        totalTimeSeconds = totalSeconds,
                        isQuizActive = true,
                        isMathQuiz = false,
                        lastResult = null
                    )
                }
                quizStartTimeMillis = System.currentTimeMillis()
                startTimerIfTimed()
                onSuccess()
            }.onFailure { err ->
                _uiState.update { it.copy(isGenerating = false, errorMessage = err.message) }
            }
        }
    }

    // --- 2. Start Math MCQ Quiz ---
    fun startMathQuiz(
        chapter: String,
        topicName: String,
        difficulty: MathDifficulty,
        count: Int,
        onSuccess: () -> Unit
    ) {
        val state = _uiState.value
        if (!state.hasApiKey) {
            _uiState.update { it.copy(errorMessage = "Gemini API Key is required.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isGenerating = true, errorMessage = null) }
            val result = repository.fetchMathQuestions(chapter, topicName, difficulty, count)

            result.onSuccess { questions ->
                val totalSeconds = count.toLong() * 60
                _uiState.update {
                    it.copy(
                        isGenerating = false,
                        topic = topicName,
                        mathChapter = chapter,
                        mathDifficulty = difficulty,
                        questionType = QuestionType.MCQ,
                        questionCount = count,
                        currentQuestions = questions,
                        currentQuestionIndex = 0,
                        userAnswers = emptyMap(),
                        remainingTimeSeconds = totalSeconds,
                        totalTimeSeconds = totalSeconds,
                        isQuizActive = true,
                        isMathQuiz = true,
                        lastResult = null
                    )
                }
                quizStartTimeMillis = System.currentTimeMillis()
                startTimerIfTimed()
                onSuccess()
            }.onFailure { err ->
                _uiState.update { it.copy(isGenerating = false, errorMessage = err.message) }
            }
        }
    }

    // --- 3. Math Solver ---
    fun solveMathProblem(
        chapter: String,
        topic: String,
        problem: String,
        fileBase64: String? = null,
        mimeType: String? = null
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSolvingMath = true, errorMessage = null, currentMathSolution = null) }
            val result = repository.solveMathProblem(chapter, topic, problem, fileBase64, mimeType)

            result.onSuccess { sol ->
                _uiState.update { it.copy(isSolvingMath = false, currentMathSolution = sol) }
            }.onFailure { err ->
                _uiState.update { it.copy(isSolvingMath = false, errorMessage = err.message) }
            }
        }
    }

    fun saveCurrentMathSolutionToHistory() {
        val sol = _uiState.value.currentMathSolution ?: return
        val item = MathHistoryItem(
            id = sol.id,
            type = "SOLUTION",
            chapter = sol.chapter,
            topic = sol.topic,
            source = sol.source,
            problem = sol.problem,
            solutionSteps = sol.solutionSteps,
            finalAnswer = sol.finalAnswer,
            formattedDate = sol.formattedDate,
            timestamp = sol.timestamp
        )
        repository.saveMathHistoryItem(item)
        loadMathHistory()
        _uiState.update { it.copy(infoMessage = "Saved to Math History!") }
    }

    fun saveCurrentMathSolutionToBookmark() {
        val sol = _uiState.value.currentMathSolution ?: return
        val bookmark = MathSolutionBookmark(
            id = sol.id,
            chapter = sol.chapter,
            topic = sol.topic,
            source = sol.source,
            problem = sol.problem,
            solutionSteps = sol.solutionSteps,
            finalAnswer = sol.finalAnswer,
            formattedDate = sol.formattedDate,
            timestamp = sol.timestamp
        )
        repository.saveMathSolutionBookmark(bookmark)
        loadBookmarks()
        _uiState.update { it.copy(infoMessage = "Saved to Math Bookmarks!") }
    }

    // --- 4. Retake From Local Storage (NO GEMINI CALL) ---
    fun attemptGeneralQuizBookmark(bookmark: GeneralQuizBookmark, onSuccess: () -> Unit) {
        val totalSeconds = bookmark.questionCount.toLong() * 60
        _uiState.update {
            it.copy(
                topic = bookmark.topic,
                questionType = bookmark.questionType,
                questionCount = bookmark.questionCount,
                quizMode = bookmark.mode,
                currentQuestions = bookmark.questions,
                currentQuestionIndex = 0,
                userAnswers = emptyMap(),
                remainingTimeSeconds = totalSeconds,
                totalTimeSeconds = totalSeconds,
                isQuizActive = true,
                isMathQuiz = false
            )
        }
        quizStartTimeMillis = System.currentTimeMillis()
        startTimerIfTimed()
        onSuccess()
    }

    fun attemptMathMcqBookmark(bookmark: MathMcqBookmark, onSuccess: () -> Unit) {
        val singleQ = QuizQuestion(
            id = 1,
            question = bookmark.question,
            options = bookmark.options,
            correctAnswer = bookmark.correctAnswer,
            explanation = bookmark.explanation,
            chapter = bookmark.chapter,
            difficulty = bookmark.difficulty
        )

        _uiState.update {
            it.copy(
                topic = bookmark.topic,
                mathChapter = bookmark.chapter,
                questionType = QuestionType.MCQ,
                questionCount = 1,
                quizMode = QuizMode.UNTIMED,
                currentQuestions = listOf(singleQ),
                currentQuestionIndex = 0,
                userAnswers = emptyMap(),
                remainingTimeSeconds = 0,
                totalTimeSeconds = 0,
                isQuizActive = true,
                isMathQuiz = true
            )
        }
        onSuccess()
    }

    fun attemptMathHistory(item: MathHistoryItem, onSuccess: () -> Unit) {
        val qs = item.questions ?: return
        val totalSeconds = qs.size.toLong() * 60
        _uiState.update {
            it.copy(
                topic = item.topic,
                mathChapter = item.chapter,
                questionType = QuestionType.MCQ,
                questionCount = qs.size,
                quizMode = QuizMode.TIMED,
                currentQuestions = qs,
                currentQuestionIndex = 0,
                userAnswers = emptyMap(),
                remainingTimeSeconds = totalSeconds,
                totalTimeSeconds = totalSeconds,
                isQuizActive = true,
                isMathQuiz = true
            )
        }
        quizStartTimeMillis = System.currentTimeMillis()
        startTimerIfTimed()
        onSuccess()
    }

    // --- 5. Answer Selection and Submission ---
    /**
     * Select an MCQ option. Kept as the screen-facing API name used by QuizScreen.
     */
    fun selectMcqOption(questionId: Int, option: String) {
        selectOption(questionId, option)
    }

    fun selectOption(questionId: Int, option: String) {
        val state = _uiState.value
        val question = state.currentQuestions.find { it.id == questionId } ?: return

        val isCorrect = option.trim().equals(question.correctAnswer.trim(), ignoreCase = true) ||
                question.correctAnswer.trim().startsWith(option.trim().take(2), ignoreCase = true)

        val newAnswers = state.userAnswers.toMutableMap()
        newAnswers[questionId] = UserAnswer(
            questionId = questionId,
            selectedOption = option,
            isCorrect = isCorrect
        )

        _uiState.update { it.copy(userAnswers = newAnswers) }
    }

    fun enterTextAnswer(questionId: Int, text: String) {
        val state = _uiState.value
        val question = state.currentQuestions.find { it.id == questionId } ?: return

        val cleanInput = text.trim().lowercase(Locale.ROOT)
        val cleanAnswer = question.correctAnswer.trim().lowercase(Locale.ROOT)
        val isCorrect = cleanInput.isNotEmpty() &&
                (cleanAnswer.contains(cleanInput) || cleanInput.contains(cleanAnswer))

        val newAnswers = state.userAnswers.toMutableMap()
        newAnswers[questionId] = UserAnswer(
            questionId = questionId,
            textAnswer = text,
            isCorrect = isCorrect
        )

        _uiState.update { it.copy(userAnswers = newAnswers) }
    }

    fun nextQuestion() {
        val state = _uiState.value
        if (state.currentQuestionIndex < state.currentQuestions.size - 1) {
            _uiState.update { it.copy(currentQuestionIndex = it.currentQuestionIndex + 1) }
        }
    }

    fun previousQuestion() {
        val state = _uiState.value
        if (state.currentQuestionIndex > 0) {
            _uiState.update { it.copy(currentQuestionIndex = it.currentQuestionIndex - 1) }
        }
    }

    fun submitQuiz(onComplete: () -> Unit) {
        timerJob?.cancel()
        val state = _uiState.value
        val total = state.currentQuestions.size
        var correctCount = 0
        var wrongCount = 0
        var unansweredCount = 0

        state.currentQuestions.forEach { q ->
            val ans = state.userAnswers[q.id]
            if (ans == null || (ans.selectedOption == null && ans.textAnswer.isNullOrBlank())) {
                unansweredCount++
            } else if (ans.isCorrect) {
                correctCount++
            } else {
                wrongCount++
            }
        }

        val score = correctCount
        val percentage = if (total > 0) (correctCount.toFloat() / total) * 100f else 0f
        val elapsed = (System.currentTimeMillis() - quizStartTimeMillis) / 1000

        val result = QuizResult(
            topic = state.topic,
            questionType = state.questionType,
            mode = state.quizMode,
            totalQuestions = total,
            correctCount = correctCount,
            wrongCount = wrongCount,
            unansweredCount = unansweredCount,
            score = score,
            percentage = percentage,
            timeTakenSeconds = elapsed,
            questions = state.currentQuestions,
            userAnswers = state.userAnswers,
            isMathQuiz = state.isMathQuiz,
            chapter = state.mathChapter,
            difficulty = state.mathDifficulty
        )

        val formattedDate = SimpleDateFormat("MMM dd, yyyy, HH:mm", Locale.US).format(Date())

        if (state.isMathQuiz) {
            val prevAttempts = state.mathHistoryList.count { it.topic.equals(state.topic, ignoreCase = true) }
            val attemptLabel = "Attempt ${prevAttempts + 1}"
            val mathHist = MathHistoryItem(
                id = UUID.randomUUID().toString(),
                type = "MCQ_ATTEMPT",
                chapter = state.mathChapter ?: "Mathematics",
                topic = "${state.topic} ($attemptLabel)",
                score = score,
                questionCount = total,
                percentage = percentage,
                formattedDate = formattedDate,
                questions = state.currentQuestions,
                userAnswers = state.userAnswers
            )
            repository.saveMathHistoryItem(mathHist)
            loadMathHistory()
        } else {
            val prevAttempts = state.historyList.count { it.topic.equals(state.topic, ignoreCase = true) }
            val attemptSuffix = if (prevAttempts > 0) " (Attempt ${prevAttempts + 1})" else ""
            val historyItem = QuizHistoryItem(
                id = UUID.randomUUID().toString(),
                topic = "${state.topic}$attemptSuffix",
                questionType = state.questionType.displayName,
                totalQuestions = total,
                score = score,
                percentage = percentage,
                mode = state.quizMode.displayName,
                timeTakenFormatted = formatSeconds(elapsed),
                formattedDate = formattedDate,
                questions = state.currentQuestions,
                userAnswers = state.userAnswers
            )
            repository.saveQuizAttempt(historyItem)
            loadHistory()
        }

        _uiState.update {
            it.copy(
                isQuizActive = false,
                lastResult = result
            )
        }
        onComplete()
    }

    private fun startTimerIfTimed() {
        timerJob?.cancel()
        if (_uiState.value.quizMode == QuizMode.TIMED) {
            timerJob = viewModelScope.launch {
                while (_uiState.value.isQuizActive && _uiState.value.remainingTimeSeconds > 0) {
                    delay(1000)
                    val remaining = _uiState.value.remainingTimeSeconds
                    if (remaining <= 1) {
                        _uiState.update { it.copy(remainingTimeSeconds = 0) }
                        submitQuiz {}
                        break
                    }
                    _uiState.update { it.copy(remainingTimeSeconds = remaining - 1) }
                }
            }
        }
    }

    fun retryQuiz() {
        val state = _uiState.value
        val totalSeconds = state.currentQuestions.size.toLong() * 60
        _uiState.update {
            it.copy(
                currentQuestionIndex = 0,
                userAnswers = emptyMap(),
                remainingTimeSeconds = totalSeconds,
                totalTimeSeconds = totalSeconds,
                isQuizActive = true
            )
        }
        quizStartTimeMillis = System.currentTimeMillis()
        startTimerIfTimed()
    }

    fun exitQuiz() {
        timerJob?.cancel()
        _uiState.update {
            it.copy(
                isQuizActive = false,
                currentQuestions = emptyList(),
                userAnswers = emptyMap(),
                currentQuestionIndex = 0
            )
        }
    }

    // Bookmark management
    fun bookmarkWholeQuiz() {
        val res = _uiState.value.lastResult ?: return
        val date = SimpleDateFormat("MMM dd, yyyy", Locale.US).format(Date())

        if (res.isMathQuiz) {
            res.questions.forEach { q ->
                val b = MathMcqBookmark(
                    id = UUID.randomUUID().toString(),
                    chapter = q.chapter ?: res.chapter ?: "Mathematics",
                    topic = res.topic,
                    difficulty = q.difficulty ?: res.difficulty?.displayName ?: "Medium",
                    question = q.question,
                    options = q.options,
                    correctAnswer = q.correctAnswer,
                    explanation = q.explanation,
                    formattedDate = date,
                    originalQuizTitle = res.topic
                )
                repository.saveMathMcqBookmark(b)
            }
            loadBookmarks()
            _uiState.update { it.copy(infoMessage = "Saved questions to Math Bookmarks!") }
        } else {
            val b = GeneralQuizBookmark(
                id = UUID.randomUUID().toString(),
                topic = res.topic,
                title = "${res.topic} (${res.totalQuestions} Questions)",
                questionType = res.questionType,
                questionCount = res.totalQuestions,
                mode = res.mode,
                formattedDate = date,
                questions = res.questions
            )
            repository.saveGeneralBookmark(b)
            loadBookmarks()
            _uiState.update { it.copy(infoMessage = "Saved to General Quiz Bookmarks!") }
        }
    }

    fun deleteGeneralBookmark(id: String) {
        repository.deleteGeneralBookmark(id)
        loadBookmarks()
    }

    fun clearGeneralBookmarks() {
        repository.clearGeneralBookmarks()
        loadBookmarks()
    }

    fun deleteMathMcqBookmark(id: String) {
        repository.deleteMathMcqBookmark(id)
        loadBookmarks()
    }

    fun deleteMathSolutionBookmark(id: String) {
        repository.deleteMathSolutionBookmark(id)
        loadBookmarks()
    }

    fun clearMathBookmarks() {
        repository.clearMathBookmarks()
        loadBookmarks()
    }

    fun deleteMathHistoryItem(id: String) {
        repository.deleteMathHistoryItem(id)
        loadMathHistory()
    }

    fun clearMathHistory() {
        repository.clearMathHistory()
        loadMathHistory()
    }

    fun selectHistoryItem(item: QuizHistoryItem) {
        _uiState.update { it.copy(selectedHistoryItem = item) }
    }

    fun deleteHistoryItem(id: String) {
        repository.deleteQuizAttempt(id)
        loadHistory()
    }

    fun clearErrorMessage() {
        _uiState.update { it.copy(errorMessage = null) }
    }

    fun clearInfoMessage() {
        _uiState.update { it.copy(infoMessage = null) }
    }

    fun formatSeconds(seconds: Long): String {
        val mins = seconds / 60
        val secs = seconds % 60
        return String.format(Locale.getDefault(), "%02d:%02d", mins, secs)
    }

    override fun onCleared() {
        super.onCleared()
        timerJob?.cancel()
    }
}

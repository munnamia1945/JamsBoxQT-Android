package com.smartquiz.practice.data

import com.smartquiz.practice.model.GeneralQuizBookmark
import com.smartquiz.practice.model.MathDifficulty
import com.smartquiz.practice.model.MathHistoryItem
import com.smartquiz.practice.model.MathMcqBookmark
import com.smartquiz.practice.model.MathSolution
import com.smartquiz.practice.model.MathSolutionBookmark
import com.smartquiz.practice.model.QuestionType
import com.smartquiz.practice.model.QuizHistoryItem
import com.smartquiz.practice.model.QuizQuestion

/**
 * Repository layer that abstracts Gemini question generation, math solver, and local data storage.
 */
class QuizRepository(
    private val preferencesManager: PreferencesManager,
    private val geminiApiService: GeminiApiService = GeminiApiService()
) {

    fun getApiKey(): String = preferencesManager.getApiKey()

    fun saveApiKey(apiKey: String) = preferencesManager.saveApiKey(apiKey)

    fun clearApiKey() = preferencesManager.clearApiKey()

    fun hasApiKey(): Boolean = preferencesManager.hasApiKey()

    suspend fun testApiKey(apiKey: String): Result<String> {
        return geminiApiService.testApiKey(apiKey)
    }

    /**
     * Fetches dynamically generated general quiz questions from Gemini.
     */
    suspend fun fetchQuizQuestions(
        topic: String,
        questionType: QuestionType,
        count: Int
    ): Result<List<QuizQuestion>> {
        val apiKey = preferencesManager.getApiKey()
        if (apiKey.isBlank()) {
            return Result.failure(IllegalStateException("No Gemini API key found. Please configure your key in Settings."))
        }

        val result = geminiApiService.generateQuestions(
            apiKey = apiKey,
            topic = topic,
            questionType = questionType,
            questionCount = count
        )

        return result.map { response ->
            val rawList = response.questions.orEmpty()
            val mappedQuestions = rawList.mapIndexed { index, raw ->
                QuizQuestion(
                    id = index + 1,
                    question = raw.question?.trim().orEmpty(),
                    options = raw.options?.map { it.trim() } ?: emptyList(),
                    correctAnswer = raw.correctAnswer?.trim().orEmpty(),
                    explanation = raw.explanation?.trim().orEmpty()
                )
            }.filter { question ->
                question.question.isNotBlank() &&
                    question.correctAnswer.isNotBlank() &&
                    (questionType != QuestionType.MCQ || question.options.size == 4)
            }

            if (mappedQuestions.size < count) {
                throw IllegalStateException("AI generated only ${mappedQuestions.size} of $count requested questions. Please retry.")
            }
            mappedQuestions.take(count)
        }
    }

    /**
     * Fetches Math MCQs for a selected Chapter/Topic and difficulty.
     */
    suspend fun fetchMathQuestions(
        chapter: String,
        topic: String,
        difficulty: MathDifficulty,
        count: Int
    ): Result<List<QuizQuestion>> {
        val apiKey = preferencesManager.getApiKey()
        if (apiKey.isBlank()) {
            return Result.failure(IllegalStateException("No Gemini API key found. Please configure your key in Settings."))
        }

        val result = geminiApiService.generateMathQuestions(
            apiKey = apiKey,
            chapter = chapter,
            topic = topic,
            difficulty = difficulty,
            count = count
        )

        return result.map { response ->
            val rawList = response.questions.orEmpty()
            val mappedQuestions = rawList.mapIndexed { index, raw ->
                QuizQuestion(
                    id = index + 1,
                    question = raw.question?.trim().orEmpty(),
                    options = raw.options?.map { it.trim() } ?: emptyList(),
                    correctAnswer = raw.correctAnswer?.trim().orEmpty(),
                    explanation = raw.explanation?.trim().orEmpty(),
                    chapter = chapter,
                    difficulty = difficulty.displayName
                )
            }.filter { question ->
                question.question.isNotBlank() &&
                    question.correctAnswer.isNotBlank() &&
                    question.options.size == 4
            }

            if (mappedQuestions.size < count) {
                throw IllegalStateException("AI generated only ${mappedQuestions.size} of $count requested math questions. Please retry.")
            }
            mappedQuestions.take(count)
        }
    }

    /**
     * Solves a mathematical problem via Gemini.
     */
    suspend fun solveMathProblem(
        chapter: String,
        topic: String,
        problemText: String,
        fileBase64: String? = null,
        mimeType: String? = null
    ): Result<MathSolution> {
        val apiKey = preferencesManager.getApiKey()
        if (apiKey.isBlank()) {
            return Result.failure(IllegalStateException("No Gemini API key found."))
        }

        val result = geminiApiService.solveMathProblem(
            apiKey = apiKey,
            chapter = chapter,
            topic = topic,
            problemText = problemText,
            fileBase64 = fileBase64,
            mimeType = mimeType
        )

        return result.map { res ->
            MathSolution(
                id = System.currentTimeMillis().toString(),
                chapter = chapter,
                topic = topic,
                problem = res.problem ?: problemText,
                solutionSteps = res.solutionSteps ?: emptyList(),
                finalAnswer = res.finalAnswer.orEmpty(),
                source = if (fileBase64 != null) (if (mimeType?.contains("pdf") == true) "PDF" else "Photo") else "Typed",
                formattedDate = java.text.SimpleDateFormat("MMM dd, yyyy, HH:mm", java.util.Locale.US).format(java.util.Date())
            )
        }
    }

    // --- History Operations ---
    fun getQuizHistory(): List<QuizHistoryItem> = preferencesManager.getQuizHistory()
    fun saveQuizAttempt(item: QuizHistoryItem) = preferencesManager.saveQuizAttempt(item)
    fun deleteQuizAttempt(id: String) = preferencesManager.deleteQuizAttempt(id)
    fun clearAllHistory() = preferencesManager.clearAllHistory()

    // --- General Bookmarks ---
    fun getGeneralBookmarks(): List<GeneralQuizBookmark> = preferencesManager.getGeneralBookmarks()
    fun saveGeneralBookmark(item: GeneralQuizBookmark) = preferencesManager.saveGeneralBookmark(item)
    fun deleteGeneralBookmark(id: String) = preferencesManager.deleteGeneralBookmark(id)
    fun clearGeneralBookmarks() = preferencesManager.clearGeneralBookmarks()

    // --- Math History ---
    fun getMathHistory(): List<MathHistoryItem> = preferencesManager.getMathHistory()
    fun saveMathHistoryItem(item: MathHistoryItem) = preferencesManager.saveMathHistoryItem(item)
    fun deleteMathHistoryItem(id: String) = preferencesManager.deleteMathHistoryItem(id)
    fun clearMathHistory() = preferencesManager.clearMathHistory()

    // --- Math Bookmarks ---
    fun getMathMcqBookmarks(): List<MathMcqBookmark> = preferencesManager.getMathMcqBookmarks()
    fun saveMathMcqBookmark(item: MathMcqBookmark) = preferencesManager.saveMathMcqBookmark(item)
    fun deleteMathMcqBookmark(id: String) = preferencesManager.deleteMathMcqBookmark(id)

    fun getMathSolutionBookmarks(): List<MathSolutionBookmark> = preferencesManager.getMathSolutionBookmarks()
    fun saveMathSolutionBookmark(item: MathSolutionBookmark) = preferencesManager.saveMathSolutionBookmark(item)
    fun deleteMathSolutionBookmark(id: String) = preferencesManager.deleteMathSolutionBookmark(id)
    fun clearMathBookmarks() = preferencesManager.clearMathBookmarks()
}

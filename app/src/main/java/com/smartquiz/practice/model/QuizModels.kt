package com.smartquiz.practice.model

import com.google.gson.annotations.SerializedName

/**
 * Question format supported by the application.
 */
enum class QuestionType(val displayName: String) {
    MCQ("MCQ (Multiple Choice)"),
    VERY_SHORT("Very Short Question")
}

/**
 * Quiz timer mode.
 */
enum class QuizMode(val displayName: String) {
    TIMED("Timed"),
    UNTIMED("Untimed")
}

/**
 * Math Difficulty Level.
 */
enum class MathDifficulty(val displayName: String) {
    EASY("Easy"),
    MEDIUM("Medium"),
    HARD("Hard"),
    MIXED("Mixed")
}

/**
 * Single question representation used throughout the UI and repository.
 */
data class QuizQuestion(
    val id: Int,
    val question: String,
    val options: List<String> = emptyList(), // Non-empty for MCQ
    val correctAnswer: String,
    val explanation: String,
    val chapter: String? = null,
    val difficulty: String? = null
)

/**
 * Answer provided by the user for a specific question.
 */
data class UserAnswer(
    val questionId: Int,
    val selectedOption: String? = null,
    val textAnswer: String? = null,
    val isCorrect: Boolean = false
)

/**
 * Summary result calculated upon quiz completion.
 */
data class QuizResult(
    val topic: String,
    val questionType: QuestionType,
    val mode: QuizMode,
    val totalQuestions: Int,
    val correctCount: Int,
    val wrongCount: Int,
    val unansweredCount: Int,
    val score: Int,
    val percentage: Float,
    val timeTakenSeconds: Long,
    val questions: List<QuizQuestion>,
    val userAnswers: Map<Int, UserAnswer>,
    val isMathQuiz: Boolean = false,
    val chapter: String? = null,
    val difficulty: MathDifficulty? = null
)

/**
 * Persistent general quiz history record stored locally on device.
 */
data class QuizHistoryItem(
    val id: String,
    val topic: String,
    val questionType: String,
    val totalQuestions: Int,
    val score: Int,
    val percentage: Float,
    val mode: String,
    val timeTakenFormatted: String,
    val formattedDate: String,
    val questions: List<QuizQuestion>,
    val userAnswers: Map<Int, UserAnswer>
)

/**
 * Math Solution details.
 */
data class MathSolution(
    val id: String,
    val chapter: String,
    val topic: String,
    val problem: String,
    val solutionSteps: List<String>,
    val finalAnswer: String,
    val source: String = "Typed", // "Typed", "Photo", "PDF"
    val formattedDate: String,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Math History record (solved problems and MCQ attempts).
 */
data class MathHistoryItem(
    val id: String,
    val type: String, // "SOLUTION" or "MCQ_ATTEMPT"
    val chapter: String,
    val topic: String,
    val source: String? = null,
    val problem: String? = null,
    val solutionSteps: List<String>? = null,
    val finalAnswer: String? = null,
    val score: Int? = null,
    val questionCount: Int? = null,
    val percentage: Float? = null,
    val formattedDate: String,
    val timestamp: Long = System.currentTimeMillis(),
    val questions: List<QuizQuestion>? = null,
    val userAnswers: Map<Int, UserAnswer>? = null
)

/**
 * Bookmarked General Quiz item.
 */
data class GeneralQuizBookmark(
    val id: String,
    val topic: String,
    val title: String,
    val questionType: QuestionType,
    val questionCount: Int,
    val mode: QuizMode,
    val formattedDate: String,
    val timestamp: Long = System.currentTimeMillis(),
    val questions: List<QuizQuestion>
)

/**
 * Bookmarked Math MCQ item.
 */
data class MathMcqBookmark(
    val id: String,
    val chapter: String,
    val topic: String,
    val difficulty: String,
    val question: String,
    val options: List<String>,
    val correctAnswer: String,
    val explanation: String,
    val formattedDate: String,
    val timestamp: Long = System.currentTimeMillis(),
    val originalQuizTitle: String? = null
)

/**
 * Bookmarked Math Solution item.
 */
data class MathSolutionBookmark(
    val id: String,
    val chapter: String,
    val topic: String,
    val source: String,
    val problem: String,
    val solutionSteps: List<String>,
    val finalAnswer: String,
    val formattedDate: String,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Raw item parsed from Gemini JSON output.
 */
data class GeminiRawQuestion(
    @SerializedName("question") val question: String? = null,
    @SerializedName("options") val options: List<String>? = null,
    @SerializedName("correctAnswer") val correctAnswer: String? = null,
    @SerializedName("explanation") val explanation: String? = null
)

/**
 * Root wrapper returned by Gemini model.
 */
data class GeminiQuizResponse(
    @SerializedName("questions") val questions: List<GeminiRawQuestion>? = null
)

/**
 * Raw Math Solution returned by Gemini model.
 */
data class GeminiMathSolutionResponse(
    @SerializedName("problem") val problem: String? = null,
    @SerializedName("solutionSteps") val solutionSteps: List<String>? = null,
    @SerializedName("finalAnswer") val finalAnswer: String? = null
)

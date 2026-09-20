package com.smartquiz.practice.data

import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.smartquiz.practice.model.GeminiMathSolutionResponse
import com.smartquiz.practice.model.GeminiQuizResponse
import com.smartquiz.practice.model.MathDifficulty
import com.smartquiz.practice.model.QuestionType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Service that communicates directly with the Google Gemini REST API.
 * Uses OkHttp and Gson to send structured prompts and parse JSON responses.
 */
class GeminiApiService {

    private val client = OkHttpClient.Builder()
        .connectTimeout(12, TimeUnit.SECONDS)
        .readTimeout(35, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .callTimeout(45, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    // Prefer currently documented generation models, then fall back if a project
    // does not have access to one of them.
    private val modelNames = listOf(
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.8-flash"
    )
    private val baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

    /**
     * Tests whether the provided Gemini API key is valid.
     */
    suspend fun testApiKey(apiKey: String): Result<String> = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            return@withContext Result.failure(IllegalArgumentException("Please enter your Gemini API key."))
        }

        var lastError: Exception? = null
        for (model in modelNames) {
            try {
                val payload = """{
                  "contents": [{"parts": [{"text": "Reply with the word OK"}]}],
                  "generationConfig": {"maxOutputTokens": 4}
                }""".trimIndent()
                val request = buildRequest(apiKey, model, payload)
                client.newCall(request).execute().use { response ->
                    val body = response.body?.string().orEmpty()
                    if (response.isSuccessful) return@withContext Result.success("Gemini API connection is working ($model).")
                    val msg = extractApiErrorMessage(body, response.code)
                    lastError = Exception(msg)
                    // Try another model only for model-not-found responses.
                    if (response.code != 404) return@withContext Result.failure(lastError!!)
                }
            } catch (e: IOException) {
                return@withContext Result.failure(Exception("Network error. Please check your internet connection."))
            } catch (e: Exception) {
                lastError = e
            }
        }
        Result.failure(lastError ?: Exception("No compatible Gemini model is available for this API key/project."))
    }

    /**
     * Generates general quiz questions based on topic, type, and question count.
     */
    suspend fun generateQuestions(
        apiKey: String,
        topic: String,
        questionType: QuestionType,
        questionCount: Int
    ): Result<GeminiQuizResponse> = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            return@withContext Result.failure(IllegalStateException("Gemini API key is missing. Please add your key in Settings."))
        }
        if (topic.isBlank()) {
            return@withContext Result.failure(IllegalArgumentException("Please enter a quiz topic."))
        }

        val prompt = buildPrompt(topic, questionType, questionCount)
        return@withContext executeGeminiJsonRequest(apiKey, prompt)
    }

    /**
     * Generates Math MCQs for a selected Chapter/Topic, Question Count, and Difficulty.
     */
    suspend fun generateMathQuestions(
        apiKey: String,
        chapter: String,
        topic: String,
        difficulty: MathDifficulty,
        count: Int
    ): Result<GeminiQuizResponse> = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            return@withContext Result.failure(IllegalStateException("Gemini API key is missing."))
        }

        val prompt = """
        You are an expert mathematics professor and exam creator.
        Generate exactly $count high-quality Multiple Choice Questions (MCQs) for:
        Chapter: "$chapter"
        Specific Topic: "$topic"
        Difficulty Level: "${difficulty.displayName}"

        REQUIREMENTS:
        1. Produce exactly $count unique, mathematically rigorous questions.
        2. Format standard mathematical formulas using clean Unicode (e.g. x², √, π, θ, ±).
        3. For each question, provide:
           - "question": clear problem statement
           - "options": exactly 4 choices labeled "A. ...", "B. ...", "C. ...", "D. ..."
           - "correctAnswer": exact matching string of the correct choice
           - "explanation": step-by-step mathematical reasoning
        4. Return ONLY a valid JSON object matching this schema:
        {
          "questions": [
            {
              "question": "What are the roots of x² - 5x + 6 = 0?",
              "options": ["A. 2 and 3", "B. -2 and -3", "C. 1 and 6", "D. 0 and 5"],
              "correctAnswer": "A. 2 and 3",
              "explanation": "Factoring gives (x - 2)(x - 3) = 0, hence x = 2 or x = 3."
            }
          ]
        }
        """.trimIndent()

        return@withContext executeGeminiJsonRequest(apiKey, prompt)
    }

    /**
     * Solves a typed, photo, or PDF mathematical problem.
     */
    suspend fun solveMathProblem(
        apiKey: String,
        chapter: String,
        topic: String,
        problemText: String,
        fileBase64: String? = null,
        mimeType: String? = null
    ): Result<GeminiMathSolutionResponse> = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            return@withContext Result.failure(IllegalStateException("Gemini API key is missing."))
        }

        val prompt = """
        You are an elite mathematics professor and step-by-step problem solver.
        Solve the mathematical problem provided below thoroughly and accurately.
        Chapter: "$chapter"
        Topic: "$topic"
        Problem Statement: "${if (problemText.isNotBlank()) problemText else "Analyze the attached document/image for the mathematical problem."}"

        Return your output in this EXACT JSON structure:
        {
          "problem": "Clear statement of the mathematical problem",
          "solutionSteps": [
            "Step 1: State given values and formulas",
            "Step 2: Substitute and compute intermediate steps",
            "Step 3: Simplify and arrive at the result"
          ],
          "finalAnswer": "Explicit final numerical or algebraic answer"
        }
        """.trimIndent()

        val requestJson = JsonObject().apply {
            val contentsArray = com.google.gson.JsonArray().apply {
                val contentObj = JsonObject().apply {
                    val partsArray = com.google.gson.JsonArray().apply {
                        val textPart = JsonObject().apply {
                            addProperty("text", prompt)
                        }
                        add(textPart)

                        if (!fileBase64.isNullOrBlank() && !mimeType.isNullOrBlank()) {
                            val inlineDataPart = JsonObject().apply {
                                val inlineData = JsonObject().apply {
                                    addProperty("mimeType", mimeType)
                                    addProperty("data", fileBase64)
                                }
                                add("inlineData", inlineData)
                            }
                            add(inlineDataPart)
                        }
                    }
                    add("parts", partsArray)
                }
                add(contentObj)
            }
            add("contents", contentsArray)

            val generationConfig = JsonObject().apply {
                addProperty("temperature", 0.2)
                addProperty("maxOutputTokens", 8192)
                addProperty("responseMimeType", "application/json")
            }
            add("generationConfig", generationConfig)
        }

        val request = buildRequest(apiKey, modelNames.first(), requestJson.toString())

        try {
            client.newCall(request).execute().use { response ->
                val body = response.body?.string().orEmpty()
                if (!response.isSuccessful) {
                    val errorMsg = extractApiErrorMessage(body, response.code)
                    return@withContext Result.failure(Exception(errorMsg))
                }

                val rawAiText = extractAiResponseText(body)
                val cleanJson = cleanJsonString(rawAiText)

                val solution = gson.fromJson(cleanJson, GeminiMathSolutionResponse::class.java)
                if (solution == null || solution.finalAnswer.isNullOrBlank()) {
                    return@withContext Result.failure(Exception("Could not solve mathematical problem."))
                }
                Result.success(solution)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun executeGeminiJsonRequest(apiKey: String, prompt: String): Result<GeminiQuizResponse> {
        val requestJson = JsonObject().apply {
            val contentsArray = com.google.gson.JsonArray().apply {
                val contentObj = JsonObject().apply {
                    val partsArray = com.google.gson.JsonArray().apply {
                        add(JsonObject().apply { addProperty("text", prompt) })
                    }
                    add("parts", partsArray)
                }
                add(contentObj)
            }
            add("contents", contentsArray)
            add("generationConfig", JsonObject().apply {
                addProperty("temperature", 0.2)
                addProperty("maxOutputTokens", 8192)
                addProperty("responseMimeType", "application/json")
            })
        }

        return try {
            var lastError: Exception? = null
            for (model in modelNames) {
                val request = buildRequest(apiKey, model, requestJson.toString())
                client.newCall(request).execute().use { response ->
                    val body = response.body?.string().orEmpty()
                    if (!response.isSuccessful) {
                        lastError = Exception(extractApiErrorMessage(body, response.code))
                        if (response.code == 404) return@use
                        return Result.failure(lastError!!)
                    }

                    val rawAiText = extractAiResponseText(body)
                    if (rawAiText.isBlank()) {
                        return Result.failure(Exception("Gemini returned an empty response. Please try again."))
                    }

                    val cleanJson = cleanJsonString(rawAiText)
                    return try {
                        val quizResponse = gson.fromJson(cleanJson, GeminiQuizResponse::class.java)
                        val questions = quizResponse?.questions.orEmpty()
                        if (questions.isEmpty()) {
                            Result.failure(Exception("Gemini returned no quiz questions. Please try again."))
                        } else if (questions.size < promptQuestionCount(prompt)) {
                            Result.failure(Exception("Gemini returned only ${questions.size} questions. Please tap Start Quiz again."))
                        } else {
                            Result.success(quizResponse)
                        }
                    } catch (parseError: Exception) {
                        val preview = rawAiText.take(180).replace("\n", " ")
                        Result.failure(Exception("Gemini returned invalid JSON. Response started with: $preview"))
                    }
                }
            }
            Result.failure(lastError ?: Exception("No compatible Gemini model is available for this API key/project."))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun promptQuestionCount(prompt: String): Int {
        val match = Regex("exactly (\\d+) questions", RegexOption.IGNORE_CASE).find(prompt)
        return match?.groupValues?.getOrNull(1)?.toIntOrNull() ?: 1
    }

    private fun buildPrompt(topic: String, questionType: QuestionType, count: Int): String {
        return if (questionType == QuestionType.MCQ) {
            """
            You are an expert academic examiner. Create exactly $count distinct, high-quality multiple choice questions (MCQs) for an academic exam on the topic: "$topic".

            STRICT REQUIREMENTS:
            1. Generate EXACTLY $count questions.
            2. For each question provide:
               - "question": clear question text
               - "options": an array of exactly 4 options labeled "A. ...", "B. ...", "C. ...", "D. ..."
               - "correctAnswer": the exact full text of the correct option matching one of the 4 items (e.g. "B. ...")
               - "explanation": a concise 1-2 sentence academic explanation of why this answer is correct.
            3. Ensure the position of the correct answer (A, B, C, or D) is evenly distributed and randomized.
            4. Return ONLY a valid JSON object:
            {
              "questions": [
                {
                  "question": "What is an Activity in Android?",
                  "options": [
                    "A. A database handler",
                    "B. A single focused screen that the user can interact with",
                    "C. A background server daemon",
                    "D. A compiler optimization tool"
                  ],
                  "correctAnswer": "B. A single focused screen that the user can interact with",
                  "explanation": "An Activity is a crucial Android component providing a window in which the app draws its UI."
                }
              ]
            }
            """.trimIndent()
        } else {
            """
            You are an expert academic examiner. Create exactly $count distinct, high-quality very short answer questions for an academic exam on the topic: "$topic".

            STRICT REQUIREMENTS:
            1. Generate EXACTLY $count questions.
            2. For each question provide:
               - "question": clear, concise question text requiring a short direct answer (1 to 5 words or a brief phrase)
               - "correctAnswer": the precise correct short answer or term
               - "explanation": a concise 1-2 sentence academic explanation.
            3. Return ONLY a valid JSON object:
            {
              "questions": [
                {
                  "question": "What does APK stand for in Android?",
                  "correctAnswer": "Android Package Kit",
                  "explanation": "APK is the package file format used by Android for app distribution."
                }
              ]
            }
            """.trimIndent()
        }
    }

    private fun buildRequest(apiKey: String, model: String, payload: String): Request {
        val url = baseUrl.replace("{MODEL}", model)
        return Request.Builder()
            .url(url)
            .addHeader("x-goog-api-key", apiKey.trim())
            .addHeader("Content-Type", "application/json")
            .post(payload.toRequestBody(jsonMediaType))
            .build()
    }

    private fun extractAiResponseText(responseBody: String): String {
        return try {
            val root = gson.fromJson(responseBody, JsonObject::class.java)
            val candidates = root.getAsJsonArray("candidates")
            if (candidates != null && candidates.size() > 0) {
                val firstCandidate = candidates.get(0).asJsonObject
                val content = firstCandidate.getAsJsonObject("content")
                val parts = content.getAsJsonArray("parts")
                if (parts != null && parts.size() > 0) {
                    return buildString {
                        for (i in 0 until parts.size()) {
                            val part = parts.get(i).asJsonObject
                            val text = part.get("text")?.asString
                            if (!text.isNullOrBlank()) append(text)
                        }
                    }
                }
            }
            ""
        } catch (e: Exception) {
            ""
        }
    }

    private fun cleanJsonString(raw: String): String {
        var trimmed = raw.trim()
        if (trimmed.startsWith("```json", ignoreCase = true)) {
            trimmed = trimmed.substring(7).trim()
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3).trim()
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length - 3).trim()
        }

        // Gemini can occasionally add one short sentence around an otherwise valid JSON object.
        // Recover the object instead of failing the entire quiz.
        val start = trimmed.indexOf('{')
        val end = trimmed.lastIndexOf('}')
        if (start >= 0 && end > start) {
            trimmed = trimmed.substring(start, end + 1)
        }
        return trimmed
    }

    private fun extractApiErrorMessage(errorBody: String, httpCode: Int): String {
        return try {
            val json = gson.fromJson(errorBody, JsonObject::class.java)
            val error = json.getAsJsonObject("error")
            val message = error?.get("message")?.asString
            when {
                message?.contains("API_KEY_INVALID", ignoreCase = true) == true || message?.contains("API key not valid", ignoreCase = true) == true ->
                    "Invalid Gemini API key. Create/copy a fresh key from Google AI Studio and make sure it belongs to a project with Gemini API access."
                httpCode == 400 ->
                    "Gemini rejected the request (400): ${message ?: "bad request"}. This is not necessarily an invalid API key."
                httpCode == 401 ->
                    "Gemini authentication failed (401). Make sure you are using the full API key and it is sent as a Gemini API key."
                httpCode == 403 ->
                    "Gemini access denied (403). Check that the key is enabled for the Gemini API and that your project has access."
                httpCode == 404 ->
                    "Gemini model or project not found (404). The selected Gemini model may be unavailable for this API key/project."
                httpCode == 429 ->
                    "Gemini quota/rate limit reached (429). Please wait and try again, or check your AI Studio usage limits."
                httpCode >= 500 ->
                    "Gemini server error ($httpCode). Please try again in a moment."
                !message.isNullOrBlank() ->
                    "Gemini API Error ($httpCode): $message"
                else ->
                    "Gemini API request failed (HTTP $httpCode). Please try again."
            }
        } catch (e: Exception) {
            "API request failed with code $httpCode."
        }
    }
}

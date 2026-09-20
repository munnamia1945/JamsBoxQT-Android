export interface AndroidFile {
  path: string;
  name: string;
  language: string;
  category: 'gradle' | 'manifest' | 'kotlin' | 'res' | 'doc';
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "JamsBoxQT"
include(":app")`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Root)',
    language: 'kotlin',
    category: 'gradle',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.3.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.23" apply false
}`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.smartquiz.practice"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.smartquiz.practice"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables { useSupportLibrary = true }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions { jvmTarget = "1.8" }
    buildFeatures { compose = true }
    composeOptions { kotlinCompilerExtensionVersion = "1.5.11" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.activity:activity-compose:1.9.0")

    implementation(platform("androidx.compose:compose-bom:2024.04.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    implementation("androidx.navigation:navigation-compose:2.7.7")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")

    // OkHttp & Gson for Gemini AI API
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.google.code.gson:gson:2.10.1")

    // Encrypted SharedPreferences for local API key
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SmartQuizPractice">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.SmartQuizPractice">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'res/values/strings.xml',
    language: 'xml',
    category: 'res',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">JamsBox QT</string>
</resources>`
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    name: 'res/values/colors.xml',
    language: 'xml',
    category: 'res',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#F5F5F5</color>
    <color name="jamsbox_orange">#F97316</color>
    <color name="jamsbox_navy">#0B1A40</color>
    <color name="jamsbox_bg">#F5F5F5</color>
    <color name="primary">#0B1A40</color>
    <color name="primary_variant">#172554</color>
    <color name="secondary">#0284C7</color>
    <color name="background">#F8FAFC</color>
    <color name="surface">#FFFFFF</color>
</resources>`
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
    name: 'res/drawable/ic_launcher_foreground.xml',
    language: 'xml',
    category: 'res',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">

    <!-- Ground Contact Shadow -->
    <path
        android:fillColor="#1E293B"
        android:fillAlpha="0.25"
        android:pathData="M32,91 C32,87 76,87 76,91 C76,95 32,95 32,91 Z" />

    <!-- 1. LEFT ISOMETRIC FACE -->
    <!-- Top-Left Piece (Navy) -->
    <path
        android:fillColor="#243C6E"
        android:pathData="M30,52 L42,45 C43,46 44,46 45,45 L46,42 L46,53 C45,54 45,55 46,56 L46,60 L35,66 C34,65 33,65 32,66 L30,68 Z" />

    <!-- Top-Right Center Piece (Orange) -->
    <path
        android:fillColor="#F97316"
        android:pathData="M46,42 L54,38 L54,54 C53,55 53,56 54,57 L54,64 L46,68 L46,60 C45,61 44,61 43,60 C42,59 43,58 44,57 L46,53 Z" />

    <!-- Bottom-Left Piece (Orange) -->
    <path
        android:fillColor="#EA580C"
        android:pathData="M30,68 L32,66 C33,65 34,65 35,66 L46,60 L46,68 C45,69 45,70 46,71 L46,75 L36,81 C35,80 34,80 33,81 L30,85 Z" />

    <!-- Bottom-Right Piece (Navy Deep) -->
    <path
        android:fillColor="#172554"
        android:pathData="M46,68 L54,64 L54,80 L44,86 C45,87 46,87 47,86 L47,78 C48,79 49,79 50,78 L46,75 Z" />

    <!-- Jams Text Indicator on Left Face -->
    <path
        android:fillColor="#0B1B38"
        android:pathData="M33,61 L35,60 L35,65 C35,67 33,67 32,66 L33,65 C34,65 34,64 34,63 Z" />
    <path
        android:fillColor="#0B1B38"
        android:pathData="M36,60 L38,59 L39,63 L37,64 Z" />
    <path
        android:fillColor="#0B1B38"
        android:pathData="M40,58 L42,57 L43,61 L41,62 Z" />
    <path
        android:fillColor="#0B1B38"
        android:pathData="M43,56 L45,55 L45,59 L43,60 Z" />

    <!-- 2. RIGHT ISOMETRIC FACE -->
    <!-- Top-Right Piece (Navy) -->
    <path
        android:fillColor="#254178"
        android:pathData="M54,38 L62,42 C63,41 64,41 65,42 L67,45 L78,39 L78,55 L67,61 C66,60 65,60 64,61 L61,63 L54,60 Z" />

    <!-- Bottom-Right Face Pieces (Navy Deep) -->
    <path
        android:fillColor="#16274A"
        android:pathData="M54,60 L61,63 L61,72 C62,73 63,73 64,72 L67,70 L67,74 L54,82 Z" />
    <path
        android:fillColor="#1B2E56"
        android:pathData="M67,61 L78,55 L78,71 L67,77 Z" />

    <!-- Box and TQ Text on Right Face -->
    <path
        android:fillColor="#0B1B38"
        android:pathData="M56,60 L58,61 L58,66 L56,65 Z" />
    <path
        android:fillColor="#0B1B38"
        android:pathData="M69,54 L74,51 L74,53 L72,54 L72,60 L70,61 L70,55 L69,56 Z" />
    <path
        android:fillColor="#0B1B38"
        android:pathData="M73,56 C74,55 76,54 77,55 C78,56 78,59 77,60 C76,61 74,62 73,61 C72,60 72,57 73,56 Z" />

    <!-- 3. TOP ISOMETRIC FACE -->
    <!-- Rear Top Quadrants (Navy) -->
    <path
        android:fillColor="#2D4D88"
        android:pathData="M54,25 L43,31 L48,34 C49,33 50,33 51,34 L54,37 L57,34 C58,33 59,33 60,34 L65,31 Z" />
    <path
        android:fillColor="#34599C"
        android:pathData="M43,31 L32,37 L43,43 L48,40 C47,39 47,38 48,37 L54,34 L48,34 Z" />
    <path
        android:fillColor="#2D4D88"
        android:pathData="M65,31 L60,34 L54,34 L60,37 C61,38 61,39 60,40 L65,43 L76,37 Z" />

    <!-- Center Glowing Socket -->
    <path
        android:fillColor="#FFA200"
        android:fillAlpha="0.75"
        android:pathData="M48,40 L54,37 L60,40 L54,44 Z" />

    <!-- 4. FLOATING PUZZLE PIECE WITH RADIANT GLOW -->
    <!-- Warm Aura -->
    <path
        android:fillColor="#FF9500"
        android:fillAlpha="0.4"
        android:pathData="M54,16 C63,16 70,22 70,30 C70,38 63,44 54,44 C45,44 38,38 38,30 C38,22 45,16 54,16 Z" />

    <!-- 3D Extrusion Depth of Floating Piece -->
    <path
        android:fillColor="#C2410C"
        android:pathData="M46,31 L46,34 L54,39 L54,36 Z" />
    <path
        android:fillColor="#9A3412"
        android:pathData="M54,36 L54,39 L62,34 L62,31 Z" />

    <!-- Floating Jigsaw Top Surface -->
    <path
        android:fillColor="#FF8500"
        android:strokeColor="#FED7AA"
        android:strokeWidth="0.8"
        android:pathData="M54,23 C55,22 56,23 56,24 C57,24 58,23 59,22 L60,23 C61,23 62,24 62,25 C63,26 62,27 61,28 L62,31 C63,30 64,30 64,32 C64,33 63,34 62,33 L60,34 C59,35 58,35 57,34 L54,36 L51,34 C50,35 49,35 48,34 L46,33 C45,34 44,33 44,32 C44,30 45,30 46,31 L47,28 C46,27 45,26 46,25 C46,24 47,23 48,23 L49,22 C50,23 51,24 52,24 C52,23 53,22 54,23 Z" />

    <!-- Specular Highlight Curve -->
    <path
        android:strokeColor="#FFFFFF"
        android:strokeWidth="0.8"
        android:strokeLineCap="round"
        android:strokeAlpha="0.75"
        android:pathData="M50,25 L54,23 L58,25" />
</vector>`
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    name: 'res/mipmap/ic_launcher.xml',
    language: 'xml',
    category: 'res',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`
  },
  {
    path: 'app/src/main/java/com/smartquiz/practice/model/QuizModels.kt',
    name: 'model/QuizModels.kt',
    language: 'kotlin',
    category: 'kotlin',
    content: `package com.smartquiz.practice.model

import com.google.gson.annotations.SerializedName

enum class QuestionType(val displayName: String) {
    MCQ("MCQ (Multiple Choice)"),
    VERY_SHORT("Very Short Question")
}

enum class QuizMode(val displayName: String) {
    TIMED("Timed"),
    UNTIMED("Untimed")
}

data class QuizQuestion(
    val id: Int,
    val question: String,
    val options: List<String> = emptyList(),
    val correctAnswer: String,
    val explanation: String
)

data class UserAnswer(
    val questionId: Int,
    val selectedOption: String? = null,
    val textAnswer: String? = null,
    val isCorrect: Boolean = false
)

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
    val userAnswers: Map<Int, UserAnswer>
)

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

data class GeminiRawQuestion(
    @SerializedName("question") val question: String? = null,
    @SerializedName("options") val options: List<String>? = null,
    @SerializedName("correctAnswer") val correctAnswer: String? = null,
    @SerializedName("explanation") val explanation: String? = null
)

data class GeminiQuizResponse(
    @SerializedName("questions") val questions: List<GeminiRawQuestion>? = null
)`
  },
  {
    path: 'app/src/main/java/com/smartquiz/practice/data/PreferencesManager.kt',
    name: 'data/PreferencesManager.kt',
    language: 'kotlin',
    category: 'kotlin',
    content: `package com.smartquiz.practice.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.smartquiz.practice.model.QuizHistoryItem

class PreferencesManager(private val context: Context) {
    private val gson = Gson()

    private val securePrefs: SharedPreferences by lazy {
        try {
            val masterKey = MasterKey.Builder(context)
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build()
            EncryptedSharedPreferences.create(
                context,
                "smart_quiz_secure_prefs",
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            )
        } catch (e: Exception) {
            context.getSharedPreferences("smart_quiz_fallback_prefs", Context.MODE_PRIVATE)
        }
    }

    private val historyPrefs: SharedPreferences by lazy {
        context.getSharedPreferences("smart_quiz_history_prefs", Context.MODE_PRIVATE)
    }

    companion object {
        private const val KEY_GEMINI_API_KEY = "key_gemini_api_key"
        private const val KEY_QUIZ_HISTORY_JSON = "key_quiz_history_list"
    }

    fun getApiKey(): String = securePrefs.getString(KEY_GEMINI_API_KEY, "")?.trim() ?: ""

    fun saveApiKey(apiKey: String) = securePrefs.edit().putString(KEY_GEMINI_API_KEY, apiKey.trim()).apply()

    fun clearApiKey() = securePrefs.edit().remove(KEY_GEMINI_API_KEY).apply()

    fun hasApiKey(): Boolean = getApiKey().isNotEmpty()

    fun getQuizHistory(): List<QuizHistoryItem> {
        val json = historyPrefs.getString(KEY_QUIZ_HISTORY_JSON, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<QuizHistoryItem>>() {}.type
            gson.fromJson<List<QuizHistoryItem>>(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun saveQuizAttempt(item: QuizHistoryItem) {
        val currentList = getQuizHistory().toMutableList()
        currentList.add(0, item)
        historyPrefs.edit().putString(KEY_QUIZ_HISTORY_JSON, gson.toJson(currentList)).apply()
    }

    fun deleteQuizAttempt(id: String) {
        val currentList = getQuizHistory().toMutableList()
        currentList.removeAll { it.id == id }
        historyPrefs.edit().putString(KEY_QUIZ_HISTORY_JSON, gson.toJson(currentList)).apply()
    }

    fun resetQuizHistory() {
        historyPrefs.edit().remove(KEY_QUIZ_HISTORY_JSON).apply()
    }
}`
  },
  {
    path: 'app/src/main/java/com/smartquiz/practice/data/GeminiApiService.kt',
    name: 'data/GeminiApiService.kt',
    language: 'kotlin',
    category: 'kotlin',
    content: `package com.smartquiz.practice.data

import com.google.gson.Gson
import com.google.gson.JsonObject
import com.smartquiz.practice.model.GeminiQuizResponse
import com.smartquiz.practice.model.QuestionType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

class GeminiApiService {
    private val client = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()
    private val baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent"

    suspend fun testApiKey(apiKey: String): Result<String> = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) return@withContext Result.failure(Exception("Please enter your Gemini API key."))
        val testPayload = """{"contents":[{"parts":[{"text":"Hello"}]}]}"""
        val request = Request.Builder().url("$baseUrl?key=$apiKey").post(testPayload.toRequestBody(jsonMediaType)).build()
        try {
            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) Result.success("Gemini API key is valid.")
                else Result.failure(Exception("Invalid or unauthorized Gemini API key."))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Network error. Please check your internet connection."))
        }
    }

    suspend fun generateQuestions(
        apiKey: String,
        topic: String,
        questionType: QuestionType,
        questionCount: Int
    ): Result<GeminiQuizResponse> = withContext(Dispatchers.IO) {
        val prompt = if (questionType == QuestionType.MCQ) {
            "Generate $questionCount MCQs for academic exam on topic: '$topic' in JSON format with 'questions': [{'question', 'options' (4 items: A, B, C, D), 'correctAnswer', 'explanation'}]"
        } else {
            "Generate $questionCount very short answer questions for academic exam on topic: '$topic' in JSON format with 'questions': [{'question', 'correctAnswer', 'explanation'}]"
        }

        val requestJson = JsonObject().apply {
            val contents = com.google.gson.JsonArray().apply {
                val item = JsonObject().apply {
                    val parts = com.google.gson.JsonArray().apply {
                        add(JsonObject().apply { addProperty("text", prompt) })
                    }
                    add("parts", parts)
                }
                add(item)
            }
            add("contents", contents)
            add("generationConfig", JsonObject().apply {
                addProperty("temperature", 0.4)
                addProperty("responseMimeType", "application/json")
            })
        }

        val request = Request.Builder().url("$baseUrl?key=$apiKey").post(requestJson.toString().toRequestBody(jsonMediaType)).build()
        try {
            client.newCall(request).execute().use { response ->
                val body = response.body?.string().orEmpty()
                val text = extractAiText(body)
                val clean = cleanJson(text)
                val parsed = gson.fromJson(clean, GeminiQuizResponse::class.java)
                Result.success(parsed)
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun extractAiText(body: String): String {
        return try {
            val root = gson.fromJson(body, JsonObject::class.java)
            root.getAsJsonArray("candidates")[0].asJsonObject
                .getAsJsonObject("content").getAsJsonArray("parts")[0].asJsonObject.get("text").asString
        } catch (e: Exception) { "" }
    }

    private fun cleanJson(raw: String): String {
        var t = raw.trim()
        if (t.startsWith("\`\`\`json")) t = t.removePrefix("\`\`\`json").trim()
        if (t.startsWith("\`\`\`")) t = t.removePrefix("\`\`\`").trim()
        if (t.endsWith("\`\`\`")) t = t.removeSuffix("\`\`\`").trim()
        return t
    }
}`
  },
  {
    path: 'app/src/main/java/com/smartquiz/practice/data/QuizRepository.kt',
    name: 'data/QuizRepository.kt',
    language: 'kotlin',
    category: 'kotlin',
    content: `package com.smartquiz.practice.data

import com.smartquiz.practice.model.QuestionType
import com.smartquiz.practice.model.QuizHistoryItem
import com.smartquiz.practice.model.QuizQuestion

class QuizRepository(
    private val preferencesManager: PreferencesManager,
    private val geminiApiService: GeminiApiService = GeminiApiService()
) {
    fun getApiKey(): String = preferencesManager.getApiKey()
    fun saveApiKey(apiKey: String) = preferencesManager.saveApiKey(apiKey)
    fun clearApiKey() = preferencesManager.clearApiKey()
    fun hasApiKey(): Boolean = preferencesManager.hasApiKey()

    suspend fun testApiKey(apiKey: String) = geminiApiService.testApiKey(apiKey)

    suspend fun fetchQuizQuestions(topic: String, questionType: QuestionType, count: Int): Result<List<QuizQuestion>> {
        val apiKey = preferencesManager.getApiKey()
        if (apiKey.isBlank()) return Result.failure(Exception("No Gemini API key in Settings"))

        return geminiApiService.generateQuestions(apiKey, topic, questionType, count).map { resp ->
            resp.questions.orEmpty().mapIndexed { idx, raw ->
                QuizQuestion(
                    id = idx + 1,
                    question = raw.question.orEmpty(),
                    options = raw.options ?: emptyList(),
                    correctAnswer = raw.correctAnswer.orEmpty(),
                    explanation = raw.explanation.orEmpty()
                )
            }
        }
    }

    fun getQuizHistory(): List<QuizHistoryItem> = preferencesManager.getQuizHistory()
    fun saveQuizAttempt(item: QuizHistoryItem) = preferencesManager.saveQuizAttempt(item)
    fun deleteQuizAttempt(id: String) = preferencesManager.deleteQuizAttempt(id)
    fun resetQuizHistory() = preferencesManager.resetQuizHistory()
}`
  },
  {
    path: 'app/src/main/java/com/smartquiz/practice/viewmodel/QuizViewModel.kt',
    name: 'viewmodel/QuizViewModel.kt',
    language: 'kotlin',
    category: 'kotlin',
    content: `package com.smartquiz.practice.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.smartquiz.practice.data.PreferencesManager
import com.smartquiz.practice.data.QuizRepository
import com.smartquiz.practice.model.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class QuizViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = QuizRepository(PreferencesManager(application))
    private val _uiState = MutableStateFlow(QuizUiState())
    val uiState = _uiState.asStateFlow()

    private var timerJob: Job? = null
    private var quizStartTimeMillis = 0L

    init {
        loadSettings()
        loadHistory()
    }

    fun loadSettings() {
        val key = repository.getApiKey()
        _uiState.update { it.copy(apiKeyInput = key, hasApiKey = key.isNotBlank()) }
    }

    fun onTopicChange(topic: String) = _uiState.update { it.copy(topic = topic) }
    fun onQuestionTypeChange(type: QuestionType) = _uiState.update { it.copy(questionType = type) }
    fun onQuestionCountChange(count: Int) = _uiState.update { it.copy(questionCount = count) }
    fun onQuizModeChange(mode: QuizMode) = _uiState.update { it.copy(quizMode = mode) }
    fun onApiKeyInputChange(key: String) = _uiState.update { it.copy(apiKeyInput = key) }

    fun saveApiKey() {
        val k = _uiState.value.apiKeyInput.trim()
        repository.saveApiKey(k)
        _uiState.update { it.copy(hasApiKey = k.isNotBlank()) }
    }

    fun clearApiKey() {
        repository.clearApiKey()
        _uiState.update { it.copy(apiKeyInput = "", hasApiKey = false) }
    }

    fun testApiKey() {
        viewModelScope.launch {
            _uiState.update { it.copy(isTestingApiKey = true) }
            val res = repository.testApiKey(_uiState.value.apiKeyInput.trim())
            _uiState.update {
                it.copy(
                    isTestingApiKey = false,
                    apiKeyTestResult = res.fold({ s -> "✓ $s" }, { e -> "✗ \${e.message}" })
                )
            }
        }
    }

    fun startQuiz(onSuccess: () -> Unit) {
        val trimmedTopic = _uiState.value.topic.trim()
        if (trimmedTopic.isBlank()) {
            _uiState.update { it.copy(errorMessage = "Please enter a topic name.") }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isGenerating = true, errorMessage = null, topic = trimmedTopic) }
            val res = repository.fetchQuizQuestions(trimmedTopic, _uiState.value.questionType, _uiState.value.questionCount)
            res.fold(
                onSuccess = { list ->
                    val sec = _uiState.value.questionCount.toLong() * 60
                    _uiState.update {
                        it.copy(
                            isGenerating = false,
                            currentQuestions = list,
                            currentQuestionIndex = 0,
                            userAnswers = emptyMap(),
                            remainingTimeSeconds = sec,
                            totalTimeSeconds = sec,
                            isQuizActive = true
                        )
                    }
                    quizStartTimeMillis = System.currentTimeMillis()
                    startTimer()
                    onSuccess()
                },
                onFailure = { err ->
                    _uiState.update { it.copy(isGenerating = false, errorMessage = err.message) }
                }
            )
        }
    }

    private fun startTimer() {
        timerJob?.cancel()
        if (_uiState.value.quizMode == QuizMode.TIMED) {
            timerJob = viewModelScope.launch {
                while (_uiState.value.remainingTimeSeconds > 0 && _uiState.value.isQuizActive) {
                    delay(1000)
                    _uiState.update { it.copy(remainingTimeSeconds = it.remainingTimeSeconds - 1) }
                    if (_uiState.value.remainingTimeSeconds <= 0) {
                        submitQuiz()
                        break
                    }
                }
            }
        }
    }

    fun nextQuestion() = _uiState.update { it.copy(currentQuestionIndex = (it.currentQuestionIndex + 1).coerceAtMost(it.currentQuestions.size - 1)) }
    fun previousQuestion() = _uiState.update { it.copy(currentQuestionIndex = (it.currentQuestionIndex - 1).coerceAtLeast(0)) }

    fun selectMcqOption(qId: Int, opt: String) {
        val q = _uiState.value.currentQuestions.find { it.id == qId } ?: return
        val isCorrect = opt.trim().equals(q.correctAnswer.trim(), ignoreCase = true)
        val ans = UserAnswer(qId, selectedOption = opt, isCorrect = isCorrect)
        _uiState.update { it.copy(userAnswers = it.userAnswers + (qId to ans)) }
    }

    fun enterTextAnswer(qId: Int, text: String) {
        val q = _uiState.value.currentQuestions.find { it.id == qId } ?: return
        val isCorrect = text.isNotBlank() && q.correctAnswer.contains(text.trim(), ignoreCase = true)
        val ans = UserAnswer(qId, textAnswer = text, isCorrect = isCorrect)
        _uiState.update { it.copy(userAnswers = it.userAnswers + (qId to ans)) }
    }

    fun submitQuiz() {
        timerJob?.cancel()
        val s = _uiState.value
        val correct = s.userAnswers.values.count { it.isCorrect }
        val answered = s.userAnswers.size
        val total = s.currentQuestions.size
        val wrong = answered - correct
        val unanswered = total - answered
        val pct = if (total > 0) (correct.toFloat() / total) * 100f else 0f
        val elapsed = (s.totalTimeSeconds - s.remainingTimeSeconds).coerceAtLeast(1)

        val result = QuizResult(s.topic, s.questionType, s.quizMode, total, correct, wrong, unanswered, correct, pct, elapsed, s.currentQuestions, s.userAnswers)
        val history = QuizHistoryItem(UUID.randomUUID().toString(), s.topic, s.questionType.displayName, total, correct, pct, s.quizMode.displayName, formatSeconds(elapsed), SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(Date()), s.currentQuestions, s.userAnswers)
        repository.saveQuizAttempt(history)

        _uiState.update { it.copy(isQuizActive = false, lastResult = result, historyList = repository.getQuizHistory()) }
    }

    fun retryQuiz() {
        val sec = _uiState.value.currentQuestions.size.toLong() * 60
        _uiState.update { it.copy(currentQuestionIndex = 0, userAnswers = emptyMap(), remainingTimeSeconds = sec, isQuizActive = true) }
        startTimer()
    }

    fun exitQuiz() {
        timerJob?.cancel()
        _uiState.update { it.copy(isQuizActive = false) }
    }

    fun loadHistory() = _uiState.update { it.copy(historyList = repository.getQuizHistory()) }
    fun selectHistoryItem(item: QuizHistoryItem) = _uiState.update { it.copy(selectedHistoryItem = item) }
    fun deleteHistoryItem(id: String) { repository.deleteQuizAttempt(id); loadHistory() }
    fun resetHistory() { repository.resetQuizHistory(); loadHistory() }
    fun formatSeconds(s: Long): String = String.format("%02d:%02d", s / 60, s % 60)
}`
  },
  {
    path: 'app/src/main/java/com/smartquiz/practice/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    category: 'kotlin',
    content: `package com.smartquiz.practice

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.smartquiz.practice.ui.navigation.Screen
import com.smartquiz.practice.ui.screens.*
import com.smartquiz.practice.ui.theme.SmartQuizTheme
import com.smartquiz.practice.viewmodel.QuizViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: QuizViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SmartQuizTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    val navController = rememberNavController()
                    val uiState by viewModel.uiState.collectAsState()

                    NavHost(navController = navController, startDestination = Screen.Home.route) {
                        composable(Screen.Home.route) {
                            HomeScreen(viewModel, uiState,
                                onStartQuiz = { navController.navigate(Screen.Quiz.route) },
                                onNavigateToHistory = { navController.navigate(Screen.History.route) },
                                onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
                            )
                        }
                        composable(Screen.Quiz.route) {
                            QuizScreen(viewModel, uiState,
                                onSubmitSuccess = { navController.navigate(Screen.Result.route) { popUpTo(Screen.Home.route) } },
                                onExitConfirmed = { navController.popBackStack(Screen.Home.route, false) }
                            )
                        }
                        composable(Screen.Result.route) {
                            ResultScreen(viewModel, uiState,
                                onRetryQuiz = { navController.navigate(Screen.Quiz.route) { popUpTo(Screen.Home.route) } },
                                onNewQuiz = { viewModel.exitQuiz(); navController.popBackStack(Screen.Home.route, false) },
                                onNavigateToHistory = { navController.navigate(Screen.History.route) }
                            )
                        }
                        composable(Screen.History.route) {
                            HistoryScreen(viewModel, uiState,
                                onNavigateBack = { navController.popBackStack() },
                                onSelectHistoryItem = { item -> navController.navigate(Screen.HistoryDetail.createRoute(item.id)) }
                            )
                        }
                        composable(Screen.HistoryDetail.route, listOf(navArgument("attemptId") { type = NavType.StringType })) {
                            HistoryDetailScreen(uiState, onNavigateBack = { navController.popBackStack() })
                        }
                        composable(Screen.Settings.route) {
                            SettingsScreen(viewModel, uiState, onNavigateBack = { navController.popBackStack() })
                        }
                    }
                }
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/smartquiz/practice/ui/components/JamsBoxBranding.kt',
    name: 'ui/components/JamsBoxBranding.kt',
    language: 'kotlin',
    category: 'kotlin',
    content: `package com.smartquiz.practice.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartquiz.practice.R
import com.smartquiz.practice.ui.theme.JamsBoxBg
import com.smartquiz.practice.ui.theme.JamsBoxNavy
import com.smartquiz.practice.ui.theme.JamsBoxOrange

/**
 * JamsBox QT Official Header Branding Component
 *
 * Layout:
 * [ ORIGINAL LOGO ]  JamsBox QT
 *                    EDUCATIONAL QUIZ PLATFORM
 *
 * - Keeps original logo/icon on the LEFT.
 * - Places the new JamsBox QT typography on the RIGHT.
 * - First line: "JamsBox" (Navy #0B1A40) + " " + "QT" (Orange #F97316), ExtraBold (weight 800).
 * - Second line: "EDUCATIONAL QUIZ PLATFORM" (Navy #0B1A40), all uppercase, Medium weight (500),
 *   letter spacing ~3px (2.5-3sp), positioned directly below "JamsBox QT".
 */
@Composable
fun JamsBoxHeaderBranding(
    modifier: Modifier = Modifier,
    iconSize: Dp = 38.dp,
    titleSize: TextUnit = 18.sp,
    taglineSize: TextUnit = 7.5.sp,
    letterSpacing: TextUnit = 2.5.sp
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // [ ORIGINAL LOGO ] on the LEFT
        Image(
            painter = painterResource(id = R.drawable.ic_launcher_foreground),
            contentDescription = "JamsBox QT Official Logo",
            modifier = Modifier.size(iconSize)
        )

        Spacer(modifier = Modifier.width(10.dp))

        // Typography on the RIGHT
        Column(
            verticalArrangement = Arrangement.Center
        ) {
            // Line 1: JamsBox QT
            Text(
                text = buildAnnotatedString {
                    withStyle(
                        style = SpanStyle(
                            color = JamsBoxNavy,
                            fontWeight = FontWeight.ExtraBold
                        )
                    ) {
                        append("JamsBox")
                    }
                    append(" ")
                    withStyle(
                        style = SpanStyle(
                            color = JamsBoxOrange,
                            fontWeight = FontWeight.ExtraBold
                        )
                    ) {
                        append("QT")
                    }
                },
                fontSize = titleSize,
                fontFamily = FontFamily.SansSerif,
                lineHeight = titleSize * 1.15f
            )

            Spacer(modifier = Modifier.height(2.dp))

            // Line 2: Tagline
            Text(
                text = "EDUCATIONAL QUIZ PLATFORM",
                color = JamsBoxNavy,
                fontSize = taglineSize,
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Medium,
                letterSpacing = letterSpacing,
                lineHeight = taglineSize * 1.2f
            )
        }
    }
}

/**
 * Centered / Card variant with original logo on the left and typography on the right.
 */
@Composable
fun JamsBoxLogo(
    modifier: Modifier = Modifier,
    iconSize: Dp = 46.dp,
    titleSize: TextUnit = 22.sp,
    taglineSize: TextUnit = 9.sp,
    letterSpacing: TextUnit = 3.sp,
    backgroundColor: Color = JamsBoxBg,
    contentPadding: PaddingValues = PaddingValues(horizontal = 16.dp, vertical = 12.dp)
) {
    Row(
        modifier = modifier
            .background(backgroundColor)
            .padding(contentPadding),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        // [ ORIGINAL LOGO ] on the LEFT
        Image(
            painter = painterResource(id = R.drawable.ic_launcher_foreground),
            contentDescription = "JamsBox QT Official Logo",
            modifier = Modifier.size(iconSize)
        )

        Spacer(modifier = Modifier.width(12.dp))

        // Typography on the RIGHT
        Column(
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = buildAnnotatedString {
                    withStyle(
                        style = SpanStyle(
                            color = JamsBoxNavy,
                            fontWeight = FontWeight.ExtraBold
                        )
                    ) {
                        append("JamsBox")
                    }
                    append(" ")
                    withStyle(
                        style = SpanStyle(
                            color = JamsBoxOrange,
                            fontWeight = FontWeight.ExtraBold
                        )
                    ) {
                        append("QT")
                    }
                },
                fontSize = titleSize,
                fontFamily = FontFamily.SansSerif,
                lineHeight = titleSize * 1.15f
            )

            Spacer(modifier = Modifier.height(3.dp))

            Text(
                text = "EDUCATIONAL QUIZ PLATFORM",
                color = JamsBoxNavy,
                fontSize = taglineSize,
                fontFamily = FontFamily.SansSerif,
                fontWeight = FontWeight.Medium,
                letterSpacing = letterSpacing,
                lineHeight = taglineSize * 1.2f
            )
        }
    }
}`
  }
];

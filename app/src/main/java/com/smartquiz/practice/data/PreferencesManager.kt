package com.smartquiz.practice.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.smartquiz.practice.model.GeneralQuizBookmark
import com.smartquiz.practice.model.MathHistoryItem
import com.smartquiz.practice.model.MathMcqBookmark
import com.smartquiz.practice.model.MathSolutionBookmark
import com.smartquiz.practice.model.QuizHistoryItem

/**
 * Manages local persistent storage:
 * 1. Secure API Key storage using Android Jetpack Security (EncryptedSharedPreferences)
 * 2. General Quiz History persistence
 * 3. General Quiz Bookmarks persistence
 * 4. Math History persistence
 * 5. Math Bookmarks (MCQs & Solutions) persistence
 */
class PreferencesManager(private val context: Context) {

    private val gson = Gson()

    // Encrypted preferences for sensitive API Key
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
            Log.w("PreferencesManager", "Fallback to regular preferences for API key: ${e.message}")
            context.getSharedPreferences("smart_quiz_fallback_prefs", Context.MODE_PRIVATE)
        }
    }

    // Standard preferences for general app data & quiz history
    private val appPrefs: SharedPreferences by lazy {
        context.getSharedPreferences("smart_quiz_app_prefs", Context.MODE_PRIVATE)
    }

    companion object {
        private const val KEY_GEMINI_API_KEY = "key_gemini_api_key"
        private const val KEY_QUIZ_HISTORY_JSON = "key_quiz_history_list"
        private const val KEY_GENERAL_BOOKMARKS_JSON = "key_general_bookmarks_list"
        private const val KEY_MATH_HISTORY_JSON = "key_math_history_list"
        private const val KEY_MATH_MCQ_BOOKMARKS_JSON = "key_math_mcq_bookmarks_list"
        private const val KEY_MATH_SOLUTION_BOOKMARKS_JSON = "key_math_solution_bookmarks_list"
    }

    // --- API KEY ---
    fun getApiKey(): String {
        return securePrefs.getString(KEY_GEMINI_API_KEY, "")?.trim() ?: ""
    }

    fun saveApiKey(apiKey: String) {
        securePrefs.edit().putString(KEY_GEMINI_API_KEY, apiKey.trim()).apply()
    }

    fun clearApiKey() {
        securePrefs.edit().remove(KEY_GEMINI_API_KEY).apply()
    }

    fun hasApiKey(): Boolean {
        return getApiKey().isNotEmpty()
    }

    // --- 1. GENERAL QUIZ HISTORY ---
    fun getQuizHistory(): List<QuizHistoryItem> {
        val json = appPrefs.getString(KEY_QUIZ_HISTORY_JSON, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<QuizHistoryItem>>() {}.type
            gson.fromJson<List<QuizHistoryItem>>(json, type) ?: emptyList()
        } catch (e: Exception) {
            Log.e("PreferencesManager", "Error parsing quiz history", e)
            emptyList()
        }
    }

    fun saveQuizAttempt(item: QuizHistoryItem) {
        val currentList = getQuizHistory().toMutableList()
        currentList.add(0, item)
        val json = gson.toJson(currentList)
        appPrefs.edit().putString(KEY_QUIZ_HISTORY_JSON, json).apply()
    }

    fun deleteQuizAttempt(id: String) {
        val currentList = getQuizHistory().toMutableList()
        currentList.removeAll { it.id == id }
        val json = gson.toJson(currentList)
        appPrefs.edit().putString(KEY_QUIZ_HISTORY_JSON, json).apply()
    }

    fun clearAllHistory() {
        appPrefs.edit().remove(KEY_QUIZ_HISTORY_JSON).apply()
    }

    // --- 2. GENERAL QUIZ BOOKMARKS ---
    fun getGeneralBookmarks(): List<GeneralQuizBookmark> {
        val json = appPrefs.getString(KEY_GENERAL_BOOKMARKS_JSON, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<GeneralQuizBookmark>>() {}.type
            gson.fromJson<List<GeneralQuizBookmark>>(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun saveGeneralBookmark(bookmark: GeneralQuizBookmark) {
        val current = getGeneralBookmarks().toMutableList()
        current.removeAll { it.id == bookmark.id }
        current.add(0, bookmark)
        appPrefs.edit().putString(KEY_GENERAL_BOOKMARKS_JSON, gson.toJson(current)).apply()
    }

    fun deleteGeneralBookmark(id: String) {
        val current = getGeneralBookmarks().toMutableList()
        current.removeAll { it.id == id }
        appPrefs.edit().putString(KEY_GENERAL_BOOKMARKS_JSON, gson.toJson(current)).apply()
    }

    fun clearGeneralBookmarks() {
        appPrefs.edit().remove(KEY_GENERAL_BOOKMARKS_JSON).apply()
    }

    // --- 3. MATH HISTORY ---
    fun getMathHistory(): List<MathHistoryItem> {
        val json = appPrefs.getString(KEY_MATH_HISTORY_JSON, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<MathHistoryItem>>() {}.type
            gson.fromJson<List<MathHistoryItem>>(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun saveMathHistoryItem(item: MathHistoryItem) {
        val current = getMathHistory().toMutableList()
        current.removeAll { it.id == item.id }
        current.add(0, item)
        appPrefs.edit().putString(KEY_MATH_HISTORY_JSON, gson.toJson(current)).apply()
    }

    fun deleteMathHistoryItem(id: String) {
        val current = getMathHistory().toMutableList()
        current.removeAll { it.id == id }
        appPrefs.edit().putString(KEY_MATH_HISTORY_JSON, gson.toJson(current)).apply()
    }

    fun clearMathHistory() {
        appPrefs.edit().remove(KEY_MATH_HISTORY_JSON).apply()
    }

    // --- 4. MATH MCQ BOOKMARKS ---
    fun getMathMcqBookmarks(): List<MathMcqBookmark> {
        val json = appPrefs.getString(KEY_MATH_MCQ_BOOKMARKS_JSON, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<MathMcqBookmark>>() {}.type
            gson.fromJson<List<MathMcqBookmark>>(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun saveMathMcqBookmark(bookmark: MathMcqBookmark) {
        val current = getMathMcqBookmarks().toMutableList()
        current.removeAll { it.id == bookmark.id || it.question.trim() == bookmark.question.trim() }
        current.add(0, bookmark)
        appPrefs.edit().putString(KEY_MATH_MCQ_BOOKMARKS_JSON, gson.toJson(current)).apply()
    }

    fun deleteMathMcqBookmark(id: String) {
        val current = getMathMcqBookmarks().toMutableList()
        current.removeAll { it.id == id }
        appPrefs.edit().putString(KEY_MATH_MCQ_BOOKMARKS_JSON, gson.toJson(current)).apply()
    }

    // --- 5. MATH SOLUTION BOOKMARKS ---
    fun getMathSolutionBookmarks(): List<MathSolutionBookmark> {
        val json = appPrefs.getString(KEY_MATH_SOLUTION_BOOKMARKS_JSON, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<MathSolutionBookmark>>() {}.type
            gson.fromJson<List<MathSolutionBookmark>>(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun saveMathSolutionBookmark(bookmark: MathSolutionBookmark) {
        val current = getMathSolutionBookmarks().toMutableList()
        current.removeAll { it.id == bookmark.id }
        current.add(0, bookmark)
        appPrefs.edit().putString(KEY_MATH_SOLUTION_BOOKMARKS_JSON, gson.toJson(current)).apply()
    }

    fun deleteMathSolutionBookmark(id: String) {
        val current = getMathSolutionBookmarks().toMutableList()
        current.removeAll { it.id == id }
        appPrefs.edit().putString(KEY_MATH_SOLUTION_BOOKMARKS_JSON, gson.toJson(current)).apply()
    }

    fun clearMathBookmarks() {
        appPrefs.edit()
            .remove(KEY_MATH_MCQ_BOOKMARKS_JSON)
            .remove(KEY_MATH_SOLUTION_BOOKMARKS_JSON)
            .apply()
    }
}

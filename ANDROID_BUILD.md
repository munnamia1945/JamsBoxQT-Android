# JamsBox QT — Android Studio Project

This repository contains the Android implementation of JamsBox QT using Kotlin + Jetpack Compose + Material 3.

## Open in Android Studio

1. Open this folder in Android Studio.
2. Allow Gradle to sync using Gradle 8.4 and Android Gradle Plugin 8.3.2.
3. Select the `app` run configuration.
4. Run on an Android 7.0+ device/emulator.
5. Open **Settings** and enter your own Gemini API key.

## Application ID

`com.jamsbox.qt`

## AI

The Gemini key is entered by the user at runtime and stored locally. No API key is included in this project.

## Main functionality

- General AI quiz generation (MCQ / Very Short)
- Timed and untimed quiz attempts
- Results and separate history records
- General quiz bookmarks and retake without regeneration
- Math Lab / Math MCQ generation
- Math Solver with typed, image and PDF input
- Math solution history and bookmarks
- Local persistence
- PDF export for saved mathematical solutions
- Material 3 Compose UI

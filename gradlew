#!/bin/sh
set -e
if command -v gradle >/dev/null 2>&1; then exec gradle "$@"; fi
echo "Gradle is not installed on PATH. Open this project in Android Studio and let Android Studio configure/sync Gradle 8.4." >&2
exit 1

#!/usr/bin/env bash
# Adds permissions, services, boot receiver and TTS <queries> to the generated AndroidManifest.xml.
# Usage: tools/patch-manifest.sh <path to AndroidManifest.xml>
set -euo pipefail
M="${1:?path to AndroidManifest.xml}"
sed -i 's#<application#<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/><uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION"/><uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/><uses-permission android:name="android.permission.VIBRATE"/><uses-permission android:name="android.permission.WAKE_LOCK"/><uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/><uses-permission android:name="android.permission.FOREGROUND_SERVICE"/><uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/><uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/><application#' "$M"
sed -i 's#</application>#<service android:name=".RunService" android:exported="false" android:foregroundServiceType="location"/></application>#' "$M"
sed -i 's#<application#<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION"/><uses-permission android:name="android.permission.FOREGROUND_SERVICE_HEALTH"/><uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/><uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"/><application#' "$M"
sed -i 's#</application>#<service android:name=".StepsPlugin$Svc" android:exported="false" android:foregroundServiceType="health"/><receiver android:name=".StepsPlugin$Boot" android:exported="true"><intent-filter><action android:name="android.intent.action.BOOT_COMPLETED"/><action android:name="android.intent.action.MY_PACKAGE_REPLACED"/></intent-filter></receiver></application>#' "$M"
grep -q 'StepsPlugin.Svc' "$M"
sed -i 's#<application#<queries><intent><action android:name="android.intent.action.TTS_SERVICE"/></intent></queries><application#' "$M"

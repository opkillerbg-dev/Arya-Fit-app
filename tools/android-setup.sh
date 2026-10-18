#!/usr/bin/env bash
# Run by CI after `npx cap add android && npx cap sync android`. Turns the generated Android project into Arya Fit.
# Everything it copies lives in native/ (Java, resources) and web/icons/. Edit those, not this script.
set -euo pipefail
A=android/app/src/main
R=$A/res

# 1. blank native splash (Android 12+ would show the launcher icon on a dark window)
mkdir -p "$R/values" "$R/drawable"
cp native/res/values/arya_splash.xml "$R/values/"
cp native/res/drawable/arya_splash_icon.xml "$R/drawable/"
python3 tools/patch_splash.py "$R/values/styles.xml"

# 2. Java: the three plugins/services plus our MainActivity (overwrites the template one)
cp native/java/*.java "$A/java/com/arya/fit/"

# 3. adaptive launcher icon from the maskable PNG
mkdir -p "$R/drawable-nodpi" "$R/mipmap-anydpi-v26"
cp web/icons/icon-512-maskable.png "$R/drawable-nodpi/ic_bg.png"
cp native/res/mipmap-anydpi-v26/ic_launcher.xml "$R/mipmap-anydpi-v26/ic_launcher.xml"
cp native/res/mipmap-anydpi-v26/ic_launcher_round.xml "$R/mipmap-anydpi-v26/ic_launcher_round.xml"

# 4. manifest: permissions, services, boot receiver, TTS queries
bash tools/patch-manifest.sh "$A/AndroidManifest.xml"
echo "android-setup: done"

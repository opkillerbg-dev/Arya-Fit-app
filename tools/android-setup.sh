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
cp native/res/drawable/ic_stat_arya.xml "$R/drawable/"
python3 tools/patch_splash.py "$R/values/styles.xml"

# 2. Java: the three plugins/services plus our MainActivity (overwrites the template one)
cp native/java/*.java "$A/java/com/arya/fit/"

# 3. launcher icons: 6 selectable adaptive icons (native/res, made by tools/icons/make_icons.py).
#    The default @mipmap/ic_launcher is a copy of the first one (Old Money).
cp -r native/res/drawable-nodpi "$R/"
mkdir -p "$R/mipmap-anydpi-v26"
cp native/res/mipmap-anydpi-v26/*.xml "$R/mipmap-anydpi-v26/"
cp "$R/mipmap-anydpi-v26/ic_launcher_oldmoney.xml" "$R/mipmap-anydpi-v26/ic_launcher.xml"
cp "$R/mipmap-anydpi-v26/ic_launcher_oldmoney.xml" "$R/mipmap-anydpi-v26/ic_launcher_round.xml"
for d in mdpi hdpi xhdpi xxhdpi xxxhdpi; do
  mkdir -p "$R/mipmap-$d"
  cp native/res/mipmap-$d/ic_launcher_*.png "$R/mipmap-$d/"
  cp native/res/mipmap-$d/ic_launcher_oldmoney.png "$R/mipmap-$d/ic_launcher.png"
  cp native/res/mipmap-$d/ic_launcher_oldmoney.png "$R/mipmap-$d/ic_launcher_round.png"
done
# Capacitor's template adaptive pieces would clash with ours
rm -f "$R"/mipmap-*/ic_launcher.webp "$R"/mipmap-*/ic_launcher_round.webp
rm -f "$R"/drawable*/ic_launcher_foreground.xml "$R"/drawable*/ic_launcher_background.xml "$R"/mipmap-*/ic_launcher_foreground.png

# 4. manifest: permissions, services, boot receiver, TTS queries
bash tools/patch-manifest.sh "$A/AndroidManifest.xml"
python3 tools/patch_icons.py "$A/AndroidManifest.xml"
# 5. home-screen widgets: one image layout, three provider infos, strings, manifest receivers (previews live in drawable-nodpi)
mkdir -p "$R/layout" "$R/xml"
cp native/res/layout/widget_image.xml "$R/layout/"
cp native/res/xml/widget_*_info.xml "$R/xml/"
cp native/res/values/arya_widgets.xml "$R/values/"
python3 tools/patch_widgets.py "$A/AndroidManifest.xml"
echo "android-setup: done"

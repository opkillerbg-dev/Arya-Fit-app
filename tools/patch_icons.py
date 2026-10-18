#!/usr/bin/env python3
"""Makes the launcher icon switchable: removes the MAIN/LAUNCHER filter from MainActivity and adds one
<activity-alias> per icon (only the first is enabled). Names must match native/java/AppIconPlugin.java.
Usage: patch_icons.py <AndroidManifest.xml>"""
import re, sys
ICONS = [("oldmoney", "IconOldMoney"), ("midnight", "IconMidnight"), ("sunset", "IconSunset"),
         ("classic", "IconClassic"), ("professional", "IconProfessional"), ("glass", "IconGlass")]
p = sys.argv[1]
s = open(p).read()
flt = re.compile(r'<intent-filter>\s*<action android:name="android\.intent\.action\.MAIN"\s*/>\s*<category android:name="android\.intent\.category\.LAUNCHER"\s*/>\s*</intent-filter>')
if len(flt.findall(s)) != 1:
    print("::error::expected exactly one MAIN/LAUNCHER intent-filter in the manifest"); sys.exit(1)
s = flt.sub("", s)
aliases = ""
for i, (icon, cls) in enumerate(ICONS):
    aliases += ('<activity-alias android:name=".%s" android:enabled="%s" android:exported="true" '
                'android:icon="@mipmap/ic_launcher_%s" android:label="@string/app_name" android:targetActivity=".MainActivity">'
                '<intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter>'
                '</activity-alias>') % (cls, "true" if i == 0 else "false", icon)
if s.count("</application>") != 1:
    print("::error::expected one </application>"); sys.exit(1)
s = s.replace("</application>", aliases + "</application>")
open(p, "w").write(s)
print("patch_icons: %d aliases" % len(ICONS))

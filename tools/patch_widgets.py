#!/usr/bin/env python3
"""Adds the three home-screen widget receivers to the manifest. Names must match native/java/*WidgetProvider.java
and native/res/xml/widget_*_info.xml. Usage: patch_widgets.py <AndroidManifest.xml>"""
import sys
W = [("StepsWidgetProvider", "Arya Fit \u00b7 Steps", "widget_steps_info"),
     ("TodayWidgetProvider", "Arya Fit \u00b7 Today", "widget_today_info"),
     ("ComboWidgetProvider", "Arya Fit \u00b7 Overview", "widget_combo_info")]
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
if s.count("</application>") != 1:
    print("::error::expected one </application>"); sys.exit(1)
x = ""
for cls, label, res in W:
    x += ('<receiver android:name=".%s" android:exported="true" android:label="%s">'
          '<intent-filter><action android:name="android.appwidget.action.APPWIDGET_UPDATE"/></intent-filter>'
          '<meta-data android:name="android.appwidget.provider" android:resource="@xml/%s"/></receiver>') % (cls, label, res)
open(p, "w", encoding="utf-8").write(s.replace("</application>", x + "</application>"))
print("patch_widgets: %d receivers" % len(W))

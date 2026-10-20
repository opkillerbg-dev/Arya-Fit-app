package com.arya.fit;

import android.content.Context;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Lets the web app hand the widgets their plan text, goal, streak and skin colours. */
@CapacitorPlugin(name = "AppWidget")
public class AppWidgetPlugin extends Plugin {
  @PluginMethod
  public void update(PluginCall call) {
    String js = call.getString("json", "");
    getContext().getSharedPreferences(WidgetKit.PREF, Context.MODE_PRIVATE).edit().putString("json", js).apply();
    WidgetKit.updateAll(getContext());
    call.resolve();
  }
}

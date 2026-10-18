package com.arya.fit;

import android.content.ComponentName;
import android.content.pm.PackageManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Switches the launcher icon by enabling one <activity-alias> and disabling the others (see tools/patch_icons.py). */
@CapacitorPlugin(name = "AppIcon")
public class AppIconPlugin extends Plugin {
  private static final String[] IDS = {"oldmoney", "midnight", "sunset", "classic", "professional", "glass"};
  private static final String[] CLS = {"IconOldMoney", "IconMidnight", "IconSunset", "IconClassic", "IconProfessional", "IconGlass"};

  private ComponentName cn(int i) {
    return new ComponentName(getContext().getPackageName(), "com.arya.fit." + CLS[i]);
  }

  @PluginMethod
  public void get(PluginCall call) {
    PackageManager pm = getContext().getPackageManager();
    String cur = IDS[0];
    for (int i = 0; i < IDS.length; i++) {
      int st = pm.getComponentEnabledSetting(cn(i));
      boolean on = st == PackageManager.COMPONENT_ENABLED_STATE_ENABLED
          || (st == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT && i == 0);
      if (on) { cur = IDS[i]; break; }
    }
    JSObject r = new JSObject();
    r.put("name", cur);
    call.resolve(r);
  }

  @PluginMethod
  public void set(PluginCall call) {
    String name = call.getString("name", IDS[0]);
    int idx = -1;
    for (int i = 0; i < IDS.length; i++) { if (IDS[i].equals(name)) { idx = i; break; } }
    if (idx < 0) { call.reject("unknown icon"); return; }
    try {
      PackageManager pm = getContext().getPackageManager();
      // enable the new one first so there is never a moment without a launcher entry
      pm.setComponentEnabledSetting(cn(idx), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
      for (int i = 0; i < IDS.length; i++) {
        if (i != idx) pm.setComponentEnabledSetting(cn(i), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
      }
      JSObject r = new JSObject();
      r.put("name", IDS[idx]);
      call.resolve(r);
    } catch (Throwable t) {
      call.reject("could not change icon");
    }
  }
}

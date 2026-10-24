package com.arya.fit;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.speech.tts.TextToSpeech;
import java.util.Locale;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(name = "RunEngine", permissions = {
  @Permission(strings = {Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, alias = "location"),
  @Permission(strings = {Manifest.permission.POST_NOTIFICATIONS}, alias = "notifications"),
  @Permission(strings = {Manifest.permission.ACTIVITY_RECOGNITION}, alias = "activity")
})
public class RunEnginePlugin extends Plugin {
  private TextToSpeech tts;
  private boolean ttsOk = false;

  @Override
  public void load() {
    bindTts();
  }

  /** (Re)creates the speech engine from the saved choice (engine, voice, speed) in VoiceKit. */
  private void bindTts() {
    final TextToSpeech old = tts;
    tts = null;
    ttsOk = false;
    if (old != null) {
      try {
        old.stop();
        old.shutdown();
      } catch (Exception e) {
        // ignore
      }
    }
    VoiceKit.create(getContext(), new VoiceKit.Ready() {
      @Override
      public void onReady(TextToSpeech t, boolean ok) {
        tts = t;
        ttsOk = ok;
      }
    });
  }

  @PluginMethod
  public void voiceList(PluginCall call) {
    try {
      call.resolve(JSObject.fromJSONObject(VoiceKit.list(getContext(), ttsOk ? tts : null)));
    } catch (Exception e) {
      call.reject("voice");
    }
  }

  /** Saves engine / voice / rate (each optional). A new engine is started again; the voice resets to that engine's default. */
  @PluginMethod
  public void voiceSet(PluginCall call) {
    android.content.SharedPreferences.Editor ed = VoiceKit.sp(getContext()).edit();
    boolean rebind = false;
    if (call.hasOption("engine")) {
      String e = call.getString("engine", "");
      if (!e.equals(VoiceKit.engine(getContext()))) {
        ed.putString("engine", e);
        ed.putString("voice", "");
        rebind = true;
      }
    }
    if (call.hasOption("voice")) ed.putString("voice", call.getString("voice", ""));
    if (call.hasOption("rate")) {
      Double r = call.getDouble("rate", 0.95);
      ed.putInt("rate", (int) Math.round((r == null ? 0.95 : r) * 100.0));
    }
    ed.apply();
    if (rebind) bindTts();
    else if (tts != null) VoiceKit.apply(getContext(), tts);
    call.resolve();
  }

  /** Opens the phone's own text-to-speech settings (engines, voice downloads). */
  @PluginMethod
  public void voiceSettings(PluginCall call) {
    Intent i = new Intent("com.android.settings.TTS_SETTINGS");
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    try {
      getContext().startActivity(i);
    } catch (Exception e) {
      try {
        Intent s = new Intent(android.provider.Settings.ACTION_SETTINGS);
        s.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(s);
      } catch (Exception e2) {
        // nothing more to try
      }
    }
    call.resolve();
  }

  /** Opens a web page for installing a voice engine. Only a short allow-list of hosts. */
  @PluginMethod
  public void openUrl(PluginCall call) {
    String u = call.getString("url", "");
    if (u.startsWith("https://f-droid.org/") || u.startsWith("https://github.com/")) {
      try {
        Intent i = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(u));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
        return;
      } catch (Exception e) {
        // fall through
      }
    }
    call.reject("url");
  }

  @PluginMethod
  public void speak(PluginCall call) {
    String t = call.getString("text", "");
    if (ttsOk && tts != null && t.length() > 0) {
      VoiceKit.speak(getContext(), tts, t, "u");
      call.resolve();
    } else {
      call.reject("tts");
    }
  }

  @PluginMethod
  public void start(PluginCall call) {
    RunService.configure(call.getData());
    Intent i = new Intent(getContext(), RunService.class);
    i.setAction("START");
    if (Build.VERSION.SDK_INT >= 26) {
      getContext().startForegroundService(i);
    } else {
      getContext().startService(i);
    }
    call.resolve();
  }

  @PluginMethod
  public void setState(PluginCall call) {
    RunService.apply(call.getData());
    call.resolve();
  }

  @PluginMethod
  public void state(PluginCall call) {
    call.resolve(RunService.stateJson());
  }

  @PluginMethod
  public void route(PluginCall call) {
    Integer from = call.getInt("from", 0);
    JSObject o = new JSObject();
    o.put("pts", RunService.routeFrom(from == null ? 0 : from.intValue()));
    call.resolve(o);
  }

  @PluginMethod
  public void stop(PluginCall call) {
    JSObject o = RunService.stateJson();
    RunService.active = false;
    getContext().stopService(new Intent(getContext(), RunService.class));
    call.resolve(o);
  }
}

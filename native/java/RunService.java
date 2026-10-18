package com.arya.fit;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.tts.TextToSpeech;
import com.getcapacitor.JSObject;
import java.util.ArrayList;
import java.util.Locale;

public class RunService extends Service implements LocationListener {
  static volatile boolean active = false, paused = false, hold = false, trk = true, voice = true, fg = true, dirty = false;
  static volatile int phase = 0, round = 1, rev = 0, kmSaid = 0;
  static volatile double jogSec = 0, walkSec = 0, pstart = 0, jt = 0, wt = 0, lt = 0, dist = 0;
  static volatile long accMs = 0, lastMs = 0;
  static final ArrayList<double[]> route = new ArrayList<double[]>();

  private final Handler h = new Handler(Looper.getMainLooper());
  private LocationManager lm;
  private NotificationManager nm;
  private TextToSpeech tts;
  private ToneGenerator tg;
  private boolean ttsOk = false, started = false;
  private Location last = null;
  private long lastNotif = 0;
  private final Runnable ticker = new Runnable() {
    public void run() {
      tick();
      h.postDelayed(this, 500);
    }
  };

  static double elapsedSec() {
    return (accMs + (paused ? 0 : SystemClock.elapsedRealtime() - lastMs)) / 1000.0;
  }

  static void configure(JSObject d) {
    jogSec = d.optDouble("jog", 0);
    walkSec = d.optDouble("walk", 0);
    trk = d.optBoolean("trk", true);
    voice = d.optBoolean("voice", true);
    accMs = (long) d.optDouble("acc", 0);
    paused = d.optBoolean("paused", false);
    phase = d.optInt("phase", 0);
    hold = d.optBoolean("hold", false);
    pstart = d.optDouble("pstart", 0);
    round = d.optInt("round", 1);
    jt = d.optDouble("jt", 0);
    wt = d.optDouble("wt", 0);
    dist = d.optDouble("dist", 0);
    lt = accMs / 1000.0;
    lastMs = SystemClock.elapsedRealtime();
    kmSaid = (int) (dist / 1000.0);
    rev = 0;
    fg = true;
    dirty = true;
    synchronized (route) {
      route.clear();
    }
    active = true;
  }

  static void apply(JSObject d) {
    if (d.has("elapsed")) {
      accMs = (long) d.optDouble("elapsed", accMs);
      lastMs = SystemClock.elapsedRealtime();
      lt = accMs / 1000.0;
    }
    if (d.has("paused")) paused = d.optBoolean("paused", paused);
    if (d.has("phase")) phase = d.optInt("phase", phase);
    if (d.has("hold")) hold = d.optBoolean("hold", hold);
    if (d.has("pstart")) pstart = d.optDouble("pstart", pstart);
    if (d.has("round")) round = d.optInt("round", round);
    if (d.has("fg")) fg = d.optBoolean("fg", fg);
    dirty = true;
  }

  static void doPause() {
    if (!paused) {
      accMs += SystemClock.elapsedRealtime() - lastMs;
      paused = true;
    } else {
      lastMs = SystemClock.elapsedRealtime();
      paused = false;
    }
    rev++;
    dirty = true;
  }

  static JSObject stateJson() {
    JSObject o = new JSObject();
    o.put("active", active);
    o.put("paused", paused);
    o.put("hold", hold);
    o.put("phase", phase);
    o.put("round", round);
    o.put("pstart", pstart);
    o.put("jt", jt);
    o.put("wt", wt);
    o.put("dist", dist);
    o.put("acc", (long) (elapsedSec() * 1000));
    o.put("rev", rev);
    int n;
    synchronized (route) {
      n = route.size();
    }
    o.put("rn", n);
    return o;
  }

  static String routeFrom(int from) {
    StringBuilder sb = new StringBuilder("[");
    boolean first = true;
    synchronized (route) {
      for (int i = Math.max(0, from); i < route.size(); i++) {
        double[] p = route.get(i);
        if (!first) sb.append(',');
        first = false;
        sb.append('[').append(Math.round(p[0] * 1e5) / 1e5).append(',').append(Math.round(p[1] * 1e5) / 1e5).append(',').append((long) p[2]).append(']');
      }
    }
    return sb.append(']').toString();
  }

  @Override
  public void onCreate() {
    super.onCreate();
    nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= 26) {
      nm.createNotificationChannel(new NotificationChannel("run_engine", "Run in progress", NotificationManager.IMPORTANCE_LOW));
    }
    tg = new ToneGenerator(AudioManager.STREAM_MUSIC, 80);
    tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
      public void onInit(int s) {
        ttsOk = (s == TextToSpeech.SUCCESS);
        if (ttsOk) tts.setLanguage(Locale.US);
      }
    });
  }

  @Override
  public int onStartCommand(Intent in, int flags, int startId) {
    String a = in == null ? null : in.getAction();
    if ("PAUSE".equals(a)) {
      doPause();
    } else if ("SWITCH".equals(a)) {
      doSwitch();
    } else if ("START".equals(a)) {
      last = null;
    }
    if (!active) {
      stopSelf();
      return START_NOT_STICKY;
    }
    if (!started) {
      started = true;
      try {
        Notification n = notif();
        if (Build.VERSION.SDK_INT >= 29) {
          startForeground(7, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
          startForeground(7, n);
        }
      } catch (Exception e) {
        stopSelf();
        return START_NOT_STICKY;
      }
      if (trk) startGps();
      h.post(ticker);
    }
    return START_NOT_STICKY;
  }

  private void startGps() {
    try {
      lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
      lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 0f, this, Looper.getMainLooper());
    } catch (Exception e) {
    }
  }

  private void doSwitch() {
    double e = elapsedSec();
    if (hold || phase == 1) {
      hold = false;
      phase = 0;
      round++;
    } else {
      hold = true;
      phase = 1;
    }
    pstart = e;
    rev++;
    dirty = true;
    cue(phase == 0 ? "Jog" : "Walk");
  }

  private void tick() {
    if (!active) return;
    double e = elapsedSec();
    double dd = e - lt;
    lt = e;
    if (!paused && dd > 0) {
      if (hold || phase == 1) wt += dd;
      else jt += dd;
    }
    if (!paused && !hold && walkSec > 0) {
      double du = phase == 0 ? jogSec : walkSec;
      if (e - pstart >= du) {
        phase = 1 - phase;
        pstart = e;
        if (phase == 0) round++;
        cue(phase == 0 ? "Jog" : "Walk");
        dirty = true;
      }
    }
    long now = SystemClock.elapsedRealtime();
    if (dirty || now - lastNotif > 3000) {
      dirty = false;
      lastNotif = now;
      try {
        nm.notify(7, notif());
      } catch (Exception ex) {
      }
    }
  }

  private Notification notif() {
    double e = elapsedSec();
    String title = paused ? "Paused" : ((hold || phase == 1) ? "Walking" : "Jogging");
    String body = String.format(Locale.US, "%.2f km  |  round %d", dist / 1000.0, round);
    Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, "run_engine") : new Notification.Builder(this);
    b.setSmallIcon(getApplicationInfo().icon).setContentTitle(title).setContentText(body).setOngoing(true).setOnlyAlertOnce(true);
    if (!paused) b.setUsesChronometer(true).setShowWhen(true).setWhen(System.currentTimeMillis() - (long) (e * 1000));
    Intent li = getPackageManager().getLaunchIntentForPackage(getPackageName());
    if (li != null) b.setContentIntent(PendingIntent.getActivity(this, 0, li, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT));
    b.addAction(0, paused ? "Resume" : "Pause", act("PAUSE", 1));
    b.addAction(0, (hold || phase == 1) ? "Jog" : "Walk", act("SWITCH", 2));
    return b.build();
  }

  private PendingIntent act(String a, int code) {
    Intent i = new Intent(this, RunService.class);
    i.setAction(a);
    return PendingIntent.getService(this, code, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
  }

  private void cue(String word) {
    if (fg) return;
    try {
      Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
      if (v != null) {
        if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createWaveform(new long[]{0, 220, 120, 220}, -1));
        else v.vibrate(450);
      }
    } catch (Exception e) {
    }
    try {
      if (tg != null) tg.startTone(ToneGenerator.TONE_PROP_BEEP, 250);
    } catch (Exception e) {
    }
    say(word);
  }

  private void say(String t) {
    if (voice && ttsOk && tts != null) {
      try {
        tts.speak(t, TextToSpeech.QUEUE_FLUSH, null, "c");
      } catch (Exception e) {
      }
    }
  }

  @Override
  public void onLocationChanged(Location l) {
    if (!active || !trk) return;
    if (paused) {
      last = null;
      return;
    }
    if (l.hasAccuracy() && l.getAccuracy() > 30) return;
    if (last != null) {
      double dts = (l.getTime() - last.getTime()) / 1000.0;
      if (dts > 25) {
        last = l;
        return;
      }
      double d = l.distanceTo(last);
      if (d < 3) return;
      if (d / Math.max(dts, 0.001) > 8) return;
      dist += d;
      int k = (int) (dist / 1000.0);
      if (k > kmSaid) {
        kmSaid = k;
        if (!fg) say(k + (k > 1 ? " kilometers" : " kilometer"));
      }
    }
    synchronized (route) {
      route.add(new double[]{l.getLatitude(), l.getLongitude(), (double) l.getTime()});
    }
    last = l;
  }

  public void onStatusChanged(String p, int s, Bundle b) {
  }

  public void onProviderEnabled(String p) {
  }

  public void onProviderDisabled(String p) {
  }

  @Override
  public void onDestroy() {
    h.removeCallbacks(ticker);
    try {
      if (lm != null) lm.removeUpdates(this);
    } catch (Exception e) {
    }
    try {
      if (tts != null) tts.shutdown();
      if (tg != null) tg.release();
    } catch (Exception e) {
    }
    active = false;
    super.onDestroy();
  }

  @Override
  public IBinder onBind(Intent i) {
    return null;
  }
}

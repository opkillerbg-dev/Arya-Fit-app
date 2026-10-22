package com.arya.fit;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Locale;
import java.util.Map;

/**
 * All-day step counting. The phone's hardware step counter (TYPE_STEP_COUNTER) keeps a
 * running total since boot. A small foreground service (Svc) listens to it and adds the
 * difference to a per-day total in SharedPreferences ("d_yyyy-MM-dd"). Boot restarts it.
 */
@CapacitorPlugin(name = "Steps", permissions = {
  @Permission(strings = {Manifest.permission.ACTIVITY_RECOGNITION}, alias = "activity"),
  @Permission(strings = {Manifest.permission.POST_NOTIFICATIONS}, alias = "notifications")
})
public class StepsPlugin extends Plugin {
  static final String PREF = "arya_steps";
  static final String CH = "arya_steps";
  static final int NID = 11;
  static volatile boolean running = false;

  static String dayKey(long ms) {
    return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date(ms));
  }

  static SharedPreferences sp(Context c) {
    return c.getSharedPreferences(PREF, Context.MODE_PRIVATE);
  }

  static boolean hasPerm(Context c) {
    if (Build.VERSION.SDK_INT < 29) return true;
    return c.checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
  }

  static boolean hasSensor(Context c) {
    SensorManager sm = (SensorManager) c.getSystemService(Context.SENSOR_SERVICE);
    return sm != null && sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) != null;
  }

  static int today(Context c) {
    return sp(c).getInt("d_" + dayKey(System.currentTimeMillis()), 0);
  }

  /** Adds the steps since the last reading to today's total. raw = steps since boot. */
  static synchronized void credit(Context c, long raw) {
    SharedPreferences p = sp(c);
    long last = p.getLong("lastRaw", -1L);
    long delta = 0L;
    if (last >= 0L) delta = raw >= last ? raw - last : raw; // raw < last means the phone rebooted
    if (delta > 30000L) delta = 30000L;
    SharedPreferences.Editor e = p.edit();
    e.putLong("lastRaw", raw);
    if (delta > 0L) {
      String k = "d_" + dayKey(System.currentTimeMillis());
      e.putInt(k, p.getInt(k, 0) + (int) delta);
    }
    e.apply();
    if (delta > 0L) WidgetKit.ping(c);
  }

  /** Keeps about 400 days. */
  static void prune(Context c) {
    SharedPreferences p = sp(c);
    String lim = dayKey(System.currentTimeMillis() - 400L * 86400000L);
    ArrayList<String> old = new ArrayList<String>();
    for (Map.Entry<String, ?> en : p.getAll().entrySet()) {
      String k = en.getKey();
      if (k.startsWith("d_") && k.substring(2).compareTo(lim) < 0) old.add(k);
    }
    if (old.isEmpty()) return;
    SharedPreferences.Editor e = p.edit();
    for (String k : old) e.remove(k);
    e.apply();
  }

  static void launch(Context c) {
    try {
      Intent i = new Intent(c, Svc.class);
      if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(i);
      else c.startService(i);
    } catch (Exception ex) {
      // not allowed right now (for example app in background); the next app open retries
    }
  }

  @PluginMethod
  public void status(PluginCall call) {
    Context c = getContext();
    boolean ign = true;
    if (Build.VERSION.SDK_INT >= 23) {
      PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
      ign = pm != null && pm.isIgnoringBatteryOptimizations(c.getPackageName());
    }
    JSObject o = new JSObject();
    o.put("sensor", hasSensor(c));
    o.put("perm", hasPerm(c));
    o.put("running", running);
    o.put("today", today(c));
    o.put("date", dayKey(System.currentTimeMillis()));
    o.put("ignoring", ign);
    call.resolve(o);
  }

  @PluginMethod
  public void start(PluginCall call) {
    Context c = getContext();
    boolean ok = hasPerm(c) && hasSensor(c);
    if (ok) launch(c);
    JSObject o = new JSObject();
    o.put("started", ok);
    call.resolve(o);
  }

  @PluginMethod
  public void history(PluginCall call) {
    JSObject m = new JSObject();
    for (Map.Entry<String, ?> en : sp(getContext()).getAll().entrySet()) {
      String k = en.getKey();
      Object v = en.getValue();
      if (k.startsWith("d_") && v instanceof Integer) m.put(k.substring(2), ((Integer) v).intValue());
    }
    JSObject o = new JSObject();
    o.put("map", m);
    call.resolve(o);
  }

  @PluginMethod
  public void openSettings(PluginCall call) {
    try {
      Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getContext().getPackageName()));
      i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(i);
    } catch (Exception ex) {
      // ignore
    }
    call.resolve();
  }

  @PluginMethod
  public void keepAlive(PluginCall call) {
    Context c = getContext();
    try {
      Intent i;
      if (Build.VERSION.SDK_INT >= 23) {
        i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + c.getPackageName()));
      } else {
        i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + c.getPackageName()));
      }
      i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      c.startActivity(i);
    } catch (Exception ex) {
      try {
        Intent j = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + c.getPackageName()));
        j.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        c.startActivity(j);
      } catch (Exception ex2) {
        // ignore
      }
    }
    call.resolve();
  }

  /** Foreground service that listens to the step counter all day. */
  public static class Svc extends Service implements SensorEventListener {
    private SensorManager sm;
    private long lastNotify = 0L;
    private int lastShown = -1;
    private String lastDay = "";
    private boolean pending = false;
    private BroadcastReceiver screen;
    private final Handler h = new Handler(Looper.getMainLooper());
    private final Runnable tick = new Runnable() {
      @Override
      public void run() {
        pending = false;
        refresh(false);
      }
    };

    @Override
    public IBinder onBind(Intent intent) {
      return null;
    }

    @Override
    public void onCreate() {
      super.onCreate();
      NotifKit.channels(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
      int t0 = today(this);
      Notification n = NotifKit.steps(this, t0, NotifKit.info(this));
      try {
        if (Build.VERSION.SDK_INT >= 34) startForeground(NID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH);
        else startForeground(NID, n);
      } catch (Exception ex) {
        stopSelf();
        return START_NOT_STICKY;
      }
      if (!hasPerm(this)) {
        stopSelf();
        return START_NOT_STICKY;
      }
      if (sm == null) {
        sm = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        Sensor s = sm == null ? null : sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        if (s == null) {
          stopSelf();
          return START_NOT_STICKY;
        }
        sm.registerListener(this, s, SensorManager.SENSOR_DELAY_NORMAL, 30000000);
        running = true;
        lastShown = t0;
        lastDay = dayKey(System.currentTimeMillis());
        lastNotify = System.currentTimeMillis();
        prune(this);
        watchScreen();
      }
      return START_STICKY;
    }

    /** The sensor batches readings for up to 30 s. When the screen turns on, flush them so the number is current when you look. */
    private void watchScreen() {
      if (screen != null) return;
      screen = new BroadcastReceiver() {
        @Override
        public void onReceive(Context c, Intent i) {
          try {
            if (sm != null) sm.flush(Svc.this);
          } catch (Exception ex) {
            // ignore
          }
          refresh(true);
        }
      };
      try {
        IntentFilter f = new IntentFilter(Intent.ACTION_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(screen, f, Context.RECEIVER_NOT_EXPORTED);
        else registerReceiver(screen, f);
      } catch (Exception ex) {
        screen = null;
      }
    }

    @Override
    public void onSensorChanged(SensorEvent e) {
      if (e == null || e.values == null || e.values.length == 0) return;
      credit(this, (long) e.values[0]);
      later();
    }

    /** Trailing throttle: at most one update per 4 s, and the last value always gets shown (the old code could stay stale). */
    private void later() {
      if (pending) return;
      long wait = Math.max(0L, 4000L - (System.currentTimeMillis() - lastNotify));
      pending = true;
      h.postDelayed(tick, wait);
    }

    private void refresh(boolean force) {
      int t = today(this);
      long now = System.currentTimeMillis();
      String d = dayKey(now);
      if (!force && t == lastShown && d.equals(lastDay)) return;
      NotifKit.Info inf = NotifKit.info(this);
      boolean crossed = lastShown >= 0 && lastShown < inf.goal && t >= inf.goal && d.equals(lastDay);
      lastShown = t;
      lastDay = d;
      lastNotify = now;
      NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
      if (nm == null) return;
      nm.notify(NID, NotifKit.steps(this, t, inf));
      if (t >= inf.goal && !d.equals(sp(this).getString("ga", ""))) {
        sp(this).edit().putString("ga", d).apply();
        if (crossed) nm.notify(NotifKit.NID_GOAL, NotifKit.goal(this, t, inf));
      }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }

    @Override
    public void onDestroy() {
      h.removeCallbacks(tick);
      pending = false;
      if (screen != null) {
        try {
          unregisterReceiver(screen);
        } catch (Exception ex) {
          // ignore
        }
        screen = null;
      }
      if (sm != null) sm.unregisterListener(this);
      sm = null;
      running = false;
      super.onDestroy();
    }
  }

  /** Restarts counting after a reboot or an app update. */
  public static class Boot extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
      String a = i == null ? null : i.getAction();
      if (Intent.ACTION_BOOT_COMPLETED.equals(a) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(a)) {
        if (hasPerm(c) && hasSensor(c)) launch(c);
      }
    }
  }
}

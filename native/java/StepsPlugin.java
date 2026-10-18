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
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
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

    @Override
    public IBinder onBind(Intent intent) {
      return null;
    }

    @Override
    public void onCreate() {
      super.onCreate();
      if (Build.VERSION.SDK_INT >= 26) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.createNotificationChannel(new NotificationChannel(CH, "Daily steps", NotificationManager.IMPORTANCE_LOW));
      }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
      Notification n = notif(today(this));
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
        prune(this);
      }
      return START_STICKY;
    }

    @Override
    public void onSensorChanged(SensorEvent e) {
      if (e == null || e.values == null || e.values.length == 0) return;
      credit(this, (long) e.values[0]);
      long now = System.currentTimeMillis();
      int t = today(this);
      if (t != lastShown && now - lastNotify > 5000L) {
        lastNotify = now;
        lastShown = t;
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NID, notif(t));
      }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }

    @Override
    public void onDestroy() {
      if (sm != null) sm.unregisterListener(this);
      sm = null;
      running = false;
      super.onDestroy();
    }

    private Notification notif(int steps) {
      Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CH) : new Notification.Builder(this);
      b.setSmallIcon(getApplicationInfo().icon)
        .setContentTitle("Arya Fit")
        .setContentText(String.format(Locale.US, "%,d steps today", steps))
        .setOngoing(true)
        .setOnlyAlertOnce(true);
      Intent li = getPackageManager().getLaunchIntentForPackage(getPackageName());
      if (li != null) b.setContentIntent(PendingIntent.getActivity(this, 0, li, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT));
      return b.build();
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

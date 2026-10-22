package com.arya.fit;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import org.json.JSONObject;

/**
 * Arya Fit v94: builds the steps notification, the goal-reached notification and shared bits for the run notification.
 * Goal, stride, today's plan and streak come from the same JSON the widgets use (web/js/features/widget.js writes it
 * through AppWidgetPlugin, stored under pref arya_widget / json), so no extra bridge is needed.
 */
final class NotifKit {
  private NotifKit() {}

  static final String CH_STEPS = StepsPlugin.CH;
  static final String CH_GOAL = "arya_goal";
  static final int NID_GOAL = 12;
  static final int DEF_ACCENT = 0xFF28533D, DEF_OK = 0xFF477653;

  static class Info {
    int goal = 8000, done = 0, total = 0, streak = 0;
    double stride = 0.75;
    String title = "";
    boolean fresh = false, rest = false, goalAlert = true, compact = false;
    int accent = DEF_ACCENT, ok = DEF_OK;
  }

  private static int col(String s, int def) {
    try { return Color.parseColor(s); } catch (Exception e) { return def; }
  }

  static Info info(Context c) {
    Info d = new Info();
    String js = c.getSharedPreferences(WidgetKit.PREF, Context.MODE_PRIVATE).getString("json", null);
    if (js == null) return d;
    try {
      JSONObject o = new JSONObject(js);
      d.goal = o.optInt("goal", 8000);
      if (d.goal < 1000) d.goal = 8000;
      d.stride = o.optDouble("stride", 0.75);
      d.fresh = StepsPlugin.dayKey(System.currentTimeMillis()).equals(o.optString("date", ""));
      d.title = o.optString("title", "");
      d.done = o.optInt("done", 0);
      d.total = o.optInt("total", 0);
      d.streak = o.optInt("streak", 0);
      d.rest = o.optBoolean("rest", false);
      d.goalAlert = o.optInt("nga", 1) != 0;
      d.compact = o.optInt("ncp", 0) == 1;
      JSONObject k = o.optJSONObject("c");
      if (k != null) {
        d.accent = col(k.optString("blue", ""), DEF_ACCENT);
        d.ok = col(k.optString("ok", ""), DEF_OK);
      }
    } catch (Exception e) { /* keep defaults */ }
    return d;
  }

  static void channels(Context c) {
    if (Build.VERSION.SDK_INT < 26) return;
    NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
    if (nm == null) return;
    NotificationChannel s = new NotificationChannel(CH_STEPS, "Daily steps", NotificationManager.IMPORTANCE_LOW);
    s.setDescription("Live step count with your daily goal");
    s.setShowBadge(false);
    nm.createNotificationChannel(s);
    NotificationChannel g = new NotificationChannel(CH_GOAL, "Goal reached", NotificationManager.IMPORTANCE_DEFAULT);
    g.setDescription("One message when you reach your daily step goal");
    nm.createNotificationChannel(g);
  }

  private static Notification.Builder builder(Context c, String ch) {
    return Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, ch) : new Notification.Builder(c);
  }

  private static PendingIntent open(Context c) {
    Intent li = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
    if (li == null) return null;
    return PendingIntent.getActivity(c, 0, li, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
  }

  static Notification steps(Context c, int steps, Info i) {
    boolean hit = steps >= i.goal;
    long now = System.currentTimeMillis();
    int yesterday = StepsPlugin.sp(c).getInt("d_" + StepsPlugin.dayKey(now - 86400000L), 0);
    int sum = 0;
    for (int k = 1; k <= 7; k++) sum += StepsPlugin.sp(c).getInt("d_" + StepsPlugin.dayKey(now - (long) k * 86400000L), 0);
    String plan = NotifText.plan(i.fresh, i.rest, i.title, i.done, i.total);
    Notification.Builder b = builder(c, CH_STEPS);
    b.setSmallIcon(R.drawable.ic_stat_arya)
      .setContentTitle(NotifText.title(steps))
      .setContentText(NotifText.summary(steps, i.goal))
      .setSubText(i.streak > 0 ? i.streak + "-day streak" : "Today")
      .setProgress(i.goal, Math.min(steps, i.goal), false)
      .setColor(hit ? i.ok : i.accent)
      .setCategory(Notification.CATEGORY_STATUS)
      .setShowWhen(false)
      .setOngoing(true)
      .setOnlyAlertOnce(true);
    if (!i.compact) b.setStyle(new Notification.BigTextStyle().bigText(NotifText.big(steps, i.goal, i.stride, plan, yesterday, sum / 7)));
    if (Build.VERSION.SDK_INT >= 31) b.setForegroundServiceBehavior(Notification.FOREGROUND_SERVICE_IMMEDIATE);
    PendingIntent pi = open(c);
    if (pi != null) b.setContentIntent(pi);
    return b.build();
  }

  static Notification goal(Context c, int steps, Info i) {
    Notification.Builder b = builder(c, CH_GOAL);
    b.setSmallIcon(R.drawable.ic_stat_arya)
      .setContentTitle(NotifText.goalTitle())
      .setContentText(NotifText.goalBody(steps, i.goal))
      .setColor(i.ok)
      .setCategory(Notification.CATEGORY_STATUS)
      .setAutoCancel(true);
    PendingIntent pi = open(c);
    if (pi != null) b.setContentIntent(pi);
    return b.build();
  }

  static int accent(Context c) {
    return info(c).accent;
  }
}

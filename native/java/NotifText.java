package com.arya.fit;

import java.util.Locale;

/** Arya Fit v94: all notification wording in one place. Pure Java (no Android classes) so it can be unit tested: tests/NotifTextTest.java. */
final class NotifText {
  private NotifText() {}

  static final String DOT = " \u00b7 ";

  static String fmt(int n) {
    return String.format(Locale.US, "%,d", n);
  }

  static int pct(int steps, int goal) {
    if (goal <= 0) return 0;
    return (int) Math.min(999L, Math.round(steps * 100.0 / goal));
  }

  static double km(int steps, double stride) {
    if (!(stride >= 0.4 && stride <= 1.6)) stride = 0.75;
    return steps * stride / 1000.0;
  }

  static String title(int steps) {
    return fmt(steps) + (steps == 1 ? " step" : " steps");
  }

  /** One line under the title. */
  static String summary(int steps, int goal) {
    if (steps >= goal) return "Goal reached" + DOT + fmt(goal) + (steps > goal ? " (+" + fmt(steps - goal) + ")" : "");
    return pct(steps, goal) + "% of " + fmt(goal) + DOT + fmt(goal - steps) + " to go";
  }

  /** Expanded view. plan may be "" ; avg7 <= 0 hides the history line. */
  static String big(int steps, int goal, double stride, String plan, int yesterday, int avg7) {
    StringBuilder sb = new StringBuilder();
    sb.append(summary(steps, goal));
    sb.append('\n').append(String.format(Locale.US, "%.1f km walked", km(steps, stride)));
    if (plan != null && plan.length() > 0) sb.append('\n').append(plan);
    if (avg7 > 0) sb.append('\n').append("Yesterday ").append(fmt(yesterday)).append(DOT).append("7-day avg ").append(fmt(avg7));
    return sb.toString();
  }

  static String plan(boolean fresh, boolean rest, String title, int done, int total) {
    if (!fresh) return "";
    if (rest) return "Rest day today";
    if (title == null || title.length() == 0) return "";
    return "Today: " + title + (total > 0 ? DOT + done + " of " + total + " done" : "");
  }

  static String goalTitle() {
    return "Goal reached";
  }

  static String goalBody(int steps, int goal) {
    return "You walked " + fmt(steps) + " steps today. Goal was " + fmt(goal) + ". Nice work.";
  }

  /** Average pace as m:ss per km, or "--" when there is not enough distance yet. */
  static String pace(double sec, double distM) {
    if (distM < 50.0 || sec <= 0.0) return "--";
    int s = (int) Math.round(sec / (distM / 1000.0));
    if (s > 3599) return "--";
    return (s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
  }
}

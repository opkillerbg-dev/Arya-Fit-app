package com.arya.fit;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.widget.RemoteViews;
import java.text.NumberFormat;
import java.util.Locale;
import org.json.JSONObject;

/**
 * Draws the three Arya Fit home-screen widgets (Steps, Today, Overview) as bitmaps.
 * Steps are read live from the step counter's SharedPreferences (see StepsPlugin).
 * Plan text, goal, streak and the skin colours arrive from the web app (AppWidgetPlugin.update).
 */
final class WidgetKit {
  static final String PREF = "arya_widget";
  static final int STEPS = 0, TODAY = 1, COMBO = 2;
  private static long lastPing = 0L;

  private static final Typeface SERIF = Typeface.create("serif", Typeface.BOLD);
  private static final Typeface SANS = Typeface.create("sans-serif-medium", Typeface.NORMAL);

  static class Data {
    int goal = 8000, steps = 0, done = 0, total = 0, streak = 0;
    int[] week = new int[7];
    String title = "", kicker = "";
    boolean fresh = false, rest = false;
    int bg = 0xFFEEE7D7, card = 0xFFFAF6EB, ink = 0xFF202B22, mut = 0xFF716F60,
        blue = 0xFF28533D, ok = 0xFF477653, sun = 0xFFA98542, line = 0xFFD8CDB5;
  }

  private static int col(String s, int def) {
    try { return Color.parseColor(s); } catch (Exception e) { return def; }
  }

  static Data load(Context c) {
    Data d = new Data();
    d.steps = StepsPlugin.today(c);
    SharedPreferences sp = StepsPlugin.sp(c);
    long now = System.currentTimeMillis();
    for (int i = 0; i < 7; i++) {
      d.week[i] = sp.getInt("d_" + StepsPlugin.dayKey(now - (long) (6 - i) * 86400000L), 0);
    }
    String js = c.getSharedPreferences(PREF, Context.MODE_PRIVATE).getString("json", null);
    if (js != null) {
      try {
        JSONObject o = new JSONObject(js);
        d.goal = o.optInt("goal", 8000);
        if (d.goal < 1000) d.goal = 8000;
        d.fresh = StepsPlugin.dayKey(now).equals(o.optString("date", ""));
        d.title = o.optString("title", "");
        d.kicker = o.optString("kicker", "");
        d.done = o.optInt("done", 0);
        d.total = o.optInt("total", 0);
        d.streak = o.optInt("streak", 0);
        d.rest = o.optBoolean("rest", false);
        JSONObject k = o.optJSONObject("c");
        if (k != null) {
          d.bg = col(k.optString("bg", ""), d.bg);
          d.card = col(k.optString("card", ""), d.card);
          d.ink = col(k.optString("ink", ""), d.ink);
          d.mut = col(k.optString("mut", ""), d.mut);
          d.blue = col(k.optString("blue", ""), d.blue);
          d.ok = col(k.optString("ok", ""), d.ok);
          d.sun = col(k.optString("sun", ""), d.sun);
          d.line = col(k.optString("line", ""), d.line);
        }
      } catch (Exception e) { /* keep defaults */ }
    }
    return d;
  }

  /* ---------- small drawing helpers ---------- */
  private static Paint p() {
    Paint t = new Paint(Paint.ANTI_ALIAS_FLAG);
    t.setDither(true);
    return t;
  }

  private static Paint text(int color, float size, Typeface tf, Paint.Align al) {
    Paint t = p();
    t.setColor(color);
    t.setTextSize(size);
    t.setTypeface(tf);
    t.setTextAlign(al);
    return t;
  }

  private static void spaced(Paint t, float em) {
    if (Build.VERSION.SDK_INT >= 21) t.setLetterSpacing(em);
  }

  /** Shrinks the paint's text size until s fits maxW; returns the size used. */
  private static float fit(Paint t, String s, float maxW, float maxSize, float minSize) {
    float sz = maxSize;
    t.setTextSize(sz);
    while (t.measureText(s) > maxW && sz > minSize) {
      sz -= 1f;
      t.setTextSize(sz);
    }
    return sz;
  }

  private static float centerBase(Paint t, float cy) {
    return cy - (t.ascent() + t.descent()) / 2f;
  }

  private static String fmt(int n) {
    return NumberFormat.getIntegerInstance(Locale.getDefault()).format(n);
  }

  private static String compact(int n) {
    return n >= 10000 ? (Math.round(n / 100f) / 10f) + "k" : fmt(n);
  }

  private static int track(Data d) {
    return (d.mut & 0x00FFFFFF) | 0x30000000;
  }

  private static void ring(Canvas cv, float cx, float cy, float r, float stroke, float frac, int trk, int color) {
    Paint t = p();
    t.setStyle(Paint.Style.STROKE);
    t.setStrokeWidth(stroke);
    t.setColor(trk);
    cv.drawCircle(cx, cy, r, t);
    if (frac <= 0f) return;
    Paint a = p();
    a.setStyle(Paint.Style.STROKE);
    a.setStrokeWidth(stroke);
    a.setStrokeCap(Paint.Cap.ROUND);
    a.setColor(color);
    if (frac >= 0.999f) {
      cv.drawCircle(cx, cy, r, a);
    } else {
      RectF o = new RectF(cx - r, cy - r, cx + r, cy + r);
      cv.drawArc(o, -90f, 360f * Math.max(frac, 0.015f), false, a);
    }
  }

  private static void cardBg(Canvas cv, Data d, int w, int h, float u) {
    RectF r = new RectF(0, 0, w, h);
    float rad = Math.min(26f * u, Math.min(w, h) * 0.28f);
    Paint f = p();
    f.setColor(d.card);
    cv.drawRoundRect(r, rad, rad, f);
    Paint g = p();
    g.setShader(new LinearGradient(0, 0, 0, h, 0x26FFFFFF, 0x00FFFFFF, Shader.TileMode.CLAMP));
    cv.drawRoundRect(r, rad, rad, g);
    Paint b = p();
    b.setStyle(Paint.Style.STROKE);
    b.setStrokeWidth(1.2f * u);
    b.setColor(d.line);
    cv.drawRoundRect(new RectF(0.6f * u, 0.6f * u, w - 0.6f * u, h - 0.6f * u), rad, rad, b);
  }

  private static Path flame(float x, float y, float w, float h) {
    Path p = new Path();
    p.moveTo(x + w * 0.5f, y);
    p.cubicTo(x + w * 0.62f, y + h * 0.22f, x + w * 0.95f, y + h * 0.38f, x + w * 0.92f, y + h * 0.66f);
    p.cubicTo(x + w * 0.90f, y + h * 0.90f, x + w * 0.70f, y + h, x + w * 0.5f, y + h);
    p.cubicTo(x + w * 0.30f, y + h, x + w * 0.10f, y + h * 0.90f, x + w * 0.08f, y + h * 0.66f);
    p.cubicTo(x + w * 0.06f, y + h * 0.50f, x + w * 0.18f, y + h * 0.40f, x + w * 0.28f, y + h * 0.32f);
    p.cubicTo(x + w * 0.30f, y + h * 0.45f, x + w * 0.38f, y + h * 0.50f, x + w * 0.42f, y + h * 0.48f);
    p.cubicTo(x + w * 0.38f, y + h * 0.30f, x + w * 0.40f, y + h * 0.12f, x + w * 0.5f, y);
    p.close();
    return p;
  }

  /* ---------- Steps ---------- */
  private static void drawSteps(Canvas cv, Data d, int W, int H, float u) {
    float frac = d.goal > 0 ? (float) d.steps / d.goal : 0f;
    boolean hit = frac >= 1f;
    int acc = hit ? d.ok : d.blue;
    String num = fmt(d.steps);
    boolean wide = (float) W / H > 1.45f;
    if ((float) H / W > 1.45f) {            // 1 cell wide, 2+ cells tall
      drawStepsTall(cv, d, W, H, u, frac, hit, acc, num);
      return;
    }
    if (wide && H < 96f * u) {              // 2+ cells wide, 1 cell tall
      drawStepsShort(cv, d, W, H, u, frac, hit, acc, num);
      return;
    }
    if (!wide) {
      float s = Math.min(W, H);
      float cx = W / 2f, cy = H / 2f, r = s * 0.355f, sw = s * 0.085f;
      ring(cv, cx, cy, r, sw, frac, track(d), acc);
      Paint n = text(d.ink, s * 0.2f, SERIF, Paint.Align.CENTER);
      float sz = fit(n, num, (r - sw) * 2f * 0.86f, s * 0.22f, s * 0.08f);
      float base = centerBase(n, cy) - s * 0.01f;
      cv.drawText(num, cx, base, n);
      if (s >= 84f * u) {
        Paint k = text(d.mut, s * 0.062f, SANS, Paint.Align.CENTER);
        spaced(k, 0.12f);
        cv.drawText("STEPS", cx, base - sz * 0.92f, k);
        Paint g = text(hit ? d.ok : d.mut, s * 0.075f, SANS, Paint.Align.CENTER);
        cv.drawText(hit ? "Goal reached" : "of " + fmt(d.goal), cx, base + s * 0.12f, g);
      }
      return;
    }
    float pad = 14f * u;
    float sw = H * 0.085f, rr = H * 0.34f;
    float cx = pad + rr + sw / 2f, cy = H / 2f;
    ring(cv, cx, cy, rr, sw, frac, track(d), acc);
    String pct = Math.round(frac * 100f) + "%";
    Paint pp = text(d.ink, H * 0.15f, SERIF, Paint.Align.CENTER);
    fit(pp, pct, (rr - sw) * 2f * 0.8f, H * 0.17f, H * 0.07f);
    cv.drawText(pct, cx, centerBase(pp, cy), pp);

    float x0 = cx + rr + sw / 2f + 16f * u;
    float colW = W - x0 - pad;
    boolean bars = H >= 96f * u;
    float kb = bars ? H * 0.25f : H * 0.34f;
    Paint k = text(d.mut, Math.max(H * 0.075f, 9f * u), SANS, Paint.Align.LEFT);
    spaced(k, 0.12f);
    cv.drawText("STEPS TODAY", x0, kb, k);
    Paint n = text(d.ink, H * 0.3f, SERIF, Paint.Align.LEFT);
    float sz = fit(n, num, colW, H * 0.3f, H * 0.12f);
    float nb = kb + sz * 1.08f;
    cv.drawText(num, x0, nb, n);
    Paint sub = text(hit ? d.ok : d.mut, Math.max(H * 0.088f, 10f * u), SANS, Paint.Align.LEFT);
    cv.drawText(hit ? "Goal reached · " + fmt(d.goal) : "of " + fmt(d.goal) + " goal", x0, nb + H * 0.115f, sub);
    if (bars) {
      int mx = Math.max(d.goal, 1);
      for (int i = 0; i < 7; i++) mx = Math.max(mx, d.week[i]);
      float gap = 5f * u, bw = (colW - gap * 6f) / 7f;
      float bottom = H - pad, maxH = H * 0.17f;
      for (int i = 0; i < 7; i++) {
        float bh = Math.max(3f * u, maxH * d.week[i] / mx);
        Paint b = p();
        int c0 = i == 6 ? acc : ((d.week[i] >= d.goal) ? ((d.ok & 0x00FFFFFF) | 0x99000000) : ((d.mut & 0x00FFFFFF) | 0x50000000));
        b.setColor(c0);
        float bx = x0 + i * (bw + gap);
        cv.drawRoundRect(new RectF(bx, bottom - bh, bx + bw, bottom), bw / 2.4f, bw / 2.4f, b);
      }
    }
  }


  /** 1 cell wide, tall: ring on top, number and goal below, block centred vertically. */
  private static void drawStepsTall(Canvas cv, Data d, int W, int H, float u, float frac, boolean hit, int acc, String num) {
    float pad = Math.max(5f * u, W * 0.1f);
    float sw = W * 0.11f;
    float rr = (W - 2f * pad) / 2f - sw / 2f;
    Paint n = text(d.ink, W * 0.3f, SERIF, Paint.Align.CENTER);
    float sz = fit(n, num, W - 2f * pad, W * 0.3f, W * 0.12f);
    String sub = hit ? "Goal!" : "of " + compact(d.goal);
    Paint g = text(hit ? d.ok : d.mut, Math.max(W * 0.17f, 8f * u), SANS, Paint.Align.CENTER);
    fit(g, sub, W - pad, Math.max(W * 0.17f, 8f * u), 6f * u);
    float ringH = 2f * rr + sw;
    float block = ringH + sz * 1.3f + sz * 0.95f;
    float top = Math.max(pad, (H - block) / 2f);
    float cx = W / 2f, cy = top + rr + sw / 2f;
    ring(cv, cx, cy, rr, sw, frac, track(d), acc);
    String pct = Math.round(frac * 100f) + "%";
    Paint pp = text(d.ink, rr * 0.7f, SERIF, Paint.Align.CENTER);
    fit(pp, pct, (rr - sw) * 2f * 0.8f, rr * 0.7f, rr * 0.3f);
    if (rr > 14f * u) cv.drawText(pct, cx, centerBase(pp, cy), pp);
    float nb = top + ringH + sz * 1.3f;
    cv.drawText(num, cx, nb, n);
    cv.drawText(sub, cx, nb + sz * 0.95f, g);
  }

  /** 2+ cells wide, 1 cell tall: ring left, number and goal on the right. */
  private static void drawStepsShort(Canvas cv, Data d, int W, int H, float u, float frac, boolean hit, int acc, String num) {
    float pad = Math.max(6f * u, H * 0.12f);
    float sw = H * 0.12f;
    float rr = H / 2f - pad - sw / 2f;
    float cx = pad + sw / 2f + rr, cy = H / 2f;
    ring(cv, cx, cy, rr, sw, frac, track(d), acc);
    String pct = Math.round(frac * 100f) + "%";
    Paint pp = text(d.ink, rr * 0.62f, SERIF, Paint.Align.CENTER);
    fit(pp, pct, (rr - sw) * 2f * 0.8f, rr * 0.62f, rr * 0.3f);
    if (rr > 13f * u) cv.drawText(pct, cx, centerBase(pp, cy), pp);
    float x0 = cx + rr + sw / 2f + 10f * u;
    float colW = W - x0 - pad;
    Paint n = text(d.ink, H * 0.36f, SERIF, Paint.Align.LEFT);
    fit(n, num, colW, H * 0.36f, H * 0.14f);
    cv.drawText(num, x0, H * 0.52f, n);
    Paint g = text(hit ? d.ok : d.mut, Math.max(H * 0.17f, 9f * u), SANS, Paint.Align.LEFT);
    String sub = hit ? "Goal reached" : "of " + fmt(d.goal) + " steps";
    fit(g, sub, colW, Math.max(H * 0.17f, 9f * u), 7f * u);
    cv.drawText(sub, x0, H * 0.76f, g);
  }

  /* ---------- Today (plan + steps) ---------- */
  private static void drawToday(Canvas cv, Data d, int W, int H, float u) {
    float pad = 16f * u;
    float sw = Math.max(6f * u, H * 0.06f);
    float R = Math.min(H * 0.27f, W * 0.17f);
    float cx = W - pad - R - sw / 2f, cy = H / 2f;
    float frac = d.goal > 0 ? (float) d.steps / d.goal : 0f;
    boolean hit = frac >= 1f;
    ring(cv, cx, cy, R, sw, frac, track(d), hit ? d.ok : d.blue);
    String num = fmt(d.steps);
    Paint n = text(d.ink, R * 0.5f, SERIF, Paint.Align.CENTER);
    float sz = fit(n, num, (R - sw) * 2f * 0.8f, R * 0.52f, R * 0.2f);
    float nb = centerBase(n, cy) - R * 0.06f;
    cv.drawText(num, cx, nb, n);
    Paint st = text(d.mut, R * 0.2f, SANS, Paint.Align.CENTER);
    spaced(st, 0.1f);
    cv.drawText("STEPS", cx, nb + sz * 0.62f, st);

    float left = pad;
    float maxW = cx - R - sw / 2f - pad * 1.2f - left;
    String kicker = d.fresh && d.kicker.length() > 0 ? d.kicker : "TODAY";
    Paint k = text(d.mut, 10.5f * u, SANS, Paint.Align.LEFT);
    spaced(k, 0.1f);
    fit(k, kicker, maxW, 10.5f * u, 8f * u);
    cv.drawText(kicker, left, pad + 11f * u, k);

    boolean known = d.fresh && d.title.length() > 0;
    String title = known ? d.title : "Open Arya Fit";
    Paint t = text(d.ink, 26f * u, SERIF, Paint.Align.LEFT);
    float ts = fit(t, title, maxW, Math.min(H * 0.21f, 27f * u), 14f * u);
    float tb = H * 0.5f + ts * 0.1f;
    cv.drawText(title, left, tb, t);

    String sub;
    if (!known) sub = "to load today's plan";
    else if (d.rest || d.total == 0) sub = "Recovery counts too.";
    else if (d.done >= d.total) sub = "All " + d.total + " done. Well played.";
    else sub = d.done + " of " + d.total + " done";
    Paint s = text(d.mut, 13f * u, SANS, Paint.Align.LEFT);
    fit(s, sub, maxW, 13f * u, 9f * u);
    cv.drawText(sub, left, tb + 19f * u, s);

    if (known && !d.rest && d.total > 0) {
      float bh = 8f * u, top = H - pad - bh;
      Paint tr = p();
      tr.setColor(track(d));
      cv.drawRoundRect(new RectF(left, top, left + maxW, top + bh), bh / 2f, bh / 2f, tr);
      float f = Math.min(1f, (float) d.done / d.total);
      if (f > 0f) {
        Paint fl = p();
        fl.setColor(f >= 1f ? d.ok : d.blue);
        cv.drawRoundRect(new RectF(left, top, left + Math.max(bh, maxW * f), top + bh), bh / 2f, bh / 2f, fl);
      }
    }
  }

  /* ---------- Overview: workout ring, steps ring, streak ---------- */
  private static void drawCombo(Canvas cv, Data d, int W, int H, float u) {
    float pad = 12f * u;
    float tw = (W - pad * 2f) / 3f;
    float D = Math.min(tw * 0.74f, H * 0.56f);
    float r = D / 2f, sw = D * 0.13f;
    float cy = H * 0.46f;
    Paint sep = p();
    sep.setColor((d.line & 0x00FFFFFF) | 0xCC000000);
    sep.setStrokeWidth(1f * u);
    for (int i = 1; i < 3; i++) cv.drawLine(pad + tw * i, H * 0.2f, pad + tw * i, H * 0.8f, sep);

    boolean known = d.fresh && d.total > 0 && !d.rest;
    float cx1 = pad + tw * 0.5f;
    float f1 = known ? Math.min(1f, (float) d.done / d.total) : (d.fresh && d.rest ? 1f : 0f);
    ring(cv, cx1, cy, r, sw, f1, track(d), f1 >= 1f ? d.ok : d.blue);
    String c1 = known ? d.done + "/" + d.total : (d.fresh && d.rest ? "Rest" : "-");
    Paint a = text(d.ink, D * 0.3f, SERIF, Paint.Align.CENTER);
    fit(a, c1, (r - sw) * 2f * 0.82f, D * 0.32f, D * 0.14f);
    cv.drawText(c1, cx1, centerBase(a, cy), a);

    float cx2 = pad + tw * 1.5f;
    float f2 = d.goal > 0 ? (float) d.steps / d.goal : 0f;
    ring(cv, cx2, cy, r, sw, f2, track(d), f2 >= 1f ? d.ok : d.blue);
    String c2 = compact(d.steps);
    Paint b = text(d.ink, D * 0.3f, SERIF, Paint.Align.CENTER);
    fit(b, c2, (r - sw) * 2f * 0.82f, D * 0.32f, D * 0.14f);
    cv.drawText(c2, cx2, centerBase(b, cy), b);

    float cx3 = pad + tw * 2.5f;
    float fh = D * 0.46f, fw = fh * 0.8f;
    Path fp = flame(cx3 - fw / 2f, cy - r - 2f * u, fw, fh);
    Paint fl = p();
    fl.setShader(new LinearGradient(0, cy - r, 0, cy - r + fh, d.sun, 0xFFD9772B, Shader.TileMode.CLAMP));
    cv.drawPath(fp, fl);
    String c3 = String.valueOf(d.streak);
    Paint c = text(d.ink, D * 0.5f, SERIF, Paint.Align.CENTER);
    float sz = fit(c, c3, tw * 0.7f, D * 0.5f, D * 0.2f);
    cv.drawText(c3, cx3, cy + r - sz * 0.02f, c);

    float lb = H - pad - 1f * u;
    Paint l = text(d.mut, Math.max(9f * u, H * 0.075f), SANS, Paint.Align.CENTER);
    spaced(l, 0.1f);
    fit(l, "WORKOUT", tw * 0.9f, Math.max(9f * u, H * 0.075f), 7f * u);
    cv.drawText("WORKOUT", cx1, lb, l);
    cv.drawText("STEPS", cx2, lb, l);
    cv.drawText(d.streak == 1 ? "DAY STREAK" : "DAY STREAK", cx3, lb, l);
  }

  /* ---------- rendering + updating ---------- */
  static Bitmap render(Context ctx, int type, float wdp, float hdp) {
    DisplayMetrics dm = ctx.getResources().getDisplayMetrics();
    float u = dm.density;
    int W = Math.max(40, Math.round(wdp * u)), H = Math.max(40, Math.round(hdp * u));
    while ((long) W * H > 1000000L) {
      u *= 0.85f;
      W = Math.round(wdp * u);
      H = Math.round(hdp * u);
    }
    Bitmap bmp = Bitmap.createBitmap(W, H, Bitmap.Config.ARGB_8888);
    Canvas cv = new Canvas(bmp);
    Data d = load(ctx);
    cardBg(cv, d, W, H, u);
    if (type == STEPS) drawSteps(cv, d, W, H, u);
    else if (type == TODAY) drawToday(cv, d, W, H, u);
    else drawCombo(cv, d, W, H, u);
    return bmp;
  }

  private static String describe(Context c, int type) {
    Data d = load(c);
    if (type == STEPS) return "Steps today: " + d.steps + " of " + d.goal;
    if (type == TODAY) return "Today: " + (d.fresh ? d.title : "open the app") + ". Steps " + d.steps;
    return "Arya Fit overview. Workout " + d.done + " of " + d.total + ", steps " + d.steps + ", streak " + d.streak;
  }

  static void push(Context c, AppWidgetManager m, int id, int type) {
    try {
      Bundle o = m.getAppWidgetOptions(id);
      boolean land = c.getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE;
      float w = o.getInt(land ? AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH : AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0);
      float h = o.getInt(land ? AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT : AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0);
      if (w < 40f || h < 40f) {
        w = type == STEPS ? 150f : 290f;
        h = type == STEPS ? 150f : 130f;
      }
      Bitmap b = render(c, type, w, h);
      RemoteViews rv = new RemoteViews(c.getPackageName(), R.layout.widget_image);
      rv.setImageViewBitmap(R.id.widget_img, b);
      rv.setContentDescription(R.id.widget_img, describe(c, type));
      Intent i = new Intent(c, MainActivity.class);
      i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
      int fl = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
      rv.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(c, 100 + type, i, fl));
      m.updateAppWidget(id, rv);
    } catch (Throwable t) {
      /* never crash the app or the step service because of a widget */
    }
  }

  static void updateAll(Context c) {
    try {
      AppWidgetManager m = AppWidgetManager.getInstance(c);
      Class<?>[] cls = {StepsWidgetProvider.class, TodayWidgetProvider.class, ComboWidgetProvider.class};
      for (int t = 0; t < cls.length; t++) {
        int[] ids = m.getAppWidgetIds(new ComponentName(c, cls[t]));
        for (int id : ids) push(c, m, id, t);
      }
    } catch (Throwable t) {
      /* ignore */
    }
  }

  /** Called whenever steps were added: refreshes the widgets at most once every 45 seconds. */
  static void ping(Context c) {
    long n = System.currentTimeMillis();
    if (n - lastPing < 45000L) return;
    lastPing = n;
    updateAll(c);
  }
}

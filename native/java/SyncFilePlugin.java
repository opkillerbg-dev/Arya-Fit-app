package com.arya.fit;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * One user-chosen sync file (Google Drive, another cloud app, or a local folder) through Android's document picker.
 * The user picks the file once; the app keeps a persistable permission and reads/writes it silently afterwards.
 * No Google account code, no Google Cloud project.
 */
@CapacitorPlugin(name = "SyncFile")
public class SyncFilePlugin extends Plugin {
  private static final String PREF = "arya_sync";
  private static final String KEY = "uri";
  private static final int FLAGS = Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION;

  private SharedPreferences prefs() {
    return getContext().getSharedPreferences(PREF, Context.MODE_PRIVATE);
  }

  private Uri uri() {
    String s = prefs().getString(KEY, null);
    return s == null ? null : Uri.parse(s);
  }

  private String nameOf(Uri u) {
    String n = "";
    Cursor c = null;
    try {
      c = getContext().getContentResolver().query(u, new String[] {OpenableColumns.DISPLAY_NAME}, null, null, null);
      if (c != null && c.moveToFirst()) n = c.getString(0);
    } catch (Throwable t) {
      n = "";
    } finally {
      if (c != null) c.close();
    }
    return n == null ? "" : n;
  }

  @PluginMethod
  public void status(PluginCall call) {
    Uri u = uri();
    JSObject r = new JSObject();
    r.put("linked", u != null);
    r.put("name", u == null ? "" : nameOf(u));
    call.resolve(r);
  }

  /** mode "create" = save a new file somewhere, mode "open" = pick an existing sync file (new phone). */
  @PluginMethod
  public void pick(PluginCall call) {
    boolean open = "open".equals(call.getString("mode", "create"));
    Intent i = new Intent(open ? Intent.ACTION_OPEN_DOCUMENT : Intent.ACTION_CREATE_DOCUMENT);
    i.addCategory(Intent.CATEGORY_OPENABLE);
    i.setType(open ? "*/*" : "application/json");
    if (!open) i.putExtra(Intent.EXTRA_TITLE, "arya-fit-sync.json");
    i.addFlags(FLAGS | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
    startActivityForResult(call, i, "pickResult");
  }

  @ActivityCallback
  private void pickResult(PluginCall call, ActivityResult result) {
    if (call == null) return;
    if (result == null || result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
      call.reject("cancelled");
      return;
    }
    Uri u = result.getData().getData();
    try {
      getContext().getContentResolver().takePersistableUriPermission(u, FLAGS);
    } catch (Throwable t) {
      call.reject("could not keep access to that file");
      return;
    }
    prefs().edit().putString(KEY, u.toString()).apply();
    JSObject r = new JSObject();
    r.put("linked", true);
    r.put("name", nameOf(u));
    call.resolve(r);
  }

  @PluginMethod
  public void read(PluginCall call) {
    Uri u = uri();
    if (u == null) { call.reject("no file linked"); return; }
    InputStream in = null;
    try {
      in = getContext().getContentResolver().openInputStream(u);
      if (in == null) { call.reject("cannot open file"); return; }
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      byte[] buf = new byte[16384];
      int n, total = 0;
      while ((n = in.read(buf)) > 0) {
        total += n;
        if (total > 20 * 1024 * 1024) { call.reject("file too large"); return; }
        out.write(buf, 0, n);
      }
      JSObject r = new JSObject();
      r.put("text", new String(out.toByteArray(), StandardCharsets.UTF_8));
      call.resolve(r);
    } catch (SecurityException e) {
      call.reject("permission lost");
    } catch (Throwable t) {
      call.reject("read failed");
    } finally {
      try { if (in != null) in.close(); } catch (Throwable ignore) { }
    }
  }

  @PluginMethod
  public void write(PluginCall call) {
    Uri u = uri();
    if (u == null) { call.reject("no file linked"); return; }
    String text = call.getString("text", "");
    OutputStream os = null;
    try {
      try {
        os = getContext().getContentResolver().openOutputStream(u, "wt");
      } catch (Throwable first) {
        os = getContext().getContentResolver().openOutputStream(u, "w");
      }
      if (os == null) { call.reject("cannot open file"); return; }
      os.write(text.getBytes(StandardCharsets.UTF_8));
      os.flush();
      call.resolve();
    } catch (SecurityException e) {
      call.reject("permission lost");
    } catch (Throwable t) {
      call.reject("write failed");
    } finally {
      try { if (os != null) os.close(); } catch (Throwable ignore) { }
    }
  }

  @PluginMethod
  public void unlink(PluginCall call) {
    Uri u = uri();
    if (u != null) {
      try { getContext().getContentResolver().releasePersistableUriPermission(u, FLAGS); } catch (Throwable ignore) { }
    }
    prefs().edit().remove(KEY).apply();
    call.resolve();
  }
}

package com.arya.fit;

import android.content.Context;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.os.Build;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Arya Fit v99: one place for how the app speaks. Used by RunEnginePlugin (app open) and RunService (screen off).
 * The person can pick any installed text-to-speech ENGINE (for example the open-source SherpaTTS or VoxSherpa, which run Piper-style
 * neural voices offline), a VOICE inside it, and the speed. Stored in pref arya_voice. If the chosen engine is missing or fails to start,
 * it falls back to the phone's default engine, so cues never go silent because of a removed app.
 * While a cue plays, music is ducked (audio focus) and the speech uses the navigation-guidance audio usage, like a maps app.
 */
final class VoiceKit {
  private VoiceKit() {}

  static final String PREF = "arya_voice";

  interface Ready {
    void onReady(TextToSpeech t, boolean ok);
  }

  static SharedPreferences sp(Context c) {
    return c.getSharedPreferences(PREF, Context.MODE_PRIVATE);
  }

  static String engine(Context c) {
    return sp(c).getString("engine", "");
  }

  static String voice(Context c) {
    return sp(c).getString("voice", "");
  }

  static int ratePct(Context c) {
    int r = sp(c).getInt("rate", 95);
    return Math.max(50, Math.min(160, r));
  }

  /** Creates a TextToSpeech bound to the chosen engine, falling back to the default engine. */
  static void create(final Context c, final Ready cb) {
    final String eng = engine(c);
    if (eng.length() == 0) {
      plain(c, cb);
      return;
    }
    try {
      final TextToSpeech[] box = new TextToSpeech[1];
      box[0] = new TextToSpeech(c, new TextToSpeech.OnInitListener() {
        @Override
        public void onInit(int status) {
          if (status == TextToSpeech.SUCCESS && box[0] != null) {
            apply(c, box[0]);
            cb.onReady(box[0], true);
          } else {
            try {
              if (box[0] != null) box[0].shutdown();
            } catch (Exception e) {
              // ignore
            }
            plain(c, cb);
          }
        }
      }, eng);
    } catch (Exception e) {
      plain(c, cb);
    }
  }

  private static void plain(final Context c, final Ready cb) {
    try {
      final TextToSpeech[] box = new TextToSpeech[1];
      box[0] = new TextToSpeech(c, new TextToSpeech.OnInitListener() {
        @Override
        public void onInit(int status) {
          boolean ok = status == TextToSpeech.SUCCESS && box[0] != null;
          if (ok) apply(c, box[0]);
          cb.onReady(box[0], ok);
        }
      });
    } catch (Exception e) {
      cb.onReady(null, false);
    }
  }

  /** Language, chosen voice, speed and audio usage. Safe to call again after the settings change. */
  static void apply(Context c, TextToSpeech t) {
    if (t == null) return;
    try {
      t.setLanguage(Locale.US);
    } catch (Exception e) {
      // engine may not offer US English; the chosen voice below decides then
    }
    String vn = voice(c);
    if (vn.length() > 0 && Build.VERSION.SDK_INT >= 21) {
      try {
        Set<Voice> vs = t.getVoices();
        if (vs != null) {
          for (Voice v : vs) {
            if (vn.equals(v.getName())) {
              t.setVoice(v);
              break;
            }
          }
        }
      } catch (Exception e) {
        // keep the engine default
      }
    }
    try {
      t.setSpeechRate(ratePct(c) / 100f);
      t.setPitch(1.0f);
    } catch (Exception e) {
      // ignore
    }
    if (Build.VERSION.SDK_INT >= 21) {
      try {
        t.setAudioAttributes(new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
            .build());
      } catch (Exception e) {
        // ignore
      }
    }
  }

  /** Speaks one cue (replacing any cue still playing) and ducks music while it plays. */
  @SuppressWarnings("deprecation")
  static void speak(Context c, TextToSpeech t, String text, String id) {
    if (t == null || text == null || text.length() == 0) return;
    final AudioManager am = (AudioManager) c.getSystemService(Context.AUDIO_SERVICE);
    try {
      if (am != null) am.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK);
    } catch (Exception e) {
      // ignore
    }
    try {
      t.setOnUtteranceProgressListener(new UtteranceProgressListener() {
        @Override
        public void onStart(String utteranceId) {
        }

        @Override
        public void onDone(String utteranceId) {
          release(am);
        }

        @Override
        public void onError(String utteranceId) {
          release(am);
        }
      });
    } catch (Exception e) {
      // ignore
    }
    t.speak(text, TextToSpeech.QUEUE_FLUSH, null, id);
  }

  @SuppressWarnings("deprecation")
  private static void release(AudioManager am) {
    try {
      if (am != null) am.abandonAudioFocus(null);
    } catch (Exception e) {
      // ignore
    }
  }

  private static boolean wanted(String lang) {
    return "en".equals(lang) || "hi".equals(lang) || "gu".equals(lang);
  }

  /** Engines installed on the phone and the voices of the engine t is bound to (English, Hindi, Gujarati only, to keep the list short). */
  static JSONObject list(Context c, TextToSpeech t) throws Exception {
    JSONObject o = new JSONObject();
    JSONArray en = new JSONArray();
    JSONArray vo = new JSONArray();
    if (t != null) {
      List<TextToSpeech.EngineInfo> es = t.getEngines();
      if (es != null) {
        for (TextToSpeech.EngineInfo e : es) {
          JSONObject j = new JSONObject();
          j.put("name", e.name);
          j.put("label", e.label);
          en.put(j);
        }
      }
      o.put("defaultEngine", t.getDefaultEngine());
      if (Build.VERSION.SDK_INT >= 21) {
        Set<Voice> vs = t.getVoices();
        if (vs != null) {
          for (Voice v : vs) {
            String lang = v.getLocale() == null ? "" : v.getLocale().getLanguage();
            if (!wanted(lang)) continue;
            JSONObject j = new JSONObject();
            j.put("name", v.getName());
            j.put("lang", v.getLocale().toLanguageTag());
            j.put("q", v.getQuality());
            j.put("net", v.isNetworkConnectionRequired());
            vo.put(j);
          }
        }
      }
    }
    o.put("engines", en);
    o.put("voices", vo);
    o.put("engine", engine(c));
    o.put("voice", voice(c));
    o.put("rate", ratePct(c));
    return o;
  }
}

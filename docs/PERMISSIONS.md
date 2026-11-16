# AERUNO permissions inventory (task T05)

Written 2026-11-16 from repo v150. **Nothing was removed or changed.** Items marked "check before removing" need a device test (task T07) and the owner's OK.

## How reliable this list is
- VERIFIED = read directly in this repo (`tools/patch-manifest.sh`, `tools/patch_widgets.py`, `tools/patch_icons.py`, `native/java/*`, `web/js/*`).
- NOT VERIFIED = permissions and components that Capacitor itself and the plugins add when the APK is built (`@capacitor/local-notifications`, `@capacitor-community/background-geolocation`, `@capacitor/haptics`, `@capacitor/share`, `@capacitor/filesystem`). Their manifests are not in the repo, so they cannot be listed here. The authoritative list is the merged manifest inside the built APK (task T16 prints it in the CI run summary).

## A. Permissions the repo declares on purpose (VERIFIED, 13)
Source: `tools/patch-manifest.sh`. "Prompt" says what the user sees.

| Permission | Prompt | Used for | If denied / notes |
|---|---|---|---|
| `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` | Yes, location dialog | GPS distance, pace and route for runs and walks (`RunEnginePlugin`, `RunService`). Weather uses coordinates the user opted into | Run still times, but no distance or route. Coarse is declared because Android 12+ asks for both |
| `ACCESS_BACKGROUND_LOCATION` | Would be "Allow all the time"; **no request for it found in repo code** | Keeping GPS during a run with the screen off | **Check before removing.** A run already uses a location foreground service, which usually does not need this permission. Removing it would also make a future Google Play review simpler. The fallback plugin (`@capacitor-community/background-geolocation`, used only when the native engine is missing) may ask for it |
| `FOREGROUND_SERVICE` | No | Allows the two foreground services below | Required for them |
| `FOREGROUND_SERVICE_LOCATION` | No | Run tracking service, type `location` (`.RunService`) | Required on Android 14+ for that service |
| `FOREGROUND_SERVICE_HEALTH` | No | Step counting service, type `health` (`.StepsPlugin$Svc`) | Required on Android 14+. Steps need `ACTIVITY_RECOGNITION` too |
| `ACTIVITY_RECOGNITION` | Yes, "Physical activity" | Step counter and step history (`StepsPlugin`, also asked by `RunEnginePlugin`) | No step counting; run and plan still work |
| `POST_NOTIFICATIONS` | Yes, Android 13+ | Run-in-progress notification, reminders, nudges, goal alert (`RunEnginePlugin`, `StepsPlugin`, `nudges.js`, `run-extras.js`, `timers-run.js`). The step-service notification itself is hidden on purpose (blocked channel `arya_steps_off`) | Reminders and nudges do not show. A denied permission also hides the run notification, which can make some phones stop the run service sooner (test on device) |
| `SCHEDULE_EXACT_ALARM` | No prompt; special access "Alarms & reminders" (Android 12+) | Daily reminder and nudges are scheduled with `allowWhileIdle: true` (`nudges.js`, `run-extras.js`) | **Check before removing.** No direct use in repo code; the local-notifications plugin decides how to use it. On Android 14+ it is usually not granted by default, so reminders may arrive a little late. Google Play restricts this permission to alarm and calendar apps, so a Play release may need it removed or justified |
| `RECEIVE_BOOT_COMPLETED` | No | Restart step counting after reboot or app update (`.StepsPlugin$Boot`) | Steps stop after reboot until the app is opened |
| `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | Yes, system dialog when the user taps the battery option (`StepsPlugin` line ~177) | Lets steps and runs survive aggressive battery savers | Optional. **Google Play restricts this permission**; a Play release may need to switch to opening the battery settings page instead |
| `VIBRATE` | No | Haptics and run cues (`RunService`, `@capacitor/haptics`) | none |
| `WAKE_LOCK` | No | **No direct use found in repo code** | **Check before removing.** A plugin or service may need it |

## B. Added by the template or plugins (NOT VERIFIED, expected)
- `INTERNET` (Capacitor template). Used by exactly these things in repo code: weather forecast `api.open-meteo.com` (opt-in), the online exercise library from `raw.githubusercontent.com` or `cdn.jsdelivr.net` (opt-in download), and Google Fonts CSS `fonts.googleapis.com` loaded at start in the classic look (`web/index.html` line 16). Everything else works offline.
- Local notifications plugin: its own receivers and, usually, the notification and alarm permissions above.
- Share plugin: a file provider for sharing run files and backups.
- Anything else: see the merged manifest (T16).

## C. Components the repo adds (VERIFIED)
| Component | Type | Exported | Purpose |
|---|---|---|---|
| `.RunService` | foreground service, `location` | no | Keeps a run alive with the screen off |
| `.StepsPlugin$Svc` | foreground service, `health` | no | Step counting in the background |
| `.StepsPlugin$Boot` | receiver, `BOOT_COMPLETED` and `MY_PACKAGE_REPLACED` | yes (system broadcasts) | Restarts step counting after reboot or update |
| `.StepsWidgetProvider`, `.TodayWidgetProvider`, `.ComboWidgetProvider` | app widget receivers | yes (required for widgets) | Home-screen widgets (Steps, Today, Overview) |
| activity aliases from `tools/patch_icons.py` | launcher aliases | yes | Launcher icon switcher (`AppIconPlugin`) |
| `<queries>` for `android.intent.action.TTS_SERVICE` | package visibility | n/a | Lists installed text-to-speech engines for voice cues |

## D. Plain-words summary (reusable for a privacy note or Google Play "Data safety")
- Location: only during a run or walk the user starts, and only when the user opts into weather. Stored on the phone. Weather sends rounded coordinates to Open-Meteo.
- Physical activity: step count, stored on the phone.
- Notifications: reminders and run status.
- No accounts, no analytics found in the repo code, no ads. Data stays on the device except the opt-in requests listed in section B and backup files the user chooses to share.
- (The "no analytics" line is based on this repo's scripts only. Confirm against the merged manifest and plugin list before publishing anywhere.)

## E. Candidates to simplify later (needs T07 device test + owner OK, esp. before Google Play)
1. `ACCESS_BACKGROUND_LOCATION`: probably removable.
2. `SCHEDULE_EXACT_ALARM`: restricted on Play; decide between inexact reminders and exact alarms.
3. `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`: restricted on Play; replace by a link to battery settings.
4. `WAKE_LOCK`: find out who uses it.
5. Google Fonts at start-up: bundling the font would remove the one network call that happens without the user's consent (check it is really cached and whether V2 already avoids it).

# AERUNO brand

- Public name: **AERUNO** (tagline: Personal Fitness. Move · Track · Progress).
- Mark: the AF monogram, traced from the owner's artwork into `aeruno-mark.svg` (black) / `aeruno-mark-white.svg` (white on black). Same path is used by the splash (`web/index.html`), icon picker (`web/js/features/appicon.js`), drawer (`web/js/core/native-ui.js`), launcher icons (`tools/icons/variants.json` -> `python3 tools/icons/make_icons.py`) and the notification icon (`native/res/drawable/ic_stat_arya.xml`).
- Wordmark: Inter Bold (`Arya UI`) caps, wide tracking on the splash.
- Internal codenames stay `arya`/`ax-`: app id `com.arya.fit`, storage key `aryaApp2`, sync marker `arya-fit-sync`, font family names. Do NOT rename them: it would reset users' data / break old backups.

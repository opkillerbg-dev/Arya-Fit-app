# Arya Fit

A personal workout app: plans, strength days, run/walk intervals, step counter, progress, and a plan builder.
Plain HTML/CSS/JS (no framework) wrapped as an Android app with Capacitor 6. GitHub Actions builds the APK.

## Repo layout

```
web/                  the whole app, served as-is (Capacitor webDir)
  index.html          markup, core styles, core logic
  sw.js, manifest.webmanifest
  css/                liquid.css (glass look, only paint)
  js/boot.js          loading screen, loaded last
  js/ui/              settings hub, home layout, motion
  js/features/        one file per feature (readiness, progression, hands-free, animate,
                      weekly card, body heatmap, swap, backup, library, route map, plan builder)
  icons/              app icons (192, 512, maskable)
  images/             hero, anatomy atlas, exercise pictures + masks
native/               Android side, copied into the generated project by CI
  java/               MainActivity, RunService, RunEnginePlugin, StepsPlugin
  res/                splash and adaptive-icon resources
tools/                CI helpers: check-web.py, android-setup.sh, patch-manifest.sh, patch_splash.py, patch_icons.py
                      icons/ = logo generator (make_icons.py + variants.json), run it to rebuild all icons
signing/debug.keystore  fixed debug key so every build has the same signature (do not delete or replace)
docs/                 HANDOFF.md (state, rules, change log), THIRD-PARTY-NOTICES.md
.github/workflows/build.yml   builds the APK on every push
```

## Update the repo (one file)

Upload a single `update.zip` (repo files at the zip root, optional `DELETE.txt` listing paths to remove) to the repo root. `.github/workflows/apply-update.yml` unpacks it into the right folders, commits, deletes the zip and starts the build. Workflow files themselves must still be edited by hand.

## Build

Push to `main`. Actions > latest run > Artifacts > `arya-fit-apk`. Install over the old app (export a backup first: Settings > Data & backup).
`android/` is generated in CI and is not committed.

## Add a feature

1. Put the file in `web/js/features/` (or `web/js/ui/`).
2. Add one `<script src="js/features/yourfile.js"></script>` line to `web/index.html`, before `boot.js`. Order matters.
3. Nothing else: the build copies all of `web/`, and `tools/check-web.py` fails the build with a clear message if `index.html`, `sw.js` or the manifest point at a missing file.

Bump the cache name in `web/sw.js` (`arya-vNN`) and the version label in `index.html` when you ship.

## Licenses

See `docs/THIRD-PARTY-NOTICES.md`.

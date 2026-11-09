# Wedding Invitation

Static Telugu-English wedding invitation for Pudari Madhukar and Budde Thanasri.

## Android debug APK

This repository packages the invitation as an Android app with Capacitor. The web invitation remains the source of truth; the build script copies `index.html`, `style.css`, `script.js`, `music.mp3`, and `images/` into the Capacitor `www/` directory.

The GitHub Actions workflow is at `.github/workflows/build-debug-apk.yml`. It runs automatically on pushes to `main` and can also be started manually from the **Actions** tab using **Run workflow**.

After a successful run, open the workflow run and download the artifact named **wedding-invitation-debug-apk**. The APK file inside is `app-debug.apk`.

For local Android project generation:

```bash
npm ci
npm run cap:add:android
cd android
./gradlew assembleDebug
```

The generated `android/` and `www/` folders are intentionally ignored because the workflow creates them from the current web source on every run.

# Luma native app

React Native + Expo SDK **57.0.30**, React Native **0.86.3**, React/React DOM **19.2.3**. Native components, Gesture Handler, Reanimated **4.5.1** and Worklets **0.10.1**; no WebView. Expo Router is **57.0.28** and TypeScript is **6.0.3**. The exact installed dependency graph is recorded in `package-lock.json`.

## Run on Windows / PowerShell

```powershell
Set-Location -LiteralPath 'D:\luma-—-gallery-cleaner\expo-project'
npm.cmd ci
npx.cmd expo start --dev-client --clear
```

Install a newly built development client before scanning its QR code. It must include SDK 57's `ExpoMediaLibraryNext`, video, font, image-picker and system UI modules. Full gallery access requires this client or the standalone preview APK. Web has an honest unsupported-gallery state and a separately selected demo. Expo Go 57.0.9 on the connected Redmi does not include `ExpoMediaLibraryNext`.

For Expo Go screen previews, use its launch target explicitly. A tunnel avoids local Wi-Fi routing or Windows firewall restrictions:

```powershell
npx.cmd expo start --go --tunnel --port 8082 --max-workers 2
```

Open the new QR code in Expo Go. If the client lacks `ExpoMediaLibraryNext`, Luma shows a development-build message and leaves Demo mode as an explicit choice; personal media is never silently replaced with samples.

For web:

```powershell
npx.cmd expo start --web --clear
```

## Android development APK with EAS

The `development` profile in `eas.json` enables a development client, internal distribution and APK output. This project is linked to [`@ayuglows-team/luma-gallery-cleaner`](https://expo.dev/accounts/ayuglows-team/projects/luma-gallery-cleaner), ID `c1225fdc-c3d0-4c47-9aee-a31c9c09289e`. EAS manages its Android signing keystore. Use an Expo account with access to that team:

```powershell
Set-Location -LiteralPath 'D:\luma-—-gallery-cleaner\expo-project'
$env:EAS_NO_VCS = '1' # This workspace currently has no Git repository.
npx.cmd eas-cli@25.2.0 whoami
npx.cmd eas-cli@25.2.0 build --platform android --profile development
```

Install the resulting APK on your phone, stop any existing Expo server with Ctrl+C, then run:

```powershell
npx.cmd expo start --dev-client --clear
```

If local networking prevents the phone from reaching Metro, use `npx.cmd expo start --dev-client --tunnel --clear`. Run `npx.cmd eas-cli@25.2.0 login` first if needed. Team linking and Android signing setup are complete. A standalone preview build has been submitted; its completion and APK installation remain unverified. See [GALLERY_VALIDATION.md](GALLERY_VALIDATION.md) for the build link and actual results.

Build a standalone preview APK, with the JavaScript bundle included and no Metro server required:

```powershell
npx.cmd eas-cli@25.2.0 build --platform android --profile preview
```

Open each EAS build's APK link on the phone and install it. For USB installation, download the APKs into your Downloads folder with the names used below:

```powershell
$lumaAdb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $lumaAdb devices
& $lumaAdb install -r "$env:USERPROFILE\Downloads\luma-development.apk"
npx.cmd expo start --dev-client --tunnel --port 8082 --max-workers 2
```

For the standalone preview, stop Metro if desired, then install and open the app:

```powershell
& $lumaAdb install -r "$env:USERPROFILE\Downloads\luma-preview.apk"
& $lumaAdb shell am start -n 'com.luma.cleaner/.MainActivity'
```

Both profiles are explicit APK builds. `development` enables the development client; `preview` explicitly disables it and uses a release bundle. The npm build scripts invoke the pinned EAS CLI and do not require a global `eas` installation.

For a local Android development build, with Android Studio, Android SDK and the template-compatible JDK installed:

```powershell
npx.cmd expo run:android --variant debug
```

Do not use `--force` or `--legacy-peer-deps` when installing dependencies.

## Verification

```powershell
npm.cmd run typecheck
npm.cmd test
npx.cmd expo install --check
npx.cmd expo config --type public
npx.cmd expo-doctor
npm.cmd run export:android
npm.cmd run export:web
```

An export proves that JavaScript and assets bundle; it does not prove a compiled APK or device behavior. See `GALLERY_VALIDATION.md` for the current gallery checks and device-testing limits.

## Data and deletion behavior

- Device and demo libraries have separate bookmarks, statistics, decisions and sessions.
- A left swipe only marks media. Review submits selected device originals through SDK 57 `Asset.delete`, awaiting the operating system’s confirmation on Android 11+ and iOS. Android 10 and older cannot enter the SDK's legacy direct-filesystem deletion path: deletion is disabled, review explains why, and Keep everything remains available. This also applies to the connected Android 10 Redmi. Luma never bypasses native confirmation.
- Bookmarked media cannot be submitted from Luma’s deletion queue. Another app or the system gallery can still change it.
- Every decision, undo, setting and bookmark is saved through a serialized local storage queue. Keep-only sessions also update activity and streaks.
- Deletion intent is saved before the native prompt. An interrupted prompt is reported as unverified; it does not create a success receipt.
- Only confirmed deletions contribute to deleted totals. Reclaimed bytes include known sizes only; unavailable sizes are reported separately.
- Similar/burst categories use metadata and filename hints for manual review. They are not an AI duplicate/blur verdict. Photos and Screenshots are disjoint in the distribution chart.
- Native media change events refresh the gallery and albums, coalescing bursts and retaining the active card until the new catalog is ready. Refreshes wait while backgrounded, reviewing deletions, picking media or awaiting native confirmation. Returning from device Settings checks permissions again. Revoked access clears displayed originals and never opens demo mode.
- Limited access uses SDK 57 `presentPermissionsPicker` and only loads authorized assets. Date timestamps remain milliseconds; video durations are converted from milliseconds to display seconds. Android picker IDs resolve to original MediaStore content URIs, never picker cache copies.
- Both the active swipe card and cards behind it explicitly use centered `contain` images. Portrait, landscape and square images retain their aspect ratio without cropping or stretching. Collection thumbnails keep the approved layout.
- Demo media comes from the approved preview’s 55-item sample set. Sample deletions and savings are simulated, and remote samples require a connection. Personal gallery failures never load samples automatically.
- Reset removes only the current library’s Luma records. It does not delete gallery media or call `AsyncStorage.clear()`.

Generated Android files were inspected, backed up under `.repair-baseline/android-before-ui`, and regenerated from SDK 57. The existing ProGuard rules are retained. `android/`, `ios/`, `.expo/`, exports and repair backups are ignored. No Git commit can be created here until the folder is a Git repository.

## Audit

Scoped CommonJS-compatible `uuid@11.1.1` overrides cover `xcode` and `@expo/ngrok`; the project-ID generation regression check exercises the installed Xcode tooling. Audit findings decreased from 30 to 21 (18 high, 3 moderate). Remaining findings originate in `braces@3.0.3`, `node-forge@1.4.0` and `decode-uri-component@0.2.2` and propagate through SDK tooling/Router. The registry currently has no patched braces/forge release. Decoder 0.5.0 is ESM-only and is not a drop-in replacement for Router’s CommonJS query-string dependency. Audit’s SDK downgrade/SDK 58 suggestions were rejected to retain SDK 57. No force fix was used.

## Device acceptance still required

Android/iOS full, limited and denied permissions; permission changes while backgrounded; very large libraries and cloud-only assets; real album membership; native image/video decoding and playback; pan responsiveness and haptics; safe areas, large text and keyboard layouts; cancellation and confirmation of native deletion; device storage measurements; process death around the system prompt; launcher/native splash appearance; and installed development-client launch remain unverified. On 2026-10-21, Luma loaded through Expo Go 57 on a USB-connected Redmi Note 7S (Android 10), and its Home screen was captured. A team EAS preview build was subsequently submitted and reached native Gradle compilation, with Expo Doctor 21/21 passed in the cloud. Permission for its next status check was denied. APK completion, download, installation and real gallery/deletion success are not claimed.

# Luma Gallery Cleaner

Luma combines a forest-green and ivory interface with photo swiping, bookmarks, saved cleanup progress, and review before deletion.

- `expo-project/` contains the native React Native app on **Expo SDK 57.0.30**, React Native **0.86.3**, and React **19.2.3**.
- The root `src/` contains the approved Vite web preview. The native app uses React Native components, without a WebView.

## Native app — PowerShell

```powershell
git clone https://github.com/designerclarigo/Luma-Gallery-Cleaner.git
Set-Location .\Luma-Gallery-Cleaner\expo-project
npm.cmd ci
npx.cmd expo start --go --tunnel --max-workers 2
```

Scan the QR code in Expo Go to preview the screens. Full gallery access requires a Luma development or standalone preview APK containing the native gallery module. Demo mode is an explicit choice; gallery failures do not load sample photos automatically.

## Android APKs

From `expo-project`, use an Expo account with access to `ayuglows-team`:

```powershell
npx.cmd eas-cli@25.2.0 login
npm.cmd run build:preview:android
```

The preview APK includes its JavaScript bundle and runs without Metro. For a development client:

```powershell
npm.cmd run build:dev:android
# Install the resulting development APK, then:
npm.cmd run start:dev-client
```

Swiping left only marks media. Deletion requires review and native confirmation. With the current SDK implementation, Luma disables deletion on Android 10 and older; supported native confirmation requires Android 11+ or iOS.

See [native setup and installation](expo-project/README.md) and [actual gallery validation](expo-project/GALLERY_VALIDATION.md) for build status and device-testing limits.

## Web preview — PowerShell

From the repository root:

```powershell
npm.cmd ci
npm.cmd run dev
```

## Checks

```powershell
# Repository root — approved web preview
npm.cmd run lint
npm.cmd run build

# Native app
Set-Location .\expo-project
npm.cmd run typecheck
npm.cmd test
npx.cmd expo-doctor
npm.cmd run export:android
npm.cmd run export:web
```

Keep the root and native dependency installations separate; each project has its own npm lockfile. Generated dependencies, Expo state, native build directories, local credentials, and build output are excluded from version control.

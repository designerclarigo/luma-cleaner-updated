# Native gallery setup

Luma's runnable native app is in `expo-project`. It uses Expo SDK 57 and the SDK-compatible `expo-media-library` 57.0.5 class API. There is no sample gallery, browser gallery simulation, or custom dialog impersonating system deletion approval.

## Configuration

`app.json` uses the official `expo-media-library` config plugin with photo/video granular permissions, iOS photo-library purpose strings and `preventAutomaticLimitedAccessAlert: true`. Luma provides its own action to manage selected-photo access. Android 14's `READ_MEDIA_VISUAL_USER_SELECTED` is declared; legacy read/write storage permissions are capped at API 32 by Expo's generated manifest.

`MANAGE_MEDIA`, `MANAGE_EXTERNAL_STORAGE`, audio access and media-location access are blocked. Luma does not request all-files access or permission to bypass OS deletion approval. No generated Android or iOS files are edited manually. Changes persist through Expo prebuild/CNG; a new native build is required after changing this configuration.

## Build and run

```powershell
Set-Location -LiteralPath 'D:\luma-—-gallery-cleaner\expo-project'
npm.cmd ci
npm.cmd run build:dev:android
npx.cmd expo start --dev-client --tunnel --port 8082 --max-workers 1
```

Install the APK from the EAS build page, then open the Metro development-client QR in **Luma's development client**. Expo Go is not the acceptance environment for this gallery implementation. For a local Android build with the Android SDK and a compatible JDK, use `npx.cmd expo run:android`.

For a physical iPhone, configure Apple signing and register the device with EAS, then run `npm.cmd run build:dev:ios`. Install the provisioned development build and connect to Metro. On a Mac with Xcode, `npx expo run:ios --device` is the local alternative.

`npm.cmd run build:dev:ios:simulator` uses the `development-simulator` EAS profile. Install that build in an iOS Simulator on a Mac. Simulator checks cannot prove physical-device permission, iCloud or deletion-dialog behavior.

To test a release-like Android build with bundled JavaScript, use `npm.cmd run build:preview:android`. A development client loads the current JavaScript from Metro; it must not be confused with a standalone preview APK.

## Runtime behavior

- Opening the app checks permission without prompting. Connect requests read/write photo/video access. Full, limited, category-only Android access and permanent denial have separate states. Selected access opens the native selection manager; denied access that cannot be requested again opens device Settings.
- Metadata loads in pages of 100. Originals retain their native MediaStore/Photos identifiers. iCloud originals are not downloaded during collection discovery. Only the active iOS video resolves a playable original.
- Native library events and foreground transitions refresh media and albums. Refreshes pause during a system operation or picker, while permission changes can update an open review. Removed media is dropped from the selection without reselecting previously deselected items.
- Keep, Undo and Bookmarks use the same original identifiers. Swipe photos use centered `contain`, preserving the entire photo's proportions.
- A left swipe marks media. Review filters inaccessible and bookmarked originals. Luma persists deletion intent before invoking `Asset.delete` and counts only completed native batches. Cancellation/error leaves remaining marks available. Android requests contain at most 2,000 URIs and stop after a cancelled or failed batch.
- Android 11+ uses `MediaStore.createDeleteRequest`, whose result arrives after the OS operation completes. iOS uses PhotoKit's `performChanges`/`PHAssetChangeRequest.deleteAssets`. The OS controls the confirmation UI and recovery behavior; Luma cannot guarantee a Trash retention period or recover permanently deleted originals.
- Android 10 and older can browse and organize, but deletion is blocked: this SDK's legacy deleter directly removes files without the required system confirmation. Luma never enters that path.
- Web shows **Use the native app** and an empty library. No demo action, seeded photo catalog, simulated permission, deletion receipt or storage saving is available. Legacy sample records stay archived and never merge into device activity.

## Validation

See [NATIVE_GALLERY_CHECKS.md](NATIVE_GALLERY_CHECKS.md) for actual automated, build and device results. Tests mock OS boundaries; exports prove bundling, not native dialog interaction. Use disposable, personally approved test media for a physical deletion acceptance test.

References: [Expo SDK 57 MediaLibrary](https://docs.expo.dev/versions/v57.0.0/sdk/media-library/), [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/), [Android MediaStore](https://developer.android.com/reference/android/provider/MediaStore), [Apple PhotoKit changes](https://developer.apple.com/documentation/photos/phphotolibrary/performchanges(_:completionhandler:)).

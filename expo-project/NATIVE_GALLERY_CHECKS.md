# Device gallery checks — 22 October 2026

This is the current record. [GALLERY_VALIDATION.md](GALLERY_VALIDATION.md) is historical. Installation, configuration and Android/iOS build commands are in [NATIVE_GALLERY_SETUP.md](NATIVE_GALLERY_SETUP.md).

## Metro resolution repair

The reported `expo-modules-core/src/index.ts/index(...)` error pointed to a real, installed SDK 57.0.24 entry file. A fresh live request resolved it successfully. Metro was restarted from `expo-project`; its file-map cache is now local to this project and keyed by the lockfile and Node version, preventing reuse across dependency/runtime changes. `npm run start:clean` is available here, with `npm run expo:start:clean` at the repository root.

After the change, the **live web bundle returned HTTP 200 (11,912,326 bytes)** and the **live Android bundle returned HTTP 200 (13,858,517 bytes)**. Metro logged successful web/Android bundling and the web application's startup. TypeScript, the CNG configuration test and `git diff --check` passed. This repair changes development caching/start commands, not the native gallery UI or deletion behavior.

## Implemented

- Expo **57.0.31**, Router **57.0.29**, React Native **0.86.3**, MediaLibrary **57.0.5**. Only SDK 57 patch updates were installed; no forced dependency resolution or major upgrade.
- Real photos/videos through `Query`, `Asset` and `Album`; 100-item metadata pages, progressive display, authorized scope, native identifiers and foreground/library-change refresh.
- Full, limited, Android category-only, denied, permanently denied, missing-module, empty and failure states. Selected access has a native permission-manager action. Permanent denial opens device Settings. Access is checked again immediately before deletion.
- Keep, Undo, protected Bookmarks and review use original identifiers. Entire swipe photos retain centered `contain`. The original four-step onboarding and native design remain intact.
- Deletion uses the installed SDK's OS-backed `Asset.delete`: Android 11+ `MediaStore.createDeleteRequest` and iOS PhotoKit changes. Android batches are capped at 2,000 URIs; cancellation/failure stops later batches and only completed earlier batches count. Known native cancellation signals are distinguished from permission/system failures; unknown errors remain failures.
- iOS preflight checks selected originals without downloading iCloud files. Duplicate requests are blocked. Pending intent is saved before native execution, and an interrupted intent never creates a fabricated receipt.
- Android 10 and older remain unable to delete through Luma because this SDK's legacy implementation directly deletes files without the required OS confirmation. Browsing, reviewing, keeping and bookmarks remain available.
- The native sample catalog and all demo-mode actions are removed. Existing demo-mode installations reopen the device library. Old sample statistics/bookmark metadata stay archived and never merge into real activity. The older Vite preview also no longer seeds photos, pretends to grant permissions or renders a simulated system-delete dialog.
- The official Expo config plugins persist native permissions through CNG. Generated manifests include selected-photo access and capped legacy permissions, block all-files/manage-media/audio/location access, and set the iOS usage strings and limited-access flag.

## Actual checks

| Check | Result |
| --- | --- |
| Native TypeScript | Passed |
| Native automated tests | **70 passed, 0 failed**; OS boundaries mocked |
| Expo Doctor | **21/21 passed** after SDK 57 patch updates |
| Config plugin generation | Android manifest and iOS plist introspection passed, including an automated CNG test |
| Clean Android/iOS/web production export | Passed, explicit exit code **0**, output `dist/device-gallery` |
| Earlier export cache | Metro recovered from an old cache deserialization warning and produced all bundles; a second export with `--clear` finished cleanly |
| Root Vite TypeScript/build | Passed after removing the accidental Expo tsconfig inheritance |
| Whitespace check | `git diff --check` passed |
| Browser migration check | Existing browser demo session reopened an empty device gallery with no demo action |
| Browser access check | At 375×812, Connect showed **Use the native app**, zero media and no simulated access; browser console had no captured errors |
| Visual proof | `review/device-gallery/native-required.png` at the repository root |
| Development server | Restarted against the updated SDK; development-client tunnel on port **8082** |
| Android device detection | `adb devices -l` returned an empty device list in the final check |
| Physical Android/iOS permission or delete dialogs | **Not tested**; no available ADB device and no connected iOS development build |
| Real-media deletion during this work | **None performed** |

The clean export log is `.expo/device-gallery-export-clean.log`; Doctor output is `.expo/device-gallery-doctor.log`. These are local ignored artifacts.

## Android development build

The final SDK 57.0.31 development APK build is [101724f2-40d9-46cc-ab0f-d75bcb48665c](https://expo.dev/accounts/ayuglows-team/projects/luma-gallery-cleaner/builds/101724f2-40d9-46cc-ab0f-d75bcb48665c). Status was **IN_PROGRESS** at **13:00 IST on 22 October 2026**; installation and device interaction are not yet verified.

Metro is serving the current project at `https://uqhsbka-ayuglow-8082.exp.direct` using the development-client target. Its locally generated QR is `.expo/development-qr.png`. Install the matching development APK before opening this QR; Expo Go is not the acceptance client.

## Remaining device acceptance

1. Install the final development APK. Verify full, selected-photo, denied and permanent-denial permission paths, and return from Settings. On Android 13+, test photo-only/video-only grants.
2. Compare real albums/months and a large paginated library with the system gallery. Add/remove media outside Luma and change limited scope while a review is open. Previously deselected items must stay deselected.
3. Check portrait/landscape photos, iCloud-only media, video playback/retry, Keep, Undo, bookmarks, relaunch, large text, reduced motion and physical gestures.
4. Use disposable media explicitly approved by the owner. Cancel the OS deletion request and verify marks and zero new receipts. Approve selected unprotected originals and verify the system gallery and Luma agree. Test interrupted prompts, partial Android batches and native failures.
5. Perform the same acceptance on a provisioned iPhone development build. Windows exports and mocked tests do not verify PhotoKit dialogs, Apple signing or real iCloud behavior.

The OS owns deletion approval, dialog presentation and recovery. Luma cannot force unsupported dialogs, promise a Trash retention period or restore permanently deleted originals.

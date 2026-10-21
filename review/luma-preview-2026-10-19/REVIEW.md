# Luma preview screen review — 19 October 2026

Reviewed the [linked AI Studio app](https://aistudio.google.com/apps/0abc6d26-ea89-4f48-8030-6a335f0a2714?showAssistant=true&showPreview=true&fullscreenApplet=true) through its live browser UI. The main review used AI Studio's 375 × 667 mobile preview. The published app was also opened directly to capture the short splash animation and inspect its diagnostics.

This is a browser-preview review. Native Expo visual parity, real gallery permissions, physical touch performance, haptics, OS deletion dialogs and native storage were not tested in this review. No app source or dependency files were changed, no personal files were imported, and no media was deleted. Demo collection progress changed during the keep-only flow test.

## Findings, in priority order

1. **Keep-only completions do not update Insights.** April 2026 showed two kept and zero removed on Results, and its month row became Cleaned. Insights still showed the original 36 decisions, six preserved memories and six activity sessions, with only the older 16 October entries. Record completed keep-only sessions as well as deletion sessions, without counting the same decisions twice.
2. **The preview's diagnostics reports a persistence failure.** Settings → QA & Diagnostics Dashboard displayed a failed Session Persistence & Integrity check, with a saved-session reload error. This is an observed result from the preview's own harness, not an independently reproduced native storage failure. Investigate it; the footer should also stop saying all safety checks passed while this failure is displayed. See [diagnostics](diagnostics.jpg).
3. **Storage values disagree.** Home shows a 244 MB media library but approximately 248.7 MB of recoverable clutter. Insights lists 217.1 MB of photos, 26.9 MB of videos and 6.7 MB of screenshots: 250.7 MB if interpreted as separate chart categories. Screenshots may overlap photos; the UI should make that explicit or use disjoint categories. Reclaimable totals must count each candidate once. See [Home](home.jpg) and [Insights](insights.jpg).
4. **Bottom navigation is below the visible viewport on long screens.** At 375 × 667, Settings' bottom Settings button had a top position around 1544 px in the page. Home, Bookmarks, Insights and Settings require scrolling down to reach the main tabs. Keep the existing tab design visible while the content scrolls independently.
5. **The bookmarked video did not load during this review.** `VID_20261009_CampfireEvening.mp4` opened a player at 0:00 that stayed in its unavailable/buffering state. The cause was not established; this does not prove native playback is broken. Add a clear loading/error state and retry option, and verify the sample source and format. See [video preview](video-preview.jpg).
6. **Browser-demo copy overstates device verification.** Settings presents a testable All Photos badge as granted device access; Insights describes its numbers as verified device decisions; Results says device storage was updated even after keeping both photos and deleting none. Label simulated permissions and sample statistics, qualify storage claims, and reserve native confirmation claims for the native app. Bookmark copy promising protection forever should describe protection within Luma instead.
7. **The final onboarding permission screen has no visible Not now action.** Only Previous and Access Gallery & Begin were visible. Add a way to continue without granting access, with honest denied/limited/empty states. No actual photo-library permission was granted in this review. See [onboarding step 4](onboarding-4.jpg).
8. **Readability and accessibility need small fixes.** Secondary text on FAQ, Privacy, metadata and the storage card is small and faint at this width. Some icon-only modal close buttons have no accessible name. Also correct `1 Days` and the Home badge that calls all 55 media items photos despite including two videos.

## Screen inventory

| Screen / state | Visually inspected | Observations |
| --- | --- | --- |
| Animated splash | Yes; captured reveal frames | Centered camera mark, gradient glow and wordmark fit Luma's identity. [Capture](splash.jpg). No frame-rate benchmark performed. |
| Onboarding 1: Smart Stack | Yes | Strong illustration and hierarchy; primary action fits the mobile frame. [Capture](onboarding-1.jpg). |
| Onboarding 2: Tactile Swiping | Yes | Keep/delete explanation and tap alternatives are clear. [Capture](onboarding-2.jpg). |
| Onboarding 3: Zero Regrets | Yes | Consistent art and safety message; reclaimed-space illustration should be labelled as an example. [Capture](onboarding-3.jpg). |
| Onboarding 4: Permission | Yes | Clear explanation, but lacks a visible deferral action. [Capture](onboarding-4.jpg). |
| Home / month stacks | Yes | Consistent colors and rounded cards. Duplicate Import controls wrap into another row at 375 px. Storage/count issues above. [Capture](home.jpg). |
| Albums | Yes | Readable two-column album cards and counts. [Capture](albums.jpg). |
| Swipe cleanup | Yes | Large contained photo, clear Keep/mark/Undo/bookmark controls. Keep and mark buttons tested; actual finger gestures not device-tested. [Capture](swipe.jpg). |
| Media Details sheet | Yes | Filename, date, dimensions, size, album and format displayed; sheet closes correctly. |
| Review deletion sheet | Yes | Staged selection, reclaimable-size display and distinct destructive action are clear. Opened and closed without final deletion. [Capture](review-sheet.jpg). |
| Results | Yes | Strong visual continuation of the splash; two-kept/zero-deleted result inspected. Misleading storage copy and missing Insights updates noted above. [Capture](results.jpg). |
| Bookmarks / filters | Yes | All and Videos filters inspected; photo and video previews opened. Grid and amber bookmark affordances are consistent. [Capture](bookmarks.jpg). |
| Photo preview | Yes | Image, filename and metadata are legible; no bookmark was removed. [Capture](photo-preview.jpg). |
| Video preview | Yes | Loading problem observed; playback not verified. [Capture](video-preview.jpg). |
| Insights | Yes | Clear metric hierarchy and distribution card; totals and keep-only updates need correction. [Capture](insights.jpg). |
| Settings / General | Yes | Preferences, permission badge, cache controls and tour replay entries inspected. Destructive reset/cache controls were not used. |
| Profile | Yes | Consistent impact cards and identity treatment. [Capture](profile.jpg). |
| FAQ | Yes | Accordion opened; answers readable structurally but secondary text needs stronger contrast. |
| Privacy | Yes | Long-form screen inspected; absolute claims should distinguish native processing from the browser demo. |
| Import dialog | Yes | Clear local-file selection state and disabled empty submission. No file picker selection or import performed. |
| Diagnostics | Yes | Persistence failure shown; browser checks do not establish native validation. [Capture](diagnostics.jpg). |

## Interaction evidence and limits

Marking the first April photo advanced to the next photo and made Review (1) available. Closing review and using Undo restored the first photo and Review (0). Keeping both photos opened Results with two kept and zero removed; April's month row subsequently showed Cleaned. Insights did not reflect that completion.

The final delete action, simulated system-deletion dialog, real native deletion confirmation, native denied/limited permissions, offline operation, crash recovery and device animation performance were not exercised. The empty Bookmarks state was not inspected. Preserve the existing splash/onboarding artwork and palette while addressing these behavioral, navigation and copy issues.

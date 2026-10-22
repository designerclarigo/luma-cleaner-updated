# Restored Luma onboarding

The earlier four-step, card-based onboarding is restored and refined in `expo-project/src/components/NativeOnboardingModal.tsx`. The rejected three-page photo-collage design has been removed. Gallery functionality, its data and navigation are retained.

## Verified in the native React Native web preview

- 375×812: original card illustrations and Jakarta headings; Smart Stack interaction, sample Keep/Mark, cleaning/reset, progress buttons and Back/Continue.
- 320×568: no horizontal overflow; Connect photo library (56px tall) and Not now (44px tall) stay visible while the content scrolls.
- An unavailable photo connection leaves a readable retryable message. Not now completes onboarding without enabling Demo.
- Completion persists after reload. Settings → Replay onboarding opens the original sequence again.
- Root lint, native TypeScript and 64 regression tests passed.
- Android/iOS Hermes and web exports passed in `expo-project/dist/restored-onboarding`. No browser console errors were reported in the final exported preview.

## Screenshots

- [Smart Stack](01-smart-stack.png)
- [Tactile Swiping](02-tactile-swiping.png)
- [Zero Regrets](03-zero-regrets.png)
- [Photo Library Access](04-photo-access.png)
- [Compact Photo Library Access](04-photo-access-compact.png)

These are browser observations. Physical safe areas, gestures/haptics and real native permission prompts remain device checks.

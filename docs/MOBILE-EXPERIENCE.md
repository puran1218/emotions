# EmoLex Responsive Experience · Release 1

The current source of truth for visuals, component boundaries and illustration replacement is [DESIGN-PATTERN.md](DESIGN-PATTERN.md). This document is an acceptance checklist for the standalone micro.blog site.

## Explore / Detail

- **Under 900 CSS px:** Explore and Detail are two routes displaying the same components used on wider layouts. Discover displays today's full emotion detail. Mobile back navigation returns to Explore; direct `?word=<stable-id>` deep links open that emotion.
- **900 CSS px or more:** Explore stays visible as a left list while the selected Detail appears on the right. Explore is independently scrollable, not forced to match Detail height. Its selection and filtering do not create duplicate page designs.
- **Search:** Filter original names, translations, aliases and normalized forms. Search may be in English or Chinese. Keep empty-state and clear input recoverable; do not load external search services.
- **Detail:** Headword and its TTS, secondary translation/form, 3:2 art or honest placeholder, bilingual definition, one scenario, 3–4 bilingual expression cards (each with current-language TTS), related emotions, share link, share PNG, Another feeling.
- **Images:** Current release displays a single neutral `feeling-placeholder.svg` for every entry. Never pretend this is an approved picture of Joy, Frustration or any other specific scene. The same image is referenced in Explore, Detail and shared PNG. A future art PR updates data, not UI.
- **Typography:** Long English words like Frustration stay on one line by fitting their rendered size, without missing letters. Readable EN/ZH body fonts, no unnecessary forced tiny text.
- **Share:** Link sharing can use `navigator.share` or clipboard/fallback. Image sharing prepares a same-origin PNG in advance, tries native file sharing inside user activation, otherwise downloads a PNG. First two expression cards appear in PNG.

## Test matrix

- **iPhone Safari:** 320, 375, 390, 430 CSS px, portrait and landscape. Check controls, safe-area, TTS, sentence wrapping, no horizontal scroll or header clipping, deep link, Back, native share/download.
- **iPad Safari:** 768/820/900/1024/1180 CSS px, portrait, landscape and Split View. Cross breakpoint while preserving current emotion. The sidebar must scroll independently when long.
- **Desktop:** Narrow/resized windows and full-screen, mouse, tab/keyboard navigation, focus ring, selection, language toggle, visual alignment.
- **Accessibility:** >=44px taps, semantic heading order, true bilingual `lang`, VoiceOver/screen reader, image alt matches **actual placeholder** or later art, decorative icons hidden from voice, reduced motion, 200% text zoom.
- **Resilience:** Unknown `?word=` displays a recoverable error; missing local image falls back to the neutral placeholder; failed JSON fetch shows retry; browser history and search query remain usable.
- **micro.blog deployment:** `https://your-blog/emotions/` and `/emotions/?word=joy` resolve; local CSS/JS/JSON/images work without a root-relative asset mistake; other blog pages remain unchanged; no global CSS includes.

## Exit criteria

`npm test` and manual browser tests demonstrate that the UI and plug-in behave correctly, **not** that hundreds of dictionary entries have been migrated. Check `npm run content:coverage` for inventory/review metrics; full dictionary release is separately guarded by `npm run release:check`.

No drawing feature, remote AI, new UI for every emotion, or experimental unfinished illustration is in this initial plugin release.

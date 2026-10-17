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

## Search, wide Explore scroll, and offline PNG hardening (October 2026)

- Search placeholders are native to each UI language: `Search feelings…` / `搜索情绪词…`. The accessible search input label still explicitly says **English or Chinese** search is supported. Do not insert the other language as a fragment of the placeholder sentence.
- At >=900 CSS px, Explore has independent `overflow:auto` scrolling. When another emotion is selected, the app currently replaces the full shell; capture and restore the sidebar's `scrollTop` **around each full rerender**. This includes switching the selected emotion, changing language/filter, and browser history changes. Mobile continues to use separate page views; do not force the sidebar's internal scroll position into the window's page scroll.
- Share PNG is a same-origin static export and includes the first two bilingual expression pairs. The renderer **measures actual wrapped text before allocating its image canvas**, rather than cropping at a fixed 3170-pixel height. Extremely long English words also wrap rather than printing beyond the right edge.
- Share-image pre-generation is asynchronous; old image results or failures must not alter the current emotion's enabled/disabled share button. Keep only a few recent cached image results to avoid accumulating hundreds of megabytes while exploring the catalog.
- Use `navigator.canShare({files:[file]})` to choose native file sharing, otherwise trigger PNG download. Do not claim an image was successfully saved to Photos: Safari chooses the destination or handles browser downloads, so the fallback message says only that the download started. Failed download attempts show an error, not success.
- Regression tests simulate full DOM replacement and nested sidebar scroll, out-of-order PNG promises, native share fallback, failed download, missing local illustration, and images with content longer than the former fixed-height export. Real iOS Safari share sheets, browser download behavior, and fonts still require actual device acceptance.

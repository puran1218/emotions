# Mobile-first interaction & layout specification

## Viewports and priorities

Test widths: **320, 375, 390, 430, 768, 820, 1024 CSS px** plus 200% text zoom, iPhone landscape and iPad Split View. iPhone is the *primary* design: large tappable controls, one readable column, illustration with a 3:2 ratio, and no tiny chips/horizontal scrolling. An iPad uses two columns only where it helps readability (detail hero + artwork); it must not spread long sentences across the full display.

Safe areas: account for `env(safe-area-inset-bottom)` in the bottom bar; reserve space at page end; never overlap content with Safari/browser bottom bars. Touch targets min **44×44 CSS px**, preferably **48+** for the child's primary action. Text: min 16px body with Chinese 1.6–1.8 line height; headings scale; never disable browser pinch/zoom. Controls visible without hover, active state + focus ring, reduced-motion handling.

## Discover

Header with brand, Explore and bilingual order control. One emotional focus: word, translation, small form pronunciation button, full 3:2 scene, first meaning. Strong single Next feeling control, secondary View meaning. Daily pick deterministic from local calendar; selecting Next does not change next day's fixed pick.

## Explore

Search field and all/met/unmet filters, result rows with English and Chinese and emoji; no huge photo grid on iPhone. Search original forms, translated names, aliases and case/space/hyphen normalization in memory; no remote service. Empty results keep the typed query and offer reset. Keyboard stays usable with submit and Escape. Scroll restore on back where practical.

## Detail

Reading order: headword → feeling form + TTS → illustration → What's this feeling? → Imagine this → You can say → Related → another. English/Chinese *both visible* with hierarchy determined by locale preference; don't hide the secondary language. Use native share if available, otherwise clipboard/fallback input. Deep links use `?word=<stable-id>` and survive reload. On direct load, Back leads to Explore if no prior in-app history.

## Tests

- iPhone Safari: 320/375/390/430, portrait/landscape; touch navigation, audible TTS after gesture, no overflow.
- iPad Safari: portrait/landscape and narrow Split View; search/filter/list, gestures and keyboard, text contrast and scan order.
- Unknown word: informative, recoverable error.
- Missing art or failed loading: helpful fallback, preserve alt.
- Browser back/forward: URL and state stay aligned.
- Screen reader: semantic headings, focus, status announcements, image alt; emoji decorative when name shown.
- Reduced Motion, 200% zoom, no hover requirement.
- micro.blog page path `/emotions/` resolves relative static files and does not modify blog theme or navigation.

## October 2026 mobile refinements

- The complete readable emotion **card** is shown immediately in Discover. No redundant secondary detail click.
- Card has one quiet border, rounded corners, inset 5:3 artwork panel, bilingual headword, and compact explanation/scene/expression with friendly small icons. Body copy remains readable at narrow iPhone widths.
- At widths from 820 CSS px, Discover/Detail uses a wider, two-column editorial layout (headword alongside illustration, meaning alongside scene); the speakable `YOU CAN SAY...` guidance stays full-width in a visible pale-green callout matching the shared PNG. Below this breakpoint the content follows the original single-column reading order. Explore stays intentionally narrower for comfortable scanning.
- Speak button intentionally pronounces the **headword**, not the adjective/feeling form (Joy/喜悦, not joyful/开心). The latter remains visible as expressive vocabulary.
- The brand mark navigates to Discover, and header search leads to Explore. No bottom tab navigation.
- A separate image action prepares a 1200px-wide bilingual PNG client-side. On iPhone/iPad, native share uses pre-created File under the original click gesture when `navigator.canShare({files})` permits; fallback downloads a PNG. Share link remains separate. No screenshot DOM library or server.
- Images must be same-origin to allow canvas export. Check iPhone Safari file share permissions, Save Image flow, PNG Chinese glyph fallback, incomplete art, VoiceOver, and responsive wrapping on real devices.

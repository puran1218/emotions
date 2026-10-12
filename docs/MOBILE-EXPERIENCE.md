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

## October 2026 illustrated master-detail redesign

- Product positioning: **EmoLex — An Illustrated Dictionary of Feelings**. A single illustrated vocabulary experience, not three visually unrelated screens. Discover selects today's feeling; Explore is the list; Detail is the selected entry.
- Layout threshold is **usable width**, not a specific device or orientation. At >=900 CSS px, Explorer and detail appear simultaneously as left and right panes; at smaller widths Explore and Detail are separate routes that render those **same components**, preserving deep links (`?word=id`), language, search and category filters.
- On phones, opening `?word=joy` goes directly to the Joy detail; the Explore header action opens the illustrated list. A back action returns to the previous in-app view or Explore for standalone deep links. At wide widths, the sidebar remains on screen and the selected row updates with the detail.
- Explore rows use the entry's **same original 3:2 asset** as Detail and share image, at thumbnail scale. No new content or image crop is required.
- Detail leads with the word, headword TTS, translation, and oversized narrative sketch; retains the single audited definition and scene. The tinted green **YOU CAN SAY** panel is the visually strongest textual area. Related words, share link, offline image export and Another feeling stay functional.
- The temporary five **Playful Color Sketch studies** are not illustration-approved. Future scenes require semantic/editorial review before publication. No drawing feature or synthetic three-situation cards.
- Test Safari iPhone 320–430 CSS px and iPad narrow Split View, 820/900/1024/1180 CSS px and desktop resize (including <=900 threshold), 200% zoom, long Chinese translations, VoiceOver, button targets, list scroll and browser history.

## October 2026 detail refinements (PR #1)

- **No broken headwords.** English emotion names such as `Frustration` must never split mid-letter, in the sidebar or the detail title, including the narrow 900px two-pane transition. Label sizes are measured against available width after render and on resize; titles keep their original complete spelling and accessible text.
- **Share image icon.** Use a proper inline landscape-photo SVG, not a generic box Unicode glyph (which renders inconsistently between devices). Its label continues to switch between Share image and Save image based on platform capabilities.
- **Typography.** Keep a unified illustrated-book feel across English and Chinese definitions and scenarios: handwriting-inspired English face; Chinese hand-lettered-friendly system fallbacks with readable leading. Handwriting should not sacrifice legibility at small sizes or 200% zoom. These are local font stacks, so visual equivalence across Windows, Android and Apple devices still needs review; a licensed packaged font can be considered separately if required.
- **Explore/Detail heights: design discussion, not a forced equality rule.** Prioritize a shared top alignment. Short Explore can visually fill similar space; a long catalog should scroll independently without pulling Detail to its full height, and a long Detail should not create artificial sidebar filler. Mobile pages scroll naturally. Evaluate iPad portrait/landscape and a future catalog of hundreds of entries before finalizing equal-height behavior.

## Multi-expression reading layout

For each emotion, the pale-green **YOU CAN SAY...** teaching area contains three (up to four) distinct bilingual sentence cards. Desktop uses three columns when space permits, tablets use two columns, and phones stack the cards vertically. Each card provides a speaker control for the current primary language; the alternate language stays visible. Toggling language changes sentence order and the spoken locale. Titles, illustrations, definitions, scenario and related feelings otherwise follow the existing flow.

Share image exports the **first two** bilingual expressions only, keeping the offline PNG useful without turning it into an overly long list. Canvas card height must follow wrapped text so English and Chinese remain fully visible. Content must come from the canonical editorial file—never invent new sentences only inside UI or image exporters.

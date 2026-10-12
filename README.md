# EmoLex · Feelings, in words and pictures

**A small bilingual feelings explorer for curious children and grown-ups.** The first distribution target is an independent, mobile-first micro.blog plug-in at `/emotions/`; there is no account, backend, or AI runtime.

## Start

The interactive **editorial pilot** is in `static/emotions/`. To view it locally, run a static HTTP server at the repo root, e.g. `python3 -m http.server 8000` and open `http://localhost:8000/static/emotions/`. Installing the repository as a micro.blog plug-in serves the same files at `/emotions/`. `plugin.json` is at repository root; the plug-in does not override themes or inject into blog pages.

**Important:** This branch intentionally includes only five readable, bilingual **pilot** entries. The 242 original English occurrences (234 distinct forms) and 80 Chinese source words are preserved in `data/source-words.json`, awaiting editorial review; an unreviewed source word is not silently published. Current illustration stages are storyboards pending final art. No unreviewed material is represented as a released dictionary entry.

## Content architecture

`data/concepts/pilot.json` is the **canonical editable content** validated against `schemas/emotion.schema.json`; it keeps taxonomy, provenance, noun/feeling word forms, meanings, scenarios, expressions, bilingual image descriptions, review states and related links. The static app uses a compact generated projection at `static/emotions/data/emotions.json`. Run `npm run build:data` after editing canonical concepts, then `npm test`. CI fails if runtime output differs from the editorial source.

## What is included

- Discover, Explore and Detail with bilingual search, stable word links, native speech synthesis, language switch, error/empty states, and responsive layouts for iPhone, iPad and desktop.
- `docs/CONTENT-EDITORIAL.md`: content/sense criteria and publication gate.
- `docs/MOBILE-EXPERIENCE.md`: responsive UX acceptance tests and interaction decisions.
- `docs/ILLUSTRATION-BIBLE.md`: character, palette, scene art direction and QA.
- `data/source-words.json`: source inventory with categories, not translated or automatically merged.
- `static/emotions/data/emotions.json`: five pilot entries only, each marked by file-level disclaimer.
- `scripts/validate.mjs`: checks inventory counts, IDs, bilingual fields and cross-references.

Run `node scripts/validate.mjs`. No third-party npm dependencies.

## Roadmap

1. Test iPhone Safari and iPad (portrait/split-view/landscape), including actual voice availability.
2. Run a 5–12 scene illustration consistency review and export approved PNG/WebP from high-resolution masters.
3. Complete term-by-term bilingual editorial review (sense, translation, scenario, expression, alt, illustration) with a tracked queue.
4. Promote entries from pilot to published only after all required editorial gates pass; then make a micro.blog release.

## Privacy

No analytics SDK, login, microphones, generated AI text or third-party API requests. Voices depend on the user's browser/OS speech engine; its behavior may vary. Language preference is kept in localStorage when available.

## Illustration sources

The five on-screen SVG scenes are **temporary semantic storyboards**, not the final watercolor art. A separate earlier design pack contains four watercolor calibration drawings; they should only be imported after checking their semantics, character consistency and licensing. Approved art will use `static/emotions/images/<concept>-vNN.webp`, paired with an updated `illustration.src` field and the art manifest.

## October 2026 UI refinements

The emotion card now follows a compact, single bordered reading surface inspired by the supplied card example. Discover shows the **complete** explanation, scenario, expression, and related words without a second tap. Header logo/search replace the redundant bottom navigation. Section headings use clear pictograms. The title's adjacent speaker reads the exact bilingual headword (e.g. **Joy / 喜悦**) instead of an adjective (**joyful / 开心**).

The card offers **Share link** and **Share image** separately. Image export is built in the browser to a bilingual PNG and requires no backend. The image is prepared before the share button activates, preserving iOS Safari's click gesture for the native share sheet. Unsupported file sharing falls back to PNG download. Browser capabilities, fonts, same-origin illustration rendering, and save-to-Photos need hands-on verification on iPhone and iPad.

## Illustrated master-detail UI preview (October 2026)

**EmoLex — An Illustrated Dictionary of Feelings.** The redesigned prototype pairs an illustrated Explore list with a full emotion detail pane on iPad landscape / desktop at >=900 CSS px. At smaller widths the *same two panes* become separate pages: Explore lists the five pilot feelings, and Detail displays the selected narrative artwork, bilingual explanations, one illustrated scenario, and the green **YOU CAN SAY** prompt. `?word=<id>` links work in either layout, including direct phone loads.

The five new `*-sketch-study.svg` illustrations are **art-direction experiments**, not approved final art; original storyboards remain checked in for comparison. The single reviewed scenario per pilot is unchanged. No new drawing, AI, backend, or multi-scene editorial feature was added. Run `npm test`, then `python3 -m http.server 8000` and open `/static/emotions/` on a phone or iPad to evaluate the responsive prototype.

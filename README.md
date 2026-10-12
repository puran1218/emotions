# EmoLex · Feelings, in words and pictures

**A small bilingual feelings explorer for curious children and grown-ups.** The first distribution target is an independent, mobile-first micro.blog plug-in at `/emotions/`; there is no account, backend, or AI runtime.

## Start

The interactive **editorial pilot** is in `static/emotions/`. To view it locally, run a static HTTP server at the repo root, e.g. `python3 -m http.server 8000` and open `http://localhost:8000/static/emotions/`. Installing the repository as a micro.blog plug-in serves the same files at `/emotions/`. `plugin.json` is at repository root; the plug-in does not override themes or inject into blog pages.

**Important:** This branch intentionally includes only five readable, bilingual **pilot** entries. The 242 original English occurrences (234 distinct forms) and 80 Chinese source words are preserved in `data/source-words.json`, awaiting editorial review; an unreviewed source word is not silently published. Current illustration stages are storyboards pending final art. No unreviewed material is represented as a released dictionary entry.

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

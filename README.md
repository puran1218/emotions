# EmoLex — An Illustrated Dictionary of Feelings

A playful, bilingual (English and Chinese) dictionary that helps children **explore, understand and express** their feelings. Designed as a lightweight **standalone micro.blog plug-in** at `/emotions/`, with no login, server, AI runtime, analytics, bundled web fonts or theme overrides.

## Current scope and readiness

The application is functionally usable: illustrated master–detail navigation, bilingual search and filters, definitions, one relevant everyday scene, three ordered **YOU CAN SAY...** expressions per entry, speech for headwords and each expression, related words, shareable links and offline PNG images. It supports iPhone, iPad and desktop from the same static files.

**Content is not complete yet.** There are **five bilingual pilot concepts** with rich content. The source inventory has **322 occurrences** (242 English across two categories, 80 Chinese), including 234 distinct English forms. Those source lists are **not** an approved bilingual dictionary. The earlier `emotions-card.zip` reportedly contains around **235 legacy entries**; its full explanations are **not yet in this repository**. Do not market or release the five-entry preview as complete lexical coverage.

All visible concepts currently share one honest neutral `feeling-placeholder.svg` while the illustration project is deliberately deferred. No unfinished Sketch artwork is published in the plug-in. The exact art-direction and swappable asset contract are in [docs/DESIGN-PATTERN.md](docs/DESIGN-PATTERN.md).

## Preview locally

Install Node.js 22+ and run:

```bash
npm test
npm run content:coverage
python3 -m http.server 8000
```

Open [http://localhost:8000/static/emotions/](http://localhost:8000/static/emotions/). Search for Joy, Frustration, Loneliness, Affection or Relief. Switch EN/中文; test headword and example speech; test PNG sharing (native file share when supported, otherwise download); test `?word=joy` and browser Back.

`npm run build:data` regenerates `static/emotions/data/emotions.json` from the canonical `data/concepts/pilot.json`. **Do not edit the generated runtime JSON directly.**

`npm test` validates the source ledger and content structure, rendering/search/speech/share contract, and micro.blog static resource paths. `npm run release:check` performs those tests **plus** a full-content coverage check. It will fail while source words and editorial review are incomplete; that failure is intentional.

## Install privately on micro.blog

Once PR #1 is merged into the branch you want micro.blog to clone:

1. In micro.blog, open **Design → Edit Custom Themes → New Plug-in**.
2. Enter `https://github.com/puran1218/emotions` as the repository/clone URL, name it **EmoLex**, and save/install the plug-in for the correct blog.
3. Publish/rebuild the blog if necessary, then open `https://YOUR-BLOG-DOMAIN/emotions/`.
4. Verify `/emotions/?word=joy`, EN/中文, speech, search, PNG sharing and that other blog pages were not visually modified.
5. On subsequent repository updates, use the micro.blog plug-in update workflow and change `plugin.json` version when shipping a new release.

This is a **theme-neutral static plug-in**: `plugin.json` requires no `includes` or configuration fields. Hugo publishes `static/emotions/index.html` as `/emotions/`, with assets alongside it. Do **not** add a blog page also using the `/emotions/` slug.

micro.blog guidance: [Developing plug-ins](https://help.micro.blog/t/plug-ins/104), [Importing static content](https://help.micro.blog/t/importing-static-content/2337), [Standalone static page](https://help.micro.blog/t/single-page/1167).

**Installation is not yet verified on a real micro.blog site.** The automated checks cover repository structure and paths, not the hosted platform or real iOS speech/share behavior.

## Source layout

| Location | Purpose |
| --- | --- |
| `plugin.json` | micro.blog plug-in metadata/version |
| `static/emotions/` | Entire standalone app distributed to the blog |
| `static/emotions/images/feeling-placeholder.svg` | Shared, neutral 3:2 illustrated placeholder |
| `data/concepts/pilot.json` | Canonical bilingual editorial content |
| `static/emotions/data/emotions.json` | Generated runtime content |
| `data/source-words.json` / `data/review-ledger.jsonl` | Original vocabulary and individual review tracking |
| `docs/DESIGN-PATTERN.md` | Main UI + illustration + interaction pattern |
| `docs/CONTENT-EDITORIAL.md` | Sense, translation and review policy |
| `docs/ILLUSTRATION-BIBLE.md` | Future Playful Color Sketch art specification |

## Merge/release decisions

**Merge PR #1 as a five-entry private pilot** after local and hosted-device acceptance if that limited vocabulary is explicitly acceptable. **For a complete dictionary release**, recover and migrate the missing legacy content, resolve coverage in the ledger, edit/check every bilingual definition, scenario and three expressive examples, and pass `npm run release:check`. Art can remain the common placeholder while content is approved. Do not invent fake translations or filler examples merely to satisfy a word count.

Final illustrations belong in a **separate later PR**. The new image should become the canonical concept's `illustration.src` and accurate alt text; Explore, Detail and Share PNG will all pick it up without UI changes.

## Privacy

No user data collection, logins, microphone capture or third-party API calls. Speech depends on the browser/operating system's available voices; local language preference is remembered via localStorage when supported.

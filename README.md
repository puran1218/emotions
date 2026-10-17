# EmoLex — An Illustrated Dictionary of Feelings

EmoLex is a playful bilingual (English + Chinese) feelings dictionary for children and their families. This repository ships a **standalone micro.blog plug-in** at `/emotions/` with no login, backend, AI runtime, external font service or changes to the host blog theme.

## What you can try today

- **225 browsable concepts:** five original pilot concepts plus **220 expanded legacy concepts**, each with an English/Chinese headword, definition, one everyday scene and **three individually drafted bilingual expressions** under **YOU CAN SAY...**
- **10 additional ambiguity-sensitive concepts** are preserved in the editorial sources but **withheld** from public browsing until reviewed (including adult/clinical senses or terms that are not clearly feelings). None is silently discarded.
- Independent **Explore → Detail** pages on phones; simultaneous master–detail panels on wider iPads and desktops. Search, filter, browser history, deep links such as `?word=joy`, language order toggle, headword and sentence TTS, related feelings, Share link and offline Share image are included.
- Every concept currently uses the same intentional, neutral `feeling-placeholder.svg`. Actual illustrations will be produced in a **separate later PR** following [DESIGN-PATTERN.md](docs/DESIGN-PATTERN.md) and [ILLUSTRATION-BIBLE.md](docs/ILLUSTRATION-BIBLE.md).

**Content status:** this is a **broad editorial preview**, not a human-approved bilingual dictionary. The original legacy explanatory texts have been preserved and the new scenes/expressions drafted individually, but final meaning, translation and child-suitability approval is still outstanding. In particular, do **not** confuse successful automated validation with editorial sign-off.

## Where the content came from

`data/legacy/emotions-card.json` contains a lossless transcription of the supplied `emotions-card.zip` (**235 historic rows / 230 distinct English forms**). It preserves source category and index, duplicate occurrences and the original EN/ZH explanations, including legacy mistakes.

The migration maps **5 historic rows to existing pilot concepts** and produces **230 new concept drafts**. Five duplicated source spellings receive separate sense IDs instead of being overwritten. Every historic row is linked to a stable concept ID in `data/legacy/migration-report.json` and the 322-occurrence `data/review-ledger.jsonl`. All **235 legacy source rows have been mapped**; seven English source occurrences not present in the ZIP and 80 independent Chinese source occurrences still require editorial decisions. No migration record is marked reviewed or published automatically.

The authoring files are:

| File | Purpose |
| --- | --- |
| `data/legacy/emotions-card.json` | Original, unchanged bilingual explanations and provenance |
| `data/concepts/pilot.json` | Five established example concepts |
| `data/concepts/legacy-expanded.json` | 230 complete-schema bilingual editorial drafts (220 preview, 10 withheld) |
| `data/legacy/expression-overrides-*.json` | Individually composed EN/ZH expression sets |
| `data/legacy/scene-overrides.json` | 79 manually rewritten scene pairs |
| `data/legacy/semantic-overrides.json` | 49 documented sense/Chinese-definition corrections |
| `data/legacy/migration-report.json` | Individual source links, withheld words and review flags |
| `static/emotions/data/emotions.json` | Generated, plug-in-readable projection of preview-eligible content |

**Do not edit the generated runtime JSON directly.** Update canonical content and documented overrides, then rebuild. For a new artwork file later, update the canonical illustration path/stage/alt rather than changing UI templates.

## Development

Requires Node.js 22+ for tooling only; the published application is plain static HTML/CSS/JavaScript.

```bash
npm test
npm run content:coverage
python3 -m http.server 8000
```

Open `http://localhost:8000/static/emotions/`. Try `?word=joy`, `?word=concerned-met`, `?word=concerned-unmet`; test EN/中文, speaking every sentence, search, native image sharing or download, browser Back and empty search.

```bash
npm run migrate:legacy
npm run build:data
npm test
npm run release:check
```

`migrate:legacy` deterministically reapplies the archived source and editorial override files; `build:data` refreshes the static runtime. CI runs `migrate-legacy --check` to catch drift, validates the source inventory and 235 historical links, checks bilingual content and artwork contracts, exercises key UI actions, and checks micro.blog static paths.

`release:check` is intentionally **not green**: it requires substantive sign-off and explicit source occurrence disposition rather than considering editor-drafted fields automatically approved. This does **not** prevent a clearly labeled personal preview installation.

## micro.blog personal preview installation

After merging into the GitHub branch you want micro.blog to use, use **Design → Edit Custom Themes → New Plug-in** in micro.blog to clone or install from `https://github.com/puran1218/emotions`. Activate it for your blog, rebuild/publish and visit `https://YOUR-BLOG-DOMAIN/emotions/`. Confirm that `/emotions/?word=joy` works and that ordinary blog pages have not changed.

The root `plugin.json` is the plug-in manifest; `static/emotions/` is the entire published application. No global `includes` or theme changes are necessary. If your site already uses the `/emotions/` page name, change that conflict first.

**Real micro.blog installation, real Safari/iPhone/iPad audio and native share behavior still require hands-on verification.** Automated tests validate structure, not live deployment.

## Release and illustration plan

1. **PR #1:** preserve the complete legacy bilingual source, make editorial drafts browseable, fix ambiguous senses, define the unified playful editorial UI and all static plug-in machinery. Merge for **personal editorial preview** after your own device smoke test; do not label it fully reviewed.
2. **Editorial follow-up:** resolve the seven source gaps, 80 Chinese source occurrences, 10 withheld terms, and all outstanding review flags; approve translation, meaning, expressions and child suitability per concept. Only then mark content `published` and expect `release:check` to pass.
3. **Separate illustration branch:** produce Playful Color Sketch artwork using the already agreed illustration bible, then replace the shared placeholder via each concept's `illustration.src/stage/alt`. No redefinition of design direction is needed.

See [CONTENT-AUDIT.md](docs/CONTENT-AUDIT.md), [CONTENT-EDITORIAL.md](docs/CONTENT-EDITORIAL.md), [REVIEW-LEDGER.md](docs/REVIEW-LEDGER.md) and [MOBILE-EXPERIENCE.md](docs/MOBILE-EXPERIENCE.md) for editorial and QA details.

## Privacy

No accounts, analytics SDK, microphone capture or AI calls. Browser voices depend on the user’s operating system. Language preference is stored locally when supported.

## Editorial clarity + visual explanation workflow

Two independent inspirations now inform EmoLex quality review without becoming runtime dependencies:

- [EmoLex Plain Language](docs/PLAIN-LANGUAGE.md) borrows selected ASD-STE100 sentence-clarity principles for **definitions**. It deliberately preserves ordinary child speech and warm, idiomatic English/Chinese in `YOU CAN SAY...`.
- [Visual Explanation](docs/VISUAL-EXPLANATION.md) borrows Anatomy’s **object-as-explanation** principle for a single still story scene. It keeps EmoLex's Playful Color Sketch art direction, **not** Anatomy's interactive/isometric drawing stack.

Five editorial pilot definitions/scenes and selected expressions have been calibrated in `data/concepts/pilot.json` with recorded before/after rationale in `data/editorial/pilot-calibration.json`. Five aligned future-illustration planning briefs live in `data/illustration-briefs/pilots.json`. All remain **unapproved editorial proposals** with the same neutral placeholder until separate review. Neither illustration generation nor bulk rewrite of legacy data is part of this PR.

Run `npm run review:editorial` to inspect an advisory full-catalog lint summary; `npm run review:editorial -- --pilot` checks only the five calibrated pilots, and `npm run review:editorial -- --json` prints all machine-readable findings. The checker is read-only, heuristic and intentionally **does not** decide which emotion sense/translation is right. `npm test` verifies the new pilot/brief alignment and existing plugin behavior.

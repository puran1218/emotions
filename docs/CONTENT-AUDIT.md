# EmoLex legacy content audit and migration · 2026-10-13

## Historical sources and completeness

- Original source inventory: **242 English category occurrences** (107 met, 135 unmet; 234 distinct English terms), plus **80 independent Chinese occurrences** (31 met, 49 unmet). These 322 occurrences are not 322 validated concepts.
- Supplied `emotions-card.zip/emotions-card/emotions.js`: **235 bilingual historic entries**: 106 needs-met, 129 needs-unmet, 230 distinct English spellings, including duplicate categorized senses for `concerned`, `intense`, `overwhelmed`, `sensitive` and `surprised`.
- Missing source occurrences in the historic ZIP: met `alive`; unmet `anguished`, `annoyed`, `aroused`, `blah`, `cool`, `keyed-up`. Some missing category occurrences may already have a different-category spelling in the ZIP; do not infer one-to-one equivalence or silently fill the source gap.
- The historic `Blissful` row contains the misspelled JSON key `Explanation_in_Chinese ` (with trailing whitespace). Raw provenance is preserved; migration normalizes the field into a usable bilingual pair without overwriting the source.

## Current migrated content

- The **complete original 235-row bilingual archive** is stored at `data/legacy/emotions-card.json`. No historic explanation was intentionally discarded.
- **5 original pilot concepts** reused: Joy, Frustration, Loneliness, Affection and Relief. Relevant historic forms `joyful`, `frustrated`, `lonely`, `affectionate`, `relieved` are explicitly linked to these concepts.
- **230 additional canonical concepts** in `data/concepts/legacy-expanded.json` contain headwords, two-language definitions, real-life scenarios, **three individually drafted bilingual spoken expressions**, local TTS metadata and a shared neutral artwork placeholder.
- **220 legacy concepts** are visible together with the five initial pilots = **225 browseable**. **10** concept records are preserved but withheld as ambiguity/child-suitability review candidates: `aroused`, `depressed`, `guilty`, `mad`, `suspicious`, `cool`, `hot`, `lazy`, `mean`, `numb`.
- Specific content QA work: **189 expression overrides** plus 41 originally composed individually in the migration script, **79 scene rewrites**, **49 meaning/Chinese-term corrections**. All these are still editorial drafts, **not human-reviewed approvals**.
- Every historic source row is linked through `migration-report.json` to an existing or newly generated concept ID, and its original English source occurrence in `data/review-ledger.jsonl` is marked `drafted` (not `published`). The **7 English source occurrences absent from the ZIP** and **80 Chinese original occurrences** remain open for independent editorial mapping and cross-language sense review.

## Known semantic hazards (intentionally withheld or distinguished)

- `Guilty`: historic `有罪的` incorrectly conveys legal guilt when describing feeling guilty. Draft corrected to `内疚的`, withheld until review.
- `Mad`: historic `发疯的` is not an appropriate translation of the angry sense. Draft corrected to `生气的` and withheld.
- `Cool` can be slang/fashion, composure or emotional distance; `Hot` can be physical heat or figurative emotion, `Aroused` may have inappropriate adult senses. All withheld for an explicit sense decision.
- `Depressed` is not the same as temporary sadness; clinical wording and child suitability require human review.
- `Sensitive`, `Concerned`, `Overwhelmed`, `Surprised`, `Intense` preserve *two distinct sense IDs* where legacy categories differ; Chinese terms and definitions were adjusted to avoid silent false equivalence.
- Traits and non-emotions such as `Mean`, `Lazy`, `Helpful` are not automatically promoted to core emotions. The corpus records the type for later taxonomy filtering and review.
- Several recovered definitions are minimal or historically awkward; editorial drafts do **not** imply the final word sense is settled.

## Repeatable migration and acceptance

```bash
npm run migrate:legacy
npm run build:data
npm test
npm run content:coverage
npm run release:check
```

`migrate:legacy` replays the preserved source with explicit `expression-overrides-*.json`, `scene-overrides.json` and `semantic-overrides.json`; the tests compare reproducible output and 235 source→concept links against the checked-in files. `release:check` deliberately fails until all source occurrence decisions, final bilingual review and child suitability approvals are complete.

**This is a broad and technically complete field migration, not final editorial approval.** The personal micro.blog plug-in can use the 225-entry labeled preview with a shared placeholder without waiting for finished illustration work.

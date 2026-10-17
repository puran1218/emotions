# Complete legacy calibration · October 2026

## Scope and results

This PR extends the [five-pilot Plain Language calibration](../PLAIN-LANGUAGE.md) to **every one of the 230 migrated canonical concepts**, preserving the archived 235 ZIP occurrences and five links into the original pilots.

| Work item | Result |
| --- | --- |
| Five established pilots | Calibrated in `data/editorial/pilot-calibration.json` |
| Migrated canonical concepts | **230/230** have individually drafted bilingual definitions and scenarios |
| Selected speaking examples refined | **70** bilingual example pairs across **67** concepts |
| Complete per-word source and revision packets | **230** records |
| Draft static-scene visual planning candidates | **230** records (not completed illustration briefs or art approval) |
| Visible legacy preview | **220** concepts, plus five original pilots |
| Withheld ambiguous/child-suitability terms | **10** remain withheld |
| Automated advice after calibration | **20 sense/age-appropriateness suggestions**, **0 structural failures** in the current CI scan |
| Independent bilingual editorial approval | **0** (requires a separate qualified reviewer) |
| Artwork generated/approved | **0** (shared neutral placeholder unchanged) |

These numbers mean **all 230 entries received a substantial individually worded explanation and a concrete narrative scene**. They do *not* mean 230 entries have passed an external language, psychological, educational or translation review. The 70 explicitly revised expressions supplement the existing individually written bilingual expression sets for all 230 concepts, which remain subject to read-aloud and semantic verification.

## Reproducible source of truth

The original source explanation, source index and category remain in `data/legacy/emotions-card.json`. The existing legacy migration and manually curated `data/legacy/*-overrides.json` are unchanged. The *new* review overlay is `data/editorial/legacy-calibration.json`, applied **after** the former manual/semantic overrides by `scripts/migrate-legacy.mjs`. It contains 230 keyed records with draft English/Chinese definitions, draft English/Chinese scenarios and optional, indexed bilingual expression corrections. Every record remains `reviewStatus: proposed`.

The output of `npm run migrate:legacy` is still `data/concepts/legacy-expanded.json` and `data/legacy/migration-report.json`. `npm run build:data` builds the user-visible `static/emotions/data/emotions.json` with the calibrated concepts. The five original pilots remain canonical in `data/concepts/pilot.json`.

The deterministic `npm run review:packets` command writes:

- `data/editorial/legacy-review-packets.json`: each source occurrence linked to its word, classification, before (unaltered archived explanation), after (the complete proposed bilingual canonical record), changed expression indices, related-sense suggestion and review disposition.
- `data/illustration-briefs/legacy-candidates.json`: one **conceptual** still-scene brief per migrated concept, aligned to its revised definition/scenario. These contain a 3:2 design constraint, a scene/focal question, a nearby-sense contrast where available, and child-safe concerns. They still require **individual storyboard/visible-evidence design** before image generation; do not mistake automated planning records for complete concept-specific art direction.

`npm test` runs `scripts/migrate-legacy.mjs --check`, core schema tests, UI and plugin tests, full corpus proposal coverage and the `scripts/build-review-packets.mjs --check` drift check.

## Semantic decisions that need human review

Some terms name **emotions**; others describe **bodily sensations, personality/attitude, behavior, or the quality of an experience**. For example:

- `Helpful` describes kind behavior; `Glorious` and `Wonderful` praise experiences. These should not be relabeled as internal emotions merely to fit the dictionary title.
- `Alone` is not the same as `Lonely`; `Frustration` is not necessarily `Anger`; `Relief` includes prior worry; `Disappointed` implies an unmet hope.
- `Intense` and `Sensitive` need an explicit subject/sense; `Concerned`, `Overwhelmed`, and `Surprised` retain category-dependent meaning.
- `Guilty` in this context refers to remorse, not legal guilt; `Mad` is the anger sense, not a judgment about mental health; `Depressed` can carry clinical meaning and is withheld pending appropriate review.
- `Cool`, `Hot`, `Lazy`, `Aroused`, `Mean`, `Numb`, and `Suspicious` remain withheld until their child-facing status, sense and vocabulary appropriateness are explicitly determined. A refined draft is **not** permission to surface it.

The 10 initially withheld concepts were **not** promoted to preview, and **no** `review.translation`, `review.meaning`, `review.child_suitability` or `review.illustration` field was automatically advanced to `approved`.

## Next review pass

1. Inspect `legacy-review-packets.json` by area (emotions, feeling states, attitudes, physical states, descriptive words). Compare archived explanations, bilingual definitions, scenario and expression cards rather than relying on short-word counts.
2. Read the three English and Chinese expression pairs aloud, checking that children might actually say them and that their intent is the same in both languages.
3. Review the 20 semantic triage suggestions and 10 withheld concepts with explicit approve/rework/exclude decisions recorded in the source review ledger.
4. For visible concepts, choose **one** drawable story moment and specify actual props, gaze, posture, narrative difference from nearby emotions and the without-text test. Use the newly generated visual candidate as a starting point, not the final illustration brief.
5. Mark editorial approval **only with a real reviewer and dated evidence**; source ledger coverage of all 322 original vocabulary occurrences is a separate completeness gate.

This PR is editorial calibration and planning only. The Micro.blog UI, static placeholders and publication gates are preserved; final art remains on a later independent branch.

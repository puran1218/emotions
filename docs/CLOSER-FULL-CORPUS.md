# A Little Closer · full-corpus rollout proposal

**User feedback:** The three pilot contrasts make it easier to understand different feelings. The request is to apply this editorial pattern to the full dictionary.

**Scope in this branch:** every currently browsable EmoLex entry (**225/225**: five original pilots and 220 migrated preview entries) has a specifically chosen comparable sense or situation and a newly authored EN/ZH distinction. The ten withheld, ambiguous source concepts are **not** made visible. Artwork remains unchanged.

## Why this needs a curated mapping

All five original pilots have `related_ids`, but **all 220 migrated visible entries have empty `related_ids`**. Extending the feature by simply traversing Related Feelings is impossible. Inventing related IDs to fill quotas is risky for emotion meaning, physical states, traits and adjective senses.

Instead, sources live in:
- `data/editorial/closer-pilots.json` – three original fully written, bilingual experimental comparisons, retained in place.
- `data/editorial/closer-corpus-positive.json` – 103 additional individual contrasts (including Affection and Relief).
- `data/editorial/closer-corpus-negative.json` – 119 additional individual contrasts.

Every record has a stable original concept ID, a specifically chosen existing visible sense ID, an original EN/ZH takeaway, and `reviewer:null`. The content is **individually authored editorial draft text**, **not human-approved product copy**.

## Content semantics

No mechanical attempt to turn every entry into an emotion:
- `Quiet` is a manner of making little sound; `Peaceful` is an inner feeling.
- `Tired` and `Sleepy` are physical states, not proof of a particular feeling.
- `Glorious`, `Wonderful`, `Pleasant` etc. often describe things or experiences, not emotions.
- `Surprised-met` and `Surprised-unmet` are separate stable senses; the same spelling can reflect opposite experiences.
- `Concerned-met` (caring) differs from `Concerned-unmet` (worry).
- `Sensitive` and `Intense` also have distinct source category/sense IDs.
- `Loneliness` explicitly contrasts with the *situation* of being alone, without treating the situation itself as a negative emotion.

The three original pilot comparison cards keep their special, shorter, hand-edited descriptions. For the remaining 222, **both comparison descriptions render directly from the canonical bilingual `definition` fields** at runtime, plus the individual `takeaway`; there is no divergent copy of the dictionary definitions to maintain. Translation and source meanings are **not silently rewritten**.

## Data and UX

`node scripts/build-closer.mjs` validates all mappings and deterministically builds `static/emotions/data/closer-experiment.json`. The JSON is an independent overlay keyed by ID, **not a mutation of the original 225-entry dictionary**. The overlay is ~75 KiB uncompressed because it stores only custom takeaways and mappings, not 222 duplicated pairs of bilingual definitions.

The `A LITTLE CLOSER / 再理解一点` disclosure now appears by default **for all 225 browsable entries** between YOU CAN SAY and RELATED FEELINGS. English and Chinese remain visible together and their reading order follows the existing language switch. The target-card action navigates to its canonical term, which can have its own comparison. The section can be collapsed on mobile or desktop via native `<details>`.

For A/B review, append `&closer=0` to a detail URL (e.g. `?word=joy&closer=0`) and the extra section does not load at all. This flag stays in place across navigation. The original opt-in `?closer=1` still works but is no longer necessary.

## Prompt adaptation across all content

The four inspiration prompts remain *editing techniques*, not executable prompts at runtime:
1. **知识卡片 → Feynman**: distinguish what the feeling is from a single child-understandable scenario.
2. **So What → relevance**: check that YOU CAN SAY examples name, describe or communicate the feeling without mandating behavior.
3. **信达雅 → translation**: review each bilingual pair for meaning accuracy, contextual naturalness and concise warmth, **not** pseudo-classical English/Chinese wording.
4. **汉语新解 → optional metaphor**: use only when a gentle literal-and-figurative distinction improves child comprehension; no satire or universal stereotypes.

This release intentionally **does not auto-rewrite** 225 already calibrated definitions or speech expressions. See `docs/PLAIN-LANGUAGE.md` and `data/editorial/legacy-calibration.json` for the existing 230-item editorial review work. The new contrast material should be reviewed pair by pair, with particular priority for age-appropriate tone, bilingual naturalness and mixed-sense words.

## Validation and review questions

```bash
npm run build:closer
npm test
python3 -m http.server 8000
```

View `http://localhost:8000/static/emotions/?word=joy` and search for other terms; toggle EN/中文 and use the new Explore comparison action. Compare with `?word=joy&closer=0`. Test at 320px, 390px, tablet and desktop.

CI asserts:
- exactly 225 distinct, visible IDs, no withheld items and no unknown comparison targets
- a handcrafted bilingual takeaway and null reviewer for each newly added entry
- no change to original canonical descriptions, examples, statuses, or image approval
- deterministic generated overlay equal to its source materials
- the full app mounts default-on cards, switches language, retains link behavior, and hides the cards in compare-off mode
- existing plain-language/legacy migration, original imagery and sharing tests still run

**Not a certification:** The source meaning, context distinction and child-friendly phrasing of 225 new pairs need individual human editorial sign-off. Passing tests cannot guarantee semantic correctness. Do not automatically mark any review statuses as approved or make previously withheld senses public.

## Rollout decision

This PR supersedes the three-entry proof-of-concept PR #5 so it can merge on top of `main` as a single coherent change. The separate WebP work is unaffected. The draft/previews remain explicitly labeled as editorial drafts while broader review occurs.

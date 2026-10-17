# Content architecture and review gate

**Review companion:** [EmoLex Plain Language](PLAIN-LANGUAGE.md) applies STE-inspired clarity rules to definitions but keeps the scenario and spoken expressions warm and natural. [Visual Explanation](VISUAL-EXPLANATION.md) ties the same reviewed meaning to an honest static scene. Both guidelines are content-review tools, not formal STE compliance or automatic publication approval.

**Never equate source-word occurrences with publishable emotion concepts.** Preserve the original four lists under \`data/source-words.json\`: English met=107, unmet=135; Chinese met=31, unmet=49. English has 242 occurrences but 234 distinct spellings, and eight forms occur in both categories (aroused, concerned, cool, intense, keyed-up, overwhelmed, sensitive, surprised).

## Single source of truth

Do not edit `static/emotions/data/emotions.json` by hand. Maintain `data/concepts/pilot.json` and `data/concepts/legacy-expanded.json` (reproduced from the archived ZIP and documented overrides via `npm run migrate:legacy`), validate against `schemas/emotion.schema.json`, and regenerate the static projection using `npm run build:data`. Source occurrence lists and the review ledger remain separate so semantic merges never delete original evidence. Only `published` concepts with approved translation, meaning and child suitability qualify for content release. They may temporarily use the neutral pending placeholder; non-placeholder emotion artwork requires a separate illustration review.

## Data model

One display concept/sense has a stable ID, an explicit source mapping, needs categories (which are not judgments about good and bad), a kind (emotion / feeling state / attitude / physical state / other), natural noun/feeling forms in each language, bilingual *definition* (what it is), *scene* (one everyday example) and *say* (an ordered set of three or four bilingual spoken expressions), emoji, a 3:2 approved scene image or labeled neutral placeholder with accurate bilingual alt text, a pronunciation phrase/locale, and manually selected related IDs. Some English adjectives have no natural noun: never synthesize an awkward one just to complete a field.

No assumption of one-to-one English–Chinese equivalence. If the same written form means different things across contexts, create stable sense IDs (e.g. \`concerned-care\` and \`concerned-worry\`) and record both source occurrences. Do not delete the second category occurrence. Preserve \`Guilty\` (内疚 rather than 有罪 in feeling context), \`Mad\` (生气 rather than 发疯), \`Suspicious\` (怀疑 rather than 可疑), \`Concerned\`, \`Complacent\`, \`Aroused\`, \`Cool\`, \`Hot\`, \`Lazy\`, \`Depressed\` for careful sense checks.

## Publication gate

Each review record moves through **unreviewed → drafted → content-reviewed → published** for editorial content; illustration approval is a separate later step when the shared placeholder is used. Content review requires authentic bilingual word forms and meaning, accurate child-facing explanation, a scenario that illustrates the *feeling* not a stereotype, and a speakable first-person sentence. Illustration review requires scene/word alignment, stable character appearance, legibility at 320px wide, alt text, inclusion, technical dimensions, and approved art license/provenance.

Publish content only when bilingual wording, definition, scene, and all expressions are substantively approved. Use either an approved illustration or the neutral pending placeholder. Never publish an unreviewed per-word draft illustration as final art. Editorial pilot is separate from published data. The current app shows 225 editorial-preview concepts: five original pilots plus 220 legacy drafts. Ten ambiguity-sensitive legacy concepts remain withheld. None of the 235 mapped historic records is human-review-approved. Do not run automatic translation or generate child-directed definitions as an unchecked bulk process.

## Review ledger

The 322-row review ledger already exists. All 235 ZIP English occurrences are now linked to canonical concepts with drafted—not published—status. Seven absent ZIP English occurrences and 80 Chinese occurrences still require individual decisions; keep an audit note for each merge, split and excluded non-emotion term.

## Expression examples · October 2026 pilot expansion

The canonical `expression` field is now an **ordered array of 3–4 bilingual `{en, zh}` pairs**, generated unchanged into runtime `say`. All five current pilots contain three **editorial drafts**, with original primary expressions preserved as the first item. They are not new reviewed or published entries.

Curate short, speakable examples with different communicative functions: (1) name the feeling, (2) describe a concrete reaction or moment, and (3) connect or ask for help. Avoid three synonyms with no new use, over-abstract phrases, coercive hug requests, or making children perform emotions. Every translation must sound natural to a child rather than literal or textbook-like.

The UI shows all examples, always bilingual, with a speaker button for the primary display language on each card. The sharing PNG intentionally displays only the first **two** examples; order therefore conveys editorial priority, not arbitrary sorting. Keep the default first entry a direct and useful expression. Adding a fourth requires a distinct usage situation. More examples are not a reason to fabricate new illustration scenes.

All five original pilots and 230 migrated canonical drafts now have three individual bilingual expression pairs. The latter use 189 explicit expression overrides plus 41 originally composed sets. All remain drafts until semantic, translation and child-suitability approval.


## Five-pilot cross-modal calibration (October 2026)

The first implementation lives in `data/editorial/pilot-calibration.json`: five **proposed** before/after changes with rationale and a contrast from nearby feelings. The corresponding five static-scene briefs live in `data/illustration-briefs/pilots.json`. They are checked against `data/concepts/pilot.json`; the public/runtime data continues to use the shared neutral placeholder.

Use `npm run review:editorial` for the **full canonical catalog** and `npm run review:editorial -- --pilot` to focus on the five pilots. Add `--json` to capture machine-readable advisory findings. The checks only flag obvious form risks (sentence length, missing translations, duplicate or excessively similar expressions); review meaning, ages, tone, bilingual naturalness and emotion distinctions manually. Do **not** automatically rewrite/approve the 220+ migrated previews or the ten withheld high-risk senses. Record each independently reviewed decision in the canonical editorial review and existing source ledger; do not modify the original ZIP archive.

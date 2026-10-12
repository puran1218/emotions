# Content architecture and review gate

**Never equate source-word occurrences with publishable emotion concepts.** Preserve the original four lists under \`data/source-words.json\`: English met=107, unmet=135; Chinese met=31, unmet=49. English has 242 occurrences but 234 distinct spellings, and eight forms occur in both categories (aroused, concerned, cool, intense, keyed-up, overwhelmed, sensitive, surprised).

## Single source of truth

Do not edit `static/emotions/data/emotions.json` by hand. Maintain `data/concepts/pilot.json` (future curated batches next to it), validate against `schemas/emotion.schema.json`, and regenerate the static projection using `npm run build:data`. Source occurrence lists and the review ledger remain separate so semantic merges never delete original evidence. Only `published` concepts with all four review approvals and an approved illustration qualify for release.

## Data model

One display concept/sense has a stable ID, an explicit source mapping, needs categories (which are not judgments about good and bad), a kind (emotion / feeling state / attitude / physical state / other), natural noun/feeling forms in each language, bilingual *definition* (what it is), *scene* (one everyday example) and *say* (a natural first-person phrase), emoji, an approved 3:2 scene image and bilingual descriptive alt text, a pronunciation phrase/locale, and manually selected related IDs. Some English adjectives have no natural noun: never synthesize an awkward one just to complete a field.

No assumption of one-to-one English–Chinese equivalence. If the same written form means different things across contexts, create stable sense IDs (e.g. \`concerned-care\` and \`concerned-worry\`) and record both source occurrences. Do not delete the second category occurrence. Preserve \`Guilty\` (内疚 rather than 有罪 in feeling context), \`Mad\` (生气 rather than 发疯), \`Suspicious\` (怀疑 rather than 可疑), \`Concerned\`, \`Complacent\`, \`Aroused\`, \`Cool\`, \`Hot\`, \`Lazy\`, \`Depressed\` for careful sense checks.

## Publication gate

Each review record goes through **unreviewed → drafted → content-reviewed → illustration-reviewed → published**. Content review requires authentic bilingual word forms and meaning, accurate child-facing explanation, a scenario that illustrates the *feeling* not a stereotype, and a speakable first-person sentence. Illustration review requires scene/word alignment, stable character appearance, legibility at 320px wide, alt text, inclusion, technical dimensions, and approved art license/provenance.

Publish only if all fields and review stages are complete. Editorial pilot is separate from published data. The five current display entries are explicitly pilot examples and are **not** evidence that the legacy 235 English translations have been individually reviewed. Do not run automatic translation or generate child-directed definitions as an unchecked bulk process.

## Review ledger

The next step is create \`data/review-ledger.jsonl\` from the occurrences, including source_language, source_category, source_index, original_term, proposed_concept_id, sense_decision, translation_status, definition_status, scenario_status, artwork_status, reviewer, reviewed_at. Keep an audit note for every merged/split sense and every omitted non-emotion term. Original Chinese words (including 心旷神怡) should remain first-class review candidates.

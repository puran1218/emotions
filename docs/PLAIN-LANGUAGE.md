# EmoLex Plain Language · Editorial review rubric

**Purpose:** help a child understand one feeling, tell it apart from nearby feelings, and use it in a real conversation. This guideline is **inspired by** ASD-STE100's clarity discipline; it is **not ASD-STE100 compliance**, does not import its restricted approved-word dictionary, and does not apply aircraft-maintenance sentence rules mechanically. A dictionary of feelings must preserve nuance, uncertainty, warmth and natural speech.

References: [asd-ste100-skill](https://github.com/danyuchn/asd-ste100-skill) (strict vs STE-flavored modes) and [ASD-STE100](https://www.asd-ste100.org/). The referenced skill itself excludes creative/persuasive prose. EmoLex uses selected principles only.

## Meaning first, shortening second

Before rewriting any field, identify: (1) what this feeling means, (2) when a child **might** feel it, (3) what distinguishes it from a nearby feeling, (4) what the child could naturally say, and (5) whether English and Chinese represent the same *sense*. Never treat a face, one event or a needs-met/unmet classification as diagnostic or universal.

### Definition · high clarity discipline

- Prefer a concrete, common subject and verb. Give a short explanation, not a synonym loop ("sad means feeling bad") or circular definition ("joy is feeling joyful").
- Most definitions fit **one or two short sentences**; aim for roughly 8–25 English words per sentence rather than using 25 as a universal hard cap. Preserve meaning when extra words are needed.
- Make a cause or trigger **possible**, not obligatory: "You **may** feel..." not "You **always** feel...". Do not remove "sometimes", "might" or other meaningful uncertainty to make the sentence shorter.
- Avoid vague boosters ("very extremely intense"), excessive abstractions ("emotional dysregulation"), passive constructions with confusing agents, and metaphor **without explanation**.
- Keep related feelings distinct: frustration requires a blocked effort; disappointment follows an outcome below hope; sadness need not involve a failed effort. Loneliness involves wanting connection, not simply being physically alone; relief involves a prior worry, not just joy.
- Name the emotion in an understandable form; the target feeling word itself is allowed to be unfamiliar, as is natural first-person language in examples.
- If a term has several senses or is a trait/physical state rather than an emotion, review the *sense* before changing its wording. Do not quietly equate non-identical English and Chinese terms.

### Scenario · concrete but not prescriptive

- Show **one** familiar event; make the situation and feeling relationship plausible rather than claiming everybody feels the same.
- Use ordinary actions, a small number of people and objects, and observable cues. The same scene must be drawable as a single still frame.
- Explain any key *invisible* information in the text (wishes, effort, past worry); the illustration brief must identify visible proxies instead of assuming a facial expression proves the feeling.
- The English and Chinese scenarios should tell the **same event**, naturally, without adding different facts.

### YOU CAN SAY... · natural language wins

- Keep **3–4** bilingual *speakable* examples. Preferred functions: (1) name the feeling; (2) connect it to the scene; (3) ask, connect or share with another person. These are functions, **not three rigid sentence templates**.
- Prefer language a child would actually say. Questions, contractions, interjections and everyday phrasal verbs are acceptable, even when strict STE would ban them.
- Every English example must have a natural Chinese counterpart. Translate for intent and tone, **not** word-for-word grammar.
- Do not fill out the quota with near-identical synonyms. Do not make help-seeking, sharing, or hugging obligatory. Consent and caring treatment of people and animals matter.
- Place the most useful two examples first: the Share PNG shows only those two.

### Bilingual review

- Review `terms`, `definition`, `scenario`, `expression`, `pronunciation` together. In Chinese, prefer children's natural speech to adult explanatory terms; an accurate noun can be more formal than the ordinary phrase used in speech.
- Keep explicit time/certainty distinctions: "was worried, now relieved" is not interchangeable with "was happy".
- Do not automatically collapse expressions for "lonely" and "alone", "frustrated" and "angry", or "affectionate" and "loving".
- Explain cultural/context sensitivity without moral rankings of feelings. Needs-met and needs-unmet are categories of experiences, not "good children" vs "bad children".

## Review procedure

1. Read the existing canonical concept, source mappings and legacy explanation. Record the original text before revising.
2. Write a one-line `coreMeaning` and `distinctFrom` contrast. If sense is uncertain, **flag** it and stop; do not guess.
3. Revise definition, then scenario, then the three speaking examples. Verify the two languages independently and together.
4. Read each phrase **aloud**. Ask whether an approximately third-grade child would naturally say it. Check that the phrase expresses the declared emotion, not just the scene.
5. Produce a static illustration brief **from the approved scenario** (see `VISUAL-EXPLANATION.md`). Check that the art plan does not invent facts or imply a unique facial signature.
6. Run `npm run review:editorial` for a **heuristic, advisory** report. Run `npm test` for the five pilot regression guards. Review every flag, including false positives.
7. Record before/after, rationale, and any unresolved risk in `data/editorial/pilot-calibration.json`. Do **not** set `review.*` to approved without independent human editorial sign-off.

## Five-pilot calibration bar

The calibration must distinguish **Joy** from a general peaceful state, **Frustration** from anger/disappointment, **Loneliness** from chosen solitude, **Affection** from forced physical touch and **Relief** from simple happiness. Review the English and Chinese independently. Do not extend the five reviewed examples to the other 220+ drafts by templated replacement.

## What the automated review can and cannot do

`scripts/review-editorial.mjs` is a no-dependency, read-only suggestion tool that flags long sentences, long spoken examples, near-duplicate examples, missing or malformed bilingual text and possible definition circularity. It does **not** determine factual correctness, emotional meaning, cultural fit, sense distinctions, or whether an image communicates an emotion. Counts/flags are triage evidence, never certification.

## Full migrated corpus rollout

The method has now been applied to every one of the **230 canonical migrated concepts** (besides the five original pilots). See [Full Corpus Calibration](FULL-CORPUS-CALIBRATION.md), `data/editorial/legacy-calibration.json`, and `data/editorial/legacy-review-packets.json`. All new bilingual definitions and scenarios are individual proposals, with **70 additionally corrected expression pairs** across 67 concepts. The derived runtime JSON is reproducible through `npm run migrate:legacy` and `npm run build:data`. The tool's semantic and structural findings are **triage**, not certifications; all concepts remain without independent human editorial approval. 10 ambiguous entries stay withheld.

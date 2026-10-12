# Review ledger workflow

The file \`data/review-ledger.jsonl\` contains **322 source occurrences**, not 322 unique concepts. 242 English (107 met + 135 unmet) and 80 Chinese (31 met + 49 unmet). Every source occurrence has its original language, source category, index, spelling, and editorial workflow states.

Work on each occurrence rather than assigning one ID to each word. Decisions:
- **new-concept**: create a new sense with stable ID;
- **merge**: an equivalent occurrence links to an already-existing concept, preserving its own row;
- **split**: a multi-sense term gets distinct conceptual IDs;
- **related-non-emotion**: preserve as supplemental vocabulary outside the emotion core;
- **exclude**: preserve source but hide from the published dictionary with explicit reason.

Status transition: \`unreviewed → drafted → content-reviewed → illustration-reviewed → published\` (or \`excluded\` with written reason).

Before marking \`content-reviewed\`: meaning, part of speech, both natural translations, both child-facing definitions, bilingual everyday scene and speakable personal expression must be accurate. Before \`illustration-reviewed\`: 3:2 art and alt should match exactly that scene and pass the illustration bible's seven gates.

Never auto-mark review states "passed" because JSON is structurally valid. Pilot entries are there for UI calibration, **not** to demonstrate all-words review completion. The app displays only pilot content in this branch.

## Priority batch

1. Fix translation/sense pitfalls: guilty / mad / suspicious / cool / concerned.
2. Resolve overlapping senses: overwhelmed / aroused / sensitive / surprised / keyed-up.
3. Separate emotion from state/trait: helpful / lazy / hot / breathless / depressed.
4. Trace all needs_met occurrences in original order, then needs_unmet, then the 80 Chinese terms with especially expressive Chinese-specific concepts.

## Commands

\`npm test\` — validates inventory counts, every ledger occurrence, five bilingual pilot entries, illustration storyboard files, IDs and related links. This is structural testing; **it does not prove translation accuracy or production illustration sign-off**.

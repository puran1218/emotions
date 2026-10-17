# EmoLex Visual Explanation · The scene is the explanation

**Source inspiration:** [Anatomy](https://github.com/wheresryan22/anatomy) and its principle **"The object is the explanation."** EmoLex borrows the *concept-to-concrete-object* reasoning and visual verification, **not** Anatomy's high-detail machinery, isometric rendering, WebGL, physics, animated diagrams, or interactive UI.

**EmoLex principle:** **The scene is the explanation.** A still picture should make the story and relevant emotional context discoverable without a label. This does **not** mean a child must diagnose feelings from faces alone; emotional states are not reliably read from one expression.

## The visual explanation brief

Before any prompt or drawing, create one small structured brief for each concept. The five calibrated references live in `data/illustration-briefs/pilots.json`.

1. **Core meaning:** what feeling is this? Write one accurate plain sentence grounded in the canonical definition.
2. **Story moment:** which *single drawable moment* makes the everyday scenario recognizable? A static image cannot show a whole time sequence, so choose one telling frame.
3. **Visible evidence:** what concrete props, actions, posture, gaze and spatial relationships support the story? For invisible history (effort, past fear, desire for company), identify an **honest visible cue**, not a claim that the image proves it.
4. **What the viewer should notice first:** choose **one** focal relationship, not a bag of symbolic decorations.
5. **Confusion test:** which other feeling could this accidentally depict? State a positive discriminating cue and a negative constraint.
6. **Child-safe art direction:** a friendly consistent character, appropriate agency/consent, unthreatening facial structure, no stereotype or moral coding.
7. **Without-text test:** a child should explain *what happened*, and have a plausible guess how the child feels. After reading the definition/scenario, they should recognize the same story.
8. **Technical fit:** one horizontal 3:2 master; principal action inside a ~12% safe edge; strong readable silhouette at ~90px Explore thumbnail and full Detail view; no text/word labels embedded inside art.

## Static story composition

Read **the real scene** before creating it. Inventory only the essential actors, props and relationships: what is held, what changed, where the other person stands, what is missing or found. Make every detail earn its place. Do not import Anatomy's "40–80 machine parts" quota: children's sketch stories need **meaningful simplicity and generous whitespace**.

A good scene has two layers of reading:
- **First glance (thumbnail):** recognizable event and a clear primary action.
- **Closer look (Detail):** small truthful cues that deepen understanding, such as tipped-over blocks, a partly unzipped bag, eyes turned toward distant children, or a relaxed shoulder.

Do not force the scene into a before/after split panel, multiple consecutive events or explanation arrows. A small amount of narrative context is enough. Color may support warmth or attention but **does not classify feelings morally**.

## Art style stays unchanged

Follow `ILLUSTRATION-BIBLE.md`: **Playful Color Sketch**, hand-drawn with joy, colored with feeling. Soft graphite contours, a small marker/crayon palette, warm paper, believable child proportions and welcoming faces. Keep blush within the face and facial features anatomically coherent. Characters (Mei, Noah, Lin) must be recognizable across scenes without making any one person the permanent "sad/angry" child. No watermarked text, stereotype icons, emoji faces or dramatic distress.

## Truth, ambiguity and examples

- **Joy:** an opened sunflower *the child planted*, open relaxed posture; distinguish from noisy victory/excitement.
- **Frustration:** a fallen block tower beside a child trying carefully; tension suggests effort blocked, not deliberate destruction or rage.
- **Loneliness:** a child sitting apart while looking toward others at play; longing for connection rather than content solitary reading.
- **Affection:** a dog approaches willingly and the child responds gently; consent and mutual comfort instead of forced hugs.
- **Relief:** an open schoolbag and recovered book in the child's hands, shoulders releasing tension; evidence of *worry ending*, not unexplained delight.

## Review and implementation

The JSON brief is an **editorial planning artifact**, never an instruction for automatic publishing. Its `id` and `scenario` must match canonical data; source fields allow review provenance. Each brief supplies **mustShow**, **mustAvoid**, **confusableWith**, **visualTest** and **composition**. A reviewer checks both word/scene fidelity and image aesthetics.

Current EmoLex uses a neutral `feeling-placeholder.svg`. **Do not replace it in this branch**. Future art generation reads the briefs and the existing illustration bible, generates actual artwork, records source/approval in `art/manifest.json`, updates canonical `illustration.src/stage/alt`, regenerates runtime JSON, and tests Explore, Detail and PNG sharing. No animations or product UI changes are required.

## Full-corpus static planning records

The 230 migrated entries now also have source-aligned **conceptual candidates**, generated reproducibly from individually revised bilingual meaning and scenario: `data/illustration-briefs/legacy-candidates.json`. This file is an inventory for the future art branch, **not 230 fully crafted illustration prompts**. Each candidate still needs one human-designed observable story beat, specific props/body-language choices and a unique confusion test. The five original pilots at `data/illustration-briefs/pilots.json` remain the quality bar for completed briefs. Never treat an automatic candidate or a neutral placeholder as artwork approval.

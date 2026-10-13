# EmoLex illustration bible · v2 · Playful Color Sketch

**Art direction: Playful Color Sketch.** Friendly, slightly wobbly charcoal/pencil outlines, hand-colored crayon and marker fills, a few lively doodles, and generous warm-paper white space. The result should look inviting enough for a child to imitate, without adding a drawing feature to the app. Each picture must still show one concrete event and an accurately legible feeling, rather than an emoji or an exaggerated caricature. The illustration and child-facing scene text must refer to the **same** moment.

## Recurring cast

- **Mei** (~8): chin-length dark brown hair + natural bangs, mustard pullover, slate trousers and simple canvas shoes. Same facial proportions and clothing recognizable across scenes.
- **Noah** (~9): soft dark curls, sage jacket, cream trousers, friend, never designated the "angry" character.
- **Lin** (~7): short straight hair, terracotta jacket, blue shoes.
- Families and companions can vary in skin tones, ages, body types and accessibility; never encode feelings in gender or appearance.

## Palette (not a moral classification)

Paper \`#F8F4E9\`, afternoon \`#E9C991\`, mustard \`#D9AC59\`, slate \`#6D8796\`, sage \`#94A58D\`, terracotta \`#BA7C65\`, graphite \`#5B5957\`, peach \`#DCAD95\`. No categorical "bad=red, good=green" system. Slightly uneven graphite/chocolate linework, visible pencil strokes and crayon-colored details; no wet watercolor wash as the dominant style. No plastic 3D, photoreal faces, perfectly uniform vector outlines, neon gradients, embedded text, logos or watermark.

## Master, composition & responsive crop

Create a reproducible **3:2** master (for raster art, 1536×1024 px or above; clean 960×640 sketch SVGs are acceptable as studies). The original frame remains visible on mobile (\`object-fit:contain\`); for illustrations on narrow 320px phones, keep main action inside ~**12% edge safe area** and avoid tiny props. One clear story beat (actor/action/consequence), supporting setting, expressive posture and eye direction. Keep the scene readable *without* UI labels. Desktop/iPad may frame it side by side with words; do not create a different crop that removes key context.

## Production scenes and semantic tests

| Concept | Event | Body language | Do not confuse with |
|---|---|---|---|
| Joy | sunflower grown by child blooms | open arms and easy smile | explosive excitement |
| Frustration | carefully built tower falls again | brows down, shoulders tight, hand on block | fury |
| Loneliness | child with soft toy watches distant group | inward posture, spatial distance | intentional peaceful solitude |
| Affection | friendly dog arrives, gentle hug | relaxed arms, leaning closer | relief |
| Relief | missing favorite book found inside school bag | visible bag/book and released shoulder tension | unqualified excitement |

## Prompt template

"Playful color sketch for a children's illustrated dictionary, slightly wobbly graphite outlines and textured colored-pencil/crayon fills, simple lively shapes, warm off-white paper with abundant breathing room, bright but restrained sunflower mustard, sage, slate and coral, a recurring child character [description], one everyday moment [precise event], natural expressive gesture [precise physical cues], landscape 3:2 with 12 percent edge-safe area, strong silhouette recognizable at 90px-wide sidebar thumbnail, no lettering, no emoji, no border, no watermark." Provide one concept-specific **negative** confusion (e.g. no intense triumph for relief).

## Approval checklist

1. Distinct trigger/event without text.
2. Semantically accurate and not a caricature.
3. Character model consistency in outfit/proportions.
4. Small-screen 320px legibility and 3:2 intact.
5. No stigma, shaming, hostile stereotypes or violence.
6. No text, watermark, logo, broken hands or stray visual artifacts.
7. Alt text accurately describes the image and matches scenario.

## Asset lifecycle and versioning

PR #1 ships only the **neutral, shared** `static/emotions/images/feeling-placeholder.svg` with `illustration.stage: pending`. Early watercolor storyboards, recolored studies and the bolder v2 character sketches were removed from the published static directory; their experiments remain recoverable from PR #1 Git history. **None is production-approved.**

In the future illustration branch, create an original `static/emotions/images/<concept>-vNN.webp` or SVG master plus an archive under `art/originals/`. Record illustrator/source/license, dimensions, revision, semantic QA and reviewer approval in `art/manifest.json`. Update each concept's canonical `illustration.src`, `stage`, and actual-image bilingual `alt`, regenerate runtime content, and test Explore thumbnail, Detail and offline share PNG. No UI redesign is needed.

Never claim placeholder art is a scene depiction. Publishing **content-approved words with the neutral placeholder** is permitted; approving the illustration itself is a separate later gate. A non-placeholder, unapproved per-word sketch must not silently become a published image.

## Facial expression checks for future art

Previous prototype faces had blush outside the face shape; that made the characters unintentionally frightening. New sketches need cheeks that stay within the facial outline, stable relative eye/brow/mouth placement, consistent proportions, and expressive but welcoming faces. Use human visual assessment across all five sample emotions and at phone thumbnail sizes; do not depend on the previous SVG coordinate system as a global art rule.

The illustration work deliberately comes **after** the plugin-and-content PR. No drawing feature is planned.

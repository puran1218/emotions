# EmoLex illustration bible · v1.1

**Art direction: Soft Editorial Storybook.** Never draw an emotion as a floating emoji or a huge caricatured face. Make one small, believable event visible. Illustration and bilingual child-facing scene copy must describe the **same** moment.

## Recurring cast

- **Mei** (~8): chin-length dark brown hair + natural bangs, mustard pullover, slate trousers and simple canvas shoes. Same facial proportions and clothing recognizable across scenes.
- **Noah** (~9): soft dark curls, sage jacket, cream trousers, friend, never designated the "angry" character.
- **Lin** (~7): short straight hair, terracotta jacket, blue shoes.
- Families and companions can vary in skin tones, ages, body types and accessibility; never encode feelings in gender or appearance.

## Palette (not a moral classification)

Paper \`#F8F4E9\`, afternoon \`#E9C991\`, mustard \`#D9AC59\`, slate \`#6D8796\`, sage \`#94A58D\`, terracotta \`#BA7C65\`, graphite \`#5B5957\`, peach \`#DCAD95\`. No categorical "bad=red, good=green" system. Paper grain, soft watercolor washes, soft colored-pencil contour; no plastic 3D, photoreal faces, black uniform outlines, neon gradients, text, logos or watermark.

## Master, composition & responsive crop

Paint at **1536×1024 px or above**, landscape **3:2**. The original frame remains visible on mobile (\`object-fit:contain\`); for illustrations on narrow 320px phones, keep main action inside ~**12% edge safe area** and avoid tiny props. One clear story beat (actor/action/consequence), supporting setting, expressive posture and eye direction. Keep the scene readable *without* UI labels. Desktop/iPad may frame it side by side with words; do not create a different crop that removes key context.

## Production scenes and semantic tests

| Concept | Event | Body language | Do not confuse with |
|---|---|---|---|
| Joy | sunflower grown by child blooms | open arms and easy smile | explosive excitement |
| Frustration | carefully built tower falls again | brows down, shoulders tight, hand on block | fury |
| Loneliness | child with soft toy watches distant group | inward posture, spatial distance | intentional peaceful solitude |
| Affection | friendly dog arrives, gentle hug | relaxed arms, leaning closer | relief |
| Relief | missing favorite book found inside school bag | visible bag/book and released shoulder tension | unqualified excitement |

## Prompt template

"Soft editorial children's storybook illustration, watercolor washes on warm paper, colored-pencil accents, muted sage/slate/mustard/terracotta palette, natural child proportions 1:4.5–1:5.5, recurring character [description], moment [precise event], gesture [precise physical cues], gentle realistic natural light, horizontal 3:2 with 12 percent edge safe zone, no text, no emoji, no border, no watermark." Provide one concept-specific **negative** confusion (e.g. no intense triumph for relief).

## Approval checklist

1. Distinct trigger/event without text.
2. Semantically accurate and not a caricature.
3. Character model consistency in outfit/proportions.
4. Small-screen 320px legibility and 3:2 intact.
5. No stigma, shaming, hostile stereotypes or violence.
6. No text, watermark, logo, broken hands or stray visual artifacts.
7. Alt text accurately describes the image and matches scenario.

## Source and versioning

Assets at \`static/emotions/images/<concept>-vNN.webp\` backed by originals at \`art/originals/\` when approved. Keep \`art/manifest.json\` with concept, source, source dimensions, revision, approval status, alt and QA notes. Do NOT call moodboard panels individually approved. Current UI fallback is a **non-final storyboard** until watercolor masters are explicitly committed and approved.

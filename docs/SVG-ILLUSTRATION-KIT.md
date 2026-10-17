# SVG-first illustration production · Joy pilot

## Objective

Explore a reproducible, lightweight SVG production pipeline for EmoLex while preserving the established **Playful Color Sketch** style and child-friendly visual explanation. Inspired by [Anatomy](https://github.com/wheresryan22/anatomy)'s *meaning → parts → build → audit → refine* workflow, not its isometric mechanics, renderer, or animations. No Anatomy code or dependency has been imported.

## Delivered in PR #3

| Asset | Role |
| --- | --- |
| `art/svg-kit/index.mjs` | Small SVG element primitives, palette, Mei face layout, sunflower drawing helper |
| `art/scenes/joy.mjs` | Authored scene composition: Mei notices the first blossom she grew |
| `static/emotions/images/joy-v01.svg` | Built, self-contained 3:2 Joy candidate |
| `scripts/build-art.mjs` | Deterministic source-to-SVG generation; `--check` detects drift |
| `scripts/check-art.mjs` | Safety, asset budget, source references and publication boundary tests |
| `art/preview.html` | Side-by-side full-size and Explore thumbnail previews |
| `art/manifest.json` | Candidate stage and pending manual review tasks |

The SVG intentionally depicts **one story beat**, using recognisable clothing, facial geometry, plant, clay pot, and gardening objects. It must be judged on semantic clarity, anatomy, and visual warmth, not only byte count.

## Commands

Run from repository root:

```bash
npm run art:build
npm run art:check
npm run art:preview
npm test
python3 -m http.server 8000
```

Then open `http://localhost:8000/art/preview.html`. The preview command generates and validates the art and prints the preview URL; it does not launch a server. Review at 120px and 960px, and manually test narrow/mobile browsers.

## Constraints for micro.blog

- **Target:** 15–45 KB per published SVG, **hard limit:** 80 KB in `art:check`.
- Fixed vector viewBox `0 0 960 640` (landscape 3:2), no embedded PNG/JPEG, external font, network reference, CSS dependency, animation, script, event handler, external image, or foreignObject.
- A few purposeful hand-drawn lines and crayon-color accents are preferred to hundreds of micro-paths and expensive SVG filters. SVG is not automatically smaller or better-looking than compressed WebP.
- Only publishable SVGs belong under `static/emotions/images/`. Store large raster originals outside the plugin repository to avoid costly Git history and micro.blog cloning.
- Anatomy-specific mechanical parts counts, WebGL, shader layers and interactive geometry audits do **not** belong in this static illustration project.

## Review before publishing

The Joy SVG is explicitly **draft, not human-approved**. In `data/concepts/pilot.json`, Joy still references the same neutral placeholder; the rest of the dictionary is unchanged.

Review against `data/illustration-briefs/pilots.json` and `docs/ILLUSTRATION-BIBLE.md`:
1. **Story:** A child notices a sunflower blossom she grew. Is the event clear without any textual label, and distinguishable from a generic celebratory scene?
2. **Character:** Does Mei read as a consistent ~8-year-old with natural hair, eye, mouth, cheek, hands and clothing? Inspect the 4× face and hand close-ups for accidental artifacts.
3. **Size:** Is the sunflower-and-child relationship clear when viewed in the actual 120px sidebar? Is the full 3:2 frame legible at phone width?
4. **Runtime:** Load on the user's micro.blog site and in Safari. Check SVG as an HTML image and conversion into PNG by the existing share-image Canvas export. Verify saved/downloaded result, not just the export Promise.
5. **Approval:** Only after explicit visual acceptance should a later change update canonical illustration src/stage/alt, reviewer record and runtime JSON. Never set content review statuses to approved as a side effect.

## Five-pilot gate before scaling

Joy is the **first** built proof of concept, not the completed five-pilot milestone. The same SVG kit must next support **Frustration** (fallen rebuilt blocks), **Loneliness** (wanting to join children playing), **Affection** (mutual comfortable dog embrace), and **Relief** (finding the missing book), each with distinct story composition and small-screen tests.

The 230 legacy visual records are conceptual candidates, **not** production-quality storyboard briefs. Only after the five pilot artworks pass human visual review should we invest in building hundreds of SVGs. Allow a WebP exception if a specific rich illustration is meaningfully better at equal or smaller compressed size.

`art/production-batch-01.json` is a historical study using an older “Soft Editorial Storybook” label. The **current** design authority remains the Playful Color Sketch Illustration Bible.

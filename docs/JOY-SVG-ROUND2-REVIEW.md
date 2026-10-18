# Joy illustration: second SVG feasibility experiment (2026-10-18)

**Status:** exploratory review, **not approved, not published, not a format decision**.

This note records a real rendered comparison following the user's rejection of the first `joy-v01.svg` artwork. The actual experimental SVG assets, corresponding rendered PNGs, 120px previews, WebP baselines and reproducible local Python scripts were delivered as `EmoLex-Joy-SVG-Round2-Review.zip` in the review conversation. They are **not committed or connected to the live dictionary** while the user evaluates the next decision.

## What was actually built and inspected

| Candidate | Actual bytes | Qualitative result |
| --- | ---: | --- |
| Previous `joy-v01.svg` | 16,957 | Rejected: assembled torso/face and limb pose do not meet the Illustration Bible |
| A: new hand-composed silhouette-first SVG | 15,896 | Natural parts connect more coherently; scene reads, but proportions remain too chibi/flat |
| B: hand-composed Playful Color Sketch SVG | 45,939 | Adds pencil-like strokes but still not comparable to approved richer sketch reference |
| C: raster-derived simplified SVG | 36,390 | Reference anatomy better preserved, but facial features and fingers fragment into ugly color islands |
| C-detail: higher-complexity raster-derived SVG | 52,176 | Further complexity does not fix face or restore convincing drawing |
| 960×640 WebP quality 72 | 73,398 | Retains original sketch style, warm palette, natural pose, convincing face |
| 960×640 WebP quality 82 | 101,838 | Additional texture and detail at a modest cost |
| 960×640 WebP quality 90 | 149,078 | Very high quality, probably excessive for ordinary micro.blog browsing |

The raster-derived SVG is **only a diagnostic experiment**: it extracts actual vector paths and contains no embedded PNG/JPEG, but is not a reusable SVG scene construction solution. The original human-curated reference artwork remains the benchmark.

## Review criteria

- **Anatomy & expression:** A/B improve gross limb placement relative to v01 but still fail the desired natural child anatomy and hand-drawn character appeal. C is especially flawed in the face at full size.
- **Scene semantics:** All show a child responding to a sunflower blossom, with care/gardening cues. Text or emoji was not substituted for scene understanding.
- **Thumbnail:** A/B/C remain broadly recognizable at a real 120px width; that alone is not enough to ship.
- **Texture:** A is flat, B's sparse strokes do not adequately recreate rich colored-pencil shading, C produces color fragmentation. WebP retains the reference's actual visual texture.
- **Size:** All SVG variants are under the 80KB hard limit. Even the clearly better-looking WebP q72 is 73.4KB, which is small in absolute terms. Extrapolation: 225 same-size WebP files ≈16.5MB of art, not counting Git object history; the size goal alone is not a good reason to lower visual quality.
- **Technical checks:** Standalone SVG XML and CairoSVG rendering pass; hand-sketched SVG also renders with Inkscape. Local Chromium navigation to both file and localhost was blocked by administrator policy, so real Chrome/Safari Canvas PNG sharing was **not established** by this experiment.

## Decision boundary

**Provisional quality assessment: SVG round 2 did not meet the approved Illustration Bible visual benchmark.** The evidence currently favors high-quality optimized WebP for complex person-centered pictures, with SVG still useful for simple icons or diagrams. **This is not the user's Step 4 decision.**

Do not automatically commit experimental raster trace output to plugin production, replace `illustration.src`, promote `art/manifest.json` to approved, generate the other 4 pilots, or merge PR #3. Wait for the user's evaluation of the rendered comparison and explicit direction. The previous Joy v01 file on this Draft PR should be treated as a **rejected experimental baseline**, notwithstanding structural CI success.

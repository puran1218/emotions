# EmoLex WebP-first illustration production

**Decision (2026-10-18):** use **optimized WebP** for every published emotion illustration. SVG remains appropriate for small UI symbols, simple diagrams and the existing neutral placeholder. This is a delivery-format choice, **not** a change to the [Playful Color Sketch Illustration Bible](ILLUSTRATION-BIBLE.md) or the [Visual Explanation](VISUAL-EXPLANATION.md) principle: **The scene is the explanation**.

## Why WebP

Rendered Joy feasibility testing found two smaller SVGs with improved body structure but visibly weaker child anatomy, face design and colored-pencil texture; raster tracing of high-quality reference art produced unattractive facial fragments. The approved *direction* was the richer illustrated look, so visual quality outweighs unneeded vector editability. Actual 960×640 reference measurements:

| Quality | Bytes |
| --- | ---: |
| 72 | 73,398 |
| 82 | 101,838 |
| 90 | 149,078 |

Those numbers describe **one Joy reference** only; not every emotion will compress to the same size. See historical [Joy SVG feasibility review](https://github.com/puran1218/emotions/blob/feat/svg-illustration-kit/docs/JOY-SVG-ROUND2-REVIEW.md); the unmerged SVG PR #3 was superseded and closed.

## Asset specification and budget

- **Canvas:** 3:2 landscape with the whole story visible. Keep high-resolution PNG source privately/local to your creative process; normal delivery is **960×640 WebP**, with **1200×800** allowed when visual testing proves the improvement.
- **Encoding:** lossy WebP, generally quality 72–82 as an initial comparison band, 78 as a reproducible starting value. Use a per-image quality after close-up checks; the encoder number is not a semantic or visual rating.
- **Preferred** <= **120 KiB per image**, **hard limit 180 KiB**. **Site artwork budget <=30 MiB** for the first 225 browseable terms (not counting Git history and other plugin files).
- **Structure:** files directly under `static/emotions/images/` named `joy-v01.webp`, `frustration-v01.webp`, etc. No external asset downloads or fonts; keep files static and suitable for browser Canvas image loading.
- **Source policy:** do not commit multi-MB PNG originals, large model output files, exploratory vectors or preview screenshots to this micro.blog plugin repo. The published WebP is the only large art file for that version.
- **Original asset ownership:** record the creation method and human review; do not guess a third-party creator/license. Keep a local source-to-output record before release.

Even 225 files averaging 100 KiB would total about 22 MiB. Keep revision churn of binary blobs low: experiment outside the plugin repo and commit only visually accepted candidates, because Git retains old revisions.

## Image pipeline

The **image generation/content step remains creative and separately reviewed**; the optimizer does not create artwork from text. Use the corresponding definition, story and **Visual Explanation Brief** first. The five canonical pilots are in `data/illustration-briefs/pilots.json`; the remaining 230 records are conceptual *candidates*, not completed briefs.

From a local high-resolution **3:2** source (not stored in Git):

```bash
python3 -m pip install Pillow
python3 scripts/optimize-art.py --input /local/art/joy-master.png --id joy --out /tmp/joy-v01.webp --quality 78 --width 960
# compare 72, 78, 82 (and potentially 1200-wide) at full size and 120px thumbnail
npm run art:check
npm test
```

The optimizer rejects non-3:2 input instead of silently cropping vital scene context. It strips source metadata when saving. **Optimizing does not automatically copy the asset into the published directory.**

After **explicit artistic and semantic sign-off**:
1. Copy the chosen WebP into `static/emotions/images/<concept>-vNN.webp`.
2. Add its actual path, format, dimensions, review evidence, creator/source and explicit approval to `art/manifest.json`.
3. Update that concept's canonical `illustration.src` to `./images/<concept>-vNN.webp`, set `illustration.stage` to approved and `review.illustration` to approved **only after actual reviewer authorization**. Update both EN/ZH alt strings to describe what the image *really depicts*.
4. Run `npm run build:data`, `npm run art:check`, `npm test`. Confirm Explore's 120px view, full Detail view, and Share Image PNG rendering in English and Chinese. Test actual mobile Safari native sharing / download and micro.blog install.
5. Do not alter the canonical content's meaning/translation approval statuses merely because the picture was approved.

## First-five pilot consistency caution

Five existing generated image **studies** can be encoded small (960×640 @ quality 78: roughly 81–92 KiB each). **They are not production-approved.** Most use a high hair bun and blue overalls, while the locked Illustration Bible specifies *Mei with chin-length dark brown hair, mustard pullover and slate trousers.* Publishing them without reconciling the character design would violate the existing product design. Do not change the Bible just to fit the images without a conscious design review.

When a batch is approved, establish one stable character model (wardrobe, face, hair, proportions) from the Bible and reuse it across Joy, Frustration, Loneliness, Affection and Relief. These five are the calibration gate for the rest of the dictionary.

## What CI can and cannot prove

`scripts/check-webp.mjs` examines actual RIFF/WebP headers (VP8, VP8L, VP8X), verifies 3:2 dimensions, file names, individual/aggregate byte budgets, manifest linking and canonical approval consistency. It does not measure visual appeal, actual WebP pixel decoding, human meaning judgments, font rendering or real Safari share sheet behavior. Pillow decodes and verifies candidate outputs locally. The project CI remains green with the intentional neutral placeholder while artworks are awaiting approval.

No raster source, full batch ZIP or unreviewed published illustration should land on `main` simply because its encoding satisfies the budget.

## Importing artwork generated in ChatGPT

**Image generation in a chat does not automatically commit files to GitHub.** Save the resulting images locally, or download the compressed candidate ZIP prepared in the chat. Files are deliberately kept outside the release repo until a reviewer confirms that the illustrated *event* matches the current bilingual `scenario`.

After PR #4 is merged, branch from `main` for a small, reviewed art batch. With an accepted **960×640 or 1200×800 WebP** somewhere on disk, run:

```bash
npm run art:stage -- --id curious --file /path/to/curious-approved-scene.webp --version 01
npm run art:check
npm test
```

`art:stage` checks that the concept exists and is not withheld, validates WebP dimensions and the 180 KiB budget, prevents overwrites, copies the file into `static/emotions/images/curious-v01.webp`, and registers an **unapproved candidate** in `art/manifest.json`. It prints the actual EN/ZH canonical scenario so you can visually compare it to the picture. The command intentionally **does not** change canonical `illustration.src`, generated runtime JSON, approval status, or alt text. It cannot determine semantic correctness automatically.

After human visual/meaning approval, make a separate intentional publication change with a persistent canonical illustration source mapping. **Do not edit only `data/concepts/legacy-expanded.json`**: legacy data is generated and gets overwritten by `npm run migrate:legacy`. Keep source-level art assignments and projected runtime data reproducible. Review the first real publication integration in a PR before applying to hundreds of terms.

Commit and push only reviewed batch artwork and source changes, not original multi-megabyte PNG files or unreviewed candidate ZIP files. Typical workflow:

```bash
git switch main && git pull --ff-only
git switch -c feat/illustrations-batch-02
# run npm run art:stage for each reviewed WebP, then npm run art:check && npm test
git add static/emotions/images art/manifest.json
git commit -m "art: stage reviewed WebP illustration candidates"
git push -u origin feat/illustrations-batch-02
# Open a PR for actual visual review and eventual publish reference updates.
```

The format pipeline and the first few production batches should be merged independently to keep Git history clear.

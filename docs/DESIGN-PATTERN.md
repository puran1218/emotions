# EmoLex Design Pattern · v1 · Illustrated Dictionary

**Product:** EmoLex — An Illustrated Dictionary of Feelings. **Deployment:** a self-contained, static micro.blog plug-in at `/emotions/`. **Scope:** Explore → Understand → Express. This release has **no drawing activity, AI service, log-in, backend or analytics**.

This document is the contract for future editorial, illustration and UI changes. The app does not need new UI work when a finished illustration replaces a placeholder.

## Product principles

1. **A picture book, not a dashboard.** Warm paper, light borders and expressive but restrained accents. Large illustration first; clear words and short child-facing explanations.
2. **One feeling, one canonical concept.** The explanation, everyday scene and three or four natural sentences tell the *same* coherent story without teaching by quiz.
3. **Illustration complements, not replaces, language.** A child must understand the word even when only a shared placeholder is available.
4. **Bilingual together, rather than two apps.** EN and ZH visible in every section; order switches with one control. Browser TTS speaks the current primary language, with a separate speech button for each example.
5. **Visually recognizable actions.** Share link and Share image remain separate; Explore rows, titles and audio buttons never rely on emoji alone.
6. **Review truthfulness.** Prototype content and unapproved art are identified as such. Passing JSON/schema validation is not editorial approval.

## Responsive composition

| Available CSS width | Layout | Navigation |
| --- | --- | --- |
| < 600 px | One illustrated Explore page or one Detail page; sentence cards stack | Tap entry → Detail; Back returns Explore |
| 600–899 px | One page at a time, with more spacious content | Same routes |
| 900–1199 px | Explore (left) + Detail (right); expression cards in two columns | Selecting entry updates Detail without leaving the two-pane shell |
| ≥ 1200 px | Spacious two-pane page, three expression columns | Same selection/deep-link rules |

Breakpoints depend on **available viewport width**, not `iPad` device detection. Explore/Detail share the same content/rendering logic across modes. The Explore list is independently scrollable on wide screens and is **not forced to equal** the Detail content height; align their top edges and avoid unnatural stretching. Both pages should work at 200% browser zoom and 320 CSS px.

## Visual tokens

Current authoritative CSS custom properties live in `static/emotions/styles.css`; token changes should be made there and reflected here.

| Role | Token / treatment |
| --- | --- |
| Page paper | `--paper: #F8F5EC` |
| Reading surface | `--surface: #FFFEF9` |
| Primary ink | `--ink: #17343A` |
| Action / word | `--accent: #225D45` |
| Sentence practice area | soft `#E2EDE2` green with pale `#EAF1EA` cards |
| Playful accents | `--sun: #F3B934`, `--coral: #F39E7D` |
| Illustration paper | warm off-white `#FFFCF3` |
| Type | expressive `--playful` for word/section headings; readable `--reading-en` and `--reading-zh` for paragraphs |

Avoid loading remote fonts. System-specific glyph variations need real-device evaluation. Long English headwords are always one line; fit them to available width without cutting off the final letters. All controls need visible keyboard focus and touch targets of at least 44 CSS px.

## Component contract

**Header:** brand → Discover; Explore shortcut; language switch. **Explore:** keyword search, category filters, picture thumbnail, primary/secondary word and concise meaning. **Detail:** headword + pronunciation button, translation/form, illustration, meaning, one situation, green **YOU CAN SAY...** (ordered 3–4 bilingual expression cards, each with speech), related words, share link/image, next feeling.

Do not expand one curated scenario into three invented "common situations" merely to imitate a mock-up. Do not grow permanent bottom-navigation or extra activities without a separate product decision.

## Art direction: Playful Color Sketch

Art should feel **hand-drawn with joy, colored with feeling**: slightly wobbly graphite outlines; bright but limited crayon/marker color; roomy warm-paper background; one believable scene that makes the emotion clear; child-friendly facial features and gestures. Recognizable recurring characters should have consistent clothing and facial proportions. Avoid scary expressions, free-floating cheeks, uniform vector curves, photorealism, text/watermarks or excessive props.

### Illustration asset contract

- The **single shared placeholder** is `static/emotions/images/feeling-placeholder.svg`. It is emotionally neutral, 960×640 (3:2), displays a playful notebook/speech bubble, and never pretends to depict the individual scene. Its accessible alt text says it is a placeholder.
- Every canonical concept has `illustration: { asset_id, src, stage, alt }`. `src` is a local same-origin `./images/<safe-filename>.svg|webp|png`; `stage` stays `pending` while placeholder is used. The image's bilingual `alt` must describe **the actual file**, not the future scene.
- Explore thumbnail, Detail main illustration and Share PNG **reuse the same `src`**. Keep the whole 3:2 composition visible in Detail, do not crop important action. Thumbnails may use `object-fit:cover` only after visual QA.
- If an asset is missing or fails to load, both the UI and offline image renderer fall back to the common placeholder.
- Replacing art later: place the approved image under `static/emotions/images/`, update only that concept's canonical illustration `src/stage/alt`, regenerate the runtime JSON, validate and visually compare mobile/detail/share. No component CSS changes or per-word templates.
- Keep master/original provenance and human approval in an art manifest. The placeholder is not an approved emotion illustration. Draft sketches are intentionally **outside the installation surface** until a future art PR.

## Content contract

`data/concepts/pilot.json` (and future curated batches) is canonical; `npm run build:data` projects to `static/emotions/data/emotions.json` (read-only generated artifact). Each published display concept needs stable ID, sense/taxonomy, natural EN/ZH names, accurate bilingual meaning, one real-life scene, 3–4 **distinct ordered** paired expression examples, pronunciation locale and headword, related IDs, and illustration placeholder/approved art. The first two expression examples go to the offline share PNG; all are shown in the app.

The 242 English source occurrences (234 unique forms) and 80 Chinese source occurrences are an **inventory**, not yet a complete reviewed bilingual dictionary. Editorial migration must trace all 322 occurrences (merge/split/exclude) and independently review every visible concept. In particular, source terms with non-emotional or adult senses must not auto-publish.

## Deployment and acceptance

Only files under `static/emotions/` are published to `/emotions/` by the plug-in. The root `plugin.json` describes this independent, theme-neutral plug-in; **do not** add `includes` pointing to EmoLex CSS/JS, since that would inject it on unrelated blog pages. All URLs and image references are relative to `/emotions/`, and deep links use `?word=<id>`.

Run `npm run build:data`, `npm test`, and `npm run content:coverage`. Use `npm run release:check` to reveal unmet full-content sign-off gates. Then test local `http://localhost:8000/static/emotions/`, install from GitHub as a private Micro.blog plug-in, confirm `https://<your-blog>/emotions/`, inspect phone/iPad/desktop and share a deep link and PNG. Only merge/deploy once the chosen content coverage/review scope is explicitly approved. The illustration PR can follow later without UI rewrites.

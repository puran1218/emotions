# Full-entry export and Daily 5 · User guide

**History:** PR #6 (bilingual A Little Closer review) and PR #7 (full entry export + Daily 5) were merged. PR #9 is a focused follow-up based directly on `main`.

## What can I export now?

The original share PNG deliberately included only the first **two** YOU CAN SAY examples and omitted A LITTLE CLOSER. PR #7 removes that limitation.

| Format | Content | Use |
| --- | --- | --- |
| **Share/Save image (PNG)** | Current EN/ZH headword, scene illustration, complete bilingual definition, scenario, **every (3–4) spoken example**, A LITTLE CLOSER (when enabled), and actual Related Feelings labels | Share a readable, still, long picture. Text is in the image (not selectable), audio is not embedded. |
| **Download full entry (.md)** | Every bilingual definition/scenario/example, A LITTLE CLOSER with a distinct takeaway and both comparison meanings, Related Feelings, and link to the actual current illustration | Copy, edit, archive, or review a single word in Markdown. The linked image needs the site to remain accessible. |
| **Share link** | Opens the live interactive word page, including browser TTS | Share the most interactive version; requires an accessible published URL. |

**Caveat:** the current source data and the new 225 contrasts are an editorial preview; download integrity is not an editorial certificate. Export does not produce a 225-page PDF, bundle offline illustration images, or package voice recordings. True native Safari image sharing still needs a device check.

## Daily 5 · Five-minute English habit

`/emotions/practice.html` is a lightweight static page with five steps inspired by the five-minute habit the user described from [How to Improve English Fluency Fast (5-Minute Morning Habit)](https://www.youtube.com/watch?v=iPDiEO3tuqM). It does not claim official affiliation with the video.

1. **Listen**: use existing platform English text-to-speech, without showing a Chinese translation.
2. **Repeat**: say the same English aloud three times; tap to count repetitions. No microphone, audio recording or speech scoring.
3. **Change**: explore **three curated transformation groups** per sentence. Try replacing a word, changing who is speaking or involved, or adjusting the time, place, action or task. Each example is written as a complete natural sentence; this is not arbitrary word substitution. Reveal Chinese only when useful.
4. **Imagine**: choose from **three concrete everyday settings** per sentence (such as home, school, friends, or outdoors), each with a bilingual prompt and a speakable English example. Tap a sample to hear it or use it as a starting point; an existing draft is never overwritten.
5. **Write**: write a short personal reflection, explicitly save locally if wanted, or download a Markdown learning note. **The numbered 1–5 step buttons are clickable**, as are Previous/Next; navigation keeps in-session writing and your repetition counter.

The app now rotates through **all 225 visible entries** using the local browser date, with a 225-day cycle. Every entry links directly to its own practice via the **Daily 5 · Practice this feeling** action on the dictionary word page; for example `practice.html?word=quiet` and `practice.html?word=surprised-unmet`. The ten withheld concepts remain excluded. The **Another feeling** action advances through the same 225-entry library.

**Two transparent editorial modes** are used. The 14 existing fully curated starters retain their 98 manually authored English variation examples and 42 bilingual Imagine prompts. For the other 211 entries, the selected phrase and all three illustrative expressions come *directly* from the canonical EmoLex bilingual source (not automated paraphrases). Their three Change categories are guided self-editing tasks: change what happened, who is speaking, or what you want to say next. The learner can seed an editable sentence, adapt it, listen to their own version, and save or download it. The three Imagine prompts include the entry's own specific bilingual story scene, one way to communicate with another person, and a chance to connect it to today's real life. This preserves full **225/225** functional coverage without pretending that 1,266 newly invented translations and variants have been editorially reviewed. The **14 reviewed-structure lessons are editorial drafts** and the **211 source-guided lessons are not independently vetted curriculum**; this is a 225-day content-access cycle, not a guarantee of 225 separately human-edited lesson plans.

Daily5 is **not** a browser microphone listener, AI chat coach, formal five-minute timer or proof of English fluency. The five stages are self-paced prompts that align with the supplied routine.

## Personal writing and privacy

- Nothing is submitted to a server; all runtime assets remain static local files on micro.blog.
- Draft text stays in the current page session as you move through stages.
- Clicking **Save in this browser** writes only the current date/word's situation and note into localStorage. This action is explicit; new practice notes are not silently persisted.
- Clicking **Download my practice** creates a local `.md` file containing the source phrase, variants and your text.
- If the device/browser blocks localStorage, the app shows an error and Markdown download is still available.
- Practice content remains marked as editorial draft; privacy depends on the device/browser being controlled by the reader.

## Development and testing

```bash
npm run build:closer
npm run build:daily5
npm test
python3 -m http.server 8000
```

Open `http://localhost:8000/static/emotions/` and inspect a detail word such as `?word=joy`. The Download full entry button is below the share controls. **Bulk JSON export was removed from the public interface** because it does not support the user's intended personal practice workflow; internal runtime JSON remains essential to the static app. The Daily 5 link is in the header.

Open `http://localhost:8000/static/emotions/practice.html?word=loneliness` and exercise all five steps, English-first visibility, all three Change categories, the three Imagine situations, clickable steps 1–5, preserving written content after jumping back and forth, writing, save/download and browser reload. Check responsive widths 320, 390, 768 and 1280 CSS pixels.

Tests cover deterministic practice source matching, one-word and curated whole-sentence variations, five-button navigation, three everyday prompts per lesson, the complete PNG's text drawing, single-entry Markdown export, and the virtual practice click/write flow. Actual browser decoding, voice quality, native file sharing and the final appearance of very long full-entry PNGs still need real-device validation.

## What to review before broadening this feature

- For each of the 14 sentences, verify the edited speaker/action/time/scene remains natural in a real child's situation. More examples should create **options**, not make the five-minute habit feel like compulsory extra homework.
- Check whether a three-category Change step and three-context Imagine step stay quick and motivating. The user may choose one route rather than doing all examples. Guided-source lessons explicitly show the original dictionary sentence, not a fabricated correct answer.
- Decide whether to expand to a reviewed 30-day/225-day practice curriculum, and whether to add optional audio-speed controls; do not automatically derive lessons for advanced/adult-sensitive concepts.
- Do not change a child's emotion into a problem to be corrected. The daily practice asks for authentic expression, not a "right feeling".

## Iteration · richer Change, Imagine and direct navigation (PR #8)

The full-library JSON download button and unused public exporter are removed; canonical/runtime JSON stays in the repository for the app to work. The full entry Markdown/PNG/share link remain unchanged. Change offers three switchable groups per word, while Imagine provides three real-life prompts with English samples and optional listening. Clicking **1, 2, 3, 4, or 5** takes you to that stage directly; active stage is indicated by `aria-current="step"`. Draft writing, chosen change group and repetition tally are preserved while navigating. Listen and Repeat remain translation-free even when coming back from later stages. All 14 lessons remain editorial drafts and need real child-facing review.

## Full-corpus Daily 5 expansion (PR #10)

This phase reuses the interactive, richer Daily 5 experience created in PR #9, extending coverage from 14 to **all 225 visible EmoLex word senses** while leaving ten withheld senses hidden. The static data generator `scripts/build-daily5.mjs` is the one source of truth for the full runtime projection and its `--check` validation. The first 14 remain in `data/editorial/daily5-starters.json` as hand-written editorial proposals. The 211 other entries derive their **original wording, context and two-language details directly from `static/emotions/data/emotions.json`**; they are clearly labeled `guided-source`, and their on-screen Change examples are canonical dictionary sentences, not automated grammatical rewrites. For each, the child selects one of three purposes (event, speaker, response), edits an actual example, listens to the change, and relates it to their life using three prompts including the canonical scene. The guided text can be saved locally *only after clicking Save*, and is included in downloaded practice notes.

We do **not** mark generated lessons as human-approved. Importantly, entries such as Quiet, Tired, Glorious, and both senses of Surprised can be studied as **words and experiences**, rather than falsely treating them all as emotional diagnoses. Before treating this as a published child curriculum, review and improve the remaining guided instructions, especially adult vocabulary and multi-sense terms. Real-device speech and Safari file-download checks are still required.

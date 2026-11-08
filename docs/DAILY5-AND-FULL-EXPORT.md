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

The app selects one of **14** starter sentences deterministically from the **local browser calendar date** and cycles after 14 days. You can also open `practice.html?word=curious` (for one of the 14 curated starter IDs) or choose "Try another curated sentence".

The 14 source sentences are **exact copies from the current YOU CAN SAY library**, not generated approximations. The first group per lesson keeps strictly verified one-word changes; the other two use explicitly curated whole-sentence variations that change a meaningful part of the message without making ungrammatical automatic substitutions. Each of the 14 lessons now offers three Change categories (**98 practice variations across the set**) and three bilingual Imagine situations (**42 real-life ideas**). The build gate verifies source alignment, labels, categories, complete examples and non-duplication. This is a **two-week pilot, not an automatically produced 225-day curriculum**.

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
- Check whether a three-category Change step and three-context Imagine step stay quick and motivating. The user may choose one route rather than doing all examples.
- Decide whether to expand to a reviewed 30-day/225-day practice curriculum, and whether to add optional audio-speed controls; do not automatically derive lessons for advanced/adult-sensitive concepts.
- Do not change a child's emotion into a problem to be corrected. The daily practice asks for authentic expression, not a "right feeling".

## Iteration · richer Change, Imagine and direct navigation (PR #8)

The full-library JSON download button and unused public exporter are removed; canonical/runtime JSON stays in the repository for the app to work. The full entry Markdown/PNG/share link remain unchanged. Change offers three switchable groups per word, while Imagine provides three real-life prompts with English samples and optional listening. Clicking **1, 2, 3, 4, or 5** takes you to that stage directly; active stage is indicated by `aria-current="step"`. Draft writing, chosen change group and repetition tally are preserved while navigating. Listen and Repeat remain translation-free even when coming back from later stages. All 14 lessons remain editorial drafts and need real child-facing review.

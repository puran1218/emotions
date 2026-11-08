# Full-entry export and Daily 5 · User guide

**Work sequence:** PR #6 (bilingual A Little Closer review and full-corpus coverage) → PR #7 (full export + English practice). This feature PR is intentionally stacked on #6. Merge #6 first, then retarget #7 to `main`.

## What can I export now?

The original share PNG deliberately included only the first **two** YOU CAN SAY examples and omitted A LITTLE CLOSER. PR #7 removes that limitation.

| Format | Content | Use |
| --- | --- | --- |
| **Share/Save image (PNG)** | Current EN/ZH headword, scene illustration, complete bilingual definition, scenario, **every (3–4) spoken example**, A LITTLE CLOSER (when enabled), and actual Related Feelings labels | Share a readable, still, long picture. Text is in the image (not selectable), audio is not embedded. |
| **Download full entry (.md)** | Every bilingual definition/scenario/example, A LITTLE CLOSER with a distinct takeaway and both comparison meanings, Related Feelings, and link to the actual current illustration | Copy, edit, archive, or review a single word in Markdown. The linked image needs the site to remain accessible. |
| **Download all entries (.json)** | All **225 currently browsable** runtime entries, each with **all three** bilingual sentences, and its A LITTLE CLOSER contrast record | Machine-readable personal corpus, not a CSV import or "human-approved" dictionary. The ten withheld senses stay excluded. |
| **Share link** | Opens the live interactive word page, including browser TTS | Share the most interactive version; requires an accessible published URL. |

**Caveat:** the current source data and the new 225 contrasts are an editorial preview; download integrity is not an editorial certificate. Export does not produce a 225-page PDF, bundle offline illustration images, or package voice recordings. True native Safari image sharing still needs a device check.

## Daily 5 · Five-minute English habit

`/emotions/practice.html` is a lightweight static page with five steps inspired by the five-minute habit the user described from [How to Improve English Fluency Fast (5-Minute Morning Habit)](https://www.youtube.com/watch?v=iPDiEO3tuqM). It does not claim official affiliation with the video.

1. **Listen**: use existing platform English text-to-speech, without showing a Chinese translation.
2. **Repeat**: say the same English aloud three times; tap to count repetitions. No microphone, audio recording or speech scoring.
3. **Change**: try three manually curated variants, **exactly one word altered** in a real existing EmoLex sentence. Chinese can be deliberately revealed now.
4. **Imagine**: connect the sentence to one event in your own day; optionally write a custom English sentence.
5. **Write**: write a short personal reflection, explicitly save locally if wanted, or download a Markdown learning note.

The app selects one of **14** starter sentences deterministically from the **local browser calendar date** and cycles after 14 days. You can also open `practice.html?word=curious` (for one of the 14 curated starter IDs) or choose "Try another curated sentence".

The 14 sample sentences are **exact copies from the current YOU CAN SAY library**, not generated approximations. Their one-word alternatives are also explicitly curated for grammatical sense; the build gate verifies exactly one English word changes (and that both EN and ZH source texts match the dictionary). This is a **two-week pilot, not an automatically produced 225-day curriculum**.

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

Open `http://localhost:8000/static/emotions/` and inspect a detail word such as `?word=joy`. The Download full entry button is below the share controls; Export all entries sits at the top of Explore. The Daily 5 link is in the header.

Open `http://localhost:8000/static/emotions/practice.html?word=loneliness` and exercise all five steps, English-first visibility, the three English substitutions, writing, save/download and browser reload. Check responsive widths 320, 390, 768 and 1280 CSS pixels.

Tests cover deterministic practice source matching, one-word substitutions, navigation, the complete PNG's text drawing, Markdown/JSON export, and the virtual practice click/write flow. Actual browser decoding, voice quality, native file sharing and the final appearance of very long full-entry PNGs still need real-device validation.

## What to review before broadening this feature

- For each of the 14 sentences, verify that the alternative verb/noun still sounds natural in a real child's situation. Avoid treating mechanical single-word substitutions as automatically semantically safe.
- Check whether a 3-minute speaking sequence plus two writing prompts remains motivating rather than feeling like homework.
- Decide whether to expand to a reviewed 30-day/225-day practice curriculum, and whether to add optional audio-speed controls; do not automatically derive lessons for advanced/adult-sensitive concepts.
- Do not change a child's emotion into a problem to be corrected. The daily practice asks for authentic expression, not a "right feeling".

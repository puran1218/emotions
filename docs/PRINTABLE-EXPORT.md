# EmoLex · Printable Feelings Book

The independent print view is at '/emotions/print.html'. It uses the existing static micro.blog assets and browser printing (A4 portrait, 100% scale, browser header/footer off). No server, account, new PDF library, externally hosted images, fonts or separate editorial database is needed.

## P0 · Printable Feelings Book

- **Full book:** one A4 page per visible word sense. English/Chinese forms, definitions, original bilingual scene, every YOU CAN SAY sentence, complete A LITTLE CLOSER comparison (question, both definitions and takeaway), related terms where present and two handwriting lines. All 225 visible IDs remain distinct.
- **Compact cards:** two entries per A4 page, including full definitions, scenes and all examples; the extended comparison and handwriting lines are intentionally reserved for the full book.
- **Selection:** all entries, a consecutive batch (start index and count, default 30), or a comma/newline separated list of exact canonical IDs. Selected IDs display in canonical order. Unknown IDs cause a visible error; no withheld words leak through aliases or direct IDs.
- **Language order:** English first or Chinese first. The printed text remains selectable rather than rasterized.
- **Illustrations:** only canonical relative versioned WebP images with an explicitly approved stage are printed; the shared placeholder and pending art are omitted to avoid wasting ink. Locally staged art that is not linked into runtime content does not appear. The print action waits for image decode and hides failed images.
- **Source and QA:** data comes from 'static/emotions/data/emotions.json' and 'closer-experiment.json'. Neither PDF export nor tests imply editorial sign-off. Full and compact print views show an editorial-preview footer.

Open from the dictionary header. Select layout and entries, then click **Print / Save PDF** and select your printer or Save as PDF. Test Chrome and Safari print dialogs before a large real paper run. For dense text, preview the last few pages as well as page 1. The current main branch includes only the shared illustration placeholder.

Run 'npm test' to validate all 225 entries, 225 comparisons, both layouts, subsets, illustration approval gates and escaping. Browser print appearance and real printers must still be checked manually.


## P1 · Daily Practice Workbook

Open '/emotions/workbook.html' from Daily 5 or the print center. This is a separate print view, not an offline audio app or a new curriculum.

- **One A4 worksheet per distinct visible sense** with its canonical definition and five stages: Listen, Repeat (three checkboxes), Change (three existing categories and one example from each), Imagine (all three existing bilingual everyday prompts), Write (the original bilingual reflection prompt plus lines to handwrite).
- Stage 1/2 intentionally stay **English-only**, preserving the interactive Daily 5 practice sequence; translation and Chinese prompts appear starting in Change. Chinese-first affects later bilingual sections only.
- **7 or 30 lessons at a time**, all 225 or manually selected exact IDs; index follows the canonical dictionary ordering, **not a fixed calendar date** and does not mirror the user's local rotating Daily 5 day automatically.
- The 14 curated-structure exercises remain **editorial drafts**. The other 211 guided-source exercises show **actual original dictionary sentences**, never falsely labeled as checked grammatical substitutions. The footer makes the mode visible.
- No sound files, microphone recording, browser-local notes, answer keys, handwriting recognition or AI-generated grading is embedded. Use interactive Daily 5 online when you want TTS or local saved writing.
- Pending illustrations and the shared placeholder are not printed. The same approval-safe image path rule as P0 applies. The printed PDF is an independent copy and remains useful offline.

Run 'npm test' to check all 225 word-sense IDs, the existing curated/guided split, five worksheet stages, the three existing Change/Imagine options, bilingual source strings, handwriting space and the printing links. Preview a few dense worksheets in Safari/Chrome before printing the whole collection.

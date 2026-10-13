# Content audit · starting queue

**Numbers from original lists:** English met 107 + unmet 135 = 242 classified occurrences, 234 distinct English forms. Chinese met 31 + unmet 49 = 80 source occurrences.

**Legacy \`emotions-card.zip\` audit from design foundation:** 235 entries; 106 in met, 129 in unmet; 230 unique English terms. Seven missing category occurrences: met \`alive\`; unmet \`anguished\`, \`annoyed\`, \`aroused\`, \`blah\`, \`cool\`, \`keyed-up\`. In legacy data the \`Blissful\` entry has a trailing whitespace in field \`Explanation_in_Chinese \`.

**Do not silently discard or correct:** Original source list is faithfully inventoried. The current repository preserves original word occurrences, but **does not contain** the original legacy explanations or completed word-by-word semantic editorial decisions. They must be brought into an annotated migration record before claiming coverage.

High-risk review first: angry/mad; guilty; suspicious; concerned; cool; complacent; hot; lazy; helpful; aroused; overwhelmed; surprised; depressed; sensitive; breathless. Clarify meaning and part of speech, not only literal translation.

**Next review batch** should cover every source occurrence in original list order and assign a decision: new concept, merge with documented sense, split sense, related non-emotion, or excluded with reason. Each approved concept needs definition + scene + "I can say" in both languages plus an approved scene image. Provide a per-word ledger and completeness gate before marking release ready.

## Legacy ZIP verified (2026-10-13)

The supplied `emotions-card.zip` contains an executable historic web page plus `emotions-card/emotions.js`. We parsed the JSON array as data **without executing the JavaScript**. The recovered array has exactly **235 records**, **230 unique English spellings**, **106 needs-met + 129 needs-unmet** (the legacy order), and **five repeated English words**: `concerned`, `intense`, `overwhelmed`, `sensitive`, and `surprised`. Those repeats can represent different sense/category occurrences and must not be deduplicated without review.

Record **index 11** (`Blissful`) stores Chinese explanation under the original key `Explanation_in_Chinese ` (trailing space). The import script tolerates that field but retains `raw_chinese_key` as provenance. Original spelling and text are preserved, not silently translated or improved.

**Recovered columns:** English word, Chinese word, English explanation, Chinese explanation. The explanation text often combines meaning, an example and emoji in **one string**. The ZIP does **not** contain separately reviewed `scenario`, 3–4 distinct bilingual `expression` entries, proper conceptual sense IDs, pronunciation metadata, or artwork. Therefore `235 legacy records` does **not** mean `235 release-approved EmoLex concepts`.

**Explicit high-risk cases in the ZIP:** `cool` has a fashion/slang reading; `guilty` is translated as `有罪的`; `mad` is `发疯的`; `aroused` has context-dependent senses. These must remain blocked from automatic kid-facing publication pending actual sense review.

Reproduce lossless recovery using:

```bash
python3 scripts/import-legacy-emotions.py /path/to/emotions-card.zip
```

This generates `data/legacy/emotions-card.json` as a **recovered, unreviewed source** (not runtime content). Next editorial migration should link each legacy occurrence to `data/review-ledger.jsonl`, preserve the five duplicates and seven missing source occurrences, then curate the independent scenario and three expressive bilingual examples for each publishable concept. It must not fabricate additional sentences merely to satisfy the schema.

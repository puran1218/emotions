# Content audit · starting queue

**Numbers from original lists:** English met 107 + unmet 135 = 242 classified occurrences, 234 distinct English forms. Chinese met 31 + unmet 49 = 80 source occurrences.

**Legacy \`emotions-card.zip\` audit from design foundation:** 235 entries; 106 in met, 129 in unmet; 230 unique English terms. Seven missing category occurrences: met \`alive\`; unmet \`anguished\`, \`annoyed\`, \`aroused\`, \`blah\`, \`cool\`, \`keyed-up\`. In legacy data the \`Blissful\` entry has a trailing whitespace in field \`Explanation_in_Chinese \`.

**Do not silently discard or correct:** Original source list is faithfully inventoried. The current repository preserves original word occurrences, but **does not contain** the original legacy explanations or completed word-by-word semantic editorial decisions. They must be brought into an annotated migration record before claiming coverage.

High-risk review first: angry/mad; guilty; suspicious; concerned; cool; complacent; hot; lazy; helpful; aroused; overwhelmed; surprised; depressed; sensitive; breathless. Clarify meaning and part of speech, not only literal translation.

**Next review batch** should cover every source occurrence in original list order and assign a decision: new concept, merge with documented sense, split sense, related non-emotion, or excluded with reason. Each approved concept needs definition + scene + "I can say" in both languages plus an approved scene image. Provide a per-word ledger and completeness gate before marking release ready.

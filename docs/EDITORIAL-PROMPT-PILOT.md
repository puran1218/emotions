# Editorial experiment: A Little Closer · 再理解一点

**Status:** optional editorial prototype; **not human reviewed, not production approved**.

## Why this experiment exists

Li Jigang's four source prompts suggest different ways of improving a concept explanation. The useful underlying methods are independent of their original Emacs Lisp persona prompts and SVG card compositions:

| Source | Method borrowed | Decision for EmoLex |
| --- | --- | --- |
| [知识卡片](https://github.com/lijigang/write-prompt/blob/main/claude-prompt-知识卡片.org) | Find the essence, explain simply, give one everyday example | Already supported by Definition + Scenario. Do not replace them with a card-within-a-card. |
| [汉语新解](https://github.com/lijigang/write-prompt/blob/main/claude-prompt-汉语新解.org) | Fresh, memorable metaphor | A possible *gentle and optional* technique for future editorial copy; discard sarcasm, critical barbs, adult voice and nonliteral "definitions". |
| [So What](https://github.com/lijigang/write-prompt/blob/main/claude-prompt-so-what.org) | Keep asking why this matters to the reader | Strengthen the existing YOU CAN SAY with natural expression, optionally requesting connection/help, without prescribing behavior. |
| [信达雅翻译](https://github.com/lijigang/write-prompt/blob/main/claude-prompt-信达雅翻译.org) | Faithfulness → communication → elegant economy | Check EN/ZH sense alignment, everyday spoken language and child-friendly warmth; explicitly do **not** imitate the prompt's classical `诗经` style. |

All decisions keep the existing [PLAIN-LANGUAGE.md](PLAIN-LANGUAGE.md) and [CONTENT-EDITORIAL.md](CONTENT-EDITORIAL.md) review boundaries. A beautiful card or plausible LLM output is not evidence of semantic accuracy.

## The one visible experiment

Add **A LITTLE CLOSER / 再理解一点** immediately after YOU CAN SAY, before RELATED FEELINGS. It offers two contrasting descriptions plus a non-prescriptive takeaway, both languages visible in switchable priority.

**Three contrasts, not 225 generated cards:**

- **Joy ↔ Relief:** happiness when a hoped-for event happens versus relaxing after a worry resolves. Both can coexist.
- **Frustration ↔ Disappointment:** trying and being blocked versus an expectation not met. Both can coexist.
- **Loneliness ↔ being alone:** longing for companionship versus a neutral social situation. This is intentionally **not** labeled a second negative emotion.

Other pilot entries **Affection** and **Relief** remain fully functional and deliberately show **no duplicate/invented comparison**. Neither do the 220 legacy preview concepts.

## Review the feature without publishing it

Existing app normally: `/emotions/?word=joy`

Opt-in experiment: `/emotions/?word=joy&closer=1`

After checking out this branch, from the repository root:

```bash
npm test
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/static/emotions/?word=joy&closer=1`
- `http://localhost:8000/static/emotions/?word=frustration&closer=1`
- `http://localhost:8000/static/emotions/?word=loneliness&closer=1`
- Compare with the same URLs without `&closer=1`.

Open the expandable panel, switch EN/中文, follow another word, and resize to 320/390/768/1280 CSS px. The flag persists across in-app navigation. An optional static offline review HTML, distributed separately in the user conversation, allows the same five-word toggle experience without micro.blog deployment.

## Content source and release boundary

The hand-authored experimental source is `data/editorial/closer-pilots.json`; `npm run build:closer` reproducibly projects it into `static/emotions/data/closer-experiment.json`. CI runs `node scripts/build-closer.mjs --check` to enforce EN/ZH completeness, distinct sense IDs, eligibility against canonical concepts and rejection of duplicate comparison records.

The **original 225 entry runtime** `static/emotions/data/emotions.json`, the canonical dictionaries, images, 3–4 spoken examples, translation statuses and TTS/share pipelines are unchanged. With no `closer=1` URL flag, the browser never even requests the experimental JSON. With the flag, a failed optional experiment fetch must not break the dictionary.

**Never mark these contrast proposals as reviewed just because automated checks pass.** There is no bulk rollout logic or release gate exemption in this PR.

## Pilot-by-pilot editorial interpretation

| Pilot | What the existing text already gets right | Extra experiment | Editorial follow-up, not automatically rewritten |
| --- | --- | --- | --- |
| Joy | Hopeful good event plus concrete sunflower | Contrast the earlier-worry trigger of Relief | Keep happiness distinct from noisy excitement |
| Frustration | Explicit repeated effort and a fallen tower | Compare blocked effort with Disappointment's unmet hope | Review whether `frustrated` and `挫败感` are both natural for child-level English/Chinese |
| Loneliness | Wants to join other children, not just sits alone | Separate loneliness from the neutral fact of solitude | Do not assume all children sitting alone feel sad |
| Affection | Child and willing dog, mutual care and consent | No panel for this round | Preserve independent consent and personal boundaries, avoid obligatory hugs |
| Relief | Recovered book plus preceding worry | No separate panel (Joy already contrasts it) | Confirm `如释重负` is accompanied by child-accessible explanation |

## Evidence and acceptance questions

Evaluate each prompt with a reviewer, not only a text-length heuristic:

1. Does the child understand the event **before** being given a comparison? Is the panel still useful after Definition, Scenario and YOU CAN SAY?
2. Do the contrasting descriptions preserve the meaning of both senses, or force a false distinction?
3. Is the extra height (especially on a 320 px phone) worthwhile, or should the default be collapsed?
4. Does language switching preserve natural EN and ZH word order and meaning, without heavy classical or sarcastic phrases?
5. Does the takeaway avoid telling a child they *must* react in a certain way, and avoid labeling emotions good/bad?

Only if the three pilot comparisons prove useful: extend the **editorial method** to related-pair clusters, not every entry indiscriminately. First audit the 230 legacy canonical senses and `related_ids`, fix incorrect or mixed senses, then create individually reviewed contrast records. Retain a simple Definition/Scenario/Say-only page for words without a meaningful confusion pair. Do not turn generated comparisons into automatic approvals.

## Working decisions

- No AI runtime, new API, feature flag backend, user tracking or asset size increase.
- Separate experimental JSON rather than migrating the canonical schema prematurely.
- Native `<details>` with keyboard-compatible disclosure, two short cards, a brief takeaway and visible draft label.
- The final public form, whether as a new UI block or folded into Related Feelings, remains a **user decision after the experiment**.

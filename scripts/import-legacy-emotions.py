#!/usr/bin/env python3
import argparse
import collections
import json
import pathlib
import re
import zipfile


def read_legacy(archive):
    with zipfile.ZipFile(archive) as source:
        path = "emotions-card/emotions.js"
        if path not in source.namelist():
            raise ValueError("The archive does not contain emotions-card/emotions.js")
        text = source.read(path).decode("utf-8-sig")
    match = re.search(r"\[\s*\{.*\}\s*\]", text, re.DOTALL)
    if match is None:
        raise ValueError("Cannot find the JSON array inside emotions.js")
    rows = json.loads(match.group(0))
    if not isinstance(rows, list) or len(rows) != 235:
        raise ValueError("Expected exactly 235 legacy records; check source before importing")
    return rows


def import_rows(rows):
    entries = []
    for index, row in enumerate(rows):
        category = "needs_met" if index < 106 else "needs_unmet"
        chinese_key = "Explanation_in_Chinese " if "Explanation_in_Chinese " in row else "Explanation_in_Chinese"
        required = ["English", "Chinese", "Explanation_in_English", chinese_key]
        if any(not isinstance(row.get(k), str) or not row[k].strip() for k in required):
            raise ValueError(f"Legacy record {index} is missing one of {required}")
        entries.append({
            "legacy_index": index,
            "source_category": category,
            "english": row["English"],
            "chinese": row["Chinese"],
            "explanation_en": row["Explanation_in_English"],
            "explanation_zh": row[chinese_key],
            "raw_chinese_key": chinese_key,
            "review_status": "legacy_unreviewed"
        })
    return entries


def report(entries):
    counts = collections.Counter(x["english"].strip().casefold() for x in entries)
    return {
        "legacy_rows": len(entries),
        "unique_english": len(counts),
        "categories": dict(collections.Counter(x["source_category"] for x in entries)),
        "duplicate_english": {key: value for key, value in counts.items() if value > 1},
        "malformed_chinese_explanation_key": [x["legacy_index"] for x in entries if x["raw_chinese_key"] != "Explanation_in_Chinese"],
        "editorial_status": "source recovered; word senses, independent scenarios and expressions require review"
    }


def main():
    parser = argparse.ArgumentParser(description="Recover bilingual legacy EmoLex explanations without auto-approving them")
    parser.add_argument("archive", type=pathlib.Path)
    parser.add_argument("--out", type=pathlib.Path, default=pathlib.Path("data/legacy/emotions-card.json"))
    args = parser.parse_args()
    rows = read_legacy(args.archive)
    entries = import_rows(rows)
    output = {
        "version": 1,
        "source": "emotions-card.zip/emotions-card/emotions.js",
        "status": "legacy_unreviewed",
        "entries": entries
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report(entries), indent=2, ensure_ascii=False))
    print(f"Imported unreviewed source data into {args.out}")


if __name__ == "__main__":
    main()

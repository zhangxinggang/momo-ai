#!/usr/bin/env python3
"""Project validated tender data into the host's business-neutral report contract."""
import argparse
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
from render_report import validate
from render_openui import provenance, text


def render(data):
    validate(data)
    sections = []
    for module in data["modules"]:
        groups = []
        for index, section in enumerate(module["sections"]):
            blocks = []
            for block in section["blocks"]:
                if block["kind"] == "table":
                    value = {"type": "table", "columns": block["columns"], "rows": [
                        {"cells": [text(cell) for cell in row["cells"]], "source": provenance(row)}
                        for row in block["rows"]]}
                elif block["kind"] == "template":
                    value = {"type": "file", "title": block["document"]["name"],
                             "sourceId": block["document"]["source_id"], "source": provenance(block)}
                else:
                    value = {"type": "text", "text": text(block["text"]), "source": provenance(block)}
                if block.get("title") and block["kind"] != "template":
                    value["title"] = block["title"]
                blocks.append(value)
            groups.append({"id": f"group-{index + 1}", "title": section["title"], "blocks": blocks})
        sections.append({"id": module["id"], "title": module["title"],
                         "emptyMessage": module.get("empty_message", ""), "groups": groups})
    summary = data["coverage"]["summary"]
    if data["coverage"]["unread"]:
        summary += "\n待核验：" + "；".join(data["coverage"]["unread"])
    return {"title": data["document_title"], "summary": summary, "sections": sections}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    result = render(json.loads(args.data.read_text(encoding="utf-8-sig")))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"报告数据已生成：{args.out}")


if __name__ == "__main__":
    main()

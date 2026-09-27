#!/usr/bin/env python3
"""Project validated tender analysis into the host's generic OpenUI components."""
import argparse
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
from render_report import validate


def text(value):
    return "\n".join(value) if isinstance(value, list) else value


def provenance(item):
    parts = []
    if item["basis"] == "inferred":
        parts.append("推断")
    if item["basis"] == "missing":
        parts.append("未明确")
    if item.get("note"):
        parts.append(item["note"])
    for source in item.get("evidence", []):
        parts.append(f'出处：{source["file"]} · {source["locator"]}\n原文：{source["quote"]}')
    return "\n".join(parts)


def render(data):
    validate(data)
    lines = []

    def literal(value):
        return json.dumps(value, ensure_ascii=False)

    def emit(name, component, *args):
        lines.append(f'{name} = {component}({", ".join(args)})')
        return name

    def refs(items):
        return "[" + ", ".join(items) + "]"

    module_tabs = []
    for mi, module in enumerate(data["modules"]):
        section_tabs = []
        for si, section in enumerate(module["sections"]):
            blocks = [emit(f"heading{mi}_{si}", "PlainText", literal(section["title"]), literal("heading"))]
            for bi, block in enumerate(section["blocks"]):
                prefix = f"block{mi}_{si}_{bi}"
                if block.get("title"):
                    blocks.append(emit(prefix + "Title", "PlainText", literal(block["title"]), literal("heading")))
                if block["kind"] == "table":
                    columns = []
                    for ci, title in enumerate(block["columns"]):
                        values = []
                        for row in block["rows"]:
                            value = text(row["cells"][ci])
                            if ci == len(block["columns"]) - 1:
                                value += "\n\n" + provenance(row)
                            values.append(value)
                        columns.append(emit(prefix + f"Col{ci}", "Col", literal(title), literal(values)))
                    blocks.append(emit(prefix, "Table", refs(columns)))
                elif block["kind"] == "template":
                    blocks.append(emit(prefix, "FilePreview", literal(block["document"]["source_id"]), "800"))
                    if block["document"]["extraction"] == "page-facsimile":
                        blocks.append(emit(prefix + "Mode", "PlainText", literal("原页版式 Word（图片内容，不可逐字编辑）"), literal("muted")))
                    blocks.append(emit(prefix + "Evidence", "PlainText", literal(provenance(block)), literal("muted")))
                else:
                    blocks.append(emit(prefix, "PlainText", literal(text(block["text"]))))
                    blocks.append(emit(prefix + "Evidence", "PlainText", literal(provenance(block)), literal("muted")))
            section_tabs.append(emit(f"section{mi}_{si}", "TabItem", literal(section["id"]), literal(section["title"]), refs(blocks)))
        if section_tabs:
            left = emit(f"sections{mi}", "Tabs", refs(section_tabs), literal("pill"))
        else:
            left = emit(f"empty{mi}", "PlainText", literal(module["empty_message"]))
        module_tabs.append(emit(f"module{mi}", "TabItem", literal(module["id"]), literal(module["title"]), refs([left])))
    nav = emit("moduleNavigation", "Tabs", refs(module_tabs), literal("line"))
    children = []
    if data["coverage"]["status"] == "partial":
        children.append(emit("coverage", "PlainText", literal(data["coverage"]["summary"] + "\n待核验：" + "；".join(data["coverage"]["unread"]))))
    children.append(nav)
    return f"root = Stack({refs(children)})\n" + "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = render(json.loads(args.data.read_text(encoding="utf-8-sig")))
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(result, encoding="utf-8")
        print(f"OpenUI 已生成：{args.out}")
        return 0
    except (OSError, ValueError, TypeError) as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Validate dynamic report data and render the bundled, fixed HTML components."""
import argparse
import html
import json
import re
import sys
from pathlib import Path

MODULES = [
    ("basic", "基础信息"), ("technical", "技术参数要求"), ("risks", "潜在风险"),
    ("disqualification", "废标项"), ("eligibility", "投标人资格要求"),
    ("evaluation", "评标标准"), ("submission", "投标文件要求"),
    ("documents", "应标所需文件"), ("templates", "投标文件模板"), ("qa", "智能问答"),
]


def skeleton():
    return {"schema_version": 2, "document_title": "", "source_files": [],
            "coverage": {"status": "partial", "summary": "尚未解析上传文件。", "unread": ["尚未解析上传文件"]},
            "modules": [{"id": key, "title": title, "empty_message": "尚未解析。", "sections": []}
                        for key, title in MODULES]}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def text_value(value):
    return isinstance(value, str) or (isinstance(value, list) and all(isinstance(x, str) for x in value))


def provenance(item, path, files):
    require(isinstance(item, dict), f"{path} 必须为对象")
    basis = item.get("basis")
    require(basis in ("explicit", "inferred", "missing"), f"{path}.basis 无效")
    evidence = item.get("evidence", [])
    require(isinstance(evidence, list), f"{path}.evidence 必须是数组")
    if basis != "missing":
        require(bool(evidence), f"{path} 缺少原文证据")
    if basis in ("inferred", "missing"):
        require(nonempty(item.get("note")), f"{path} 必须说明推断或缺失依据")
    if "note" in item:
        require(isinstance(item["note"], str), f"{path}.note 必须为文本")
    for index, source in enumerate(evidence):
        require(isinstance(source, dict), f"{path}.evidence[{index}] 必须为对象")
        require(all(nonempty(source.get(k)) for k in ("file", "locator", "quote")),
                f"{path}.evidence[{index}] 缺少文件、位置或原文")
        require(source["file"] in files, f"{path} 引用了 source_files 之外的文件")


def validate(data):
    require(isinstance(data, dict), "根数据必须为对象")
    require(data.get("schema_version") == 2, "schema_version 必须为 2（模板使用截取后的 Word）")
    require(nonempty(data.get("document_title")), "缺少本次标书标题")
    files = data.get("source_files")
    require(isinstance(files, list) and bool(files) and all(nonempty(f) for f in files), "缺少 source_files")
    require(len(set(files)) == len(files), "source_files 有重名，请使用可区分的来源名称")
    coverage = data.get("coverage")
    require(isinstance(coverage, dict), "缺少 coverage")
    require(coverage.get("status") in ("complete", "partial"), "coverage.status 无效")
    require(nonempty(coverage.get("summary")), "缺少解析覆盖说明")
    unread = coverage.get("unread")
    require(isinstance(unread, list) and all(nonempty(x) for x in unread), "coverage.unread 必须为文本数组")
    require(not unread or coverage["status"] == "partial", "有未读内容时不能声明 complete")
    require(coverage["status"] != "partial" or bool(unread), "partial 必须列明未读内容")
    modules = data.get("modules")
    require(isinstance(modules, list) and len(modules) == len(MODULES), "必须恰好包含十个一级 Tab")
    for index, (key, title) in enumerate(MODULES):
        module = modules[index]
        path = f"modules[{index}]"
        require(isinstance(module, dict), f"{path} 必须为对象")
        require(module.get("id") == key and module.get("title") == title, f"{path} 一级 Tab 名称或顺序不符")
        sections = module.get("sections")
        require(isinstance(sections, list), f"{path}.sections 必须为数组")
        if not sections:
            require(nonempty(module.get("empty_message")), f"{path} 空模块必须说明原因")
        seen = set()
        for si, section in enumerate(sections):
            spath = f"{path}.sections[{si}]"
            require(isinstance(section, dict), f"{spath} 必须为对象")
            sid = section.get("id")
            require(nonempty(sid) and re.fullmatch(r"[a-zA-Z0-9_-]+", sid) is not None, f"{spath}.id 必须为字母数字或下划线/连字符")
            require(sid not in seen, f"{spath}.id 重复")
            seen.add(sid)
            require(nonempty(section.get("title")), f"{spath} 缺少动态标题")
            blocks = section.get("blocks")
            require(isinstance(blocks, list) and bool(blocks), f"{spath} 没有内容块，不应创建空二级 Tab")
            for bi, block in enumerate(blocks):
                bpath = f"{spath}.blocks[{bi}]"
                require(isinstance(block, dict), f"{bpath} 必须为对象")
                if "title" in block:
                    require(isinstance(block["title"], str), f"{bpath}.title 必须为文本")
                if block.get("kind") == "table":
                    columns, rows = block.get("columns"), block.get("rows")
                    require(isinstance(columns, list) and bool(columns) and all(nonempty(c) for c in columns), f"{bpath} 表头无效")
                    require(isinstance(rows, list) and bool(rows), f"{bpath} 表格无内容")
                    for ri, row in enumerate(rows):
                        rpath = f"{bpath}.rows[{ri}]"
                        require(isinstance(row, dict), f"{rpath} 必须为对象")
                        cells = row.get("cells")
                        require(isinstance(cells, list) and len(cells) == len(columns) and all(text_value(c) for c in cells), f"{rpath} 单元格数或类型无效")
                        provenance(row, rpath, files)
                elif block.get("kind") == "template":
                    require(key == "templates", f"{bpath} Word 模板只能出现在投标文件模板模块")
                    document = block.get("document")
                    require(isinstance(document, dict), f"{bpath} 缺少截取后的 Word document")
                    name = document.get("name")
                    require(nonempty(name) and name.lower().endswith(".docx") and
                            not any(c in name for c in '/\\:*?"<>|'), f"{bpath} 需要合法的 .docx 文件名")
                    source_id = document.get("source_id")
                    require(nonempty(source_id) and source_id.startswith("artifact:") and len(source_id) > 9,
                            f"{bpath} 必须引用 artifact_create 注册的 Word，不能使用原招采文件 ID")
                    require(document.get("extraction") in ("native-docx", "page-facsimile"), f"{bpath} 截取方式无效")
                    require(block.get("basis") == "explicit", f"{bpath} 模板必须截取自原件")
                    provenance(block, bpath, files)
                elif block.get("kind") == "text":
                    require(text_value(block.get("text")), f"{bpath}.text 必须为文本或文本数组")
                    require(bool(block["text"]), f"{bpath}.text 为空")
                    provenance(block, bpath, files)
                else:
                    raise ValueError(f"{bpath}.kind 只能为 table/text/template")


def render(data):
    validate(data)
    template = (Path(__file__).resolve().parent.parent / "assets" / "report.html").read_text(encoding="utf-8")
    encoded = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    for character, escaped in (("&", "\\u0026"), ("<", "\\u003c"), (">", "\\u003e"), ("\u2028", "\\u2028"), ("\u2029", "\\u2029")):
        encoded = encoded.replace(character, escaped)
    values = {"__REPORT_TITLE__": html.escape(data["document_title"], quote=True), "__REPORT_DATA__": encoded}
    return re.sub(r"__REPORT_(?:TITLE|DATA)__", lambda match: values[match.group()], template)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--init", type=Path, help="生成待填充的一级模块骨架")
    parser.add_argument("--data", type=Path)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()
    try:
        if args.init:
            require(not args.data and not args.out, "--init 与 --data/--out 不能同时使用")
            require(not args.init.exists(), "骨架输出已存在，避免覆盖已有分析结果")
            args.init.parent.mkdir(parents=True, exist_ok=True)
            args.init.write_text(json.dumps(skeleton(), ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"骨架已生成：{args.init}")
        else:
            require(args.data is not None and args.out is not None, "需要 --data 和 --out")
            data = json.loads(args.data.read_text(encoding="utf-8-sig"))
            report = render(data)
            args.out.parent.mkdir(parents=True, exist_ok=True)
            args.out.write_text(report, encoding="utf-8")
            print(f"已校验十个固定一级 Tab 和动态内容，HTML：{args.out}")
        return 0
    except (OSError, ValueError, TypeError) as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Extract PDF/DOCX text with stable source locations; no AI inference or OCR."""
import argparse
import hashlib
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import BadZipFile, ZipFile

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def inline_text(element):
    out = []
    for node in element.iter():
        if node.tag == W + "t":
            out.append(node.text or "")
        elif node.tag == W + "tab":
            out.append("\t")
        elif node.tag in (W + "br", W + "cr"):
            out.append("\n")
    return "".join(out).strip()


def extract_docx(path):
    records, review = [], []
    counts = {"p": 0, "t": 0}

    def walk(container, part):
        for node in container:
            if node.tag == W + "p":
                counts["p"] += 1
                locator = f"{part}:p{counts['p']:05d}"
                text = inline_text(node)
                style = node.find(f"{W}pPr/{W}pStyle")
                attrs = {"style": style.get(W + "val", "")} if style is not None else {}
                if text:
                    records.append({"locator": locator, "kind": "paragraph", "text": text, **attrs})
                if node.find(".//" + W + "drawing") is not None or node.find(".//" + W + "pict") is not None:
                    review.append(f"{locator}：含图片/绘图，需检查图中文字或表格")
            elif node.tag == W + "tbl":
                counts["t"] += 1
                table_id = counts["t"]
                for row_index, row in enumerate(node.findall(W + "tr"), 1):
                    cells = []
                    for cell in row.findall(W + "tc"):
                        paragraphs = [inline_text(p) for p in cell.iter(W + "p")]
                        cells.append("\n".join(p for p in paragraphs if p))
                    locator = f"{part}:t{table_id:05d}:r{row_index:03d}"
                    records.append({"locator": locator, "kind": "table_row", "cells": cells,
                                    "text": " | ".join(cells)})
                    if row.find(".//" + W + "drawing") is not None or row.find(".//" + W + "pict") is not None:
                        review.append(f"{locator}：表格含图片，需视觉复核")
            elif node.tag == W + "altChunk":
                review.append(f"{part}：存在嵌入内容 altChunk，未抽取")
            else:
                walk(node, part)

    with ZipFile(path) as archive:
        members = archive.namelist()
        if "word/document.xml" not in members:
            raise ValueError("文件不是有效的 DOCX，缺少 word/document.xml")
        root = ET.fromstring(archive.read("word/document.xml"))
        body = root.find(W + "body")
        if body is None:
            raise ValueError("DOCX 缺少正文 body")
        walk(body, "DOCX:body")
        for part in sorted(members):
            filename = Path(part).name
            if part.startswith("word/") and part.endswith(".xml") and (
                filename.startswith("header") or filename.startswith("footer")
                or filename in ("footnotes.xml", "endnotes.xml")
            ):
                walk(ET.fromstring(archive.read(part)), f"DOCX:{filename}")
        if any(p.startswith("word/embeddings/") for p in members):
            review.append("DOCX：存在嵌入文件，需另行查看")
        numbering = "word/numbering.xml" in members
    if numbering:
        review.append("DOCX：存在自动编号；本脚本不还原编号，涉及条款编号时需复核原文件")
    return {"format": "docx", "records": records, "needs_visual_review": review,
            "limitations": ["段落/表格定位不是 Word 渲染页码；合并单元格及复杂版式需复核。"]}


def extract_pdf(path):
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise ValueError("PDF 抽取需要 pypdf：运行 python -m pip install -r scripts/requirements.txt，或使用环境的 PDF 阅读能力。") from exc
    reader = PdfReader(str(path))
    if reader.is_encrypted and not reader.decrypt(""):
        raise ValueError("PDF 已加密，需要用户提供可读取版本或密码；未抽取正文。")
    records, review = [], []
    for index, page in enumerate(reader.pages, 1):
        locator = f"PDF:page{index:04d}"
        try:
            content = page.extract_text() or ""
        except Exception as exc:
            content = ""
            review.append(f"{locator}：抽取失败（{type(exc).__name__}），需阅读原页")
        if len("".join(content.split())) < 20:
            review.append(f"{locator}：可抽取文字少，需检查是否为扫描页、空白页或图片页")
        records.append({"locator": locator, "page": index, "kind": "page", "text": content.strip()})
    return {"format": "pdf", "page_count": len(reader.pages), "records": records,
            "needs_visual_review": review,
            "limitations": ["文本抽取不包含 OCR；图片、表格列顺序及跨页表格需结合原页复核。"]}


def extract(path):
    extension = path.suffix.lower()
    if extension == ".docx":
        result = extract_docx(path)
    elif extension == ".pdf":
        result = extract_pdf(path)
    else:
        raise ValueError("仅支持 PDF 或 DOCX；旧版 DOC 需先转换。")
    result.update({"source_file": path.name,
                   "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                   "text_extraction_only": True})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--out", required=True, type=Path, help="抽取记录 JSON")
    parser.add_argument("--text", type=Path, help="可选：带定位标记的纯文本")
    args = parser.parse_args()
    try:
        result = extract(args.input)
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        if args.text:
            args.text.parent.mkdir(parents=True, exist_ok=True)
            text = "\n\n".join(f"[{result['source_file']} | {r['locator']}]\n{r['text']}" for r in result["records"])
            args.text.write_text(text, encoding="utf-8")
        print(json.dumps({"records": len(result["records"]),
                          "needs_visual_review": len(result["needs_visual_review"]),
                          "output": str(args.out)}, ensure_ascii=False))
        return 0
    except (OSError, ValueError, BadZipFile, ET.ParseError) as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

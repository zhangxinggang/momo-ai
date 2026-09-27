#!/usr/bin/env python3
"""Extract original DOCX blocks, or place original PDF pages in a facsimile DOCX."""
import argparse
import hashlib
import json
import sys
from pathlib import Path
from xml.dom import minidom
from zipfile import ZipFile, ZIP_DEFLATED

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def elements(node, name=None):
    return [child for child in node.childNodes
            if child.nodeType == child.ELEMENT_NODE and
            (name is None or (child.namespaceURI == W and child.localName == name))]


def section(node):
    if node.namespaceURI == W and node.localName == "sectPr":
        return node
    if node.namespaceURI == W and node.localName == "p":
        props = elements(node, "pPr")
        sections = elements(props[0], "sectPr") if props else []
        return sections[0] if sections else None
    return None


def read_docx(source):
    with ZipFile(source) as archive:
        doc = minidom.parseString(archive.read("word/document.xml"))
    body = doc.getElementsByTagNameNS(W, "body")[0]
    return doc, body, [node for node in elements(body) if node.localName != "sectPr"]


def list_blocks(source):
    _, _, blocks = read_docx(source)
    return [{"block": i, "kind": node.localName,
             "text": "".join(t.firstChild.data if t.firstChild else ""
                             for t in node.getElementsByTagNameNS(W, "t"))}
            for i, node in enumerate(blocks, 1)]


def extract_docx(source, output, start, end):
    doc, body, blocks = read_docx(source)
    if not 1 <= start <= end <= len(blocks):
        raise ValueError("DOCX block 范围越界；先使用 --list 查看从 1 开始的正文块编号")
    # The properties on a section's last paragraph govern all preceding blocks.
    # Materialize inherited header/footer refs before removing preceding sections.
    inherited = {}
    effective = {}
    for node in elements(body):
        props = section(node)
        if props is None:
            continue
        clone = props.cloneNode(True)
        refs = [n for n in elements(clone) if n.localName in ("headerReference", "footerReference")]
        own = {(n.localName, n.getAttributeNS(W, "type")): n for n in refs}
        for key, ref in inherited.items():
            if key not in own:
                clone.insertBefore(ref.cloneNode(True), clone.firstChild)
        inherited.update({key: n.cloneNode(True) for key, n in own.items()})
        effective[id(props)] = clone
    end_props = next((section(node) for node in elements(body)[elements(body).index(blocks[end - 1]):]
                      if section(node) is not None), None)
    if end_props is None:
        raise ValueError("DOCX 缺少节属性，无法保留原页面尺寸与边距")
    selected = [n.cloneNode(True) for n in blocks[start - 1:end]]
    for original, clone in zip(blocks[start - 1:end], selected):
        props = section(original)
        if props is not None:
            old = section(clone)
            old.parentNode.replaceChild(effective[id(props)].cloneNode(True), old)
    # The last selected section break becomes the body's final section, not an extra page.
    last = section(selected[-1])
    if last is not None:
        last.parentNode.removeChild(last)
    for node in list(body.childNodes):
        body.removeChild(node)
    for node in selected:
        body.appendChild(node)
    body.appendChild(effective[id(end_props)].cloneNode(True))
    with ZipFile(source) as original, ZipFile(output, "w", ZIP_DEFLATED) as target:
        for info in original.infolist():
            target.writestr(info, doc.toxml(encoding="UTF-8") if info.filename == "word/document.xml"
                            else original.read(info.filename))
    return {"mode": "native-docx", "blocks": [start, end],
            "verification": "保留原始 XML、样式、编号、关系、图片及页眉页脚；仍须对照原件检查分页与字体渲染。"}


def parse_pages(value, count):
    result = []
    for group in value.split(","):
        bounds = [int(n) for n in group.strip().split("-")]
        if len(bounds) not in (1, 2):
            raise ValueError("页码格式为 1-3,5；使用从 1 开始的 PDF 物理页码")
        start, end = bounds[0], bounds[-1]
        if not 1 <= start <= end <= count:
            raise ValueError("PDF 页码范围越界")
        result.extend(range(start, end + 1))
    if len(set(result)) != len(result) or result != sorted(result):
        raise ValueError("页码必须按原文顺序且不可重复")
    return result


def extract_pdf(source, output, pages, dpi=180):
    try:
        import pymupdf
    except ImportError as exc:
        raise ValueError("原页截取需要 PyMuPDF；安装 scripts/requirements.txt") from exc
    if not 96 <= dpi <= 300:
        raise ValueError("DPI 必须在 96–300 之间")
    relns = "http://schemas.openxmlformats.org/package/2006/relationships"
    office = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    with pymupdf.open(source) as pdf, ZipFile(output, "w", ZIP_DEFLATED) as target:
        selected = parse_pages(pages, len(pdf))
        body, rels = [], []
        for index, number in enumerate(selected, 1):
            page = pdf[number - 1]
            width, height = page.rect.width, page.rect.height
            cx, cy = round(width * 12700), round(height * 12700)
            sect = (f'<w:sectPr><w:type w:val="nextPage"/><w:pgSz w:w="{round(width * 20)}" w:h="{round(height * 20)}"/>'
                    '<w:pgMar w:top="0" w:right="0" w:bottom="0" w:left="0" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>')
            # Anchor each full-page image at the physical page origin; no baseline reflow.
            body.append(f'''<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="1" w:lineRule="exact"/>{sect if index < len(selected) else ""}</w:pPr><w:r><w:drawing>
<wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1">
<wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH><wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>
<wp:extent cx="{cx}" cy="{cy}"/><wp:wrapNone/><wp:docPr id="{index}" name="Original page {number}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>
<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="{index}" name="page-{number}.png"/><pic:cNvPicPr/></pic:nvPicPr>
<pic:blipFill><a:blip r:embed="rId{index}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
</pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r></w:p>''')
            if index == len(selected):
                body.append(sect)
            target.writestr(f"word/media/page-{index}.png", page.get_pixmap(dpi=dpi, alpha=False).tobytes("png"))
            rels.append(f'<Relationship Id="rId{index}" Type="{office}/image" Target="media/page-{index}.png"/>')
        target.writestr("word/document.xml", f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="{W}" xmlns:r="{office}" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>{"".join(body)}</w:body></w:document>''')
        target.writestr("word/_rels/document.xml.rels", f'<Relationships xmlns="{relns}">{"".join(rels)}</Relationships>')
        target.writestr("_rels/.rels", f'<Relationships xmlns="{relns}"><Relationship Id="rId1" Type="{office}/officeDocument" Target="word/document.xml"/></Relationships>')
        target.writestr("[Content_Types].xml", '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
    return {"mode": "page-facsimile", "pages": selected, "dpi": dpi,
            "verification": "原页等比例嵌入 Word，保持可见版式；内容为图片，不是可逐字编辑的表单。"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--list", action="store_true", help="列出 DOCX 顶层块编号及文本")
    parser.add_argument("--start-block", type=int)
    parser.add_argument("--end-block", type=int)
    parser.add_argument("--pages", help="PDF 物理页码，如 18-21,24")
    parser.add_argument("--dpi", type=int, default=180)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()
    try:
        if args.list:
            print(json.dumps(list_blocks(args.input), ensure_ascii=False, indent=2))
            return 0
        if not args.out or args.out.suffix.lower() != ".docx":
            raise ValueError("--out 必须为 .docx 文件")
        if args.out.resolve() == args.input.resolve() or args.out.exists():
            raise ValueError("不能覆盖原件或已有文件；选择新的输出路径")
        args.out.parent.mkdir(parents=True, exist_ok=True)
        if args.input.suffix.lower() == ".docx" and args.start_block and args.end_block:
            result = extract_docx(args.input, args.out, args.start_block, args.end_block)
        elif args.input.suffix.lower() == ".pdf" and args.pages:
            result = extract_pdf(args.input, args.out, args.pages, args.dpi)
        else:
            raise ValueError("DOCX 需指定 --start-block/--end-block；PDF 需指定 --pages")
        result.update({"source": str(args.input), "sha256": hashlib.sha256(args.input.read_bytes()).hexdigest(),
                       "output": str(args.out), "size": args.out.stat().st_size})
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

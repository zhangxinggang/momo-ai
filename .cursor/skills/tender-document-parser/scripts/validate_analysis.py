#!/usr/bin/env python3
"""Validate normalized tender-document-parser output using only the stdlib."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Iterable


SECTION_MODULES = {
    "info_content": ["基础信息", "投标人须知", "项目概况", "关键时间节点", "价格与保证金信息"],
    "latent_risk_content": ["商务风险", "控标风险"],
    "invalid_bids_content": ["废标项"],
    "qualify_content": ["企业资格要求", "人员配置要求", "财务与信誉要求", "资格性审查要点"],
    "evaluate_content": [
        "技术部分评分标准",
        "技术评审要求",
        "形式评审标准",
        "资格评审标准",
        "响应性评审标准",
        "商务部分评分标准",
        "报价评分标准",
    ],
    "doc_preparation_content": ["投标文件组成", "格式要求明细表", "电子投标要求表", "附件清单表"],
    "bid_submission_content": ["资格要求和符合性审查材料", "投标报价", "提交资料文件加分项", "其他需要提交的资料"],
}

TEXT_FIELDS = {
    "info_content": {
        "基础信息": {"信息类别", "具体内容"},
        "投标人须知": {"条款主题", "具体要求", "说明"},
        "项目概况": {"项目要素", "具体要求"},
        "关键时间节点": {"时间节点", "具体时间", "要求"},
        "价格与保证金信息": {"费用项目", "金额", "形式要求"},
    },
    "latent_risk_content": {
        "商务风险": {"风险点", "风险说明"},
        "控标风险": {"风险点", "风险说明"},
    },
    "invalid_bids_content": {"废标项": {"风险点", "风险说明", "原文"}},
    "qualify_content": {
        "企业资格要求": {"资格要求", "具体标准", "证明材料要求"},
        "人员配置要求": {"人员角色", "数量", "资格/经验要求", "证明材料要求"},
        "财务与信誉要求": {"要求类别", "具体标准", "证明材料", "风险等级"},
        "资格性审查要点": {"审查项目", "审查标准", "检查方式", "风险等级"},
    },
    "evaluate_content": {
        "技术部分评分标准": {"评分因素", "分值", "评分规则或标准"},
        "技术评审要求": {"评审因素", "评审标准", "评判要点"},
        "形式评审标准": {"评审因素", "评审标准", "检查要点"},
        "资格评审标准": {"评审因素", "评审标准", "证明材料要求"},
        "响应性评审标准": {"评审因素", "评审标准", "要求"},
        "商务部分评分标准": {"评分因素", "分值", "评分规则或标准"},
        "报价评分标准": {"评分因素", "分值", "计算公式", "基准价确定方式"},
    },
    "doc_preparation_content": {
        "投标文件组成": {"文件类别", "核心组成部分", "是否必交", "格式要求"},
        "格式要求明细表": {"要求项目", "具体标准", "检查要点"},
        "电子投标要求表": {"技术要求", "具体标准", "准备工作"},
        "附件清单表": {"附件名称", "获取来源", "准备要求"},
    },
    "bid_submission_content": {
        "资格要求和符合性审查材料": {"资料名称", "资料内容", "说明"},
        "投标报价": {"资料名称", "资料内容", "说明"},
        "提交资料文件加分项": {"资料名称", "资料内容", "说明"},
        "其他需要提交的资料": {"资料名称", "资料内容", "说明"},
    },
}

DOCUMENT_KEYS = {
    "title",
    "filename",
    "source_uri",
    "document_type",
    "procurement_method",
    "project_code",
    "lot",
    "page_count",
    "language",
    "analysis_scope",
}

CROSS_CHECK_KEYS = {
    "score_totals",
    "amount_consistency",
    "deadline_consistency",
    "required_document_coverage",
    "contradictions",
}

ROOT_KEYS = {
    "schema_version",
    "document",
    *SECTION_MODULES.keys(),
    "tech_parms_content",
    "bid_template_content",
    "deviation_template_content",
    "cross_checks",
    "warnings",
}

CONFIDENCE = {"high", "medium", "low"}


def read_json(path: str) -> Any:
    if path == "-":
        return json.load(sys.stdin)
    with Path(path).open("r", encoding="utf-8-sig") as handle:
        return json.load(handle)


def is_nonempty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def ordered_unique(values: Iterable[Any]) -> list[Any]:
    result: list[Any] = []
    for value in values:
        if value not in result:
            result.append(value)
    return result


def validate_source(source: Any, path: str, errors: list[str]) -> None:
    if not isinstance(source, dict):
        errors.append(f"{path} must be an object")
        return
    if not is_nonempty_string(source.get("quote")):
        errors.append(f"{path}.quote must be a non-empty string")
    pages = source.get("pages")
    if pages is not None and not isinstance(pages, list):
        errors.append(f"{path}.pages must be an array when present")
    section_path = source.get("section_path")
    if section_path is not None and not isinstance(section_path, list):
        errors.append(f"{path}.section_path must be an array when present")


def validate_evidence_item(item: Any, path: str, errors: list[str]) -> list[Any]:
    if not isinstance(item, dict):
        errors.append(f"{path} must be an object")
        return []
    idx = item.get("idx")
    if not isinstance(idx, list) or not idx:
        errors.append(f"{path}.idx must be a non-empty array")
        idx = []
    if not isinstance(item.get("text"), dict):
        errors.append(f"{path}.text must be an object")
    validate_source(item.get("source"), f"{path}.source", errors)
    if item.get("confidence") not in CONFIDENCE:
        errors.append(f"{path}.confidence must be one of {sorted(CONFIDENCE)}")
    return idx


def validate_section_module(name: str, value: Any, errors: list[str], warnings: list[str]) -> None:
    if not isinstance(value, list):
        errors.append(f"{name} must be an array, not a JSON-encoded string")
        return

    seen_titles: list[str] = []
    for section_index, section in enumerate(value):
        path = f"{name}[{section_index}]"
        if not isinstance(section, dict):
            errors.append(f"{path} must be an object")
            continue
        title = section.get("title")
        if not is_nonempty_string(title):
            errors.append(f"{path}.title must be a non-empty string")
            continue
        seen_titles.append(title)
        content = section.get("bid_content")
        if not isinstance(content, list):
            errors.append(f"{path}.bid_content must be an array, not a JSON-encoded string")
            continue
        collected_ids: list[Any] = []
        for item_index, item in enumerate(content):
            item_path = f"{path}.bid_content[{item_index}]"
            collected_ids.extend(validate_evidence_item(item, item_path, errors))
            text = item.get("text") if isinstance(item, dict) else None
            if isinstance(text, dict):
                for field in sorted(TEXT_FIELDS.get(name, {}).get(title, set())):
                    if field not in text:
                        errors.append(f"{item_path}.text is missing required field: {field}")
        ids = section.get("ids")
        if not isinstance(ids, list):
            errors.append(f"{path}.ids must be an array")
        elif ids != ordered_unique(collected_ids):
            warnings.append(f"{path}.ids does not equal the ordered union of item idx values")
        if not isinstance(section.get("bid_raw_content"), str):
            errors.append(f"{path}.bid_raw_content must be a string")

    duplicates = sorted({title for title in seen_titles if seen_titles.count(title) > 1})
    for title in duplicates:
        errors.append(f"{name} contains duplicate section title: {title}")
    for title in SECTION_MODULES[name]:
        if title not in seen_titles:
            errors.append(f"{name} is missing required section: {title}")


def validate_technical(value: Any, errors: list[str]) -> None:
    if not isinstance(value, list):
        errors.append("tech_parms_content must be an array")
        return
    for index, item in enumerate(value):
        path = f"tech_parms_content[{index}]"
        if not isinstance(item, dict):
            errors.append(f"{path} must be an object")
            continue
        for field in ("name", "name_summary", "bid_content", "bid_raw_content"):
            if not isinstance(item.get(field), str):
                errors.append(f"{path}.{field} must be a string")
        if not isinstance(item.get("ids"), list) or not item.get("ids"):
            errors.append(f"{path}.ids must be a non-empty array")
        validate_source(item.get("source"), f"{path}.source", errors)
        if item.get("confidence") not in CONFIDENCE:
            errors.append(f"{path}.confidence must be one of {sorted(CONFIDENCE)}")


def validate_template(name: str, value: Any, errors: list[str]) -> None:
    if not isinstance(value, dict):
        errors.append(f"{name} must be an object")
        return
    if not isinstance(value.get("version"), int):
        errors.append(f"{name}.version must be an integer")
    if not isinstance(value.get("items"), list):
        errors.append(f"{name}.items must be an array")
    if not isinstance(value.get("warnings"), list):
        errors.append(f"{name}.warnings must be an array")


def validate_document(value: Any, errors: list[str]) -> None:
    if not isinstance(value, dict):
        errors.append("document must be an object")
        return
    for key in sorted(DOCUMENT_KEYS - value.keys()):
        errors.append(f"document is missing required field: {key}")
    if value.get("language") != "zh-CN":
        errors.append('document.language must equal "zh-CN"')
    if value.get("analysis_scope") not in {"full", "partial"}:
        errors.append('document.analysis_scope must be "full" or "partial"')


def validate_cross_checks(value: Any, errors: list[str]) -> None:
    if not isinstance(value, dict):
        errors.append("cross_checks must be an object")
        return
    for key in sorted(CROSS_CHECK_KEYS - value.keys()):
        errors.append(f"cross_checks is missing required field: {key}")
    for key in CROSS_CHECK_KEYS & value.keys():
        if not isinstance(value[key], list):
            errors.append(f"cross_checks.{key} must be an array")


def validate_warnings(value: Any, errors: list[str]) -> None:
    if not isinstance(value, list):
        errors.append("warnings must be an array")
        return
    for index, warning in enumerate(value):
        path = f"warnings[{index}]"
        if not isinstance(warning, dict):
            errors.append(f"{path} must be an object")
            continue
        for field in ("code", "message"):
            if not is_nonempty_string(warning.get(field)):
                errors.append(f"{path}.{field} must be a non-empty string")
        if warning.get("level") not in {"info", "warning", "error"}:
            errors.append(f"{path}.level must be info, warning, or error")
        if not isinstance(warning.get("evidence_ids"), list):
            errors.append(f"{path}.evidence_ids must be an array")


def detect_encoding_damage(value: Any, path: str, warnings: list[str]) -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            detect_encoding_damage(child, f"{path}.{key}", warnings)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            detect_encoding_damage(child, f"{path}[{index}]", warnings)
    elif isinstance(value, str) and ("\ufffd" in value or "锟斤拷" in value):
        warnings.append(f"{path} contains likely encoding damage")


def validate(data: Any) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    if not isinstance(data, dict):
        return ["root must be an object"], warnings

    for key in sorted(ROOT_KEYS - data.keys()):
        errors.append(f"missing root key: {key}")
    if data.get("schema_version") != "tender-analysis/1.0":
        errors.append('schema_version must equal "tender-analysis/1.0"')
    validate_document(data.get("document"), errors)
    validate_cross_checks(data.get("cross_checks"), errors)
    validate_warnings(data.get("warnings"), errors)

    for name in SECTION_MODULES:
        validate_section_module(name, data.get(name), errors, warnings)
    validate_technical(data.get("tech_parms_content"), errors)
    validate_template("bid_template_content", data.get("bid_template_content"), errors)
    validate_template("deviation_template_content", data.get("deviation_template_content"), errors)
    detect_encoding_damage(data, "$", warnings)
    return errors, ordered_unique(warnings)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("json_file", help="UTF-8 JSON file, or - to read stdin")
    args = parser.parse_args()
    try:
        data = read_json(args.json_file)
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        print(f"ERROR: unable to read valid JSON: {exc}", file=sys.stderr)
        return 1

    errors, warnings = validate(data)
    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"ERROR: {error}", file=sys.stderr)
    if errors:
        print(f"FAILED: {len(errors)} error(s), {len(warnings)} warning(s)", file=sys.stderr)
        return 1
    print(f"OK: normalized tender analysis is valid ({len(warnings)} warning(s))")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

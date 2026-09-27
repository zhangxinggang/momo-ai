# 规范化输出契约

默认输出一个 UTF-8 JSON 对象。对象和数组必须是真实 JSON 结构，禁止把它们再次序列化成字符串；禁止尾随逗号、注释、Markdown 代码围栏和 `NaN`。

## 根对象

以下字段全部必需。未提取到内容时按规定输出空数组或空对象，不能删除字段。

```json
{
  "schema_version": "tender-analysis/1.0",
  "document": {
    "title": null,
    "filename": null,
    "source_uri": null,
    "document_type": "未知",
    "procurement_method": null,
    "project_code": null,
    "lot": null,
    "page_count": null,
    "language": "zh-CN",
    "analysis_scope": "full"
  },
  "info_content": [
    {"title": "基础信息", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "投标人须知", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "项目概况", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "关键时间节点", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "价格与保证金信息", "bid_content": [], "ids": [], "bid_raw_content": ""}
  ],
  "tech_parms_content": [],
  "latent_risk_content": [
    {"title": "商务风险", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "控标风险", "bid_content": [], "ids": [], "bid_raw_content": ""}
  ],
  "invalid_bids_content": [
    {"title": "废标项", "bid_content": [], "ids": [], "bid_raw_content": ""}
  ],
  "qualify_content": [
    {"title": "企业资格要求", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "人员配置要求", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "财务与信誉要求", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "资格性审查要点", "bid_content": [], "ids": [], "bid_raw_content": ""}
  ],
  "evaluate_content": [
    {"title": "技术部分评分标准", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "技术评审要求", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "形式评审标准", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "资格评审标准", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "响应性评审标准", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "商务部分评分标准", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "报价评分标准", "bid_content": [], "ids": [], "bid_raw_content": ""}
  ],
  "doc_preparation_content": [
    {"title": "投标文件组成", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "格式要求明细表", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "电子投标要求表", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "附件清单表", "bid_content": [], "ids": [], "bid_raw_content": ""}
  ],
  "bid_submission_content": [
    {"title": "资格要求和符合性审查材料", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "投标报价", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "提交资料文件加分项", "bid_content": [], "ids": [], "bid_raw_content": ""},
    {"title": "其他需要提交的资料", "bid_content": [], "ids": [], "bid_raw_content": ""}
  ],
  "bid_template_content": { "version": 1, "items": [], "warnings": [] },
  "deviation_template_content": { "version": 1, "items": [], "warnings": [] },
  "cross_checks": {
    "score_totals": [],
    "amount_consistency": [],
    "deadline_consistency": [],
    "required_document_coverage": [],
    "contradictions": []
  },
  "warnings": []
}
```

## `document`

```json
{
  "title": "原文项目名称或 null",
  "filename": "源文件名或 null",
  "source_uri": "源地址或 null",
  "document_type": "招标文件/询比文件/磋商文件/谈判文件/采购文件/未知",
  "procurement_method": "原文采购方式或 null",
  "project_code": "项目编号或 null",
  "lot": "标段或包件或 null",
  "page_count": null,
  "language": "zh-CN",
  "analysis_scope": "full"
}
```

未知标量使用 `null`，不要用“未提及”“无”混淆未知与明确没有。只有原文明示“无/不要求”时，文本字段才写对应原文。
完整解析使用 `analysis_scope=full`；用户明确只解析单一模块时使用 `partial`，其他固定分组仍保留空结构。

## 通用分组结构

除技术参数与模板外，模块使用以下结构：

```json
{
  "title": "基础信息",
  "bid_content": [
    {
      "idx": ["p0003"],
      "text": {
        "信息类别": "项目名称",
        "具体内容": "某项目"
      },
      "source": {
        "pages": [1],
        "section_path": ["第一章 招标公告"],
        "quote": "项目名称：某项目"
      },
      "confidence": "high"
    }
  ],
  "ids": ["p0003"],
  "bid_raw_content": "项目名称：某项目"
}
```

约束：

- `title` 与模块目录中的标准分组一致；允许增加项目特有分组，但不能替代固定分组。
- `bid_content` 必须是数组。每项包含非空 `idx`、对象 `text`、对象 `source` 和 `confidence`。
- `source.quote` 使用足以证明结论的最短连续原文；不要整页复制。
- `ids` 是本分组全部 `idx` 去重后的阅读顺序并集。
- `bid_raw_content` 是相关原文的可读拼接，可为空字符串，但不能杜撰。
- 空分组示例：`{"title":"人员配置要求","bid_content":[],"ids":[],"bid_raw_content":""}`。

## 技术参数结构

`tech_parms_content` 是扁平数组：

```json
{
  "name": "接口集成",
  "name_summary": "业务系统接口集成",
  "bid_content": "完成与 MES、能耗和视频监控系统的数据对接，并提供接口文档。",
  "ids": ["p0102", "t008-r003"],
  "quantity": null,
  "unit_name": null,
  "bid_raw_content": "原文连续摘录",
  "source": {
    "pages": [18, 19],
    "section_path": ["第五章 技术要求", "数据对接"],
    "quote": "完成与……系统对接……"
  },
  "confidence": "high"
}
```

技术项的 `bid_content` 是自然语言字符串，不是嵌套 JSON。

## 模板结构

`bid_template_content`：

```json
{
  "version": 1,
  "items": [
    {
      "catalog_id": "tpl-001",
      "catalog_name": "投标函",
      "is_required": true,
      "order": 1,
      "requirement": "按原格式填写并签字盖章",
      "source": {
        "filename": "采购文件.docx",
        "pages": [32, 33],
        "section_path": ["第六章 响应文件格式", "投标函"],
        "quote": "投标函",
        "extract_mode": "slice",
        "confidence": "high"
      },
      "template_file": null,
      "warnings": []
    }
  ],
  "warnings": []
}
```

`deviation_template_content`：

```json
{
  "version": 1,
  "items": [
    {
      "template_id": "deviation-001",
      "template_name": "技术偏离表",
      "sheet_name": "技术偏离表",
      "order": 1,
      "columns": [
        {"key": "sequence", "title": "序号", "source_title": "序号", "order": 1, "required": true},
        {"key": "requirement", "title": "条款要求", "source_title": "条款要求", "order": 2, "required": true},
        {"key": "response", "title": "投标响应", "source_title": "投标响应", "order": 3, "required": true},
        {"key": "deviation_type", "title": "偏离情况", "source_title": "偏离情况", "order": 4, "required": true}
      ],
      "fill_rules": [],
      "technical_scope": "technical",
      "source": {
        "pages": [36],
        "section_path": ["技术偏离表"],
        "quote": "技术偏离表",
        "confidence": "high"
      }
    }
  ],
  "warnings": []
}
```

## `cross_checks`

```json
{
  "score_totals": [
    {"name": "总评分", "declared": 100, "calculated": 100, "status": "match", "evidence_ids": ["t004-r009"]}
  ],
  "amount_consistency": [],
  "deadline_consistency": [],
  "required_document_coverage": [],
  "contradictions": []
}
```

`status` 使用 `match`、`conflict`、`incomplete` 或 `not_applicable`。每个冲突都列出各候选值和对应证据，不自行裁决。

## `warnings`

数组中的每个元素使用以下结构：

```json
{
  "code": "OCR_UNCERTAIN",
  "level": "warning",
  "message": "第 12 页金额小数点无法可靠识别。",
  "evidence_ids": ["img012-b004"]
}
```

`level` 使用 `info`、`warning`、`error`。常用代码：`MISSING_ATTACHMENT`、`UNREADABLE_PAGE`、`OCR_UNCERTAIN`、`CONFLICTING_CLAUSE`、`INCOMPLETE_FORMULA`、`MISSING_MODULE`、`TEMPLATE_NOT_EXTRACTED`。

## 旧接口兼容

如果调用方明确要求样例中的旧式 `*_content` 字符串：

1. 先生成并校验本规范对象；
2. 只对调用方契约明确指定的字段执行一次 `JSON.stringify`；
3. 不把单条 `text` 再次字符串化，不混用对象和字符串版本；
4. 最终外层仍必须是合法 JSON，且不得有尾随逗号；
5. 在 `warnings` 中记录 `LEGACY_STRING_ENCODING`，便于下游迁移。

不要复制历史样例中的嵌套编码缺陷。

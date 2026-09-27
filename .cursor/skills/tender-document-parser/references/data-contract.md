# 动态数据契约 v2

`scripts/render_report.py --init PATH` 创建空骨架。一级模块的 `id/title` 受渲染器校验；模块名与顺序固定。其余结构按原文动态填写。

## 根对象

```json
{
  "schema_version": 2,
  "document_title": "本次标书项目名称或文件名",
  "source_files": ["采购文件.pdf"],
  "coverage": {
    "status": "complete",
    "summary": "已读取所提供文件的全部正文和附件。",
    "unread": []
  },
  "modules": []
}
```

`coverage.status` 为 `complete` 或 `partial`；有未读页、缺失正文或未读附件时使用 `partial`，`unread` 明确列出文件和位置。`complete` 仅表示本次提供的文件已读完，不代表现实中所有招标附件都已提供。

## 固定模块

按顺序填入：`basic` / 基础信息，`technical` / 技术参数要求，`risks` / 潜在风险，`disqualification` / 废标项，`eligibility` / 投标人资格要求，`evaluation` / 评标标准，`submission` / 投标文件要求，`documents` / 应标所需文件，`templates` / 投标文件模板，`qa` / 智能问答。

```json
{
  "id": "technical",
  "title": "技术参数要求",
  "empty_message": "未在已读取范围发现明确的技术参数要求。",
  "sections": [
    {
      "id": "warehouse-system",
      "title": "仓储管理系统",
      "blocks": [
        {
          "kind": "table",
          "title": "功能要求",
          "columns": ["功能", "要求", "适用范围"],
          "rows": [
            {
              "cells": ["批次追踪", "支持入库至出库的批次追踪", "全部仓库"],
              "basis": "explicit",
              "evidence": [
                {"file": "采购文件.pdf", "locator": "第18页，第4.2条", "quote": "系统应支持全部仓库入库至出库的批次追踪。"}
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

以上数据仅说明结构，不是需要复用的章节或事实。

## 动态 sections 与 blocks

- 每个 `section` 对应一个动态二级 Tab：`id` 在该模块内唯一，`title` 是本次文档的分组名称，`blocks` 是一个或多个内容块。
- `table` 块：`columns` 为动态表头数组，至少 1 列；`rows` 为数组，每行 `cells` 数量与表头一致；单元格为字符串或字符串数组（显示多行）。
- `text` 块：`text` 为字符串或字符串数组，可以添加可选的 `title`。
- `template` 块：只在 `templates` 模块出现，`basis` 必须为 `explicit`。用 `document: {"name":"报价表.docx", "source_id":"artifact_create 返回的 sourceRef.sourceId", "extraction":"native-docx"}` 指向实际截取的 Word；PDF 原页模式使用 `page-facsimile`。不使用 `text` 重建模板。证据仍引用原招采文件。具体截取与注册见 [template-extraction.md](template-extraction.md)。
- 事实行和 `text` 块：`basis` 为 `explicit/inferred/missing`，`evidence` 为证据数组。`inferred` 和 `missing` 需要非空 `note`。`explicit/inferred` 必须有证据；`template` 只接受带证据的 `explicit`。
- `evidence` 每项为 `{file, locator, quote}`，均为非空字符串；`file` 必须存在于 `source_files`。可给单条内容多个证据。
- 无内容的模块使用 `sections: []` 并填写具体 `empty_message`。一级 Tab 仍显示。不要创建空的二级 Tab 或用示例数据填满。
- 表头和内容均为纯文本，不支持 Markdown/HTML 渲染或远程图片。列表用字符串数组；公式用纯文本，避免生成执行代码。

## 动态结构的例子

软件采购的技术模块可以有“数据接口”“系统功能”“部署与验收”；施工项目可以有“土建工程”“设备安装”“质量标准”；服务项目可以有“服务范围”“人员配置”。这些只是可用组织方式，必须以本次标书为依据。

不要把当前参考页面的基础信息五个二级栏目直接填入每份文件，也不要为所有表格强制相同的表头。渲染器只锁定一级 Tab 和界面组件，其余数据随标书变化。

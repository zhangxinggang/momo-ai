# 标书解析技能架构

`tender-document-parser` 是项目级技能，将 DOCX、PDF、图片或上游文本块转换为带原文证据的统一投标分析 JSON。技能只分析用户指定的招采材料，不主动查询企业信用、证书或其他外部事实。

```mermaid
flowchart LR
  User[用户解析请求]
  Input[招采文件或已提取文本]

  subgraph Skill[".cursor/skills/tender-document-parser"]
    Guard[文档指令隔离与输入完整性检查]
    Extract[文本 / 表格 / OCR 提取]
    Evidence[稳定证据单元<br/>ID・页码・章节・原文]

    subgraph Modules[十大解析模块]
      Info[基础信息]
      Tech[技术参数]
      Risk[潜在风险与废标项]
      Qualify[投标人资格]
      Evaluate[评标标准]
      Prepare[投标文件要求]
      Submit[应标所需文件]
      Template[投标与偏离模板]
    end

    CrossCheck[金额・时间・评分・材料覆盖・冲突校验]
    Contract["tender-analysis/1.0 JSON 契约"]
    Validator[validate_analysis.py]
  end

  Consumer[投标助手 UI / 后续自动化 / 人工复核]

  User --> Input --> Guard --> Extract --> Evidence
  Evidence --> Info
  Evidence --> Tech
  Evidence --> Risk
  Evidence --> Qualify
  Evidence --> Evaluate
  Evidence --> Prepare
  Evidence --> Submit
  Evidence --> Template
  Modules --> CrossCheck --> Contract --> Validator --> Consumer
```

模块共享同一证据定位，同一条款可以因用途进入不同模块，但不能失去原文来源。固定模块即使无内容也保留空结构；冲突值不静默覆盖，而是进入 `cross_checks.contradictions`。校验器负责阻止缺失模块、嵌套 JSON 字符串、证据结构错误和明显编码损坏进入下游。

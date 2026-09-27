# Skill Platform 技能资源

应用默认技能分为用户可导入的 `default/skills/user` 和系统功能调用的 `default/skills/builtIn`。用户资源进入技能数据库与本地仓库；功能规则由固定清单加载，不进入用户技能管理或 Agent 斜杠资源目录。

```mermaid
flowchart LR
  subgraph Defaults["apps/skill-platform/default/skills"]
    UserZip["user/*.zip<br/>原有三个默认技能"]
    Builtin["builtIn/*/SKILL.md<br/>references/*.md"]
    Manifest["builtIn/manifest.json<br/>固定资源 ID 与路径"]
  end
  UserZip --> Preview["Main 默认技能预览 / 导入"]
  Preview --> UserUI[用户选择导入]
  UserUI --> Preview
  Preview --> Database[(技能数据库)]
  Preview --> Repository[(用户技能仓库)]
  Manifest --> Catalog[共享清单 / 正文解析 / 模板替换]
  Builtin -->|构建时同源默认值| Catalog
  Builtin -->|运行时读取| Loader["Main 内置技能加载器"]
  Catalog --> Loader
  Loader -->|skill:getBuiltinSkills| Preload[Preload skill API]
  Preload --> Snapshot[Renderer 启动快照]
  Snapshot --> Features["工具与界面生成 / 技能编辑<br/>笔记改写 / 网页问答 / 工作流 / 聊天规则"]
  Catalog -->|浏览器与缺失文件回退| Snapshot
  Loader --> MainFeatures["规则改写 / 安全审查<br/>Harness 运行服务"]
  Loader --> Worker[知识库 utility process]
```

`SKILL.md` 去除 YAML 后注入正文；参考文件直接使用正文。`{{参数名}}` 只做一次文本替换，参数中的标记不再展开。预览与导入仅扫描 `user` 的 ZIP，原有 `default://文件名` 来源契约保持兼容。

```mermaid
flowchart LR
  Source["builtIn 部署策略<br/>assistant / language / plan / continue"]
  Source -->|构建与 ensure 校验| Build[Harness Build]
  Build --> Json["builtin-policies.json"]
  Build --> Profile["cordis.patch.yml<br/>实际 persona 与计划规则"]
  Json --> Standalone[独立 Harness 默认策略]
  Profile --> Standalone
  Source -->|每轮读取| Main[ChatApplicationService]
  Main -->|NDJSON start.builtinPolicies| Bridge[momo-host-bridge]
  Standalone --> Bridge
  Bridge --> System["原生 systemPrompt / planMode"]
  Bridge --> Continue[输出截断后的续写请求]
```

桌面安装包将整个 `default` 目录复制到应用根目录、ASAR 外。Renderer 启动加载快照，编辑文件后重启即可生效；Main 与知识库进程按请求读取。Harness 使用同源打包快照支持独立运行，并接受宿主每轮传入的当前策略。`--ensure` 同时校验策略快照及替换后的 profile，避免复用过期运行包。

维护位置及模板约定见 [默认技能资源](../../apps/skill-platform/default/README.md)。`.cursor/skills/custom-tool-tech-design` 仅作为开发工具入口，指向 `builtIn` 的唯一规则源。OpenUI 的组件 schema 与系统权限、结果校验仍由代码或第三方库维护。

## 用户技能仓库同步

```mermaid
flowchart LR
  UI[技能管理 / 文件编辑器] -->|skill:syncFromRepo| IPC[Preload / Main IPC]
  IPC --> Read[仅读取根目录 SKILL.md]
  Read --> Parse[解析并比较元信息与正文]
  Parse --> DB[(技能数据库)]
  Files[(用户技能仓库)] --> Read
  UI --> Editor["@momo/file-editor<br/>原始字节识别文本"]
  Editor -->|读写文件 IPC| Files
```

同步和元信息回写只读取根目录 `SKILL.md`，无需遍历 `agents`、`references` 等辅助文件。通用目录读取跳过遍历期间消失的条目，权限及其他读取错误继续上报。文件编辑按内容识别 UTF-8 文本，详细边界见 [文件编辑器](./file-editor.md)。

`@momo/aichat` 通过宿主注入的引用规则与附件默认任务生成实际请求，发送给模型的业务指令由宿主提供。工作流提供文件正文与来源标签，统一模板负责说明参考方式。

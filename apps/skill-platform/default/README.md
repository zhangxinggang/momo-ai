# 默认技能资源

- `skills/user/`：向用户展示、允许选择导入的默认技能 ZIP。原 `skills/` 中的 `code-honor.zip`、`how-to-do.zip`、`karpathy-guidelines.zip` 均在此目录，导入后的技能仍保存在用户技能仓库与数据库。
- `skills/builtIn/`：系统功能调用的技能源码，不出现在默认技能导入列表。每项能力使用 `SKILL.md`，较大的规则或输入模板拆入 `references/`；`manifest.json` 将稳定资源标识映射到实际文件。

## 修改内置规则

直接修改 `skills/builtIn` 中对应的 Markdown 文件。`SKILL.md` 的 YAML 只用于说明名称与用途，模型接收其正文。模板使用 `{{参数名}}`，保留这些参数即可修改周围指令；参数只替换一次，不执行代码。

桌面应用启动时经 Main / Preload 加载这份目录，Renderer 在本次启动内使用同一快照；修改后重启应用即可生效，无需重新编译。Main 的规则改写、安全审查、知识库证据与 Harness 策略在调用时读取文件。安装包将整个 `default` 目录放在应用根目录、ASAR 外，维护时编辑安装目录中的对应文件。

浏览器模式使用构建时的同源默认值，修改后需刷新开发页面或重新构建。新增资源或修改 `skills/builtIn/manifest.json` 的映射也需要重新构建。文件缺失时回退到从同一份 `skills/builtIn` 编译的默认内容，空文件或不可读取文件报错。

## 能力位置

以下目录均相对于 `skills/builtIn/`。

| 功能 | 目录 |
| --- | --- |
| 科技视觉规范 | `custom-tool-tech-design` |
| HTML / OpenUI 生成及校验修复 | `custom-tool-generation` |
| 技能生成、润色、翻译、安全审查 | `skill-creator`、`skill-polisher`、`skill-translator`、`skill-safety-review` |
| 笔记与 AI 规则改写 | `note-rewrite`、`rules-rewrite` |
| 对话工作流、回答约束、标题、引用 | `chat-superpowers`、`chat-answer-focus`、`chat-title`、`chat-reference` |
| 网页总结与问答 | `webpage-summary`、`webpage-answer` |
| 知识证据与无匹配说明 | `knowledge-answer`、`knowledge-no-match` |
| Harness 身份、语言、计划、续写、引用 | `runtime-assistant`、`runtime-language`、`runtime-plan`、`runtime-continue`、`runtime-reference` |
| 模型连接测试 | `ai-connection-test` |
| 工作流上下文与附件默认任务 | `workflow-context`、`attachment-context`、`attachment-task` |

AI 对话的普通界面展示规则维护在 `chat-view-generation/SKILL.md`，生成和自动修复都使用该规则；工具箱继续使用科技视觉规范。聊天中显式调用的 Skill/Command 通过 Agent 执行，不套用通用界面生成规范。

OpenUI 组件 API / schema 仍由 `@openuidev/react-ui` 生成，技术人员在 `custom-tool-generation/references/openui.md` 中维护产品规则。代码继续负责输入校验、权限、工具执行、结果解析与文件保存。

独立 Harness 构建会读取 `skills/builtIn` 中四项部署策略，生成运行包内的 `builtin-policies.json` 与实际 profile，`--ensure` 检查策略变更。桌面端每轮还会传入外部目录的当前策略，因此安装后的规则修改不会受旧运行包快照限制。

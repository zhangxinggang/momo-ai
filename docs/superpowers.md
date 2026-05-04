> 让你的 AI 从“代码生成器”进化成“结构化开发者” —— 一套强制 TDD、计划驱动、自动审查的开发框架

---

### 📌 什么是 Superpowers？

Superpowers 是一个为 AI 编程助手（Claude Code、Cursor、Codex、Gemini CLI 等）设计的 **技能框架 + 软件开发方法论** 。

它的核心思想很简单： **不让 AI 一上来就写代码** ，而是强制它遵循一套严谨的工作流：

> 澄清需求 → 设计确认 → 拆解计划 → 测试驱动实现 → 自动审查 → 规范收尾

目前该项目在 GitHub 上已获得 **12.6k+ 星标** ，由 Jesse Vincent 及 Prime Radiant 团队开发维护。

---

### 🧠 核心理念（四原则）

| 原则                   | 说明                   |
| ---------------------- | ---------------------- |
| **测试驱动开发**       | 永远先写测试，再写实现 |
| **系统性优于临时方案** | 遵循既定流程，不靠猜测 |
| **复杂性降低**         | 简化是首要目标         |
| **证据优于声明**       | 验证后才算完成         |

---

### 📦 安装指南（按平台）

安装后，AI 会自动识别并调用相关技能，无需手动触发。

| 平台 | 安装方式 |
| --- | --- |
| **Claude Code（官方市场）** | `/plugin install superpowers@claude-plugins-official` |
| **Claude Code（第三方市场）** | ① `/plugin marketplace add obra/superpowers-marketplace` ② `/plugin install superpowers@superpowers-marketplace` |
| **Cursor** | `/add-plugin superpowers` 或插件市场搜索 “superpowers” |
| **Codex** | 告诉 Codex： `Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.codex/INSTALL.md` |
| **OpenCode** | 告诉 OpenCode： `Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md` |
| **Gemini CLI** | `gemini extensions install https://github.com/obra/superpowers` |

#### ✅ 验证安装

新会话中输入：

> “帮我规划这个功能” 或 “让我们调试这个问题”

若 AI 自动调用相应技能（开始提问澄清需求或系统性排查），即安装成功。

---

### 🚀 完整使用流程

从提出想法到功能合入，你只需参与关键决策，其余由 AI 按技能自动执行。

#### 步骤 1：提出需求（自然语言即可）

直接告诉 AI 你想做什么，不需要事先准备详细文档。

> 示例：“我想给博客加一个标签云功能，让用户可以按标签筛选文章。”

#### 步骤 2：AI 启动头脑风暴（自动触发）

AI 检测到你要开发新功能，自动调用 `brainstorming` 技能，通过提问帮你澄清：

- 标签云的展示样式？（列表 / 权重图 / 热力图）
- 是否需要按文章数量排序？
- 筛选后页面如何变化？

AI 会 **分块呈现设计草案** ，你逐块确认。最终生成设计文档（通常保存在 `docs/` 或项目根目录）。

#### 步骤 3：批准设计，生成实施计划

确认设计后，AI 自动执行：

1. `using-git-worktrees` – 创建隔离的开发环境（新分支 + worktree），确保主分支干净
2. `writing-plans` – 将功能拆解为 **2~5 分钟一个的小任务** ，每个任务包含：
   - 精确的文件路径
     - 完整的代码改动
     - 明确的验证步骤

你只需浏览计划，确认无误后说 **“开始执行”** 或 **“go”** 。

#### 步骤 4：自主执行 + 自动审查

AI 根据计划启动 **子代理驱动开发** ：

- 每个任务由一个独立的子代理负责
- 子代理遵循 `test-driven-development` ： **红 → 绿 → 重构**
- 每个任务完成后自动调用 `requesting-code-review` 进行两阶段审查：
  1.  是否符合计划（规范符合性）2. 代码质量（结构、命名、重复等）

若所有审查通过，继续下一任务；若发现关键问题，AI 会暂停并通知你介入。

**此阶段 AI 可连续工作数小时** ，期间仅在必要时向你提问。

#### 步骤 5：完成分支，合并或提交 PR

所有任务完成后，AI 调用 `finishing-a-development-branch` ：

- 运行完整测试套件
- 给出选项：
  - 合并到主分支
    - 创建 Pull Request
    - 保留分支继续修改
    - 丢弃所有更改

选择后，临时 worktree 自动清理，开发闭环完成。

---

### ⚙️ 如何调用技能（核心操作说明）

Superpowers 的设计理念是 **“技能自动触发，用户无需记忆命令”** 。但你仍可以通过以下方式确保 AI 正确调用所需技能。

#### 1\. 自动触发（推荐方式）

AI 在执行任何任务前，会自动判断当前场景是否需要某个技能。你只需要 **用自然语言描述你要做的事情** ：

| 你想做的事   | 触发技能                         | 示例话语                                     |
| ------------ | -------------------------------- | -------------------------------------------- |
| 构思新功能   | `brainstorming`                  | “我想给博客加一个标签云功能，帮我梳理一下。” |
| 调试一个 bug | `systematic-debugging`           | “登录接口有时返回 500，帮我系统性排查原因。” |
| 编写实现计划 | `writing-plans`                  | “设计已经确认，帮我拆解成可执行的计划。”     |
| 开始写代码   | `test-driven-development`        | “现在开始按 TDD 方式实现这个模块。”          |
| 审查代码变更 | `requesting-code-review`         | “我刚完成了任务，帮我做一次代码审查。”       |
| 完成分支     | `finishing-a-development-branch` | “这个功能做完了，帮我收尾这个分支。”         |

#### 2\. 手动强制调用（不常用但有效）

如果 AI 没有自动激活你想要的技能，可以明确指示：

> “请使用 `brainstorming` 技能来帮我梳理这个需求。”  
> “切换到 `systematic-debugging` 模式来排查这个问题。”

#### 3\. 验证技能是否被正确加载

- AI 开始提问澄清细节 → `brainstorming` 已激活
- AI 要求确认设计并拆解为小任务 → 已进入 `writing-plans`
- AI 在实现前先写测试并运行红-绿-重构循环 → `test-driven-development` 在工作

如果 AI 直接开始写代码而没有经过这些步骤，可以提醒它：“请按照 Superpowers 的工作流程来，先进行头脑风暴。”

#### 4\. 跨平台通用性

上述调用方式在 **Claude Code、Cursor、Codex、OpenCode、Gemini CLI** 中均有效，因为 Superpowers 是通过修改 AI 的系统指令和技能定义来实现的，与具体客户端的命令语法无关。

> **核心记忆点** ：你不需要学任何新命令，只需要像跟人类工程师协作一样，说出你的目标，AI 就会用 Superpowers 的技能帮你系统化完成。

---

### 🧩 完整技能库一览

| 类别           | 技能                             | 作用                                      |
| -------------- | -------------------------------- | ----------------------------------------- |
| **协作与规划** | `brainstorming`                  | 苏格拉底式提问，澄清需求，输出设计文档    |
|                | `using-git-worktrees`            | 创建隔离的开发环境（worktree）            |
|                | `writing-plans`                  | 将设计拆解为可执行的微任务（含代码+验证） |
|                | `subagent-driven-development`    | 派发子代理逐个执行任务，两阶段审查        |
|                | `executing-plans`                | 带人工检查点的批量执行（替代方案）        |
| **实现与质量** | `test-driven-development`        | 强制红-绿-重构，不允许先写代码再补测试    |
|                | `requesting-code-review`         | 任务间自动审查，严重问题阻塞进度          |
|                | `receiving-code-review`          | 指导 AI 如何响应反馈                      |
| **调试与收尾** | `systematic-debugging`           | 四阶段根因分析（含根源追溯、深度防御）    |
|                | `verification-before-completion` | 确保修复有效，防止“假修复”                |
|                | `finishing-a-development-branch` | 完成分支后的合并/PR/清理决策              |
| **元技能**     | `writing-skills`                 | 创建自定义技能的完整指南（含测试）        |
|                | `using-superpowers`              | 系统入门介绍                              |

---

### 🎯 适用场景与价值

#### 最适合：

- **复杂功能开发** – 需求模糊、需要多步拆解
- **大型重构** – 需要严格测试覆盖和分步验证
- **多人协作项目** – 通过 worktree 和审查保证主分支稳定
- **希望提升 AI 输出质量** – 让 AI 遵循专业工程实践，减少“垃圾代码”

#### 带来的改变：

| 从             | 到                                                 |
| -------------- | -------------------------------------------------- |
| AI 直接写代码  | AI 帮你整理需求 → 设计 → 计划 → 执行 → 审查 → 交付 |
| 手动反复修正   | AI 自主运行数小时，只在关键点交互                  |
| 不确定是否可靠 | 每次变更都有测试、审查、验证证据                   |

---

### 📚 补充信息

- **更新插件** ： `/plugin update superpowers`
- **贡献技能** ：Fork 仓库，遵循 `writing-skills` 指南提交 PR
- **社区支持** ：加入 Discord 频道（见仓库首页）
- **开源协议** ：MIT

---

### 💬 写在最后

Superpowers 并不会让你的 AI 变得“更聪明”，但它会让你的 AI 变得 **更规范、更可靠、更可预测** 。

如果你厌倦了 AI 动不动就“放飞代码”，希望它能像一名严谨的工程师一样工作——先问清楚需求，再设计方案，拆解任务，写测试，做审查，最后规范收尾——那么 Superpowers 值得一试。

> 安装一个插件，改变的是整个开发方式。

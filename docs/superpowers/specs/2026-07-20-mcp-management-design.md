# MCP 管理（应用内客户端 + 全对话 Tool Use）— 设计规格

> 日期：2026-07-20  
> 状态：已确认  
> 范围：`apps/skill-platform` 设置内 MCP 管理；主进程 McpHub；应用内 LLM 对话通过标准 function calling 调用 MCP Tools

---

## 1. 背景与问题

### 1.1 已有能力

- 设置 → **Agent管理**（`SkillSettings`）管理 Skill 安装路径、扫描路径、平台偏好等。
- Skill 安装器可将 MCP 配置**写出到**外部 `~/.cursor/mcp.json` / Claude Desktop，供 Cursor 等外部工具使用。
- 类型中已有 `IMcpServerConfig` / `ISkillMcpConfig`（偏外部分发，且当前仅覆盖 stdio 字段）。
- AI 对话（`@momo/aichat` + skill-platform stream）当前能力：prompt 注入、skill-run、CLI Agent；**无**应用内 MCP 运行时，**无**标准 function calling / tool use。

### 1.2 待解决问题

| 问题 | 说明 |
|------|------|
| 无应用内 MCP 管理 | 无法在本应用维护与 Cursor `mcp.json` 对齐的配置 |
| 无 MCP 运行时 | 无法连接 stdio / sse / http MCP Server |
| 对话无法调 MCP | 全局聊天、技能对话、工作流节点聊天不能像 Cursor 一样使用 MCP 工具 |

---

## 2. 已确认的产品决策

| 项 | 决策 |
|---|---|
| 交付范围 | **完整链路**：配置 UI + 应用内 MCP 客户端 + 所有应用内 LLM 对话可调用 |
| 协议与字段 | 对齐 Cursor：`stdio` + `sse`/`http`，含 `env`、`headers`、启停（`disabled`）等 |
| 调用方式 | **标准 function calling / tool use**（非 prompt 伪工具） |
| 对话范围 | **仅应用内 LLM**（全局 / 技能 / 工作流节点）；**不含** CLI Agent（`cli:claude` / `cli:codex`） |
| 配置存储 | `<userData>/mcp.json`；UI = **可视化表单 + 原始 JSON** |
| 工具执行 | **默认自动执行**（不做调用确认） |
| 入口位置 | Agent管理页内 Tab/分区：**技能配置 \| MCP** |
| 与外部 mcp.json | **解耦**：不读写、不同步 `~/.cursor/mcp.json`；外部分发逻辑保持独立 |
| MCP 能力范围 | 本期只做 **Tools**；不做 Resources / Prompts |

---

## 3. 架构

### 3.1 推荐方案：主进程 McpHub + 对话层 Tool Loop

```text
Renderer
  Settings → Agent管理 → [技能配置 | MCP]
  AI 对话 (全局 / 技能 / 工作流节点)
       │ tool loop
       ▼ IPC
Main: McpHub（单例）
  - 读写 userData/mcp.json
  - 连接 stdio / sse / http（@modelcontextprotocol/sdk）
  - listTools / callTool / 状态 / 启停 / 增量重载
```

### 3.2 明确不采用

- **每会话各自拉起 MCP**：进程反复启停、多会话重复连接，成本高。
- **经 Skill/skill-run 间接调 MCP**：不符合已选的标准 tool use，也难覆盖「所有对话」。

### 3.3 与现有系统边界

| 系统 | 关系 |
|------|------|
| Skill 外部分发写 `~/.cursor/mcp.json` | **不变**；与本应用 `userData/mcp.json` 无关 |
| skill-run / 代码块执行 | **并存**；MCP 走 function calling，互不替代 |
| CLI Agent | **不接入**本应用 McpHub |

---

## 4. 配置模型

### 4.1 文件路径与格式

- 路径：`<app userData>/mcp.json`
- 根结构与 Cursor 兼容：

```json
{
  "mcpServers": {
    "example-stdio": {
      "command": "npx",
      "args": ["-y", "some-mcp-server"],
      "env": {},
      "cwd": "",
      "disabled": false
    },
    "example-http": {
      "type": "http",
      "url": "https://example.com/mcp",
      "headers": {
        "Authorization": "Bearer xxx"
      },
      "disabled": false
    }
  }
}
```

### 4.2 字段约定

| 字段 | 说明 |
|------|------|
| `command` / `args` / `env` / `cwd` | stdio |
| `url` / `headers` | sse / http |
| `type` | 可选：`stdio` \| `sse` \| `http`；缺省时按有无 `command`/`url` 推断 |
| `disabled` | `true` 时不连接、不暴露 tools |

非法单项：保存时校验并提示；不阻断其他合法 Server。

### 4.3 类型命名（对齐项目规范）

- 配置 / 领域：`IMcpServersFile`、`IMcpServerEntry`、`IMcpServerRuntimeStatus` 等
- IPC 请求/响应：`D*` 前缀
- 连接状态等枚举：`E*` 前缀（如 `EMcpConnectionStatus`）

---

## 5. 设置 UI

### 5.1 入口

在现有 `SkillSettings` 顶部增加 Segmented/Tabs：

1. **技能配置** — 现有内容不变  
2. **MCP** — 新面板

### 5.2 MCP 面板能力

- Server 列表：名称、类型、运行时状态（已连接 / 错误 / 已禁用）、工具数量
- 操作：新增、编辑、删除、启用/禁用、重连、刷新 tools
- 编辑：表单（command/args/env/cwd/url/headers/type/disabled）
- **原始 JSON**：整文件编辑；保存后校验并触发 Hub 增量重载
- 错误摘要可展开（stderr / HTTP 错误）

---

## 6. McpHub 运行时（主进程）

### 6.1 生命周期

- 启动：读配置，连接所有未 `disabled` 的 Server
- 配置变更：增量重载（仅重建变更项）
- 退出：disconnect / kill stdio 子进程

### 6.2 连接与错误

- 依赖：`@modelcontextprotocol/sdk`
- 单 Server 失败：标记 error，保留摘要，不影响其他 Server
- 自动重试：有限次（1–2 次），不做无限重连
- 手动：支持 UI「重连」

### 6.3 Tools

- 聚合名：`{serverName}__{toolName}`，避免跨 Server 冲突
- `listTools`：返回已连接 Server 的 name / description / inputSchema
- `callTool`：默认自动执行；单次超时（建议 60s）；过大结果截断并注明

### 6.4 IPC（示意）

- `mcp:getConfig` / `mcp:setConfig`
- `mcp:setServerDisabled`
- `mcp:listServers`（含运行时状态）
- `mcp:listTools` / `mcp:callTool` / `mcp:reconnect`

模块位置建议：

- `main/services/mcp/` — Hub、config、连接
- `main/ipc/mcp.ts` — IPC 注册
- preload + types — 安全暴露

---

## 7. 对话 Tool Loop

### 7.1 接入范围

| 场景 | 是否接入 |
|------|----------|
| 全局聊天 `createGeneralChatStream` | 是 |
| 技能对话 stream | 是 |
| 工作流节点聊天 | 是 |
| CLI Agent | 否 |
| 文生图路径 / 标题生成等辅助 completion | 否 |

### 7.2 `chatCompletion` 扩展

- 请求支持 `tools` / `tool_choice`
- 响应解析 `tool_calls`（流式需聚合完整 tool_calls）
- 协议：优先保证 **OpenAI 兼容**路径；Anthropic / Gemini 按现有 protocol 逐步适配（见分期）

### 7.3 循环逻辑

```text
1. 从 McpHub 取当前可用 tools（无则不传 tools，行为与现网一致）
2. 带 tools 调用模型
3. 无 tool_calls → 正常结束输出
4. 有 tool_calls → IPC 执行（同轮可并行）→ 追加 tool 消息 → 回到 2
5. 轮次上限（建议 8）防止死循环；超限则提示并结束本轮
```

### 7.4 UI（最小可用）

- 展示「正在调用 xxx」与结果摘要
- 工具失败：错误作为 tool result 回传模型，由模型解释/换策略
- 不做审批卡片（与「默认自动执行」一致）

### 7.5 降级

- 无已启用 MCP / 全禁用：不传 tools
- 模型不支持 tools：降级为无 tools（可记日志或轻提示）

---

## 8. 错误处理

| 场景 | 行为 |
|------|------|
| 配置 JSON 非法 | 拒绝保存，提示错误位置/原因 |
| 单 Server 连接失败 | 该 Server error；其他正常 |
| callTool 超时/异常 | 返回错误 tool result，不挂死对话 |
| 表单与 JSON 先后保存 | 以最后一次成功保存为准，并刷新 UI |

---

## 9. 分期与验收

### 9.1 分期

| 阶段 | 内容 |
|------|------|
| P0 | `mcp.json` + McpHub（stdio 优先）+ IPC + Agent管理 MCP Tab（列表/表单/JSON/启停） |
| P1 | `chatCompletion` tools + 全局聊天 tool loop |
| P2 | 技能对话 + 工作流节点聊天接入；补齐 sse/http |
| P3（可选） | 更完整调用 UI、重试策略、Anthropic/Gemini tools 全覆盖 |

**完成线：P0–P2**；P3 不阻塞验收。

### 9.2 本期不做

- CLI Agent 注入本应用 MCP
- 工具调用用户确认 / 权限分级
- 与 `~/.cursor/mcp.json` 双向同步
- MCP Resources / Prompts

### 9.3 验收标准

1. Agent管理页可切换到 MCP，增删改 Server，表单与 JSON 一致写入 `userData/mcp.json`
2. `disabled` 的 Server 不连接、不出现在 tools 列表
3. 配置本地 stdio MCP 后，全局聊天能自动选工具并返回结果
4. 技能对话、工作流节点聊天同样能调 MCP
5. 无 MCP / 全禁用时，对话行为与现网一致
6. 单个 Server 挂掉不影响其他 Server 与普通对话

---

## 10. 测试要点

- 配置：合法/非法 JSON、缺字段推断 type、disabled 热更新
- Hub：stdio 启停、连接失败隔离、工具名去重、callTool 超时
- 对话：无 tools 回归、单轮 tool、多轮 tool、轮次上限、工具错误回传
- UI：Tab 切换不丢技能配置；列表状态与 Hub 一致

---

## 11. 开放实现细节（实现计划阶段敲定）

以下不影响产品决策，留给 implementation plan：

- IPC channel 常量命名与现有 `IPC_CHANNELS` 风格对齐方式
- tool 消息在 `@momo/aichat` 会话存储中的精确结构
- OpenAI 兼容流式 `tool_calls` 聚合实现细节
- sse vs http 在 SDK 中的具体 transport 选型版本

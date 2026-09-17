# 系统架构总览

`momo-ai` 是一个以 Electron 桌面应用为入口的 pnpm Monorepo；核心业务在主进程中运行，界面经受控 IPC 调用，并可接入独立的 Agent Harness 与知识库能力。

```mermaid
flowchart LR
  User[用户]

  subgraph Desktop["Electron 桌面应用 apps/skill-platform"]
    Renderer[Renderer React UI]
    Preload[Preload Bridge]
    Main["Main Process<br/>IPC 与业务服务"]
    KbService["knowledge-v2 服务"]
    Renderer --> Preload --> Main
    Main --> KbService
  end

  subgraph UiPackages["UI 与领域包"]
    AIChat["@momo/aichat"]
    Markdown["@momo/markdown"]
    Workflow["@momo/workflow"]
    FileEditor["@momo/file-editor"]
    Knowledge["@momo/knowledge"]
    Tree["@momo/tree"]
    Utils["@momo/utils"]
  end

  subgraph Runtime["Agent 问答运行时"]
    Contracts["@momo/agent-contracts"]
    RuntimeService["agent-runtime<br/>应用服务与工具代理"]
    ToolCatalog["工具箱目录<br/>tool.json + actions"]
    ToolBroker["ToolBroker<br/>点名匹配、权限与执行"]
    Adapter["@momo/harness-adapter"]
    Harness["@momo/harness-runner<br/>独立 Node 运行包"]
    Agent["DeepSeek Harness<br/>Agent 与模型调用"]
    Contracts --> RuntimeService --> Adapter --> Harness --> Agent
    ToolCatalog --> ToolBroker --> RuntimeService
    Agent -->|工具调用| ToolBroker
  end

  subgraph Storage["本地数据与外部能力"]
    SQLite[(SQLite)]
    Lance[(LanceDB)]
    Files[本地文件与产物]
    Models[模型与 Embedding 服务]
  end

  User --> Renderer
  Renderer --> AIChat
  Renderer --> Markdown
  Renderer --> Workflow
  Renderer --> FileEditor
  Renderer --> Knowledge
  Renderer --> Tree
  UiPackages --> Utils
  Main --> SQLite
  Main --> Files
  Main --> RuntimeService
  Knowledge --> Lance
  KbService --> SQLite
  KbService --> Lance
  KbService --> Models
  Agent --> Models
```

桌面应用是业务编排入口；各复用包提供界面与领域能力，运行时和知识库分别通过明确的契约、IPC 与本地存储边界协作。

## Agent 问答链路

```mermaid
sequenceDiagram
  participant UI as Renderer / @momo-aichat
  participant IPC as Preload + Electron IPC
  participant Service as ChatApplicationService
  participant Store as SQLite 运行记录
  participant Adapter as HarnessProcess
  participant Harness as Harness Runner
  participant Agent as Agent / LLM / 工具

  UI->>IPC: 发起 turn 与上下文
  IPC->>Service: 校验并创建运行
  Service->>Store: 保存运行与事件
  Service->>Adapter: 启动或复用 Harness
  Adapter->>Harness: NDJSON 请求与取消信号
  Harness->>Agent: 执行问答、工具与追问
  Agent-->>Harness: 流式事件
  Harness-->>Adapter: 标准化事件
  Adapter-->>Service: RunEvent
  Service->>Store: 持久化事件
  Service-->>IPC: 转发事件
  IPC-->>UI: 流式渲染与交互
```

问答 UI 不直接依赖 Harness 实现；它通过共享契约和 IPC 调用主进程服务，后者负责运行、持久化、工具及生命周期管理。

提示词、规则或已展开 Skill/Command 点名工具箱名称、别名、稳定 ID 或 action 名称时，主进程只把匹配 action 临时加入本轮工具目录；项目策略可长期开放额外 action。所有调用仍经 ToolBroker 完成输入/输出校验、权限审批、执行快照与审计。

### 统一 AI 问答入口

```mermaid
flowchart LR
  subgraph Surfaces[Renderer AI 入口]
    MainChat[主 AI 对话]
    PromptChat[提示词测试对话]
    PromptCompare[提示词多模型对比]
    WorkflowChat[工作流节点对话]
    NoteComposer[笔记 AI 改写]
    ToolComposer[自定义工具生成]
  end

  MainChat --> ChatState["@momo/aichat<br/>会话、模型与上下文状态"]
  PromptChat --> ChatState
  PromptCompare --> StreamAdapter
  WorkflowChat --> ChatState
  NoteComposer --> ScopedSession[单轮独立会话<br/>一次用户任务一个 sessionId]
  ToolComposer --> ScopedSession
  ScopedSession --> StreamAdapter[Harness Stream Adapter]
  ChatState --> RuntimePort[ChatRuntimePort]
  StreamAdapter --> RuntimePort
  RuntimePort --> IPC[Preload / IPC]
  IPC --> Service[ChatApplicationService]
  Service --> Store[(SQLite 会话、运行与事件)]
  Service --> Process[HarnessProcess]
  Process --> Runner[Harness Runner]
  Runner --> Agent[Agent / LLM / 工具]
```

所有用户可见的 AI 问答入口统一进入 Harness。完整对话直接使用 `ChatRuntimePort`；笔记改写和工具生成等单轮编辑器为每次用户任务分配独立 `sessionId`，任务内自动修复复用该会话，下一次发送重新建会话，再通过 Harness Stream Adapter 转为同一运行协议。输入栏中的会话命令不会回落到主对话；日志导出使用当前任务的 `sessionId`，因此上下文、运行日志与其他对话隔离。Renderer 不再保留直连模型、LangGraph 二次问答或隐式回退问答链路。

### 生成中离开保护

```mermaid
flowchart LR
  ChatProvider[ChatProvider 多轮会话] -->|onGenerationStateChange| Activity[Renderer 生成活动注册表]
  PromptCompare[提示词对比 / 生图] --> Activity
  NoteComposer[笔记 AI 改写] --> Activity
  ToolComposer[自定义工具生成] --> Activity
  WorkflowChat[工作流节点对话] --> Activity
  Navigation[模块、会话、节点或弹窗离开动作] --> Guard[统一离开确认]
  Activity --> Guard
  Guard -->|继续对话| Stay[保留当前界面]
  Guard -->|确认离开| Leave[执行原导航或关闭动作]
```

`@momo/aichat` 只通过可选回调报告 Provider 内任一会话的生成状态，不依赖宿主导航。Renderer 按业务模块登记多轮与单轮 AI 活动；导航守卫只查询当前可见模块，避免后台仍在完成的任务反复阻塞后续操作。会话列表和工作流步骤切换会进一步使用当前会话或当前节点的状态做精确确认。

### 会话模型切换

```mermaid
sequenceDiagram
  participant UI as AI 对话模型选择器
  participant State as 会话级 modelId
  participant Service as ChatApplicationService
  participant Store as agent_sessions
  participant Harness as Harness 原生会话

  UI->>State: 新对话或历史对话选择模型
  State->>State: 随逻辑会话持久化
  State->>Service: 下一轮携带 modelProfileId
  alt 模型未变化
    Service->>Harness: 续接原生会话
  else 模型已变化
    Service->>Store: 更新 model_id 与 native_id
    Service->>Harness: 新建原生会话并注入可见历史
  end
```

模型切换不会混用不同供应商的原生日志：逻辑会话和可见历史保持不变，底层 Harness 原生会话按模型重新建立。

## 知识库链路

```mermaid
flowchart LR
  Source[文件、目录或文本] --> Manager[知识库管理 UI]
  Manager --> IPC[Electron IPC]
  IPC --> KbService[主进程知识库服务]
  KbService --> Worker[Knowledge Worker<br/>解析与结构化切分]
  Worker --> Index[索引构建]
  Index --> SQLite[(SQLite 元数据)]
  Index --> Lance[(LanceDB 向量索引)]
  Chat[问答输入栏选择单个知识库] --> Runtime[ChatApplicationService]
  Runtime --> Retrieve[检索服务]
  Retrieve --> SQLite
  Retrieve --> Lance
  Retrieve -->|索引就绪| Evidence[证据与引用]
  Retrieve -->|空库或首次索引未完成| NoMatch[no_match 空证据]
  Evidence --> Runtime
  NoMatch --> Runtime
  Runtime --> Chat
```

知识库以本地元数据和向量索引保存可检索内容。解析、预览和结构化切分统一由 Knowledge Worker 的正式 V2 实现完成，Renderer 中的 `@momo/knowledge` 只保留组件和 UI 类型，不再维护第二套 LangChain 切分链路。用户在对话输入栏选择单个知识库后，主进程在模型调用前检索该集合，并将证据与引用注入问答运行时。`retrieveForChat` 将空库或首次索引未完成归一为 `no_match`，问答继续但必须明确说明没有足够知识证据；知识库管理检索和其他检索故障仍返回结构化错误。

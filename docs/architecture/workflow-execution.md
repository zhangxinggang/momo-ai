# 工作流执行架构

工作流编辑器以串行宏观步骤组织提示词、技能、网页和并行组。保存时统一校验图结构；网页节点只能位于首个宏观步骤，避免自动执行链路在中途进入必须人工操作的网页节点。

```mermaid
flowchart LR
  Studio[工作流编辑器] --> Validate[图结构与网页位置校验]
  Validate --> Graph[(工作流 graphJson)]
  Graph --> WorkPage[工作流查看页]

  subgraph NodeExecution[节点隔离执行]
    WorkPage --> NodeSession[节点独立 ChatProvider / Session]
    PreviousResult[上一节点运行结果] --> NodeContext[节点系统上下文]
    PreviousFiles[上一节点或并行上游文件] --> NodeContext
    Workspace[用户选择的工作区] --> RuntimeContext[Harness 项目上下文]
    Knowledge[用户选择的单个知识库] --> Retrieval[知识库检索]
    Retrieval --> Evidence[证据与引用]
    NodeContext --> Runtime[ChatRuntimePort]
    RuntimeContext --> Runtime
    Evidence --> Runtime
    NodeSession --> Runtime
  end

  Runtime --> Reply[节点回复]
  Reply --> Result[(节点 main.md / 运行结果)]
  Reply --> Artifacts[节点文件产物]
  Result --> Auto{自动执行?}
  Artifacts --> Auto
  Auto -->|是| Next[定位下一叶子节点]
  Next --> NodeSession
  Auto -->|否或末节点| Manual[保留当前节点]
```

每个非网页节点使用独立的存储前缀和会话，互不继承聊天历史；跨节点只传递明确的上游运行结果、文件上下文，以及用户为当前节点选择的工作区和知识库。自动执行开启后，完成回复会覆盖当前节点运行结果，再按串行及并行子节点顺序创建下一节点的新一轮问答。网页节点始终要求人工填写运行结果，且其自动执行开关不可用。

## 对话知识库选择

```mermaid
sequenceDiagram
  participant User as 用户
  participant Chat as AI 对话输入栏
  participant Runtime as ChatApplicationService
  participant KB as knowledge-v2
  participant Model as Harness / 模型

  User->>Chat: 选择一个知识库并发送问题
  Chat->>Runtime: kbEnabled + kbCollectionId + 问题
  Runtime->>KB: 在所选集合检索
  KB-->>Runtime: 证据上下文与引用
  Runtime->>Model: 系统上下文 + 检索证据 + 用户问题
  Model-->>Chat: 流式回复与引用
```

知识库选择是单选状态；关闭输入栏中的知识库标签会同时关闭本轮后续检索。

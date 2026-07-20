# MCP 管理（应用内客户端 + 对话 Tool Use）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Agent管理页提供与 Cursor 对齐的 MCP 配置（userData/mcp.json），主进程 McpHub 连接 stdio/sse/http，应用内 LLM 对话通过标准 function calling 自动调用 MCP Tools。

**Architecture:** 主进程单例 `McpHub` 读写 `<userData>/mcp.json` 并维护 MCP 连接；渲染进程在 `chatCompletion` 上扩展 tools/tool_calls，经共享 `runMcpToolLoop` 接入全局/技能/工作流聊天。CLI Agent 与 `~/.cursor/mcp.json` 外部分发不在范围。

**Tech Stack:** Electron、TypeScript、React、Ant Design、`@modelcontextprotocol/sdk`、现有 OpenAI 兼容 `chatCompletion`、vitest（纯函数单测）

**Spec:** `docs/superpowers/specs/2026-07-20-mcp-management-design.md`

## Global Constraints

- 配置路径固定为 `path.join(getUserDataPath(), 'mcp.json')`，根字段 `mcpServers`
- 工具聚合名：`{serverName}__{toolName}`；默认自动执行；单次 callTool 超时 60s；tool loop 上限 8 轮
- 类型前缀：配置/领域 `I*`，IPC 载荷 `D*`，状态枚举 `E*`；React Props 固定 `IProps`
- 本期不做：CLI Agent 注入、调用确认、与 `~/.cursor/mcp.json` 同步、MCP Resources/Prompts
- 协议优先 OpenAI 兼容；Anthropic/Gemini tools 列为 P3，不阻塞 P0–P2 验收
- 注释使用中文；不主动写无关 markdown

---

## 文件变更一览

| 操作 | 文件 | 职责 |
|------|------|------|
| Create | `apps/skill-platform/src/types/modules/mcp.ts` | MCP 配置/运行时/IPC 类型与枚举 |
| Modify | `apps/skill-platform/src/types/modules/index.ts` | 导出 mcp 类型 |
| Create | `apps/skill-platform/src/main/services/mcp/config.ts` | 读写校验 mcp.json（纯逻辑可测） |
| Create | `apps/skill-platform/src/main/services/mcp/config.test.ts` | 配置单测 |
| Create | `apps/skill-platform/src/main/services/mcp/tool-name.ts` | 工具名编解码 |
| Create | `apps/skill-platform/src/main/services/mcp/hub.ts` | McpHub 单例 |
| Create | `apps/skill-platform/src/main/services/mcp/index.ts` | 导出 |
| Create | `apps/skill-platform/src/main/ipc/mcp.ts` | IPC handlers |
| Modify | `apps/skill-platform/src/types/constants/ipc-channels.ts` | MCP 通道常量 |
| Modify | `apps/skill-platform/src/main/ipc/index.ts` | 注册 MCP IPC + 启动 Hub |
| Create | `apps/skill-platform/src/preload/api/mcp.ts` | preload API |
| Modify | `apps/skill-platform/src/preload/api/index.ts` | 导出 mcpApi |
| Modify | `apps/skill-platform/src/preload/index.ts` | 挂载 mcp |
| Create | `apps/skill-platform/src/renderer/services/mcp/api.ts` | 渲染进程封装 |
| Create | `apps/skill-platform/src/renderer/components/Settings/sections/SkillSettings/McpSettingsPanel/index.tsx` | MCP 设置 UI |
| Create | `apps/skill-platform/src/renderer/components/Settings/sections/SkillSettings/McpSettingsPanel/index.module.less` | 样式 |
| Modify | `apps/skill-platform/src/renderer/components/Settings/sections/SkillSettings/index.tsx` | Tab：技能配置 \| MCP |
| Modify | `apps/skill-platform/src/renderer/types/ai.ts` | tools / tool_calls 消息类型 |
| Modify | `apps/skill-platform/src/renderer/services/ai/chat.ts` | 请求与解析 tool_calls |
| Create | `apps/skill-platform/src/renderer/services/aichat/mcp/tool-loop.ts` | 共享 tool loop |
| Create | `apps/skill-platform/src/renderer/services/aichat/mcp/tool-loop.test.ts` | loop 纯逻辑单测 |
| Modify | `apps/skill-platform/src/renderer/services/aichat/streams/chat-completion-stream.ts` | 可选接入 loop |
| Modify | `apps/skill-platform/src/renderer/services/aichat/streams/general-chat-stream.ts` | 启用 MCP |
| Modify | `apps/skill-platform/src/renderer/services/aichat/skill/stream.ts` | 启用 MCP |
| Modify | `apps/skill-platform/src/renderer/components/Workflow/WorkflowNodeChat/index.tsx` | 经 stream 启用 MCP |
| Modify | `apps/skill-platform/package.json` | 依赖 sdk + vitest |
| Create | `apps/skill-platform/vitest.config.ts` | 纯函数单测配置 |

---

### Task 1: 类型、枚举与 IPC 通道

**Files:**
- Create: `apps/skill-platform/src/types/modules/mcp.ts`
- Modify: `apps/skill-platform/src/types/modules/index.ts`
- Modify: `apps/skill-platform/src/types/constants/ipc-channels.ts`

**Interfaces:**
- Produces: `EMcpTransportType`、`EMcpConnectionStatus`、`IMcpServerEntry`、`IMcpServersFile`、`IMcpServerRuntimeStatus`、`DMcpTool`、`DMcpCallToolRequest`、`DMcpCallToolResult`、`IPC_CHANNELS.MCP_*`

- [ ] **Step 1: 创建 `mcp.ts`**

```typescript
/** MCP 传输类型 */
export enum EMcpTransportType {
  EStdio = 'stdio',
  ESse = 'sse',
  EHttp = 'http',
}

/** MCP 连接状态 */
export enum EMcpConnectionStatus {
  EIdle = 'idle',
  EConnecting = 'connecting',
  EConnected = 'connected',
  EError = 'error',
  EDisabled = 'disabled',
}

/** 单个 MCP Server 配置（对齐 Cursor mcp.json 条目） */
export interface IMcpServerEntry {
  type?: EMcpTransportType | `${EMcpTransportType}`;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  url?: string;
  headers?: Record<string, string>;
  disabled?: boolean;
}

/** mcp.json 根结构 */
export interface IMcpServersFile {
  mcpServers: Record<string, IMcpServerEntry>;
}

/** 运行时列表项 */
export interface IMcpServerRuntimeStatus {
  name: string;
  entry: IMcpServerEntry;
  transport: EMcpTransportType;
  status: EMcpConnectionStatus;
  errorMessage?: string;
  toolCount: number;
}

/** 暴露给模型的工具描述 */
export interface DMcpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  serverName: string;
  toolName: string;
}

export interface DMcpCallToolRequest {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface DMcpCallToolResult {
  ok: boolean;
  content: string;
  isError?: boolean;
}
```

- [ ] **Step 2: 在 `types/modules/index.ts` 导出 `./mcp`**

- [ ] **Step 3: 在 `ipc-channels.ts` 增加通道（放在 Settings 段附近）**

```typescript
  // MCP（应用内）
  MCP_GET_CONFIG: 'mcp:getConfig',
  MCP_SET_CONFIG: 'mcp:setConfig',
  MCP_SET_SERVER_DISABLED: 'mcp:setServerDisabled',
  MCP_LIST_SERVERS: 'mcp:listServers',
  MCP_LIST_TOOLS: 'mcp:listTools',
  MCP_CALL_TOOL: 'mcp:callTool',
  MCP_RECONNECT: 'mcp:reconnect',
```

- [ ] **Step 4: Commit**

```bash
git add apps/skill-platform/src/types/modules/mcp.ts apps/skill-platform/src/types/modules/index.ts apps/skill-platform/src/types/constants/ipc-channels.ts
git commit -m "<feat> [MCP]: 添加 MCP 类型与 IPC 通道常量"
```

---

### Task 2: mcp.json 读写与校验（TDD）

**Files:**
- Create: `apps/skill-platform/src/main/services/mcp/config.ts`
- Create: `apps/skill-platform/src/main/services/mcp/config.test.ts`
- Create: `apps/skill-platform/src/main/services/mcp/tool-name.ts`
- Create: `apps/skill-platform/vitest.config.ts`
- Modify: `apps/skill-platform/package.json`

**Interfaces:**
- Produces: `inferMcpTransport(entry)`、`validateMcpServersFile(raw)`、`parseMcpServersFileJson(text)`、`encodeMcpToolName` / `decodeMcpToolName`、`getMcpConfigPath()`、`readMcpServersFile()`、`writeMcpServersFile(file)`

- [ ] **Step 1: 添加 vitest**

`vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
});
```

`package.json` scripts 增加：`"test": "vitest run"`，devDependencies 增加 `vitest`。

Run: `pnpm add -D vitest --filter AIM`

- [ ] **Step 2: 写失败测试 `config.test.ts`**

```typescript
import { describe, expect, it } from 'vitest';
import {
  inferMcpTransport,
  parseMcpServersFileJson,
  validateMcpServersFile,
} from './config';
import { encodeMcpToolName, decodeMcpToolName } from './tool-name';
import { EMcpTransportType } from '@/types/modules/mcp';

describe('inferMcpTransport', () => {
  it('有 command 推断为 stdio', () => {
    expect(inferMcpTransport({ command: 'npx' })).toBe(EMcpTransportType.EStdio);
  });
  it('有 url 且 type=sse 为 sse', () => {
    expect(inferMcpTransport({ type: 'sse', url: 'http://x' })).toBe(EMcpTransportType.ESse);
  });
  it('有 url 默认 http', () => {
    expect(inferMcpTransport({ url: 'http://x' })).toBe(EMcpTransportType.EHttp);
  });
});

describe('parseMcpServersFileJson', () => {
  it('合法 JSON 通过', () => {
    const file = parseMcpServersFileJson(
      JSON.stringify({ mcpServers: { a: { command: 'npx', args: ['-y', 'x'] } } }),
    );
    expect(file.mcpServers.a.command).toBe('npx');
  });
  it('非法 JSON 抛错', () => {
    expect(() => parseMcpServersFileJson('{')).toThrow();
  });
  it('缺少 mcpServers 抛错', () => {
    expect(() => parseMcpServersFileJson('{}')).toThrow(/mcpServers/);
  });
});

describe('validateMcpServersFile', () => {
  it('stdio 缺少 command 记入 invalid，不阻断其他项', () => {
    const result = validateMcpServersFile({
      mcpServers: {
        bad: { args: [] },
        good: { command: 'node', args: ['a.js'] },
      },
    });
    expect(result.valid.mcpServers.good).toBeDefined();
    expect(result.errors.some((e) => e.name === 'bad')).toBe(true);
  });
});

describe('tool-name', () => {
  it('编解码往返', () => {
    const encoded = encodeMcpToolName('fs', 'read_file');
    expect(encoded).toBe('fs__read_file');
    expect(decodeMcpToolName(encoded)).toEqual({ serverName: 'fs', toolName: 'read_file' });
  });
});
```

- [ ] **Step 3: Run 确认失败**

Run: `pnpm --filter AIM test -- src/main/services/mcp/config.test.ts`  
Expected: FAIL（模块不存在）

- [ ] **Step 4: 实现 `tool-name.ts`**

```typescript
const SEPARATOR = '__';

export function encodeMcpToolName(serverName: string, toolName: string): string {
  return `${serverName}${SEPARATOR}${toolName}`;
}

export function decodeMcpToolName(encoded: string): { serverName: string; toolName: string } {
  const index = encoded.indexOf(SEPARATOR);
  if (index <= 0) {
    throw new Error(`无效的 MCP 工具名: ${encoded}`);
  }
  return {
    serverName: encoded.slice(0, index),
    toolName: encoded.slice(index + SEPARATOR.length),
  };
}
```

- [ ] **Step 5: 实现 `config.ts`（核心逻辑）**

```typescript
import fs from 'fs';
import path from 'path';
import {
  EMcpTransportType,
  type IMcpServerEntry,
  type IMcpServersFile,
} from '@/types/modules/mcp';
import { getUserDataPath } from '../../runtime-paths';

export function getMcpConfigPath(): string {
  return path.join(getUserDataPath(), 'mcp.json');
}

export function inferMcpTransport(entry: IMcpServerEntry): EMcpTransportType {
  if (entry.type === EMcpTransportType.EStdio || entry.type === 'stdio') {
    return EMcpTransportType.EStdio;
  }
  if (entry.type === EMcpTransportType.ESse || entry.type === 'sse') {
    return EMcpTransportType.ESse;
  }
  if (entry.type === EMcpTransportType.EHttp || entry.type === 'http') {
    return EMcpTransportType.EHttp;
  }
  if (entry.command) return EMcpTransportType.EStdio;
  if (entry.url) return EMcpTransportType.EHttp;
  throw new Error('无法推断 MCP 传输类型：需要 command 或 url');
}

export function validateMcpServersFile(file: IMcpServersFile): {
  valid: IMcpServersFile;
  errors: Array<{ name: string; message: string }>;
} {
  const valid: IMcpServersFile = { mcpServers: {} };
  const errors: Array<{ name: string; message: string }> = [];
  for (const [name, entry] of Object.entries(file.mcpServers ?? {})) {
    try {
      const transport = inferMcpTransport(entry);
      if (transport === EMcpTransportType.EStdio && !entry.command?.trim()) {
        throw new Error('stdio 类型需要 command');
      }
      if (
        (transport === EMcpTransportType.ESse || transport === EMcpTransportType.EHttp) &&
        !entry.url?.trim()
      ) {
        throw new Error(`${transport} 类型需要 url`);
      }
      valid.mcpServers[name] = entry;
    } catch (err) {
      errors.push({
        name,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return { valid, errors };
}

export function parseMcpServersFileJson(text: string): IMcpServersFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('MCP 配置不是合法 JSON');
  }
  if (!parsed || typeof parsed !== 'object' || !('mcpServers' in parsed)) {
    throw new Error('MCP 配置缺少 mcpServers 字段');
  }
  const file = parsed as IMcpServersFile;
  if (!file.mcpServers || typeof file.mcpServers !== 'object') {
    throw new Error('mcpServers 必须是对象');
  }
  return file;
}

export function readMcpServersFile(): IMcpServersFile {
  const configPath = getMcpConfigPath();
  if (!fs.existsSync(configPath)) {
    return { mcpServers: {} };
  }
  const text = fs.readFileSync(configPath, 'utf8');
  if (!text.trim()) return { mcpServers: {} };
  return parseMcpServersFileJson(text);
}

export function writeMcpServersFile(file: IMcpServersFile): void {
  const configPath = getMcpConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, `${JSON.stringify(file, null, 2)}\n`, 'utf8');
}
```

注意：`config.test.ts` 中不要 import 会执行 `app.getPath` 的读写函数；单测只覆盖纯函数。若 vitest 因 `@/` 别名失败，在 `vitest.config.ts` 用 `vite-tsconfig-paths` 或相对 import。优先让测试用相对路径 import，避免别名问题：把测试里的 `@/types/modules/mcp` 改为相对路径 `../../../../types/modules/mcp`。

- [ ] **Step 6: Run 确认通过**

Run: `pnpm --filter AIM test -- src/main/services/mcp/`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/skill-platform/src/main/services/mcp apps/skill-platform/vitest.config.ts apps/skill-platform/package.json
git commit -m "<feat> [MCP]: 实现 mcp.json 校验与工具名编解码"
```

---

### Task 3: McpHub + IPC + Preload

**Files:**
- Create: `apps/skill-platform/src/main/services/mcp/hub.ts`
- Create: `apps/skill-platform/src/main/services/mcp/index.ts`
- Create: `apps/skill-platform/src/main/ipc/mcp.ts`
- Modify: `apps/skill-platform/src/main/ipc/index.ts`
- Create: `apps/skill-platform/src/preload/api/mcp.ts`
- Modify: `apps/skill-platform/src/preload/api/index.ts`
- Modify: `apps/skill-platform/src/preload/index.ts`
- Create: `apps/skill-platform/src/renderer/services/mcp/api.ts`
- Modify: `apps/skill-platform/package.json`（依赖 `@modelcontextprotocol/sdk`）

**Interfaces:**
- Consumes: Task 1–2 类型与 config/tool-name
- Produces: `getMcpHub()`、`registerMcpIPC()`、`window.api.mcp.*`、renderer `mcpApi`

- [ ] **Step 1: 安装 SDK**

Run: `pnpm add @modelcontextprotocol/sdk --filter AIM`

- [ ] **Step 2: 实现 `hub.ts` 骨架**

要求实现类 `McpHub`：

```typescript
class McpHub {
  async start(): Promise<void>; // 读配置并连接未 disabled 的 server
  async stop(): Promise<void>;
  getConfig(): IMcpServersFile;
  async setConfig(file: IMcpServersFile): Promise<{ errors: Array<{ name: string; message: string }> }>;
  async setServerDisabled(name: string, disabled: boolean): Promise<void>;
  listServers(): IMcpServerRuntimeStatus[];
  listTools(): DMcpTool[];
  async callTool(request: DMcpCallToolRequest): Promise<DMcpCallToolResult>; // 超时 60s
  async reconnect(name?: string): Promise<void>; // name 空则全量
}
export function getMcpHub(): McpHub;
```

实现要点：

1. 内部 `Map<string, { client; transport; status; error?; tools }>`
2. stdio：SDK `StdioClientTransport` + `Client`
3. sse/http：使用 SDK 对应 transport（按安装版本的导出；若 `SSEClientTransport` / `StreamableHTTPClientTransport` 命名有差异，以包内导出为准）
4. `setConfig`：`validateMcpServersFile` → 写盘 → 对变更 name 做 disconnect/connect（增量）
5. `disabled`：断开并状态 `EDisabled`，不进 `listTools`
6. `callTool`：`decodeMcpToolName` → `client.callTool`；结果转字符串；超长（如 >100_000 字符）截断并追加说明；`Promise.race` 做 60s 超时
7. 连接失败：该 server `EError`，`errorMessage` 保留，不影响其他
8. 自动重试：连接失败再试 1 次

- [ ] **Step 3: 实现 `main/ipc/mcp.ts`**

```typescript
import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { DMcpCallToolRequest, IMcpServersFile } from '@/types/modules/mcp';
import { ipcMain } from 'electron';
import { getMcpHub } from '../services/mcp';

export function registerMcpIPC(): void {
  const hub = getMcpHub();
  ipcMain.handle(IPC_CHANNELS.MCP_GET_CONFIG, async () => hub.getConfig());
  ipcMain.handle(IPC_CHANNELS.MCP_SET_CONFIG, async (_e, file: IMcpServersFile) =>
    hub.setConfig(file),
  );
  ipcMain.handle(
    IPC_CHANNELS.MCP_SET_SERVER_DISABLED,
    async (_e, name: string, disabled: boolean) => hub.setServerDisabled(name, disabled),
  );
  ipcMain.handle(IPC_CHANNELS.MCP_LIST_SERVERS, async () => hub.listServers());
  ipcMain.handle(IPC_CHANNELS.MCP_LIST_TOOLS, async () => hub.listTools());
  ipcMain.handle(IPC_CHANNELS.MCP_CALL_TOOL, async (_e, req: DMcpCallToolRequest) =>
    hub.callTool(req),
  );
  ipcMain.handle(IPC_CHANNELS.MCP_RECONNECT, async (_e, name?: string) => hub.reconnect(name));
}

export async function startMcpHub(): Promise<void> {
  await getMcpHub().start();
}
```

- [ ] **Step 4: 在 `ipc/index.ts` 注册**

在 `registerBootstrapIPC` 末尾调用 `registerMcpIPC()`（不依赖 DB）。  
在 `startup.ts`（或现有 app ready 流程）于窗口创建前 `await startMcpHub()`；若现有 startup 不便改同步 await，可在 `registerMcpIPC` 内 `void startMcpHub()` 并 catch 打日志。优先：找到 `apps/skill-platform/src/main/bootstrap/startup.ts`，在 IPC 注册后启动 Hub。

- [ ] **Step 5: preload + renderer api**

`preload/api/mcp.ts`：

```typescript
import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  DMcpCallToolRequest,
  IMcpServersFile,
} from '@/types/modules/mcp';
import { ipcRenderer } from 'electron';

export const mcpApi = {
  getConfig: () => ipcRenderer.invoke(IPC_CHANNELS.MCP_GET_CONFIG),
  setConfig: (file: IMcpServersFile) => ipcRenderer.invoke(IPC_CHANNELS.MCP_SET_CONFIG, file),
  setServerDisabled: (name: string, disabled: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.MCP_SET_SERVER_DISABLED, name, disabled),
  listServers: () => ipcRenderer.invoke(IPC_CHANNELS.MCP_LIST_SERVERS),
  listTools: () => ipcRenderer.invoke(IPC_CHANNELS.MCP_LIST_TOOLS),
  callTool: (req: DMcpCallToolRequest) => ipcRenderer.invoke(IPC_CHANNELS.MCP_CALL_TOOL, req),
  reconnect: (name?: string) => ipcRenderer.invoke(IPC_CHANNELS.MCP_RECONNECT, name),
};
```

在 `preload/api/index.ts` 导出；在 `preload/index.ts` 的 `createPreloadApi({ ..., mcp: mcpApi })` 挂载。

`renderer/services/mcp/api.ts`：通过 `window.api.mcp` 薄封装同名方法（与 `skill/api` 风格一致）。

- [ ] **Step 6: 手动冒烟**

Run: `pnpm --filter AIM electron:dev`  
在 DevTools / 临时调用：`await window.api.mcp.getConfig()` 应返回 `{ mcpServers: {} }`；`setConfig` 后检查 userData 下出现 `mcp.json`。

- [ ] **Step 7: Commit**

```bash
git add apps/skill-platform/src/main/services/mcp apps/skill-platform/src/main/ipc apps/skill-platform/src/preload apps/skill-platform/src/renderer/services/mcp apps/skill-platform/package.json pnpm-lock.yaml
git commit -m "<feat> [MCP]: 实现 McpHub、IPC 与 preload API"
```

---

### Task 4: Agent管理页 MCP Tab UI

**Files:**
- Create: `apps/skill-platform/src/renderer/components/Settings/sections/SkillSettings/McpSettingsPanel/index.tsx`
- Create: `apps/skill-platform/src/renderer/components/Settings/sections/SkillSettings/McpSettingsPanel/index.module.less`
- Modify: `apps/skill-platform/src/renderer/components/Settings/sections/SkillSettings/index.tsx`

**Interfaces:**
- Consumes: `renderer/services/mcp/api.ts`
- Produces: 可管理 mcp.json 的 UI

- [ ] **Step 1: 改造 `SkillSettings` 顶部 Tab**

在组件顶部增加：

```tsx
const [activeTab, setActiveTab] = useState<'skill' | 'mcp'>('skill');

// 渲染
<Segmented
  value={activeTab}
  onChange={(v) => setActiveTab(v as 'skill' | 'mcp')}
  options={[
    { label: '技能配置', value: 'skill' },
    { label: 'MCP', value: 'mcp' },
  ]}
/>
{activeTab === 'skill' ? (/* 现有内容 */) : <McpSettingsPanel />}
```

保持现有技能配置 JSX 原样包在 `activeTab === 'skill'` 分支。

- [ ] **Step 2: 实现 `McpSettingsPanel`**

功能清单（必须全部有）：

1. 加载：`listServers` + `getConfig`（JSON 编辑器用）
2. 表格/列表：name、transport、status、toolCount、errorMessage 展开
3. 新增/编辑 Modal：表单字段 name、type、command、args（逗号或 JSON 数组）、env（JSON 对象）、cwd、url、headers（JSON）、disabled
4. 删除：从 config 去掉后 `setConfig`
5. 启用/禁用 Switch → `setServerDisabled`
6. 重连按钮 → `reconnect(name)`；刷新 tools → 重新 `listServers`
7. 原始 JSON：`Input.TextArea` 展示整文件；保存时 `parse` 校验 → `setConfig`；失败 Toast 错误
8. 表单保存与 JSON 保存都刷新列表

UI 使用现有 AntD + `SettingSection`/`useToast` 风格；样式用 `index.module.less`。

- [ ] **Step 3: 手动验收 UI**

Run: `pnpm --filter AIM electron:dev` → 设置 → Agent管理 → MCP  
添加一个假 stdio（如 `command: "node"`, `args: ["-e","process.exit(1)"]`）应显示 error 而不崩；禁用后 status 为 disabled；JSON 面板往返一致。

- [ ] **Step 4: Commit**

```bash
git add apps/skill-platform/src/renderer/components/Settings/sections/SkillSettings
git commit -m "<feat> [MCP]: Agent管理页增加 MCP 配置 Tab"
```

---

### Task 5: chatCompletion 支持 OpenAI tools / tool_calls

**Files:**
- Modify: `apps/skill-platform/src/renderer/types/ai.ts`
- Modify: `apps/skill-platform/src/renderer/services/ai/chat.ts`（及必要时 `internal/stream.ts`）
- Create: `apps/skill-platform/src/renderer/services/ai/tools/openai-tools.ts`（组装与解析辅助，便于测）

**Interfaces:**
- Produces: 扩展后的 `IChatMessage`、`chatCompletion(..., { tools, toolChoice })` 返回 `toolCalls`

- [ ] **Step 1: 扩展消息类型**

```typescript
export interface IChatToolCallFunction {
  name: string;
  arguments: string;
}

export interface IChatToolCall {
  id: string;
  type: 'function';
  function: IChatToolCallFunction;
}

export interface IChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: TChatMessageContent;
  tool_calls?: IChatToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface DChatCompletionTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}
```

在 `DChatCompletionRequest` 增加可选 `tools?: DChatCompletionTool[]`、`tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } }`。

在 `IChatCompletionResult`（定义处）增加可选 `toolCalls?: IChatToolCall[]`。

- [ ] **Step 2: 实现 `openai-tools.ts`**

```typescript
import type { DMcpTool } from '@/types/modules/mcp';
import type { DChatCompletionTool, IChatToolCall } from '@renderer/types/ai';

export function mcpToolsToOpenAITools(tools: DMcpTool[]): DChatCompletionTool[] {
  return tools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema ?? { type: 'object', properties: {} },
    },
  }));
}

/** 合并流式 delta.tool_calls 分片 */
export function aggregateToolCallDeltas(
  existing: IChatToolCall[],
  deltas: Array<Partial<IChatToolCall> & { index?: number }>,
): IChatToolCall[] {
  const next = [...existing];
  for (const delta of deltas) {
    const index = delta.index ?? 0;
    const current = next[index] ?? {
      id: '',
      type: 'function' as const,
      function: { name: '', arguments: '' },
    };
    next[index] = {
      id: delta.id || current.id,
      type: 'function',
      function: {
        name: delta.function?.name || current.function.name,
        arguments:
          (current.function.arguments || '') + (delta.function?.arguments || ''),
      },
    };
  }
  return next;
}
```

- [ ] **Step 3: 改 `chat.ts`（OpenAI 兼容路径）**

1. `options` 增加 `tools?: DChatCompletionTool[]`、`toolChoice?: ...`
2. 构建 body 时若有 tools 则写入 `tools` / `tool_choice`
3. 非流式：从 `choices[0].message.tool_calls` 填入 result
4. 流式：用 `aggregateToolCallDeltas` 聚合；`finish_reason === 'tool_calls'` 时 result 带 `toolCalls`；文本 content 仍走现有 onStream
5. Anthropic/Gemini 路径：若带 tools，首期忽略 tools 并打 console.warn（P3），避免抛错

- [ ] **Step 4: 写单测聚合函数**

`apps/skill-platform/src/renderer/services/ai/tools/openai-tools.test.ts`：两段 delta 拼出完整 arguments。

Run: `pnpm --filter AIM test -- src/renderer/services/ai/tools/`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/skill-platform/src/renderer/types/ai.ts apps/skill-platform/src/renderer/services/ai
git commit -m "<feat> [MCP]: chatCompletion 支持 OpenAI tools 与 tool_calls"
```

---

### Task 6: 共享 MCP Tool Loop + 全局聊天接入

**Files:**
- Create: `apps/skill-platform/src/renderer/services/aichat/mcp/tool-loop.ts`
- Create: `apps/skill-platform/src/renderer/services/aichat/mcp/tool-loop.test.ts`
- Modify: `apps/skill-platform/src/renderer/services/aichat/streams/chat-completion-stream.ts`
- Modify: `apps/skill-platform/src/renderer/services/aichat/streams/general-chat-stream.ts`

**Interfaces:**
- Consumes: `mcpApi.listTools/callTool`、`mcpToolsToOpenAITools`、扩展后的 `chatCompletion`
- Produces: `runMcpToolLoop(...)`；全局聊天自动带 MCP

- [ ] **Step 1: 写失败测试 — 轮次上限与消息组装**

测试可对「纯函数」部分：例如导出 `buildToolResultMessages(toolCalls, results)`、`shouldStopToolLoop(round, maxRounds, toolCalls)`。

```typescript
import { describe, expect, it } from 'vitest';
import { shouldStopToolLoop, buildToolResultMessages } from './tool-loop';

describe('shouldStopToolLoop', () => {
  it('无 toolCalls 停止', () => {
    expect(shouldStopToolLoop(1, 8, [])).toBe(true);
  });
  it('达到上限停止', () => {
    expect(shouldStopToolLoop(8, 8, [{ id: '1' } as never])).toBe(true);
  });
});

describe('buildToolResultMessages', () => {
  it('按 tool_call_id 生成 tool 消息', () => {
    const messages = buildToolResultMessages(
      [{ id: 'c1', type: 'function', function: { name: 'a__b', arguments: '{}' } }],
      [{ ok: true, content: 'ok' }],
    );
    expect(messages[0]).toMatchObject({ role: 'tool', tool_call_id: 'c1', content: 'ok' });
  });
});
```

- [ ] **Step 2: 实现 `tool-loop.ts`**

```typescript
export const MCP_TOOL_LOOP_MAX_ROUNDS = 8;

export function shouldStopToolLoop(
  round: number,
  maxRounds: number,
  toolCalls: unknown[],
): boolean {
  if (!toolCalls?.length) return true;
  if (round >= maxRounds) return true;
  return false;
}

export function buildToolResultMessages(
  toolCalls: IChatToolCall[],
  results: DMcpCallToolResult[],
): IChatMessage[] {
  return toolCalls.map((call, index) => ({
    role: 'tool' as const,
    tool_call_id: call.id,
    content: results[index]?.content ?? '工具无返回',
  }));
}

export interface IRunMcpToolLoopInput {
  config: IAIConfig;
  apiMessages: IChatMessage[];
  onChunk: (text: string) => void;
  streamCallbacks?: IChatStreamCallbacks;
  responseFormat?: IResponseFormatOption;
  maxRounds?: number;
}

export async function runMcpToolLoop(
  input: IRunMcpToolLoopInput,
): Promise<IRunChatCompletionStreamResult> {
  // 1. listTools；空则直接 runChatCompletionStream 原逻辑
  // 2. for round 1..maxRounds:
  //    - chatCompletion with tools (stream 文本走 onChunk；收集 toolCalls)
  //    - 若无 toolCalls：return
  //    - onChunk(`\n\n> 正在调用 ${names.join(', ')}...\n\n`)
  //    - Promise.all callTool
  //    - 追加 assistant(tool_calls) + tool results 到 apiMessages
  // 3. 超限：onChunk 提示「工具调用轮次已达上限」并 return 已有文本
}
```

实现时注意：流式场景下同一轮既有 content 又有 tool_calls；assistant 消息需同时保留 content 与 tool_calls。  
`callTool` 走 `renderer/services/mcp/api.ts`。

- [ ] **Step 3: 改 `runChatCompletionStream` 或新增 `runChatCompletionStreamWithMcp`**

推荐新增 `runChatCompletionStreamWithMcp`，内部调 `runMcpToolLoop`，避免破坏标题生成等调用方。

- [ ] **Step 4: `createGeneralChatStream` 改为调用 WithMcp 版本**

文生图分支保持不变；普通对话走 MCP loop。

- [ ] **Step 5: Run 单测**

Run: `pnpm --filter AIM test -- src/renderer/services/aichat/mcp/`  
Expected: PASS

- [ ] **Step 6: 手动验收全局聊天**

配置真实可用的 stdio MCP（例如官方 `@modelcontextprotocol/server-everything` 或项目内已有简单 server）。发消息要求调用工具，应看到调用提示与结果。

无 MCP 时对话与改前一致。

- [ ] **Step 7: Commit**

```bash
git add apps/skill-platform/src/renderer/services/aichat
git commit -m "<feat> [MCP]: 全局聊天接入 MCP tool loop"
```

---

### Task 7: 技能对话 + 工作流节点聊天 + sse/http 补齐

**Files:**
- Modify: `apps/skill-platform/src/renderer/services/aichat/skill/stream.ts`
- Modify: `apps/skill-platform/src/renderer/components/Workflow/WorkflowNodeChat/index.tsx`（若 stream 已统一则可能无需改）
- Modify: `apps/skill-platform/src/main/services/mcp/hub.ts`（确认 sse/http transport 完整）

**Interfaces:**
- Consumes: `runChatCompletionStreamWithMcp` / `runMcpToolLoop`

- [ ] **Step 1: 技能 stream 接入**

在 `createSkillLangGraphStream` 最终调用 LLM 的路径，改为与全局聊天相同的 WithMcp runner（规划/执行两阶段若各调一次 completion，两阶段都传入 tools，或仅执行阶段传入——优先**两阶段都可调 MCP**，与「所有 AI 对话」一致）。

- [ ] **Step 2: 工作流节点**

确认 `WorkflowNodeChat` 使用的 `createSkillLangGraphStream` / `createPromptTestStream`：  
- skill 路径随 Step 1 自动具备  
- `createPromptTestStream` 若走 `chatCompletion`，同样改为 WithMcp

- [ ] **Step 3: Hub sse/http**

补齐连接实现与错误摘要；在 UI 用一个 http/sse 配置项（可用 mock URL）验证状态为 error 而非进程崩溃。

- [ ] **Step 4: 对照验收清单**

按 spec §9.3 逐条勾：

1. Tab 增删改 + JSON 一致  
2. disabled 不进 tools  
3. 全局聊天可调工具  
4. 技能/工作流可调工具  
5. 无 MCP 行为不变  
6. 单 server 失败隔离  

- [ ] **Step 5: Commit**

```bash
git add apps/skill-platform/src/renderer/services/aichat apps/skill-platform/src/renderer/components/Workflow/WorkflowNodeChat apps/skill-platform/src/main/services/mcp
git commit -m "<feat> [MCP]: 技能与工作流对话接入 MCP，补齐远程传输"
```

---

## 自审（对照 Spec）

| Spec 要求 | 对应 Task |
|-----------|-----------|
| userData/mcp.json + 表单/JSON | Task 2–4 |
| stdio + sse/http + env/headers/disabled | Task 2–3、7 |
| McpHub 单例 + 增量重载 | Task 3 |
| Agent管理内 Tab | Task 4 |
| function calling | Task 5–6 |
| 全局/技能/工作流 | Task 6–7 |
| 不含 CLI / 不确认 / 不同步 Cursor | Global Constraints + 未列任务 |
| 仅 Tools | Hub 只 list/call tools |
| 验收 6 条 | Task 7 Step 4 |

开放细节已拍板：

- IPC：`mcp:*` 与现有 `domain:action` 风格一致  
- 会话存储：tool 中间消息仅进入 API `apiMessages`，不必写入 `@momo/aichat` 持久化历史（UI 最小用 onChunk 提示）；若后续要展示结构化 tool 卡片再扩会话模型（P3）  
- 流式 tool_calls：`aggregateToolCallDeltas`  
- Transport：以 `@modelcontextprotocol/sdk` 当前导出名称为准，在 Task 3 实现时锁定

---

## 执行方式

Plan 已保存。可选：

1. **Subagent-Driven（推荐）** — 每任务新开子代理，任务间复习  
2. **Inline Execution** — 本会话按 executing-plans 批量执行并设检查点  

选哪种？

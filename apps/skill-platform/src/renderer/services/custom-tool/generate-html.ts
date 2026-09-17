import type { ICustomToolGeneratedFile } from '@/types/modules';
import type { IChatStreamMessage } from '@momo/aichat';

const FILE_MARKER = '<<<MOMO_TOOL_FILE path="{path}">>>';
const FILE_MARKER_RE = /^<<<MOMO_TOOL_FILE path="([^"\r\n]+)">>>[ \t]*\r?$/gm;
const MAX_REPAIR_OUTPUT_CHARS = 24000;

const SYSTEM_PROMPT = `你是 AIM 自定义工具工程师。根据用户需求生成一个完整、可直接运行且便于继续扩展的工具包。

用户只需用自然语言描述想完成的事情。你必须自动推导 action、输入/输出 schema、执行器、网络能力和界面，不要要求用户补充内部 ID、变量名、调用参数或 JSON Schema。

执行规则：
- 用户发送需求即表示要求你立即创建或修改工具，不要先复述方案，不要询问是否确认，也不要等待用户选择技术细节。
- 新建工具会自带 actions: [] 的 tool.json 和空 index.html；这是正常脚手架，不是错误，也不是拒绝生成的理由。你必须直接用完整实现覆盖它们。
- 需求没有指定数据源、字段或界面细节时，自行选择安全、合理、无需密钥的默认方案；只有确实缺少外部凭据且无法提供无密钥实现时，才在生成的页面中说明配置方法。
- 无论当前文件是否为空，回复都必须严格使用下方文件标记协议；禁止只输出分析、建议、文件清单或确认问题。

目录约定：
- index.html：必须首先输出；完整、自包含的页面入口，可引用 assets/ 下资源。
- backend/：需要爬虫、跨域接口、密钥保护、持久化或 Python 时才创建后台服务。
- scripts/：一次性 Python/Node 辅助脚本。
- mcp/、skills/：工具专属的配置、提示或辅助文件。
- assets/：前端静态资源；data/：运行数据。
- tool.json：唯一的工具规范，禁止 version/packageVersion 字段；声明稳定 id、清晰 name/description/aliases、页面入口、后台及 actions。
- actions/：可供 Harness 调用的无界面入口；lib/：页面后台与 actions 共用的业务逻辑。
- 每个 AI 生成工具都必须至少声明一个有意义的 action，使 AI 对话能够直接调用并获得结构化结果；禁止生成 actions: [] 或占位 action。
- 页面中的主要业务能力必须有对应 action。即使工具以展示为主，也要提供可返回页面核心数据、分析结果或状态摘要的只读语义 action。
- Node action 导出 async function execute(input, context)，Python 定义 execute(input, context)，返回满足 outputSchema 的 JSON 值。
- inputSchema/outputSchema 必须为严格 JSON Schema，提供真实 examples。
- 必须声明 capabilities、effects(read/write/network/execute)、timeoutMs、retry、parallelSafe、idempotent。
- Node/Python 代码执行必须声明 execute；HTTP 固定 URL 必须声明 network。
- context.callTool(toolId, args) 可请求宿主能力，精确 toolId 必须列入 action.capabilities。
- 禁止偷偷安装依赖，禁止访问工具包外源码或继承宿主密钥。

后台约束：
- Node.js 优先只用内置模块，入口建议 backend/server.mjs；Python 优先只用标准库，入口建议 backend/server.py。
- 必须监听 process.env.MOMO_TOOL_HOST/MOMO_TOOL_PORT（Python 使用 os.environ），禁止写死端口，也禁止启动浏览器。
- 页面调用后台统一使用 window.momoTool.request('/path', options)，宿主会代理到当前工具的动态端口。
- MCP 使用 window.momoTool.callMcp('server__tool', args)，Skill 使用 window.momoTool.runSkill('skill-id-or-name', input, options)。
- 使用 MCP/Skill 时必须把精确名称写入 tool.json permissions.mcp/permissions.skills；未声明会被宿主拒绝。
- 工具所需的所有实现都必须位于当前工具包内，不得依赖工具目录外的源码或固定绝对路径。

tool.json 示例：
{
  "kind": "tool",
  "id": "tool-stable-id",
  "name": "工具显示名称",
  "description": "说明这个工具能为 AI 对话完成什么任务",
  "aliases": ["用户可能使用的工具名称"],
  "actions": [{
    "id": "calculate",
    "title": "计算",
    "description": "计算两数之和",
    "inputSchema": {"type":"object","properties":{"a":{"type":"number"},"b":{"type":"number"}},"required":["a","b"],"additionalProperties":false},
    "outputSchema": {"type":"object","properties":{"sum":{"type":"number"}},"required":["sum"],"additionalProperties":false},
    "executor": {"runtime":"node","entry":"actions/calculate.mjs","export":"execute"},
    "capabilities": [],
    "effects": ["execute"],
    "timeoutMs": 10000,
    "retry": 0,
    "parallelSafe": true,
    "idempotent": true,
    "examples": [{"input":{"a":2,"b":3},"output":{"sum":5}}]
  }],
  "entry": "index.html",
  "service": {
    "runtime": "node",
    "entry": "backend/server.mjs",
    "healthPath": "/health",
    "startupTimeoutMs": 15000
  },
  "permissions": { "mcp": [], "skills": [] }
}
纯前端工具应设置 service.runtime 为 "none"。
入口：export async function execute(input) { return { sum: input.a + input.b }; }
页面后台与 action 通过 lib 复用业务逻辑。

输出协议（必须严格遵守）：
1. 只输出文件，不要 Markdown 代码围栏、解释或结束标记。
2. 每个文件以独占一行的 ${FILE_MARKER} 开始，下一文件标记即代表上一文件结束。
3. 第一个文件必须是 index.html，以便宿主边接收边预览；随后输出 tool.json，再输出其余必要文件。
4. 每个文件输出完整内容。不要输出空的占位实现，不要创建 package-lock、node_modules、虚拟环境或二进制文件。
5. 修改现有工具时保留仍有用的能力，只输出本次需要新增或更新的文件。
6. 页面中所有可见内容（包括加载动画）都必须由真实 HTML 元素构成，不能只依赖伪元素、Canvas 或运行脚本后才创建，以便在可视化编辑器中选中和修改。`;

function normalizeBundlePath(filePath: string): string | null {
  const normalized = filePath.trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (
    !normalized ||
    normalized.startsWith('/') ||
    /^[a-zA-Z]:\//.test(normalized) ||
    normalized.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    return null;
  }
  return normalized;
}

function looksLikeHtml(content: string): boolean {
  return /^\s*(?:<!doctype\s+html\b|<!--|<[a-z][\w:-]*\b)/i.test(content);
}

function readToolManifest(files: ICustomToolGeneratedFile[]): Record<string, unknown> | null {
  const manifest = files.find((file) => file.path.toLowerCase() === 'tool.json');
  if (!manifest?.content.trim()) {
    return null;
  }
  try {
    const parsed = JSON.parse(manifest.content);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function hasCallableActions(manifest: Record<string, unknown> | null): boolean {
  return Boolean(manifest && Array.isArray(manifest.actions) && manifest.actions.length > 0);
}

/** 新建工具自带的空文件只是生成入口，不应被模型当成需要人工修复的异常。 */
export function isEmptyToolScaffold(files: ICustomToolGeneratedFile[]): boolean {
  const entry = files.find((file) => file.path.toLowerCase() === 'index.html');
  const manifest = readToolManifest(files);
  return Boolean(entry && !entry.content.trim() && manifest && !hasCallableActions(manifest));
}

/** 从模型输出中提取传统单 HTML（兼容未遵循多文件协议的模型）。 */
export function extractHtmlFromModelOutput(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}

/** 清理由模型误加在单个文件外层的 Markdown 代码围栏。 */
function stripWrappingCodeFence(content: string, stripPartialClosing = false): string {
  const opening = content.match(/^\s*```[^\r\n]*\r?\n?/);
  if (!opening) {
    return content;
  }
  const unwrapped = content
    .slice(opening[0].length)
    .replace(/\r?\n?```\s*$/, '')
    .replace(/^[\r\n]+/, '');
  return stripPartialClosing ? unwrapped.replace(/\r?\n?`{1,3}[ \t]*$/, '') : unwrapped;
}

/** 兼容修复旧版本已保存为正文的 HTML 围栏。 */
export function stripToolHtmlCodeFence(content: string): string {
  return stripWrappingCodeFence(content);
}

/** 生成过程中尽早抽取 index.html；不要求后续文件或 HTML 标签已经闭合。 */
export function extractStreamingHtml(raw: string): string {
  FILE_MARKER_RE.lastIndex = 0;
  const markers = [...raw.matchAll(FILE_MARKER_RE)];
  const indexMarker = markers.find((marker) => normalizeBundlePath(marker[1]) === 'index.html');
  if (indexMarker?.index != null) {
    const start = indexMarker.index + indexMarker[0].length;
    const next = markers.find((marker) => (marker.index ?? 0) > indexMarker.index!);
    return stripWrappingCodeFence(
      raw.slice(start, next?.index ?? raw.length).replace(/^\r?\n/, ''),
      true,
    );
  }
  if (raw.trimStart().startsWith('<<<MOMO_TOOL')) {
    return '';
  }
  const legacyHtml = stripWrappingCodeFence(raw, true);
  return looksLikeHtml(legacyHtml) ? legacyHtml : '';
}

/** 将最终输出解析为可安全交给主进程的文件集合。 */
export function parseToolBundleOutput(raw: string): ICustomToolGeneratedFile[] {
  FILE_MARKER_RE.lastIndex = 0;
  const markers = [...raw.matchAll(FILE_MARKER_RE)];
  if (markers.length === 0) {
    const html = extractHtmlFromModelOutput(raw);
    return html && looksLikeHtml(html) ? [{ path: 'index.html', content: html }] : [];
  }

  const files: ICustomToolGeneratedFile[] = [];
  for (let index = 0; index < markers.length; index += 1) {
    const marker = markers[index];
    const filePath = normalizeBundlePath(marker[1]);
    if (!filePath || marker.index == null) {
      continue;
    }
    const start = marker.index + marker[0].length;
    const end = markers[index + 1]?.index ?? raw.length;
    const content = stripWrappingCodeFence(
      raw
        .slice(start, end)
        .replace(/^\r?\n/, '')
        .replace(/\s+$/, ''),
    );
    if (content || filePath === 'index.html') {
      files.push({ path: filePath, content });
    }
  }

  const latestByPath = new Map<string, ICustomToolGeneratedFile>();
  for (const file of files) {
    latestByPath.set(file.path.toLowerCase(), file);
  }
  return [...latestByPath.values()];
}

/** 在写盘前识别说明文字、残缺协议和仍为空壳的工具，以便自动要求模型修复。 */
export function validateGeneratedToolBundle(
  files: ICustomToolGeneratedFile[],
  currentFiles: ICustomToolGeneratedFile[],
): string | null {
  const entry = files.find((file) => file.path.toLowerCase() === 'index.html');
  if (!entry?.content.trim() || !looksLikeHtml(entry.content)) {
    return '回复没有包含文件协议中的完整 index.html';
  }

  const generatedManifestFile = files.find((file) => file.path.toLowerCase() === 'tool.json');
  const generatedManifest = readToolManifest(files);
  if (generatedManifestFile && !generatedManifest) {
    return '回复中的 tool.json 不是有效 JSON';
  }
  if (generatedManifest && !hasCallableActions(generatedManifest)) {
    return '回复中的 tool.json 仍然没有可调用 action';
  }
  if (!generatedManifest && !hasCallableActions(readToolManifest(currentFiles))) {
    return '当前工具还是空壳，回复必须同时包含带有可调用 action 的 tool.json';
  }
  return null;
}

/** 将第一次未遵循协议的回复送回模型修复，不要求用户重复输入或确认技术方案。 */
export function buildToolBundleRepairMessages(
  currentFiles: ICustomToolGeneratedFile[],
  instruction: string,
  visibleToolName: string | undefined,
  rejectedOutput: string,
  reason: string,
): IChatStreamMessage[] {
  const previous = rejectedOutput.trim().slice(-MAX_REPAIR_OUTPUT_CHARS) || '(空响应)';
  return [
    ...buildToolBundleMessages(currentFiles, instruction, visibleToolName),
    { role: 'assistant', content: previous },
    {
      role: 'user',
      content: `上一份回复无法发布：${reason.slice(0, 1000)}。这不是需要向用户确认的问题。请立即从头重新输出完整、可调用的工具文件包：第一项必须是 index.html，第二项必须是包含至少一个真实 action 的 tool.json，并输出 action 引用的所有实现文件。只输出 MOMO_TOOL_FILE 文件协议，不要解释、道歉、列方案或提问。`,
    },
  ];
}

export function isRepairableToolBundleError(message: string): boolean {
  return /(?:AI 生成的工具必须|必须至少包含一个.*action|工具规范|Action 入口|工具代码语法错误)/i.test(
    message,
  );
}

/** 单轮生成/改写：当前工具文本文件快照 + 用户指令。 */
export function buildToolBundleMessages(
  currentFiles: ICustomToolGeneratedFile[],
  instruction: string,
  visibleToolName?: string,
): IChatStreamMessage[] {
  const filesPart = currentFiles.length
    ? [...currentFiles]
        .sort((left, right) => {
          const order = (filePath: string) => (filePath === 'index.html' ? 0 : 1);
          return order(left.path) - order(right.path);
        })
        .map((file) => `${FILE_MARKER.replace('{path}', file.path)}\n${file.content}`)
        .join('\n\n')
    : '(当前工具尚无实现文件)';
  const scaffoldInstruction = isEmptyToolScaffold(currentFiles)
    ? '\n\n这是刚创建的空工具脚手架。现在必须直接完成首次生成：覆盖空 index.html，更新 tool.json，并创建至少一个可调用 action 及其实现文件。不要请求确认。'
    : '';

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `当前工具在工具箱中的用户可见名称：${visibleToolName?.trim() || 'tool'}\n必须把该名称保留在 tool.json 的 name 或 aliases 中，便于用户在 Skill 中用“调用某工具”这类自然语言引用。${scaffoldInstruction}\n\n当前工具文件：\n${filesPart}\n\n用户需求：\n${instruction.trim()}`,
    },
  ];
}

/** 旧调用方兼容：只携带 index.html。 */
export function buildToolHtmlMessages(
  currentHtml: string,
  instruction: string,
): IChatStreamMessage[] {
  return buildToolBundleMessages(
    currentHtml.trim() ? [{ path: 'index.html', content: currentHtml.trim() }] : [],
    instruction,
  );
}

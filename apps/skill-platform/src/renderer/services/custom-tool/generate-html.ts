import type { ICustomToolGeneratedFile } from '@/types/modules';
import type { IChatStreamMessage } from '@momo/aichat';

const FILE_MARKER = '<<<MOMO_TOOL_FILE path="{path}">>>';
const FILE_MARKER_RE = /^<<<MOMO_TOOL_FILE path="([^"\r\n]+)">>>[ \t]*\r?$/gm;

const SYSTEM_PROMPT = `你是 AIM 自定义工具工程师。根据用户需求生成一个完整、可直接运行且便于继续扩展的工具包。

目录约定：
- index.html：必须首先输出；完整、自包含的页面入口，可引用 assets/ 下资源。
- backend/：需要爬虫、跨域接口、密钥保护、持久化或 Python 时才创建后台服务。
- scripts/：一次性 Python/Node 辅助脚本。
- mcp/、skills/：工具专属的配置、提示或辅助文件。
- assets/：前端静态资源；data/：运行数据。
- tool.json：manifest v2，声明页面入口、后台运行时及宿主能力权限。

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
  "version": 2,
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
  return stripWrappingCodeFence(raw, true);
}

/** 将最终输出解析为可安全交给主进程的文件集合。 */
export function parseToolBundleOutput(raw: string): ICustomToolGeneratedFile[] {
  FILE_MARKER_RE.lastIndex = 0;
  const markers = [...raw.matchAll(FILE_MARKER_RE)];
  if (markers.length === 0) {
    const html = extractHtmlFromModelOutput(raw);
    return html ? [{ path: 'index.html', content: html }] : [];
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

/** 单轮生成/改写：当前工具文本文件快照 + 用户指令。 */
export function buildToolBundleMessages(
  currentFiles: ICustomToolGeneratedFile[],
  instruction: string,
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

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `当前工具文件：\n${filesPart}\n\n用户需求：\n${instruction.trim()}`,
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

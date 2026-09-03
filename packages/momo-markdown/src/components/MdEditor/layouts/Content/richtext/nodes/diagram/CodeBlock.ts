import { ReactNodeViewRenderer } from '@tiptap/react';
import CodeBlockBase, { type CodeBlockOptions } from '@tiptap/extension-code-block';
import { prefix } from '~/config';
import DiagramView from './DiagramView';

// 支持所见即所得渲染的图表语言
export const DIAGRAM_LANGS = new Set(['mermaid', 'flowchart', 'echarts', 'plantuml', 'puml']);

// 折叠强制标记：::open 永远展开、::close 永远折叠
const MANDATORY_RE = /::(open|close)/;

/**
 * 解析 fence 语言信息，分离出干净语言名与折叠强制标记
 *
 * richtext 使用 markdown-it 默认 fence 规则，info 中的 `::open`/`::close`
 * 会原样保留在 language 属性中（如 `js::open`），需在此剥离用于展示与判断。
 */
export const parseCodeLang = (
  raw: string | null | undefined,
): { lang: string; mandatory: 'open' | 'close' | null } => {
  const value = (raw ?? '').trim();
  const match = value.match(MANDATORY_RE);
  if (match) {
    return {
      lang: value.replace(MANDATORY_RE, '').trim(),
      mandatory: match[1] as 'open' | 'close',
    };
  }
  return { lang: value, mandatory: null };
};

// 扩展后的代码块选项：在基础选项之上增加折叠配置
// 基础选项以 Partial 形式合并，因 addOptions 中通过 `this.parent?.()` 继承时属性可能为 undefined
export interface IRichTextCodeBlockOptions extends Partial<CodeBlockOptions> {
  // 是否开启代码折叠（与 markdown 模式 codeFoldable 一致）
  codeFoldable: boolean;
  // 自动折叠的行数阈值（与 markdown 模式 autoFoldThreshold 一致）
  autoFoldThreshold: number;
}

/**
 * 自定义 CodeBlock 扩展
 *
 * - 普通 ```lang 代码块：保持原生可编辑代码视图，支持与 markdown 一致的折叠行为
 * - mermaid / flowchart / echarts / plantuml / puml：渲染为对应图表，选中时可编辑源码
 *
 * Markdown 往返由 tiptap-markdown 内置的 codeBlock 序列化处理（```lang\ncode```），
 * 解析依赖 markdown-it 默认 fence 规则生成 `<pre><code class="language-xxx">`，
 * 因此无需为图表额外编写 markdown 解析/序列化规则。
 */
const CodeBlock = CodeBlockBase.extend<IRichTextCodeBlockOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      // 是否开启代码折叠（与 markdown 模式 codeFoldable 一致）
      codeFoldable: true,
      // 自动折叠的行数阈值（与 markdown 模式 autoFoldThreshold 一致）
      autoFoldThreshold: 30,
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(DiagramView);
  },
});

export default CodeBlock;

/**
 * 判断给定语言是否为图表语言
 *
 * 入参可为带 `::open`/`::close` 标记的原始语言串，内部会先剥离标记。
 */
export const isDiagramLang = (lang: string | null | undefined): boolean => {
  const { lang: clean } = parseCodeLang(lang);
  return !!clean && DIAGRAM_LANGS.has(clean);
};

export { prefix };

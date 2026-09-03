import { globalConfig } from '~/config';
import KatexPlugin from '~/layouts/Content/markdownIt/katex';

const MARK = '__momo_katex_registered';

/**
 * 在 tiptap-markdown 的 markdown-it 实例上注册 KaTeX 解析规则
 *
 * 复用现有 markdown-it katex 插件，但传入空的 katexRef，
 * 使其输出原始 LaTeX 文本（而非渲染后的 HTML），
 * 便于 ProseMirror 节点的 parseDOM 读取 latex 属性。
 *
 * 通过 md 实例上的标记避免重复注册。
 */
export const registerKatexParse = (md: any) => {
  if (md[MARK]) return;
  md[MARK] = true;

  md.use(KatexPlugin, {
    // 传入空 ref：渲染时 katexRef.current 为 null，插件会原样输出 latex 文本
    katexRef: { current: null },
  });

  // 关闭全局 katex 配置可能带来的副作用（此处仅用于解析）
  void globalConfig;
};

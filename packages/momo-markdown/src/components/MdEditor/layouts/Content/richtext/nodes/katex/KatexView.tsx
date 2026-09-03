import { NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { globalConfig, prefix } from '~/config';

interface IProps {
  node: {
    attrs: { latex: string };
    type: { name: string };
  };
  selected: boolean;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  editor: { isFocused: () => boolean };
}

/**
 * KaTeX 公式 NodeView
 *
 * - 未选中：渲染公式
 * - 选中：显示 LaTeX 源码编辑框，便于修改
 */
const KatexView = (props: IProps) => {
  const { node, selected, updateAttributes } = props;
  const isBlock = node.type.name === 'katexBlock';
  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string>('');
  const renderRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const latex = node.attrs.latex || '';
    const renderKatex = (katex: any) => {
      try {
        const out = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: isBlock,
        });
        setHtml(out);
        setError('');
      } catch (err: any) {
        setError(err?.message || String(err));
        setHtml('');
      }
    };
    const katex = globalConfig.editorExtensions.katex?.instance || (window as any).katex;
    if (katex) {
      renderKatex(katex);
      return;
    }
    // 动态加载 katex（开发/构建期可用；发布包需消费方提供 CDN 实例）
    import('katex')
      .then((mod: any) => {
        const instance = mod.default || mod;
        globalConfig.editorExtensions.katex = globalConfig.editorExtensions.katex || {};
        globalConfig.editorExtensions.katex.instance = instance;
        renderKatex(instance);
      })
      .catch(() => {
        // katex 不可用：原样显示 latex
        setHtml('');
        setError('');
      });
  }, [node.attrs.latex, isBlock]);

  const Tag = isBlock ? 'div' : 'span';

  return (
    <NodeViewWrapper
      as={Tag}
      className={`${prefix}-katex ${isBlock ? `${prefix}-katex-block-view` : `${prefix}-katex-inline-view`} ${selected ? `${prefix}-katex-selected` : ''}`}>
      {selected ? (
        <input
          className={`${prefix}-katex-input`}
          value={node.attrs.latex}
          onChange={(e) => updateAttributes({ latex: e.target.value })}
          placeholder='LaTeX 公式'
        />
      ) : (
        <span ref={renderRef} dangerouslySetInnerHTML={{ __html: html || node.attrs.latex }} />
      )}
      {error && <span className={`${prefix}-katex-error`}>{error}</span>}
    </NodeViewWrapper>
  );
};

export default KatexView;

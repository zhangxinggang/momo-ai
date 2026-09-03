import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { prefix } from '~/config';

interface IProps {
  node: {
    attrs: { type: string; title: string };
  };
  selected: boolean;
  updateAttributes: (attrs: Record<string, unknown>) => void;
}

/**
 * Admonition NodeView
 *
 * 渲染带类型样式的告示框，标题可编辑，内容由 ProseMirror 接管（NodeViewContent）。
 */
const AdmonitionView = (props: IProps) => {
  const { node, selected, updateAttributes } = props;
  const type = node.attrs.type || 'note';

  return (
    <NodeViewWrapper
      as='div'
      className={`${prefix}-admonition ${prefix}-admonition-${type} ${selected ? `${prefix}-admonition-selected` : ''}`}>
      <div className={`${prefix}-admonition-header`}>
        <input
          className={`${prefix}-admonition-type-input`}
          value={type}
          onChange={(e) => updateAttributes({ type: e.target.value })}
          placeholder='类型（如 note / tip / warning）'
        />
        <input
          className={`${prefix}-admonition-title-input`}
          value={node.attrs.title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          placeholder='标题（可选）'
        />
      </div>
      <div className={`${prefix}-admonition-content`}>
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};

export default AdmonitionView;

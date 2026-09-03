import { ForwardedRef, forwardRef, memo, useContext } from 'react';
import { EditorContext } from '~/context';
import { IContentProps } from './props';
import MarkdownContent from './MarkdownContent';
import RichTextContent from './richtext/RichTextContent';

/**
 * 内容区根组件
 *
 * 根据当前编辑模式（editorMode）渲染对应的内容区：
 * - 'markdown'：CodeMirror 编辑 + markdown-it 分屏预览
 * - 'richtext'：TipTap 富文本所见即所得编辑
 *
 * 两种模式各自注册对应的 REPLACE 事件处理器，互不干扰。
 */
const Content = forwardRef((props: IContentProps, ref: ForwardedRef<unknown>) => {
  const { editorMode } = useContext(EditorContext);

  if (editorMode === 'richtext') {
    return <RichTextContent ref={ref} {...props} />;
  }

  return <MarkdownContent ref={ref} {...props} />;
});

export default memo(Content);

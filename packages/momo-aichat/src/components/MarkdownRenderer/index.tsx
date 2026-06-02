/**
 * Markdown 渲染：基于 @momo/markdown MdPreview
 */
import { MdPreview, type IMdPreviewProps } from '@momo/markdown';
import classNames from 'classnames';
import { memo, useId, useMemo, type ComponentType } from 'react';
import { fixStreamingMarkdown, hasMarkdownSyntax } from '../../utils/markdownUtils';
import styles from './index.module.less';

export interface IProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  /** MdPreview 明暗主题 */
  theme?: 'light' | 'dark';
  previewTheme?: string;
  codeTheme?: string;
  language?: string;
  /** 稳定实例 id（避免流式更新时重复挂载） */
  instanceKey?: string;
}

type TMdPreviewViewProps = Pick<
  IMdPreviewProps,
  'id' | 'value' | 'theme' | 'previewTheme' | 'codeTheme' | 'language' | 'className' | 'style'
>;

/** 与宿主 React 类型版本可能不完全一致 */
const MdPreviewView = MdPreview as ComponentType<TMdPreviewViewProps>;

function MarkdownRenderer({
  content,
  isStreaming = false,
  className = '',
  theme = 'light',
  previewTheme = 'cyanosis',
  codeTheme = 'atom',
  language = 'zh-CN',
  instanceKey,
}: IProps) {
  const reactId = useId();
  // useId 含冒号；MdPreview 内部用 querySelector，须去掉冒号
  const editorId = useMemo(
    () => `aichat-${(instanceKey ?? reactId).replace(/:/g, '')}`,
    [instanceKey, reactId],
  );

  if (!content || typeof content !== 'string') {
    return null;
  }

  if (!hasMarkdownSyntax(content)) {
    return <div className={classNames(styles.plain, className)}>{content}</div>;
  }

  const processedContent = isStreaming ? fixStreamingMarkdown(content) : content;
  const mdValue = processedContent.trim() === '' ? '\u00a0' : processedContent;

  return (
    <div className={classNames(styles.wrap, className)}>
      <MdPreviewView
        id={editorId}
        value={mdValue}
        theme={theme}
        previewTheme={previewTheme}
        codeTheme={codeTheme}
        language={language}
        className={styles.preview}
        style={{ background: 'transparent' }}
      />
    </div>
  );
}

export default memo(MarkdownRenderer);

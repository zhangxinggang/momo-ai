/**
 * Markdown 渲染：基于 @momo/markdown MdPreview，并支持本地路径点击
 */
import { MdPreview, type IMdPreviewProps } from '@momo/markdown';
import { App } from 'antd';
import classNames from 'classnames';
import { memo, useCallback, useEffect, useId, useMemo, useRef, type ComponentType } from 'react';
import { useAiChatConfig } from '../../contexts/AiChatConfigContext';
import {
  enhanceLocalPathElements,
  isAbsoluteLocalPath,
  joinLocalPath,
  normalizeLocalPathValue,
  splitPlainTextByLocalPaths,
} from '../../utils/local-path';
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
  | 'id'
  | 'value'
  | 'theme'
  | 'previewTheme'
  | 'codeTheme'
  | 'language'
  | 'className'
  | 'style'
  | 'onHtmlChanged'
  | 'onRemount'
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
  const { message } = App.useApp();
  const { localPath, workspace } = useAiChatConfig();
  const reactId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  // useId 含冒号；MdPreview 内部用 querySelector，须去掉冒号
  const editorId = useMemo(
    () => `aichat-${(instanceKey ?? reactId).replace(/:/g, '')}`,
    [instanceKey, reactId],
  );

  const workspacePaths = useMemo(() => {
    if (!workspace?.enabled) {
      return [];
    }
    const activePreset = workspace.presets?.find((item) => item.id === workspace.activePresetId);
    return activePreset?.paths?.length ? activePreset.paths : workspace.paths;
  }, [workspace]);

  const resolvePath = useCallback(
    (rawPath: string): string => {
      const trimmed = normalizeLocalPathValue(rawPath);
      if (localPath?.resolveLocalPath) {
        const resolved = localPath.resolveLocalPath(trimmed);
        if (resolved) {
          return resolved;
        }
      }
      if (isAbsoluteLocalPath(trimmed) || workspacePaths.length === 0) {
        return trimmed;
      }
      return joinLocalPath(workspacePaths[0], trimmed);
    },
    [localPath, workspacePaths],
  );

  const handleOpenPath = useCallback(
    async (rawPath: string) => {
      if (!localPath?.onOpenLocalPath) {
        return;
      }
      const absolutePath = resolvePath(rawPath);
      if (localPath.checkPathExists) {
        try {
          const exists = await localPath.checkPathExists(absolutePath);
          if (!exists) {
            message.warning('路径不存在，请检查工作区配置');
            return;
          }
        } catch {
          message.warning('路径不存在，请检查工作区配置');
          return;
        }
      }
      await localPath.onOpenLocalPath(absolutePath);
    },
    [localPath, message, resolvePath],
  );

  const handleContainerClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      const pathElement = target?.closest('[data-local-path]');
      if (!pathElement) {
        return;
      }
      const rawPath = pathElement.getAttribute('data-local-path');
      if (!rawPath) {
        return;
      }
      event.preventDefault();
      void handleOpenPath(rawPath);
    },
    [handleOpenPath],
  );

  const enhancePathsInView = useCallback(() => {
    const root = wrapRef.current;
    if (!root || !localPath?.onOpenLocalPath) {
      return;
    }
    enhanceLocalPathElements(root, styles['local-path']);
  }, [localPath?.onOpenLocalPath]);

  useEffect(() => {
    enhancePathsInView();
  }, [content, isStreaming, enhancePathsInView]);

  const handlePreviewHtmlChanged = useCallback(() => {
    enhancePathsInView();
  }, [enhancePathsInView]);

  const handlePreviewRemount = useCallback(() => {
    enhancePathsInView();
  }, [enhancePathsInView]);

  if (!content || typeof content !== 'string') {
    return null;
  }

  if (!hasMarkdownSyntax(content)) {
    const plainParts = splitPlainTextByLocalPaths(content);
    return (
      <div
        ref={wrapRef}
        className={classNames(styles.plain, className)}
        onClick={localPath?.onOpenLocalPath ? handleContainerClick : undefined}>
        {plainParts.map((part, index) =>
          part.kind === 'path' ? (
            <span
              className={styles['local-path']}
              data-local-path={normalizeLocalPathValue(part.value)}
              key={`${part.value}-${index}`}
              role='link'
              tabIndex={0}>
              {part.value}
            </span>
          ) : (
            <span key={`text-${index}`}>{part.value}</span>
          ),
        )}
      </div>
    );
  }

  const processedContent = isStreaming ? fixStreamingMarkdown(content) : content;
  const mdValue = processedContent.trim() === '' ? '\u00a0' : processedContent;

  return (
    <div
      ref={wrapRef}
      className={classNames(styles.wrap, className)}
      onClick={localPath?.onOpenLocalPath ? handleContainerClick : undefined}>
      <MdPreviewView
        id={editorId}
        value={mdValue}
        theme={theme}
        previewTheme={previewTheme}
        codeTheme={codeTheme}
        language={language}
        className={styles.preview}
        style={{ background: 'transparent' }}
        onHtmlChanged={handlePreviewHtmlChanged}
        onRemount={handlePreviewRemount}
      />
    </div>
  );
}

export default memo(MarkdownRenderer);

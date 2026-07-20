/**
 * Markdown 渲染：基于 @momo/markdown MdPreview，并支持本地路径与 http(s) 链接点击
 */
import { MdPreview, type IMdPreviewProps } from '@momo/markdown';
import { App } from 'antd';
import classNames from 'classnames';
import { memo, useCallback, useEffect, useId, useMemo, useRef, type ComponentType, type MouseEvent } from 'react';
import { useAiChatConfig } from '../../contexts/AiChatConfigContext';
import {
  enhanceExternalUrlElements,
  isHttpUrl,
  splitPlainTextByHttpUrls,
} from '../../utils/external-url';
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
  const { localPath, workspace, onOpenExternalUrl } = useAiChatConfig();
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

  const handleOpenExternalUrl = useCallback(
    async (rawUrl: string) => {
      if (!onOpenExternalUrl || !isHttpUrl(rawUrl)) {
        return;
      }
      await onOpenExternalUrl(rawUrl.trim());
    },
    [onOpenExternalUrl],
  );

  const canHandleClick = Boolean(localPath?.onOpenLocalPath || onOpenExternalUrl);

  const handleContainerClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const pathElement = target.closest('[data-local-path]');
      if (pathElement) {
        const rawPath = pathElement.getAttribute('data-local-path');
        if (rawPath) {
          event.preventDefault();
          void handleOpenPath(rawPath);
        }
        return;
      }

      const externalUrlElement = target.closest('[data-external-url]');
      if (externalUrlElement && onOpenExternalUrl) {
        const rawUrl = externalUrlElement.getAttribute('data-external-url');
        if (rawUrl) {
          event.preventDefault();
          void handleOpenExternalUrl(rawUrl);
        }
        return;
      }

      const anchor = target.closest('a');
      if (anchor && onOpenExternalUrl) {
        const href = anchor.getAttribute('href')?.trim() ?? '';
        if (isHttpUrl(href)) {
          event.preventDefault();
          void handleOpenExternalUrl(href);
        }
      }
    },
    [handleOpenExternalUrl, handleOpenPath, onOpenExternalUrl],
  );

  const enhanceInteractiveElements = useCallback(() => {
    const root = wrapRef.current;
    if (!root) {
      return;
    }
    if (onOpenExternalUrl) {
      enhanceExternalUrlElements(root, styles['external-url']);
    }
    if (localPath?.onOpenLocalPath) {
      enhanceLocalPathElements(root, styles['local-path']);
    }
  }, [localPath?.onOpenLocalPath, onOpenExternalUrl]);

  useEffect(() => {
    enhanceInteractiveElements();
  }, [content, isStreaming, enhanceInteractiveElements]);

  const handlePreviewHtmlChanged = useCallback(() => {
    enhanceInteractiveElements();
  }, [enhanceInteractiveElements]);

  const handlePreviewRemount = useCallback(() => {
    enhanceInteractiveElements();
  }, [enhanceInteractiveElements]);

  const renderPlainParts = useCallback(
    (text: string, keyPrefix: string) => {
      const urlParts = splitPlainTextByHttpUrls(text);
      return urlParts.map((urlPart, urlIndex) => {
        if (urlPart.kind === 'url' && onOpenExternalUrl) {
          return (
            <span
              className={styles['external-url']}
              data-external-url={urlPart.value}
              key={`${keyPrefix}-url-${urlIndex}`}
              role='link'
              tabIndex={0}>
              {urlPart.value}
            </span>
          );
        }

        const pathParts = splitPlainTextByLocalPaths(urlPart.value);
        return pathParts.map((pathPart, pathIndex) => {
          if (pathPart.kind === 'path' && localPath?.onOpenLocalPath) {
            return (
              <span
                className={styles['local-path']}
                data-local-path={normalizeLocalPathValue(pathPart.value)}
                key={`${keyPrefix}-path-${urlIndex}-${pathIndex}`}
                role='link'
                tabIndex={0}>
                {pathPart.value}
              </span>
            );
          }
          return (
            <span key={`${keyPrefix}-text-${urlIndex}-${pathIndex}`}>{pathPart.value}</span>
          );
        });
      });
    },
    [localPath?.onOpenLocalPath, onOpenExternalUrl],
  );

  if (!content || typeof content !== 'string') {
    return null;
  }

  if (!hasMarkdownSyntax(content)) {
    return (
      <div
        ref={wrapRef}
        className={classNames(styles.plain, className)}
        onClick={canHandleClick ? handleContainerClick : undefined}>
        {renderPlainParts(content, 'plain')}
      </div>
    );
  }

  const processedContent = isStreaming ? fixStreamingMarkdown(content) : content;
  const mdValue = processedContent.trim() === '' ? '\u00a0' : processedContent;

  return (
    <div
      ref={wrapRef}
      className={classNames(styles.wrap, className)}
      onClick={canHandleClick ? handleContainerClick : undefined}>
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

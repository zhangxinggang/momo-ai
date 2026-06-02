import { App } from 'antd';
import { Database, FolderOpen } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useAiChatConfig } from '../../contexts/AiChatConfigContext';
import { useChatContext } from '../../contexts/ChatContext';
import { formatWorkspaceDisplayPath } from '../../utils/workspace-display';
import styles from './index.module.less';

/** 对话顶部上下文条：展示已启用的 RAG 知识库与工作区选择 */
export function ChatContextBanner() {
  const { message } = App.useApp();
  const { listKbCollections, workspace } = useAiChatConfig();
  const { kbEnabled, kbCollectionId } = useChatContext();
  const [collections, setCollections] = useState<{ id: number; name: string }[]>([]);
  const [pathExistsMap, setPathExistsMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!listKbCollections || !kbEnabled) {
      return;
    }
    let mounted = true;
    const load = async () => {
      try {
        const items = await listKbCollections();
        if (mounted) {
          setCollections(items);
        }
      } catch {
        // 忽略加载失败
      }
    };
    void load();
    const onReload = () => void load();
    window.addEventListener('kb:collections-updated', onReload);
    return () => {
      mounted = false;
      window.removeEventListener('kb:collections-updated', onReload);
    };
  }, [kbEnabled, listKbCollections]);

  const kbName = useMemo(() => {
    if (!kbEnabled || kbCollectionId === undefined) {
      return null;
    }
    return (
      collections.find((item) => item.id === kbCollectionId)?.name ?? `知识库 #${kbCollectionId}`
    );
  }, [collections, kbCollectionId, kbEnabled]);

  const workspacePaths = useMemo(() => {
    if (!workspace?.enabled) {
      return [];
    }
    const activePreset = workspace.presets?.find((item) => item.id === workspace.activePresetId);
    return activePreset?.paths?.length ? activePreset.paths : workspace.paths;
  }, [workspace]);

  useEffect(() => {
    if (!workspace?.checkPathExists || workspacePaths.length === 0) {
      setPathExistsMap({});
      return;
    }
    let mounted = true;
    const loadExists = async () => {
      const next: Record<string, boolean> = {};
      for (const folderPath of workspacePaths) {
        try {
          next[folderPath] = await workspace.checkPathExists!(folderPath);
        } catch {
          next[folderPath] = false;
        }
      }
      if (mounted) {
        setPathExistsMap(next);
      }
    };
    void loadExists();
    return () => {
      mounted = false;
    };
  }, [workspace, workspacePaths]);

  const showRag = Boolean(kbEnabled && kbName);
  const showWorkspace = Boolean(workspace?.enabled && workspacePaths.length > 0);

  if (!showRag && !showWorkspace) {
    return null;
  }

  const handlePathClick = (folderPath: string) => {
    const exists = pathExistsMap[folderPath];
    if (exists === false) {
      message.warning('目录不存在，请检查工作区配置');
      return;
    }
    workspace?.onOpenFolderPath?.(folderPath);
  };

  return (
    <div className={styles['chat-context-banner']}>
      {showRag ? (
        <div className={styles['chat-context-banner-item']}>
          <Database aria-hidden className={styles['chat-context-banner-icon']} size={14} />
          <span className={styles['chat-context-banner-label']}>RAG</span>
          <span className={styles['chat-context-banner-value']}>{kbName}</span>
        </div>
      ) : null}
      {showWorkspace ? (
        <div className={styles['chat-context-banner-item']}>
          <FolderOpen aria-hidden className={styles['chat-context-banner-icon']} size={14} />
          <span className={styles['chat-context-banner-label']}>工作区</span>
          <div className={styles['chat-context-banner-paths']}>
            {workspacePaths.map((folderPath) => {
              const isMissing = pathExistsMap[folderPath] === false;
              return (
                <button
                  className={`${styles['chat-context-banner-path']} ${
                    isMissing ? styles['chat-context-banner-path--missing'] : ''
                  }`}
                  key={folderPath}
                  title={folderPath}
                  type='button'
                  onClick={() => handlePathClick(folderPath)}>
                  {formatWorkspaceDisplayPath(folderPath)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

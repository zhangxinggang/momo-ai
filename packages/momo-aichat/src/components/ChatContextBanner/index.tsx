import { Bot, Cuboid, Database } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useAiChatConfig } from '../../contexts/AiChatConfigContext';
import { useChatContext } from '../../contexts/ChatContext';
import styles from './index.module.less';

/** 对话顶部上下文条：单行展示已启用的 RAG、Agent 与技能 */
export function ChatContextBanner() {
  const { listKbCollections, skillBanner, agentAppBanner } = useAiChatConfig();
  const { kbEnabled, kbCollectionId } = useChatContext();
  const [collections, setCollections] = useState<{ id: number; name: string }[]>([]);

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
    if (!kbEnabled) {
      return null;
    }
    if (kbCollectionId === undefined) {
      return '自动选择';
    }
    return (
      collections.find((item) => item.id === kbCollectionId)?.name ?? `知识库 #${kbCollectionId}`
    );
  }, [collections, kbCollectionId, kbEnabled]);

  const showRag = Boolean(kbEnabled && kbName);
  const agentName = agentAppBanner?.name?.trim() || '';
  const showAgent = Boolean(agentName);
  const skillName = skillBanner?.name?.trim() || '';
  const showSkill = Boolean(skillName);

  if (!showRag && !showAgent && !showSkill) {
    return null;
  }

  return (
    <div className={styles['chat-context-banner']} aria-label='当前对话上下文'>
      <span className={styles['chat-context-banner-rail']} aria-hidden />
      <div className={styles['chat-context-banner-row']}>
        {showRag ? (
          <div className={styles['chat-context-banner-chip']}>
            <Database aria-hidden className={styles['chat-context-banner-icon']} size={12} />
            <span className={styles['chat-context-banner-label']}>知识库</span>
            <span className={styles['chat-context-banner-token']} title={kbName ?? undefined}>
              {kbName}
            </span>
          </div>
        ) : null}
        {showAgent ? (
          <div className={styles['chat-context-banner-chip']}>
            <Bot aria-hidden className={styles['chat-context-banner-icon']} size={12} />
            <span className={styles['chat-context-banner-label']}>Agent</span>
            <span className={styles['chat-context-banner-token']} title={agentName}>
              {agentName}
            </span>
          </div>
        ) : null}
        {showSkill ? (
          <div className={styles['chat-context-banner-chip']}>
            <Cuboid aria-hidden className={styles['chat-context-banner-icon']} size={12} />
            <span className={styles['chat-context-banner-label']}>技能</span>
            <span className={styles['chat-context-banner-token']} title={skillName}>
              {skillName}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

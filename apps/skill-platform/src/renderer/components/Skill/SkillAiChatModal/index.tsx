import type { ISkill } from '@/types/modules';
import { FullscreenModal } from '@renderer/components/ui/FullscreenModal';
import { createMainChatSession } from '@renderer/services/aichat/chat-history-bridge';
import { useSettingsStore } from '@renderer/store';
import { useEffect, useMemo, useState } from 'react';
import { SkillAiChat } from '../SkillAiChat';
import styles from './index.module.less';

interface IProps {
  isOpen: boolean;
  skills: ISkill[];
  initialSkillId: string | null;
  onClose: () => void;
}

export function SkillAiChatModal({ isOpen, skills, initialSkillId, onClose }: IProps) {
  const aiModels = useSettingsStore((s) => s.aiModels);
  const activeSkill = useMemo(
    () => (initialSkillId ? skills.find((skill) => skill.id === initialSkillId) : undefined),
    [initialSkillId, skills],
  );
  const [chatBootstrap, setChatBootstrap] = useState<{
    sessionId: string;
    sessionKey: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setChatBootstrap(null);
      return;
    }
    const label = activeSkill?.name ?? '全部技能';
    const sessionId = createMainChatSession(`SKILL 对话：${label}`);
    setChatBootstrap({
      sessionId,
      sessionKey: `skill-chat-${sessionId}`,
    });
  }, [isOpen, activeSkill?.name, initialSkillId]);

  return (
    <FullscreenModal
      open={isOpen}
      title={'SKILL AI 对话'}
      onClose={onClose}
      footer={null}
      zIndex={1050}
      destroyOnHidden>
      <div className={styles['skill-ai-body']}>
        {isOpen && chatBootstrap ? (
          <SkillAiChat
            sessionKey={chatBootstrap.sessionKey}
            bootstrapSessionId={chatBootstrap.sessionId}
            skills={skills}
            activeSkillId={initialSkillId}
            aiModels={aiModels}
          />
        ) : null}
      </div>
    </FullscreenModal>
  );
}

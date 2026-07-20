import type { ISkill } from '@/types/modules';
import { AiChatView, type IAiChatServices } from '@momo/aichat';
import '@momo/markdown-styles';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AiChatShell } from '@renderer/components/Chat/AiChatShell';
import { useToast } from '@renderer/components/ui/Toast';
import { useAiChatViewTheme } from '@renderer/hooks/useAiChatViewTheme';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useLocalPathBinding } from '@renderer/hooks/useLocalPathBinding';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import { useStableModelResolver } from '@renderer/hooks/useStableModelResolver';
import { useStableRef } from '@renderer/hooks/useStableRef';
import { buildSharedAiChatServices, createSkillLangGraphStream } from '@renderer/services/aichat';
import { buildActiveSkillLine, buildSkillsSummary } from '@renderer/services/skill/chat-context';
import type { IAIModelConfig } from '@renderer/types/settings';
import { SkillChatSelectContext } from '../SkillChatSelectContext';
import { SkillChatToolbarExtra } from '../SkillChatToolbarExtra';
import styles from './index.module.less';

export interface IProps {
  /** 用于在弹窗打开时重置 ChatProvider */
  sessionKey: string;
  /** 绑定到 AI 对话历史的会话 id */
  bootstrapSessionId: string;
  /** 首条消息写入历史时使用的会话标题 */
  bootstrapSessionTitle?: string;
  /** 用户全部 SKILL（供 LangGraph 规划使用） */
  skills: ISkill[];
  /** 当前聚焦的 SKILL id */
  activeSkillId: string | null;
  aiModels: IAIModelConfig[];
}

export function SkillAiChat({
  sessionKey,
  bootstrapSessionId,
  bootstrapSessionTitle,
  skills,
  activeSkillId: initialActiveSkillId,
  aiModels,
}: IProps) {
  const { showToast } = useToast();
  const modelResolverRef = useStableModelResolver(aiModels);
  const chatModelOptionGroups = useRankedChatModelGroups(aiModels);
  const workspace = useChatWorkspaceBinding();
  const localPath = useLocalPathBinding();
  const chatTheme = useAiChatViewTheme();
  const [activeSkillId, setActiveSkillId] = useState<string | null>(initialActiveSkillId);

  useEffect(() => {
    setActiveSkillId(initialActiveSkillId);
  }, [initialActiveSkillId]);

  const activeSkill = useMemo(
    () => (activeSkillId ? skills.find((s) => s.id === activeSkillId) : undefined),
    [activeSkillId, skills],
  );

  const skillsSummary = useMemo(() => buildSkillsSummary(skills), [skills]);
  const activeSkillLine = useMemo(() => buildActiveSkillLine(activeSkill), [activeSkill]);
  const skillsSummaryRef = useStableRef(skillsSummary);
  const activeSkillLineRef = useStableRef(activeSkillLine);
  const activeSkillRef = useStableRef(activeSkill);
  const sessionIdRef = useStableRef(bootstrapSessionId);

  const handleNeedModel = useCallback(() => {
    showToast('请先在设置中配置并选择可用的对话模型', 'error');
  }, [showToast]);

  const handleSelectSkill = useCallback((skillId: string | null) => {
    setActiveSkillId(skillId);
  }, []);

  const skillSelectValue = useMemo(
    () => ({
      skills,
      selectedSkillId: activeSkillId,
      onSelect: handleSelectSkill,
    }),
    [activeSkillId, handleSelectSkill, skills],
  );

  const chatServices = useMemo(
    (): IAiChatServices =>
      buildSharedAiChatServices({
        aiModels,
        chatModelOptionGroups,
        workspace,
        localPath,
        noAttachmentsMessage: 'SKILL 对话暂不支持附件，已忽略文件',
        onNoAttachments: (msg) => showToast(msg, 'warning'),
        callAIChatStream: createSkillLangGraphStream({
          getModelConfig: (modelKey) => modelResolverRef.current.getModelConfig(modelKey),
          getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
          getSkillsSummary: () => skillsSummaryRef.current,
          getActiveSkillLine: () => activeSkillLineRef.current,
          getActiveSkill: () => activeSkillRef.current,
          onNeedModel: handleNeedModel,
          getSessionId: () => sessionIdRef.current,
        }),
        overrides: {
          renderInputToolbarLeftExtra: () => <SkillChatToolbarExtra />,
          skillBanner: activeSkill ? { name: activeSkill.name } : null,
        },
      }),
    [aiModels, chatModelOptionGroups, handleNeedModel, localPath, showToast, workspace, activeSkill],
  );

  return (
    <SkillChatSelectContext.Provider value={skillSelectValue}>
      <AiChatShell
        sessionKey={sessionKey}
        bootstrapSessionId={bootstrapSessionId}
        bootstrapSessionTitle={bootstrapSessionTitle}
        services={chatServices}
        className={styles['skill-ai-chat']}>
        <div className={styles['skill-ai-chat-main']}>
          <AiChatView
            {...chatTheme}
            hideWelcome
            placeholder={
              activeSkill
                ? `描述要完成的任务，将按「${activeSkill.name}」技能指令执行…`
                : '描述你的目标或问题，将结合您的 SKILL 进行规划与回答…'
            }
          />
        </div>
      </AiChatShell>
    </SkillChatSelectContext.Provider>
  );
}

import type { ISkill } from '@/types/modules';
import { AiChatView, type IAiChatServices } from '@momo/aichat';
import '@momo/markdown-styles';
import { useCallback, useMemo } from 'react';

import { AiChatShell } from '@renderer/components/Chat/AiChatShell';
import { useToast } from '@renderer/components/ui/Toast';
import { useAiChatViewTheme } from '@renderer/hooks/useAiChatViewTheme';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import { useStableModelResolver } from '@renderer/hooks/useStableModelResolver';
import { useStableRef } from '@renderer/hooks/useStableRef';
import { buildSharedAiChatServices, createSkillLangGraphStream } from '@renderer/services/aichat';
import { buildActiveSkillLine, buildSkillsSummary } from '@renderer/services/skill/chat-context';
import type { IAIModelConfig } from '@renderer/types/settings';
import { SkillContextCard } from '../SkillContextCard';
import styles from './index.module.less';

export interface IProps {
  /** 用于在弹窗打开时重置 ChatProvider */
  sessionKey: string;
  /** 绑定到 AI 对话历史的会话 id */
  bootstrapSessionId: string;
  /** 用户全部 SKILL（供 LangGraph 规划使用） */
  skills: ISkill[];
  /** 当前聚焦的 SKILL id */
  activeSkillId: string | null;
  aiModels: IAIModelConfig[];
}

export function SkillAiChat({
  sessionKey,
  bootstrapSessionId,
  skills,
  activeSkillId,
  aiModels,
}: IProps) {
  const { showToast } = useToast();
  const modelResolverRef = useStableModelResolver(aiModels);
  const chatModelOptionGroups = useRankedChatModelGroups(aiModels);
  const workspace = useChatWorkspaceBinding();
  const chatTheme = useAiChatViewTheme();

  const activeSkill = useMemo(
    () => (activeSkillId ? skills.find((s) => s.id === activeSkillId) : undefined),
    [activeSkillId, skills],
  );

  const skillsSummary = useMemo(() => buildSkillsSummary(skills), [skills]);
  const activeSkillLine = useMemo(() => buildActiveSkillLine(activeSkill), [activeSkill]);
  const skillsSummaryRef = useStableRef(skillsSummary);
  const activeSkillLineRef = useStableRef(activeSkillLine);
  const activeSkillRef = useStableRef(activeSkill);

  const handleNeedModel = useCallback(() => {
    showToast('请先在设置中配置并选择可用的对话模型', 'error');
  }, [showToast]);

  const chatServices = useMemo(
    (): IAiChatServices =>
      buildSharedAiChatServices({
        aiModels,
        chatModelOptionGroups,
        workspace,
        noAttachmentsMessage: 'SKILL 对话暂不支持附件，已忽略文件',
        onNoAttachments: (msg) => showToast(msg, 'warning'),
        callAIChatStream: createSkillLangGraphStream({
          getModelConfig: (modelKey) => modelResolverRef.current.getModelConfig(modelKey),
          getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
          getSkillsSummary: () => skillsSummaryRef.current,
          getActiveSkillLine: () => activeSkillLineRef.current,
          getActiveSkill: () => activeSkillRef.current,
          onNeedModel: handleNeedModel,
        }),
      }),
    [aiModels, chatModelOptionGroups, handleNeedModel, showToast, workspace],
  );

  return (
    <AiChatShell
      sessionKey={sessionKey}
      bootstrapSessionId={bootstrapSessionId}
      services={chatServices}
      className={styles['skill-ai-chat']}>
      <div className={styles['skill-ai-chat-context']}>
        {activeSkill ? <SkillContextCard skill={activeSkill} /> : null}
        <p className={styles['skill-ai-chat-hint']}>
          {activeSkill
            ? '将按当前 SKILL 完整指令执行：可写入仓库文件，并在检测到脚本时自动运行本地仓库命令'
            : '将结合您的全部 SKILL 进行规划与回答；选中具体技能后可按指令执行并产出文件'}
        </p>
      </div>
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
  );
}

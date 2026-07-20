import { ChatProvider, useChatContext } from '@momo/aichat';

import '@momo/markdown-styles';

import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react';

import {
  SkillChatSelectContext,
} from '@renderer/components/Skill/SkillChatSelectContext';
import { SkillChatToolbarExtra } from '@renderer/components/Skill/SkillChatToolbarExtra';
import { useToast } from '@renderer/components/ui/Toast';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useLocalPathBinding } from '@renderer/hooks/useLocalPathBinding';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import { useStableModelResolver } from '@renderer/hooks/useStableModelResolver';
import { useStableRef } from '@renderer/hooks/useStableRef';
import {
  buildSharedAiChatServices,
  createSkillAwareChatStream,
} from '@renderer/services/aichat';
import { buildActiveSkillLine, buildSkillsSummary } from '@renderer/services/skill/chat-context';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import { ChatErrorBoundary } from '../ChatErrorBoundary';
import { ChatActiveProjectBridge } from '../ChatActiveProjectBridge';

interface IProps {
  children: ReactNode;
}

/** 把当前会话 id 同步给技能执行链路（会话工作区） */
function ChatSessionIdBridge({
  sessionIdRef,
}: {
  sessionIdRef: MutableRefObject<string | null>;
}) {
  const { currentSessionId } = useChatContext();
  useEffect(() => {
    sessionIdRef.current = currentSessionId;
  }, [currentSessionId, sessionIdRef]);
  return null;
}

/** AI 对话全局 Provider：始终挂载，避免切换模块时 Context 丢失导致白屏 */
export function ChatModuleProvider({ children }: IProps) {
  const { showToast } = useToast();
  const aiModels = useSettingsStore((s) => s.aiModels);
  const skills = useSkillStore((s) => s.skills);
  const loadSkills = useSkillStore((s) => s.loadSkills);
  const modelResolverRef = useStableModelResolver(aiModels);
  const chatModelOptionGroups = useRankedChatModelGroups(aiModels);
  const workspace = useChatWorkspaceBinding();
  const localPath = useLocalPathBinding();
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    void loadSkills();
  }, [loadSkills]);

  const activeSkill = useMemo(
    () => (activeSkillId ? skills.find((skill) => skill.id === activeSkillId) : undefined),
    [activeSkillId, skills],
  );

  const skillsSummary = useMemo(() => buildSkillsSummary(skills), [skills]);
  const activeSkillLine = useMemo(() => buildActiveSkillLine(activeSkill), [activeSkill]);
  const skillsSummaryRef = useStableRef(skillsSummary);
  const activeSkillLineRef = useStableRef(activeSkillLine);
  const activeSkillRef = useStableRef(activeSkill);
  const activeSkillIdRef = useStableRef(activeSkillId);

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
    () =>
      buildSharedAiChatServices({
        aiModels,
        chatModelOptionGroups,
        workspace,
        localPath,
        storageKeyPrefix: 'skill-platform-ai-chat',
        callAIChatStream: createSkillAwareChatStream({
          getActiveSkillId: () => activeSkillIdRef.current,
          general: {
            getModelConfig: (modelKey) => modelResolverRef.current.getModelConfig(modelKey),
            getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
            onNeedModel: () => showToast('请先在设置中配置 AI 对话模型', 'error'),
          },
          skill: {
            getModelConfig: (modelKey) => modelResolverRef.current.getModelConfig(modelKey),
            getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
            getSkillsSummary: () => skillsSummaryRef.current,
            getActiveSkillLine: () => activeSkillLineRef.current,
            getActiveSkill: () => activeSkillRef.current,
            onNeedModel: () => showToast('请先在设置中配置 AI 对话模型', 'error'),
            getSessionId: () => sessionIdRef.current,
          },
        }),
        overrides: {
          renderInputToolbarLeftExtra: () => <SkillChatToolbarExtra />,
          skillBanner: activeSkill ? { name: activeSkill.name } : null,
        },
      }),
    [aiModels, chatModelOptionGroups, localPath, modelResolverRef, showToast, workspace, activeSkill],
  );

  return (
    <ChatErrorBoundary>
      <SkillChatSelectContext.Provider value={skillSelectValue}>
        <ChatProvider services={chatServices}>
          <ChatSessionIdBridge sessionIdRef={sessionIdRef} />
          <ChatActiveProjectBridge />
          {children}
        </ChatProvider>
      </SkillChatSelectContext.Provider>
    </ChatErrorBoundary>
  );
}

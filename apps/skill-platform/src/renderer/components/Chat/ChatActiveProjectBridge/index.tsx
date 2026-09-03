import { useChatContext } from '@momo/aichat';
import { useEffect } from 'react';

import { useChatProjectStore } from '@renderer/store/chat';

/** 将当前会话所属项目的文件夹与 Agent 同步到运行时状态；仅在有无归属会话时补建「自由对话」 */
export function ChatActiveProjectBridge() {
  const { currentSession, currentSessionId, sessions, assignMissingProjectIds } = useChatContext();
  const projects = useChatProjectStore((s) => s.projects);
  const setActiveFolderPaths = useChatProjectStore((s) => s.setActiveFolderPaths);
  const setActiveAgentAppId = useChatProjectStore((s) => s.setActiveAgentAppId);
  const ensureUncategorizedProject = useChatProjectStore((s) => s.ensureUncategorizedProject);

  useEffect(() => {
    const hasMissing = sessions.some((session) => !session.projectId);
    if (!hasMissing) {
      return;
    }
    const uncategorizedId = ensureUncategorizedProject();
    assignMissingProjectIds(uncategorizedId);
  }, [assignMissingProjectIds, ensureUncategorizedProject, sessions]);

  useEffect(() => {
    const session = currentSession ?? sessions.find((item) => item.id === currentSessionId) ?? null;
    const project = session?.projectId
      ? projects.find((item) => item.id === session.projectId)
      : undefined;
    setActiveFolderPaths(project?.folderPaths ?? []);
    setActiveAgentAppId(project?.agentAppId ?? null);
  }, [
    currentSession,
    currentSessionId,
    projects,
    sessions,
    setActiveAgentAppId,
    setActiveFolderPaths,
  ]);

  return null;
}

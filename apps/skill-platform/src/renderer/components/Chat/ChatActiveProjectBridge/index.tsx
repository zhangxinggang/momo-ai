import { useChatContext } from '@momo/aichat';
import { useEffect } from 'react';

import { useChatProjectStore } from '@renderer/store/chat';

/** 将当前会话所属项目的文件夹与 Agent 同步到运行时状态；仅在有无归属会话时补建「自由对话」 */
export function ChatActiveProjectBridge() {
  const { currentProjectId, sessions, assignMissingProjectIds } = useChatContext();
  const projects = useChatProjectStore((s) => s.projects);
  const setActiveFolderPaths = useChatProjectStore((s) => s.setActiveFolderPaths);
  const setActiveAgentAppIds = useChatProjectStore((s) => s.setActiveAgentAppIds);
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
    const project = projects.find((item) => item.id === currentProjectId);
    setActiveFolderPaths(project?.folderPaths ?? []);
    setActiveAgentAppIds(project?.agentAppIds ?? []);
  }, [currentProjectId, projects, setActiveAgentAppIds, setActiveFolderPaths]);

  return null;
}

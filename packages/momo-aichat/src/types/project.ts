/** AI 对话侧栏项目（工作区一级节点） */
export interface IChatProject {
  id: string;
  name: string;
  folderPaths: string[];
  /** 绑定的 Agent 应用，对应技能平台 id；未选则为 null */
  agentAppId: string | null;
  createdAt: number;
  updatedAt: number;
}

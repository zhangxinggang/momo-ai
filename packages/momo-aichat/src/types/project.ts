/** AI 对话侧栏项目（工作区一级节点） */
export interface IChatProject {
  id: string;
  name: string;
  folderPaths: string[];
  /** 绑定的 Agent 应用；空数组表示全部取消。 */
  agentAppIds: string[];
  /** 旧版单选项目兼容字段。 */
  agentAppId?: string | null;
  createdAt: number;
  updatedAt: number;
}

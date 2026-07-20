/** AI 对话侧栏项目（工作区一级节点） */
export interface IChatProject {
  id: string;
  name: string;
  folderPaths: string[];
  createdAt: number;
  updatedAt: number;
}

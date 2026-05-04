import type { IAIModelConfig } from '@renderer/types/settings';

type GetAiModels = () => IAIModelConfig[];

let getAiModels: GetAiModels | null = null;

/** 注入知识库服务所需的 AI 模型列表读取方式（通常在 App 启动时注册） */
export function configureKbService(resolveAiModels: GetAiModels): void {
  getAiModels = resolveAiModels;
}

/** 获取当前已注册的 AI 模型列表 */
export function getKbAiModels(): IAIModelConfig[] {
  if (!getAiModels) {
    throw new Error('知识库服务未初始化，请先调用 configureKbService');
  }
  return getAiModels();
}

/** 是否已完成知识库服务初始化 */
export function isKbServiceConfigured(): boolean {
  return getAiModels != null;
}

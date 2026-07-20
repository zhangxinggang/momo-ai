import { buildStorageKeys } from '@momo/aichat';

import { MAIN_AI_CHAT_STORAGE_PREFIX } from '@renderer/services/aichat/chat-history-bridge';
import { useChatProjectStore } from '@renderer/store/chat';

export interface IWorkflowNodeDefaultValues {
  executionModel: string;
  kbCollectionId?: number;
  workspacePaths: string[];
}

/** 读取当前 AI 对话中的模型、知识库与工作区，作为工作流节点默认值 */
export function readWorkflowNodeDefaultValues(): IWorkflowNodeDefaultValues {
  const keys = buildStorageKeys(MAIN_AI_CHAT_STORAGE_PREFIX);
  let executionModel = '';
  let kbCollectionId: number | undefined;
  let workspacePaths: string[] = [];

  try {
    const model = localStorage.getItem(keys.CURRENT_MODEL);
    if (model?.trim()) {
      executionModel = model.trim();
    }
    const advancedRaw = localStorage.getItem(keys.ADVANCED_SETTINGS);
    if (advancedRaw) {
      const advanced = JSON.parse(advancedRaw) as { kbCollectionId?: number };
      if (typeof advanced.kbCollectionId === 'number') {
        kbCollectionId = advanced.kbCollectionId;
      }
    }
    workspacePaths = [...useChatProjectStore.getState().activeFolderPaths];
  } catch {
    // 忽略解析失败
  }

  return { executionModel, kbCollectionId, workspacePaths };
}

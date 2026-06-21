import { exportPrompts, importPrompts, isIoApiAvailable } from '@renderer/services/io/api';
import { useFolderStore, usePromptStore } from '@renderer/store';
import { useCallback, useState } from 'react';

export function usePromptBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportAllPrompts = useCallback(async () => {
    if (!isIoApiAvailable()) {
      throw new Error('当前环境不支持提示词导出');
    }

    setIsExporting(true);
    try {
      const prompts = usePromptStore.getState().prompts;
      return await exportPrompts(prompts.map((prompt) => prompt.id));
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importPromptBackup = useCallback(async () => {
    if (!isIoApiAvailable()) {
      throw new Error('当前环境不支持提示词导入');
    }

    setIsImporting(true);
    try {
      const result = await importPrompts();
      if (!result.canceled) {
        await useFolderStore.getState().fetchFolders();
        await usePromptStore.getState().fetchPrompts();
        await usePromptStore.getState().refreshTree();
      }
      return result;
    } finally {
      setIsImporting(false);
    }
  }, []);

  return {
    isExporting,
    isImporting,
    exportAllPrompts,
    importPromptBackup,
  };
}

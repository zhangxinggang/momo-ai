import { AiTestModal } from '@renderer/components/Prompt/AiTestModal';
import { EditPromptModal } from '@renderer/components/Prompt/EditPromptModal';
import { CenteredLoading } from '@renderer/components/ui/CenteredLoading';
import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import { useFolderStore, usePromptStore } from '@renderer/store';
import { FileTextIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';

export function PromptManager() {
  const editorMode = usePromptStore((state) => state.editorMode);
  const selectedId = usePromptStore((state) => state.selectedId);
  const prompts = usePromptStore((state) => state.prompts);
  const fetchPrompts = usePromptStore((state) => state.fetchPrompts);
  const fetchFolders = useFolderStore((state) => state.fetchFolders);
  const isLoading = usePromptStore((state) => state.isLoading);
  const refreshTree = usePromptStore((state) => state.refreshTree);
  const openEditEditor = usePromptStore((state) => state.openEditEditor);
  const folders = useFolderStore((state) => state.folders);

  const [isAiTestOpen, setIsAiTestOpen] = useState(false);

  useEffect(() => {
    void fetchPrompts();
    void fetchFolders();
  }, [fetchFolders, fetchPrompts]);

  useEffect(() => {
    refreshTree();
  }, [folders, prompts, refreshTree]);

  const activePrompt = useMemo(() => {
    if (editorMode === 'create') {
      return null;
    }
    return prompts.find((p) => p.id === selectedId) ?? null;
  }, [editorMode, prompts, selectedId]);

  const showEditor = editorMode === 'create' || Boolean(activePrompt);

  const handleSaved = useCallback(
    (promptId: string) => {
      openEditEditor(promptId);
    },
    [openEditEditor],
  );

  const handleAiTest = useCallback(() => {
    setIsAiTestOpen(true);
  }, []);

  return (
    <div className={styles.prompt}>
      {isLoading && prompts.length === 0 ? <CenteredLoading label='加载提示词…' /> : null}
      <div className={styles['prompt-editor']}>
        {showEditor ? (
          <div className={styles['prompt-editor-shell']}>
            <EditPromptModal
              variant='panel'
              isOpen
              prompt={activePrompt}
              onClose={() => {}}
              onSaved={handleSaved}
              onAiTest={handleAiTest}
            />
          </div>
        ) : (
          <ModuleEmptyState
            centered
            icon={FileTextIcon}
            title='在左侧选择或新建提示词'
            description='从侧栏目录选择已有提示词，或新建目录与提示词开始编辑'
          />
        )}
      </div>
      <AiTestModal
        isOpen={isAiTestOpen}
        onClose={() => setIsAiTestOpen(false)}
        prompt={activePrompt}
      />
    </div>
  );
}

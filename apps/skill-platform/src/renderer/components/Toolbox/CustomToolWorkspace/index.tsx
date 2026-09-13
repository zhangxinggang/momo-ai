import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import { writeCustomToolFile } from '@renderer/services/custom-tool/api';
import { cancelCustomToolGeneration } from '@renderer/services/custom-tool/generation-task';
import {
  getCustomToolDisplayName,
  hasToolHtmlContent,
  useCustomToolStore,
} from '@renderer/store/custom-tool';
import { App, Button } from 'antd';
import { WrenchIcon } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { CustomToolAiComposer } from '../CustomToolAiComposer';
import { CustomToolPreview } from '../CustomToolPreview';
import { CustomToolStreamingPreview } from '../CustomToolStreamingPreview';
import { SnapEditFrame, type ISnapEditFrameHandle } from '../SnapEditFrame';
import styles from './index.module.less';

/** 自定义工具：查看结果 HTML / 编辑（snapEdit + 复用 AI 对话框） */
export function CustomToolWorkspace() {
  const { message } = App.useApp();
  const selectedId = useCustomToolStore((state) => state.selectedId);
  const editorContent = useCustomToolStore((state) => state.editorContent);
  const savedContent = useCustomToolStore((state) => state.savedContent);
  const isEditing = useCustomToolStore((state) => state.isEditing);
  const isLoadingFile = useCustomToolStore((state) => state.isLoadingFile);
  const isSaving = useCustomToolStore((state) => state.isSaving);
  const isLoadingRuntime = useCustomToolStore((state) => state.isLoadingRuntime);
  const runtimeInfo = useCustomToolStore((state) => state.runtimeInfo);
  const runtimeError = useCustomToolStore((state) => state.runtimeError);
  const previewRevision = useCustomToolStore((state) => state.previewRevision);
  const generationTask = useCustomToolStore((state) =>
    selectedId ? state.generationTasks[selectedId] : undefined,
  );
  const enterEditMode = useCustomToolStore((state) => state.enterEditMode);
  const exitEditMode = useCustomToolStore((state) => state.exitEditMode);
  const setEditorContent = useCustomToolStore((state) => state.setEditorContent);

  const snapEditRef = useRef<ISnapEditFrameHandle>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const hasHtml = hasToolHtmlContent(editorContent);
  const isGenerating = generationTask?.status === 'generating';
  const displayName = getCustomToolDisplayName(selectedId);
  const isDirty = editorContent !== savedContent;

  const getCurrentHtml = useCallback(async () => {
    if (hasHtml && snapEditRef.current) {
      return snapEditRef.current.pullHtml();
    }
    return useCustomToolStore.getState().editorContent;
  }, [hasHtml]);

  const handleSave = useCallback(async () => {
    if (!selectedId) {
      return;
    }
    let contentToSave = editorContent;
    if (isEditing && snapEditRef.current && hasHtml) {
      contentToSave = await snapEditRef.current.pullHtml();
    }
    useCustomToolStore.setState({ isSaving: true, editorContent: contentToSave });
    try {
      await writeCustomToolFile(selectedId, contentToSave);
      useCustomToolStore.setState((state) => ({
        savedContent: contentToSave,
        previewRevision: state.previewRevision + 1,
      }));
      message.success('已保存');
      exitEditMode();
    } catch (err) {
      console.error('[CustomToolWorkspace] save failed:', err);
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      useCustomToolStore.setState({ isSaving: false });
    }
  }, [editorContent, exitEditMode, hasHtml, isEditing, message, selectedId]);

  const handleExitEdit = useCallback(() => {
    if (!selectedId || !isGenerating) {
      exitEditMode();
      return;
    }
    void (async () => {
      setIsCanceling(true);
      try {
        await cancelCustomToolGeneration(selectedId, { rollback: true, clearTask: true });
        exitEditMode();
      } catch (error) {
        message.error(error instanceof Error ? error.message : '取消生成并回滚失败');
      } finally {
        setIsCanceling(false);
      }
    })();
  }, [exitEditMode, isGenerating, message, selectedId]);

  if (!selectedId) {
    return null;
  }

  if (isLoadingFile) {
    return (
      <div className={styles['custom-tool-workspace']}>
        <ModuleEmptyState centered icon={WrenchIcon} title='加载中' description='正在读取工具' />
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className={styles['custom-tool-workspace']}>
        <div className={styles['custom-tool-workspace-header']}>
          <div className={styles['custom-tool-workspace-title']}>{displayName}</div>
          <Button type='primary' onClick={enterEditMode}>
            {'编辑'}
          </Button>
        </div>
        <div className={styles['custom-tool-workspace-body']}>
          {hasHtml ? (
            <CustomToolPreview
              title={displayName}
              fallbackHtml={editorContent}
              runtimeInfo={runtimeInfo}
              runtimeError={runtimeError}
              revision={previewRevision}
              loading={isLoadingRuntime}
            />
          ) : (
            <ModuleEmptyState
              centered
              icon={WrenchIcon}
              title='暂无工具'
              description='点击右上角编辑，用 AI 生成 HTML'
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles['custom-tool-workspace']}>
      <div className={styles['custom-tool-workspace-header']}>
        <div className={styles['custom-tool-workspace-title']}>
          {displayName}
          {isDirty ? (
            <span className={styles['custom-tool-workspace-dirty']}>{'未保存'}</span>
          ) : null}
        </div>
        <div className={styles['custom-tool-workspace-actions']}>
          <Button loading={isCanceling} onClick={handleExitEdit}>
            {'退出编辑'}
          </Button>
          <Button
            type='primary'
            loading={isSaving}
            disabled={isGenerating || isCanceling}
            onClick={() => void handleSave()}>
            {'保存'}
          </Button>
        </div>
      </div>

      <div className={styles['custom-tool-workspace-editor']}>
        {isGenerating ? (
          <div className={styles['custom-tool-workspace-stream']}>
            <div className={styles['custom-tool-workspace-stream-badge']}>
              <span />
              {'HTML 实时生成中'}
            </div>
            <CustomToolStreamingPreview
              className={styles['custom-tool-workspace-preview']}
              title={`${displayName} 实时预览`}
              html={editorContent}
            />
          </div>
        ) : hasHtml ? (
          <SnapEditFrame
            ref={snapEditRef}
            html={editorContent}
            fileName={`${displayName}.html`}
            onChange={setEditorContent}
          />
        ) : (
          <div className={styles['custom-tool-workspace-guide']}>
            <h3>{'描述你想做的工具'}</h3>
            <p>{'在下方 AI 对话框输入需求，生成后可继续迭代改写。'}</p>
          </div>
        )}
      </div>

      <CustomToolAiComposer
        key={selectedId}
        toolKey={selectedId}
        hasHtml={hasHtml}
        getCurrentHtml={getCurrentHtml}
      />
    </div>
  );
}

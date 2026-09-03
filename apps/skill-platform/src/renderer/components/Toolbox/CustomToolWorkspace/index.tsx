import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import { writeCustomToolFile } from '@renderer/services/custom-tool/api';
import {
  getCustomToolDisplayName,
  hasToolHtmlContent,
  useCustomToolStore,
} from '@renderer/store/custom-tool';
import { App, Button } from 'antd';
import { WrenchIcon } from 'lucide-react';
import { useCallback, useRef } from 'react';

import { CustomToolAiComposer } from '../CustomToolAiComposer';
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
  const enterEditMode = useCustomToolStore((state) => state.enterEditMode);
  const exitEditMode = useCustomToolStore((state) => state.exitEditMode);

  const snapEditRef = useRef<ISnapEditFrameHandle>(null);

  const hasHtml = hasToolHtmlContent(editorContent);
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
      useCustomToolStore.setState({ savedContent: contentToSave });
      message.success('已保存');
      exitEditMode();
    } catch (err) {
      console.error('[CustomToolWorkspace] save failed:', err);
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      useCustomToolStore.setState({ isSaving: false });
    }
  }, [editorContent, exitEditMode, hasHtml, isEditing, message, selectedId]);

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
            <iframe
              className={styles['custom-tool-workspace-preview']}
              title={displayName}
              srcDoc={editorContent}
              sandbox='allow-scripts allow-same-origin allow-forms'
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
          <Button onClick={exitEditMode}>{'退出编辑'}</Button>
          <Button type='primary' loading={isSaving} onClick={() => void handleSave()}>
            {'保存'}
          </Button>
        </div>
      </div>

      <div className={styles['custom-tool-workspace-editor']}>
        {hasHtml ? (
          <SnapEditFrame ref={snapEditRef} html={editorContent} fileName={`${displayName}.html`} />
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

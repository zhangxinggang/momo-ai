import {
  FileEditor,
  normalizeRelativePath,
  useSyncedCodeEditorTheme,
  type IFileEditorHandle,
} from '@momo/file-editor';
import { useToast } from '@renderer/components/ui/Toast';
import { useFilePreviewBaseUrl } from '@renderer/hooks/useFilePreviewBaseUrl';
import { useUnsavedLeaveGuard } from '@renderer/hooks/useUnsavedLeaveGuard';
import { openPath } from '@renderer/services/desktop';
import { createSkillFileEditorAdapter } from '@renderer/services/file-editor/skill-adapter';
import { getSkillRepoPath } from '@renderer/services/skill/api';
import { Modal } from 'antd';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';

interface IProps {
  skillId: string;
  localPath?: string;
  /** 展示用技能名称，缺省时回退为 skillId */
  skillName?: string;
  isOpen: boolean;
  onClose?: () => void;
  onSave?: () => void | Promise<void>;
  /** modal：弹窗；inline：内嵌面板 */
  mode?: 'modal' | 'inline';
  onUnsavedChange?: (hasUnsaved: boolean) => void;
}

/** 父组件可调用的文件编辑器能力（保存/放弃未保存修改） */
export interface ISkillFileEditorHandle {
  saveUnsavedChanges: () => Promise<boolean>;
  discardUnsavedChanges: () => void;
}

/** 拼接仓库根目录与相对路径为系统绝对路径 */
function joinRepoAbsolutePath(repoRoot: string, relativePath: string): string {
  const separator = repoRoot.includes('\\') ? '\\' : '/';
  const normalizedRelative = normalizeRelativePath(relativePath).split('/').join(separator);
  const trimmedRoot = repoRoot.replace(/[/\\]+$/, '');
  return `${trimmedRoot}${separator}${normalizedRelative}`;
}

/**
 * 技能文件编辑器：基于 @momo/file-editor，支持内嵌与弹窗两种模式
 */
export const SkillFileEditor = forwardRef<ISkillFileEditorHandle, IProps>(function SkillFileEditor(
  { skillId, localPath, skillName, isOpen, onClose, onSave, mode = 'modal', onUnsavedChange },
  ref,
) {
  const { showToast } = useToast();
  const isInline = mode === 'inline';
  const isPathMode = Boolean(localPath);
  const editorRef = useRef<IFileEditorHandle>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const codeEditorTheme = useSyncedCodeEditorTheme();
  const filePreviewBaseUrl = useFilePreviewBaseUrl();

  const adapter = useMemo(
    () => createSkillFileEditorAdapter({ skillId, localPath }),
    [localPath, skillId],
  );

  const handleNotify = useCallback(
    (payload: { message: string; type: 'success' | 'error' }) => {
      showToast(payload.message, payload.type);
    },
    [showToast],
  );

  const handleFilesChange = useCallback(async () => {
    if (onSave) {
      await onSave();
    }
  }, [onSave]);

  const handleUnsavedChange = useCallback(
    (dirty: boolean) => {
      setHasUnsaved(dirty);
      onUnsavedChange?.(dirty);
    },
    [onUnsavedChange],
  );

  const handleBinaryPreviewUnSupport = useCallback(
    async (relativePath: string) => {
      let repoRoot = localPath?.trim() || '';
      if (!repoRoot) {
        repoRoot = (await getSkillRepoPath(skillId))?.trim() || '';
      }
      if (!repoRoot) {
        showToast('无法定位文件路径', 'error');
        return;
      }
      const absolutePath = joinRepoAbsolutePath(repoRoot, relativePath);
      const result = await openPath(absolutePath);
      if (result && !result.success) {
        showToast(result.error ?? '打开文件失败', 'error');
      }
    },
    [localPath, showToast, skillId],
  );

  const saveUnsavedChanges = useCallback(async () => {
    return editorRef.current?.saveCurrentFile() ?? true;
  }, []);

  const discardUnsavedChanges = useCallback(() => {
    editorRef.current?.discardChanges();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      saveUnsavedChanges,
      discardUnsavedChanges,
    }),
    [discardUnsavedChanges, saveUnsavedChanges],
  );

  const { confirmLeave, UnsavedLeaveDialog } = useUnsavedLeaveGuard({
    isDirty: () => hasUnsaved,
    onSave: saveUnsavedChanges,
    onDiscard: discardUnsavedChanges,
  });

  const runWithUnsavedChangesCheck = useCallback(
    (action: () => void) => {
      void (async () => {
        if (!hasUnsaved) {
          action();
          return;
        }
        const canLeave = await confirmLeave();
        if (canLeave) {
          action();
        }
      })();
    },
    [confirmLeave, hasUnsaved],
  );

  const editorPanel = (
    <FileEditor
      ref={editorRef}
      adapter={adapter}
      codeEditorTheme={codeEditorTheme}
      defaultNewFileExtension='md'
      filePreviewBaseUrl={filePreviewBaseUrl}
      onFilesChange={() => void handleFilesChange()}
      onNotify={handleNotify}
      onUnSupport={handleBinaryPreviewUnSupport}
      onUnsavedChange={handleUnsavedChange}
      treeTitle='文件'
    />
  );

  if (isInline) {
    return (
      <>
        {editorPanel}
        <UnsavedLeaveDialog />
      </>
    );
  }

  const handleModalClose = () => {
    runWithUnsavedChangesCheck(() => {
      onClose?.();
    });
  };

  const displayName =
    skillName ||
    (isPathMode
      ? localPath
      : skillId.length > 16
        ? `${skillId.slice(0, 8)}…${skillId.slice(-4)}`
        : skillId);

  return (
    <>
      <Modal
        destroyOnHidden={false}
        footer={null}
        onCancel={handleModalClose}
        open={isOpen}
        styles={{
          body: {
            padding: 0,
            height: 'min(88vh, 900px)',
            overflow: 'hidden',
          },
          mask: { backdropFilter: 'blur(4px)' },
        }}
        title={
          <div className='flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 pr-8'>
            <span className='text-base font-semibold'>{'文件编辑器'}</span>
            <span className='text-muted-foreground text-xs font-normal'>— {displayName}</span>
            {hasUnsaved ? (
              <span className='text-xs font-medium text-amber-500'>{'有未保存的更改'}</span>
            ) : null}
          </div>
        }
        width='min(1200px, 96vw)'
        zIndex={100}>
        <div
          className='app-wallpaper-panel-strong relative min-h-0 overflow-hidden'
          style={{ width: '100%', height: '100%' }}>
          {editorPanel}
        </div>
      </Modal>
      <UnsavedLeaveDialog />
    </>
  );
});

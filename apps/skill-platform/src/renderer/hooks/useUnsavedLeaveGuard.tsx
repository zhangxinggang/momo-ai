import { useCallback, useRef, useState } from 'react';

import { UnsavedChangesDialog } from '@renderer/components/ui/UnsavedChangesDialog';

export type EUnsavedLeaveResult = 'save' | 'discard' | 'cancel';

export interface IUseUnsavedLeaveGuardOptions {
  /** 是否有未保存更改 */
  isDirty: () => boolean;
  /** 保存操作，返回是否成功 */
  onSave: () => Promise<boolean>;
  /** 放弃更改后的清理 */
  onDiscard?: () => void;
}

/**
 * 离开页面前未保存提示（保存 / 不保存 / 取消）
 * 供工作流编辑、技能编辑等场景复用
 */
export function useUnsavedLeaveGuard(options: IUseUnsavedLeaveGuardOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [dialogOpen, setDialogOpen] = useState(false);
  const pendingResolveRef = useRef<((result: EUnsavedLeaveResult) => void) | null>(null);

  const confirmLeave = useCallback((): Promise<boolean> => {
    if (!optionsRef.current.isDirty()) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      pendingResolveRef.current = (result) => {
        resolve(result !== 'cancel');
      };
      setDialogOpen(true);
    });
  }, []);

  const handleClose = useCallback(() => {
    pendingResolveRef.current?.('cancel');
    pendingResolveRef.current = null;
    setDialogOpen(false);
  }, []);

  const handleDiscard = useCallback(() => {
    optionsRef.current.onDiscard?.();
    pendingResolveRef.current?.('discard');
    pendingResolveRef.current = null;
    setDialogOpen(false);
  }, []);

  const handleSave = useCallback(async () => {
    const ok = await optionsRef.current.onSave();
    if (!ok) {
      return;
    }
    pendingResolveRef.current?.('save');
    pendingResolveRef.current = null;
    setDialogOpen(false);
  }, []);

  const UnsavedLeaveDialog = useCallback(
    () => (
      <UnsavedChangesDialog
        isOpen={dialogOpen}
        onClose={handleClose}
        onDiscard={handleDiscard}
        onSave={() => void handleSave()}
      />
    ),
    [dialogOpen, handleClose, handleDiscard, handleSave],
  );

  return {
    confirmLeave,
    UnsavedLeaveDialog,
    isDialogOpen: dialogOpen,
  };
}

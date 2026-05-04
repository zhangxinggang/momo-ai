import { hasDuplicateSiblingName, type EMomoTreeNodeKind, type IMomoTreeNode } from '@momo/tree';
import { App, Input, Modal } from 'antd';
import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

interface ITreeRootCreateLabels {
  createFolderTitle: string;
  createNoteTitle: string;
  createNamePlaceholder: string;
  duplicateNameError: string;
  emptyNameError: string;
  confirm: string;
  cancel: string;
}

interface IUseTreeRootCreateOptions {
  treeData: IMomoTreeNode[];
  labels: ITreeRootCreateLabels;
  onCreateFolder: (name: string) => Promise<void>;
  onCreateItem: (name: string) => Promise<void>;
}

export function useTreeRootCreate({
  treeData,
  labels,
  onCreateFolder,
  onCreateItem,
}: IUseTreeRootCreateOptions) {
  const { message } = App.useApp();
  const [createKind, setCreateKind] = useState<EMomoTreeNodeKind | null>(null);
  const [createName, setCreateName] = useState('');

  const openCreateFolder = useCallback(() => {
    setCreateKind('folder');
    setCreateName('');
  }, []);

  const openCreateItem = useCallback(() => {
    setCreateKind('file');
    setCreateName('');
  }, []);

  const closeCreate = useCallback(() => {
    setCreateKind(null);
    setCreateName('');
  }, []);

  const submitCreate = useCallback(async () => {
    if (!createKind) {
      return;
    }
    const trimmed = createName.trim();
    if (!trimmed) {
      message.warning(labels.emptyNameError);
      return;
    }
    if (hasDuplicateSiblingName(treeData, null, trimmed, createKind)) {
      message.error(labels.duplicateNameError);
      return;
    }
    if (createKind === 'folder') {
      await onCreateFolder(trimmed);
    } else {
      await onCreateItem(trimmed);
    }
    closeCreate();
  }, [
    closeCreate,
    createKind,
    createName,
    labels.duplicateNameError,
    labels.emptyNameError,
    message,
    onCreateFolder,
    onCreateItem,
    treeData,
  ]);

  const createModal =
    createKind === null ? null : (
      <Modal
        title={createKind === 'folder' ? labels.createFolderTitle : labels.createNoteTitle}
        open
        onOk={() => void submitCreate()}
        onCancel={closeCreate}
        okText={labels.confirm}
        cancelText={labels.cancel}
        destroyOnHidden>
        <Input
          value={createName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCreateName(e.target.value)}
          placeholder={labels.createNamePlaceholder}
          onPressEnter={() => void submitCreate()}
        />
      </Modal>
    );

  return {
    openCreateFolder,
    openCreateItem,
    createModal,
  };
}

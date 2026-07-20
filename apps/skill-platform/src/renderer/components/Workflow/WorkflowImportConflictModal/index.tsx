import type {
  EWorkflowBackupConflictAction,
  IWorkflowBackupConflictItem,
  IWorkflowBackupResourceDecision,
} from '@/types/modules';
import { Button, Modal, Radio, Space, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import type { IProps } from './types';

const ACTION_OPTIONS: Array<{ label: string; value: EWorkflowBackupConflictAction }> = [
  { label: '跳过', value: 'skip' },
  { label: '覆盖', value: 'overwrite' },
  { label: '新建副本', value: 'createCopy' },
];

function conflictKey(item: IWorkflowBackupConflictItem): string {
  return `${item.kind}:${item.packageId}`;
}

function WorkflowImportConflictModal(props: IProps) {
  const { open, workflowName, conflicts, onCancel, onConfirm } = props;
  const [actionByKey, setActionByKey] = useState<Record<string, EWorkflowBackupConflictAction>>(
    {},
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const next: Record<string, EWorkflowBackupConflictAction> = {};
    for (const item of conflicts) {
      next[conflictKey(item)] = 'createCopy';
    }
    setActionByKey(next);
  }, [open, conflicts]);

  const applyAll = (action: EWorkflowBackupConflictAction) => {
    const next: Record<string, EWorkflowBackupConflictAction> = {};
    for (const item of conflicts) {
      next[conflictKey(item)] = action;
    }
    setActionByKey(next);
  };

  const decisions = useMemo<IWorkflowBackupResourceDecision[]>(() => {
    return conflicts.map((item) => ({
      kind: item.kind,
      packageId: item.packageId,
      action: actionByKey[conflictKey(item)] ?? 'createCopy',
    }));
  }, [actionByKey, conflicts]);

  return (
    <Modal
      open={open}
      title='导入工作流冲突'
      width={720}
      onCancel={onCancel}
      onOk={() => onConfirm(decisions)}
      okText='确认导入'
      cancelText='取消'
      destroyOnHidden>
      <p className='mb-3 text-sm'>
        工作流「{workflowName}」中有 {conflicts.length} 个资源与本机冲突，请选择处理方式。
      </p>
      <Space className='mb-3'>
        <Button size='small' onClick={() => applyAll('skip')}>
          全部跳过
        </Button>
        <Button size='small' onClick={() => applyAll('overwrite')}>
          全部覆盖
        </Button>
        <Button size='small' onClick={() => applyAll('createCopy')}>
          全部新建副本
        </Button>
      </Space>
      <Table
        size='small'
        pagination={false}
        rowKey={(row) => conflictKey(row)}
        dataSource={conflicts}
        columns={[
          {
            title: '类型',
            dataIndex: 'kind',
            width: 80,
            render: (kind: IWorkflowBackupConflictItem['kind']) =>
              kind === 'prompt' ? '提示词' : 'Skill',
          },
          {
            title: '包内名称',
            dataIndex: 'packageName',
            ellipsis: true,
          },
          {
            title: '本机名称',
            dataIndex: 'existingName',
            ellipsis: true,
          },
          {
            title: '原因',
            dataIndex: 'reason',
            width: 90,
            render: (reason: IWorkflowBackupConflictItem['reason']) =>
              reason === 'sameId' ? '同 ID' : '同名',
          },
          {
            title: '处理',
            key: 'action',
            width: 220,
            render: (_: unknown, row: IWorkflowBackupConflictItem) => (
              <Radio.Group
                size='small'
                optionType='button'
                options={ACTION_OPTIONS}
                value={actionByKey[conflictKey(row)] ?? 'createCopy'}
                onChange={(event) => {
                  const value = event.target.value as EWorkflowBackupConflictAction;
                  setActionByKey((prev) => ({ ...prev, [conflictKey(row)]: value }));
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  );
}

export default WorkflowImportConflictModal;

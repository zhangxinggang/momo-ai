import type { IWorkflow, IWorkflowBusiness } from '@/types/modules';
import {
  buildWorkflowSteps,
  parseWorkflowGraphJson,
  type IWorkflowResourceNodeData,
} from '@momo/workflow';
import type { Node } from '@xyflow/react';
import { App, Button, Input, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BriefcaseIcon, EyeIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { InlineEditableCell } from '@renderer/components/ui/InlineEditableCell';
import { WorkflowCreateBusinessModal } from '@renderer/components/Workflow/WorkflowCreateBusinessModal';
import { WorkflowStepsBar } from '@renderer/components/Workflow/WorkflowStepsBar';
import { deleteWorkflowBusinessAgentDir } from '@renderer/services/workflow/agent-files';
import { getWorkflow, isWorkflowAvailable } from '@renderer/services/workflow/api';
import {
  createBusiness,
  deleteBusiness,
  fetchBusinessList,
  isWorkflowBusinessPersistenceAvailable,
  updateBusiness,
} from '@renderer/services/workflow/business';
import { deleteWorkflowBusinessChats } from '@renderer/services/workflow/chat-storage';
import {
  buildMacroStepViewModels,
  type IMacroStepViewModel,
} from '@renderer/services/workflow/step-model';
import { useUIStore } from '@renderer/store';
import styles from './index.module.less';

interface IProps {
  workflowId: string;
}

/** 工作流业务列表：步骤预览 + 业务表格 */
export function WorkflowBusinessListView({ workflowId }: IProps) {
  const { message, modal } = App.useApp();
  const isWorkflowReady = isWorkflowAvailable();

  const businessListQuery = useUIStore((s) => s.businessListQuery);
  const setBusinessListQuery = useUIStore((s) => s.setBusinessListQuery);
  const openWorkflowBusinessWork = useUIStore((s) => s.openWorkflowBusinessWork);
  const workflowScreen = useUIStore((s) => s.workflowScreen);

  const [workflow, setWorkflow] = useState<IWorkflow | null>(null);
  const [businessList, setBusinessList] = useState<IWorkflowBusiness[]>([]);
  const [steps, setSteps] = useState<IMacroStepViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const buildStepsFromWorkflow = useCallback((found: IWorkflow) => {
    const { nodes, edges } = parseWorkflowGraphJson(found.graphJson);
    const built = buildWorkflowSteps(nodes, edges);
    if (!built.ok) {
      setSteps([]);
      return;
    }

    const nodeMap = new Map(
      nodes
        .filter((n) => {
          const d = n.data as IWorkflowResourceNodeData;
          return d?.resourceKind === 'prompt' || d?.resourceKind === 'skill';
        })
        .map((n) => [n.id, n as Node<IWorkflowResourceNodeData>]),
    );

    setSteps(buildMacroStepViewModels(built.steps, nodeMap));
  }, []);

  const reloadData = useCallback(async () => {
    if (!isWorkflowReady) {
      setWorkflow(null);
      setBusinessList([]);
      setSteps([]);
      return;
    }
    setIsLoading(true);
    try {
      const [found, list] = await Promise.all([
        getWorkflow(workflowId),
        fetchBusinessList(workflowId),
      ]);
      if (!found) {
        setWorkflow(null);
        setBusinessList([]);
        setSteps([]);
        message.error('工作流不存在或已被删除');
        return;
      }
      setWorkflow(found);
      setBusinessList(list);
      buildStepsFromWorkflow(found);
    } catch (e) {
      console.error(e);
      message.error('加载业务列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [buildStepsFromWorkflow, isWorkflowReady, message, workflowId]);

  useEffect(() => {
    void reloadData();
  }, [reloadData, workflowScreen, workflowId]);

  const filteredBusinessList = useMemo(() => {
    const q = businessListQuery.trim().toLowerCase();
    if (!q) {
      return businessList;
    }
    return businessList.filter(
      (item) => item.name.toLowerCase().includes(q) || item.remark.toLowerCase().includes(q),
    );
  }, [businessList, businessListQuery]);

  const handleCreateConfirm = useCallback(
    async (values: { name: string; remark: string }) => {
      if (!isWorkflowBusinessPersistenceAvailable()) {
        message.warning('当前环境不支持业务持久化（需桌面端 SQLite）');
        return;
      }
      const created = await createBusiness({
        workflowId,
        name: values.name,
        remark: values.remark,
      });
      if (!created) {
        message.error('创建业务失败');
        return;
      }
      setIsCreateModalOpen(false);
      await reloadData();
      message.success('业务已创建');
      openWorkflowBusinessWork(workflowId, created.id);
    },
    [message, openWorkflowBusinessWork, reloadData, workflowId],
  );

  const handleDeleteBusiness = useCallback(
    (business: IWorkflowBusiness) => {
      if (!isWorkflowBusinessPersistenceAvailable()) {
        message.warning('当前环境不支持业务持久化（需桌面端 SQLite）');
        return;
      }
      modal.confirm({
        title: '删除业务',
        content: `确定删除业务「${business.name}」？将同时删除产出目录与对话记录，此操作不可恢复。`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          try {
            if (workflow) {
              await deleteWorkflowBusinessAgentDir(workflow.name, business.id);
              deleteWorkflowBusinessChats(workflow.id, business.id, workflow.graphJson);
            }
            await deleteBusiness(business.id);
            await reloadData();
            message.success('业务已删除');
          } catch (e) {
            console.error(e);
            message.error('删除失败');
          }
        },
      });
    },
    [message, modal, reloadData, workflow],
  );

  const handleUpdateName = useCallback(
    async (business: IWorkflowBusiness, nextName: string) => {
      if (!nextName) {
        message.warning('名称不能为空');
        throw new Error('empty name');
      }
      const updated = await updateBusiness(business.id, { name: nextName });
      if (!updated) {
        message.error('更新名称失败');
        throw new Error('update failed');
      }
      setBusinessList((prev) => prev.map((item) => (item.id === business.id ? updated : item)));
      message.success('名称已更新');
    },
    [message],
  );

  const handleUpdateRemark = useCallback(
    async (business: IWorkflowBusiness, nextRemark: string) => {
      const updated = await updateBusiness(business.id, { remark: nextRemark });
      if (!updated) {
        message.error('更新备注失败');
        throw new Error('update failed');
      }
      setBusinessList((prev) => prev.map((item) => (item.id === business.id ? updated : item)));
      message.success('备注已更新');
    },
    [message],
  );

  const columns: ColumnsType<IWorkflowBusiness> = useMemo(
    () => [
      {
        title: '序号',
        key: 'index',
        width: 64,
        render: (_v, _r, index) => index + 1,
      },
      {
        title: '名称',
        key: 'name',
        ellipsis: true,
        render: (_, record) => (
          <InlineEditableCell
            onSave={(next) => handleUpdateName(record, next)}
            placeholder='未命名业务'
            value={record.name}
          />
        ),
      },
      {
        title: '备注',
        key: 'remark',
        ellipsis: true,
        render: (_, record) => (
          <InlineEditableCell
            onSave={(next) => handleUpdateRemark(record, next)}
            placeholder='—'
            value={record.remark}
          />
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (value: number) => (value ? new Date(value).toLocaleString() : '—'),
      },
      {
        title: '操作',
        key: 'actions',
        width: 140,
        render: (_, record) => (
          <div className='flex items-center gap-1'>
            <Button
              icon={<EyeIcon className='h-3.5 w-3.5' />}
              onClick={() => openWorkflowBusinessWork(workflowId, record.id)}
              size='small'
              type='text'>
              {'查看'}
            </Button>
            <Button
              danger
              disabled={!isWorkflowBusinessPersistenceAvailable()}
              icon={<Trash2Icon className='h-3.5 w-3.5' />}
              onClick={() => handleDeleteBusiness(record)}
              size='small'
              type='text'
            />
          </div>
        ),
      },
    ],
    [
      handleDeleteBusiness,
      handleUpdateName,
      handleUpdateRemark,
      openWorkflowBusinessWork,
      workflowId,
    ],
  );

  const hasBusinesses = businessList.length > 0;
  const isEmptyList = filteredBusinessList.length === 0 && !isLoading;

  return (
    <div className={styles['workflow-business-list']}>
      <div className={styles['workflow-business-list-header']}>
        {hasBusinesses ? (
          <div className={styles['workflow-business-list-search']}>
            <SearchIcon className={styles['workflow-business-list-search-icon']} />
            <Input
              allowClear
              className={styles['workflow-business-list-search-input']}
              onChange={(e) => setBusinessListQuery(e.target.value)}
              placeholder={'按名称或备注搜索业务'}
              value={businessListQuery}
              variant='borderless'
            />
          </div>
        ) : (
          <Typography.Text className={styles['workflow-business-list-title']} strong>
            {workflow?.name ?? '业务列表'}
          </Typography.Text>
        )}
        <Button
          className={styles['workflow-business-list-create-btn']}
          disabled={!isWorkflowBusinessPersistenceAvailable()}
          icon={<PlusIcon className='h-4 w-4' />}
          onClick={() => setIsCreateModalOpen(true)}
          type='primary'>
          {'新建业务'}
        </Button>
      </div>

      {steps.length > 0 ? (
        <div className={styles['workflow-business-list-steps']}>
          <WorkflowStepsBar mode='readonly' steps={steps} />
        </div>
      ) : null}

      <div className={styles['workflow-business-list-table-wrap']}>
        {isEmptyList ? (
          <div className={styles['workflow-business-list-empty']}>
            <div className={styles['workflow-business-list-empty-icon-wrap']}>
              <BriefcaseIcon className={styles['workflow-business-list-empty-icon']} />
            </div>
            <Typography.Text className={styles['workflow-business-list-empty-title']}>
              {businessListQuery.trim() ? '没有匹配的业务' : '暂无业务'}
            </Typography.Text>
            <Typography.Text
              className={styles['workflow-business-list-empty-desc']}
              type='secondary'>
              {businessListQuery.trim()
                ? '尝试调整搜索关键词'
                : !isWorkflowBusinessPersistenceAvailable()
                  ? '当前环境不支持业务管理（需桌面端）'
                  : '点击上方「新建业务」开始执行工作流'}
            </Typography.Text>
          </div>
        ) : (
          <Table<IWorkflowBusiness>
            columns={columns}
            dataSource={filteredBusinessList}
            loading={isLoading}
            pagination={{
              pageSize: 20,
              showSizeChanger: false,
              hideOnSinglePage: true,
            }}
            rowKey='id'
            size='middle'
          />
        )}
      </div>

      <WorkflowCreateBusinessModal
        onCancel={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateConfirm}
        open={isCreateModalOpen}
      />
    </div>
  );
}

import type { IWorkflow } from '@/types/modules';
import { App, Button, Input, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  GitBranchIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { WORKFLOW_RESOURCE_TAG_COLORS } from '@renderer/components/Workflow/constants';
import { isWebRuntime } from '@renderer/runtime';
import { deleteWorkflowAgentDir } from '@renderer/services/workflow/agent-files';
import { deleteAllWorkflowNodeChats } from '@renderer/services/workflow/chat-storage';
import {
  countWorkflowResourceNodes,
  getWorkflowNodeTags,
} from '@renderer/services/workflow/graph-utils';
import { useUIStore } from '@renderer/store';
import styles from './index.module.less';

/**
 * 工作流列表：索引、名称、节点标签、创建时间、操作
 */
export function WorkflowListView() {
  const { message, modal } = App.useApp();
  const web = isWebRuntime();
  const wfApi = window.api?.workflow;

  const workflowListQuery = useUIStore((s) => s.workflowListQuery);
  const setWorkflowListQuery = useUIStore((s) => s.setWorkflowListQuery);
  const openWorkflowStudio = useUIStore((s) => s.openWorkflowStudio);
  const openWorkflowWork = useUIStore((s) => s.openWorkflowWork);
  const workflowScreen = useUIStore((s) => s.workflowScreen);

  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reloadWorkflows = useCallback(async () => {
    if (!wfApi?.getAll) {
      setWorkflows([]);
      return;
    }
    setIsLoading(true);
    try {
      const list = await wfApi.getAll();
      setWorkflows(list);
    } catch (e) {
      console.error(e);
      message.error('加载工作流失败');
    } finally {
      setIsLoading(false);
    }
  }, [message, wfApi]);

  useEffect(() => {
    void reloadWorkflows();
  }, [reloadWorkflows, workflowScreen]);

  const filteredWorkflows = useMemo(() => {
    const q = workflowListQuery.trim().toLowerCase();
    if (!q) {
      return workflows;
    }
    return workflows.filter((w) => w.name.toLowerCase().includes(q));
  }, [workflowListQuery, workflows]);

  const handleNew = useCallback(() => {
    openWorkflowStudio(null);
  }, [openWorkflowStudio]);

  const handleDelete = useCallback(
    (workflow: IWorkflow) => {
      if (!wfApi?.delete) {
        message.warning('当前环境不支持工作流持久化（需桌面端 SQLite）');
        return;
      }
      modal.confirm({
        title: '删除工作流',
        content: `确定删除工作流「${workflow.name}」？将同时删除产出目录，此操作不可恢复。`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          try {
            await wfApi.delete(workflow.id);
            await deleteWorkflowAgentDir(workflow.name);
            deleteAllWorkflowNodeChats(workflow.id, workflow.graphJson);
            await reloadWorkflows();
            message.success('工作流已删除');
          } catch (e) {
            console.error(e);
            message.error('删除失败');
          }
        },
      });
    },
    [message, modal, reloadWorkflows, wfApi],
  );

  const columns: ColumnsType<IWorkflow> = useMemo(
    () => [
      {
        title: '索引',
        key: 'index',
        width: 64,
        render: (_v, _r, index) => index + 1,
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
      },
      {
        title: '节点',
        key: 'nodes',
        render: (_, record) => {
          const tags = getWorkflowNodeTags(record.graphJson);
          if (tags.length === 0) {
            return '—';
          }
          return (
            <div className={styles['workflow-list-tags']}>
              {tags.map((tag) => (
                <Tag
                  className={styles['workflow-list-tag']}
                  key={`${tag.resourceKind}-${tag.name}`}
                  style={{ background: WORKFLOW_RESOURCE_TAG_COLORS[tag.resourceKind] }}>
                  {tag.name}
                </Tag>
              ))}
            </div>
          );
        },
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
        width: 200,
        render: (_, record) => {
          const nodeCount = countWorkflowResourceNodes(record.graphJson);
          return (
            <div className='flex items-center gap-1'>
              {nodeCount > 0 ? (
                <Button
                  icon={<PlayIcon className='h-3.5 w-3.5' />}
                  onClick={() => openWorkflowWork(record.id)}
                  size='small'
                  type='text'>
                  {'工作'}
                </Button>
              ) : null}
              <Button
                icon={<PencilIcon className='h-3.5 w-3.5' />}
                onClick={() => openWorkflowStudio(record.id)}
                size='small'
                type='text'>
                {'编辑'}
              </Button>
              <Button
                danger
                disabled={web || !wfApi}
                icon={<Trash2Icon className='h-3.5 w-3.5' />}
                onClick={() => handleDelete(record)}
                size='small'
                type='text'
              />
            </div>
          );
        },
      },
    ],
    [handleDelete, openWorkflowStudio, openWorkflowWork, web, wfApi],
  );

  const hasWorkflows = workflows.length > 0;
  const isEmptyList = filteredWorkflows.length === 0 && !isLoading;

  return (
    <div className={styles['workflow-list']}>
      <div className={styles['workflow-list-header']}>
        {hasWorkflows ? (
          <div className={styles['workflow-list-search']}>
            <SearchIcon className={styles['workflow-list-search-icon']} />
            <Input
              allowClear
              className={styles['workflow-list-search-input']}
              onChange={(e) => setWorkflowListQuery(e.target.value)}
              placeholder={'按名称搜索工作流'}
              value={workflowListQuery}
              variant='borderless'
            />
          </div>
        ) : (
          <Typography.Text className={styles['workflow-list-header-title']} strong>
            {'工作流'}
          </Typography.Text>
        )}
        <Button
          className={styles['workflow-list-create-btn']}
          disabled={web || !wfApi}
          icon={<PlusIcon className='h-4 w-4' />}
          onClick={handleNew}
          type='primary'>
          {'新建工作流'}
        </Button>
      </div>
      <div className={styles['workflow-list-table-wrap']}>
        {isEmptyList ? (
          <div className={styles['workflow-list-empty']}>
            <div className={styles['workflow-list-empty-icon-wrap']}>
              <GitBranchIcon className={styles['workflow-list-empty-icon']} />
            </div>
            <Typography.Text className={styles['workflow-list-empty-title']}>
              {workflowListQuery.trim() ? '没有匹配的工作流' : '暂无工作流'}
            </Typography.Text>
            <Typography.Text className={styles['workflow-list-empty-desc']} type='secondary'>
              {workflowListQuery.trim()
                ? '尝试调整搜索关键词'
                : web || !wfApi
                  ? '当前环境不支持工作流（需桌面端）'
                  : '点击上方「新建工作流」开始编排提示词与技能节点'}
            </Typography.Text>
          </div>
        ) : (
          <Table<IWorkflow>
            columns={columns}
            dataSource={filteredWorkflows}
            loading={isLoading}
            onRow={(record) => ({
              onDoubleClick: () => openWorkflowStudio(record.id),
            })}
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
    </div>
  );
}

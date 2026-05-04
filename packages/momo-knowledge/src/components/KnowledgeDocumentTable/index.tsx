import { Table } from 'antd';

import type { EDocumentSegmentMode, IKnowledgeDocumentRecord } from '../../types';

export interface IProps {
  documents: IKnowledgeDocumentRecord[];
  loading?: boolean;
  onRowClick?: (doc: IKnowledgeDocumentRecord) => void;
  onSegmentSettings?: (doc: IKnowledgeDocumentRecord) => void;
  onDelete?: (doc: IKnowledgeDocumentRecord) => void;
}

/** 知识库文档分页列表 */
export function KnowledgeDocumentTable({
  documents,
  loading = false,
  onRowClick,
  onSegmentSettings,
  onDelete,
}: IProps) {
  const segmentModeLabel: Record<EDocumentSegmentMode, string> = {
    fixed: '固定',
    general: '通用',
  };

  return (
    <Table
      rowKey='id'
      loading={loading}
      dataSource={[...documents].sort((a, b) => b.uploadedAt - a.uploadedAt)}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
      })}
      columns={[
        { title: '名称', dataIndex: 'name', ellipsis: true },
        {
          title: '分段模式',
          dataIndex: 'segmentMode',
          render: (mode: EDocumentSegmentMode) => segmentModeLabel[mode] ?? mode,
        },
        {
          title: '上传时间',
          dataIndex: 'uploadedAt',
          render: (value: number) => new Date(value).toLocaleString(),
          defaultSortOrder: 'descend',
          sorter: (a, b) => b.uploadedAt - a.uploadedAt,
        },
        {
          title: '操作',
          key: 'actions',
          width: 160,
          render: (_: unknown, record: IKnowledgeDocumentRecord) => (
            <span className='flex gap-2' onClick={(e) => e.stopPropagation()}>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onSegmentSettings?.(record);
                }}>
                分段设置
              </button>
              {onDelete ? (
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record);
                  }}>
                  删除
                </button>
              ) : null}
            </span>
          ),
        },
      ]}
    />
  );
}

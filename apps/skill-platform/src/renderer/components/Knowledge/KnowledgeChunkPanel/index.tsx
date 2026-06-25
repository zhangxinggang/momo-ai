import type { IKbDocument } from '@/types/modules/kb';
import {
  kbDeleteChunks,
  kbListChunks,
  kbUpdateChunk,
  type IKbEmbeddingOptions,
} from '@renderer/services/kb';
import { App, Button, Input, Modal, Popconfirm, Table } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import styles from './index.module.less';

interface IProps {
  open: boolean;
  document: IKbDocument | null;
  onClose: () => void;
  kbEmbeddingOptions: IKbEmbeddingOptions;
  onRetryIngest?: (docId: number) => void;
}

/** 文档切块列表：分页、搜索、编辑、删除 */
export function KnowledgeChunkPanel({ open, document, onClose, onRetryIngest }: IProps) {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState<
    { chunkId: number; docId: number; idx: number; content: string }[]
  >([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const load = useCallback(async () => {
    if (!document?.docId) {
      return;
    }
    setLoading(true);
    try {
      const resp = await kbListChunks(document.docId, page, pageSize, keyword);
      setItems(resp.items);
      setTotal(resp.total);
    } catch (e: unknown) {
      message.error((e as Error)?.message || '加载切块失败');
    } finally {
      setLoading(false);
    }
  }, [document?.docId, keyword, message, page, pageSize]);

  useEffect(() => {
    if (open) {
      void load();
    }
  }, [load, open]);

  const handleSaveEdit = async () => {
    if (!editingId) {
      return;
    }
    try {
      await kbUpdateChunk(editingId, editingContent);
      message.success('已保存');
      setEditingId(null);
      await load();
    } catch (e: unknown) {
      message.error((e as Error)?.message || '保存失败');
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedRowKeys.length) {
      return;
    }
    try {
      await kbDeleteChunks(selectedRowKeys);
      message.success('已删除');
      setSelectedRowKeys([]);
      await load();
    } catch (e: unknown) {
      message.error((e as Error)?.message || '删除失败');
    }
  };

  return (
    <>
      <Modal
        open={open}
        title={document ? `切块 · ${document.filename}` : '切块'}
        width={920}
        onCancel={onClose}
        footer={null}
        destroyOnHidden>
        <div className={styles['kb-chunk-toolbar']}>
          <Input
            allowClear
            className={styles['kb-chunk-search-input']}
            placeholder='分段搜索'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              void load();
            }}
          />
          <Button onClick={() => void load()}>{'搜索'}</Button>
          {document?.status === 'error' && onRetryIngest ? (
            <Button type='primary' onClick={() => onRetryIngest(document.docId)}>
              {'重新入库'}
            </Button>
          ) : null}
          <Popconfirm title='确认批量删除所选切块？' onConfirm={() => void handleBatchDelete()}>
            <Button danger disabled={!selectedRowKeys.length}>
              {'批量删除'}
            </Button>
          </Popconfirm>
        </div>
        <div className={styles['kb-chunk-table']}>
          <Table
            rowKey='chunkId'
            loading={loading}
            dataSource={items}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys as number[]),
            }}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              onChange: (p, size) => {
                setPage(p);
                setPageSize(size);
              },
            }}
            columns={[
              { title: '序号', dataIndex: 'idx', width: 72 },
              {
                title: '内容',
                dataIndex: 'content',
                ellipsis: true,
                render: (text: string, record) => (
                  <Button
                    type='link'
                    size='small'
                    onClick={() => {
                      setEditingId(record.chunkId);
                      setEditingContent(text);
                    }}>
                    {text.slice(0, 80)}
                    {text.length > 80 ? '...' : ''}
                  </Button>
                ),
              },
              {
                title: '操作',
                width: 100,
                render: (_: unknown, record) => (
                  <Popconfirm
                    title='删除此切块？'
                    onConfirm={async () => {
                      await kbDeleteChunks([record.chunkId]);
                      await load();
                    }}>
                    <Button type='link' size='small' danger>
                      {'删除'}
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
          />
        </div>
      </Modal>

      <Modal
        open={editingId !== null}
        title='编辑切块'
        onCancel={() => setEditingId(null)}
        onOk={() => void handleSaveEdit()}
        okText='保存'
        cancelText='取消'
        width={720}
        destroyOnHidden>
        <Input.TextArea
          value={editingContent}
          onChange={(e) => setEditingContent(e.target.value)}
          autoSize={{ minRows: 12 }}
        />
      </Modal>
    </>
  );
}

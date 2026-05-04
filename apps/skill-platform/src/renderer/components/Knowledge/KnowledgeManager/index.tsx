import type { IKbDocument, IKbSearchItem } from '@/types/modules/kb';
import {
  KnowledgeDocumentTable,
  KnowledgeDocumentWizard,
  type EDocumentSegmentMode,
  type ISegmentSettings,
} from '@momo/knowledge';
import { KnowledgeChunkPanel } from '@renderer/components/Knowledge/KnowledgeChunkPanel';
import { KnowledgeSegmentSettingsModal } from '@renderer/components/Knowledge/KnowledgeSegmentSettingsModal';
import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import { isWebRuntime } from '@renderer/runtime';
import {
  kbDeleteDocument,
  kbGetDocumentProgress,
  kbIngestDocument,
  kbListCollections,
  kbListDocuments,
  kbPasteText,
  kbPreviewFileSegments,
  kbSearch,
  kbUploadFiles,
  type IKbEmbeddingOptions,
} from '@renderer/services/kb';
import { useKbStore, useSettingsStore } from '@renderer/store';
import { App, Button, Input, Modal, Spin, Table } from 'antd';
import {
  ClipboardPasteIcon,
  DatabaseIcon,
  FilePlusIcon,
  FileTextIcon,
  MonitorIcon,
  SearchIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.less';

function formatScoreClass(score: number): string {
  if (score >= 0.75) {
    return styles['kb-main-score--high'];
  }
  if (score >= 0.5) {
    return styles['kb-main-score--mid'];
  }
  return styles['kb-main-score--low'];
}

const KB_UPDATED_EVENT = 'kb:collections-updated';

/**
 * 知识库主内容区：当前库的文档管理与高级操作
 */
export function KnowledgeManager() {
  const { message } = App.useApp();
  const webRuntime = isWebRuntime();
  const activeCollectionId = useKbStore((s) => s.activeCollectionId);
  const setActiveCollectionId = useKbStore((s) => s.setActiveCollectionId);
  const aiModels = useSettingsStore((s) => s.aiModels);
  const scenarioModelDefaults = useSettingsStore((s) => s.scenarioModelDefaults);
  const kbEmbeddingOptions = useMemo<IKbEmbeddingOptions>(
    () => ({ aiModels, scenarioModelDefaults }),
    [aiModels, scenarioModelDefaults],
  );

  const [collectionName, setCollectionName] = useState('');
  const [docs, setDocs] = useState<IKbDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteFilename, setPasteFilename] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [pasteSubmitting, setPasteSubmitting] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IKbSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [chunkDoc, setChunkDoc] = useState<IKbDocument | null>(null);
  const [segmentDoc, setSegmentDoc] = useState<IKbDocument | null>(null);

  const progressTimersRef = useRef<Record<number, ReturnType<typeof setInterval>>>({});

  const stopProgressPolling = (docId: number) => {
    if (progressTimersRef.current[docId]) {
      clearInterval(progressTimersRef.current[docId]);
      delete progressTimersRef.current[docId];
    }
  };

  const refreshDocs = useCallback(
    async (collectionId: number) => {
      setDocsLoading(true);
      try {
        const items = await kbListDocuments(collectionId);
        setDocs(items);
      } catch (e: unknown) {
        const err = e as Error;
        if (!err?.message?.includes('404') && !err?.message?.includes('未找到集合')) {
          message.error(err?.message || '加载文档失败');
        }
        setDocs([]);
      } finally {
        setDocsLoading(false);
      }
    },
    [message],
  );

  const loadCollectionMeta = useCallback(async () => {
    if (!activeCollectionId) {
      setCollectionName('');
      setDocs([]);
      return;
    }
    try {
      const list = await kbListCollections();
      const found = list.find((c) => c.id === activeCollectionId);
      if (!found) {
        setCollectionName('');
        setDocs([]);
        setActiveCollectionId(list[0]?.id);
        return;
      }
      setCollectionName(found.name);
      await refreshDocs(activeCollectionId);
    } catch (e: unknown) {
      message.error((e as Error)?.message || '加载知识库失败');
    }
  }, [activeCollectionId, message, refreshDocs, setActiveCollectionId]);

  useEffect(() => {
    void loadCollectionMeta();
  }, [loadCollectionMeta]);

  useEffect(() => {
    const onUpdate = () => void loadCollectionMeta();
    window.addEventListener(KB_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(KB_UPDATED_EVENT, onUpdate);
  }, [loadCollectionMeta]);

  useEffect(() => {
    return () => {
      Object.values(progressTimersRef.current).forEach((timer) => clearInterval(timer));
    };
  }, []);

  const notifyUpdated = () => {
    window.dispatchEvent(new CustomEvent(KB_UPDATED_EVENT));
  };

  const startProgressPolling = (docId: number, collectionId: number) => {
    stopProgressPolling(docId);
    const poll = async () => {
      try {
        const doc = await kbGetDocumentProgress(docId);
        if (!doc) {
          return;
        }
        setDocs((items) =>
          items.map((d) =>
            d.docId === docId
              ? { ...d, status: doc.status, progress: doc.progress, error: doc.error }
              : d,
          ),
        );
        if (doc.status === 'ready' || doc.status === 'error') {
          stopProgressPolling(docId);
          await refreshDocs(collectionId);
        }
      } catch {
        // 轮询失败静默
      }
    };
    void poll();
    progressTimersRef.current[docId] = setInterval(() => void poll(), 1500);
  };

  const ingestUploaded = (
    docId: number,
    collectionId: number,
    fileLabel?: string,
    ingestOptions?: Parameters<typeof kbIngestDocument>[1],
  ) => {
    startProgressPolling(docId, collectionId);
    kbIngestDocument(docId, ingestOptions ?? kbEmbeddingOptions)
      .then(async () => {
        stopProgressPolling(docId);
        if (fileLabel) {
          message.success(`${fileLabel} 入库完成`);
        }
        await refreshDocs(collectionId);
        notifyUpdated();
      })
      .catch(async (err: Error) => {
        stopProgressPolling(docId);
        message.error(err?.message || '入库失败');
        await refreshDocs(collectionId);
        notifyUpdated();
      });
  };

  const uploadFilesToCollection = async (files: File[]) => {
    if (!activeCollectionId || !files.length) {
      return;
    }
    const valid = files.filter((f) => f.size > 0);
    if (valid.length < files.length) {
      message.warning('已忽略空文件');
    }
    if (!valid.length) {
      return;
    }
    try {
      setUploading(true);
      const items = await kbUploadFiles(activeCollectionId, valid);
      await refreshDocs(activeCollectionId);
      if (items.length === 1) {
        ingestUploaded(items[0].docId, activeCollectionId, valid[0].name);
        return;
      }
      if (items.length > 1) {
        items.forEach((it, idx) => {
          ingestUploaded(it.docId, activeCollectionId, valid[idx]?.name);
        });
      }
    } catch (e: unknown) {
      message.error((e as Error)?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleWizardUpload = async (
    files: File[],
    settings: ISegmentSettings,
    segmentMode: EDocumentSegmentMode,
  ) => {
    if (!activeCollectionId) {
      return;
    }
    setUploading(true);
    try {
      const items = await kbUploadFiles(activeCollectionId, files);
      await refreshDocs(activeCollectionId);
      for (const item of items) {
        ingestUploaded(item.docId, activeCollectionId, undefined, {
          segmentSettings: {
            separator: settings.separator,
            maxChunkLength: settings.maxChunkLength,
            chunkOverlap: settings.chunkOverlap,
            preprocess: settings.preprocess,
            splitMode: settings.splitMode,
          },
          segmentMode,
        });
      }
      notifyUpdated();
    } catch (e: unknown) {
      message.error((e as Error)?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const tableRecords = useMemo(
    () =>
      docs.map((doc) => ({
        id: doc.docId,
        name: doc.filename,
        segmentMode: (doc.segment_mode === 'fixed' ? 'fixed' : 'general') as EDocumentSegmentMode,
        uploadedAt: doc.created_at ? new Date(doc.created_at).getTime() : Date.now(),
      })),
    [docs],
  );

  const handleDeleteDoc = async (docId: number) => {
    if (!activeCollectionId) {
      return;
    }
    try {
      await kbDeleteDocument(docId);
      await refreshDocs(activeCollectionId);
      message.success('已删除文件');
      notifyUpdated();
    } catch (e: unknown) {
      message.error((e as Error)?.message || '删除失败');
    }
  };

  const handleRetryIngest = async (docId: number) => {
    if (!activeCollectionId) {
      return;
    }
    try {
      startProgressPolling(docId, activeCollectionId);
      await kbIngestDocument(docId, kbEmbeddingOptions);
      stopProgressPolling(docId);
      await refreshDocs(activeCollectionId);
      notifyUpdated();
    } catch (e: unknown) {
      stopProgressPolling(docId);
      message.error((e as Error)?.message || '入库失败');
    }
  };

  const confirmPaste = async () => {
    if (!activeCollectionId) {
      return;
    }
    const txt = pasteText.trim();
    if (!txt) {
      message.warning('请输入文本');
      return;
    }
    try {
      setPasteSubmitting(true);
      const { docId } = await kbPasteText(
        activeCollectionId,
        txt,
        pasteFilename.trim() || undefined,
      );
      setPasteOpen(false);
      setPasteText('');
      setPasteFilename('');
      await refreshDocs(activeCollectionId);
      startProgressPolling(docId, activeCollectionId);
      await kbIngestDocument(docId, kbEmbeddingOptions);
      stopProgressPolling(docId);
      await refreshDocs(activeCollectionId);
      notifyUpdated();
      message.success('文本已入库');
    } catch (e: unknown) {
      message.error((e as Error)?.message || '入库失败');
    } finally {
      setPasteSubmitting(false);
    }
  };

  const handleSearch = async () => {
    if (!activeCollectionId || !searchQuery.trim()) {
      message.warning('请输入搜索问题');
      return;
    }
    try {
      setSearchLoading(true);
      const results = await kbSearch(
        activeCollectionId,
        searchQuery.trim(),
        10,
        kbEmbeddingOptions,
      );
      setSearchResults(results);
    } catch (e: unknown) {
      message.error((e as Error)?.message || '搜索失败');
    } finally {
      setSearchLoading(false);
    }
  };

  if (webRuntime) {
    return (
      <div className={styles['kb-main']}>
        <div className={styles['kb-main-unavailable']}>
          <span className={styles['kb-main-unavailable-icon']}>
            <MonitorIcon size={28} aria-hidden />
          </span>
          <p className={styles['kb-main-empty-title']}>{'桌面客户端专属功能'}</p>
          <p className={styles['kb-main-empty-desc']}>
            {'知识库文档管理与向量检索请在 PromptHub 桌面版中使用'}
          </p>
        </div>
      </div>
    );
  }

  if (!activeCollectionId) {
    return (
      <div className={styles['kb-main']}>
        <ModuleEmptyState
          centered
          icon={DatabaseIcon}
          title='选择知识库'
          description='在左侧创建或选择一个知识库，即可上传文档并构建检索索引'
        />
      </div>
    );
  }

  const docCountLabel = docsLoading && docs.length === 0 ? '加载中…' : `共 ${docs.length} 个文档`;

  return (
    <div className={styles['kb-main']}>
      <div className={styles['kb-main-header']}>
        <div className={styles['kb-main-header-main']}>
          <span className={styles['kb-main-header-icon']} aria-hidden>
            <DatabaseIcon size={22} />
          </span>
          <div className={styles['kb-main-header-text']}>
            <h2 className={styles['kb-main-title']} title={collectionName}>
              {collectionName || '知识库'}
            </h2>
            <p className={styles['kb-main-meta']}>{docCountLabel}</p>
          </div>
        </div>
        <div className={styles['kb-main-toolbar']}>
          <Button
            className={`${styles['kb-main-toolbar-btn']} ${styles['kb-main-toolbar-btn--primary']}`}
            disabled={!activeCollectionId || uploading}
            onClick={() => setWizardOpen(true)}>
            {uploading ? <Spin size='small' /> : <FilePlusIcon size={16} aria-hidden />}
            {'添加文档'}
          </Button>
          <Button
            className={styles['kb-main-toolbar-btn']}
            onClick={() => {
              setPasteFilename('');
              setPasteText('');
              setPasteOpen(true);
            }}>
            <ClipboardPasteIcon size={16} aria-hidden />
            {'粘贴入库'}
          </Button>
          <Button
            className={styles['kb-main-toolbar-btn']}
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setSearchOpen(true);
            }}>
            <SearchIcon size={16} aria-hidden />
            {'搜索测试'}
          </Button>
        </div>
      </div>

      <div className={styles['kb-main-body']}>
        <div className={styles['kb-main-body-inner']}>
          {docsLoading ? (
            <div className={styles['kb-main-loading']}>
              <div className={styles['kb-main-loading-inner']}>
                <Spin size='large' />
                <p className={styles['kb-main-loading-text']}>{'加载文档…'}</p>
              </div>
            </div>
          ) : docs.length === 0 ? (
            <div className={styles['kb-main-body-empty']}>
              <ModuleEmptyState
                centered
                icon={FileTextIcon}
                title='暂无文档'
                description='上传 PDF、Word、Markdown 等文件，或粘贴文本开始构建知识库'
              />
              <Button
                className={`${styles['kb-main-toolbar-btn']} ${styles['kb-main-toolbar-btn--primary']}`}
                disabled={uploading}
                onClick={() => setWizardOpen(true)}>
                <FilePlusIcon size={16} aria-hidden />
                {'添加第一个文档'}
              </Button>
            </div>
          ) : (
            <div className={styles['kb-main-doc-table']}>
              <KnowledgeDocumentTable
                documents={tableRecords}
                loading={docsLoading}
                onRowClick={(record) => {
                  const doc = docs.find((d) => d.docId === record.id);
                  if (doc) {
                    setChunkDoc(doc);
                  }
                }}
                onSegmentSettings={(record) => {
                  const doc = docs.find((d) => d.docId === record.id);
                  if (doc) {
                    setSegmentDoc(doc);
                  }
                }}
                onDelete={(record) => void handleDeleteDoc(record.id)}
              />
            </div>
          )}
        </div>
      </div>

      <KnowledgeDocumentWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onUploadAndIngest={handleWizardUpload}
        onPreviewSegments={async (file, settings) =>
          kbPreviewFileSegments(
            file,
            {
              separator: settings.separator,
              maxChunkLength: settings.maxChunkLength,
              chunkOverlap: settings.chunkOverlap,
              preprocess: settings.preprocess,
              splitMode: settings.splitMode,
            },
            12,
            kbEmbeddingOptions,
          )
        }
      />

      <KnowledgeChunkPanel
        open={!!chunkDoc}
        document={chunkDoc}
        onClose={() => setChunkDoc(null)}
        kbEmbeddingOptions={kbEmbeddingOptions}
        onRetryIngest={(docId) => void handleRetryIngest(docId)}
      />

      <KnowledgeSegmentSettingsModal
        open={!!segmentDoc}
        document={segmentDoc}
        kbEmbeddingOptions={kbEmbeddingOptions}
        onClose={() => setSegmentDoc(null)}
        onDone={() => {
          if (activeCollectionId) {
            void refreshDocs(activeCollectionId);
          }
          notifyUpdated();
        }}
      />

      <Modal
        title={'粘贴文本入库'}
        open={pasteOpen}
        onCancel={() => setPasteOpen(false)}
        onOk={() => void confirmPaste()}
        okText={'入库'}
        cancelText={'取消'}
        confirmLoading={pasteSubmitting}
        width={720}
        destroyOnHidden>
        <Input
          placeholder={'可选文件名'}
          value={pasteFilename}
          onChange={(e) => setPasteFilename(e.target.value)}
          className={styles['kb-main-paste-filename']}
        />
        <Input.TextArea
          placeholder={'粘贴要入库的文本'}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          autoSize={{ minRows: 8 }}
        />
      </Modal>

      <Modal
        title={`搜索测试 · ${collectionName}`}
        open={searchOpen}
        onCancel={() => setSearchOpen(false)}
        footer={null}
        width={900}
        destroyOnHidden>
        <div className={styles['kb-main-search']}>
          <p className={styles['kb-main-search-hint']}>
            {'输入问题预览向量检索效果，分数越高表示相关性越强'}
          </p>
          <div className={styles['kb-main-search-bar']}>
            <Input
              placeholder={'例如：产品退款政策是什么？'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={() => void handleSearch()}
              allowClear
            />
            <Button
              type='primary'
              icon={<SearchIcon size={14} />}
              onClick={() => void handleSearch()}
              loading={searchLoading}>
              {'搜索'}
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className={styles['kb-main-search-results']}>
              <Table
                dataSource={searchResults}
                rowKey='chunkId'
                pagination={false}
                size='small'
                scroll={{ y: 400 }}
                columns={[
                  {
                    title: '#',
                    width: 48,
                    render: (_: unknown, __: unknown, idx: number) => idx + 1,
                  },
                  {
                    title: '文档',
                    dataIndex: 'docName',
                    width: 140,
                    ellipsis: true,
                  },
                  { title: '块', dataIndex: 'idx', width: 64 },
                  {
                    title: '预览',
                    dataIndex: 'content',
                    ellipsis: true,
                    render: (text: string) => text.slice(0, 80) + (text.length > 80 ? '...' : ''),
                  },
                  {
                    title: '分数',
                    dataIndex: 'score',
                    width: 88,
                    render: (v: number) => (
                      <span className={`${styles['kb-main-score']} ${formatScoreClass(v)}`}>
                        {v.toFixed(4)}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

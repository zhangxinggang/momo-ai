import type { IKbDocument, IKbSearchItem } from '@/types/modules/kb';
import {
  KnowledgeDocumentTable,
  KnowledgeDocumentWizard,
  type EDocumentSegmentMode,
  type ISegmentSettings,
} from '@momo/knowledge';
import { KnowledgeChunkPanel } from '@renderer/components/Knowledge/KnowledgeChunkPanel';
import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import {
  kbDeleteDocument,
  kbGetDocument,
  kbImportDirectory,
  kbImportFiles,
  kbListCollections,
  kbListDocuments,
  kbListJobs,
  kbPasteText,
  kbPickDirectory,
  kbPreviewFile,
  kbRetrieve,
  kbRetryJob,
  resolveKbEmbeddingConfig,
  resolveKbEmbeddingModel,
  type IKbEmbeddingOptions,
} from '@renderer/services/kb';
import { useKbStore, useSettingsStore } from '@renderer/store';
import { App, Button, Input, Modal, Spin, Table } from 'antd';
import {
  ClipboardPasteIcon,
  DatabaseIcon,
  FilePlusIcon,
  FileTextIcon,
  FolderOpenIcon,
  SearchIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.less';

const KB_UPDATED_EVENT = 'kb:collections-updated';

/**
 * 知识库主内容区：当前库的文档管理与高级操作
 */
export function KnowledgeManager() {
  const { message } = App.useApp();
  const activeCollectionId = useKbStore((s) => s.activeCollectionId);
  const setActiveCollectionId = useKbStore((s) => s.setActiveCollectionId);
  const aiModels = useSettingsStore((s) => s.aiModels);
  const scenarioModelDefaults = useSettingsStore((s) => s.scenarioModelDefaults);
  const kbEmbeddingOptions = useMemo<IKbEmbeddingOptions>(
    () => ({ aiModels, scenarioModelDefaults }),
    [aiModels, scenarioModelDefaults],
  );
  const embeddingModel = useMemo(
    () => resolveKbEmbeddingModel(aiModels, scenarioModelDefaults),
    [aiModels, scenarioModelDefaults],
  );
  const embeddingReady = useMemo(
    () => Boolean(resolveKbEmbeddingConfig(aiModels, scenarioModelDefaults)),
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
  const progressTimersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const stopProgressPolling = (docId: string) => {
    if (progressTimersRef.current[docId]) {
      clearInterval(progressTimersRef.current[docId]);
      delete progressTimersRef.current[docId];
    }
  };

  const refreshDocs = useCallback(
    async (collectionId: string) => {
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

  const startProgressPolling = (docId: string, collectionId: string) => {
    stopProgressPolling(docId);
    const poll = async () => {
      try {
        const doc = await kbGetDocument(docId);
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
        if (['ready', 'failed', 'interrupted', 'manual_conflict'].includes(doc.status)) {
          stopProgressPolling(docId);
          await refreshDocs(collectionId);
        }
      } catch (error) {
        stopProgressPolling(docId);
        message.error(error instanceof Error ? error.message : String(error));
      }
    };
    void poll();
    progressTimersRef.current[docId] = setInterval(() => void poll(), 1500);
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
      const items = await kbImportFiles(activeCollectionId, valid, kbEmbeddingOptions);
      await refreshDocs(activeCollectionId);
      items.forEach((item) => startProgressPolling(item.docId, activeCollectionId));
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
      const items = await kbImportFiles(activeCollectionId, files, {
        ...kbEmbeddingOptions,
        segmentSettings: {
          separator: settings.separator,
          maxChunkLength: settings.maxChunkLength,
          chunkOverlap: settings.chunkOverlap,
          preprocess: settings.preprocess,
          splitMode: settings.splitMode,
        },
        segmentMode,
      });
      await refreshDocs(activeCollectionId);
      items.forEach((item) => startProgressPolling(item.docId, activeCollectionId));
      notifyUpdated();
    } catch (e: unknown) {
      message.error((e as Error)?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDirectoryImport = async () => {
    if (!activeCollectionId) return;
    try {
      const directoryPath = await kbPickDirectory();
      if (!directoryPath) return;
      setUploading(true);
      const items = await kbImportDirectory(activeCollectionId, directoryPath, {
        ...kbEmbeddingOptions,
        recursive: true,
      });
      await refreshDocs(activeCollectionId);
      items.forEach((item) => startProgressPolling(item.docId, activeCollectionId));
      notifyUpdated();
    } catch (error) {
      message.error(error instanceof Error ? error.message : String(error));
    } finally {
      setUploading(false);
    }
  };

  const tableRecords = useMemo(
    () =>
      docs.map((doc) => ({
        id: doc.docId,
        name: doc.filename,
        segmentMode: doc.segmentMode as EDocumentSegmentMode,
        uploadedAt: doc.createdAt,
        status: doc.status,
        progress: doc.progress,
        chunkCount: doc.chunkCount,
        error: doc.error,
      })),
    [docs],
  );

  const handleDeleteDoc = async (docId: string) => {
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

  const handleRetryIngest = async (docId: string) => {
    if (!activeCollectionId) {
      return;
    }
    try {
      const job = (await kbListJobs(200)).find(
        (item) =>
          item.documentId === docId && ['failed', 'interrupted', 'cancelled'].includes(item.status),
      );
      if (!job) throw new Error('没有可手动重试的失败任务');
      await kbRetryJob(job.id, kbEmbeddingOptions);
      startProgressPolling(docId, activeCollectionId);
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
        kbEmbeddingOptions,
      );
      setPasteOpen(false);
      setPasteText('');
      setPasteFilename('');
      await refreshDocs(activeCollectionId);
      startProgressPolling(docId, activeCollectionId);
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
      const result = await kbRetrieve(
        {
          query: searchQuery.trim(),
          collectionIds: [activeCollectionId],
          topK: 10,
          contextTokenBudget: 6_000,
          mode: 'balanced',
          rerank: 'off',
          trace: true,
        },
        kbEmbeddingOptions,
      );
      setSearchResults(result.evidence);
      if (result.status === 'no_match') message.info('知识库中没有达到相关性要求的内容');
    } catch (e: unknown) {
      message.error((e as Error)?.message || '搜索失败');
    } finally {
      setSearchLoading(false);
    }
  };

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
            <div
              className={`${styles['kb-main-embedding-status']} ${
                embeddingReady
                  ? styles['kb-main-embedding-status--ready']
                  : styles['kb-main-embedding-status--missing']
              }`}
              title={
                embeddingReady
                  ? `知识库嵌入模型：${embeddingModel?.model}`
                  : embeddingModel
                    ? '当前嵌入模型缺少 API Key、API 地址或模型名称'
                    : '文本切分模型只负责切段，入库还需要单独配置嵌入模型'
              }>
              <span className={styles['kb-main-embedding-dot']} aria-hidden />
              {embeddingReady
                ? `嵌入模型：${embeddingModel?.name?.trim() || embeddingModel?.model}`
                : embeddingModel
                  ? `嵌入模型配置不完整：${embeddingModel.name?.trim() || embeddingModel.model}`
                  : '未配置嵌入模型（文本切分模型不能代替）'}
            </div>
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
          {!embeddingReady ? (
            <Button
              className={styles['kb-main-toolbar-btn']}
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('app:open-settings', { detail: { section: 'ai' } }),
                )
              }>
              {'配置嵌入模型'}
            </Button>
          ) : null}
          <Button
            className={styles['kb-main-toolbar-btn']}
            disabled={!activeCollectionId || uploading}
            onClick={() => void handleDirectoryImport()}>
            <FolderOpenIcon size={16} aria-hidden />
            {'导入目录'}
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
        onPreviewSegments={async (file, settings) => {
          const preview = await kbPreviewFile(file, {
            ...kbEmbeddingOptions,
            segmentSettings: {
              separator: settings.separator,
              maxChunkLength: settings.maxChunkLength,
              chunkOverlap: settings.chunkOverlap,
              preprocess: settings.preprocess,
              splitMode: settings.splitMode,
            },
          });
          return preview.chunks.slice(0, 12).map(({ idx, content }) => ({ idx, content }));
        }}
      />

      <KnowledgeChunkPanel
        open={!!chunkDoc}
        document={chunkDoc}
        onClose={() => setChunkDoc(null)}
        kbEmbeddingOptions={kbEmbeddingOptions}
        onRetryIngest={(docId) => void handleRetryIngest(docId)}
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
                    dataIndex: 'finalScore',
                    width: 88,
                    render: (v: number) => (
                      <span className={styles['kb-main-score']}>{v.toFixed(4)}</span>
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

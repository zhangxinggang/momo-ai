import { Button, Modal, Steps, Upload } from 'antd';
import { useEffect, useState } from 'react';

import { previewChunks } from '../../chunker';
import type { EDocumentSegmentMode, EKnowledgeIngestStep, ISegmentSettings } from '../../types';
import { DEFAULT_SEGMENT_SETTINGS } from '../../types';
import { SegmentSettingsPanel, type ISegmentPreviewBlock } from '../SegmentSettingsPanel';

const ACCEPT_TYPES = '.pdf,.docx,.xlsx,.xls,.txt,.md,.markdown';

export interface IProps {
  open: boolean;
  onClose: () => void;
  onUploadAndIngest: (
    files: File[],
    settings: ISegmentSettings,
    segmentMode: EDocumentSegmentMode,
  ) => Promise<void>;
  initialSegmentSettings?: ISegmentSettings;
  onPreviewSegments?: (file: File, settings: ISegmentSettings) => Promise<ISegmentPreviewBlock[]>;
}

/** 新增文档三步向导：数据源 -> 分段与清洗 -> 入库 */
export function KnowledgeDocumentWizard({
  open,
  onClose,
  onUploadAndIngest,
  initialSegmentSettings = DEFAULT_SEGMENT_SETTINGS,
  onPreviewSegments,
}: IProps) {
  const [step, setStep] = useState<EKnowledgeIngestStep>('datasource');
  const [files, setFiles] = useState<File[]>([]);
  const [segmentSettings, setSegmentSettings] = useState<ISegmentSettings>(initialSegmentSettings);
  const [submitting, setSubmitting] = useState(false);
  const [previewSource, setPreviewSource] = useState('');

  const segmentMode: EDocumentSegmentMode =
    segmentSettings.splitMode === 'llm' ? 'general' : 'fixed';

  const [localPreviewBlocks, setLocalPreviewBlocks] = useState<ISegmentPreviewBlock[]>([]);

  useEffect(() => {
    if (!previewSource.trim()) {
      setLocalPreviewBlocks([]);
      return;
    }

    let cancelled = false;
    void previewChunks(previewSource, segmentSettings, 8).then((items) => {
      if (cancelled) {
        return;
      }
      setLocalPreviewBlocks(
        items.map((item) => ({
          idx: item.idx,
          content: item.content,
        })),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [previewSource, segmentSettings]);

  const stepIndex = step === 'datasource' ? 0 : step === 'segment' ? 1 : 2;

  const handleClose = () => {
    setStep('datasource');
    setFiles([]);
    setPreviewSource('');
    onClose();
  };

  const loadPreviewFromFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (['txt', 'md', 'markdown'].includes(ext)) {
      setPreviewSource(await file.text());
      return;
    }
    setPreviewSource('');
  };

  const handlePreviewSegments = async (): Promise<ISegmentPreviewBlock[]> => {
    const file = files[0];
    if (!file) {
      return [];
    }

    if (onPreviewSegments) {
      return onPreviewSegments(file, segmentSettings);
    }

    return localPreviewBlocks;
  };

  return (
    <Modal
      open={open}
      title='添加文档'
      width={880}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden>
      <Steps
        current={stepIndex}
        className='mb-6'
        items={[{ title: '选择数据源' }, { title: '文本分段与清洗' }, { title: '处理并入库' }]}
      />

      {step === 'datasource' ? (
        <div className='space-y-4'>
          <Upload.Dragger
            multiple
            accept={ACCEPT_TYPES}
            beforeUpload={() => false}
            fileList={files.map((f, i) => ({
              uid: String(i),
              name: f.name,
              status: 'done' as const,
            }))}
            onChange={(info) => {
              const next = (info.fileList ?? [])
                .map((item) => item.originFileObj)
                .filter((f): f is NonNullable<typeof f> => Boolean(f));
              setFiles(next);
              if (next[0]) {
                void loadPreviewFromFile(next[0]);
              } else {
                setPreviewSource('');
              }
            }}>
            <p>点击或拖拽上传 PDF、DOCX、Excel、TXT、Markdown</p>
          </Upload.Dragger>
        </div>
      ) : null}

      {step === 'segment' ? (
        <SegmentSettingsPanel
          value={segmentSettings}
          onChange={setSegmentSettings}
          previewBlocks={localPreviewBlocks}
          previewDisabled={files.length === 0}
          onPreview={handlePreviewSegments}
        />
      ) : null}

      {step === 'ingest' ? (
        <p className='text-sm'>
          将处理 {files.length} 个文件，分段模式：
          {segmentMode === 'general' ? '通用（大语言模型切分）' : '固定'}
          ，完成后可在列表中查看切块。
        </p>
      ) : null}

      <div className='mt-6 flex justify-end gap-2'>
        <Button onClick={handleClose}>取消</Button>
        {stepIndex > 0 ? (
          <Button onClick={() => setStep(stepIndex === 1 ? 'datasource' : 'segment')}>
            上一步
          </Button>
        ) : null}
        {stepIndex < 2 ? (
          <Button
            type='primary'
            disabled={stepIndex === 0 && files.length === 0}
            onClick={() => setStep(stepIndex === 0 ? 'segment' : 'ingest')}>
            下一步
          </Button>
        ) : (
          <Button
            type='primary'
            loading={submitting}
            disabled={files.length === 0}
            onClick={() => {
              setSubmitting(true);
              void onUploadAndIngest(files, segmentSettings, segmentMode)
                .then(() => handleClose())
                .finally(() => setSubmitting(false));
            }}>
            确认入库
          </Button>
        )}
      </div>
    </Modal>
  );
}

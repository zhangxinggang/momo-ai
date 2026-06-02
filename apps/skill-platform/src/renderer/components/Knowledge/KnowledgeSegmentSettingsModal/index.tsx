import type { IKbDocument } from '@/types/modules/kb';
import {
  DEFAULT_SEGMENT_SETTINGS,
  SegmentSettingsPanel,
  type EDocumentSegmentMode,
  type ISegmentSettings,
} from '@momo/knowledge';
import { kbResegmentDocument, type IKbEmbeddingOptions } from '@renderer/services/kb';
import { App, Modal } from 'antd';
import { useState } from 'react';

interface IProps {
  open: boolean;
  document: IKbDocument | null;
  kbEmbeddingOptions: IKbEmbeddingOptions;
  onClose: () => void;
  onDone: () => void;
}

/** 修改文档分段设置并重新分段 */
export function KnowledgeSegmentSettingsModal({
  open,
  document,
  kbEmbeddingOptions,
  onClose,
  onDone,
}: IProps) {
  const { message } = App.useApp();
  const [settings, setSettings] = useState<ISegmentSettings>(DEFAULT_SEGMENT_SETTINGS);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!document?.docId) {
      return;
    }
    const segmentMode: EDocumentSegmentMode = settings.splitMode === 'llm' ? 'general' : 'fixed';
    setSubmitting(true);
    try {
      await kbResegmentDocument(
        document.docId,
        {
          separator: settings.separator,
          maxChunkLength: settings.maxChunkLength,
          chunkOverlap: settings.chunkOverlap,
          preprocess: settings.preprocess,
          splitMode: settings.splitMode,
        },
        segmentMode,
        kbEmbeddingOptions,
      );
      message.success('重新分段完成');
      onDone();
      onClose();
    } catch (e: unknown) {
      message.error((e as Error)?.message || '重新分段失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={document ? `分段设置 - ${document.filename}` : '分段设置'}
      width={760}
      onCancel={onClose}
      onOk={() => void handleConfirm()}
      confirmLoading={submitting}
      okText='确认并重新分段'
      cancelText='取消'
      destroyOnClose>
      <SegmentSettingsPanel value={settings} onChange={setSettings} />
    </Modal>
  );
}

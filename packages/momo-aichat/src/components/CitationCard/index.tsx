import { Modal } from 'antd';
import React, { useState } from 'react';
import type { IKbChunk } from '../../adapters/types';
import { useAiChatConfig } from '../../contexts/AiChatConfigContext';
import MarkdownRenderer from '../MarkdownRenderer';

interface IProps {
  citation: {
    chunkId: number;
    docId: number;
    idx: number;
    title?: string;
    preview?: string;
    score?: number;
  };
  index: number;
}

/**
 * 引用卡片组件 - 可点击展开查看完整原文
 */
const CitationCard: React.FC<IProps> = ({ citation, index }) => {
  const { getKbChunk } = useAiChatConfig();
  const [modalOpen, setModalOpen] = useState(false);
  const [chunkData, setChunkData] = useState<IKbChunk | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setModalOpen(true);
    if (!chunkData && getKbChunk) {
      try {
        setLoading(true);
        const data = await getKbChunk(citation.chunkId);
        setChunkData(data);
      } catch (e) {
        console.error('加载chunk失败', e);
      } finally {
        setLoading(false);
      }
    }
  };

  const displayTitle = citation.title || `doc-${citation.docId}`;

  return (
    <>
      <span
        className='border-surface text-foreground cursor-pointer rounded-full border bg-[var(--surface)] px-2 py-1 text-xs transition-colors hover:bg-[var(--surface-hover)]'
        title={`${displayTitle} | #${citation.idx}\n${citation.preview || ''}`}
        onClick={handleClick}>
        引用 {index + 1} · {displayTitle}
      </span>

      <Modal
        title='引用原文'
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}>
        {loading ? (
          <div className='py-8 text-center text-gray-500'>加载中...</div>
        ) : chunkData ? (
          <div className='space-y-3'>
            {/* 文档信息 */}
            <div className='border-surface space-y-1 rounded border bg-[var(--surface)] p-3'>
              <div className='text-sm'>
                <span className='text-gray-500'>文档：</span>
                <span className='font-medium'>{chunkData.docName}</span>
              </div>
              <div className='text-sm'>
                <span className='text-gray-500'>块索引：</span>
                <span>#{chunkData.idx}</span>
                <span className='ml-4 text-gray-500'>Token数：</span>
                <span>{chunkData.tokens}</span>
              </div>
              {typeof citation.score === 'number' && (
                <div className='text-sm'>
                  <span className='text-gray-500'>相关度分数：</span>
                  <span>{citation.score.toFixed(4)}</span>
                </div>
              )}
            </div>

            {/* 完整内容 */}
            <div className='border-surface bg-panel max-h-[500px] overflow-y-auto rounded border p-4'>
              <MarkdownRenderer
                instanceKey={`citation-${citation.chunkId}`}
                content={chunkData.content}
                isStreaming={false}
              />
            </div>
          </div>
        ) : (
          <div className='py-8 text-center text-gray-500'>加载失败</div>
        )}
      </Modal>
    </>
  );
};

export default CitationCard;

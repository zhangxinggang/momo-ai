import { Button, Checkbox, Input, InputNumber, Radio, Space } from 'antd';
import { useState } from 'react';

import type { EDocumentSplitMode, ISegmentSettings } from '../../types';

export interface ISegmentPreviewBlock {
  idx: number;
  content: string;
}

export interface IProps {
  value: ISegmentSettings;
  onChange: (next: ISegmentSettings) => void;
  previewText?: string;
  previewBlocks?: ISegmentPreviewBlock[];
  onPreview?: () => Promise<ISegmentPreviewBlock[]>;
  previewDisabled?: boolean;
}

/** 分段与清洗设置面板（第二步 / 分段设置弹窗复用） */
export function SegmentSettingsPanel({
  value,
  onChange,
  previewBlocks = [],
  onPreview,
  previewDisabled = false,
}: IProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewItems, setPreviewItems] = useState<ISegmentPreviewBlock[]>(previewBlocks);
  const patch = (partial: Partial<ISegmentSettings>) => onChange({ ...value, ...partial });

  const handlePreview = async () => {
    if (!onPreview) {
      setPreviewOpen(true);
      setPreviewItems(previewBlocks);
      return;
    }

    setPreviewLoading(true);
    try {
      const items = await onPreview();
      setPreviewItems(items);
      setPreviewOpen(true);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div>
        <div className='mb-2 text-sm font-medium'>分段设置</div>
        <Space direction='vertical' className='w-full' size='middle'>
          <div>
            <div className='text-muted-foreground mb-1 text-xs'>分段标识符</div>
            <Input
              value={value.separator}
              onChange={(e) => patch({ separator: e.target.value })}
              placeholder='\n\n'
            />
          </div>
          <div className='flex flex-wrap gap-4'>
            <div>
              <div className='text-muted-foreground mb-1 text-xs'>分段最大长度（字符）</div>
              <InputNumber
                min={200}
                max={8000}
                value={value.maxChunkLength}
                onChange={(n) => patch({ maxChunkLength: Number(n) || 1024 })}
              />
            </div>
            <div>
              <div className='text-muted-foreground mb-1 text-xs'>分组重叠长度（字符）</div>
              <InputNumber
                min={0}
                max={500}
                value={value.chunkOverlap}
                onChange={(n) => patch({ chunkOverlap: Number(n) || 0 })}
              />
            </div>
          </div>
        </Space>
      </div>

      <div>
        <div className='mb-2 text-sm font-medium'>文本预处理规则</div>
        <Space direction='vertical'>
          <Checkbox
            checked={value.preprocess.normalizeWhitespace}
            onChange={(e) =>
              patch({
                preprocess: {
                  ...value.preprocess,
                  normalizeWhitespace: e.target.checked,
                },
              })
            }>
            替换掉连续的空格、换行符和制表符
          </Checkbox>
          <Checkbox
            checked={value.preprocess.removeUrlsAndEmails}
            onChange={(e) =>
              patch({
                preprocess: {
                  ...value.preprocess,
                  removeUrlsAndEmails: e.target.checked,
                },
              })
            }>
            删除所有的 URL 和电子邮件
          </Checkbox>
        </Space>
      </div>

      <div>
        <div className='mb-2 text-sm font-medium'>切分设置</div>
        <Radio.Group
          value={value.splitMode}
          onChange={(e) => patch({ splitMode: e.target.value as EDocumentSplitMode })}>
          <Radio value='code'>代码切分</Radio>
          <Radio value='llm'>大语言模型切分</Radio>
        </Radio.Group>
        {value.splitMode === 'llm' ? (
          <div className='text-muted-foreground mt-2 text-xs'>
            将调用场景默认模型「文本切分」所配置的对话模型，按语义边界切分文本；失败时自动回退代码切分。
          </div>
        ) : null}
      </div>

      <div>
        <Button
          type='default'
          loading={previewLoading}
          disabled={previewDisabled}
          onClick={() => void handlePreview()}>
          预览分段
        </Button>
        {previewOpen ? (
          <div className='mt-3 max-h-64 space-y-2 overflow-auto rounded border p-2 text-xs'>
            {previewItems.length > 0 ? (
              previewItems.map((block) => (
                <div key={block.idx} className='rounded border border-dashed p-2'>
                  <div className='text-muted-foreground mb-1 font-medium'>块 {block.idx}</div>
                  <pre className='whitespace-pre-wrap break-words'>
                    {block.content.slice(0, 400)}
                    {block.content.length > 400 ? '...' : ''}
                  </pre>
                </div>
              ))
            ) : (
              <div className='text-muted-foreground py-4 text-center'>暂无预览内容</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

import {
  MdEditor,
  type IExposeParam,
  type TToolbarNames,
  type TUploadImgEvent,
} from '@momo/markdown';
import type { UploadProps } from 'antd';
import { Button, Input, Upload } from 'antd';
import { AlertCircleIcon, SparklesIcon, UploadIcon } from 'lucide-react';
import type { RefObject } from 'react';

import { buildSkillTagActions } from '@renderer/services/skill/modal-utils';
import { SkillIconPicker } from '../SkillIconPicker';
import { SkillTagEditor } from '../SkillTagEditor';
import { sanitizeSkillName } from './types';

export interface IManualSkillFormState {
  name: string;
  description: string;
  instructions: string;
  version: string;
  author: string;
  iconUrl?: string;
  iconEmoji?: string;
  iconBackground?: string;
  tags: string[];
  tagInput: string;
}

interface IProps {
  form: IManualSkillFormState;
  existingTags: string[];
  canGenerateWithAI: boolean;
  isGenerating: boolean;
  skillMdEditorRef: RefObject<IExposeParam | null>;
  skillMdToolbars: TToolbarNames[];
  onFieldChange: <K extends keyof IManualSkillFormState>(
    key: K,
    value: IManualSkillFormState[K],
  ) => void;
  onMdFileUpload: UploadProps['beforeUpload'];
  onAIPolish: () => void;
  onDrop: (event: DragEvent) => void;
  onUploadImg: TUploadImgEvent;
}

const SkillMdEditor = MdEditor as typeof MdEditor;

export function CreateSkillManualPanel({
  form,
  existingTags,
  canGenerateWithAI,
  isGenerating,
  skillMdEditorRef,
  skillMdToolbars,
  onFieldChange,
  onMdFileUpload,
  onAIPolish,
  onDrop,
  onUploadImg,
}: IProps) {
  const tagActions = buildSkillTagActions({
    tags: form.tags,
    tagInput: form.tagInput,
    setTags: (tags) => onFieldChange('tags', tags),
    setTagInput: (tagInput) => onFieldChange('tagInput', tagInput),
  });

  return (
    <div className='space-y-5'>
      <div>
        <label className='mb-2 block text-sm font-medium'>
          {'技能名称'} <span className='text-destructive'>*</span>
        </label>
        <Input
          value={form.name}
          onChange={(event) => onFieldChange('name', sanitizeSkillName(event.target.value))}
          placeholder='my-skill-name'
        />
        <p className='text-muted-foreground mt-1.5 text-xs'>
          {'仅小写字母、数字和连字符，例如 my-skill-name'}
        </p>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>{'技能描述'}</label>
        <Input
          value={form.description}
          onChange={(event) => onFieldChange('description', event.target.value)}
          placeholder={'简短描述技能的功能'}
        />
      </div>

      <SkillIconPicker
        name={form.name}
        iconUrl={form.iconUrl}
        iconEmoji={form.iconEmoji}
        iconBackground={form.iconBackground}
        onChange={({ iconUrl, iconEmoji, iconBackground }) => {
          onFieldChange('iconUrl', iconUrl);
          onFieldChange('iconEmoji', iconEmoji);
          onFieldChange('iconBackground', iconBackground);
        }}
      />

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='mb-2 block text-sm font-medium'>{'版本'}</label>
          <Input
            value={form.version}
            onChange={(event) => onFieldChange('version', event.target.value)}
            placeholder='1.0.0'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium'>{'作者'}</label>
          <Input
            value={form.author}
            onChange={(event) => onFieldChange('author', event.target.value)}
            placeholder={'作者名称'}
          />
        </div>
      </div>

      <SkillTagEditor
        tags={form.tags}
        tagInput={form.tagInput}
        existingTags={existingTags}
        onTagInputChange={(tagInput) => onFieldChange('tagInput', tagInput)}
        onAddTag={tagActions.handleAddTag}
        onRemoveTag={tagActions.handleRemoveTag}
        onExistingTagClick={tagActions.handleAddExistingTag}
      />

      <div>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
          <label className='block text-sm font-medium'>{'指令 (SKILL.md)'}</label>
          <div className='flex flex-wrap items-center gap-2'>
            <Upload
              showUploadList={false}
              accept='.md,.markdown,.txt'
              beforeUpload={onMdFileUpload}>
              <Button type='default' size='small' icon={<UploadIcon className='h-3.5 w-3.5' />}>
                {'上传 .md'}
              </Button>
            </Upload>
            <Button
              type='primary'
              size='small'
              loading={isGenerating}
              disabled={!canGenerateWithAI || !form.instructions.trim()}
              icon={<SparklesIcon className='h-3.5 w-3.5' />}
              onClick={onAIPolish}
              title={
                !canGenerateWithAI
                  ? '请先在设置中配置 AI 模型'
                  : !form.instructions.trim()
                    ? '请先编写一些内容再进行润色'
                    : '按 SKILL.md 标准格式润色内容'
              }>
              {isGenerating ? '润色中...' : 'AI 润色'}
            </Button>
          </div>
        </div>
        {!canGenerateWithAI && (
          <div className='mb-2 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2'>
            <AlertCircleIcon className='h-4 w-4 flex-shrink-0 text-amber-500' />
            <p className='text-xs text-amber-600 dark:text-amber-400'>
              {'请先在设置中配置 AI 模型以启用 AI 润色'}
            </p>
          </div>
        )}
        <div className='border-border overflow-hidden rounded-lg border' style={{ height: 420 }}>
          <SkillMdEditor
            ref={skillMdEditorRef}
            value={form.instructions}
            onChange={(value) => onFieldChange('instructions', value)}
            preview
            previewTheme='default'
            noPrettier
            toolbars={skillMdToolbars}
            onDrop={onDrop}
            onUploadImg={onUploadImg}
            style={{ height: '100%' }}
          />
        </div>
        <p className='text-muted-foreground mt-1.5 text-xs'>
          {'支持 Markdown 格式，用于指导 AI 如何使用该技能'}
        </p>
      </div>
    </div>
  );
}

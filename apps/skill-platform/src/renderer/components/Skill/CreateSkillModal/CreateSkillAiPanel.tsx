import { Button, Input } from 'antd';
import { AlertCircleIcon, BrainIcon, SparklesIcon } from 'lucide-react';

import { sanitizeSkillName } from './types';

interface IProps {
  name: string;
  description: string;
  canGenerateWithAI: boolean;
  isGenerating: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export function CreateSkillAiPanel({
  name,
  description,
  canGenerateWithAI,
  isGenerating,
  onNameChange,
  onDescriptionChange,
  onBack,
  onGenerate,
}: IProps) {
  return (
    <div className='space-y-4'>
      <div className='bg-primary/5 border-primary/20 rounded-lg border p-3'>
        <p className='text-primary flex items-center gap-2 text-xs'>
          <BrainIcon className='h-3.5 w-3.5' />
          {'将使用 ISkill Creator 技能生成专业的 SKILL.md，您可在保存前审阅与编辑。'}
        </p>
      </div>

      {!canGenerateWithAI && (
        <div className='flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3'>
          <AlertCircleIcon className='h-4 w-4 flex-shrink-0 text-amber-500' />
          <p className='text-xs text-amber-600 dark:text-amber-400'>
            {'Configure an AI model in settings to enable AI generation'}
          </p>
        </div>
      )}

      <div>
        <label className='mb-2 block text-sm font-medium'>
          {'技能名称'}
          <span className='text-destructive ml-1'>*</span>
        </label>
        <Input
          value={name}
          onChange={(event) => onNameChange(sanitizeSkillName(event.target.value))}
          placeholder={'my-skill'}
        />
        <p className='text-muted-foreground mt-1.5 text-xs'>
          {'仅小写字母、数字和连字符，例如 my-skill-name'}
        </p>
      </div>

      <div>
        <label className='mb-2 block text-sm font-medium'>
          {'描述'}
          <span className='text-destructive ml-1'>*</span>
        </label>
        <Input.TextArea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder='描述这个技能应做什么、用途及使用场景…'
          rows={4}
        />
      </div>

      <div className='flex gap-2 pt-2'>
        <Button className='flex-1' onClick={onBack}>
          {'返回'}
        </Button>
        <Button
          type='primary'
          className='flex-1'
          loading={isGenerating}
          disabled={!canGenerateWithAI || !name.trim() || !description.trim()}
          icon={<SparklesIcon className='h-4 w-4' />}
          onClick={onGenerate}>
          {isGenerating ? '生成中...' : '生成并预览'}
        </Button>
      </div>
    </div>
  );
}

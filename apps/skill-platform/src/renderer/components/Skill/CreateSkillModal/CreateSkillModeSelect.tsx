import { Button } from 'antd';
import { BrainIcon, CuboidIcon, EditIcon, FolderOpenIcon, GithubIcon } from 'lucide-react';

import type { ECreateMode } from './types';

interface IProps {
  onSelectMode: (mode: ECreateMode) => void;
}

export function CreateSkillModeSelect({ onSelectMode }: IProps) {
  return (
    <div className='space-y-3'>
      <p className='text-muted-foreground mb-4 text-sm'>{'选择添加技能的方式：'}</p>

      <Button
        type='default'
        block
        className='bg-primary/5 hover:bg-primary/10 border-primary/30 !h-auto justify-start gap-4 rounded-xl border p-4 text-left'
        onClick={() => onSelectMode('ai')}>
        <div className='bg-primary rounded-lg p-3'>
          <BrainIcon className='h-6 w-6 text-white' />
        </div>
        <div className='text-left'>
          <h3 className='text-foreground flex items-center gap-2 font-medium'>
            {'AI 草稿'}
            <span className='bg-primary/20 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-normal'>
              skill-creator
            </span>
          </h3>
          <p className='text-muted-foreground text-sm'>
            {'描述你的需求，AI 先生成 SKILL.md 草稿供你确认'}
          </p>
        </div>
      </Button>

      <Button
        type='default'
        block
        className='bg-accent/50 hover:bg-accent border-border !h-auto justify-start gap-4 rounded-xl border p-4 text-left'
        onClick={() => onSelectMode('github')}>
        <div className='bg-background group-hover:bg-primary/10 rounded-lg p-3 transition-colors'>
          <GithubIcon className='text-foreground h-6 w-6' />
        </div>
        <div className='text-left'>
          <h3 className='text-foreground font-medium'>{'从 GitHub 安装'}</h3>
          <p className='text-muted-foreground text-sm'>{'粘贴 GitHub 仓库地址安装'}</p>
        </div>
      </Button>

      <Button
        type='default'
        block
        className='bg-accent/50 hover:bg-accent border-border !h-auto justify-start gap-4 rounded-xl border p-4 text-left'
        onClick={() => onSelectMode('manual')}>
        <div className='bg-background group-hover:bg-primary/10 rounded-lg p-3 transition-colors'>
          <EditIcon className='text-foreground h-6 w-6' />
        </div>
        <div className='text-left'>
          <h3 className='text-foreground font-medium'>{'手动创建'}</h3>
          <p className='text-muted-foreground text-sm'>{'从零开始编写技能'}</p>
        </div>
      </Button>

      <Button
        type='default'
        block
        className='bg-accent/50 hover:bg-accent border-border !h-auto justify-start gap-4 rounded-xl border p-4 text-left'
        onClick={() => onSelectMode('scan')}>
        <div className='bg-background group-hover:bg-primary/10 rounded-lg p-3 transition-colors'>
          <FolderOpenIcon className='text-foreground h-6 w-6' />
        </div>
        <div className='text-left'>
          <h3 className='text-foreground font-medium'>{'扫描本地'}</h3>
          <p className='text-muted-foreground text-sm'>{'扫描本地已有的技能'}</p>
        </div>
      </Button>
    </div>
  );
}

export function getCreateSkillModalTitle(mode: ECreateMode) {
  switch (mode) {
    case 'select':
      return '新建技能';
    case 'github':
      return '从 GitHub 安装';
    case 'manual':
      return '创建新技能';
    case 'ai':
      return 'AI 草稿';
    case 'scan':
      return '扫描本地';
    default:
      return '新建技能';
  }
}

export function CreateSkillModalTitleIcon() {
  return <CuboidIcon className='text-primary h-5 w-5' />;
}

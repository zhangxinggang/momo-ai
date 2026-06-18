import { Button } from 'antd';
import { FolderOpenIcon, SearchIcon } from 'lucide-react';

interface IProps {
  isScanning: boolean;
  onStartScan: () => void;
}

export function CreateSkillScanIntro({ isScanning, onStartScan }: IProps) {
  return (
    <div className='py-8 text-center'>
      <FolderOpenIcon className='text-muted-foreground/30 mx-auto mb-4 h-12 w-12' />
      <h3 className='mb-2 font-medium'>{'扫描本地技能'}</h3>
      <p className='text-muted-foreground mb-4 text-sm'>
        {'自动检测 Claude、Cursor、Windsurf 等 AI 工具中的 SKILL.md 文件。'}
      </p>
      <Button
        type='primary'
        loading={isScanning}
        icon={<SearchIcon className='h-4 w-4' />}
        onClick={onStartScan}>
        {isScanning ? '扫描中...' : '开始扫描'}
      </Button>
    </div>
  );
}

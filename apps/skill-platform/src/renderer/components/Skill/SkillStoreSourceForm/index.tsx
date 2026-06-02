import type { ISkillStoreSource } from '@/types/modules';
import { Button, Input } from 'antd';
interface IProps {
  handleAddSource: () => void;
  setSourceName: (value: string) => void;
  setSourceType: (
    value: Extract<ISkillStoreSource['type'], 'marketplace-json' | 'git-repo' | 'local-dir'>,
  ) => void;
  setSourceUrl: (value: string) => void;
  sourceName: string;
  sourceType: Extract<ISkillStoreSource['type'], 'marketplace-json' | 'git-repo' | 'local-dir'>;
  sourceUrl: string;
  typeOptions: Array<{
    value: Extract<ISkillStoreSource['type'], 'marketplace-json' | 'git-repo' | 'local-dir'>;
    icon: React.ReactNode;
  }>;
}

export function SkillStoreSourceForm({
  handleAddSource,
  setSourceName,
  setSourceType,
  setSourceUrl,
  sourceName,
  sourceType,
  sourceUrl,
  typeOptions,
}: IProps) {
  return (
    <div className='app-wallpaper-surface border-border space-y-4 rounded-2xl border p-4'>
      <div className='space-y-2'>
        <div className='text-muted-foreground text-xs font-medium uppercase tracking-[0.2em]'>
          {'商店类型'}
        </div>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
          {typeOptions.map((option) => {
            const active = sourceType === option.value;
            const label =
              option.value === 'marketplace-json'
                ? 'Marketplace JSON'
                : option.value === 'git-repo'
                  ? 'Git 仓库'
                  : '本地目录';
            const hint =
              option.value === 'marketplace-json'
                ? '适合直接填写 marketplace.json 地址，PromptHub 会按索引拉取商店内容。'
                : option.value === 'git-repo'
                  ? '适合填写 GitHub / Git 仓库地址，PromptHub 会识别其中的 SKILL.md 或商店索引。'
                  : '适合填写本地文件夹路径，PromptHub 会扫描其中的 skill 文件夹。';

            return (
              <Button
                key={option.value}
                onClick={() => setSourceType(option.value)}
                className={`h-auto whitespace-normal rounded-xl border px-4 py-3 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary/10 text-foreground shadow-[0_0_0_1px_rgba(96,165,250,0.2)]'
                    : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted/50'
                }`}>
                <div className='flex items-center gap-2 text-sm font-semibold'>
                  <span className={active ? 'text-primary' : 'text-muted-foreground'}>
                    {option.icon}
                  </span>
                  {label}
                </div>
                <div className='mt-1 text-xs leading-5'>{hint}</div>
              </Button>
            );
          })}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-2 md:grid-cols-[1fr_1.35fr_auto]'>
        <Input
          value={sourceName}
          onChange={(event) => setSourceName(event.target.value)}
          placeholder={'商店名称'}
          className='bg-accent/50 border-border rounded-lg text-sm'
        />
        <Input
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          placeholder={sourceType === 'local-dir' ? '本地目录路径' : '商店 URL / 清单 URL'}
          className='bg-accent/50 border-border rounded-lg text-sm'
        />
        <Button type='primary' onClick={handleAddSource} className='rounded-lg px-4'>
          {'添加'}
        </Button>
      </div>

      <div className='border-border bg-muted/30 text-muted-foreground rounded-xl border px-4 py-3 text-xs leading-6'>
        <div className='text-foreground mb-1 font-medium'>{'示例'}</div>
        {sourceType === 'marketplace-json' && (
          <>
            <div>{'Marketplace JSON 示例'}</div>
            <div className='mt-1 break-all font-mono text-[11px]'>
              https://raw.githubusercontent.com/docker/claude-code-plugin-manager/main/marketplace.json
            </div>
          </>
        )}
        {sourceType === 'git-repo' && (
          <>
            <div>{'Git 仓库示例'}</div>
            <div className='mt-1 break-all font-mono text-[11px]'>
              https://github.com/anthropics/skills
            </div>
            <div className='mt-1 break-all font-mono text-[11px]'>~/Projects/my-skill-repo</div>
          </>
        )}
        {sourceType === 'local-dir' && (
          <>
            <div>{'本地目录示例'}</div>
            <div className='mt-1 break-all font-mono text-[11px]'>~/Documents/my-skills</div>
          </>
        )}
      </div>
    </div>
  );
}

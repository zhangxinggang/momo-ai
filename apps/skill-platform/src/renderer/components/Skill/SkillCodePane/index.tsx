import type { ISkill } from '@/types/modules';
import { getProtocolDisplayLabel, getSkillSourceMeta } from '@renderer/services/skill/detail-utils';
import { Button } from 'antd';
import { CheckIcon, ChevronRightIcon, CopyIcon } from 'lucide-react';
interface IProps {
  copyStatus: Record<string, boolean>;
  handleCopy: (text: string, key: string) => void;
  selectedSkill: ISkill;
  skillContent: string;
}

export function SkillCodePane({ copyStatus, handleCopy, selectedSkill, skillContent }: IProps) {
  const sourceMeta = getSkillSourceMeta(selectedSkill);

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6'>
      <section className='space-y-4'>
        <h3 className='text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]'>
          {'元数据'}
        </h3>
        <div className='border-border app-wallpaper-surface rounded-2xl border p-4'>
          <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
            <div>
              <div className='text-muted-foreground text-[11px] font-medium'>{'ID'}</div>
              <div className='mt-1 truncate font-mono text-xs'>{selectedSkill.id}</div>
            </div>
            <div>
              <div className='text-muted-foreground text-[11px] font-medium'>{'协议'}</div>
              <div className='text-primary mt-1 flex items-center gap-1.5 text-sm font-semibold'>
                <ChevronRightIcon className='h-4 w-4' />
                {getProtocolDisplayLabel(selectedSkill.protocol_type)}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground text-[11px] font-medium'>{'创建时间'}</div>
              <div className='mt-1 text-xs'>
                {new Date(selectedSkill.created_at).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground text-[11px] font-medium'>{'更新时间'}</div>
              <div className='mt-1 text-xs'>
                {new Date(selectedSkill.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {sourceMeta ? (
        <a
          href={sourceMeta.kind === 'local' ? undefined : sourceMeta.value}
          onClick={(event) => {
            if (sourceMeta.kind === 'local') {
              event.preventDefault();
              window.electron?.openPath?.(sourceMeta.value);
            }
          }}
          target={sourceMeta.kind === 'local' ? undefined : '_blank'}
          rel={sourceMeta.kind === 'local' ? undefined : 'noreferrer'}
          className='border-border app-wallpaper-surface hover:bg-accent grid grid-cols-[auto,minmax(0,1fr)] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors'
          title={sourceMeta.displayValue}>
          <div className='text-muted-foreground text-xs font-bold uppercase tracking-[0.18em]'>
            {'来源'}
          </div>
          <div className='grid min-w-0 grid-cols-[auto,minmax(0,1fr)] items-center gap-3'>
            <div className='truncate text-sm font-medium'>{sourceMeta.sourceLabel}</div>
            <div className='text-muted-foreground whitespace-normal break-words text-xs'>
              {sourceMeta.displayValue}
            </div>
          </div>
        </a>
      ) : null}

      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]'>
            {'SKILL.md 源码'}
          </h3>
          {skillContent.trim() && (
            <Button
              size='small'
              onClick={() => handleCopy(skillContent, 'raw')}
              className='bg-accent/50 hover:bg-accent flex items-center gap-1.5 rounded-lg px-3 text-xs'>
              {copyStatus.raw ? (
                <CheckIcon className='h-3.5 w-3.5 text-green-500' />
              ) : (
                <CopyIcon className='h-3.5 w-3.5' />
              )}
              {copyStatus.raw ? '已复制' : '复制 MD'}
            </Button>
          )}
        </div>
        <div className='app-wallpaper-panel border-border overflow-hidden rounded-2xl border'>
          {skillContent.trim() ? (
            <pre className='text-foreground/80 max-h-[68vh] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words p-5 font-mono text-xs'>
              {skillContent}
            </pre>
          ) : (
            <div className='text-muted-foreground p-8 text-center text-sm'>{'暂无内容'}</div>
          )}
        </div>
      </section>
    </div>
  );
}

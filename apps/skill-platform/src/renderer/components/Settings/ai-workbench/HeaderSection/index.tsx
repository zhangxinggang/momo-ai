import { Button } from 'antd';
import { Loader2Icon, PlayIcon, PlusIcon } from 'lucide-react';

import { StatusCard } from '@renderer/components/Settings/ai-workbench/shared-ui';
import type { IStatusCardData } from '@renderer/types/ai-workbench';

export function HeaderSection({
  testingDefault,
  statusCards,
  defaultModelDisplayName,
  onTestDefault,
  onAddModel,
}: {
  testingDefault: boolean;
  statusCards: IStatusCardData[];
  defaultModelDisplayName?: string;
  onTestDefault: () => void;
  onAddModel: () => void;
}) {
  return (
    <>
      <div className='flex flex-col gap-4 pt-2 md:flex-row md:items-start md:justify-between'>
        <div>
          <h2 className='text-lg font-semibold tracking-tight'>{'AI 模型工作台'}</h2>
        </div>
        <div className='flex flex-wrap items-center justify-end gap-3 md:shrink-0'>
          <div className='flex items-center gap-3'>
            {defaultModelDisplayName ? (
              <span
                className='text-muted-foreground max-w-[220px] truncate text-xs leading-tight'
                title={defaultModelDisplayName}>
                {defaultModelDisplayName}
              </span>
            ) : null}
            <Button
              onClick={onTestDefault}
              disabled={testingDefault}
              className='border-border bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-4 text-sm font-medium leading-none shadow-sm transition-colors disabled:opacity-50'>
              {testingDefault ? (
                <Loader2Icon className='text-muted-foreground h-4 w-4 animate-spin' />
              ) : (
                <PlayIcon className='text-muted-foreground h-4 w-4' />
              )}
              {'测试默认模型'}
            </Button>
          </div>
          <Button
            type='primary'
            onClick={onAddModel}
            className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-medium leading-none shadow-sm transition-colors'>
            <PlusIcon className='h-4 w-4' />
            {'添加模型'}
          </Button>
        </div>
      </div>

      <div>
        <h3 className='text-muted-foreground mb-3 text-sm font-medium'>{'状态总览'}</h3>
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          {statusCards.map((card) => (
            <StatusCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </>
  );
}

import type { SelectProps } from 'antd';
import { BrainIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { ModelSelect } from '@renderer/components/ui/ModelSelect';
import type { IAIModelConfig } from '@renderer/types/settings';

/** 将带可选分组的选项转为 antd Select 的 options */
export function groupedSelectOptions(
  items: Array<{ value: string; label: ReactNode; group?: string }>,
): NonNullable<SelectProps['options']> {
  const buckets = new Map<string, typeof items>();
  for (const it of items) {
    const g = it.group ?? '';
    if (!buckets.has(g)) buckets.set(g, []);
    buckets.get(g)!.push(it);
  }
  const keys = [...buckets.keys()];
  if (keys.length === 1 && keys[0] === '') {
    return buckets.get('')!.map((o) => ({ value: o.value, label: o.label }));
  }
  return keys.map((label) => ({
    label,
    options: buckets.get(label)!.map((o) => ({ value: o.value, label: o.label })),
  }));
}

export function StatusCard({
  title,
  value,
  detail,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  tone: 'ready' | 'warning';
  icon: typeof BrainIcon;
}) {
  const isReady = tone === 'ready';

  return (
    <div className='border-border/60 bg-card relative flex flex-col justify-between rounded-xl border p-3.5 shadow-sm transition-shadow hover:shadow-md'>
      <div
        className={`absolute right-3 top-3 h-1.5 w-1.5 rounded-full ${
          isReady
            ? 'bg-emerald-500 ring-[3px] ring-emerald-500/20'
            : 'bg-amber-500 ring-[3px] ring-amber-500/20'
        }`}
      />
      <div>
        <div className='text-muted-foreground flex items-center gap-2'>
          <Icon className='h-4 w-4' />
          <span className='text-xs font-medium'>{title}</span>
        </div>
        <div className='text-foreground mt-1.5 text-xl font-semibold tracking-tight'>{value}</div>
      </div>
      <div className='text-muted-foreground mt-3 line-clamp-1 text-[11px]' title={detail}>
        {detail}
      </div>
    </div>
  );
}

export function ScenarioRow({
  label,
  desc,
  value,
  models,
  modelType = 'chat',
  onChange,
  disabled,
  emptyHint,
}: {
  label: string;
  desc: string;
  value: string;
  models: IAIModelConfig[];
  modelType?: 'chat' | 'image';
  onChange: (value: string) => void;
  disabled: boolean;
  emptyHint?: string;
}) {
  return (
    <div className='hover:bg-muted/30 flex flex-col gap-3 p-4 transition-colors md:flex-row md:items-center md:justify-between'>
      <div className='min-w-0 space-y-1'>
        <div className='text-sm font-medium'>{label}</div>
        <div className='text-muted-foreground text-xs'>{desc}</div>
      </div>
      <div className='w-full md:w-[280px]'>
        <ModelSelect
          className='w-full'
          value={value}
          onChange={onChange}
          models={models}
          modelType={modelType}
          disabled={disabled}
          placeholder='选择模型'
        />
        {emptyHint ? <div className='text-muted-foreground mt-1.5 text-xs'>{emptyHint}</div> : null}
      </div>
    </div>
  );
}

import { BulbOutlined, ProjectOutlined } from '@ant-design/icons';
import { Button, Popover, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { useState } from 'react';

import type { EAgentMode } from '../../types/chat';

interface IProps {
  mode: EAgentMode;
  onChange: (mode: EAgentMode) => void;
}

const MODE_OPTIONS: Array<{ value: EAgentMode; label: string; hint: string; icon: ReactNode }> = [
  {
    value: 'ask',
    label: '问询模式',
    hint: '直接回答用户问题',
    icon: <BulbOutlined />,
  },
  {
    value: 'plan',
    label: '计划模式',
    hint: '先梳理计划再执行',
    icon: <ProjectOutlined />,
  },
];

/** 智能体模式选择：模型选择左侧的 icon + 下拉 */
export function ChatAgentModeControl({ mode, onChange }: IProps) {
  const [open, setOpen] = useState(false);
  const active = MODE_OPTIONS.find((item) => item.value === mode) ?? MODE_OPTIONS[0];

  const panel = (
    <div className='min-w-[180px] py-1'>
      {MODE_OPTIONS.map((item) => {
        const isSelected = item.value === mode;
        return (
          <button
            key={item.value}
            type='button'
            className={`flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-[var(--surface-hover)] ${
              isSelected ? 'text-blue-500' : 'text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => {
              onChange(item.value);
              setOpen(false);
            }}>
            <span className='mt-0.5 shrink-0'>{item.icon}</span>
            <span className='min-w-0'>
              <span className='block text-sm'>{item.label}</span>
              <span className='text-xs text-gray-500 dark:text-gray-400'>{item.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <Popover content={panel} trigger='click' placement='topLeft' open={open} onOpenChange={setOpen}>
      <Tooltip title='设置智能体'>
        <Button
          type='text'
          size='small'
          className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-[var(--surface-hover)] hover:text-blue-500 dark:text-gray-300'
          icon={active.icon}
        />
      </Tooltip>
    </Popover>
  );
}

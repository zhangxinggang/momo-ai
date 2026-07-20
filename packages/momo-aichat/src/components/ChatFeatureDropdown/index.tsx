import { DownOutlined } from '@ant-design/icons';
import { Button, Popover, Switch } from 'antd';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface IProps {
  label: string;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  enableTitle?: string;
  enableHint?: string;
  children?: ReactNode;
  /** 开启后才显示下方扩展内容 */
  showExtraWhenEnabled?: boolean;
  /** 完全自定义面板（不含默认开关行） */
  customPanel?: ReactNode;
}

/** RAG 等功能：标签 + 下拉箭头，面板首行为开关 */
export function ChatFeatureDropdown({
  label,
  enabled = false,
  onEnabledChange,
  enableTitle,
  enableHint,
  children,
  showExtraWhenEnabled = true,
  customPanel,
}: IProps) {
  const [open, setOpen] = useState(false);

  const panel = customPanel ? (
    <div className='chat-feature-dropdown-panel chat-feature-dropdown-panel--custom max-w-[320px] min-w-[280px] overflow-hidden px-3 py-2'>
      {customPanel}
    </div>
  ) : (
    <div className='chat-feature-dropdown-panel max-w-[280px] min-w-[240px] overflow-hidden py-1'>
      <div className='flex items-center justify-between gap-3 px-3 py-2'>
        <div className='min-w-0 flex-1'>
          <div className='text-sm text-gray-800 dark:text-gray-100'>{enableTitle}</div>
          {enableHint ? (
            <div className='mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400' title={enableHint}>
              {enableHint}
            </div>
          ) : null}
        </div>
        <Switch size='small' checked={enabled} onChange={onEnabledChange} />
      </div>
      {enabled && showExtraWhenEnabled && children ? (
        <div className='border-surface max-h-[220px] overflow-hidden border-t px-3 py-2'>{children}</div>
      ) : null}
    </div>
  );

  return (
    <Popover
      content={panel}
      trigger='click'
      placement='topLeft'
      autoAdjustOverflow
      destroyOnHidden
      open={open}
      onOpenChange={setOpen}>
      <Button
        type='text'
        size='small'
        className='chat-feature-dropdown-trigger flex h-7 items-center gap-0.5 rounded-lg px-1.5 text-xs text-gray-600 hover:bg-[var(--surface-hover)] dark:text-gray-300'>
        <span>{label}</span>
        <DownOutlined style={{ fontSize: 10 }} />
      </Button>
    </Popover>
  );
}

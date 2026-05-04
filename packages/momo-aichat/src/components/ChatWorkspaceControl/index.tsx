import { Switch, Tooltip } from 'antd';

import type { IChatWorkspaceConfig } from '../../types/workspace';
import { formatWorkspaceDisplayPath } from '../../utils/workspace-display';

export interface IProps {
  workspace: IChatWorkspaceConfig;
  /** 外层 Tooltip 文案，不传则不包裹 Tooltip */
  tooltip?: string;
  className?: string;
}

/**
 * AI 对话输入栏工作区开关与路径展示（通用组件）
 */
export function ChatWorkspaceControl({ workspace, tooltip, className }: IProps) {
  const pathCount = workspace.paths.length;

  const handleEnabledChange = (enabled: boolean) => {
    workspace.onEnabledChange(enabled);
    if (enabled && pathCount === 0) {
      workspace.onAddFolder();
    }
  };

  const control = (
    <div
      className={
        className ??
        'border-surface flex cursor-default items-center gap-2 rounded-xl border bg-[var(--surface)] px-2 py-1 transition-colors duration-200 hover:bg-[var(--surface-hover)]'
      }>
      <span className='text-xs text-gray-600 dark:text-gray-300'>{'工作区'}</span>
      <Switch size='small' checked={workspace.enabled} onChange={handleEnabledChange} />
      {workspace.enabled && pathCount > 0 ? (
        <span
          className='max-w-[120px] truncate text-xs text-gray-500 dark:text-gray-400'
          title={workspace.paths.join('\n')}>
          {pathCount === 1
            ? formatWorkspaceDisplayPath(workspace.paths[0])
            : `${pathCount} 个目录`}
        </span>
      ) : null}
    </div>
  );

  if (!tooltip) {
    return control;
  }

  return <Tooltip title={tooltip}>{control}</Tooltip>;
}

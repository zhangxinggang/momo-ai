import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface IProps {
  icon?: string;
  className?: string;
}

/** 将配置中的图标名转为 lucide-react 导出名 */
function toLucideExportName(iconKey: string): string {
  const trimmed = iconKey.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.endsWith('Icon')) {
    return trimmed;
  }

  let pascalName: string;
  if (trimmed.includes('-')) {
    pascalName = trimmed
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  } else if (/^[A-Z]/.test(trimmed)) {
    pascalName = trimmed;
  } else {
    pascalName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  return `${pascalName}Icon`;
}

/** 根据配置解析 Lucide 图标组件，未匹配时返回 null */
export function resolveToolboxLucideIcon(iconKey: string | undefined): LucideIcon | null {
  if (!iconKey?.trim()) {
    return null;
  }

  const exportName = toLucideExportName(iconKey);
  const iconRecord = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return iconRecord[exportName] ?? null;
}

/** 工具箱菜单 Lucide 图标（有 icon 配置时才渲染） */
export function ToolboxMenuIcon(props: IProps) {
  const { icon, className } = props;
  const IconComponent = resolveToolboxLucideIcon(icon);

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={clsx('h-4 w-4 shrink-0', className)} aria-hidden='true' />;
}

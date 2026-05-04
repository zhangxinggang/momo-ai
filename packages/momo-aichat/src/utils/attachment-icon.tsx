import {
  BracesIcon,
  CodeIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  type LucideIcon,
} from 'lucide-react';

/** 根据附件扩展名返回对应 Lucide 图标 */
export function getAttachmentIconComponent(ext: string): LucideIcon {
  const extLower = (ext || '').toLowerCase();
  if (extLower === 'docx') {
    return FileIcon;
  }
  if (extLower === 'md' || extLower === 'txt') {
    return FileTextIcon;
  }
  if (extLower === 'css') {
    return BracesIcon;
  }
  if (extLower === 'html') {
    return FileCodeIcon;
  }
  if (extLower === 'js' || extLower === 'py') {
    return CodeIcon;
  }
  return FileTextIcon;
}

interface IAttachmentIconProps {
  ext: string;
  className?: string;
  size?: number;
}

/** 附件类型图标（不依赖静态 svg 资源） */
export function ChatAttachmentIcon({ ext, className, size = 32 }: IAttachmentIconProps) {
  const Icon = getAttachmentIconComponent(ext);
  return <Icon className={className} size={size} aria-hidden />;
}

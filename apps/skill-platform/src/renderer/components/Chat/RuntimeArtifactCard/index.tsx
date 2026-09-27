import type { IChatSourceRef } from '@momo/aichat';
import { Button } from 'antd';
import { DownloadIcon, FileTextIcon, PanelRightOpenIcon } from 'lucide-react';

import styles from './index.module.less';

interface IArtifact {
  id: string;
  name: string;
  mimeType: string;
  size: number;
}

function formatFileSize(size: number): string {
  if (!Number.isFinite(size) || size < 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileKind(artifact: IArtifact): string {
  const extension = artifact.name.split('.').pop()?.trim();
  if (extension && extension !== artifact.name) return extension.toUpperCase();
  return artifact.mimeType.split('/').pop()?.toUpperCase() || '文件';
}

export function RuntimeArtifactCard({
  artifact,
  sourceRef,
  onOpen,
  onSave,
}: {
  artifact: IArtifact;
  sourceRef?: IChatSourceRef;
  onOpen: (sourceRef: IChatSourceRef) => void;
  onSave: () => void;
}) {
  const size = formatFileSize(artifact.size);
  const kind = getFileKind(artifact);

  return (
    <article className={styles.card} aria-label={`交付文件：${artifact.name}`}>
      <button
        className={styles.open}
        disabled={!sourceRef}
        onClick={() => sourceRef && onOpen(sourceRef)}
        title={sourceRef ? `在文件管理器中预览 ${artifact.name}` : '文件预览暂不可用'}
        type='button'>
        <span className={styles.icon} aria-hidden='true'>
          <FileTextIcon size={19} strokeWidth={1.8} />
        </span>
        <span className={styles.info}>
          <strong className={styles.name}>{artifact.name}</strong>
          <span className={styles.meta}>
            {kind}
            {size ? ` · ${size}` : ''}
          </span>
        </span>
        <PanelRightOpenIcon className={styles.openIcon} aria-hidden='true' size={15} />
      </button>
      <Button
        aria-label={`保存 ${artifact.name}`}
        className={styles.save}
        icon={<DownloadIcon size={15} />}
        onClick={onSave}
        size='small'
        title='保存到本地'
        type='text'
      />
    </article>
  );
}

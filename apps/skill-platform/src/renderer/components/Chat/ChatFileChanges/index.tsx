import type { IChatMessage } from '@momo/aichat';
import { flushReviewDrafts } from '@renderer/services/chat/review-drafts';
import { openChatReview } from '@renderer/services/chat/workspace-panel';
import { Button, message } from 'antd';
import { ChevronDownIcon, FileDiffIcon, Undo2Icon } from 'lucide-react';
import { useState } from 'react';
import styles from './index.module.less';
import { useFileChanges } from './useFileChanges';

export function ChatFileChanges({ reply }: { reply: IChatMessage }) {
  if (
    reply.requestSnapshot?.agentMode === 'ui' ||
    reply.requestSnapshot?.viewRequested ||
    reply.generatedView
  )
    return null;
  return <FileChangesCard reply={reply} />;
}

function FileChangesCard({ reply }: { reply: IChatMessage }) {
  const { changes, setChanges } = useFileChanges(reply.runId);
  const [expanded, setExpanded] = useState(false);
  const [undoing, setUndoing] = useState(false);
  if (!changes?.files.length) return null;
  const added = changes.files.reduce((count, file) => count + file.added, 0);
  const removed = changes.files.reduce((count, file) => count + file.removed, 0);
  const pending = changes.files.some((file) => file.status === 'pending');
  const undo = async () => {
    setUndoing(true);
    try {
      await flushReviewDrafts();
      const result = await window.api.agentRuntime.undoChanges(changes.runId);
      setChanges(result.changes);
      message.success(
        result.preserved ? '已撤销未被人工修改的内容，保留了后续编辑' : '已撤销本轮文件修改',
      );
    } catch (error) {
      message.error(error instanceof Error ? error.message : '撤销失败');
    } finally {
      setUndoing(false);
    }
  };
  const openReview = (path?: string) => openChatReview(changes.runId, path);
  return (
    <section className={styles.card} aria-label='本轮文件修改'>
      <header className={styles.header}>
        <FileDiffIcon size={20} aria-hidden />
        <div className={styles.summary}>
          <strong>已编辑 {changes.files.length} 个文件</strong>
          <span>
            <b className={styles.added}>+{added}</b> <b className={styles.removed}>-{removed}</b>
          </span>
        </div>
        <div className={styles.actions}>
          {pending ? (
            <Button
              type='text'
              size='small'
              icon={<Undo2Icon size={14} />}
              disabled={!!reply.isLoading}
              loading={undoing}
              onClick={() => void undo()}>
              撤销
            </Button>
          ) : (
            <span className={styles.status}>
              {changes.files.every((file) => file.status === 'undone') ? '已撤销' : '已接受'}
            </span>
          )}
          <Button size='small' onClick={() => openReview()}>
            查看变更
          </Button>
        </div>
      </header>
      <div className={styles.files}>
        {(expanded ? changes.files : changes.files.slice(0, 3)).map((file) => (
          <button
            key={file.path}
            type='button'
            title={file.path}
            className={styles.file}
            onClick={() => openReview(file.path)}>
            <span className={styles.path}>{file.relativePath}</span>
            <span className={styles.counts}>
              <b className={styles.added}>+{file.added}</b>{' '}
              <b className={styles.removed}>-{file.removed}</b>
            </span>
          </button>
        ))}
        {changes.files.length > 3 ? (
          <button
            type='button'
            className={styles.more}
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}>
            {expanded ? '收起文件' : `再显示 ${changes.files.length - 3} 个文件`}{' '}
            <ChevronDownIcon size={14} />
          </button>
        ) : null}
      </div>
    </section>
  );
}

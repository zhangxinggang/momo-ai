import { lineChanges } from '@/shared/file-change-diff';
import type { WorkspaceFileReview } from '@momo/agent-contracts';
import { CodeFileEditor, useSyncedCodeEditorTheme } from '@momo/file-editor';
import {
  discardReviewDraft,
  flushReviewDrafts,
  getReviewDraft,
  setReviewDraft,
} from '@renderer/services/chat/review-drafts';
import { Button, Spin, message } from 'antd';
import { FileCode2Icon, FilesIcon, RefreshCwIcon, SaveIcon, XIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../ChatWorkspacePanel/index.module.less';
import { useFileChanges } from './useFileChanges';

export function ReviewPanel({
  runId,
  selectedPath,
  busy,
}: {
  runId?: string;
  selectedPath?: string;
  busy: boolean;
}) {
  const { changes, error } = useFileChanges(runId);
  const [path, setPath] = useState('');
  const [review, setReview] = useState<WorkspaceFileReview | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const theme = useSyncedCodeEditorTheme();
  const request = useRef(0);
  const selected = changes?.files.find((file) => file.path === path) ?? changes?.files[0];
  useEffect(() => {
    setPath(selectedPath ?? '');
  }, [runId, selectedPath]);
  const load = async () => {
    const id = ++request.current;
    if (!runId || !selected) {
      setReview(null);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const pending = getReviewDraft(runId, selected.path);
      const result =
        pending?.review ?? (await window.api.agentRuntime.reviewChange(runId, selected.path));
      if (id !== request.current) return;
      setReview(result);
      setDraft(pending?.content ?? result.current);
    } catch (reason) {
      if (id === request.current)
        setLoadError(reason instanceof Error ? reason.message : '加载失败');
    } finally {
      if (id === request.current) setLoading(false);
    }
  };
  useEffect(() => {
    void load();
    return () => {
      request.current++;
    };
  }, [runId, selected?.path, changes]);
  const diff = useMemo(() => lineChanges(review?.before ?? '', draft), [review?.before, draft]);
  const save = async () => {
    setSaving(true);
    try {
      await flushReviewDrafts();
      await load();
      message.success('校正内容已保存，撤销时会保留人工修改');
    } catch (reason) {
      message.error(reason instanceof Error ? reason.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };
  if (!changes?.files.length)
    return (
      <div className={styles['panel-empty']}>
        <FilesIcon aria-hidden size={32} />
        <strong>还没有可审阅的文件</strong>
        <span>{error || '本轮文件修改会在这里显示。'}</span>
      </div>
    );
  return (
    <div className={styles.review}>
      <aside className={styles['review-list']}>
        <div className={styles['review-list-title']}>本轮文件修改</div>
        {changes.files.map((file) => (
          <button
            key={file.path}
            className={`${styles['review-file']} ${file.path === selected?.path ? styles['review-file--active'] : ''}`}
            type='button'
            title={file.path}
            onClick={() => setPath(file.path)}>
            <FileCode2Icon size={14} aria-hidden />
            <span>{file.relativePath}</span>
          </button>
        ))}
      </aside>
      <section className={styles['review-main']}>
        <header className={styles['review-header']}>
          <div>
            <strong title={selected?.path}>{selected?.relativePath}</strong>
            <span>
              本轮修改前 → 当前文件 · +{diff.added} -{diff.removed}
              {draft !== review?.current ? ' · 尚未保存' : ''}
            </span>
          </div>
          <div className={styles['review-actions']}>
            {draft !== review?.current && review ? (
              <Button
                aria-label='放弃校正'
                title='放弃校正'
                icon={<XIcon size={14} />}
                size='small'
                disabled={saving}
                onClick={() => {
                  discardReviewDraft(runId!, review.path);
                  void load();
                }}>
                放弃校正
              </Button>
            ) : null}
            <Button
              aria-label='刷新审阅'
              title='刷新审阅'
              size='small'
              icon={<RefreshCwIcon size={14} />}
              disabled={draft !== review?.current || loading}
              onClick={() => void load()}
            />
            <Button
              size='small'
              aria-label='保存校正'
              title='保存校正'
              icon={<SaveIcon size={14} />}
              disabled={busy || loading || draft === review?.current}
              loading={saving}
              onClick={() => void save()}>
              保存校正
            </Button>
          </div>
        </header>
        {loading ? (
          <div className={styles['review-loading']}>
            <Spin size='small' />
          </div>
        ) : loadError || !review ? (
          <div className={styles['panel-empty']}>{loadError || '无法加载文件'}</div>
        ) : (
          <div className={styles['review-comparison']}>
            <div className={styles['review-side']}>
              <div className={styles['review-side-title']}>源文件 · 修改前</div>
              <CodeFileEditor
                key={review.path + '-before'}
                value={review.before}
                relativePath={selected!.relativePath}
                readOnly
                onChange={() => {}}
                themeId={theme}
                highlightedLines={{ lines: diff.deletions, kind: 'remove' }}
              />
            </div>
            <div className={styles['review-side']}>
              <div className={styles['review-side-title']}>
                当前文件 · {busy ? '生成完成后可编辑' : '可直接编辑，Ctrl+S 保存'}
              </div>
              <CodeFileEditor
                key={review.path + '-after'}
                value={draft}
                relativePath={selected!.relativePath}
                readOnly={busy}
                onChange={(value) => {
                  setDraft(value);
                  setReviewDraft(runId!, review, value);
                }}
                onSave={() => void save()}
                themeId={theme}
                highlightedLines={{ lines: diff.additions, kind: 'add' }}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

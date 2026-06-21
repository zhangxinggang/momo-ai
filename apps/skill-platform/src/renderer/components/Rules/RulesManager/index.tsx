import { useEffect, useMemo, useState } from 'react';

import type { IRuleFileId } from '@/types/modules/rules';
import { ConfirmDialog } from '@renderer/components/ui/ConfirmDialog';
import { PlatformIcon } from '@renderer/components/ui/PlatformIcon';
import { useToast } from '@renderer/components/ui/Toast';
import { openPath } from '@renderer/services/desktop';
import { generateTextDiff } from '@renderer/services/rules/text-diff';
import { useRulesStore } from '@renderer/store/rules';
import {
  AlertCircleIcon,
  BookOpenIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  Loader2Icon,
  MinusIcon,
  PlusIcon,
  SaveIcon,
  SparklesIcon,
} from 'lucide-react';

function getParentDirectory(filePath: string): string {
  const normalized = filePath.replace(/[\\/]+$/, '');
  const separatorIndex = Math.max(normalized.lastIndexOf('/'), normalized.lastIndexOf('\\'));

  if (separatorIndex <= 0) {
    return normalized;
  }

  return normalized.slice(0, separatorIndex);
}

export function RulesManager() {
  const { showToast } = useToast();
  const currentFile = useRulesStore((state) => state.currentFile);
  const draftContent = useRulesStore((state) => state.draftContent);
  const aiInstruction = useRulesStore((state) => state.aiInstruction);
  const aiSummary = useRulesStore((state) => state.aiSummary);
  const isLoading = useRulesStore((state) => state.isLoading);
  const isSaving = useRulesStore((state) => state.isSaving);
  const isRewriting = useRulesStore((state) => state.isRewriting);
  const error = useRulesStore((state) => state.error);
  const hasLoadedFiles = useRulesStore((state) => state.hasLoadedFiles);
  const loadFiles = useRulesStore((state) => state.loadFiles);
  const setDraftContent = useRulesStore((state) => state.setDraftContent);
  const setAiInstruction = useRulesStore((state) => state.setAiInstruction);
  const saveCurrentRule = useRulesStore((state) => state.saveCurrentRule);
  const resolveCurrentRuleConflict = useRulesStore((state) => state.resolveCurrentRuleConflict);
  const rewriteCurrentRule = useRulesStore((state) => state.rewriteCurrentRule);

  const [dismissedConflictRuleId, setDismissedConflictRuleId] = useState<IRuleFileId | null>(null);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);
  const [pendingConflictStrategy, setPendingConflictStrategy] = useState<
    'use-managed' | 'use-target' | null
  >(null);

  useEffect(() => {
    if (!hasLoadedFiles) {
      void loadFiles();
    }
  }, [hasLoadedFiles, loadFiles]);

  useEffect(() => {
    setDismissedConflictRuleId(null);
  }, [currentFile?.id]);

  const syncConflictFile =
    currentFile?.syncStatus === 'out-of-sync' &&
    typeof currentFile.targetContent === 'string' &&
    dismissedConflictRuleId !== currentFile.id
      ? currentFile
      : null;

  const hasChanges = currentFile ? draftContent !== currentFile.content : false;

  const diffStats = useMemo(() => {
    if (!currentFile) {
      return { added: 0, removed: 0 };
    }
    const diff = generateTextDiff(currentFile.content, draftContent);
    return {
      added: diff.filter((line) => line.type === 'add').length,
      removed: diff.filter((line) => line.type === 'remove').length,
    };
  }, [currentFile, draftContent]);

  const handleSave = async () => {
    try {
      await saveCurrentRule();
      showToast('保存成功', 'success');
    } catch (saveError) {
      showToast(saveError instanceof Error ? saveError.message : '保存失败', 'error');
    }
  };

  const handleOpenLocation = async () => {
    if (!currentFile?.path) {
      return;
    }

    const result = await openPath(getParentDirectory(currentFile.path));
    if (result && !result.success) {
      showToast(result.error || '无法打开文件位置', 'error');
    }
  };

  const handleResolveConflict = async (strategy: 'use-managed' | 'use-target') => {
    setIsResolvingConflict(true);
    try {
      await resolveCurrentRuleConflict(strategy);
      setDismissedConflictRuleId(currentFile?.id ?? null);
      showToast(
        strategy === 'use-managed'
          ? '已保留平台版本并同步到外部文件'
          : '已保留外部文件版本并同步到平台',
        'success',
      );
    } catch (resolveError) {
      showToast(resolveError instanceof Error ? resolveError.message : '冲突解决失败', 'error');
    } finally {
      setIsResolvingConflict(false);
      setPendingConflictStrategy(null);
    }
  };

  const handleAiRewrite = async () => {
    try {
      await rewriteCurrentRule();
      showToast('AI 草稿已生成', 'success');
    } catch (rewriteError) {
      showToast(rewriteError instanceof Error ? rewriteError.message : 'AI 改写失败', 'error');
    }
  };

  const editorLineCount = draftContent.split('\n').length;
  const editorCharCount = draftContent.length;

  return (
    <>
      <div className='bg-background animate-in fade-in duration-base ease-enter flex h-full min-h-0'>
        <div className='flex min-w-0 flex-1 flex-col'>
          <div
            key={currentFile?.id ?? 'rules-empty'}
            className='animate-in fade-in slide-in-from-bottom-1 duration-base ease-enter grid min-h-0 flex-1 grid-cols-[minmax(280px,340px)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]'>
            <div className='border-border bg-muted/20 border-b border-r px-5 py-4'>
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    {currentFile?.platformId === 'workspace' ? (
                      <FolderIcon className='text-primary h-4 w-4' />
                    ) : currentFile ? (
                      <PlatformIcon
                        platformId={currentFile.platformId}
                        size={16}
                        className='h-4 w-4'
                      />
                    ) : (
                      <BookOpenIcon className='text-primary h-4 w-4' />
                    )}
                    <span className='truncate'>{currentFile?.platformName || '规则'}</span>
                  </div>
                  <h3 className='text-foreground mt-1.5 truncate text-xl font-semibold'>
                    {currentFile?.name || '未选择文件'}
                  </h3>
                </div>
                {currentFile?.path ? (
                  <button
                    type='button'
                    onClick={() => void handleOpenLocation()}
                    className='text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 rounded-lg p-2 transition-colors'
                    title='打开文件位置'
                    aria-label='打开文件位置'>
                    <FolderOpenIcon className='h-4 w-4' />
                  </button>
                ) : null}
              </div>

              {currentFile?.path ? (
                <div className='mt-2.5 flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground truncate' title={currentFile.path}>
                    {currentFile.path}
                  </span>
                </div>
              ) : null}

              {hasChanges ? (
                <div className='mt-3 flex items-center gap-2'>
                  <div className='flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
                    <PlusIcon className='h-3 w-3' />
                    {diffStats.added} 新增
                  </div>
                  <div className='bg-destructive/10 text-destructive flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium'>
                    <MinusIcon className='h-3 w-3' />
                    {diffStats.removed} 删除
                  </div>
                </div>
              ) : null}
            </div>

            <div className='border-border flex items-start justify-between border-b px-5 py-4'>
              <div className='min-w-0'>
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <FileTextIcon className='text-primary h-4 w-4' />
                  规则内容
                </div>
                <h3 className='text-foreground mt-1 truncate text-lg font-semibold'>
                  {currentFile?.name || '规则'}
                </h3>
                <div className='mt-1 flex flex-wrap items-center gap-2 text-xs'>
                  <span
                    className={
                      hasChanges
                        ? 'font-medium text-amber-500 dark:text-amber-400'
                        : 'text-muted-foreground'
                    }>
                    {hasChanges ? '草稿有未保存的更改' : '草稿与已保存文件一致'}
                  </span>
                </div>
              </div>

              <button
                type='button'
                onClick={() => void handleSave()}
                disabled={!currentFile || isSaving || !hasChanges}
                className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50'>
                {hasChanges && !isSaving ? (
                  <span className='relative flex h-2 w-2'>
                    <span className='bg-primary-foreground absolute inline-flex h-full w-full animate-ping rounded-full opacity-60' />
                    <span className='bg-primary-foreground relative inline-flex h-2 w-2 rounded-full' />
                  </span>
                ) : (
                  <SaveIcon className='h-4 w-4' />
                )}
                {isSaving ? '保存中…' : '保存并覆盖文件'}
              </button>
            </div>

            <div className='border-border bg-muted/20 flex min-h-0 flex-col overflow-y-auto border-r p-5'>
              <div>
                <div className='text-foreground flex items-center gap-2 text-sm font-semibold'>
                  <SparklesIcon className='text-primary h-4 w-4' />
                  AI 优化
                </div>
                <p className='text-muted-foreground mt-1.5 text-xs leading-5'>
                  描述你想要的修改，AI 将为当前规则文件生成新草稿。
                </p>
                <textarea
                  value={aiInstruction}
                  onChange={(event) => setAiInstruction(event.target.value)}
                  className='border-border bg-background text-foreground focus:border-primary/40 focus:ring-primary/40 mt-3 h-24 w-full resize-none rounded-xl border p-3 text-sm outline-none transition-colors focus:ring-1'
                  placeholder='例如：补充测试要求、重组章节，或在保留现有 Markdown 标题的前提下加强约束。'
                />
                {aiSummary ? (
                  <div className='border-primary/20 bg-primary/8 text-primary mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs'>
                    <SparklesIcon className='mt-0.5 h-3.5 w-3.5 shrink-0' />
                    <span>AI 已生成新草稿，请审阅后保存。</span>
                  </div>
                ) : null}
                <button
                  type='button'
                  onClick={() => void handleAiRewrite()}
                  disabled={!currentFile || isRewriting || !aiInstruction.trim()}
                  className='border-border bg-background text-foreground hover:bg-muted mt-2 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'>
                  <SparklesIcon className='h-4 w-4' />
                  {isRewriting ? '正在生成草稿…' : 'AI 优化'}
                </button>
              </div>
            </div>

            <div className='bg-background flex min-h-0 min-w-0 flex-col'>
              {error ? (
                <div className='border-destructive/30 bg-destructive/10 text-destructive mx-6 mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm'>
                  <AlertCircleIcon className='mt-0.5 h-4 w-4 shrink-0' />
                  <div>{error}</div>
                </div>
              ) : null}

              <div className='min-h-0 flex-1 p-6'>
                {isLoading && !currentFile ? (
                  <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
                    加载中…
                  </div>
                ) : (
                  <div
                    className={`bg-card animate-in fade-in zoom-in-95 duration-base ease-enter flex h-full min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm transition-colors ${isRewriting ? 'border-primary/40' : 'border-border'}`}>
                    <div className='border-border/70 bg-muted/30 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5 text-xs'>
                      {isRewriting ? (
                        <span className='text-primary flex items-center gap-1.5'>
                          <Loader2Icon className='h-3 w-3 animate-spin' />
                          正在生成草稿…
                        </span>
                      ) : (
                        <span className='text-muted-foreground'>
                          草稿编辑器 - 点击保存前不会写入文件
                        </span>
                      )}
                      <div className='text-muted-foreground flex items-center gap-3'>
                        <span>{editorLineCount} 行</span>
                        <span className='text-border'>·</span>
                        <span>{editorCharCount} 字符</span>
                      </div>
                    </div>
                    <textarea
                      value={draftContent}
                      onChange={(event) => setDraftContent(event.target.value)}
                      readOnly={isRewriting}
                      className={`bg-card text-foreground placeholder:text-muted-foreground focus:ring-primary/30 h-full min-h-0 w-full flex-1 resize-none p-5 font-mono text-sm leading-relaxed outline-none transition-colors focus:ring-1 ${isRewriting ? 'cursor-not-allowed opacity-50' : ''}`}
                      placeholder='规则内容将显示在此处'
                      spellCheck={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {syncConflictFile ? (
        <div className='fixed inset-0 z-[99999] flex items-center justify-center p-4'>
          <div
            className='bg-background/60 absolute inset-0 backdrop-blur-sm'
            onClick={() => setDismissedConflictRuleId(syncConflictFile.id)}
          />
          <div className='border-border bg-card animate-in fade-in zoom-in-95 duration-base relative w-full max-w-lg rounded-xl border p-6 shadow-2xl'>
            <div className='flex items-start gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400'>
                <AlertCircleIcon className='h-5 w-5' />
              </div>
              <div className='min-w-0'>
                <h3 className='text-foreground text-base font-semibold'>外部规则文件已变更</h3>
                <p className='text-muted-foreground mt-1 text-sm leading-6'>
                  外部规则文件已变更，与平台管理的副本不一致。请选择保留哪个版本作为最终来源，确认后另一个版本将被覆盖。
                </p>
              </div>
            </div>
            <div className='mt-4 grid gap-3 text-xs md:grid-cols-2'>
              <div className='border-border bg-background min-h-0 rounded-lg border p-3'>
                <div className='text-foreground mb-2 font-medium'>平台版本</div>
                <pre className='text-muted-foreground max-h-40 overflow-auto whitespace-pre-wrap break-words'>
                  {syncConflictFile.content || '规则内容将显示在此处'}
                </pre>
              </div>
              <div className='border-border bg-background min-h-0 rounded-lg border p-3'>
                <div className='text-foreground mb-2 font-medium'>外部文件版本</div>
                <pre className='text-muted-foreground max-h-40 overflow-auto whitespace-pre-wrap break-words'>
                  {syncConflictFile.targetContent || '规则内容将显示在此处'}
                </pre>
              </div>
            </div>
            <div className='mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={() => setDismissedConflictRuleId(syncConflictFile.id)}
                disabled={isResolvingConflict}
                className='border-border bg-background text-foreground hover:bg-muted h-10 rounded-lg border px-4 text-sm font-medium transition-colors disabled:opacity-50'>
                取消
              </button>
              <button
                type='button'
                onClick={() => setPendingConflictStrategy('use-managed')}
                disabled={isResolvingConflict}
                className='border-border bg-background text-foreground hover:bg-muted h-10 rounded-lg border px-4 text-sm font-medium transition-colors disabled:opacity-50'>
                保留平台版本
              </button>
              <button
                type='button'
                onClick={() => setPendingConflictStrategy('use-target')}
                disabled={isResolvingConflict}
                className='bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg px-4 text-sm font-medium transition-colors disabled:opacity-60'>
                {isResolvingConflict ? '保存中…' : '保留外部文件版本'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={pendingConflictStrategy !== null}
        onClose={() => setPendingConflictStrategy(null)}
        onConfirm={() => {
          if (!pendingConflictStrategy) return;
          void handleResolveConflict(pendingConflictStrategy);
        }}
        title={pendingConflictStrategy === 'use-managed' ? '保留平台版本？' : '保留外部文件版本？'}
        message={
          pendingConflictStrategy === 'use-managed'
            ? '平台管理的副本将成为最终来源，并覆盖外部规则文件。'
            : '外部规则文件将成为最终来源，并覆盖平台管理的副本。'
        }
        confirmText={pendingConflictStrategy === 'use-managed' ? '保留平台版本' : '保留外部版本'}
        cancelText='取消'
        isLoading={isResolvingConflict}
      />
    </>
  );
}

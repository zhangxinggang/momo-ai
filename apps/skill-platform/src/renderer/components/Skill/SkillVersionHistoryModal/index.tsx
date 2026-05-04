import type { ISkill, ISkillVersion } from '@/types/modules';
import { generateTextDiff, restoreSkillVersion } from '@renderer/services/skill/detail-utils';
import {
  buildVersionFileDiffEntries,
  resolveVersionSnapshots,
  snapshotsFromLocalFiles,
} from '@renderer/services/skill/version-utils';
import { Button, Modal, Select } from 'antd';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Clock3Icon,
  GitBranchIcon,
  GitCompareIcon,
  HistoryIcon,
  Loader2Icon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  skill: ISkill;
  currentContent: string;
  onReload: () => Promise<void>;
}

type CompareTarget = 'current' | string;
type ContentView = 'preview' | 'diff';

function SkillDiffView({
  oldText,
  newText,
  label,
  emptyLabel,
}: {
  oldText: string;
  newText: string;
  label: string;
  emptyLabel: string;
}) {
  const diff = useMemo(() => generateTextDiff(oldText, newText), [oldText, newText]);
  const stats = useMemo(
    () => ({
      added: diff.filter((line) => line.type === 'add').length,
      removed: diff.filter((line) => line.type === 'remove').length,
    }),
    [diff],
  );
  const isUnchanged = stats.added === 0 && stats.removed === 0;

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
          {label}
        </div>
        {!isUnchanged ? (
          <div className='flex items-center gap-3 text-xs'>
            <span className='flex items-center gap-1 text-green-600 dark:text-green-300'>
              <PlusIcon className='h-3 w-3' />
              {stats.added}
            </span>
            <span className='flex items-center gap-1 text-red-600 dark:text-red-300'>
              <MinusIcon className='h-3 w-3' />
              {stats.removed}
            </span>
          </div>
        ) : null}
      </div>

      {isUnchanged ? (
        <div className='border-border app-wallpaper-surface text-muted-foreground rounded-2xl border px-4 py-8 text-center text-sm'>
          {emptyLabel}
        </div>
      ) : (
        <div className='border-border app-wallpaper-surface overflow-hidden rounded-2xl border font-mono text-xs'>
          <div className='max-h-[360px] overflow-auto'>
            {diff.map((line, index) => (
              <div
                key={`${line.type}-${index}-${line.oldLineNum ?? 0}-${line.newLineNum ?? 0}`}
                className={`flex ${
                  line.type === 'add'
                    ? 'bg-green-500/15 text-green-700 dark:text-green-300'
                    : line.type === 'remove'
                      ? 'bg-red-500/15 text-red-700 dark:text-red-300'
                      : 'text-foreground/80'
                }`}>
                <div className='border-border/60 text-muted-foreground/60 flex w-16 flex-shrink-0 select-none border-r'>
                  <span className='border-border/40 w-8 border-r px-1 text-right'>
                    {line.oldLineNum || ''}
                  </span>
                  <span className='w-8 px-1 text-right'>{line.newLineNum || ''}</span>
                </div>
                <div className='w-5 flex-shrink-0 text-center font-bold'>
                  {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                </div>
                <div className='flex-1 whitespace-pre-wrap break-all px-2 py-0.5'>
                  {line.content || ' '}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SkillVersionHistoryModal({
  isOpen,
  onClose,
  skill,
  currentContent,
  onReload,
}: IProps) {
  const [versions, setVersions] = useState<ISkillVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [compareTarget, setCompareTarget] = useState<CompareTarget>('current');
  const [view, setView] = useState<ContentView>('preview');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState<ISkillVersion | null>(null);
  const [currentFilesSnapshot, setCurrentFilesSnapshot] = useState<
    Array<{ relativePath: string; content: string }>
  >([]);
  const [expandedFilePaths, setExpandedFilePaths] = useState<Set<string>>(new Set());

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    try {
      const [versionsResult, currentFilesResult] = await Promise.allSettled([
        window.api.skill.versionGetAll(skill.id),
        window.api.skill.readLocalFiles(skill.id),
      ]);
      if (versionsResult.status !== 'fulfilled') {
        throw versionsResult.reason;
      }
      const nextVersions = versionsResult.value;
      setVersions(nextVersions);
      setCurrentFilesSnapshot(
        currentFilesResult.status === 'fulfilled'
          ? snapshotsFromLocalFiles(currentFilesResult.value, currentContent)
          : resolveVersionSnapshots(null, currentContent),
      );
      setSelectedVersionId(nextVersions[0]?.id ?? null);
      setCompareTarget('current');
      setView('preview');
    } catch (error) {
      console.error('Failed to load skill versions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentContent, skill.id]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    void loadVersions();
  }, [isOpen, loadVersions]);

  const selectedVersion = useMemo(
    () => versions.find((item) => item.id === selectedVersionId) ?? null,
    [selectedVersionId, versions],
  );

  const compareOptions = useMemo(
    () => [
      {
        id: 'current',
        label: '当前版本',
        content: currentContent,
      },
      ...versions
        .filter((version) => version.id !== selectedVersionId)
        .map((version) => ({
          id: version.id,
          label: `v${version.version}`,
          content: version.content || '',
        })),
    ],
    [currentContent, selectedVersionId, versions],
  );

  useEffect(() => {
    if (!compareOptions.some((option) => option.id === compareTarget)) {
      setCompareTarget('current');
    }
  }, [compareOptions, compareTarget]);

  const compareVersion = useMemo(
    () =>
      compareTarget === 'current'
        ? null
        : (versions.find((version) => version.id === compareTarget) ?? null),
    [compareTarget, versions],
  );

  const compareLabel = compareVersion ? `v${compareVersion.version}` : '当前版本';
  const selectedFilesSnapshot = useMemo(
    () => resolveVersionSnapshots(selectedVersion, selectedVersion?.content || ''),
    [selectedVersion],
  );
  const compareFilesSnapshot = useMemo(
    () =>
      compareTarget === 'current'
        ? currentFilesSnapshot
        : resolveVersionSnapshots(compareVersion, compareVersion?.content || ''),
    [compareTarget, compareVersion, currentFilesSnapshot],
  );
  const fileDiffEntries = useMemo(
    () => buildVersionFileDiffEntries(compareFilesSnapshot, selectedFilesSnapshot),
    [compareFilesSnapshot, selectedFilesSnapshot],
  );
  const changedFileEntries = useMemo(
    () => fileDiffEntries.filter((entry) => !entry.unchanged),
    [fileDiffEntries],
  );

  useEffect(() => {
    const nextExpanded = new Set<string>();
    for (const entry of changedFileEntries) {
      nextExpanded.add(entry.path);
    }
    if (nextExpanded.size === 0 && fileDiffEntries[0]) {
      nextExpanded.add(fileDiffEntries[0].path);
    }
    setExpandedFilePaths(nextExpanded);
  }, [changedFileEntries, compareTarget, fileDiffEntries, selectedVersionId]);

  const toggleFileExpanded = (path: string) => {
    setExpandedFilePaths((previous) => {
      const next = new Set(previous);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAllFiles = () =>
    setExpandedFilePaths(new Set(fileDiffEntries.map((entry) => entry.path)));

  const collapseAllFiles = () => setExpandedFilePaths(new Set());

  const handleRestore = async () => {
    if (!selectedVersion) {
      return;
    }

    setIsRestoring(true);
    try {
      await restoreSkillVersion(skill.id, selectedVersion, onReload);
      onClose();
    } catch (error) {
      console.error('Failed to restore skill version:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDelete = async () => {
    if (!versionToDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await window.api.skill.versionDelete(skill.id, versionToDelete.id);
      setVersionToDelete(null);
      await loadVersions();
    } catch (error) {
      console.error('Failed to delete skill version:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        title={'版本历史'}
        width={1000}
        footer={null}
        destroyOnClose>
        {isLoading ? (
          <div className='text-muted-foreground flex items-center justify-center py-16'>
            <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
            {'加载中…'}
          </div>
        ) : versions.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <HistoryIcon className='text-muted-foreground/40 mb-4 h-12 w-12' />
            <div className='text-foreground text-sm font-medium'>{'还没有历史版本'}</div>
            <div className='text-muted-foreground mt-2 max-w-md text-xs leading-6'>
              {'后续编辑 SKILL.md 或文件树时会自动生成快照，这里会显示可回滚的版本。'}
            </div>
          </div>
        ) : (
          <div className='grid min-h-[460px] gap-4 lg:grid-cols-[220px,1fr]'>
            <div className='border-border bg-background/60 rounded-2xl border p-3'>
              <div className='text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide'>
                <Clock3Icon className='h-3.5 w-3.5' />
                {'时间线'}
              </div>
              <div className='space-y-2'>
                {versions.map((version) => (
                  <Button
                    key={version.id}
                    onClick={() => setSelectedVersionId(version.id)}
                    className={`h-auto w-full whitespace-normal rounded-xl border px-3 py-2 text-left ${
                      version.id === selectedVersionId
                        ? 'border-primary/40 bg-primary/5'
                        : 'hover:border-border hover:app-wallpaper-surface border-transparent'
                    }`}>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-foreground text-sm font-semibold'>
                        v{version.version}
                      </span>
                      <GitBranchIcon className='text-primary h-3.5 w-3.5' />
                    </div>
                    <div className='text-muted-foreground mt-1 text-[11px]'>
                      {new Date(version.createdAt).toLocaleString()}
                    </div>
                    {version.note ? (
                      <div className='text-muted-foreground mt-2 line-clamp-2 text-xs'>
                        {version.note}
                      </div>
                    ) : null}
                  </Button>
                ))}
              </div>
            </div>

            <div className='border-border bg-background/60 flex flex-col rounded-2xl border'>
              <div className='border-border border-b px-4 py-3'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <div className='text-foreground text-sm font-semibold'>
                      {selectedVersion ? `恢复到此版本 v${selectedVersion.version}` : '版本历史'}
                    </div>
                    <div className='text-muted-foreground mt-1 text-xs'>
                      {selectedVersion?.note || '选择一个版本进行回滚'}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='border-border app-wallpaper-surface inline-flex rounded-xl border p-1'>
                      <Button
                        type={view === 'preview' ? 'primary' : 'text'}
                        size='small'
                        onClick={() => setView('preview')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                          view === 'preview' ? 'shadow-sm' : 'text-muted-foreground'
                        }`}>
                        {'预览'}
                      </Button>
                      <Button
                        type={view === 'diff' ? 'primary' : 'text'}
                        size='small'
                        onClick={() => setView('diff')}
                        icon={<GitCompareIcon className='h-3.5 w-3.5' />}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                          view === 'diff' ? 'shadow-sm' : 'text-muted-foreground'
                        }`}>
                        {'Diff'}
                      </Button>
                    </div>
                    <Button
                      danger
                      onClick={() => selectedVersion && setVersionToDelete(selectedVersion)}
                      disabled={!selectedVersion || isDeleting || isRestoring}
                      icon={
                        isDeleting ? (
                          <Loader2Icon className='h-4 w-4 animate-spin' />
                        ) : (
                          <TrashIcon className='h-4 w-4' />
                        )
                      }
                      className='inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10'>
                      {'删除'}
                    </Button>
                    <Button
                      type='primary'
                      onClick={handleRestore}
                      disabled={!selectedVersion || isRestoring}
                      loading={isRestoring}
                      icon={isRestoring ? undefined : <RotateCcwIcon className='h-4 w-4' />}
                      className='inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium'>
                      {isRestoring ? '恢复中...' : '恢复'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className='flex-1 p-4'>
                {view === 'diff' ? (
                  <div className='space-y-4'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                      <div className='flex flex-wrap items-center gap-3'>
                        <div className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
                          {'比较对象'}
                        </div>
                        <Select
                          className='min-w-[12rem]'
                          value={compareTarget}
                          options={compareOptions.map((option) => ({
                            label: option.label,
                            value: option.id,
                          }))}
                          onChange={(value) => setCompareTarget(value as CompareTarget)}
                        />
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          size='small'
                          onClick={expandAllFiles}
                          className='border-border app-wallpaper-surface hover:bg-accent rounded-lg border px-3'>
                          {'全部展开'}
                        </Button>
                        <Button
                          size='small'
                          onClick={collapseAllFiles}
                          className='border-border app-wallpaper-surface hover:bg-accent rounded-lg border px-3'>
                          {'全部收起'}
                        </Button>
                      </div>
                    </div>
                    <div className='text-muted-foreground flex flex-wrap items-center gap-2 text-xs'>
                      <span className='app-wallpaper-surface rounded-full px-3 py-1'>
                        {'版本文件'}: {fileDiffEntries.length}
                      </span>
                      <span className='bg-primary/10 text-primary rounded-full px-3 py-1'>
                        {`已变更 ${changedFileEntries.length} 个文件`}
                      </span>
                    </div>
                    <div className='space-y-3'>
                      {fileDiffEntries.map((entry) => {
                        const isExpanded = expandedFilePaths.has(entry.path);
                        const compareSummary = `${compareLabel} -> ${selectedVersion ? `v${selectedVersion.version}` : '-'}`;

                        return (
                          <div
                            key={entry.path}
                            className='border-border bg-background/70 overflow-hidden rounded-2xl border'>
                            <Button
                              type='text'
                              block
                              onClick={() => toggleFileExpanded(entry.path)}
                              className='hover:bg-accent/40 flex h-auto w-full items-center justify-between gap-3 px-4 py-3 text-left'>
                              <div className='min-w-0'>
                                <div className='flex items-center gap-2'>
                                  {isExpanded ? (
                                    <ChevronDownIcon className='text-muted-foreground h-4 w-4' />
                                  ) : (
                                    <ChevronRightIcon className='text-muted-foreground h-4 w-4' />
                                  )}
                                  <span className='text-foreground truncate font-mono text-sm'>
                                    {entry.path}
                                  </span>
                                </div>
                                <div className='text-muted-foreground mt-1 pl-6 text-xs'>
                                  {entry.unchanged ? '没有变化' : compareSummary}
                                </div>
                              </div>
                              <div
                                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                  entry.unchanged
                                    ? 'app-wallpaper-surface text-muted-foreground'
                                    : 'bg-primary/10 text-primary'
                                }`}>
                                {entry.unchanged ? '没有变化' : 'Diff'}
                              </div>
                            </Button>
                            {isExpanded ? (
                              <div className='border-border border-t px-4 py-4'>
                                <SkillDiffView
                                  oldText={entry.oldContent}
                                  newText={entry.newContent}
                                  label={entry.path}
                                  emptyLabel={'没有变化'}
                                />
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className='grid gap-4 lg:grid-cols-2'>
                    <div className='space-y-2'>
                      <div className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
                        {'当前版本'}
                      </div>
                      <pre className='border-border app-wallpaper-surface text-foreground min-h-[280px] overflow-auto whitespace-pre-wrap rounded-2xl border p-4 text-xs leading-6'>
                        {currentContent || '暂无内容'}
                      </pre>
                    </div>

                    <div className='space-y-2'>
                      <div className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
                        {selectedVersion ? `v${selectedVersion.version}` : '选中版本'}
                      </div>
                      <pre className='border-border app-wallpaper-surface text-foreground min-h-[280px] overflow-auto whitespace-pre-wrap rounded-2xl border p-4 text-xs leading-6'>
                        {selectedVersion?.content || '暂无内容'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={Boolean(versionToDelete)}
        title={'删除版本快照'}
        onOk={() => void handleDelete()}
        onCancel={() => {
          if (isDeleting) {
            return;
          }
          setVersionToDelete(null);
        }}
        okText={isDeleting ? '加载中…' : '删除'}
        cancelText={'取消'}
        okButtonProps={{ danger: true, loading: isDeleting }}
        maskClosable={!isDeleting}>
        <p>{`删除 v${versionToDelete?.version ?? ''} 后将无法恢复这条历史记录。是否继续？`}</p>
      </Modal>
    </>
  );
}

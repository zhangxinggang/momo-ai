import type { IScannedSkill } from '@/types/modules';
import { normalizeSkillTag } from '@renderer/services/skill/modal-utils';
import { Button, Checkbox, Input, Modal } from 'antd';
import {
  CheckCircle2Icon,
  DownloadIcon,
  FileTextIcon,
  FolderIcon,
  PackageIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  TagsIcon,
  Trash2Icon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SkillTagEditor } from '../SkillTagEditor';

interface IProps {
  scannedSkills: IScannedSkill[];
  /**
   * Set of localPath values for skills already in the app library.
   * Using localPath (folder path) instead of name avoids false "Installed"
   * flags when a different tool happens to have a skill with the same name.
   * 已存在于应用库中的 skill 文件夹路径集合（精准比对，避免同名误判）
   */
  installedPaths?: Set<string>;
  /** default-import 模式：按名称标记已安装，隐藏重扫/路径面板 */
  variant?: 'local-scan' | 'default-import';
  installedNames?: Set<string>;
  isLoading?: boolean;
  loadError?: string | null;
  onImport: (skills: IScannedSkill[], userTagsByPath?: Record<string, string[]>) => Promise<number>;
  /** Re-scan with optional extra paths */
  onRescan?: (customPaths: string[]) => Promise<void>;
  onClose: () => void;
}

/**
 * Scan Preview Modal - User selects which local skills to import
 * 扫描预览弹窗 - 用户选择要导入的本地技能
 *
 * Fixes:
 *  - #57: isInstalled is now determined by localPath match, not name match,
 *         so skills from other tools with the same name are no longer blocked.
 *         Already-installed skills show a badge but can still be re-imported
 *         (treated as "update").
 *  - #59: Custom path input lets users specify extra directories to scan.
 */
export function SkillScanPreview({
  scannedSkills,
  installedPaths,
  variant = 'local-scan',
  installedNames,
  isLoading = false,
  loadError = null,
  onImport,
  onRescan,
  onClose,
}: IProps) {
  const isDefaultImport = variant === 'default-import';
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptionalTags, setShowOptionalTags] = useState(false);
  const [tagDrafts, setTagDrafts] = useState<Record<string, string[]>>({});
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);

  // Custom path state
  // 自定义路径状态
  const [customPaths, setCustomPaths] = useState<string[]>([]);
  const [newPathInput, setNewPathInput] = useState('');
  const [isRescanning, setIsRescanning] = useState(false);
  const [showPathPanel, setShowPathPanel] = useState(false);

  // Annotate each scanned skill with isInstalled (path-based, not name-based)
  // 基于路径判断是否已安装，而非仅凭名称
  const allSkills = useMemo(() => {
    return scannedSkills.map((skill) => ({
      ...skill,
      isInstalled: isDefaultImport
        ? (installedNames?.has(skill.name.toLowerCase()) ?? false)
        : (installedPaths?.has(skill.localPath) ?? false),
    }));
  }, [scannedSkills, installedPaths, installedNames, isDefaultImport]);

  // Skills not yet imported — used for import logic and selection counts
  // 尚未导入的 skill，仅用于导入逻辑与选择计数
  const filteredSkills = useMemo(() => allSkills.filter((s) => !s.isInstalled), [allSkills]);

  useEffect(() => {
    if (!isDefaultImport) {
      return;
    }
    const initialSelection = new Set(
      scannedSkills
        .filter((skill) => !installedNames?.has(skill.name.toLowerCase()))
        .map((skill) => skill.localPath),
    );
    setSelectedSkills(initialSelection);
  }, [isDefaultImport, scannedSkills, installedNames]);

  const visibleSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allSkills;
    return allSkills.filter((skill) => {
      const haystacks = [
        skill.name,
        skill.description,
        skill.author,
        skill.localPath,
        ...skill.tags,
        ...skill.platforms,
      ];
      return haystacks.some((value) => value?.toLowerCase().includes(query));
    });
  }, [allSkills, searchQuery]);

  const visibleSelectableSkills = useMemo(() => {
    if (isDefaultImport) {
      return visibleSkills;
    }
    return visibleSkills.filter((skill) => !skill.isInstalled);
  }, [visibleSkills, isDefaultImport]);

  const handleToggleSkill = (localPath: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(localPath)) {
        next.delete(localPath);
      } else {
        next.add(localPath);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (visibleSelectableSkills.length === 0) return;

    const allVisibleSelected = visibleSelectableSkills.every((skill) =>
      selectedSkills.has(skill.localPath),
    );

    if (allVisibleSelected) {
      setSelectedSkills((prev) => {
        const next = new Set(prev);
        visibleSelectableSkills.forEach((skill) => next.delete(skill.localPath));
        return next;
      });
    } else {
      setSelectedSkills((prev) => {
        const next = new Set(prev);
        visibleSelectableSkills.forEach((skill) => next.add(skill.localPath));
        return next;
      });
    }
  };

  const handleImport = async () => {
    const importPool = isDefaultImport ? allSkills : filteredSkills;
    const skillsToImport = importPool.filter((skill) => selectedSkills.has(skill.localPath));
    if (skillsToImport.length === 0) return;

    setIsImporting(true);
    try {
      const importedCount = isDefaultImport
        ? await onImport(skillsToImport)
        : await onImport(
            skillsToImport,
            Object.fromEntries(
              skillsToImport.map((skill) => [skill.localPath, tagDrafts[skill.localPath] || []]),
            ),
          );
      if (!isDefaultImport || importedCount > 0) {
        onClose();
      }
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setIsImporting(false);
    }
  };

  // Add a custom path to the list
  const handleAddPath = () => {
    const trimmed = newPathInput.trim();
    if (!trimmed || customPaths.includes(trimmed)) return;
    setCustomPaths((prev) => [...prev, trimmed]);
    setNewPathInput('');
  };

  const handleRemovePath = (p: string) => {
    setCustomPaths((prev) => prev.filter((x) => x !== p));
  };

  const handleAddTag = (localPath: string) => {
    const nextTag = normalizeSkillTag(tagInputs[localPath] || '');
    if (!nextTag) return;

    setTagDrafts((prev) => {
      const existing = prev[localPath] || [];
      if (existing.includes(nextTag)) return prev;
      return { ...prev, [localPath]: [...existing, nextTag] };
    });
    setTagInputs((prev) => ({ ...prev, [localPath]: '' }));
  };

  const handleRemoveTag = (localPath: string, tag: string) => {
    setTagDrafts((prev) => ({
      ...prev,
      [localPath]: (prev[localPath] || []).filter((item) => item !== tag),
    }));
  };

  const handleRescan = async () => {
    if (!onRescan) {
      return;
    }
    setIsRescanning(true);
    try {
      await onRescan(customPaths);
      // Reset selection after rescan
      setSelectedSkills(new Set());
    } finally {
      setIsRescanning(false);
    }
  };

  return (
    <Modal
      open
      zIndex={1050}
      onCancel={onClose}
      title={
        <div className='flex w-full flex-wrap items-center justify-between gap-3 pr-8'>
          <div className='flex flex-wrap items-center gap-3'>
            {isDefaultImport ? (
              <PackageIcon className='text-primary h-5 w-5 shrink-0' />
            ) : (
              <FolderIcon className='text-primary h-5 w-5 shrink-0' />
            )}
            <span className='text-lg font-semibold'>
              {isDefaultImport ? '选择要导入的默认技能' : '扫描预览'}
            </span>
            <span className='text-muted-foreground bg-accent/50 rounded-full px-2 py-0.5 text-xs'>
              {allSkills.length} {'技能'}
            </span>
          </div>
          {!isDefaultImport && (
            <div className='flex items-center gap-1'>
              <Button
                type='text'
                size='small'
                icon={<PlusIcon className='h-4 w-4' />}
                onClick={() => setShowPathPanel((v) => !v)}
                className={showPathPanel ? '!text-primary' : ''}
                title={'自定义扫描路径'}>
                <span className='hidden sm:inline'>{'添加'}</span>
              </Button>
              <Button
                type='text'
                size='small'
                icon={<RefreshCwIcon className={`h-4 w-4 ${isRescanning ? 'animate-spin' : ''}`} />}
                onClick={() => void handleRescan()}
                disabled={isRescanning}
                title={'重新扫描'}
              />
            </div>
          )}
        </div>
      }
      footer={
        allSkills.length > 0 && !isLoading ? (
          <div className='flex justify-end'>
            <Button
              type='primary'
              disabled={selectedSkills.size === 0 || isImporting}
              loading={isImporting}
              icon={!isImporting ? <DownloadIcon className='h-4 w-4' /> : undefined}
              onClick={() => void handleImport()}>
              {isImporting ? '导入中...' : `导入选中 (${selectedSkills.size})`}
            </Button>
          </div>
        ) : null
      }
      width={672}
      styles={{
        body: {
          padding: 0,
          maxHeight: 'min(85vh, 860px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
        mask: { backdropFilter: 'blur(4px)' },
      }}
      destroyOnHidden={false}>
      {/* Custom paths panel */}
      {!isDefaultImport && showPathPanel && (
        <div className='border-border bg-accent/20 shrink-0 space-y-2 border-b px-6 py-3'>
          <p className='text-muted-foreground text-xs'>
            {'添加自定义扫描路径后，点击「重新扫描」生效。'}
          </p>
          {/* Existing custom paths */}
          {customPaths.length > 0 && (
            <div className='space-y-1'>
              {customPaths.map((p) => (
                <div
                  key={p}
                  className='app-wallpaper-surface border-border flex items-center gap-2 rounded border px-2 py-1 text-xs'>
                  <FolderIcon className='text-primary h-3 w-3 shrink-0' />
                  <span className='flex-1 truncate font-mono'>{p}</span>
                  <Button
                    type='text'
                    danger
                    onClick={() => handleRemovePath(p)}
                    className='text-muted-foreground hover:text-destructive h-auto p-0'
                    icon={<Trash2Icon className='h-3 w-3' />}
                  />
                </div>
              ))}
            </div>
          )}
          {/* Input row */}
          <div className='flex items-center gap-2'>
            <Input
              value={newPathInput}
              onChange={(e) => setNewPathInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPath()}
              placeholder={'~/path/to/skills'}
              className='app-wallpaper-surface border-border flex-1 font-mono text-xs'
            />
            <Button
              type='primary'
              size='small'
              onClick={handleAddPath}
              disabled={!newPathInput.trim()}>
              {'添加'}
            </Button>
          </div>
        </div>
      )}

      <div className='min-h-0 flex-1 space-y-3 overflow-y-auto p-6'>
        {isLoading ? (
          <div className='text-muted-foreground flex flex-col items-center justify-center py-16'>
            <RefreshCwIcon className='text-primary mb-4 h-10 w-10 animate-spin opacity-70' />
            <p className='text-sm'>{'正在加载默认技能...'}</p>
          </div>
        ) : (
          <>
            {allSkills.length > 0 && !isDefaultImport && (
              <div className='border-border app-wallpaper-surface/60 flex flex-col gap-3 rounded-2xl border p-4'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <label className='relative block flex-1'>
                    <SearchIcon className='text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={'按名称、描述、标签、平台或路径搜索'}
                      className='border-border app-wallpaper-surface h-10 w-full rounded-xl pl-9 text-sm'
                    />
                  </label>
                  <Button
                    onClick={() => setShowOptionalTags((prev) => !prev)}
                    icon={<TagsIcon className='h-4 w-4' />}
                    className={`inline-flex h-auto items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      showOptionalTags
                        ? 'border-primary/40 bg-primary/5 text-primary'
                        : 'border-border app-wallpaper-surface text-muted-foreground hover:text-foreground'
                    }`}>
                    {showOptionalTags ? '隐藏可选标签' : '需要时再加标签'}
                  </Button>
                </div>
                <div className='text-muted-foreground text-xs'>
                  {`显示 ${visibleSelectableSkills.length}/${allSkills.length}，已选 ${selectedSkills.size}`}
                </div>
              </div>
            )}

            {allSkills.length === 0 ? (
              <div className='text-muted-foreground flex flex-col items-center justify-center py-12'>
                {isDefaultImport ? (
                  <>
                    <PackageIcon className='mb-4 h-12 w-12 opacity-20' />
                    <h3 className='text-sm font-medium'>{loadError || '暂无默认技能包'}</h3>
                    {!loadError && (
                      <p className='mt-1 text-xs opacity-70'>
                        {'请确认 default/skills 目录下是否已放置有效的 zip 文件'}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <FolderIcon className='mb-4 h-12 w-12 opacity-20' />
                    <h3 className='text-sm font-medium'>{'未发现新的本地 SKILL.md 文件。'}</h3>
                    <p className='mt-1 text-xs opacity-70'>
                      {'请确认是否已安装 Claude Code、Cursor 等工具'}
                    </p>
                    <p className='mt-1 text-xs opacity-60'>{'或在上方添加自定义路径后重新扫描'}</p>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Select All Bar */}
                {visibleSelectableSkills.length > 0 && (
                  <div className='bg-accent/30 mb-2 flex items-center justify-between rounded-lg px-3 py-2'>
                    <span className='text-muted-foreground text-xs'>
                      {
                        visibleSelectableSkills.filter((skill) =>
                          selectedSkills.has(skill.localPath),
                        ).length
                      }{' '}
                      / {visibleSelectableSkills.length} {'已选择'}
                    </span>
                    <Button
                      type='link'
                      size='small'
                      onClick={handleSelectAll}
                      className='text-primary h-auto p-0 text-xs'>
                      {visibleSelectableSkills.every((skill) => selectedSkills.has(skill.localPath))
                        ? '取消全选'
                        : '全选'}
                    </Button>
                  </div>
                )}

                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                  {visibleSkills.map((skill) => {
                    const isSelected = selectedSkills.has(skill.localPath);
                    const shortPath = (() => {
                      if (isDefaultImport) {
                        return skill.localPath.replace(/^default:/, '');
                      }
                      const parts = skill.localPath.replace(/\\/g, '/').split('/').filter(Boolean);
                      return parts.length >= 2
                        ? `.../${parts[parts.length - 2]}/${parts[parts.length - 1]}`
                        : skill.localPath;
                    })();

                    const canToggleSelection = isDefaultImport || !skill.isInstalled;

                    return (
                      <Button
                        key={skill.localPath}
                        className={`h-auto w-full whitespace-normal rounded-2xl border p-4 text-left shadow-sm ${
                          !canToggleSelection
                            ? 'bg-muted/30 border-border cursor-default opacity-70'
                            : isSelected
                              ? 'bg-primary/5 border-primary/40 shadow-primary/10'
                              : 'app-wallpaper-surface border-border hover:border-primary/30 hover:shadow-md'
                        }`}
                        onClick={() => canToggleSelection && handleToggleSkill(skill.localPath)}>
                        <div className='flex items-start gap-3'>
                          <div
                            className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${
                              skill.isInstalled
                                ? 'bg-accent text-muted-foreground'
                                : 'bg-primary/10 text-primary'
                            }`}>
                            <FileTextIcon className='h-5 w-5' />
                          </div>

                          <div className='min-w-0 flex-1'>
                            <div className='flex items-start justify-between gap-3'>
                              <div className='min-w-0'>
                                <div className='flex flex-wrap items-center gap-2'>
                                  <h4 className='truncate text-sm font-semibold'>{skill.name}</h4>
                                  {skill.version && (
                                    <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px]'>
                                      v{skill.version}
                                    </span>
                                  )}
                                  {skill.isInstalled && (
                                    <span className='bg-accent text-muted-foreground rounded-full px-2 py-0.5 text-[10px]'>
                                      {isDefaultImport ? '已存在' : '已导入'}
                                    </span>
                                  )}
                                </div>
                                {skill.author && (
                                  <p className='text-muted-foreground mt-1 text-[11px]'>
                                    {skill.author}
                                  </p>
                                )}
                              </div>

                              <div className='shrink-0 pt-0.5'>
                                {skill.isInstalled && !isDefaultImport ? (
                                  <CheckCircle2Icon className='text-muted-foreground h-5 w-5' />
                                ) : (
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => handleToggleSkill(skill.localPath)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                )}
                              </div>
                            </div>

                            {skill.description && (
                              <p className='text-muted-foreground mt-3 line-clamp-3 text-xs leading-5'>
                                {skill.description}
                              </p>
                            )}

                            <div className='mt-3 flex flex-wrap gap-1.5'>
                              {skill.platforms.map((platform) => (
                                <span
                                  key={platform}
                                  className='bg-primary/8 text-primary/80 rounded-full px-2 py-0.5 text-[10px]'>
                                  {platform}
                                </span>
                              ))}
                            </div>

                            {!isDefaultImport &&
                              !skill.isInstalled &&
                              isSelected &&
                              showOptionalTags && (
                                <SkillTagEditor
                                  variant='compact'
                                  bordered
                                  label='导入标签（可选）'
                                  tags={tagDrafts[skill.localPath] || []}
                                  tagInput={tagInputs[skill.localPath] || ''}
                                  onTagInputChange={(value) =>
                                    setTagInputs((prev) => ({
                                      ...prev,
                                      [skill.localPath]: value,
                                    }))
                                  }
                                  onAddTag={() => handleAddTag(skill.localPath)}
                                  onRemoveTag={(tag) => handleRemoveTag(skill.localPath, tag)}
                                  onInputClick={(event) => event.stopPropagation()}
                                  onAddButtonClick={(event) => event.stopPropagation()}
                                  onRemoveTagButtonClick={(event) => event.stopPropagation()}
                                  className='mt-4'
                                />
                              )}

                            <div
                              className='text-muted-foreground/60 mt-4 flex items-center gap-1 truncate font-mono text-[11px]'
                              title={skill.localPath}>
                              <FolderIcon className='h-3 w-3 shrink-0' />
                              <span className='truncate'>{shortPath}</span>
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

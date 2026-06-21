import { PlatformIcon } from '@renderer/components/ui/PlatformIcon';
import { useToast } from '@renderer/components/ui/Toast';
import { pickFolder } from '@renderer/services/desktop';
import { useRulesStore } from '@renderer/store/rules';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderPlusIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

interface IProps {
  collapsed?: boolean;
  onNavigateHome?: () => void;
}

/** Rules 侧栏：全局 / 项目规则列表 */
export function RulesPanel({ collapsed = false, onNavigateHome }: IProps) {
  const { showToast } = useToast();
  const isLoading = useRulesStore((state) => state.isLoading);
  const loadFiles = useRulesStore((state) => state.loadFiles);
  const selectRule = useRulesStore((state) => state.selectRule);
  const addProjectRule = useRulesStore((state) => state.addProjectRule);
  const removeProjectRule = useRulesStore((state) => state.removeProjectRule);
  const getSidebarSections = useRulesStore((state) => state.getSidebarSections);
  const searchQuery = useRulesStore((state) => state.searchQuery);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const sections = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const rawSections = getSidebarSections();
    if (!normalizedQuery) {
      return rawSections;
    }
    return rawSections.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const haystack = `${item.name} ${item.path} ${item.file.name}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      }),
    }));
  }, [getSidebarSections, searchQuery]);

  const handleRescan = useCallback(async () => {
    try {
      await loadFiles({ force: true });
      showToast('规则已重新扫描', 'success');
    } catch {
      showToast('扫描失败', 'error');
    }
  }, [loadFiles, showToast]);

  const handleAddProject = useCallback(async () => {
    const folderPath = await pickFolder();
    if (!folderPath) {
      return;
    }
    const name = folderPath.split(/[\\/]/).filter(Boolean).pop() || 'project';
    try {
      await addProjectRule({ name, rootPath: folderPath });
      showToast('已添加项目规则目录', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '添加失败', 'error');
    }
  }, [addProjectRule, showToast]);

  const handleRemoveProject = useCallback(
    async (projectId: string) => {
      try {
        await removeProjectRule(projectId);
        showToast('已移除项目规则', 'success');
      } catch (error) {
        showToast(error instanceof Error ? error.message : '移除失败', 'error');
      }
    },
    [removeProjectRule, showToast],
  );

  if (collapsed) {
    return null;
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      <div className='flex-shrink-0 px-2 pb-2'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='text-base font-semibold'>{'平台规则'}</h3>
          <button
            type='button'
            onClick={() => void handleRescan()}
            disabled={isLoading}
            className='border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            title='重新扫描规则'>
            <RefreshCwIcon className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '扫描中…' : '重新扫描'}
          </button>
        </div>
      </div>

      <div className='scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden px-1 pb-4'>
        <div className='space-y-5'>
          {sections.map((section) => (
            <div key={section.id}>
              <button
                type='button'
                onClick={() =>
                  setCollapsedSections((prev) => ({
                    ...prev,
                    [section.id]: !prev[section.id],
                  }))
                }
                className='text-muted-foreground hover:text-foreground mb-2 flex w-full items-center gap-1 px-2 text-left text-xs font-medium uppercase tracking-[0.18em]'>
                {collapsedSections[section.id] ? (
                  <ChevronRightIcon className='h-3.5 w-3.5' />
                ) : (
                  <ChevronDownIcon className='h-3.5 w-3.5' />
                )}
                <span>{section.id === 'global' ? '全局规则' : '项目规则'}</span>
              </button>

              {!collapsedSections[section.id] ? (
                <div className='space-y-2'>
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className={`relative w-full rounded-2xl border px-3 py-3 text-left transition-colors ${
                        item.active
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-border bg-background/60 hover:bg-muted'
                      }`}>
                      <button
                        type='button'
                        onClick={() => {
                          void selectRule(item.file.id);
                          onNavigateHome?.();
                        }}
                        className='w-full text-left'>
                        <div className='flex items-center gap-3'>
                          <div className='bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'>
                            {item.type === 'project' ? (
                              <FolderPlusIcon className='h-5 w-5' />
                            ) : (
                              <PlatformIcon
                                platformId={item.platformId}
                                size={20}
                                className='h-5 w-5'
                              />
                            )}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='truncate text-sm font-medium'>{item.name}</div>
                            <div className='text-muted-foreground mt-1 line-clamp-2 text-xs leading-5'>
                              {item.type === 'project' ? item.path : item.file.name}
                            </div>
                          </div>
                        </div>
                      </button>

                      {item.canRemove && item.projectId ? (
                        <div className='mt-3 flex justify-end'>
                          <button
                            type='button'
                            onClick={() => void handleRemoveProject(item.projectId!)}
                            className='border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors'>
                            <Trash2Icon className='h-3.5 w-3.5' />
                            {'移除'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {section.id === 'project' ? (
                    <button
                      type='button'
                      onClick={() => void handleAddProject()}
                      className='border-border hover:bg-muted/40 w-full rounded-2xl border border-dashed px-3 py-4 text-left transition-colors'>
                      <div className='flex items-center gap-3'>
                        <div className='bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl'>
                          <PlusIcon className='h-4 w-4' />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='text-sm font-medium'>{'添加项目目录'}</div>
                          <div className='text-muted-foreground mt-1 text-xs leading-5'>
                            {'选择文件夹，在此管理其 AGENTS.md 规则文件'}
                          </div>
                        </div>
                      </div>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

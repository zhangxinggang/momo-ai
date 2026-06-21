import type { IRegistrySkill } from '@/types/modules/skill';
import { useAppName } from '@renderer/hooks/useAppName';
import { Button, Input } from 'antd';
import { CheckSquareIcon, FileTextIcon, SquareIcon } from 'lucide-react';

type TAnnotatedGitHubSkill = IRegistrySkill & { isImported: boolean };

interface IProps {
  githubUrl: string;
  onGithubUrlChange: (url: string) => void;
  hasResults: boolean;
  importNotice: string | null;
  annotatedResults: TAnnotatedGitHubSkill[];
  selectableResults: TAnnotatedGitHubSkill[];
  selectedSlugs: Set<string>;
  onToggleSkill: (slug: string) => void;
  onToggleSelectAll: () => void;
}

export function CreateSkillGitHubPanel({
  githubUrl,
  onGithubUrlChange,
  hasResults,
  importNotice,
  annotatedResults,
  selectableResults,
  selectedSlugs,
  onToggleSkill,
  onToggleSelectAll,
}: IProps) {
  const appName = useAppName();
  const allSelectableSelected = selectableResults.every((skill) => selectedSlugs.has(skill.slug));

  return (
    <div className='flex h-full min-h-0 flex-col gap-4'>
      <div>
        <label className='mb-2 block text-sm font-medium'>{'GitHub 仓库地址'}</label>
        <Input
          value={githubUrl}
          onChange={(event) => onGithubUrlChange(event.target.value)}
          placeholder='https://github.com/owner/skill-repo'
        />
        <p className='text-muted-foreground mt-2 text-xs'>
          {`请输入仓库根地址。${appName} 会先扫描仓库中的可导入 SKILL.md，再让你选择要导入的内容。`}
        </p>
        <div className='border-border bg-muted/20 text-muted-foreground mt-3 space-y-1.5 rounded-lg border p-3 text-xs'>
          <p>{'目前只支持仓库根地址，例如 https://github.com/owner/repo'}</p>
          <p>
            {`如果没有找到 SKILL.md，${appName} 会回退到仓库根目录的 README.md，并将其作为单个导入候选。`}
          </p>
        </div>
      </div>

      {hasResults && (
        <div className='border-border bg-background/60 flex min-h-0 flex-1 flex-col space-y-3 rounded-xl border p-4'>
          {importNotice && (
            <div className='border-primary/20 bg-primary/10 text-primary rounded-lg border px-3 py-2 text-xs'>
              {importNotice}
            </div>
          )}
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-foreground text-sm font-medium'>
                {'Found {{count}} import option(s)'.replace(
                  '{{count}}',
                  String(annotatedResults.length),
                )}
              </div>
              <div className='text-muted-foreground mt-1 text-xs'>
                {'请先从这个仓库中选择一个或多个技能再导入。'}
              </div>
            </div>
            <Button type='text' size='small' onClick={onToggleSelectAll}>
              {allSelectableSelected ? (
                <>
                  <CheckSquareIcon className='h-3.5 w-3.5' />
                  {'取消全选'}
                </>
              ) : (
                <>
                  <SquareIcon className='h-3.5 w-3.5' />
                  {'全选'}
                </>
              )}
            </Button>
          </div>

          <div
            data-testid='github-results-scroll-area'
            className='min-h-0 flex-1 overflow-y-auto pr-1'>
            <div className='grid grid-cols-1 gap-3'>
              {annotatedResults.map((skill) => {
                const isSelected = selectedSlugs.has(skill.slug);
                return (
                  <Button
                    key={skill.slug}
                    type='default'
                    block
                    disabled={skill.isImported}
                    onClick={() => !skill.isImported && onToggleSkill(skill.slug)}
                    className={`!h-auto w-full rounded-2xl border p-4 text-left shadow-sm transition-all ${
                      skill.isImported
                        ? 'border-border bg-muted/30 cursor-not-allowed opacity-70'
                        : isSelected
                          ? 'border-primary/40 bg-primary/5 shadow-primary/10'
                          : 'border-border app-wallpaper-surface hover:border-primary/30 hover:shadow-md'
                    }`}>
                    <div className='flex items-start gap-3'>
                      <div
                        className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${
                          skill.isImported
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
                              {skill.isImported && (
                                <span className='bg-accent text-muted-foreground inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px]'>
                                  {'已导入'}
                                </span>
                              )}
                            </div>
                            <p className='text-muted-foreground mt-1 break-all text-[11px]'>
                              {skill.source_url}
                            </p>
                          </div>
                          <div className='shrink-0 pt-0.5'>
                            {skill.isImported || isSelected ? (
                              <CheckSquareIcon className='text-primary h-4 w-4' />
                            ) : (
                              <SquareIcon className='text-muted-foreground h-4 w-4' />
                            )}
                          </div>
                        </div>
                        <p className='text-muted-foreground mt-3 line-clamp-3 text-xs leading-5'>
                          {skill.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

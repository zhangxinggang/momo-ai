import type { IScannedSkill, ISkill, ISkillProject } from '@/types/modules';
import { useToast } from '@renderer/components/ui/Toast';
import { useAppName } from '@renderer/hooks/useAppName';
import { openPath, pickFolder as pickDesktopFolder } from '@renderer/services/desktop';
import { filterVisibleScannedSkills } from '@renderer/services/skill/filter';
import { buildProjectDetailSkill } from '@renderer/services/skill/project-detail-adapter';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import { Button, Input, Modal } from 'antd';
import {
  CheckCircle2Icon,
  DownloadIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SendIcon,
  TrashIcon,
} from 'lucide-react';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SkillFullDetailPage } from '../SkillFullDetailPage';
import { SkillQuickInstall } from '../SkillQuickInstall';

const OPEN_CREATE_SKILL_PROJECT_MODAL_EVENT = 'open-create-skill-project-modal';

interface IProps {
  isOpen: boolean;
  project?: ISkillProject | null;
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    rootPath: string;
    scanPaths: string[];
  }) => boolean | Promise<boolean>;
}

function ProjectFormModal({ isOpen, project, onClose, onSubmit }: IProps) {
  const appName = useAppName();
  const [name, setName] = useState('');
  const [rootPath, setRootPath] = useState('');
  const [scanPathInput, setScanPathInput] = useState('');
  const [scanPaths, setScanPaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(project?.name ?? '');
    setRootPath(project?.rootPath ?? '');
    setScanPaths(project?.scanPaths ?? []);
    setScanPathInput('');
    setError(null);
  }, [isOpen, project]);

  const addScanPath = useCallback(
    (value?: string) => {
      const nextPath = (value ?? scanPathInput).trim();
      if (!nextPath) {
        setError('请输入扫描路径后再添加。');
        return;
      }
      setScanPaths((prev) => {
        if (prev.includes(nextPath)) {
          setError('该扫描路径已存在。');
          return prev;
        }
        setError(null);
        if (!value) {
          setScanPathInput('');
        }
        return [...prev, nextPath];
      });
    },
    [scanPathInput],
  );

  const removeScanPath = (targetPath: string) => {
    setScanPaths((prev) => prev.filter((path) => path !== targetPath));
  };

  const pickFolder = useCallback(async (): Promise<string | null> => {
    return pickDesktopFolder();
  }, []);

  const handlePickFolder = async (target: 'root' | 'scan') => {
    const selectedPath = await pickFolder();
    if (!selectedPath) {
      return;
    }

    if (target === 'root') {
      setRootPath(selectedPath);
      setError(null);
      return;
    }

    addScanPath(selectedPath);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !rootPath.trim()) {
      setError('项目名称和根目录不能为空。');
      return;
    }

    const didSave = await onSubmit({
      name: name.trim(),
      rootPath: rootPath.trim(),
      scanPaths,
    });
    if (didSave) {
      onClose();
    }
  };

  const noDragStyle = { WebkitAppRegion: 'no-drag' } as React.CSSProperties;

  return (
    <Modal
      destroyOnHidden
      footer={null}
      onCancel={onClose}
      open={isOpen}
      styles={
        {
          content: noDragStyle,
          mask: noDragStyle,
        } as ComponentProps<typeof Modal>['styles']
      }
      title={project ? '编辑项目' : '添加项目'}
      width={800}>
      <div className='space-y-4' style={noDragStyle}>
        <div className='space-y-1.5'>
          <label className='text-foreground block text-sm font-medium'>{'项目名称'}</label>
          <Input
            status={error ? 'error' : undefined}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={'工作区项目'}
          />
          {error ? <p className='text-destructive text-xs'>{error}</p> : null}
        </div>

        <div className='space-y-2'>
          <label className='text-foreground block text-sm font-medium'>{'项目根目录'}</label>
          <div className='flex gap-2'>
            <Input
              className='flex-1'
              value={rootPath}
              onChange={(e) => setRootPath(e.target.value)}
              placeholder={'/path/to/project'}
            />
            <Button
              htmlType='button'
              icon={<FolderOpenIcon className='h-4 w-4' />}
              onClick={() => void handlePickFolder('root')}
              style={noDragStyle}
              type='default'>
              {'浏览'}
            </Button>
          </div>
        </div>

        <div className='space-y-2'>
          <label className='text-foreground block text-sm font-medium'>{'扫描路径'}</label>
          <div className='flex gap-2'>
            <Input
              className='flex-1'
              onChange={(e) => {
                setScanPathInput(e.target.value);
                if (error) {
                  setError(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addScanPath();
                }
              }}
              placeholder={'可选的额外扫描目录'}
              style={noDragStyle}
              value={scanPathInput}
            />
            <Button
              disabled={!scanPathInput.trim()}
              htmlType='button'
              icon={<PlusIcon className='h-4 w-4' />}
              onClick={() => addScanPath()}
              style={noDragStyle}
              type='default'>
              {'添加'}
            </Button>
            <Button
              htmlType='button'
              icon={<FolderOpenIcon className='h-4 w-4' />}
              onClick={() => void handlePickFolder('scan')}
              style={noDragStyle}
              type='default'>
              {'浏览'}
            </Button>
          </div>
          <p className='text-muted-foreground text-xs'>
            {`如果留空，${appName} 会扫描项目根目录。`}
          </p>
          <div className='space-y-2'>
            {scanPaths.length === 0 ? (
              <div className='border-border text-muted-foreground rounded-xl border border-dashed px-3 py-3 text-xs'>
                {'还没有配置额外扫描路径。'}
              </div>
            ) : (
              scanPaths.map((scanPath) => (
                <div
                  key={scanPath}
                  className='border-border app-wallpaper-surface flex items-center gap-2 rounded-xl border px-3 py-2'>
                  <FolderIcon className='text-primary h-4 w-4' />
                  <span className='text-foreground flex-1 truncate font-mono text-xs'>
                    {scanPath}
                  </span>
                  <Button
                    type='text'
                    danger
                    onClick={() => removeScanPath(scanPath)}
                    className='text-muted-foreground hover:bg-accent hover:text-destructive rounded-lg p-1'
                    icon={<TrashIcon className='h-4 w-4' />}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className='flex justify-end gap-3 pt-2'>
          <Button htmlType='button' onClick={onClose} style={noDragStyle}>
            {'取消'}
          </Button>
          <Button
            htmlType='button'
            onClick={() => void handleSubmit()}
            style={noDragStyle}
            type='primary'>
            {project ? '保存' : '添加项目'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function buildInstalledProjectPathSet(skills: ISkill[]): Set<string> {
  return new Set(
    skills.flatMap((skill) =>
      [skill.local_repo_path, skill.source_url].filter(
        (value): value is string => typeof value === 'string' && value.trim().length > 0,
      ),
    ),
  );
}

function inferDisplayPath(localPath: string): string {
  const parts = localPath.replace(/\\/g, '/').split('/').filter(Boolean);
  if (parts.length < 2) {
    return localPath;
  }

  return `.../${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

export function SkillProjectsView() {
  const appName = useAppName();
  const { showToast } = useToast();
  const skills = useSkillStore((state) => state.skills);
  const searchQuery = useSkillStore((state) => state.searchQuery);
  const scanProjectSkills = useSkillStore((state) => state.scanProjectSkills);
  const projectScanState = useSkillStore((state) => state.projectScanState);
  const selectedProjectId = useSkillStore((state) => state.selectedProjectId);
  const selectProject = useSkillStore((state) => state.selectProject);
  const importScannedSkills = useSkillStore((state) => state.importScannedSkills);
  const loadDeployedStatus = useSkillStore((state) => state.loadDeployedStatus);
  const skillProjects = useSettingsStore((state) => state.skillProjects);
  const addSkillProject = useSettingsStore((state) => state.addSkillProject);
  const updateSkillProject = useSettingsStore((state) => state.updateSkillProject);

  const [editingProject, setEditingProject] = useState<ISkillProject | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [quickInstallSkill, setQuickInstallSkill] = useState<ISkill | null>(null);
  const [isImportingPath, setIsImportingPath] = useState<string | null>(null);
  const [selectedProjectSkillPath, setSelectedProjectSkillPath] = useState<string | null>(null);

  useEffect(() => {
    if (skillProjects.length === 0) {
      if (selectedProjectId !== null) {
        selectProject(null);
      }
      return;
    }

    const hasSelectedProject = skillProjects.some((project) => project.id === selectedProjectId);
    if (!hasSelectedProject) {
      selectProject(skillProjects[0].id);
    }
  }, [selectProject, selectedProjectId, skillProjects]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) {
      return skillProjects[0] ?? null;
    }
    return skillProjects.find((project) => project.id === selectedProjectId) ?? null;
  }, [selectedProjectId, skillProjects]);

  const currentProjectState = (selectedProject && projectScanState[selectedProject.id]) || null;
  const installedProjectPaths = useMemo(() => buildInstalledProjectPathSet(skills), [skills]);

  const visibleProjectSkills = useMemo(() => {
    return filterVisibleScannedSkills(currentProjectState?.scannedSkills || [], searchQuery);
  }, [currentProjectState?.scannedSkills, searchQuery]);

  useEffect(() => {
    if (!visibleProjectSkills.length && selectedProjectSkillPath !== null) {
      setSelectedProjectSkillPath(null);
      return;
    }

    if (!selectedProjectSkillPath) {
      return;
    }

    const stillExists = visibleProjectSkills.some(
      (skill) => skill.localPath === selectedProjectSkillPath,
    );
    if (!stillExists) {
      setSelectedProjectSkillPath(null);
    }
  }, [selectedProjectSkillPath, visibleProjectSkills]);

  useEffect(() => {
    setSelectedProjectSkillPath(null);
  }, [selectedProjectId]);

  const handleOpenCreate = useCallback(() => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  }, []);

  useEffect(() => {
    const handleOpenProjectModal = () => {
      handleOpenCreate();
    };

    document.addEventListener(OPEN_CREATE_SKILL_PROJECT_MODAL_EVENT, handleOpenProjectModal);

    return () => {
      document.removeEventListener(OPEN_CREATE_SKILL_PROJECT_MODAL_EVENT, handleOpenProjectModal);
    };
  }, [handleOpenCreate]);

  const handleSaveProject = (input: {
    name: string;
    rootPath: string;
    scanPaths: string[];
  }): boolean => {
    try {
      if (editingProject) {
        updateSkillProject(editingProject.id, input);
        showToast('项目已更新', 'success');
      } else {
        const createdProject = addSkillProject(input);
        selectProject(createdProject.id);
        showToast('项目已添加', 'success');
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showToast(
        errorMessage === 'ISkill project name and rootPath are required'
          ? '项目名称和根目录不能为空。'
          : errorMessage === 'ISkill project root path already exists'
            ? '该项目根目录已存在。'
            : errorMessage || '保存项目失败',
        'error',
      );
      return false;
    }
  };

  const handleScanProject = async (project: ISkillProject) => {
    try {
      const scanned = await scanProjectSkills(project);
      updateSkillProject(project.id, { lastScannedAt: Date.now() });
      showToast(`已扫描 ${scanned.length} 个技能`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '扫描项目技能失败', 'error');
    }
  };

  const handleImportProjectSkill = async (scannedSkill: IScannedSkill) => {
    setIsImportingPath(scannedSkill.localPath);
    try {
      const result = await importScannedSkills([scannedSkill]);
      if (result.importedCount === 0) {
        throw new Error(result.failed[0]?.reason || result.skipped[0]?.reason || '导入失败');
      }

      showToast('已导入到我的 Skills', 'success');
      await loadDeployedStatus();
    } catch (error) {
      showToast(error instanceof Error ? error.message : '导入失败', 'error');
    } finally {
      setIsImportingPath(null);
    }
  };

  const importedLibrarySkillByPath = useMemo(() => {
    const pathMap = new Map<string, ISkill>();
    for (const skill of skills) {
      if (skill.local_repo_path) {
        pathMap.set(skill.local_repo_path, skill);
      }
      if (skill.source_url) {
        pathMap.set(skill.source_url, skill);
      }
    }
    return pathMap;
  }, [skills]);

  const selectedScannedSkill = useMemo(
    () =>
      visibleProjectSkills.find((skill) => skill.localPath === selectedProjectSkillPath) ?? null,
    [selectedProjectSkillPath, visibleProjectSkills],
  );

  const selectedImportedSkill = useMemo(
    () =>
      selectedScannedSkill
        ? (importedLibrarySkillByPath.get(selectedScannedSkill.localPath) ?? null)
        : null,
    [importedLibrarySkillByPath, selectedScannedSkill],
  );

  const selectedDetailSkill = useMemo(() => {
    if (!selectedProject || !selectedScannedSkill) {
      return null;
    }
    return buildProjectDetailSkill({
      scannedSkill: selectedScannedSkill,
      importedSkill: selectedImportedSkill,
      projectName: selectedProject.name,
    });
  }, [selectedImportedSkill, selectedProject, selectedScannedSkill]);

  const isShowingProjectDetail = Boolean(selectedScannedSkill && selectedDetailSkill);

  return (
    <div className='flex h-full min-h-0 overflow-hidden'>
      {isShowingProjectDetail ? (
        <SkillFullDetailPage
          overrideSkill={selectedDetailSkill ?? undefined}
          projectContext={
            selectedScannedSkill && selectedProject
              ? {
                  scannedSkill: selectedScannedSkill,
                  importedSkill: selectedImportedSkill,
                  projectName: selectedProject.name,
                }
              : null
          }
          onBack={() => setSelectedProjectSkillPath(null)}
        />
      ) : (
        <>
          <div className='border-border app-wallpaper-panel-strong w-80 shrink-0 border-r'>
            <div className='border-border flex items-center justify-between border-b px-4 py-4'>
              <div>
                <h2 className='text-foreground text-lg font-semibold'>{'项目'}</h2>
                <p className='text-muted-foreground mt-1 text-xs'>
                  {'登记项目目录并管理其中的本地技能。'}
                </p>
              </div>
              <Button
                type='primary'
                onClick={handleOpenCreate}
                className='inline-flex h-10 w-10 items-center justify-center rounded-xl'
                title={'添加项目'}
                icon={<FolderPlusIcon className='h-4 w-4' />}
              />
            </div>

            <div className='space-y-2 overflow-y-auto p-3'>
              {skillProjects.length === 0 ? (
                <div className='border-border text-muted-foreground rounded-2xl border border-dashed px-4 py-8 text-center text-sm'>
                  <FolderIcon className='mx-auto mb-3 h-10 w-10 opacity-30' />
                  <div className='text-foreground font-medium'>{'还没有项目'}</div>
                  <div className='text-muted-foreground mt-1 text-xs'>
                    {'添加项目根目录后，即可扫描并管理项目内的本地技能。'}
                  </div>
                </div>
              ) : (
                skillProjects.map((project) => {
                  const isActive = selectedProject?.id === project.id;
                  const scanState = projectScanState[project.id];
                  return (
                    <Button
                      key={project.id}
                      onClick={() => selectProject(project.id)}
                      className={`h-auto w-full whitespace-normal rounded-2xl border px-4 py-3 text-left ${
                        isActive
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border app-wallpaper-surface hover:bg-accent'
                      }`}>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <div className='text-foreground truncate font-medium'>{project.name}</div>
                        </div>
                        {scanState?.isScanning ? (
                          <Loader2Icon className='text-primary h-4 w-4 shrink-0 animate-spin' />
                        ) : null}
                      </div>
                      <div className='text-muted-foreground mt-3 flex items-center justify-between text-[11px]'>
                        <span>{`${scanState?.scannedSkills.length || 0} 个技能`}</span>
                      </div>
                    </Button>
                  );
                })
              )}
            </div>
          </div>

          <div className='flex min-w-0 flex-1 overflow-hidden'>
            {selectedProject ? (
              <div className='min-w-0 flex-1 overflow-hidden'>
                <div className='flex h-full min-h-0 flex-col overflow-hidden'>
                  <div className='border-border app-wallpaper-panel-strong border-b px-6 py-5'>
                    <div className='flex flex-wrap items-start justify-between gap-4'>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-3'>
                          <FolderOpenIcon className='text-primary h-5 w-5' />
                          <h2 className='text-foreground truncate text-xl font-semibold'>
                            {selectedProject.name}
                          </h2>
                        </div>
                        <div className='text-muted-foreground mt-2 text-sm'>
                          {`${currentProjectState?.scannedSkills.length || 0} 个技能`}
                        </div>
                      </div>

                      <div className='flex flex-wrap gap-2'>
                        <Button
                          onClick={() => void handleScanProject(selectedProject)}
                          disabled={currentProjectState?.isScanning}
                          icon={
                            currentProjectState?.isScanning ? (
                              <Loader2Icon className='h-4 w-4 animate-spin' />
                            ) : (
                              <RefreshCwIcon className='h-4 w-4' />
                            )
                          }
                          className='border-border app-wallpaper-surface text-foreground hover:bg-accent inline-flex h-auto items-center gap-2 rounded-xl border px-3 py-2 text-sm'>
                          {'刷新'}
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingProject(selectedProject);
                            setIsProjectModalOpen(true);
                          }}
                          icon={<PencilIcon className='h-4 w-4' />}
                          className='border-border app-wallpaper-surface text-foreground hover:bg-accent inline-flex h-auto items-center gap-2 rounded-xl border px-3 py-2 text-sm'>
                          {'编辑'}
                        </Button>
                      </div>
                    </div>

                    {currentProjectState?.error ? (
                      <div className='border-destructive/20 bg-destructive/10 text-destructive mt-4 rounded-2xl border px-4 py-3 text-sm'>
                        {currentProjectState.error}
                      </div>
                    ) : null}
                  </div>

                  <div className='min-h-0 flex-1 overflow-y-auto p-6'>
                    {(currentProjectState?.scannedSkills.length || 0) === 0 ? (
                      <div className='border-border bg-accent/10 text-muted-foreground flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed px-6 text-center'>
                        <SearchIcon className='mb-4 h-10 w-10 opacity-30' />
                        <div className='text-foreground text-base font-semibold'>
                          {'还没有扫描结果'}
                        </div>
                        <div className='text-muted-foreground mt-2 max-w-xl text-sm'>
                          {`先执行扫描来发现项目中的 SKILL.md 文件，再决定是导入到 ${appName}，还是仅直接管理源路径。`}
                        </div>
                      </div>
                    ) : visibleProjectSkills.length === 0 ? (
                      <div className='border-border bg-accent/10 text-muted-foreground flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed px-6 text-center'>
                        <SearchIcon className='mb-4 h-10 w-10 opacity-30' />
                        <div className='text-foreground text-base font-semibold'>
                          {'未找到技能'}
                        </div>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3'>
                        {visibleProjectSkills.map((scannedSkill) => {
                          const importedSkill = importedLibrarySkillByPath.get(
                            scannedSkill.localPath,
                          );
                          const isImported = installedProjectPaths.has(scannedSkill.localPath);

                          return (
                            <article
                              key={scannedSkill.filePath}
                              className='border-border app-wallpaper-surface hover:bg-accent/40 rounded-3xl border p-5 transition-colors'>
                              <Button
                                type='text'
                                block
                                onClick={() => setSelectedProjectSkillPath(scannedSkill.localPath)}
                                className='block h-auto w-full whitespace-normal p-0 text-left'>
                                <div className='flex items-start justify-between gap-3'>
                                  <div className='min-w-0 flex-1'>
                                    <div className='flex flex-wrap items-center gap-2'>
                                      <div className='text-foreground truncate text-base font-semibold'>
                                        {scannedSkill.name}
                                      </div>
                                      {scannedSkill.version ? (
                                        <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium'>
                                          v{scannedSkill.version}
                                        </span>
                                      ) : null}
                                      {isImported ? (
                                        <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-300'>
                                          <CheckCircle2Icon className='h-3 w-3' />
                                          {'已导入'}
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className='text-muted-foreground mt-2 line-clamp-3 text-sm'>
                                      {scannedSkill.description || scannedSkill.author}
                                    </div>
                                    <div className='text-muted-foreground mt-3 truncate font-mono text-[11px]'>
                                      {inferDisplayPath(scannedSkill.localPath)}
                                    </div>
                                  </div>
                                </div>
                              </Button>

                              <div className='mt-4 flex flex-wrap gap-2'>
                                <Button
                                  size='small'
                                  onClick={() => void openPath(scannedSkill.localPath)}
                                  icon={<FolderOpenIcon className='h-3.5 w-3.5' />}
                                  className='border-border text-foreground hover:bg-accent inline-flex items-center gap-1 rounded-lg border px-2.5'>
                                  {'打开文件夹'}
                                </Button>
                                {isImported && importedSkill ? (
                                  <Button
                                    type='primary'
                                    size='small'
                                    onClick={() => setQuickInstallSkill(importedSkill)}
                                    icon={<SendIcon className='h-3.5 w-3.5' />}
                                    className='inline-flex items-center gap-1 rounded-lg px-2.5'>
                                    {'分发'}
                                  </Button>
                                ) : (
                                  <Button
                                    type='primary'
                                    size='small'
                                    onClick={() => void handleImportProjectSkill(scannedSkill)}
                                    disabled={isImportingPath === scannedSkill.localPath}
                                    icon={
                                      isImportingPath === scannedSkill.localPath ? (
                                        <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
                                      ) : (
                                        <DownloadIcon className='h-3.5 w-3.5' />
                                      )
                                    }
                                    className='inline-flex items-center gap-1 rounded-lg px-2.5'>
                                    {'导入到我的 Skills'}
                                  </Button>
                                )}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-muted-foreground flex flex-1 items-center justify-center p-6 text-center'>
                <div>
                  <FolderIcon className='mx-auto mb-4 h-12 w-12 opacity-30' />
                  <div className='text-foreground text-lg font-semibold'>{'选择项目'}</div>
                  <div className='text-muted-foreground mt-2 text-sm'>
                    {'从左侧选择已登记的项目，或先添加新项目以开始扫描项目内技能。'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <ProjectFormModal
        isOpen={isProjectModalOpen}
        project={editingProject}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSaveProject}
      />

      {quickInstallSkill ? (
        <SkillQuickInstall skill={quickInstallSkill} onClose={() => setQuickInstallSkill(null)} />
      ) : null}
    </div>
  );
}

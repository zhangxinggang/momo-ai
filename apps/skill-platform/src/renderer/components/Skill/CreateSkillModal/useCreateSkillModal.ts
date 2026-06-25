import { SKILL_CREATOR_CONTENT_URL } from '@/types/constants/skill-registry';
import type { IDefaultSkillPreview, IRegistrySkill, IScannedSkill } from '@/types/modules/skill';
import type { IExposeParam } from '@momo/markdown';
import { allToolbar } from '@momo/markdown';
import { useToast } from '@renderer/components/ui/Toast';
import { useUnsavedLeaveGuard } from '@renderer/hooks/useUnsavedLeaveGuard';
import { generateSkillContent, polishSkillContent, type IAIConfig } from '@renderer/services/ai';
import {
  fetchSkillRemoteContent,
  importDefaultSkills,
  listDefaultSkills,
  scanLocalSkillsPreview,
} from '@renderer/services/skill/api';
import { loadGitHubSkillRepo } from '@renderer/services/skill/github-store';
import { getExistingSkillTags } from '@renderer/services/skill/modal-utils';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import type { IAIModelConfig } from '@renderer/types/settings';
import { useMdEditorImageUpload } from '@renderer/utils/markdown/editor-config';
import type { UploadProps } from 'antd';
import { Modal, Upload } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IManualSkillFormState } from './CreateSkillManualPanel';
import { sanitizeSkillName, type ECreateMode } from './types';

interface IUseCreateSkillModalOptions {
  isOpen: boolean;
  onClose: () => void;
}

function buildChatAiConfig(model: IAIModelConfig): IAIConfig {
  return {
    provider: model.provider,
    apiProtocol: model.apiProtocol,
    apiKey: model.apiKey,
    apiUrl: model.apiUrl,
    model: model.model,
    chatParams: model.chatParams,
  };
}

export function useCreateSkillModal({ isOpen, onClose }: IUseCreateSkillModalOptions) {
  const createSkill = useSkillStore((state) => state.createSkill);
  const installRegistrySkill = useSkillStore((state) => state.installRegistrySkill);
  const importScannedSkills = useSkillStore((state) => state.importScannedSkills);
  const existingSkills = useSkillStore((state) => state.skills);
  const { showToast } = useToast();

  // AI settings for generation
  // AI 生成设置
  const aiModels = useSettingsStore((state) => state.aiModels);

  const [mode, setMode] = useState<ECreateMode>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GitHub mode
  const [githubUrl, setGithubUrl] = useState('');
  const [githubScanResults, setGithubScanResults] = useState<IRegistrySkill[]>([]);
  const [selectedGitHubSkills, setSelectedGitHubSkills] = useState<Set<string>>(new Set());
  const [githubScanDone, setGithubScanDone] = useState(false);
  const [githubImportNotice, setGithubImportNotice] = useState<string | null>(null);

  // Manual mode
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [version, setVersion] = useState('');
  const [author, setAuthor] = useState('');
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
  const [iconEmoji, setIconEmoji] = useState<string | undefined>(undefined);
  const [iconBackground, setIconBackground] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const skillMdEditorRef = useRef<IExposeParam>(null);
  const { handleDrop, handleUploadImg } = useMdEditorImageUpload(skillMdEditorRef);
  const skillMdToolbars = useMemo(
    () => allToolbar.filter((item) => !['prettier', 'github', 'save'].includes(String(item))),
    [],
  );

  const [scanResults, setScanResults] = useState<IScannedSkill[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showScanPreview, setShowScanPreview] = useState(false);

  const [defaultPreviews, setDefaultPreviews] = useState<IDefaultSkillPreview[]>([]);
  const [isLoadingDefault, setIsLoadingDefault] = useState(false);
  const [showDefaultPreview, setShowDefaultPreview] = useState(false);
  const [defaultImportNotice, setDefaultImportNotice] = useState<string | null>(null);

  const installedScanPaths = useMemo(() => {
    return new Set(
      existingSkills.flatMap((skill) =>
        [skill.source_url, skill.local_repo_path].filter(
          (value): value is string => typeof value === 'string' && value.trim().length > 0,
        ),
      ),
    );
  }, [existingSkills]);

  const existingTags = useMemo(() => getExistingSkillTags(existingSkills), [existingSkills]);
  const installedGitHubSources = useMemo(() => {
    return new Set(
      existingSkills
        .map((skill) => skill.source_url)
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0),
    );
  }, [existingSkills]);
  const annotatedGitHubResults = useMemo(() => {
    return githubScanResults.map((skill) => ({
      ...skill,
      isImported: installedGitHubSources.has(skill.source_url),
    }));
  }, [githubScanResults, installedGitHubSources]);
  const selectableGitHubResults = useMemo(
    () => annotatedGitHubResults.filter((skill) => !skill.isImported),
    [annotatedGitHubResults],
  );

  const defaultScanResults = useMemo<IScannedSkill[]>(
    () =>
      defaultPreviews.map((preview) => ({
        name: preview.name,
        description: preview.description,
        version: preview.version,
        author: preview.author,
        tags: preview.tags,
        instructions: preview.instructions,
        filePath: `${preview.extractDir}/SKILL.md`,
        localPath: `default:${preview.zipFileName}`,
        platforms: ['default'],
      })),
    [defaultPreviews],
  );

  const installedDefaultNames = useMemo(
    () =>
      new Set<string>(
        defaultPreviews
          .filter((preview) => preview.isInstalled)
          .map((preview) => preview.name.toLowerCase()),
      ),
    [defaultPreviews],
  );

  // Get default chat model for AI generation
  // 获取默认对话模型用于 AI 生成
  const defaultChatModel = useMemo(() => {
    const chatModels = aiModels.filter((m) => (m.type ?? 'chat') === 'chat');
    return chatModels.find((m) => m.isDefault) ?? chatModels[0] ?? null;
  }, [aiModels]);

  // Check if AI generation is available
  // 检查 AI 生成是否可用
  const canGenerateWithAI = useMemo(() => {
    return defaultChatModel && defaultChatModel.apiKey && defaultChatModel.apiUrl;
  }, [defaultChatModel]);

  const [skillCreatorContent, setSkillCreatorContent] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let disposed = false;
    void fetchSkillRemoteContent(SKILL_CREATOR_CONTENT_URL)
      .then((content) => {
        if (!disposed && content.trim()) {
          setSkillCreatorContent(content);
        }
      })
      .catch((error) => {
        console.warn('Failed to load skill-creator prompt:', error);
      });

    return () => {
      disposed = true;
    };
  }, [isOpen]);

  const hasUnsavedFormChanges = useCallback(() => {
    return (
      name.trim() !== '' ||
      description.trim() !== '' ||
      instructions.trim() !== '' ||
      Boolean(iconUrl) ||
      Boolean(iconEmoji) ||
      Boolean(iconBackground)
    );
  }, [name, description, instructions, iconUrl, iconEmoji, iconBackground]);

  const isDirtyForLeave = useCallback(() => {
    return hasUnsavedFormChanges() && (mode === 'manual' || mode === 'ai');
  }, [hasUnsavedFormChanges, mode]);

  const resetManualFields = useCallback(() => {
    setName('');
    setDescription('');
    setInstructions('');
    setVersion('');
    setAuthor('');
    setIconUrl(undefined);
    setIconEmoji(undefined);
    setIconBackground(undefined);
    setTags([]);
    setTagInput('');
  }, []);

  const manualCreateRef = useRef<() => Promise<boolean>>(async () => false);

  const { confirmLeave, UnsavedLeaveDialog } = useUnsavedLeaveGuard({
    isDirty: isDirtyForLeave,
    onSave: () => manualCreateRef.current(),
    onDiscard: resetManualFields,
  });

  const handleClose = useCallback(() => {
    setMode('select');
    setError(null);
    setGithubUrl('');
    setGithubScanResults([]);
    setSelectedGitHubSkills(new Set());
    setGithubScanDone(false);
    setGithubImportNotice(null);
    setName('');
    setDescription('');
    setInstructions('');
    setVersion('');
    setAuthor('');
    setIconUrl(undefined);
    setIconEmoji(undefined);
    setIconBackground(undefined);
    setTags([]);
    setTagInput('');
    setIsGenerating(false);
    setScanResults([]);
    setIsScanning(false);
    setShowScanPreview(false);
    setDefaultPreviews([]);
    setIsLoadingDefault(false);
    setShowDefaultPreview(false);
    setDefaultImportNotice(null);
    onClose();
  }, [onClose]);

  const handleCloseRequest = useCallback(() => {
    void (async () => {
      if (!isDirtyForLeave()) {
        handleClose();
        return;
      }
      if (await confirmLeave()) {
        handleClose();
      }
    })();
  }, [confirmLeave, handleClose, isDirtyForLeave]);

  const handleMdFileUpload: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInstructions(content);
        if (!name.trim()) {
          const baseName = file.name
            .replace(/\.md$/i, '')
            .replace(/[^a-z0-9-]/gi, '-')
            .toLowerCase();
          setName(baseName);
        }
      }
    };
    reader.readAsText(file);
    return Upload.LIST_IGNORE;
  };

  // AI Polish SKILL.md content
  // AI 润色 SKILL.md 内容
  const handleAIPolish = async () => {
    if (!instructions.trim()) {
      setError('请先编写一些内容再进行润色');
      return;
    }

    if (!defaultChatModel) {
      setError('请先在设置中配置 AI 模型');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const config = buildChatAiConfig(defaultChatModel);

      const polished = await polishSkillContent(config, instructions, name || undefined);
      setInstructions(polished);
    } catch (err) {
      setError(err instanceof Error ? err.message : '润色失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI mode: generate a draft, then switch to manual review mode
  const handleAICreate = async () => {
    const normalizedName = sanitizeSkillName(name);
    if (!normalizedName.trim()) {
      setError('请输入技能名称');
      return;
    }
    if (!description.trim()) {
      setError('请先填写技能描述以便 AI 生成');
      return;
    }
    if (!defaultChatModel) {
      setError('请先在设置中配置 AI 模型');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const config = buildChatAiConfig(defaultChatModel);

      const generated = await generateSkillContent(
        config,
        normalizedName,
        description,
        undefined,
        skillCreatorContent || undefined,
      );
      setName(normalizedName);
      setInstructions(generated);
      setMode('manual');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGitHubInstall = async () => {
    if (!githubUrl.trim()) {
      setError('请输入 GitHub 地址');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const match = githubUrl
        .trim()
        .match(/^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/);
      if (!match) {
        throw new Error('无效的 GitHub 地址格式');
      }

      const scannedSkills = await loadGitHubSkillRepo(githubUrl.trim(), {
        fetchRemoteContent: (url) => fetchSkillRemoteContent(url),
        registrySkills: [],
        rateLimitMessage: 'GitHub API 请求限额已达到，请几分钟后重试，或切换网络后再试。',
        networkMessage: '无法连接到 GitHub，请检查当前网络，或切换网络后再试。',
        invalidRepoMessage: '仓库不存在，或仓库地址无效，请检查 GitHub 仓库地址后重试。',
      });

      if (scannedSkills.length === 0) {
        throw new Error('这个仓库里没有可导入的 SKILL.md 或 README.md 文件。');
      }

      setGithubScanResults(scannedSkills);
      setSelectedGitHubSkills(
        new Set(
          scannedSkills
            .filter((skill) => !installedGitHubSources.has(skill.source_url))
            .map((skill) => skill.slug),
        ),
      );
      setGithubScanDone(true);
      setGithubImportNotice(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '安装失败');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGitHubSkill = (slug: string) => {
    setSelectedGitHubSkills((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const handleToggleGitHubSelectAll = () => {
    const allSelected = selectableGitHubResults.every((skill) =>
      selectedGitHubSkills.has(skill.slug),
    );
    setSelectedGitHubSkills(
      allSelected ? new Set() : new Set(selectableGitHubResults.map((skill) => skill.slug)),
    );
  };

  const manualForm = useMemo<IManualSkillFormState>(
    () => ({
      name,
      description,
      instructions,
      version,
      author,
      iconUrl,
      iconEmoji,
      iconBackground,
      tags,
      tagInput,
    }),
    [
      name,
      description,
      instructions,
      version,
      author,
      iconUrl,
      iconEmoji,
      iconBackground,
      tags,
      tagInput,
    ],
  );

  const handleImportSelectedGitHubSkills = async () => {
    const targets = annotatedGitHubResults.filter(
      (skill) => !skill.isImported && selectedGitHubSkills.has(skill.slug),
    );
    if (targets.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setGithubImportNotice(null);

    try {
      let importedCount = 0;
      const skipped: string[] = [];
      const failed: string[] = [];

      for (const skill of targets) {
        try {
          const createdSkill = await installRegistrySkill(skill);
          if (!createdSkill) {
            skipped.push(skill.name);
            continue;
          }
          importedCount += 1;
        } catch (importError) {
          failed.push(
            `${skill.name}: ${
              importError instanceof Error ? importError.message : String(importError)
            }`,
          );
        }
      }

      if (importedCount > 0 && failed.length === 0 && skipped.length === 0) {
        handleClose();
        return;
      }

      setGithubImportNotice(
        `已导入 ${importedCount} / ${targets.length}，跳过 ${skipped.length}，失败 ${failed.length}。`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCreate = async (): Promise<boolean> => {
    const normalizedName = sanitizeSkillName(name);
    if (!normalizedName.trim()) {
      setError('请输入技能名称');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const createdSkill = await createSkill({
        name: normalizedName,
        description,
        instructions,
        content: instructions,
        protocol_type: 'skill',
        is_favorite: false,
        tags,
        version: version || undefined,
        author: author || undefined,
        icon_url: iconUrl,
        icon_emoji: iconEmoji,
        icon_background: iconBackground,
      });

      if (!createdSkill) {
        throw new Error('创建完成后未返回有效的技能结果');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCreateClick = () => {
    void handleManualCreate().then((ok) => {
      if (ok) {
        handleClose();
      }
    });
  };

  const handleManualFieldChange = <K extends keyof IManualSkillFormState>(
    key: K,
    value: IManualSkillFormState[K],
  ) => {
    switch (key) {
      case 'name':
        setName(value as string);
        break;
      case 'description':
        setDescription(value as string);
        break;
      case 'instructions':
        setInstructions(value as string);
        break;
      case 'version':
        setVersion(value as string);
        break;
      case 'author':
        setAuthor(value as string);
        break;
      case 'iconUrl':
        setIconUrl(value as string | undefined);
        break;
      case 'iconEmoji':
        setIconEmoji(value as string | undefined);
        break;
      case 'iconBackground':
        setIconBackground(value as string | undefined);
        break;
      case 'tags':
        setTags(value as string[]);
        break;
      case 'tagInput':
        setTagInput(value as string);
        break;
      default:
        break;
    }
  };

  const handleScanLocal = async () => {
    setIsScanning(true);
    setError(null);

    try {
      const allResults: IScannedSkill[] = await scanLocalSkillsPreview();
      const installedCount = allResults.filter((skill) =>
        installedScanPaths.has(skill.localPath),
      ).length;

      setScanResults(allResults);
      if (allResults.length > 0 && installedCount === allResults.length) {
        setError('扫描到的技能已全部存在于您的库中。');
        return;
      }
      if (allResults.length === 0) {
        setError('未发现新的本地 SKILL.md 文件。');
        return;
      }

      setShowScanPreview(true);
    } catch (err) {
      setError('扫描失败：' + String(err));
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanImport = async (
    skillsToImport: IScannedSkill[],
    userTagsByPath?: Record<string, string[]>,
  ) => {
    const importResult = await importScannedSkills(skillsToImport, userTagsByPath);
    if (
      importResult.importedCount > 0 &&
      importResult.failed.length === 0 &&
      importResult.skipped.length === 0
    ) {
      handleClose();
    }
    return importResult.importedCount;
  };

  const handleScanRescan = async (customPaths: string[]) => {
    const allResults = customPaths.length
      ? await useSkillStore.getState().scanLocalPreview(customPaths)
      : await scanLocalSkillsPreview();
    setScanResults(allResults);
  };

  const handleLoadDefaultSkills = useCallback(async () => {
    setIsLoadingDefault(true);
    setError(null);
    setDefaultImportNotice(null);
    setShowDefaultPreview(true);

    try {
      const previews = await listDefaultSkills();
      setDefaultPreviews(previews);
      if (previews.length === 0) {
        setError('暂无默认技能包');
      }
    } catch (err) {
      setError('加载默认技能失败：' + String(err));
    } finally {
      setIsLoadingDefault(false);
    }
  }, []);

  const handleSelectMode = useCallback(
    (nextMode: ECreateMode) => {
      if (nextMode !== 'default') {
        setShowDefaultPreview(false);
      }
      setMode(nextMode);
      if (nextMode === 'default') {
        void handleLoadDefaultSkills();
      }
    },
    [handleLoadDefaultSkills],
  );

  const handleDefaultImport = async (skillsToImport: IScannedSkill[]) => {
    const zipFileNames = skillsToImport.map((skill) => skill.localPath.replace(/^default:/, ''));
    const duplicateCount = skillsToImport.filter((skill) =>
      installedDefaultNames.has(skill.name.toLowerCase()),
    ).length;

    let overwrite = false;
    if (duplicateCount > 0) {
      overwrite = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: '覆盖已有技能？',
          content: `选中的技能中有 ${duplicateCount} 个与库中已有技能同名，是否覆盖？覆盖将替换本地文件和 SKILL.md 内容，此操作不可撤销。`,
          okText: '全部覆盖',
          cancelText: '跳过同名',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    }

    const result = await importDefaultSkills(zipFileNames, { overwrite });
    await useSkillStore.getState().loadSkills();

    const summary = `成功 ${result.imported}，覆盖 ${result.overwritten}，跳过 ${result.skipped}，失败 ${result.failed.length}`;
    setDefaultImportNotice(summary);
    showToast(summary, result.failed.length > 0 ? 'warning' : 'success');

    if (result.failed.length === 0 && result.imported + result.overwritten > 0) {
      handleClose();
    }

    return result.imported + result.overwritten;
  };

  const handleCloseDefaultPreview = useCallback(() => {
    setShowDefaultPreview(false);
    setMode('select');
  }, []);

  const isManualMode = mode === 'manual';
  const isGitHubMode = mode === 'github';
  const isScanMode = mode === 'scan';
  const isDefaultMode = mode === 'default';
  const hasGitHubResults = githubScanDone && annotatedGitHubResults.length > 0;

  const createSkillModalWidth = isManualMode ? '100vw' : isGitHubMode ? 'min(92vw, 896px)' : 512;

  manualCreateRef.current = handleManualCreate;

  const handleCloseScanPreview = useCallback(() => {
    setShowScanPreview(false);
    setMode('select');
  }, []);

  return {
    mode,
    setMode: handleSelectMode,
    error,
    isLoading,
    isGenerating,
    name,
    description,
    canGenerateWithAI,
    githubUrl,
    setGithubUrl,
    githubImportNotice,
    annotatedGitHubResults,
    selectableGitHubResults,
    selectedGitHubSkills,
    githubScanDone,
    manualForm,
    existingTags,
    skillMdEditorRef,
    skillMdToolbars,
    scanResults,
    isScanning,
    showScanPreview,
    installedScanPaths,
    isManualMode,
    isGitHubMode,
    isScanMode,
    hasGitHubResults,
    createSkillModalWidth,
    handleCloseRequest,
    handleGitHubInstall,
    handleImportSelectedGitHubSkills,
    toggleGitHubSkill,
    handleToggleGitHubSelectAll,
    handleManualCreateClick,
    handleManualFieldChange,
    handleMdFileUpload,
    handleAIPolish,
    handleAICreate,
    handleScanLocal,
    handleScanImport,
    handleScanRescan,
    handleCloseScanPreview,
    handleDefaultImport,
    handleCloseDefaultPreview,
    defaultScanResults,
    installedDefaultNames,
    isLoadingDefault,
    showDefaultPreview,
    defaultImportNotice,
    isDefaultMode,
    handleDrop,
    handleUploadImg,
    setName,
    setDescription,
    UnsavedLeaveDialog,
  };
}

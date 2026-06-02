import { SKILL_CREATOR_CONTENT_URL } from '@/types/constants/skill-registry';
import type { IRegistrySkill, IScannedSkill } from '@/types/modules/skill';
import { allToolbar, MdEditor, type IExposeParam } from '@momo/markdown';
import '@momo/markdown-styles';
import { useUnsavedLeaveGuard } from '@renderer/hooks/useUnsavedLeaveGuard';
import { generateSkillContent, IAIConfig, polishSkillContent } from '@renderer/services/ai';
import { loadGitHubSkillRepo } from '@renderer/services/skill/github-store';
import { getExistingSkillTags } from '@renderer/services/skill/modal-utils';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import { useMdEditorImageUpload } from '@renderer/utils/markdown/editor-config';
import type { UploadProps } from 'antd';
import { Button, Input, Modal, Upload, type ModalProps } from 'antd';
import {
  AlertCircleIcon,
  BrainIcon,
  CheckIcon,
  CheckSquareIcon,
  CuboidIcon,
  EditIcon,
  FileTextIcon,
  FolderOpenIcon,
  GithubIcon,
  HashIcon,
  SearchIcon,
  SparklesIcon,
  SquareIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SkillIconPicker } from '../SkillIconPicker';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreateMode = 'select' | 'github' | 'manual' | 'scan' | 'ai';

function sanitizeSkillName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function CreateSkillModal({ isOpen, onClose }: IProps) {
  const createSkill = useSkillStore((state) => state.createSkill);
  const installRegistrySkill = useSkillStore((state) => state.installRegistrySkill);
  const importScannedSkills = useSkillStore((state) => state.importScannedSkills);
  const existingSkills = useSkillStore((state) => state.skills);

  // AI settings for generation
  // AI 生成设置
  const aiModels = useSettingsStore((state) => state.aiModels);

  const [mode, setMode] = useState<CreateMode>('select');
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

  const SkillMdEditor = MdEditor as typeof MdEditor;
  const skillMdEditorRef = useRef<IExposeParam>(null);
  const { handleDrop, handleUploadImg } = useMdEditorImageUpload(skillMdEditorRef);
  const skillMdToolbars = useMemo(
    () => allToolbar.filter((item) => !['prettier', 'github', 'save'].includes(String(item))),
    [],
  );

  // Scan mode state
  // 扫描模式状态
  const [scanResults, setScanResults] = useState<IScannedSkill[]>([]);
  const [selectedScanItems, setSelectedScanItems] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [importingCount, setImportingCount] = useState(0);
  const [scanImportNotice, setScanImportNotice] = useState<string | null>(null);
  const [scanSearchQuery, setScanSearchQuery] = useState('');
  const [showScanOptionalTags, setShowScanOptionalTags] = useState(false);
  const [scanTagDrafts, setScanTagDrafts] = useState<Record<string, string[]>>({});
  const [scanTagInputs, setScanTagInputs] = useState<Record<string, string>>({});

  const installedScanPaths = useMemo(() => {
    return new Set(
      existingSkills.flatMap((skill) =>
        [skill.source_url, skill.local_repo_path].filter(
          (value): value is string => typeof value === 'string' && value.trim().length > 0,
        ),
      ),
    );
  }, [existingSkills]);

  const annotatedScanResults = useMemo(() => {
    return scanResults.map((skill) => ({
      ...skill,
      isImported: installedScanPaths.has(skill.localPath),
    }));
  }, [installedScanPaths, scanResults]);

  const selectableScanResults = useMemo(
    () => annotatedScanResults.filter((skill) => !skill.isImported),
    [annotatedScanResults],
  );
  const visibleAnnotatedScanResults = useMemo(() => {
    const query = scanSearchQuery.trim().toLowerCase();
    if (!query) {
      return annotatedScanResults;
    }
    return annotatedScanResults.filter((skill) => {
      const fields = [
        skill.name,
        skill.description,
        skill.author,
        skill.localPath,
        ...skill.tags,
        ...skill.platforms,
      ];
      return fields.some((value) => value?.toLowerCase().includes(query));
    });
  }, [annotatedScanResults, scanSearchQuery]);
  const visibleSelectableScanResults = useMemo(
    () => visibleAnnotatedScanResults.filter((skill) => !skill.isImported),
    [visibleAnnotatedScanResults],
  );
  const importedScanCount = annotatedScanResults.length - selectableScanResults.length;
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
    void window.api.skill
      .fetchRemoteContent(SKILL_CREATOR_CONTENT_URL)
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

  if (!isOpen) return null;

  const handleCloseRequest = () => {
    void (async () => {
      if (!isDirtyForLeave()) {
        handleClose();
        return;
      }
      if (await confirmLeave()) {
        handleClose();
      }
    })();
  };

  const handleClose = () => {
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
    setSelectedScanItems(new Set());
    setIsScanning(false);
    setScanDone(false);
    setImportingCount(0);
    setScanImportNotice(null);
    setScanTagDrafts({});
    setScanTagInputs({});
    onClose();
  };

  // MD 文件上传处理
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

  // Tag handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
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
      const config: IAIConfig = {
        provider: defaultChatModel.provider,
        apiProtocol: defaultChatModel.apiProtocol,
        apiKey: defaultChatModel.apiKey,
        apiUrl: defaultChatModel.apiUrl,
        model: defaultChatModel.model,
        chatParams: defaultChatModel.chatParams,
      };

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
      const config: IAIConfig = {
        provider: defaultChatModel.provider,
        apiProtocol: defaultChatModel.apiProtocol,
        apiKey: defaultChatModel.apiKey,
        apiUrl: defaultChatModel.apiUrl,
        model: defaultChatModel.model,
        chatParams: defaultChatModel.chatParams,
      };

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
        fetchRemoteContent: (url) => window.api.skill.fetchRemoteContent(url),
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

  manualCreateRef.current = handleManualCreate;

  const handleManualCreateClick = () => {
    void handleManualCreate().then((ok) => {
      if (ok) {
        handleClose();
      }
    });
  };

  // Scan local skills (preview mode - returns list for user to select)
  // 扫描本地技能（预览模式 - 返回列表供用户选择）
  const handleScanLocal = async () => {
    setIsScanning(true);
    setScanDone(false);
    setError(null);
    setScanImportNotice(null);
    setScanResults([]);
    setSelectedScanItems(new Set());
    setScanTagDrafts({});
    setScanTagInputs({});

    try {
      const allResults: IScannedSkill[] = await window.api.skill.scanLocalPreview();
      const installedCount = allResults.filter((skill) =>
        installedScanPaths.has(skill.localPath),
      ).length;

      setScanResults(allResults);
      setSelectedScanItems(
        new Set(
          allResults
            .filter((skill) => !installedScanPaths.has(skill.localPath))
            .map((skill) => skill.filePath),
        ),
      );
      setScanDone(true);
      if (allResults.length > 0 && installedCount === allResults.length) {
        setError('扫描到的技能已全部存在于您的库中。');
      } else if (allResults.length === 0) {
        setError('未发现新的本地 SKILL.md 文件。');
      }
    } catch (err) {
      setError('扫描失败：' + String(err));
    } finally {
      setIsScanning(false);
    }
  };

  // Toggle selection of a scanned skill
  const toggleScanItem = (filePath: string) => {
    setSelectedScanItems((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  // Toggle select all / deselect all
  const toggleSelectAll = () => {
    if (visibleSelectableScanResults.length === 0) return;
    const allVisibleSelected = visibleSelectableScanResults.every((skill) =>
      selectedScanItems.has(skill.filePath),
    );

    if (allVisibleSelected) {
      setSelectedScanItems((prev) => {
        const next = new Set(prev);
        visibleSelectableScanResults.forEach((skill) => next.delete(skill.filePath));
        return next;
      });
    } else {
      setSelectedScanItems((prev) => {
        const next = new Set(prev);
        visibleSelectableScanResults.forEach((skill) => next.add(skill.filePath));
        return next;
      });
    }
  };

  const handleAddScanTag = (localPath: string) => {
    const nextTag = (scanTagInputs[localPath] || '').trim().toLowerCase();
    if (!nextTag) return;

    setScanTagDrafts((prev) => {
      const existing = prev[localPath] || [];
      if (existing.includes(nextTag)) {
        return prev;
      }
      return { ...prev, [localPath]: [...existing, nextTag] };
    });
    setScanTagInputs((prev) => ({ ...prev, [localPath]: '' }));
  };

  const handleRemoveScanTag = (localPath: string, tag: string) => {
    setScanTagDrafts((prev) => ({
      ...prev,
      [localPath]: (prev[localPath] || []).filter((item) => item !== tag),
    }));
  };

  // Import selected scanned skills
  // 导入选中的扫描到的技能（使用 store 的 importScannedSkills 确保 name 校验 + saveToRepo）
  const handleImportSelected = async () => {
    const toImport = annotatedScanResults.filter(
      (skill) => !skill.isImported && selectedScanItems.has(skill.filePath),
    );
    if (toImport.length === 0) return;

    setIsLoading(true);
    setError(null);
    setScanImportNotice(null);
    setImportingCount(0);

    try {
      const userTagsByPath = Object.fromEntries(
        toImport.map((skill) => [skill.localPath, scanTagDrafts[skill.localPath] || []]),
      );
      const importResult = await importScannedSkills(toImport, userTagsByPath);
      setImportingCount(importResult.importedCount);

      const summary = `已导入 ${importResult.importedCount} / ${toImport.length}，跳过 ${importResult.skipped.length}，失败 ${importResult.failed.length}。`;

      if (
        importResult.importedCount > 0 &&
        importResult.failed.length === 0 &&
        importResult.skipped.length === 0
      ) {
        handleClose();
      } else if (
        importResult.importedCount === 0 &&
        importResult.failed.length === 0 &&
        importResult.skipped.length > 0
      ) {
        setError('所选技能已全部存在于您的库中。');
      } else {
        const detailItems = [...importResult.skipped, ...importResult.failed]
          .slice(0, 3)
          .map((item) => `${item.name}: ${item.reason}`);
        setScanImportNotice(
          detailItems.length > 0 ? `${summary} ${detailItems.join(' | ')}` : summary,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    } finally {
      setIsLoading(false);
    }
  };

  const isManualMode = mode === 'manual';
  const isGitHubMode = mode === 'github';
  const isScanMode = mode === 'scan';
  const hasGitHubResults = githubScanDone && annotatedGitHubResults.length > 0;
  const hasScanResults = scanDone && annotatedScanResults.length > 0;

  const createSkillModalWidth = isManualMode
    ? '100vw'
    : isGitHubMode
      ? 'min(92vw, 896px)'
      : isScanMode && hasScanResults
        ? 'min(92vw, 1100px)'
        : 512;

  const createSkillModalTitle = (
    <span className='flex items-center gap-2'>
      <CuboidIcon className='text-primary h-5 w-5' />
      <span>
        {mode === 'select'
          ? '新建技能'
          : mode === 'github'
            ? '从 GitHub 安装'
            : mode === 'manual'
              ? '创建新技能'
              : mode === 'ai'
                ? 'AI 草稿'
                : '扫描本地'}
      </span>
    </span>
  );

  const createSkillModalFooter = isGitHubMode ? (
    <div data-testid='github-mode-footer' className='flex justify-end gap-2'>
      <Button onClick={() => setMode('select')}>{'返回'}</Button>
      <Button
        type='primary'
        loading={isLoading}
        disabled={isLoading || (githubScanDone && selectedGitHubSkills.size === 0)}
        icon={<CheckIcon className='h-4 w-4' />}
        onClick={githubScanDone ? handleImportSelectedGitHubSkills : handleGitHubInstall}>
        {githubScanDone ? '导入选中' : '扫描仓库'}
      </Button>
    </div>
  ) : isScanMode && scanDone && annotatedScanResults.length > 0 ? (
    <div className='flex items-center justify-between gap-3'>
      <span className='text-muted-foreground text-xs'>
        {
          visibleSelectableScanResults.filter((skill) => selectedScanItems.has(skill.filePath))
            .length
        }{' '}
        / {visibleSelectableScanResults.length} {'已选择'}
      </span>
      <Button
        type='primary'
        loading={isLoading}
        disabled={isLoading || selectedScanItems.size === 0}
        onClick={handleImportSelected}>
        {isLoading
          ? `导入中... (${importingCount}/${selectedScanItems.size})`
          : `导入选中 (${selectedScanItems.size})`}
      </Button>
    </div>
  ) : isManualMode ? (
    <div className='flex justify-end gap-2'>
      <Button onClick={() => setMode('select')}>{'返回'}</Button>
      <Button
        type='primary'
        loading={isLoading}
        disabled={isLoading || isGenerating || !name.trim()}
        icon={<CheckIcon className='h-4 w-4' />}
        onClick={() => void handleManualCreateClick()}>
        {'创建技能'}
      </Button>
    </div>
  ) : null;

  return (
    <>
      <Modal
        open
        zIndex={100}
        data-testid='create-skill-modal-container'
        onCancel={handleCloseRequest}
        title={createSkillModalTitle}
        width={createSkillModalWidth}
        footer={createSkillModalFooter}
        centered={!isManualMode}
        style={isManualMode ? { top: 0, paddingBottom: 0, maxWidth: '100vw' } : undefined}
        styles={
          (isManualMode
            ? {
                wrapper: { padding: 0 },
                content: {
                  margin: 0,
                  maxWidth: '100vw',
                  width: '100vw',
                  height: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  borderRadius: 0,
                },
                body: { flex: 1, minHeight: 0, overflow: 'auto', paddingTop: 8 },
              }
            : {
                body: {
                  maxHeight:
                    (isGitHubMode && hasGitHubResults) || (isScanMode && hasScanResults)
                      ? 'min(85vh, 720px)'
                      : 'min(72vh, 520px)',
                  overflowY: 'auto',
                  paddingTop: 8,
                },
              }) as ModalProps['styles']
        }
        destroyOnClose={false}>
        <div
          className={`p-6 ${
            isManualMode
              ? ''
              : isGitHubMode || isScanMode
                ? 'flex min-h-0 flex-col overflow-hidden'
                : ''
          }`}>
          {error && (
            <div className='bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-lg border p-3 text-sm'>
              {error}
            </div>
          )}

          {mode === 'select' && (
            <div className='space-y-3'>
              <p className='text-muted-foreground mb-4 text-sm'>{'选择添加技能的方式：'}</p>

              {/* AI 创建 */}
              <Button
                type='default'
                block
                className='bg-primary/5 hover:bg-primary/10 border-primary/30 !h-auto justify-start gap-4 rounded-xl border p-4 text-left'
                onClick={() => setMode('ai')}>
                <div className='bg-primary rounded-lg p-3'>
                  <BrainIcon className='h-6 w-6 text-white' />
                </div>
                <div className='text-left'>
                  <h3 className='text-foreground flex items-center gap-2 font-medium'>
                    {'AI 草稿'}
                    <span className='bg-primary/20 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-normal'>
                      skill-creator
                    </span>
                  </h3>
                  <p className='text-muted-foreground text-sm'>
                    {'描述你的需求，AI 先生成 SKILL.md 草稿供你确认'}
                  </p>
                </div>
              </Button>

              {/* GitHub */}
              <Button
                type='default'
                block
                className='bg-accent/50 hover:bg-accent border-border !h-auto justify-start gap-4 rounded-xl border p-4 text-left'
                onClick={() => setMode('github')}>
                <div className='bg-background group-hover:bg-primary/10 rounded-lg p-3 transition-colors'>
                  <GithubIcon className='text-foreground h-6 w-6' />
                </div>
                <div className='text-left'>
                  <h3 className='text-foreground font-medium'>{'从 GitHub 安装'}</h3>
                  <p className='text-muted-foreground text-sm'>{'粘贴 GitHub 仓库地址安装'}</p>
                </div>
              </Button>

              {/* 手动创建 */}
              <Button
                type='default'
                block
                className='bg-accent/50 hover:bg-accent border-border !h-auto justify-start gap-4 rounded-xl border p-4 text-left'
                onClick={() => setMode('manual')}>
                <div className='bg-background group-hover:bg-primary/10 rounded-lg p-3 transition-colors'>
                  <EditIcon className='text-foreground h-6 w-6' />
                </div>
                <div className='text-left'>
                  <h3 className='text-foreground font-medium'>{'手动创建'}</h3>
                  <p className='text-muted-foreground text-sm'>{'从零开始编写技能'}</p>
                </div>
              </Button>

              <Button
                type='default'
                block
                className='bg-accent/50 hover:bg-accent border-border !h-auto justify-start gap-4 rounded-xl border p-4 text-left'
                onClick={() => setMode('scan')}>
                <div className='bg-background group-hover:bg-primary/10 rounded-lg p-3 transition-colors'>
                  <FolderOpenIcon className='text-foreground h-6 w-6' />
                </div>
                <div className='text-left'>
                  <h3 className='text-foreground font-medium'>{'扫描本地'}</h3>
                  <p className='text-muted-foreground text-sm'>{'扫描本地已有的技能'}</p>
                </div>
              </Button>
            </div>
          )}

          {isGitHubMode && (
            <div className='flex h-full min-h-0 flex-col gap-4'>
              <div>
                <label className='mb-2 block text-sm font-medium'>{'GitHub 仓库地址'}</label>
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder='https://github.com/owner/skill-repo'
                />
                <p className='text-muted-foreground mt-2 text-xs'>
                  {
                    '请输入仓库根地址。PromptHub 会先扫描仓库中的可导入 SKILL.md，再让你选择要导入的内容。'
                  }
                </p>
                <div className='border-border bg-muted/20 text-muted-foreground mt-3 space-y-1.5 rounded-lg border p-3 text-xs'>
                  <p>{'目前只支持仓库根地址，例如 https://github.com/owner/repo'}</p>
                  <p>
                    {
                      '如果没有找到 SKILL.md，PromptHub 会回退到仓库根目录的 README.md，并将其作为单个导入候选。'
                    }
                  </p>
                </div>
              </div>

              {hasGitHubResults && (
                <div className='border-border bg-background/60 flex min-h-0 flex-1 flex-col space-y-3 rounded-xl border p-4'>
                  {githubImportNotice && (
                    <div className='border-primary/20 bg-primary/10 text-primary rounded-lg border px-3 py-2 text-xs'>
                      {githubImportNotice}
                    </div>
                  )}
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-foreground text-sm font-medium'>
                        {'Found {{count}} import option(s)'.replace(
                          '{{count}}',
                          String(annotatedGitHubResults.length),
                        )}
                      </div>
                      <div className='text-muted-foreground mt-1 text-xs'>
                        {'请先从这个仓库中选择一个或多个技能再导入。'}
                      </div>
                    </div>
                    <Button
                      type='text'
                      size='small'
                      onClick={() => {
                        const allSelected = selectableGitHubResults.every((skill) =>
                          selectedGitHubSkills.has(skill.slug),
                        );
                        setSelectedGitHubSkills(
                          allSelected
                            ? new Set()
                            : new Set(selectableGitHubResults.map((skill) => skill.slug)),
                        );
                      }}>
                      {selectableGitHubResults.every((skill) =>
                        selectedGitHubSkills.has(skill.slug),
                      ) ? (
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
                      {annotatedGitHubResults.map((skill) => {
                        const isSelected = selectedGitHubSkills.has(skill.slug);
                        return (
                          <Button
                            key={skill.slug}
                            type='default'
                            block
                            disabled={skill.isImported}
                            onClick={() => !skill.isImported && toggleGitHubSkill(skill.slug)}
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
                                      <h4 className='truncate text-sm font-semibold'>
                                        {skill.name}
                                      </h4>
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
          )}

          {mode === 'manual' && (
            <div className='space-y-5'>
              {/* Name */}
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  {'技能名称'} <span className='text-destructive'>*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(sanitizeSkillName(e.target.value));
                  }}
                  placeholder='my-skill-name'
                />
                <p className='text-muted-foreground mt-1.5 text-xs'>
                  {'仅小写字母、数字和连字符，例如 my-skill-name'}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className='mb-2 block text-sm font-medium'>{'技能描述'}</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={'简短描述技能的功能'}
                />
              </div>

              <SkillIconPicker
                name={name}
                iconUrl={iconUrl}
                iconEmoji={iconEmoji}
                iconBackground={iconBackground}
                onChange={({
                  iconUrl: nextIconUrl,
                  iconEmoji: nextIconEmoji,
                  iconBackground: nextIconBackground,
                }) => {
                  setIconUrl(nextIconUrl);
                  setIconEmoji(nextIconEmoji);
                  setIconBackground(nextIconBackground);
                }}
              />

              {/* Version & Author (side by side) */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium'>{'版本'}</label>
                  <Input
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder='1.0.0'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-medium'>{'作者'}</label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder={'作者名称'}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className='space-y-1.5'>
                <label className='text-foreground block text-sm font-medium'>
                  {'标签（可选）'}
                </label>
                <div className='mb-2 flex flex-wrap gap-2'>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className='bg-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-white'>
                      <HashIcon className='h-3 w-3' />
                      {tag}
                      <Button
                        type='text'
                        size='small'
                        className='ml-1 !h-auto !min-w-0 !p-0 text-white hover:!text-white/70'
                        onClick={() => handleRemoveTag(tag)}
                        icon={<XIcon className='h-3 w-3' />}
                      />
                    </span>
                  ))}
                </div>
                {existingTags.length > 0 && (
                  <div className='mb-2'>
                    <div className='text-muted-foreground mb-1.5 text-xs'>{'选择已有标签：'}</div>
                    <div className='flex flex-wrap gap-1.5'>
                      {existingTags
                        .filter((existingTag) => !tags.includes(existingTag))
                        .map((existingTag) => (
                          <Button
                            key={existingTag}
                            type='default'
                            size='small'
                            className='!h-auto rounded-full px-2 py-1 text-xs'
                            onClick={() => setTags([...tags, existingTag])}
                            icon={<HashIcon className='h-3 w-3' />}>
                            {existingTag}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
                <div className='flex gap-2'>
                  <Input
                    className='flex-1'
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={'输入新标签后按回车'}
                  />
                  <Button type='default' onClick={handleAddTag} disabled={!tagInput.trim()}>
                    {'添加标签'}
                  </Button>
                </div>
              </div>

              <div>
                <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
                  <label className='block text-sm font-medium'>{'指令 (SKILL.md)'}</label>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Upload
                      showUploadList={false}
                      accept='.md,.markdown,.txt'
                      beforeUpload={handleMdFileUpload}>
                      <Button
                        type='default'
                        size='small'
                        icon={<UploadIcon className='h-3.5 w-3.5' />}>
                        {'上传 .md'}
                      </Button>
                    </Upload>
                    <Button
                      type='primary'
                      size='small'
                      loading={isGenerating}
                      disabled={!canGenerateWithAI || !instructions.trim()}
                      icon={<SparklesIcon className='h-3.5 w-3.5' />}
                      onClick={() => void handleAIPolish()}
                      title={
                        !canGenerateWithAI
                          ? '请先在设置中配置 AI 模型'
                          : !instructions.trim()
                            ? '请先编写一些内容再进行润色'
                            : '按 SKILL.md 标准格式润色内容'
                      }>
                      {isGenerating ? '润色中...' : 'AI 润色'}
                    </Button>
                  </div>
                </div>
                {!canGenerateWithAI && (
                  <div className='mb-2 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2'>
                    <AlertCircleIcon className='h-4 w-4 flex-shrink-0 text-amber-500' />
                    <p className='text-xs text-amber-600 dark:text-amber-400'>
                      {'请先在设置中配置 AI 模型以启用 AI 润色'}
                    </p>
                  </div>
                )}
                <div
                  className='border-border overflow-hidden rounded-lg border'
                  style={{ height: 420 }}>
                  <SkillMdEditor
                    ref={skillMdEditorRef}
                    value={instructions}
                    onChange={(value) => setInstructions(value)}
                    preview
                    previewTheme='default'
                    noPrettier
                    toolbars={skillMdToolbars}
                    onDrop={handleDrop}
                    onUploadImg={handleUploadImg}
                    style={{ height: '100%' }}
                  />
                </div>
                <p className='text-muted-foreground mt-1.5 text-xs'>
                  {'支持 Markdown 格式，用于指导 AI 如何使用该技能'}
                </p>
              </div>
            </div>
          )}

          {mode === 'ai' && (
            <div className='space-y-4'>
              <div className='bg-primary/5 border-primary/20 rounded-lg border p-3'>
                <p className='text-primary flex items-center gap-2 text-xs'>
                  <BrainIcon className='h-3.5 w-3.5' />
                  {'将使用 ISkill Creator 技能生成专业的 SKILL.md，您可在保存前审阅与编辑。'}
                </p>
              </div>

              {!canGenerateWithAI && (
                <div className='flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3'>
                  <AlertCircleIcon className='h-4 w-4 flex-shrink-0 text-amber-500' />
                  <p className='text-xs text-amber-600 dark:text-amber-400'>
                    {'Configure an AI model in settings to enable AI generation'}
                  </p>
                </div>
              )}

              <div>
                <label className='mb-2 block text-sm font-medium'>
                  {'技能名称'}
                  <span className='text-destructive ml-1'>*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(sanitizeSkillName(e.target.value))}
                  placeholder={'my-skill'}
                />
                <p className='text-muted-foreground mt-1.5 text-xs'>
                  {'仅小写字母、数字和连字符，例如 my-skill-name'}
                </p>
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium'>
                  {'描述'}
                  <span className='text-destructive ml-1'>*</span>
                </label>
                <Input.TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='描述这个技能应做什么、用途及使用场景…'
                  rows={4}
                />
              </div>

              <div className='flex gap-2 pt-2'>
                <Button className='flex-1' onClick={() => setMode('select')}>
                  {'返回'}
                </Button>
                <Button
                  type='primary'
                  className='flex-1'
                  loading={isGenerating}
                  disabled={!canGenerateWithAI || !name.trim() || !description.trim()}
                  icon={<SparklesIcon className='h-4 w-4' />}
                  onClick={() => void handleAICreate()}>
                  {isGenerating ? '生成中...' : '生成并预览'}
                </Button>
              </div>
            </div>
          )}

          {isScanMode && (
            <div className='space-y-4'>
              {/* Before scan or while scanning */}
              {!scanDone && (
                <div className='py-8 text-center'>
                  <FolderOpenIcon className='text-muted-foreground/30 mx-auto mb-4 h-12 w-12' />
                  <h3 className='mb-2 font-medium'>{'扫描本地技能'}</h3>
                  <p className='text-muted-foreground mb-4 text-sm'>
                    {'自动检测 Claude、Cursor、Windsurf 等 AI 工具中的 SKILL.md 文件。'}
                  </p>
                  <Button
                    type='primary'
                    loading={isScanning}
                    icon={<SearchIcon className='h-4 w-4' />}
                    onClick={() => void handleScanLocal()}>
                    {isScanning ? '扫描中...' : '开始扫描'}
                  </Button>
                </div>
              )}

              {/* Scan results */}
              {scanDone && annotatedScanResults.length > 0 && (
                <div className='space-y-3'>
                  {scanImportNotice && (
                    <div className='border-primary/20 bg-primary/10 text-primary rounded-lg border px-3 py-2 text-xs'>
                      {scanImportNotice}
                    </div>
                  )}
                  <div className='grid grid-cols-2 gap-2 md:grid-cols-4'>
                    <div className='border-border bg-accent/25 rounded-xl border px-3 py-2'>
                      <div className='text-muted-foreground text-[11px]'>{'总数'}</div>
                      <div className='mt-1 text-lg font-semibold'>
                        {annotatedScanResults.length}
                      </div>
                    </div>
                    <div className='border-border bg-accent/25 rounded-xl border px-3 py-2'>
                      <div className='text-muted-foreground text-[11px]'>{'已导入'}</div>
                      <div className='mt-1 text-lg font-semibold'>{importedScanCount}</div>
                    </div>
                    <div className='border-border bg-accent/25 rounded-xl border px-3 py-2'>
                      <div className='text-muted-foreground text-[11px]'>{'可导入'}</div>
                      <div className='mt-1 text-lg font-semibold'>
                        {selectableScanResults.length}
                      </div>
                    </div>
                    <div className='border-primary/20 bg-primary/5 rounded-xl border px-3 py-2'>
                      <div className='text-muted-foreground text-[11px]'>{'已选择'}</div>
                      <div className='text-primary mt-1 text-lg font-semibold'>
                        {selectedScanItems.size}
                      </div>
                    </div>
                  </div>

                  <div className='border-border bg-background/60 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center'>
                    <Input
                      allowClear
                      className='flex-1'
                      prefix={<SearchIcon className='text-muted-foreground h-4 w-4' />}
                      value={scanSearchQuery}
                      onChange={(event) => setScanSearchQuery(event.target.value)}
                      placeholder={'按名称、描述、标签、平台或路径搜索'}
                    />
                    <Button
                      type='default'
                      icon={<HashIcon className='h-4 w-4' />}
                      className={
                        showScanOptionalTags ? '!border-primary/40 !bg-primary/5 !text-primary' : ''
                      }
                      onClick={() => setShowScanOptionalTags((prev) => !prev)}>
                      {showScanOptionalTags ? '隐藏可选标签' : '需要时再加标签'}
                    </Button>
                  </div>

                  {/* Results header with count and select-all */}
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium'>
                      {'Found {{count}} skill(s)'.replace(
                        '{{count}}',
                        String(visibleAnnotatedScanResults.length),
                      )}
                    </p>
                    {visibleSelectableScanResults.length > 0 && (
                      <Button type='text' size='small' onClick={toggleSelectAll}>
                        {visibleSelectableScanResults.every((skill) =>
                          selectedScanItems.has(skill.filePath),
                        ) ? (
                          <>
                            <CheckSquareIcon className='h-3.5 w-3.5' /> {'取消全选'}
                          </>
                        ) : (
                          <>
                            <SquareIcon className='h-3.5 w-3.5' /> {'全选'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Scrollable results cards */}
                  <div className='max-h-[480px] overflow-y-auto pr-1'>
                    <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
                      {visibleAnnotatedScanResults.map((skill) => {
                        const isSelected = selectedScanItems.has(skill.filePath);
                        const shortPath = (() => {
                          const parts = skill.localPath
                            .replace(/\\/g, '/')
                            .split('/')
                            .filter(Boolean);
                          return parts.length >= 2
                            ? `.../${parts[parts.length - 2]}/${parts[parts.length - 1]}`
                            : skill.localPath;
                        })();
                        return (
                          <Button
                            key={skill.filePath}
                            type='default'
                            block
                            disabled={skill.isImported}
                            onClick={() => !skill.isImported && toggleScanItem(skill.filePath)}
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
                                      <h4 className='truncate text-sm font-semibold'>
                                        {skill.name}
                                      </h4>
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
                                    {skill.author && (
                                      <p className='text-muted-foreground mt-1 text-[11px]'>
                                        {skill.author}
                                      </p>
                                    )}
                                  </div>

                                  <div className='shrink-0 pt-0.5'>
                                    {skill.isImported || isSelected ? (
                                      <CheckSquareIcon className='text-primary h-4 w-4' />
                                    ) : (
                                      <SquareIcon className='text-muted-foreground h-4 w-4' />
                                    )}
                                  </div>
                                </div>

                                {skill.description && (
                                  <p className='text-muted-foreground mt-3 line-clamp-3 text-xs leading-5'>
                                    {skill.description}
                                  </p>
                                )}

                                <div className='mt-3 flex flex-wrap gap-1.5'>
                                  {skill.platforms.map((p) => (
                                    <span
                                      key={p}
                                      className='bg-primary/8 text-primary/80 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium'>
                                      {p}
                                    </span>
                                  ))}
                                </div>

                                {!skill.isImported && isSelected && showScanOptionalTags && (
                                  <div className='border-border bg-accent/20 mt-4 space-y-2 rounded-xl border p-3'>
                                    <div className='text-foreground text-[11px] font-medium'>
                                      {'导入标签（可选）'}
                                    </div>
                                    <div className='flex flex-wrap gap-1.5'>
                                      {(scanTagDrafts[skill.localPath] || []).map((tag) => (
                                        <span
                                          key={tag}
                                          className='bg-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-white'>
                                          <HashIcon className='h-3 w-3' />
                                          {tag}
                                          <Button
                                            type='text'
                                            size='small'
                                            className='!h-auto !min-w-0 !p-0 text-white hover:!text-white/70'
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              handleRemoveScanTag(skill.localPath, tag);
                                            }}
                                            icon={<XIcon className='h-3 w-3' />}
                                          />
                                        </span>
                                      ))}
                                    </div>
                                    <div className='flex gap-2'>
                                      <Input
                                        className='flex-1 text-xs'
                                        size='small'
                                        value={scanTagInputs[skill.localPath] || ''}
                                        onClick={(event) => event.stopPropagation()}
                                        onChange={(event) =>
                                          setScanTagInputs((prev) => ({
                                            ...prev,
                                            [skill.localPath]: event.target.value,
                                          }))
                                        }
                                        onKeyDown={(event) => {
                                          if (event.key === 'Enter') {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            handleAddScanTag(skill.localPath);
                                          }
                                        }}
                                        placeholder={'输入新标签后按回车'}
                                      />
                                      <Button
                                        type='default'
                                        size='small'
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          handleAddScanTag(skill.localPath);
                                        }}
                                        disabled={!scanTagInputs[skill.localPath]?.trim()}>
                                        {'添加标签'}
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                <div
                                  className='text-muted-foreground/60 mt-4 flex items-center gap-1 truncate font-mono text-[11px]'
                                  title={skill.localPath}>
                                  <FolderOpenIcon className='h-3 w-3 shrink-0' />
                                  <span className='truncate'>{shortPath}</span>
                                </div>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 重新扫描 */}
                  <div className='flex justify-center'>
                    <Button
                      type='text'
                      size='small'
                      loading={isScanning}
                      icon={<SearchIcon className='h-3 w-3' />}
                      onClick={() => void handleScanLocal()}>
                      {'重新扫描'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Scan done but no results */}
              {scanDone && annotatedScanResults.length === 0 && (
                <div className='py-8 text-center'>
                  <FolderOpenIcon className='text-muted-foreground/20 mx-auto mb-4 h-12 w-12' />
                  <p className='text-muted-foreground mb-4 text-sm'>
                    {'未发现新的本地 SKILL.md 文件。'}
                  </p>
                  <Button
                    type='default'
                    loading={isScanning}
                    icon={<SearchIcon className='h-3.5 w-3.5' />}
                    onClick={() => void handleScanLocal()}>
                    {'重新扫描'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
      <UnsavedLeaveDialog />
    </>
  );
}

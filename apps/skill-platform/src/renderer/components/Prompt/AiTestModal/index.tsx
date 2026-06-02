import type { IPrompt } from '@/types/modules';
import { FullscreenModal } from '@renderer/components/ui/FullscreenModal';
import { MarkdownPreview } from '@renderer/components/ui/MarkdownPreview';
import { useToast } from '@renderer/components/ui/Toast';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import { useStableModelResolver } from '@renderer/hooks/useStableModelResolver';
import {
  IAITestResult,
  buildMessagesFromPrompt,
  generateImage,
  multiModelCompare,
  type IChatImageAttachment,
  type IChatMessage,
} from '@renderer/services/ai';
import { getModelsByType, resolveScenarioModel } from '@renderer/services/ai/defaults';
import { buildSharedAiChatServices, createPromptTestStream } from '@renderer/services/aichat';
import { createMainChatSession } from '@renderer/services/aichat/chat-history-bridge';
import { useSettingsStore } from '@renderer/store';
import type { UploadProps } from 'antd';
import { Button, Input, Upload } from 'antd';
import {
  BracesIcon,
  CopyIcon,
  DownloadIcon,
  GitCompareIcon,
  ImageIcon,
  PaperclipIcon,
  PlayIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { PromptTestAiChat } from '../PromptTestAiChat';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: IPrompt | null;
  initialMode?: 'single' | 'compare' | 'image';
  filledSystemPrompt?: string;
  filledUserPrompt?: string;
  onUsageIncrement?: (promptId: string) => void;
  onSaveResponse?: (promptId: string, response: string) => void;
  onAddImage?: (imageUrl: string) => void; // Add: Add generated image to IPrompt
  // 新增：将生成的图片添加到 IPrompt
}

interface IAiTestImageAttachment extends IChatImageAttachment {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
}

const MAX_AI_TEST_IMAGES = 8;
const MAX_AI_TEST_IMAGE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_AI_TEST_IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

export function AiTestModal({
  isOpen,
  onClose,
  prompt,
  initialMode,
  filledSystemPrompt,
  filledUserPrompt,
  onUsageIncrement,
  onSaveResponse,
  onAddImage,
}: IProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'single' | 'compare' | 'image'>('single');
  const [chatBootstrap, setChatBootstrap] = useState<{
    sessionId: string;
    sessionKey: string;
  } | null>(null);
  // Separate loading states for single model and multi-model
  // 分离单模型和多模型的 loading 状态
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const baseMessagesRef = useRef<IChatMessage[]>([]);
  const [compareResults, setCompareResults] = useState<IAITestResult[] | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  // PromptVariable fill state
  // 变量填充状态
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  // Output format state (Issue #38)
  // 输出格式状态
  const [outputFormat, setOutputFormat] = useState<'text' | 'json_object' | 'json_schema'>('text');
  const [jsonSchemaName, setJsonSchemaName] = useState('response');
  const [jsonSchemaContent, setJsonSchemaContent] = useState('');
  const compareBuffersRef = useRef<Record<string, { response: string }>>({});
  const compareFlushRafRef = useRef<number | null>(null);
  const [testImageAttachments, setTestImageAttachments] = useState<IAiTestImageAttachment[]>([]);
  const [selectedReferenceImages, setSelectedReferenceImages] = useState<string[]>([]);

  // AI settings
  // AI 设置
  const aiModels = useSettingsStore((state) => state.aiModels);
  const scenarioModelDefaults = useSettingsStore((state) => state.scenarioModelDefaults);

  const modelResolverRef = useStableModelResolver(aiModels);
  const chatModelOptionGroups = useRankedChatModelGroups(aiModels);
  const workspace = useChatWorkspaceBinding();

  // Get default image generation model
  // 获取默认生图模型
  const defaultImageModel = useMemo(() => {
    return resolveScenarioModel(aiModels, scenarioModelDefaults, 'imageTest', 'image');
  }, [aiModels, scenarioModelDefaults]);

  // Get all image generation models
  // 获取所有生图模型
  const imageModels = useMemo(() => getModelsByType(aiModels, 'image'), [aiModels]);

  const compareModels = useMemo(() => {
    if (mode === 'image') {
      return [];
    }
    return aiModels.filter((model) => (model.type ?? 'chat') === 'chat');
  }, [aiModels, mode]);

  useEffect(() => {
    setSelectedModelIds((prev) =>
      prev.filter((id) => compareModels.some((model) => model.id === id)),
    );
  }, [compareModels]);

  useEffect(() => {
    if (!isOpen || !prompt) return;
    setMode(initialMode ?? 'single');
  }, [initialMode, isOpen, prompt]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const flushCompareBuffers = useCallback(() => {
    setCompareResults((prev) => {
      if (!prev) return prev;
      return prev.map((result) => {
        const buffered = result.id ? compareBuffersRef.current[result.id] : undefined;
        if (!buffered) {
          return result;
        }
        return {
          ...result,
          response: buffered.response,
        };
      });
    });
  }, []);

  const scheduleCompareFlush = useCallback(() => {
    if (compareFlushRafRef.current !== null) return;
    compareFlushRafRef.current = requestAnimationFrame(() => {
      compareFlushRafRef.current = null;
      flushSync(() => {
        flushCompareBuffers();
      });
    });
  }, [flushCompareBuffers]);

  const resetCompareBuffers = useCallback(() => {
    if (compareFlushRafRef.current !== null) {
      cancelAnimationFrame(compareFlushRafRef.current);
      compareFlushRafRef.current = null;
    }
    compareBuffersRef.current = {};
  }, []);

  // Extract variables
  // 提取变量
  const extractVariables = (text: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  };

  // Get all variables
  // 获取所有变量
  const allVariables = useMemo(() => {
    if (!prompt) return [];
    const sysVars = extractVariables(prompt.systemPrompt || '');
    const userVars = extractVariables(prompt.userPrompt);
    return [...new Set([...sysVars, ...userVars])];
  }, [prompt]);

  // 替换变量
  const replaceVariables = useCallback(
    (text: string): string => {
      return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
        return variableValues[varName] || match;
      });
    },
    [variableValues],
  );

  // 计算实际使用的 prompt 内容
  const baseSystemPrompt = useMemo(() => {
    if (!prompt) return '';
    return prompt.systemPrompt || '';
  }, [prompt]);

  const baseUserPrompt = useMemo(() => {
    if (!prompt) return '';
    return prompt.userPrompt;
  }, [prompt]);

  const systemPrompt = useMemo(
    () => filledSystemPrompt ?? replaceVariables(baseSystemPrompt),
    [filledSystemPrompt, replaceVariables, baseSystemPrompt],
  );
  const userPrompt = useMemo(
    () => filledUserPrompt ?? replaceVariables(baseUserPrompt),
    [filledUserPrompt, replaceVariables, baseUserPrompt],
  );

  const readImageFileAsAttachment = useCallback((file: File): Promise<IAiTestImageAttachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('无法读取图片'));
          return;
        }

        const commaIndex = reader.result.indexOf(',');
        if (commaIndex === -1) {
          reject(new Error('无法读取图片'));
          return;
        }

        resolve({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          dataUrl: reader.result,
          base64: reader.result.slice(commaIndex + 1),
        });
      };
      reader.onerror = () => reject(new Error('无法读取图片'));
      reader.readAsDataURL(file);
    });
  }, []);

  const formatImageSize = useCallback((bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }, []);

  const handleTestImageSelection = useCallback(
    async (files: readonly File[]) => {
      if (files.length === 0) return;

      const remainingSlots = MAX_AI_TEST_IMAGES - testImageAttachments.length;
      if (remainingSlots <= 0) {
        showToast(`最多只能附加 ${MAX_AI_TEST_IMAGES} 张图片`, 'error');
        return;
      }

      const selectedFiles = [...files];
      if (selectedFiles.length > remainingSlots) {
        showToast(`最多只能附加 ${MAX_AI_TEST_IMAGES} 张图片`, 'error');
      }

      const acceptedFiles: File[] = [];
      for (const file of selectedFiles.slice(0, remainingSlots)) {
        if (!SUPPORTED_AI_TEST_IMAGE_MIME_TYPES.has(file.type)) {
          showToast(`${file.name} 不是图片文件`, 'error');
          continue;
        }
        if (file.size > MAX_AI_TEST_IMAGE_BYTES) {
          showToast(`${file.name} 超过 ${formatImageSize(MAX_AI_TEST_IMAGE_BYTES)}`, 'error');
          continue;
        }
        acceptedFiles.push(file);
      }

      if (acceptedFiles.length === 0) return;

      try {
        const attachments = await Promise.all(acceptedFiles.map(readImageFileAsAttachment));
        setTestImageAttachments((prev) => [...prev, ...attachments].slice(0, MAX_AI_TEST_IMAGES));
      } catch (error) {
        showToast(error instanceof Error ? error.message : '无法读取图片', 'error');
      }
    },
    [formatImageSize, readImageFileAsAttachment, showToast, testImageAttachments.length],
  );

  const handleTestImageUpload: UploadProps['beforeUpload'] = useCallback(
    (_file, fileList) => {
      void handleTestImageSelection(fileList);
      return Upload.LIST_IGNORE;
    },
    [handleTestImageSelection],
  );

  const removeTestImageAttachment = useCallback((id: string) => {
    setTestImageAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  }, []);

  const toggleReferenceImage = useCallback((fileName: string) => {
    setSelectedReferenceImages((prev) =>
      prev.includes(fileName) ? prev.filter((item) => item !== fileName) : [...prev, fileName],
    );
  }, []);

  const buildImageReferenceAttachments = useCallback(async (): Promise<IChatImageAttachment[]> => {
    const savedReferences = await Promise.all<IChatImageAttachment | null>(
      selectedReferenceImages.map(async (fileName) => {
        const base64 = await window.electron?.readImageBase64?.(fileName);
        if (!base64) return null;

        const extension = fileName.split('.').pop()?.toLowerCase();
        const mimeType =
          extension === 'jpg' || extension === 'jpeg'
            ? 'image/jpeg'
            : extension === 'webp'
              ? 'image/webp'
              : extension === 'gif'
                ? 'image/gif'
                : 'image/png';

        return {
          name: fileName,
          mimeType,
          base64,
        };
      }),
    );

    return [
      ...savedReferences.filter((item): item is IChatImageAttachment => item !== null),
      ...testImageAttachments.map((attachment) => ({
        name: attachment.name,
        mimeType: attachment.mimeType,
        base64: attachment.base64,
      })),
    ];
  }, [selectedReferenceImages, testImageAttachments]);

  const getResponseFormat = useCallback(() => {
    if (outputFormat === 'text') {
      return undefined;
    }
    if (outputFormat === 'json_schema' && jsonSchemaContent) {
      try {
        return {
          type: outputFormat as 'json_schema',
          jsonSchema: {
            name: jsonSchemaName || 'response',
            strict: true,
            schema: JSON.parse(jsonSchemaContent) as Record<string, unknown>,
          },
        };
      } catch {
        return { type: 'json_schema' as const };
      }
    }
    return { type: outputFormat as 'json_object' | 'json_schema' };
  }, [jsonSchemaContent, jsonSchemaName, outputFormat]);

  const refreshBaseMessages = useCallback(async () => {
    if (mode === 'single') {
      const msgs = buildMessagesFromPrompt(systemPrompt, '', variableValues);
      baseMessagesRef.current = msgs.filter((m) => m.role === 'system');
      return;
    }
    const imageAttachments = mode === 'image' ? await buildImageReferenceAttachments() : undefined;
    baseMessagesRef.current = buildMessagesFromPrompt(
      systemPrompt,
      userPrompt,
      variableValues,
      imageAttachments,
    );
  }, [buildImageReferenceAttachments, mode, systemPrompt, userPrompt, variableValues]);

  useEffect(() => {
    if (!isOpen || !prompt) return;
    void refreshBaseMessages();
  }, [isOpen, prompt, refreshBaseMessages]);

  useEffect(() => {
    if (!isOpen || !prompt) {
      setChatBootstrap(null);
      return;
    }
    const sessionId = createMainChatSession(`提示词测试：${prompt.title}`);
    setChatBootstrap({
      sessionId,
      sessionKey: `prompt-test-${sessionId}`,
    });
  }, [isOpen, prompt?.id, prompt?.title]);

  const promptIdRef = useRef(prompt?.id);
  promptIdRef.current = prompt?.id;

  const promptTestServices = useMemo(
    () =>
      buildSharedAiChatServices({
        aiModels,
        chatModelOptionGroups,
        workspace,
        enableSuperpower: false,
        noAttachmentsMessage: '不是图片文件',
        callAIChatStream: createPromptTestStream({
          getModelConfig: (modelKey) => modelResolverRef.current.getModelConfig(modelKey),
          getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
          getBaseMessages: () => baseMessagesRef.current,
          getResponseFormat,
          onComplete: (text) => {
            if (onSaveResponse && promptIdRef.current) {
              onSaveResponse(promptIdRef.current, text);
            }
          },
          onErrorToast: (msg) => showToast(msg, 'error'),
          onNeedModel: () => showToast('请先在设置中配置 AI 对话模型', 'error'),
        }),
      }),
    [aiModels, chatModelOptionGroups, getResponseFormat, onSaveResponse, showToast, workspace],
  );

  // 重置状态
  useEffect(() => {
    if (isOpen && prompt) {
      resetCompareBuffers();
      setCompareResults(null);
      setGeneratedImages([]);
      setTestImageAttachments([]);
      setSelectedReferenceImages([]);
      setIsCompareLoading(false);
      setIsImageLoading(false);
      const initialValues: Record<string, string> = {};
      allVariables.forEach((v) => {
        initialValues[v] = '';
      });
      setVariableValues(initialValues);
    }
  }, [isOpen, prompt?.id, allVariables, resetCompareBuffers]);

  useEffect(() => {
    return () => {
      resetCompareBuffers();
    };
  }, [resetCompareBuffers]);

  // 如果没有 prompt，返回 null（所有 hooks 已在上面调用完毕）
  if (!prompt) return null;

  const handleCopyPrompt = async () => {
    const text = [
      systemPrompt.trim() ? `【系统】\n${systemPrompt.trim()}` : '',
      userPrompt.trim() ? `【用户】\n${userPrompt.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    if (!text) {
      showToast('没有可复制的内容', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('已复制', 'success');
    } catch {
      showToast('复制失败', 'error');
    }
  };

  const handleSaveResponse = async (response: string) => {
    const text = response.trim();
    if (!text) {
      showToast('没有可保存的内容', 'warning');
      return;
    }
    if (onSaveResponse) {
      await onSaveResponse(prompt.id, text);
      showToast('已保存回复', 'success');
      return;
    }
    showToast('当前环境不支持保存回复', 'warning');
  };

  // 多模型对比
  const runCompare = async () => {
    if (selectedModelIds.length < 2) return;

    setIsCompareLoading(true);
    setCompareResults(null);

    // 增加使用次数
    if (onUsageIncrement) {
      onUsageIncrement(prompt.id);
    }

    const selectedConfigs = compareModels
      .filter((m) => selectedModelIds.includes(m.id))
      .map((m) => ({
        id: m.id,
        provider: m.provider,
        apiProtocol: m.apiProtocol,
        apiKey: m.apiKey,
        apiUrl: m.apiUrl,
        model: m.model,
        chatParams: m.chatParams,
        imageParams: m.imageParams,
      }));

    const messages = buildMessagesFromPrompt(systemPrompt, userPrompt, variableValues);

    try {
      resetCompareBuffers();
      compareBuffersRef.current = Object.fromEntries(
        selectedConfigs.map((config) => [config.id, { response: '' }]),
      );

      // 支持流式：提前渲染占位结果，让用户能看到“正在流式输出”的差异
      setCompareResults(
        selectedConfigs.map((c) => ({
          id: c.id,
          success: true,
          response: '',
          latency: 0,
          model: c.model,
          provider: c.provider,
        })),
      );

      const streamCallbacksMap = new Map<string, any>();
      for (const cfg of selectedConfigs) {
        if (cfg.chatParams?.stream) {
          streamCallbacksMap.set(cfg.id, {
            onContent: (chunk: string) => {
              const buffer = compareBuffersRef.current[cfg.id];
              if (!buffer) return;
              buffer.response += chunk;
              scheduleCompareFlush();
            },
          });
        }
      }

      const result = await multiModelCompare(selectedConfigs as any, messages, {
        streamCallbacksMap,
      });
      flushCompareBuffers();
      setCompareResults(result.results);
    } catch (error) {
      // Handle error
    } finally {
      resetCompareBuffers();
      setIsCompareLoading(false);
    }
  };

  // 切换模型选择
  const toggleModelSelection = (modelId: string) => {
    setSelectedModelIds((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId],
    );
  };

  // 生图测试
  const runImageTest = async () => {
    if (!defaultImageModel) {
      showToast('请先配置生图模型', 'error');
      return;
    }

    setIsImageLoading(true);
    setGeneratedImages([]);

    // 增加使用次数
    if (onUsageIncrement) {
      onUsageIncrement(prompt.id);
    }

    try {
      const config = {
        provider: defaultImageModel.provider,
        apiProtocol: defaultImageModel.apiProtocol,
        apiKey: defaultImageModel.apiKey,
        apiUrl: defaultImageModel.apiUrl,
        model: defaultImageModel.model,
      };

      const referenceImages = await buildImageReferenceAttachments();
      const result = await generateImage(config, userPrompt, {
        n: 1,
        referenceImages,
      });

      const urls: string[] = [];
      for (const item of result.data) {
        if (item.url) {
          urls.push(item.url);
        } else if (item.b64_json) {
          // 将 base64 转换为 data URL
          urls.push(`data:image/png;base64,${item.b64_json}`);
        }
      }

      setGeneratedImages(urls);
      if (urls.length > 0) {
        showToast('图片生成成功', 'success');
      }
    } catch (error) {
      showToast(`操作失败: ${error instanceof Error ? error.message : '操作失败'}`, 'error');
    } finally {
      setIsImageLoading(false);
    }
  };

  const renderAiResponseContent = (content?: string) => {
    if (!content) {
      return null;
    }

    return (
      <div className='markdown-content break-words text-[15px] leading-relaxed'>
        <MarkdownPreview value={content} />
      </div>
    );
  };

  // 将生成的图片添加到 IPrompt
  const handleAddImageToPrompt = async (imageUrl: string) => {
    if (!onAddImage) return;

    try {
      // 如果是外部 URL，需要先下载到本地
      if (imageUrl.startsWith('http')) {
        const fileName = await window.electron?.downloadImage?.(imageUrl);
        if (fileName) {
          onAddImage(fileName);
          showToast('图片已添加到 IPrompt', 'success');
        } else {
          showToast('上传失败', 'error');
        }
      } else if (imageUrl.startsWith('data:')) {
        // base64 图片，需要保存到本地
        // 提取 base64 数据（去掉 data:image/png;base64, 前缀）
        const base64Data = imageUrl.split(',')[1];
        const fileName = `generated-${Date.now()}.png`;
        await window.electron?.saveImageBase64?.(fileName, base64Data);
        onAddImage(fileName);
        showToast('图片已添加到 IPrompt', 'success');
      }
    } catch (error) {
      showToast('上传失败', 'error');
    }
  };

  // 下载图片
  const handleDownloadImage = async (imageUrl: string, index: number) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('下载成功', 'success');
    } catch (error) {
      showToast('下载失败', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <FullscreenModal
      open={isOpen}
      title={
        <div>
          <div className='text-sm font-semibold'>{'AI 测试'}</div>
          <div className='text-muted-foreground truncate text-xs'>{prompt.title}</div>
        </div>
      }
      onClose={onClose}
      footer={null}
      showDefaultFooter={false}
      zIndex={9999}
      destroyOnHidden={false}>
      <aside className='flex h-full min-h-0 flex-col'>
        <div
          className={`flex min-h-0 flex-1 flex-col px-5 py-4 ${
            mode === 'single' ? 'overflow-hidden' : 'overflow-y-auto'
          }`}>
          <div className={`space-y-4 ${mode === 'single' ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
            {/* 模式切换 */}
            <div className='border-border flex flex-wrap items-center gap-2 border-b pb-4'>
              <>
                <Button
                  type={mode === 'single' ? 'primary' : 'default'}
                  onClick={() => setMode('single')}
                  className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium'
                  icon={<PlayIcon className='h-4 w-4' />}>
                  {'AI 测试'}
                </Button>
                <Button
                  type={mode === 'compare' ? 'primary' : 'default'}
                  onClick={() => setMode('compare')}
                  className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium'
                  icon={<GitCompareIcon className='h-4 w-4' />}>
                  {'多模型对比'}
                </Button>
              </>
              <Button
                type={mode === 'image' ? 'primary' : 'default'}
                onClick={() => setMode('image')}
                className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium'
                icon={<ImageIcon className='h-4 w-4' />}>
                {'测试生图'}
              </Button>
            </div>

            {/* 变量填充 */}
            {allVariables.length > 0 && (
              <div className='space-y-3'>
                <h4 className='text-muted-foreground flex items-center gap-1.5 text-sm font-medium'>
                  <BracesIcon className='h-4 w-4' />
                  {'请填写以下变量的值（自动记住历史输入）'}
                </h4>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {allVariables.map((variable) => (
                    <div key={variable} className='space-y-1'>
                      <label className='text-muted-foreground font-mono text-xs'>{`{{${variable}}}`}</label>
                      <Input
                        value={variableValues[variable] || ''}
                        onChange={(e) =>
                          setVariableValues((prev) => ({ ...prev, [variable]: e.target.value }))
                        }
                        placeholder={'输入值'}
                        className='bg-muted/50 border-border focus:ring-primary/50 w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2'
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IPrompt 预览（多模型对比 / 生图测试保留） */}
            {mode !== 'single' && (
              <div className='space-y-2'>
                <h4 className='text-muted-foreground text-sm font-medium'>{'User IPrompt'}</h4>
                <div className='bg-muted/50 max-h-32 overflow-y-auto rounded-lg p-3'>
                  <p className='whitespace-pre-wrap text-sm'>{userPrompt}</p>
                </div>
              </div>
            )}

            {mode === 'image' && (
              <div className='space-y-3'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='space-y-1'>
                    <h4 className='text-muted-foreground flex items-center gap-1.5 text-sm font-medium'>
                      <PaperclipIcon className='h-4 w-4' />
                      {'参考图片'}
                    </h4>
                    <p className='text-muted-foreground text-xs'>
                      {`支持 PNG、JPG、WebP、GIF，用于多模态对话模型识别图片。最多 ${MAX_AI_TEST_IMAGES} 张，每张不超过 ${formatImageSize(MAX_AI_TEST_IMAGE_BYTES)}。`}
                    </p>
                  </div>
                  <Upload
                    showUploadList={false}
                    multiple
                    accept='image/png,image/jpeg,image/webp,image/gif'
                    beforeUpload={handleTestImageUpload}
                    disabled={testImageAttachments.length >= MAX_AI_TEST_IMAGES}>
                    <Button
                      disabled={testImageAttachments.length >= MAX_AI_TEST_IMAGES}
                      className='border-border bg-background hover:bg-accent flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50'
                      icon={<ImageIcon className='h-4 w-4' />}>
                      {'添加图片'}
                    </Button>
                  </Upload>
                </div>

                {testImageAttachments.length > 0 && (
                  <div className='space-y-2'>
                    <div className='text-muted-foreground text-xs font-medium'>
                      {'已上传的参考图片'}
                    </div>
                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                      {testImageAttachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className='border-border bg-muted/40 relative overflow-hidden rounded-lg border'>
                          <img
                            src={attachment.dataUrl}
                            alt={attachment.name}
                            className='h-24 w-full object-cover'
                          />
                          <Button
                            type='text'
                            size='small'
                            onClick={() => removeTestImageAttachment(attachment.id)}
                            className='bg-background/90 text-foreground hover:bg-background absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full shadow-sm'
                            title={'移除图片'}
                            icon={<XIcon className='h-3.5 w-3.5' />}
                          />
                          <div className='space-y-0.5 px-2 py-1.5'>
                            <p className='truncate text-xs font-medium' title={attachment.name}>
                              {attachment.name}
                            </p>
                            <p className='text-muted-foreground text-[10px]'>
                              {formatImageSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 单模型测试 */}
            {mode === 'single' && (
              <div className='flex min-h-0 flex-1 flex-col space-y-4'>
                {/* 输出格式选择器 (Issue #38) */}
                <div className='space-y-3'>
                  <h4 className='text-muted-foreground text-sm font-medium'>{'输出格式'}</h4>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      type={outputFormat === 'text' ? 'primary' : 'default'}
                      size='small'
                      shape='round'
                      onClick={() => setOutputFormat('text')}
                      className='rounded-full px-3 py-1.5 text-xs font-medium'>
                      {'文本'}
                    </Button>
                    <Button
                      type={outputFormat === 'json_object' ? 'primary' : 'default'}
                      size='small'
                      shape='round'
                      onClick={() => setOutputFormat('json_object')}
                      className='rounded-full px-3 py-1.5 text-xs font-medium'>
                      {'JSON 模式'}
                    </Button>
                    <Button
                      type={outputFormat === 'json_schema' ? 'primary' : 'default'}
                      size='small'
                      shape='round'
                      onClick={() => setOutputFormat('json_schema')}
                      className='rounded-full px-3 py-1.5 text-xs font-medium'>
                      {'JSON Schema'}
                    </Button>
                  </div>

                  {/* JSON Schema 编辑器 */}
                  {outputFormat === 'json_schema' && (
                    <div className='bg-muted/50 border-border space-y-2 rounded-lg border p-3'>
                      <div className='space-y-1'>
                        <label className='text-muted-foreground text-xs'>{'Schema 名称'}</label>
                        <Input
                          value={jsonSchemaName}
                          onChange={(e) => setJsonSchemaName(e.target.value)}
                          placeholder={'Schema 名称'.toLowerCase()}
                          className='bg-background border-border focus:ring-primary/50 w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2'
                        />
                      </div>
                      <div className='space-y-1'>
                        <label className='text-muted-foreground text-xs'>{'Schema 定义'}</label>
                        <Input.TextArea
                          value={jsonSchemaContent}
                          onChange={(e) => setJsonSchemaContent(e.target.value)}
                          placeholder={
                            '输入 JSON Schema，例如：\n{\n  "type": "object",\n  "properties": {\n    "answer": { "type": "string" }\n  },\n  "required": ["answer"]\n}'
                          }
                          rows={6}
                          className='bg-background border-border focus:ring-primary/50 w-full resize-none rounded-md border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2'
                        />
                        <p className='text-muted-foreground text-xs'>
                          {'定义输出的 JSON 结构，AI 将严格遵循此格式返回'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className='border-border/60 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border'>
                  <div className='border-border flex shrink-0 items-center gap-2 border-b px-3 py-2'>
                    <Button
                      type='text'
                      size='small'
                      onClick={() => void handleCopyPrompt()}
                      className='text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs'
                      icon={<CopyIcon className='h-3.5 w-3.5' />}>
                      {'复制提示词'}
                    </Button>
                  </div>
                  {chatBootstrap ? (
                    <PromptTestAiChat
                      sessionKey={chatBootstrap.sessionKey}
                      bootstrapSessionId={chatBootstrap.sessionId}
                      services={promptTestServices}
                      systemPrompt={systemPrompt}
                      userPrompt={userPrompt}
                      onAfterSend={() => {
                        if (onUsageIncrement) {
                          onUsageIncrement(prompt.id);
                        }
                      }}
                      renderAssistantMessageActions={
                        onSaveResponse
                          ? (message) => (
                              <Button
                                type='link'
                                size='small'
                                onClick={() => void handleSaveResponse(message.content)}
                                className='text-primary hover:text-primary/80 h-auto p-0 text-xs font-medium'>
                                保存回复
                              </Button>
                            )
                          : undefined
                      }
                    />
                  ) : null}
                </div>
              </div>
            )}

            {/* 多模型对比 */}
            {mode === 'compare' && (
              <div className='space-y-4'>
                {/* 模型选择 */}
                <div className='space-y-2'>
                  <h4 className='text-muted-foreground text-sm font-medium'>
                    {'选择多个模型对比响应效果'}
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {compareModels.map((model) => (
                      <Button
                        key={model.id}
                        type={selectedModelIds.includes(model.id) ? 'primary' : 'default'}
                        size='small'
                        shape='round'
                        onClick={() => toggleModelSelection(model.id)}
                        className='rounded-full px-3 py-1.5 text-xs font-medium'>
                        {model.name || model.model}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    {`对比 ${selectedModelIds.length} 个模型`}
                  </span>
                  <Button
                    type='primary'
                    onClick={runCompare}
                    disabled={isCompareLoading || selectedModelIds.length < 2}
                    loading={isCompareLoading}
                    className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium'
                    icon={!isCompareLoading ? <GitCompareIcon className='h-4 w-4' /> : undefined}>
                    {isCompareLoading ? '对比中...' : '开始对比测试'}
                  </Button>
                </div>

                {/* 对比结果 */}
                {compareResults && (
                  <div className='grid max-h-80 grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2'>
                    {compareResults.map((res, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border p-3 ${
                          res.success
                            ? 'border-border app-wallpaper-surface'
                            : 'border-destructive/50 bg-destructive/5'
                        }`}>
                        <div className='mb-2 flex items-center justify-between'>
                          <span className='truncate text-xs font-medium'>{res.model}</span>
                          <span className='text-muted-foreground text-[10px]'>{res.latency}ms</span>
                        </div>
                        <div className='text-muted-foreground max-h-40 overflow-y-auto text-xs'>
                          {res.success
                            ? (renderAiResponseContent(res.response || '(空)') ?? '(空)')
                            : res.error || '未知错误'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 生图测试 */}
            {mode === 'image' && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <span className='text-muted-foreground text-sm'>
                      {'模型'}: {defaultImageModel?.model || '未配置生图模型'}
                    </span>
                    {defaultImageModel && (
                      <p className='text-muted-foreground text-xs'>
                        {'服务提供商'}: {defaultImageModel.provider}
                      </p>
                    )}
                  </div>
                  <Button
                    type='primary'
                    onClick={runImageTest}
                    disabled={isImageLoading || !defaultImageModel}
                    loading={isImageLoading}
                    className='flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium'
                    icon={!isImageLoading ? <ImageIcon className='h-4 w-4' /> : undefined}>
                    {isImageLoading ? '生成中...' : '测试生图'}
                  </Button>
                </div>

                {/* 生成的图片 */}
                {generatedImages.length > 0 && (
                  <div className='space-y-3'>
                    <h4 className='text-muted-foreground text-sm font-medium'>{'生成的图片'}</h4>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      {generatedImages.map((imageUrl, idx) => (
                        <div
                          key={idx}
                          className='border-border group relative overflow-hidden rounded-lg border'>
                          <img
                            src={imageUrl}
                            alt={`Generated ${idx + 1}`}
                            className='h-auto w-full object-cover'
                          />
                          <div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                            {onAddImage && (
                              <Button
                                type='primary'
                                size='small'
                                onClick={() => handleAddImageToPrompt(imageUrl)}
                                className='flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium'
                                title={'添加到 IPrompt'}
                                icon={<PlusIcon className='h-4 w-4' />}>
                                {'添加到 IPrompt'}
                              </Button>
                            )}
                            <Button
                              size='small'
                              onClick={() => handleDownloadImage(imageUrl, idx)}
                              className='bg-muted text-foreground hover:bg-muted/80 flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium'
                              title={'下载'}
                              icon={<DownloadIcon className='h-4 w-4' />}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 无生图模型提示 */}
                {!defaultImageModel && (
                  <div className='bg-muted/50 border-border rounded-lg border p-4 text-center'>
                    <ImageIcon className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
                    <p className='text-muted-foreground text-sm'>{'请先在设置中配置生图模型'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </FullscreenModal>
  );
}

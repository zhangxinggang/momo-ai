import type { IAiChatServices, ILocalPathConfig, TCallAiChatStream } from '@momo/aichat';

import {
  getImageScenarioModels,
  getModelsByType,
  isImageCapableModel,
  toAIConfig,
} from '@renderer/services/ai/defaults';
import { resolveImageModelCapabilities } from '@renderer/services/ai/image/capabilities';
import { openExternalUrl } from '@renderer/services/desktop';
import type { IAIModelConfig } from '@renderer/types/settings';
import { uploadChatAttachmentFiles, validateChatAttachmentFiles } from '../chat-attachment-upload';
import { MAIN_AI_CHAT_STORAGE_PREFIX } from '../chat-history-bridge';
import { renderChatModelSelect } from '../chat-model-select';
import { createNoteReferencesConfig } from '../note-reference-config';
import { SUPERPOWER_PROMPTS } from '../superpower-prompts';
import { createWebChatSourceStore } from './web-chat-source-store';
import { createLocalChatStorage } from './web-chat-storage';

/** Superpowers 默认注入 */
export function buildSuperpowerDefaults(options: {
  enableSuperpower?: boolean;
  overrides?: Partial<IAiChatServices>;
}): Partial<IAiChatServices> {
  const defaults: Partial<IAiChatServices> = {};
  if (options.enableSuperpower !== false) {
    defaults.superpowerPrompts = SUPERPOWER_PROMPTS;
  }
  return { ...defaults, ...options.overrides };
}

export interface IBuildSharedAiChatServicesOptions {
  aiModels: IAIModelConfig[];
  callAIChatStream: TCallAiChatStream;
  /** 默认与侧栏 AI 对话共用；弹窗场景请显式传入 MAIN_AI_CHAT_STORAGE_PREFIX */
  storageKeyPrefix?: string;
  /** 是否启用附件上传（默认 true） */
  enableAttachments?: boolean;
  /** 无附件时的提示文案（enableAttachments 为 false 时生效） */
  noAttachmentsMessage?: string;
  onNoAttachments?: (message: string) => void;
  /** 分组模型选项（对话 / 图像） */
  chatModelOptionGroups?: IAiChatServices['chatModelOptionGroups'];
  /** 工作区上下文配置 */
  workspace?: IAiChatServices['workspace'];
  /** 消息内本地路径点击 */
  localPath?: ILocalPathConfig;
  /** 消息内 http(s) 链接点击；默认注入系统浏览器打开 */
  onOpenExternalUrl?: IAiChatServices['onOpenExternalUrl'];
  /** 是否启用 Superpowers 两阶段（默认 true；提示词测试等固定模板场景设为 false） */
  enableSuperpower?: boolean;
  /** 额外覆盖项（如 getIsAuthenticated、chatSync） */
  overrides?: Partial<IAiChatServices>;
  /** 覆盖默认模型（如工作流节点执行模型） */
  defaultModel?: string;
}

/** 构建统一的 AI 对话 services：模型列表与知识库由外侧 settings 注入 */
export function buildSharedAiChatServices(
  options: IBuildSharedAiChatServicesOptions,
): IAiChatServices {
  const chatModels = getModelsByType(options.aiModels, 'chat').map((model) => ({
    id: model.id,
    label: model.name?.trim() || model.model,
  }));

  const defaultModelId = chatModels[0]?.id;

  const enableAttachments = options.enableAttachments !== false;
  const noAttachmentsMessage = options.noAttachmentsMessage ?? '当前对话暂不支持附件上传';
  const chatModelOptionGroups =
    options.chatModelOptionGroups && options.chatModelOptionGroups.length > 0
      ? options.chatModelOptionGroups
      : chatModels.length > 0
        ? [
            {
              label: '对话模型',
              options: chatModels.map((model) => ({ id: model.id, label: model.label })),
            },
          ]
        : undefined;
  const superpowerOverrides = buildSuperpowerDefaults({
    enableSuperpower: options.enableSuperpower,
    overrides: options.overrides,
  });
  const storageKeyPrefix = options.storageKeyPrefix ?? MAIN_AI_CHAT_STORAGE_PREFIX;
  const sourceStore = createWebChatSourceStore(storageKeyPrefix);

  return {
    callAIChatStream: options.callAIChatStream,
    uploadFiles: enableAttachments
      ? uploadChatAttachmentFiles
      : async () => {
          options.onNoAttachments?.(noAttachmentsMessage);
          return [];
        },
    validateLocalFiles: enableAttachments
      ? validateChatAttachmentFiles
      : () => ({
          ok: false,
          message: noAttachmentsMessage,
        }),
    listKbCollections: async () => {
      const { kbListCollections } = await import('@renderer/services/kb/api');
      return kbListCollections();
    },
    getKbChunk: async (locator) => {
      const { kbListChunks } = await import('@renderer/services/kb/api');
      const page = await kbListChunks(locator.docId, 1, 10_000);
      const chunk = page.items.find((item) => item.chunkId === locator.chunkId);
      if (!chunk) {
        throw new Error('引用内容已不存在');
      }
      return {
        docName: locator.title || 'doc-' + String(locator.docId),
        idx: chunk.idx,
        tokens: Math.ceil(chunk.content.length / 4),
        content: chunk.content,
      };
    },
    chatSync: null,
    getIsAuthenticated: () => false,
    defaultModel: options.defaultModel ?? (defaultModelId || undefined),
    storageKeyPrefix,
    chatStorage: createLocalChatStorage(),
    saveChatSources: sourceStore.save,
    loadChatSources: sourceStore.load,
    chatModels,
    chatModelOptionGroups,
    renderModelSelect: (props) => renderChatModelSelect(options.aiModels, props),
    workspace: options.workspace,
    localPath: options.localPath,
    onOpenExternalUrl: options.onOpenExternalUrl ?? openExternalUrl,
    isImageModel: (modelId: string) => {
      const model = options.aiModels.find((item) => item.id === modelId);
      return model ? isImageCapableModel(model) : false;
    },
    getImageModelInputHint: (modelId: string) => {
      const model = options.aiModels.find((item) => item.id === modelId);
      if (!model || !isImageCapableModel(model)) {
        return undefined;
      }
      const capabilities = resolveImageModelCapabilities(toAIConfig(model));
      if (capabilities.maxReferenceImages > 0) {
        return `描述你想生成的图片，可上传最多 ${capabilities.maxReferenceImages} 张参考图`;
      }
      return '描述你想生成的图片内容';
    },
    noteReferences: createNoteReferencesConfig(),
    ...superpowerOverrides,
  };
}

/** 根据模型 id 解析 IAIConfig，供各场景 stream 复用 */
export function createModelConfigResolver(aiModels: IAIModelConfig[]) {
  const chatModelList = getModelsByType(aiModels, 'chat');
  const imageModelList = getImageScenarioModels(aiModels);
  const allSelectableModels = [...chatModelList, ...imageModelList];
  const configMap = new Map(allSelectableModels.map((model) => [model.id, toAIConfig(model)]));
  const defaultId = chatModelList[0]?.id ?? imageModelList[0]?.id ?? '';

  return {
    defaultModelId: defaultId,
    getModelConfig: (modelKey?: string) => {
      if (modelKey && configMap.has(modelKey)) {
        return configMap.get(modelKey) ?? null;
      }
      return defaultId ? (configMap.get(defaultId) ?? null) : null;
    },
  };
}

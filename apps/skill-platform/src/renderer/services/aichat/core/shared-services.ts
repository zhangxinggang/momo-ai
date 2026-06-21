import type { IAiChatServices, ILocalPathConfig, TCallAiChatStream } from '@momo/aichat';
import { CLI_AGENT_OPTIONS, createDefaultAiChatServices } from '@momo/aichat';

import { createClaudeSlashCommandsConfig } from '@/claude-code/renderer/claude-slash-provider';
import { createNoteReferencesConfig } from '../note-reference-config';
import {
  getImageScenarioModels,
  getModelsByType,
  isImageCapableModel,
  toAIConfig,
} from '@renderer/services/ai/defaults';
import { resolveImageModelCapabilities } from '@renderer/services/ai/image/capabilities';
import type { IAIModelConfig } from '@renderer/types/settings';
import { uploadChatAttachmentFiles, validateChatAttachmentFiles } from '../chat-attachment-upload';
import { MAIN_AI_CHAT_STORAGE_PREFIX } from '../chat-history-bridge';
import { renderChatModelSelect } from '../chat-model-select';
import { createCliAgentCaller } from '../cli-agent-caller';
import { SUPERPOWER_PROMPTS } from '../superpower-prompts';
import { kbChunkCache } from './rag-context';
import { createLocalChatStorage } from './web-chat-storage';

const CLI_AGENT_GROUP_LABEL = 'CLI Agent';

/** 在模型分组最前方追加 CLI Agent（已存在则跳过） */
export function mergeChatModelOptionGroupsWithCli(
  groups: IAiChatServices['chatModelOptionGroups'],
  chatModels: Array<{ id: string; label: string }>,
): NonNullable<IAiChatServices['chatModelOptionGroups']> {
  const cliOptions = CLI_AGENT_OPTIONS.map((item) => ({ id: item.id, label: item.label }));

  const baseGroups: NonNullable<IAiChatServices['chatModelOptionGroups']> =
    groups && groups.length > 0
      ? [...groups]
      : chatModels.length > 0
        ? [
            {
              label: '对话模型',
              options: chatModels.map((model) => ({ id: model.id, label: model.label })),
            },
          ]
        : [];

  const hasCliGroup = baseGroups.some(
    (group) =>
      group.label === CLI_AGENT_GROUP_LABEL ||
      group.options.some((option) => option.id.startsWith('cli:')),
  );

  if (hasCliGroup) {
    return baseGroups;
  }

  return [{ label: CLI_AGENT_GROUP_LABEL, options: cliOptions }, ...baseGroups];
}

/** CLI Agent 与 Superpowers 默认注入（桌面端含 callCliAgent） */
export function buildCliSuperpowerDefaults(options: {
  enableSuperpower?: boolean;
  enableCliAgent?: boolean;
  overrides?: Partial<IAiChatServices>;
}): Partial<IAiChatServices> {
  const defaults: Partial<IAiChatServices> = {};
  if (options.enableSuperpower !== false) {
    defaults.superpowerPrompts = SUPERPOWER_PROMPTS;
  }
  if (options.enableCliAgent !== false) {
    defaults.callCliAgent = createCliAgentCaller();
    const slashCommands = createClaudeSlashCommandsConfig();
    if (slashCommands) {
      defaults.slashCommands = slashCommands;
    }
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
  /** 是否启用 Superpowers 两阶段（默认 true；提示词测试等固定模板场景设为 false） */
  enableSuperpower?: boolean;
  /** 是否注入 CLI Agent（默认 true） */
  enableCliAgent?: boolean;
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

  const defaultModelId = CLI_AGENT_OPTIONS[0]?.id ?? chatModels[0]?.id;

  const enableAttachments = options.enableAttachments !== false;
  const noAttachmentsMessage = options.noAttachmentsMessage ?? '当前对话暂不支持附件上传';
  const chatModelOptionGroups = mergeChatModelOptionGroupsWithCli(
    options.chatModelOptionGroups,
    chatModels,
  );
  const cliSuperpowerOverrides = buildCliSuperpowerDefaults({
    enableSuperpower: options.enableSuperpower,
    enableCliAgent: options.enableCliAgent,
    overrides: options.overrides,
  });

  return createDefaultAiChatServices({
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
    getKbChunk: async (chunkId) => {
      const cached = kbChunkCache.get(chunkId);
      if (cached) {
        return cached;
      }
      throw new Error('未找到引用内容');
    },
    chatSync: null,
    getIsAuthenticated: () => false,
    defaultModel: options.defaultModel ?? (defaultModelId || undefined),
    storageKeyPrefix: options.storageKeyPrefix ?? MAIN_AI_CHAT_STORAGE_PREFIX,
    chatStorage: createLocalChatStorage(),
    chatModels,
    chatModelOptionGroups,
    renderModelSelect: (props) => renderChatModelSelect(options.aiModels, props),
    workspace: options.workspace,
    localPath: options.localPath,
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
    ...cliSuperpowerOverrides,
  });
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

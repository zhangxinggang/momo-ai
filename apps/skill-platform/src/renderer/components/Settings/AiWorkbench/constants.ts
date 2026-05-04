import type { IModelFormState, IProviderOption, IScenarioDefinition } from './types';

export const PROVIDER_OPTIONS: IProviderOption[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    defaultUrl: 'https://api.openai.com',
    recommendedProtocol: 'openai',
    group: 'International / 国际',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    defaultUrl: 'https://api.anthropic.com',
    recommendedProtocol: 'anthropic',
    group: 'International / 国际',
  },
  {
    id: 'google',
    name: 'Google',
    defaultUrl: 'https://generativelanguage.googleapis.com',
    recommendedProtocol: 'gemini',
    group: 'International / 国际',
  },
  {
    id: 'xai',
    name: 'xAI',
    defaultUrl: 'https://api.x.ai',
    recommendedProtocol: 'openai',
    group: 'International / 国际',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultUrl: 'https://api.deepseek.com',
    recommendedProtocol: 'openai',
    group: 'Domestic / 国内',
  },
  {
    id: 'kimi',
    name: 'Kimi',
    defaultUrl: 'https://api.kimi.com/coding',
    recommendedProtocol: 'openai',
    group: 'Domestic / 国内',
  },
  {
    id: 'zhipu',
    name: '智谱 AI',
    defaultUrl: 'https://open.bigmodel.cn/api/paas',
    recommendedProtocol: 'openai',
    group: 'Domestic / 国内',
  },
  {
    id: 'qwen',
    name: '通义千问',
    defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode',
    recommendedProtocol: 'openai',
    group: 'Domestic / 国内',
  },
  {
    id: 'doubao',
    name: '豆包',
    defaultUrl: 'https://ark.cn-beijing.volces.com/api',
    recommendedProtocol: 'openai',
    group: 'Domestic / 国内',
  },
  {
    id: 'custom',
    name: '自定义',
    defaultUrl: '',
    recommendedProtocol: 'openai',
    group: 'Other / 其他',
  },
];

export const SCENARIO_DEFINITIONS: IScenarioDefinition[] = [
  {
    key: 'imageTest',
    label: '生图测试',
    desc: 'IPrompt 生图测试的默认模型。',
    type: 'image',
    badge: '生图测试',
  },
  {
    key: 'translation',
    label: '翻译 / 双语处理',
    desc: '用于 ISkill 的翻译链路。',
    type: 'chat',
    badge: '默认翻译',
  },
  {
    key: 'textSegment',
    label: '文本切分',
    desc: '用于知识库。',
    type: 'chat',
    badge: '默认文本切分',
  },
];

export const DEFAULT_CHAT_PARAMS: IModelFormState['chatParams'] = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  topK: '',
  frequencyPenalty: 0,
  presencePenalty: 0,
  stream: false,
  enableThinking: false,
  customParamsText: '',
};

export const DEFAULT_IMAGE_PARAMS: IModelFormState['imageParams'] = {
  size: '1024x1024',
  quality: 'standard',
  style: 'vivid',
  n: 1,
};

export const EMPTY_FORM: IModelFormState = {
  type: 'chat',
  name: '',
  provider: 'openai',
  apiProtocol: 'openai',
  apiKey: '',
  apiUrl: 'https://api.openai.com',
  model: '',
  chatParams: DEFAULT_CHAT_PARAMS,
  imageParams: DEFAULT_IMAGE_PARAMS,
};

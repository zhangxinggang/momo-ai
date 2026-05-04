import type { EAIProtocol } from '@/types/modules';
import type { LucideIcon } from 'lucide-react';

import type { EAIUsageScenario, IAIModelConfig } from '@renderer/types/settings';

export type IProviderOption = {
  id: string;
  name: string;
  defaultUrl: string;
  recommendedProtocol: EAIProtocol;
  group: string;
};

export type EModelType = 'chat' | 'image';

export type IModelFormState = {
  type: EModelType;
  name: string;
  provider: string;
  apiProtocol: EAIProtocol;
  apiKey: string;
  apiUrl: string;
  model: string;
  chatParams: {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: string;
    frequencyPenalty: number;
    presencePenalty: number;
    stream: boolean;
    enableThinking: boolean;
    customParamsText: string;
  };
  imageParams: {
    size: string;
    quality: 'standard' | 'hd';
    style: 'vivid' | 'natural';
    n: number;
  };
};

export type IEndpointStatus = {
  tone: 'ready' | 'warning' | 'error';
  label: string;
  detail: string;
};

export type IEndpointGroup = {
  key: string;
  provider: string;
  apiProtocol: EAIProtocol;
  apiUrl: string;
  models: IAIModelConfig[];
};

export type IEndpointDraft = {
  key: string;
  provider: string;
  apiProtocol: EAIProtocol;
  apiKey: string;
  apiUrl: string;
};

export type IScenarioDefinition = {
  key: EAIUsageScenario;
  label: string;
  desc: string;
  type: EModelType;
  badge: string;
};

export type IModelOption = {
  value: string;
  label: string;
};

export type IStatusCardData = {
  title: string;
  value: string;
  detail: string;
  tone: 'ready' | 'warning';
  icon: LucideIcon;
};

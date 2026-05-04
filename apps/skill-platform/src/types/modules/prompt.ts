/**
 * Core Prompt type definitions
 * Prompt 核心类型定义
 */

export type EResourceVisibility = 'private' | 'shared';

export interface IPrompt {
  id: string;
  ownerUserId?: string | null;
  visibility?: EResourceVisibility;
  title: string;
  description?: string | null;
  systemPrompt?: string | null;
  systemPromptEn?: string | null;
  userPrompt: string;
  userPromptEn?: string | null;
  variables: IPromptVariable[];
  tags: string[];
  folderId?: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  version: number;
  currentVersion: number;
  usageCount: number;
  source?: string | null;
  lastAiResponse?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IPromptVariable {
  name: string;
  type: EPromptVariableType;
  label?: string;
  defaultValue?: string;
  options?: string[];
  required: boolean;
}

export type EPromptVariableType = 'text' | 'textarea' | 'number' | 'select';

export interface IPromptVersion {
  id: string;
  promptId: string;
  version: number;
  systemPrompt?: string | null;
  systemPromptEn?: string | null;
  userPrompt: string;
  userPromptEn?: string | null;
  variables: IPromptVariable[];
  note?: string | null;
  aiResponse?: string | null;
  createdAt: string;
}

export interface DCreatePrompt {
  visibility?: EResourceVisibility;
  title: string;
  systemPrompt?: string;
  systemPromptEn?: string;
  userPrompt: string;
  userPromptEn?: string;
  variables?: IPromptVariable[];
  tags?: string[];
  folderId?: string;
  source?: string;
}

export interface DUpdatePrompt {
  visibility?: EResourceVisibility;
  title?: string;
  systemPrompt?: string;
  systemPromptEn?: string;
  userPrompt?: string;
  userPromptEn?: string;
  variables?: IPromptVariable[];
  tags?: string[];
  folderId?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  usageCount?: number;
  source?: string;
  lastAiResponse?: string;
}

export interface DPromptSearch {
  scope?: 'private' | 'shared' | 'all';
  keyword?: string;
  tags?: string[];
  folderId?: string;
  isFavorite?: boolean;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

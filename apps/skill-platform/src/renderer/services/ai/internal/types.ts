import type { EAIProtocol } from '@/types/modules';

import type { IChatToolCall } from '../../types';
import type { ITokenUsage } from './usage';

export interface IResponseLike {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  text: () => Promise<string>;
  json: <T = unknown>() => Promise<T>;
}

export interface IStreamState {
  fullContent: string;
  thinkingContent: string;
  buffer: string;
  chunkCount: number;
  usage?: ITokenUsage;
  toolCalls?: IChatToolCall[];
}

export type TResolvedProtocol = {
  protocol: EAIProtocol;
  explicit: boolean;
  baseUrl: string;
};

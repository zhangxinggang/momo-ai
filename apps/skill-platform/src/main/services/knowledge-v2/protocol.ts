import type { IKnowledgeErrorShape } from '@/types/modules/kb';

export interface IKnowledgeWorkerRequest {
  id: string;
  method: string;
  args: unknown[];
}

export type IKnowledgeWorkerResponse =
  | { id: string; ok: true; value: unknown }
  | { id: string; ok: false; error: IKnowledgeErrorShape };

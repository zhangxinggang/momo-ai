import type {
  DCreatePrompt,
  DPromptSearch,
  DUpdatePrompt,
  IPrompt,
  IPromptVersion,
} from '@/types/modules';
import type { EntityManager } from 'typeorm';

import { PromptService } from '../service/prompt';

/** IPrompt 对外接口 */
export class PromptController {
  private readonly service = new PromptService();

  create(data: DCreatePrompt): Promise<IPrompt> {
    return this.service.create(data);
  }

  getById(id: string): Promise<IPrompt | null> {
    return this.service.getById(id);
  }

  getAll(): Promise<IPrompt[]> {
    return this.service.getAll();
  }

  update(id: string, data: DUpdatePrompt): Promise<IPrompt | null> {
    return this.service.update(id, data);
  }

  delete(id: string): Promise<boolean> {
    return this.service.delete(id);
  }

  search(query: DPromptSearch): Promise<IPrompt[]> {
    return this.service.search(query);
  }

  incrementUsage(id: string): Promise<void> {
    return this.service.incrementUsage(id);
  }

  createVersion(promptId: string, note?: string): Promise<IPromptVersion | null> {
    return this.service.createVersion(promptId, note);
  }

  getVersions(promptId: string): Promise<IPromptVersion[]> {
    return this.service.getVersions(promptId);
  }

  deleteVersion(versionId: string): Promise<boolean> {
    return this.service.deleteVersion(versionId);
  }

  insertVersionDirect(version: IPromptVersion, manager?: EntityManager): Promise<void> {
    return this.service.insertVersionDirect(version, manager);
  }

  insertPromptDirect(prompt: IPrompt, manager?: EntityManager): Promise<void> {
    return this.service.insertPromptDirect(prompt, manager);
  }

  rollback(promptId: string, version: number): Promise<IPrompt | null> {
    return this.service.rollback(promptId, version);
  }
}

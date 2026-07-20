import type { IWorkflowTemplatePackagePayload } from '@/types/modules';
import { v4 as uuidv4 } from 'uuid';

interface IImportSession {
  payload: IWorkflowTemplatePackagePayload;
}

const sessions = new Map<string, IImportSession>();

export function createImportSession(payload: IWorkflowTemplatePackagePayload): string {
  const sessionId = uuidv4();
  sessions.set(sessionId, { payload });
  return sessionId;
}

export function getImportSession(sessionId: string): IImportSession | null {
  return sessions.get(sessionId) ?? null;
}

export function deleteImportSession(sessionId: string): void {
  sessions.delete(sessionId);
}

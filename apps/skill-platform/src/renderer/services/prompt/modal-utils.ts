import type { DCreatePrompt, DUpdatePrompt, IPrompt } from '@/types/modules';

export interface IPromptFormData {
  title: string;
  systemPrompt: string;
  userPrompt: string;
  folderId?: string;
}

export function createPromptFormData(
  source?: Partial<IPrompt> | Partial<DCreatePrompt> | null,
  defaults?: Partial<IPromptFormData>,
): IPromptFormData {
  return {
    title: source?.title || defaults?.title || '',
    systemPrompt: source?.systemPrompt || defaults?.systemPrompt || '',
    userPrompt: source?.userPrompt || defaults?.userPrompt || '',
    folderId: source?.folderId ?? defaults?.folderId,
  };
}

export function buildPromptPayload(form: IPromptFormData): DCreatePrompt | DUpdatePrompt {
  return {
    title: form.title.trim(),
    systemPrompt: form.systemPrompt.trim() || undefined,
    userPrompt: form.userPrompt.trim(),
    tags: [],
    folderId: form.folderId || undefined,
  };
}

export function hasPromptFormChanges(
  form: IPromptFormData,
  baseline?: Partial<IPrompt> | Partial<DCreatePrompt> | null,
): boolean {
  const initial = createPromptFormData(baseline);

  return (
    form.title !== initial.title ||
    form.systemPrompt !== initial.systemPrompt ||
    form.userPrompt !== initial.userPrompt ||
    (form.folderId || undefined) !== (initial.folderId || undefined)
  );
}

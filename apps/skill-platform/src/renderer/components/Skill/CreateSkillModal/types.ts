export type ECreateMode = 'select' | 'github' | 'manual' | 'scan' | 'ai';

export function sanitizeSkillName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

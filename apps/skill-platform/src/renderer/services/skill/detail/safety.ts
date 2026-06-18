import type { ISkillSafetyFinding } from '@/types/modules';

export interface IGroupedSkillSafetyFinding {
  code: string;
  severity: ISkillSafetyFinding['severity'];
  title: string;
  detail: string;
  count: number;
  filePaths: string[];
  evidences: string[];
  findings: ISkillSafetyFinding[];
}

export function groupSkillSafetyFindings(
  findings: ISkillSafetyFinding[],
): IGroupedSkillSafetyFinding[] {
  const grouped = new Map<string, IGroupedSkillSafetyFinding>();

  for (const finding of findings) {
    const key = `${finding.code}::${finding.severity}`;
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, {
        code: finding.code,
        severity: finding.severity,
        title: finding.title,
        detail: finding.detail,
        count: 1,
        filePaths: finding.filePath ? [finding.filePath] : [],
        evidences: finding.evidence ? [finding.evidence] : [],
        findings: [finding],
      });
      continue;
    }

    existing.count += 1;
    existing.findings.push(finding);
    if (finding.filePath && !existing.filePaths.includes(finding.filePath)) {
      existing.filePaths.push(finding.filePath);
    }
    if (finding.evidence && !existing.evidences.includes(finding.evidence)) {
      existing.evidences.push(finding.evidence);
    }
  }

  const severityOrder: Record<ISkillSafetyFinding['severity'], number> = {
    high: 0,
    warn: 1,
    info: 2,
  };

  return Array.from(grouped.values()).sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) {
      return severityDiff;
    }
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.title.localeCompare(b.title);
  });
}

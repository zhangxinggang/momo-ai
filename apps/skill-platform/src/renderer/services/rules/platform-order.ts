import { RULE_PLATFORM_ORDER } from '@/types/constants/rules';
import type { IRuleFileDescriptor } from '@/types/modules/rules';
import { isRulePlatformId } from '@/types/modules/rules';

/** 按平台顺序排列全局规则文件 */
export function getOrderedGlobalRuleFiles(
  files: IRuleFileDescriptor[],
  preferredOrder: string[] = [],
): IRuleFileDescriptor[] {
  const globalFiles = files.filter((file) => !file.id.startsWith('project:'));
  const fileByPlatformId = new Map(globalFiles.map((file) => [file.platformId, file] as const));
  const seenPlatformIds = new Set<string>();
  const ordered: IRuleFileDescriptor[] = [];

  const pushPlatform = (platformId: string) => {
    if (!platformId || seenPlatformIds.has(platformId) || !isRulePlatformId(platformId)) {
      return;
    }
    seenPlatformIds.add(platformId);
    const file = fileByPlatformId.get(platformId);
    if (file) {
      ordered.push(file);
    }
  };

  for (const platformId of preferredOrder) {
    pushPlatform(platformId);
  }

  for (const platformId of RULE_PLATFORM_ORDER) {
    pushPlatform(platformId);
  }

  for (const file of globalFiles) {
    pushPlatform(file.platformId);
  }

  return ordered;
}

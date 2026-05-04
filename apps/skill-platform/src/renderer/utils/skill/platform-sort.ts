import { DEFAULT_SKILL_PLATFORM_ORDER, type ISkillPlatform } from '@/types/constants/platforms';

/**
 * 按用户偏好顺序对技能平台列表排序
 */
export function sortSkillPlatformsByPreference(
  platforms: ISkillPlatform[],
  preferredOrder: string[],
): ISkillPlatform[] {
  const effectiveOrder = Array.from(new Set([...preferredOrder, ...DEFAULT_SKILL_PLATFORM_ORDER]));

  if (effectiveOrder.length === 0) {
    return platforms;
  }

  const preferredIndex = new Map(effectiveOrder.map((platformId, index) => [platformId, index]));

  return [...platforms].sort((left, right) => {
    const leftIndex = preferredIndex.get(left.id);
    const rightIndex = preferredIndex.get(right.id);

    if (leftIndex != null && rightIndex != null) {
      return leftIndex - rightIndex;
    }
    if (leftIndex != null) {
      return -1;
    }
    if (rightIndex != null) {
      return 1;
    }
    return 0;
  });
}

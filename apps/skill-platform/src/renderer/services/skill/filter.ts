import type { IScannedSkill, ISkill } from '@/types/modules';
import type { ESkillFilterType, ESkillStoreView } from '@renderer/types/skill';

interface IFilterVisibleSkillsOptions {
  deployedSkillNames: Set<string>;
  filterTags?: string[];
  filterType: ESkillFilterType;
  searchQuery?: string;
  skills: ISkill[];
  storeView: ESkillStoreView;
}

export function filterVisibleSkills({
  deployedSkillNames,
  filterTags = [],
  filterType,
  searchQuery = '',
  skills,
  storeView,
}: IFilterVisibleSkillsOptions): ISkill[] {
  let result = skills;

  if (storeView === 'distribution') {
    result = result.filter((skill) => deployedSkillNames.has(skill.name));
  } else if (filterType === 'installed') {
    result = result.filter((skill) => Boolean(skill.registry_slug));
  } else if (filterType === 'deployed') {
    result = result.filter((skill) => deployedSkillNames.has(skill.name));
  } else if (filterType === 'pending') {
    result = result.filter((skill) => !deployedSkillNames.has(skill.name));
  }

  if (filterTags.length > 0) {
    result = result.filter(
      (skill) => skill.tags && filterTags.some((tag) => skill.tags?.includes(tag)),
    );
  }

  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return result;
  }

  return result.filter((skill) => {
    const fields = [
      skill.name,
      skill.description || '',
      skill.author || '',
      skill.instructions || '',
      skill.content || '',
      skill.source_url || '',
      skill.local_repo_path || '',
      ...(skill.tags || []),
    ];

    return fields.some((value) => value.toLowerCase().includes(query));
  });
}

export function filterVisibleScannedSkills(
  scannedSkills: IScannedSkill[],
  searchQuery = '',
): IScannedSkill[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return scannedSkills;
  }

  return scannedSkills.filter((skill) => {
    const fields = [
      skill.name,
      skill.description,
      skill.author,
      skill.instructions,
      skill.filePath,
      skill.localPath,
      ...skill.tags,
      ...skill.platforms,
    ];

    return fields.some((value) => value.toLowerCase().includes(query));
  });
}

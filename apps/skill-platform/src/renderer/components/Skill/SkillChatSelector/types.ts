import type { ISkill } from '@/types/modules';

export interface IProps {
  skills: ISkill[];
  selectedSkillId: string | null;
  onSelect: (skillId: string | null) => void;
}

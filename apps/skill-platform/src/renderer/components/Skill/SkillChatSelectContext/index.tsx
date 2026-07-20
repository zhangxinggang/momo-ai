import type { ISkill } from '@/types/modules';
import { createContext, useContext } from 'react';

export interface ISkillChatSelectContextValue {
  skills: ISkill[];
  selectedSkillId: string | null;
  onSelect: (skillId: string | null) => void;
}

const SkillChatSelectContext = createContext<ISkillChatSelectContextValue | null>(null);

export function useSkillChatSelect(): ISkillChatSelectContextValue | null {
  return useContext(SkillChatSelectContext);
}

export { SkillChatSelectContext };

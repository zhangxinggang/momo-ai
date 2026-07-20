import { useSkillChatSelect } from '../SkillChatSelectContext';
import { SkillChatSelector } from '../SkillChatSelector';

/** 输入栏工具区：从 Context 读取并渲染技能选择器 */
export function SkillChatToolbarExtra() {
  const ctx = useSkillChatSelect();
  if (!ctx) {
    return null;
  }
  return (
    <SkillChatSelector
      skills={ctx.skills}
      selectedSkillId={ctx.selectedSkillId}
      onSelect={ctx.onSelect}
    />
  );
}

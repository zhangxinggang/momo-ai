/** 与 SkillFileEditor 同步：标记技能文件编辑器是否存在未保存更改 */
export const SKILL_EDITOR_DIRTY_WINDOW_KEY = '__PROMPTHUB_SKILL_EDITOR_DIRTY' as const;

type WindowWithSkillEditorDirty = Window &
  Partial<Record<typeof SKILL_EDITOR_DIRTY_WINDOW_KEY, boolean>>;

export function isSkillEditorDirty(): boolean {
  return Boolean((window as WindowWithSkillEditorDirty)[SKILL_EDITOR_DIRTY_WINDOW_KEY]);
}

/** antd modal.confirm 共用字段（标题、正文、按钮） */
export const skillEditorDirtyLeaveConfirmFields = {
  title: '未保存的更改',
  content: '当前技能有未保存的修改，确定放弃修改并继续？',
  okText: '放弃并继续',
  cancelText: '取消',
  okButtonProps: { danger: true } as const,
};

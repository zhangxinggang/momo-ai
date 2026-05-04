/** IPrompt 列表排序字段 */
export type EPromptSortBy = 'updatedAt' | 'createdAt' | 'title' | 'usageCount';

export type ESortOrder = 'desc' | 'asc';

export type EPromptEditorMode = 'idle' | 'create' | 'edit';

/** 列表区视图模式（卡片 / 列表 / 画廊 / 看板） */
export type EPromptViewMode = 'card' | 'list' | 'gallery' | 'kanban';

export type EGalleryImageSize = 'small' | 'medium' | 'large';

export type EKanbanColumns = 2 | 3 | 4;

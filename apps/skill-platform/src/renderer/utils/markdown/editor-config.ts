import {
  buildMdEditorDefToolbars,
  DEFAULT_MD_PREVIEW_THEME,
  MD_PREVIEW_THEMES,
  MdPreviewThemeSelect,
  type TMdPreviewThemeId,
  useMarkdownEditorTheme,
  useMdEditorDefToolbars,
  useMdPreviewTheme,
} from '@momo/markdown';

export {
  buildMdEditorDefToolbars,
  DEFAULT_MD_PREVIEW_THEME,
  MD_PREVIEW_THEMES,
  MdPreviewThemeSelect,
  useMarkdownEditorTheme,
  useMdEditorDefToolbars,
  useMdPreviewTheme,
};

export type { TMdPreviewThemeId } from '@momo/markdown';

export { uploadMarkdownImage } from './image-upload';
export type { DMarkdownImageUploadResponse } from './image-upload';
export { useMdEditorImageUpload } from './use-md-editor-image-upload';

export { MARKDOWN_TOOLBARS as SKILL_MD_TOOLBARS } from '@momo/file-editor';

export interface IUseSkillMdEditorToolbarsOptions {
  content: string;
  exportTitle?: string;
  previewTheme?: TMdPreviewThemeId;
  onPreviewThemeChange?: (theme: TMdPreviewThemeId) => void;
}

/** 技能平台 Markdown 编辑器 defToolbars（含 mark / emoji / 导出） */
export function useSkillMdEditorToolbars(options: IUseSkillMdEditorToolbarsOptions) {
  const [innerPreviewTheme, setInnerPreviewTheme] = useMdPreviewTheme(
    options.previewTheme ?? DEFAULT_MD_PREVIEW_THEME,
  );
  const previewTheme = options.previewTheme ?? innerPreviewTheme;
  const onPreviewThemeChange = options.onPreviewThemeChange ?? setInnerPreviewTheme;
  const exportTitle = options.exportTitle ?? 'document';

  return useMdEditorDefToolbars({
    previewTheme,
    onPreviewThemeChange,
    content: options.content,
    exportTitle,
  });
}

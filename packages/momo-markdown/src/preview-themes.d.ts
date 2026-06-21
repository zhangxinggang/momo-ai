/** Markdown 预览主题（@vavt/markdown-theme + @vavt/cm-extension） */
export declare const MD_PREVIEW_THEMES: readonly ["cyanosis", "default", "github", "mk-cute", "smart-blue", "vuepress", "arknights"];
export type TMdPreviewThemeId = (typeof MD_PREVIEW_THEMES)[number];
export declare const DEFAULT_MD_PREVIEW_THEME: TMdPreviewThemeId;
/** 判断是否为合法的预览主题 id */
export declare function isMdPreviewThemeId(value: string): value is TMdPreviewThemeId;
/** 根据主题 id 获取展示名称 */
export declare function getMdPreviewThemeLabel(themeId: string): string;
/** 供下拉选项使用的主题列表 */
export declare function buildMdPreviewThemeOptions(): Array<{
    label: string;
    value: TMdPreviewThemeId;
}>;
/** 跟随 document 根节点 class 同步 Markdown 编辑器亮暗主题 */
export declare function useMarkdownEditorTheme(): 'light' | 'dark';
/** 预览主题 state，默认 default */
export declare function useMdPreviewTheme(initialTheme?: TMdPreviewThemeId): readonly ["github" | "cyanosis" | "default" | "mk-cute" | "smart-blue" | "vuepress" | "arknights", import("react").Dispatch<import("react").SetStateAction<"github" | "cyanosis" | "default" | "mk-cute" | "smart-blue" | "vuepress" | "arknights">>];

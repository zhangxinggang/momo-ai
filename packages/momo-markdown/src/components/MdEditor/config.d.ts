import {
  ICodeCss,
  IGlobalConfig,
  IStaticTextDefault,
  TConfig,
  TFooters,
  TMdHeadingId,
  TToolbarNames,
} from './type';
export declare const prefix = 'md-editor';
export declare const prefixHump = 'MdEditor';
export declare const defaultEditorId = 'md-editor-rt';
export declare const cdnBase = 'https://unpkg.com';
export declare const highlightUrl =
  'https://unpkg.com/@highlightjs/cdn-assets@11.11.1/highlight.min.js';
export declare const prettierUrl: {
  main: string;
  markdown: string;
};
export declare const cropperUrl: {
  css: string;
  js: string;
};
export declare const screenfullUrl = 'https://unpkg.com/screenfull@5.2.0/dist/screenfull.js';
export declare const mermaidUrl = 'https://unpkg.com/mermaid@11.15.0/dist/mermaid.min.js';
export declare const katexUrl: {
  js: string;
  css: string;
};
export declare const codeCss: ICodeCss;
export declare const echartsUrl = 'https://unpkg.com/echarts@6.0.0/dist/echarts.min.js';
export declare const editorExtensionsAttrs: IGlobalConfig['editorExtensionsAttrs'];
export declare const allToolbar: Array<TToolbarNames>;
export declare const allFooter: Array<TFooters>;
export declare const staticTextDefault: IStaticTextDefault;
export declare const defaultProps: {
  value: string;
  theme: string;
  className: string;
  onChange: () => void;
  onSave: () => void;
  onPreviewThemeChange: () => void;
  preview: boolean;
  htmlPreview: boolean;
  language: string;
  toolbars: TToolbarNames[];
  toolbarsExclude: never[];
  noPrettier: boolean;
  onHtmlChanged: () => void;
  onGetCatalog: () => void;
  tabWidth: number;
  showCodeRowNumber: boolean;
  previewTheme: string;
  mdHeadingId: TMdHeadingId;
  style: {};
  tableShape: number[];
  noMermaid: boolean;
  noPlantuml: boolean;
  sanitize: (text: string) => string;
  placeholder: string;
  noKatex: boolean;
  defToolbars: never[];
  onError: () => void;
  codeTheme: string;
  footers: TFooters[];
  scrollAuto: boolean;
  defFooters: never[];
  formatCopiedText: (t: string) => string;
  noUploadImg: boolean;
  codeStyleReverse: boolean;
  codeStyleReverseList: string[];
  autoFocus: boolean;
  disabled: boolean;
  readOnly: boolean;
  autoDetectCode: boolean;
  noHighlight: boolean;
  noImgZoomIn: boolean;
  inputBoxWidth: string;
  sanitizeMermaid: (h: string) => Promise<string>;
  transformImgUrl: (t: string) => string;
  codeFoldable: boolean;
  autoFoldThreshold: number;
  catalogLayout: string;
  floatingToolbars: never[];
  customIcon: {};
};
export declare const globalConfig: IGlobalConfig;
export declare const config: TConfig;
/**
 * 拖拽时最小的宽度
 */
export declare const MinInputBoxWidth = 0.1;

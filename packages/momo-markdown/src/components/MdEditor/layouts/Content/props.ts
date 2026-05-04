import { CompletionSource } from '@codemirror/autocomplete';
import { IHeadList, ISettingType, TMdHeadingId, TPreviewRendererComponent } from '~/type';

export interface IContentPreviewProps {
  modelValue: string;
  onChange: (v: string) => void;
  setting?: ISettingType;
  onHtmlChanged?: (h: string) => void;
  onGetCatalog?: (list: IHeadList[]) => void;
  mdHeadingId: TMdHeadingId;
  noMermaid?: boolean;
  sanitize: (html: string) => string;
  noKatex?: boolean;
  formatCopiedText?: (text: string) => string;
  noHighlight?: boolean;
  previewOnly?: boolean;
  noImgZoomIn?: boolean;
  sanitizeMermaid: (html: string) => Promise<string>;
  codeFoldable: boolean;
  autoFoldThreshold: number;
  onRemount?: () => void;
  noEcharts?: boolean;
  previewComponent?: TPreviewRendererComponent;
}

export type IContentProps = Readonly<
  {
    placeholder: string;
    scrollAuto: boolean;
    autoFocus?: boolean;
    readOnly?: boolean;
    maxLength?: number;
    autoDetectCode?: boolean;
    /**
     * 输入框失去焦点时触发事件
     */
    onBlur?: (event: FocusEvent) => void;
    /**
     * 输入框获得焦点时触发事件
     */
    onFocus?: (event: FocusEvent) => void;
    completions?: Array<CompletionSource>;
    onInput?: (e: Event) => void;
    /**
     * 拖放事件
     *
     * @param event
     * @returns
     */
    onDrop?: (event: DragEvent) => void;
    inputBoxWidth: string;
    onInputBoxWidthChange?: (width: string) => void;
    transformImgUrl: (text: string) => string | Promise<string>;
    catalogLayout?: 'fixed' | 'flat';
    catalogMaxDepth?: number;
  } & IContentPreviewProps
>;

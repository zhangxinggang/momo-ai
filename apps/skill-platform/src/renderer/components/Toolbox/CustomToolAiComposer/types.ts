export enum EGenerateStatus {
  EIdle = 'idle',
  EGenerating = 'generating',
  EDone = 'done',
  EStopped = 'stopped',
  EError = 'error',
}

export interface IProps {
  toolKey: string;
  hasHtml: boolean;
  /** 发送前拉取最新 HTML（含 snapEdit 内未落盘的编辑） */
  getCurrentHtml: () => Promise<string>;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

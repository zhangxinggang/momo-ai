export enum ERewriteStatus {
  EIdle = 'idle',
  ERewriting = 'rewriting',
  EDone = 'done',
  EStopped = 'stopped',
  EError = 'error',
}

export interface IProps {
  noteKey: string;
  onRewritingChange: (isRewriting: boolean) => void;
}

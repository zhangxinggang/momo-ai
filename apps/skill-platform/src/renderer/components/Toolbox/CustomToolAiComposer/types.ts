export interface IProps {
  toolKey: string;
  hasContent: boolean;
  onRegisterFileAttachmentHandler?: (
    handler: ((files: File[]) => Promise<boolean>) | undefined,
  ) => void;
}

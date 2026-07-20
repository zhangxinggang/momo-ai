export interface IProps {
  open: boolean;
  mode: 'create' | 'edit';
  projectId?: string;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

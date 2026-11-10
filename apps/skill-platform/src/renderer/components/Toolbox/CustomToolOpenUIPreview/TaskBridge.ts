import { createContext } from 'react';

export interface ITaskActions {
  submit: (input: { message: string; formState?: Record<string, unknown> }) => Promise<boolean>;
  attachFiles: (files: File[]) => Promise<boolean>;
}
export const TaskBridge = createContext<{
  key: string;
  disabled: boolean;
  register: (id: string, actions?: ITaskActions) => void;
}>({ key: '', disabled: false, register: () => {} });

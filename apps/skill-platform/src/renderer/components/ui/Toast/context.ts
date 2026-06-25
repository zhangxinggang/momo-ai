import { createContext, useContext } from 'react';

export type TToastType = 'success' | 'error' | 'info' | 'warning';

export interface IToastContextValue {
  showToast: (message: string, type?: TToastType, sendSystemNotification?: boolean) => void;
}

export interface IToastItem {
  id: string;
  message: string;
  type: TToastType;
}

export const ToastContext = createContext<IToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

import { useSettingsStore } from '@renderer/store';
import { Button } from 'antd';
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon, XIcon } from 'lucide-react';
import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
// Toast type
// Toast 类型
type TToastType = 'success' | 'error' | 'info' | 'warning';

interface IToastItem {
  id: string;
  message: string;
  type: TToastType;
}

interface IToastContextValue {
  showToast: (message: string, type?: TToastType, sendSystemNotification?: boolean) => void;
}

const ToastContext = createContext<IToastContextValue | null>(null);

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<IToastItem[]>([]);
  const enableNotifications = useSettingsStore((state) => state.enableNotifications);

  const showToast = useCallback(
    (message: string, type: TToastType = 'success', sendSystemNotification = false) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);

      // Send system notification (if enabled and requested)
      // 发送系统通知（如果启用且请求）
      if (sendSystemNotification && enableNotifications && window.electron?.showNotification) {
        const title =
          type === 'success'
            ? 'Success'
            : type === 'error'
              ? 'Error'
              : type === 'warning'
                ? 'Warning'
                : 'Info';
        window.electron.showNotification(`PromptHub - ${title}`, message);
      }

      // Auto disappear after 3 seconds
      // 3秒后自动消失
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    [enableNotifications],
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: TToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className='h-5 w-5 text-green-500' />;
      case 'error':
        return <XCircleIcon className='h-5 w-5 text-red-500' />;
      case 'warning':
        return <AlertTriangleIcon className='h-5 w-5 text-yellow-500' />;
      case 'info':
      default:
        return <InfoIcon className='h-5 w-5 text-blue-500' />;
    }
  };

  const getBgColor = (type: TToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container - z-index needs to be the highest to stay above everything */}
      {/* Toast 容器 - z-index 需要最高，确保在所有元素之上 */}
      {createPortal(
        <div className='pointer-events-none fixed bottom-6 right-6 z-[99999] flex flex-col gap-3'>
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`animate-in slide-in-from-right-10 fade-in pointer-events-auto flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-md duration-300 ${getBgColor(toast.type)} `}>
              {getIcon(toast.type)}
              <span className='text-foreground text-sm font-semibold'>{toast.message}</span>
              <Button
                type='text'
                size='small'
                onClick={() => removeToast(toast.id)}
                className='ml-2 rounded-lg p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
                title={'关闭'}
                icon={<XIcon className='text-muted-foreground h-4 w-4' />}
              />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

// Hook
// Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

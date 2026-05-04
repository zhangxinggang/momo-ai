import App from '@renderer/App';
import { ToastProvider } from '@renderer/components/ui/Toast';
import { AntdRoot } from '@renderer/providers/AntdRoot';
import { exportDatabase, restoreFromBackup } from '@renderer/services/database/backup';
import '@renderer/styles/globals.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

if (window.electron?.e2e) {
  window.__PROMPTHUB_E2E_BACKUP__ = {
    exportDatabase,
    restoreFromBackup,
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AntdRoot>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AntdRoot>
  </React.StrictMode>,
);

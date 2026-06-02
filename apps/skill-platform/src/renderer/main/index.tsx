import App from '@renderer/App';
import { ToastProvider } from '@renderer/components/ui/Toast';
import { AntdRoot } from '@renderer/providers/AntdRoot';
import '@renderer/styles/globals.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AntdRoot>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AntdRoot>
  </React.StrictMode>,
);

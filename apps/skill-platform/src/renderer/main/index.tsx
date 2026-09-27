import App from '@renderer/App';
import { ToastProvider } from '@renderer/components/ui/Toast';
import '@renderer/components/ui/Toast/context';
import { AntdRoot } from '@renderer/providers/AntdRoot';
import '@renderer/styles/globals.css';
import { configureMarkdownDrawio } from '@renderer/utils/markdown/drawio-config';
import React from 'react';
import ReactDOM from 'react-dom/client';

void configureMarkdownDrawio()
  .catch(console.error)
  .finally(() =>
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <AntdRoot>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AntdRoot>
      </React.StrictMode>,
    ),
  );

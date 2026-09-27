import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { globalConfig, prefix } from '~/config';
import {
  createDrawioLoadAction,
  DEFAULT_DRAWIO_EDITOR_URL,
  type IDrawioSource,
} from '~/utils/drawio';

export interface IDrawioEditorProps {
  xml?: string | null;
  source?: IDrawioSource;
  title?: string;
  onClose: () => void;
  onSave: (xml: string, pngDataUri: string) => Promise<void>;
}

interface IDrawioMessage {
  event?: string;
  error?: string;
  xml?: string;
  data?: string;
}

function parseMessage(value: unknown): IDrawioMessage | null {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return parsed && typeof parsed === 'object' ? (parsed as IDrawioMessage) : null;
  } catch {
    return null;
  }
}

const DrawioEditor = ({ xml, source, title = '图形编辑', onClose, onSave }: IDrawioEditorProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pendingXmlRef = useRef<string>('');
  const savingRef = useRef(false);
  const persistingRef = useRef(false);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'saving' | 'error'>('loading');
  const [converting, setConverting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  const editorUrl = globalConfig.editorExtensions.drawio?.editorUrl || DEFAULT_DRAWIO_EDITOR_URL;
  const editorOrigin = useMemo(() => {
    try {
      return new URL(editorUrl).origin;
    } catch {
      return '*';
    }
  }, [editorUrl]);

  const post = useCallback(
    (message: unknown) => {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify(message), editorOrigin);
    },
    [editorOrigin],
  );

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!frameWindow || event.source !== frameWindow) return;
      if (editorOrigin !== '*' && event.origin !== editorOrigin) return;

      const message = parseMessage(event.data);
      if (!message?.event) return;

      if (message.event === 'init') {
        try {
          setConverting(true);
          post(createDrawioLoadAction({ xml, source, title }));
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause));
          setPhase('error');
        }
        return;
      }

      if (message.event === 'load') {
        if (message.error) {
          setError(message.error);
          setPhase('error');
        } else {
          setPhase('ready');
        }
        return;
      }

      if (message.error) {
        savingRef.current = false;
        setError(message.error);
        setPhase('error');
        return;
      }

      if (message.event === 'save' && message.xml && !savingRef.current) {
        savingRef.current = true;
        pendingXmlRef.current = message.xml;
        setPhase('saving');
        post({
          action: 'export',
          format: 'png',
          scale: 2,
          border: 16,
          transparent: false,
          spinKey: 'saving',
        });
        return;
      }

      if (message.event === 'export' && savingRef.current) {
        if (persistingRef.current) return;
        if (!message.data) {
          savingRef.current = false;
          setError('图形导出未返回图片，请重试保存');
          setPhase('error');
          return;
        }
        persistingRef.current = true;
        void onSave(pendingXmlRef.current, message.data)
          .then(onClose)
          .catch((cause) => {
            savingRef.current = false;
            persistingRef.current = false;
            setError(cause instanceof Error ? cause.message : String(cause));
            setPhase('error');
          });
        return;
      }

      if (message.event === 'exit' && !savingRef.current) {
        onClose();
      }
    };

    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [editorOrigin, onClose, onSave, post, source, title, xml]);

  useEffect(() => {
    if (phase !== 'loading' && phase !== 'saving') return;
    const timer = window.setTimeout(
      () => {
        savingRef.current = false;
        setError(
          phase === 'saving'
            ? '图形保存超时，请重试保存'
            : converting
              ? '图形转换超时，请检查图形源码后重新加载'
              : '图形编辑器加载超时，请检查本地资源或网络后重新加载',
        );
        setPhase('error');
      },
      converting && phase === 'loading' ? 60_000 : 30_000,
    );
    return () => window.clearTimeout(timer);
  }, [phase, converting, attempt]);

  const retry = () => {
    setError('');
    if (pendingXmlRef.current) {
      savingRef.current = true;
      setPhase('saving');
      if (!persistingRef.current)
        post({ action: 'export', format: 'png', scale: 2, border: 16, transparent: false });
    } else {
      setConverting(false);
      setPhase('loading');
      setAttempt((value) => value + 1);
    }
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div className={`${prefix}-drawio-editor`} role='dialog' aria-modal='true' aria-label={title}>
      <div className={`${prefix}-drawio-editor-bar`}>
        <div className={`${prefix}-drawio-editor-heading`}>
          <span>{title}</span>
          <span
            className={`${prefix}-drawio-editor-status`}
            aria-live='polite'
            title={error || undefined}>
            {phase === 'loading' && (converting ? '正在转换图形…' : '正在加载图形编辑器…')}
            {phase === 'ready' && '在 draw.io 中编辑，完成后点击“保存并退出”'}
            {phase === 'saving' && '正在保存图片与图形数据…'}
            {phase === 'error' && '图形编辑暂不可用'}
          </span>
        </div>
        <button type='button' title='关闭图形编辑' aria-label='关闭图形编辑' onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className={`${prefix}-drawio-editor-content`}>
        <iframe
          key={attempt}
          ref={iframeRef}
          src={editorUrl}
          title={title}
          onError={() => {
            setError('图形编辑器加载失败，请检查资源地址后重新加载');
            setPhase('error');
          }}
          sandbox='allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads'
        />
        {phase === 'error' && (
          <div className={`${prefix}-drawio-editor-recovery`} role='alert'>
            <div className={`${prefix}-drawio-editor-recovery-card`}>
              <p>{error}</p>
              <button type='button' onClick={retry}>
                {pendingXmlRef.current ? '重试保存' : '重新加载'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default DrawioEditor;

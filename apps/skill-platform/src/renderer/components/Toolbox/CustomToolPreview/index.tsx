import type { ICustomToolRuntimeInfo, ISkill } from '@/types/modules';
import { getCustomToolRuntimeStatus } from '@renderer/services/custom-tool/api';
import { callMcpTool } from '@renderer/services/mcp/api';
import { executeSkillWorkspace, listSkills } from '@renderer/services/skill/api';
import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './index.module.less';

interface IProps {
  runtimeInfo: ICustomToolRuntimeInfo | null;
  runtimeError?: string;
  fallbackHtml: string;
  title: string;
  revision: number;
  loading?: boolean;
}

interface IInvokeMessage {
  type: 'momo-tool:invoke';
  requestId: string;
  toolPath: string;
  action: string;
  payload?: Record<string, unknown>;
}

function hasPermission(allowlist: string[] | undefined, value: string): boolean {
  return Boolean(value && allowlist?.includes(value));
}

function sanitizeSkillOptions(
  value: unknown,
): { outputDir?: string; sessionId?: string } | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const input = value as Record<string, unknown>;
  return {
    outputDir: typeof input.outputDir === 'string' ? input.outputDir : undefined,
    sessionId: typeof input.sessionId === 'string' ? input.sessionId : undefined,
  };
}

/** 自定义工具运行视图：加载隔离静态服务，并代理 manifest 中显式允许的 MCP/Skill 调用。 */
export function CustomToolPreview(props: IProps) {
  const { runtimeInfo, runtimeError, fallbackHtml, title, revision, loading } = props;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [liveError, setLiveError] = useState('');
  const src = useMemo(() => {
    if (!runtimeInfo?.previewUrl) {
      return undefined;
    }
    const url = new URL(runtimeInfo.previewUrl);
    url.searchParams.set('revision', String(revision));
    return url.toString();
  }, [revision, runtimeInfo?.previewUrl]);

  useEffect(() => {
    if (!runtimeInfo) {
      setLiveError('');
      return;
    }
    setLiveError(runtimeInfo.errorMessage ?? '');
    const poll = () => {
      void getCustomToolRuntimeStatus(runtimeInfo.toolPath)
        .then((status) => setLiveError(status?.errorMessage ?? ''))
        .catch(() => undefined);
    };
    const timer = window.setInterval(poll, 3_000);
    return () => window.clearInterval(timer);
  }, [runtimeInfo]);

  useEffect(() => {
    if (!runtimeInfo || !src) {
      return;
    }
    const expectedOrigin = new URL(src).origin;
    const handleMessage = (event: MessageEvent<IInvokeMessage>) => {
      const frameWindow = iframeRef.current?.contentWindow;
      const data = event.data;
      if (
        event.source !== frameWindow ||
        event.origin !== expectedOrigin ||
        !data ||
        data.type !== 'momo-tool:invoke' ||
        data.toolPath !== runtimeInfo.toolPath ||
        typeof data.requestId !== 'string'
      ) {
        return;
      }

      void (async () => {
        try {
          let result: unknown;
          if (data.action === 'mcp.call') {
            const name = typeof data.payload?.name === 'string' ? data.payload.name : '';
            if (!hasPermission(runtimeInfo.permissions.mcp, name)) {
              throw new Error(`tool.json 未授权 MCP 工具: ${name || '(empty)'}`);
            }
            const args =
              data.payload?.arguments && typeof data.payload.arguments === 'object'
                ? (data.payload.arguments as Record<string, unknown>)
                : {};
            result = await callMcpTool({ name, arguments: args });
          } else if (data.action === 'skill.execute') {
            const skillRef = typeof data.payload?.skill === 'string' ? data.payload.skill : '';
            if (!hasPermission(runtimeInfo.permissions.skills, skillRef)) {
              throw new Error(`tool.json 未授权 Skill: ${skillRef || '(empty)'}`);
            }
            const skills = (await listSkills()) as ISkill[];
            const skill = skills.find((item) => item.id === skillRef || item.name === skillRef);
            if (!skill) {
              throw new Error(`未找到 Skill: ${skillRef}`);
            }
            const input = typeof data.payload?.input === 'string' ? data.payload.input : '';
            result = await executeSkillWorkspace(
              skill.id,
              input,
              sanitizeSkillOptions(data.payload?.options),
            );
          } else {
            throw new Error(`不支持的宿主能力: ${data.action}`);
          }
          frameWindow?.postMessage(
            { type: 'momo-tool:result', requestId: data.requestId, ok: true, result },
            expectedOrigin,
          );
        } catch (error) {
          frameWindow?.postMessage(
            {
              type: 'momo-tool:result',
              requestId: data.requestId,
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            },
            expectedOrigin,
          );
        }
      })();
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [runtimeInfo, src]);

  const error = runtimeError || liveError || runtimeInfo?.errorMessage;
  return (
    <div className={styles.preview}>
      {error ? <div className={styles.error}>{`后台服务异常：${error}`}</div> : null}
      {loading ? <div className={styles.loading}>{'正在启动工具服务…'}</div> : null}
      <iframe
        ref={iframeRef}
        className={styles.frame}
        title={title}
        src={src}
        srcDoc={src ? undefined : fallbackHtml}
        sandbox='allow-scripts allow-same-origin allow-forms allow-downloads'
      />
    </div>
  );
}

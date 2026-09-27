import type { WorkspaceChangeSet } from '@momo/agent-contracts';
import { useEffect, useState } from 'react';

export function useFileChanges(runId?: string) {
  const [changes, setChanges] = useState<WorkspaceChangeSet | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let disposed = false;
    let updates = 0;
    setChanges(null);
    setError('');
    if (!runId || typeof window.api.agentRuntime.fileChanges !== 'function') return;
    void window.api.agentRuntime
      .fileChanges(runId)
      .then((value) => {
        if (!disposed && updates === 0) setChanges(value);
      })
      .catch((reason: Error) => {
        if (!disposed) setError(reason.message);
      });
    const unsubscribe = window.api.agentRuntime.onEvent((event) => {
      if (!disposed && event.runId === runId && event.type === 'workspace.changed') {
        updates++;
        setChanges(event.payload.changes as WorkspaceChangeSet);
      }
    });
    return () => {
      disposed = true;
      unsubscribe();
    };
  }, [runId]);
  return { changes, error, setChanges };
}

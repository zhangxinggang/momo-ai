import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import type {
  ISlashCommandItem,
  ISlashCommandsConfig,
  ISlashInvocation,
} from '../types/slash-command';

export interface ISlashTriggerMatch {
  query: string;
  start: number;
  end: number;
}

interface IUseSlashCommandTriggerOptions {
  value: string;
  selectionStart: number;
  onChange: (value: string) => void;
  onSelectionChange: (next: number) => void;
  onInvocationChange?: (invocation: ISlashInvocation | undefined) => void;
  slashCommands?: ISlashCommandsConfig;
  currentModel: string;
  workspacePaths: string[];
  workspaceEnabled: boolean;
}

/** 在当前光标所在文本边界识别 /query，不要求整段输入以 / 开头。 */
export function extractSlashTrigger(value: string, cursor: number): ISlashTriggerMatch | null {
  const safeCursor = Math.max(0, Math.min(cursor, value.length));
  const beforeCursor = value.slice(0, safeCursor);
  const match = beforeCursor.match(/(?:^|[\s([{，、])\/([a-z0-9_:-]*)$/i);
  if (!match) {
    return null;
  }
  const token = '/' + (match[1] || '');
  const start = safeCursor - token.length;
  return { query: match[1] || '', start, end: safeCursor };
}

export function useSlashCommandTrigger(options: IUseSlashCommandTriggerOptions) {
  const {
    value,
    selectionStart,
    onChange,
    onSelectionChange,
    onInvocationChange,
    slashCommands,
    currentModel,
    workspacePaths,
    workspaceEnabled,
  } = options;

  const [items, setItems] = useState<ISlashCommandItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [warning, setWarning] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [dismissedKey, setDismissedKey] = useState('');
  const requestIdRef = useRef(0);
  const selectedCommandRef = useRef<{ start: number; command: string } | null>(null);

  const enabled = Boolean(slashCommands?.isActive(currentModel));
  const match = useMemo(
    () => (enabled ? extractSlashTrigger(value, selectionStart) : null),
    [enabled, selectionStart, value],
  );
  const matchKey = match ? String(match.start) + ':' + match.query : '';
  const visible = Boolean(match && matchKey !== dismissedKey);

  useEffect(() => {
    const selected = selectedCommandRef.current;
    if (!selected) {
      return;
    }
    if (
      value.slice(selected.start, selected.start + selected.command.length) !== selected.command
    ) {
      selectedCommandRef.current = null;
      onInvocationChange?.(undefined);
    }
  }, [onInvocationChange, value]);

  useEffect(() => {
    if (!visible || !match || !slashCommands) {
      requestIdRef.current += 1;
      setItems([]);
      setWarning(undefined);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void slashCommands
        .list(match.query, { workspacePaths, workspaceEnabled })
        .then((result) => {
          if (requestId !== requestIdRef.current) {
            return;
          }
          setItems(result.items);
          setWarning(result.warning);
          setSelectedIndex(0);
        })
        .catch(() => {
          if (requestId === requestIdRef.current) {
            setItems([]);
            setWarning('加载 Agent 资源失败');
          }
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        });
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [matchKey, slashCommands, visible, workspaceEnabled, workspacePaths]);

  const applySelection = useCallback(
    (item: ISlashCommandItem) => {
      if (!match) {
        return;
      }
      const command = item.command.startsWith('/') ? item.command : '/' + item.command;
      const inserted = command + ' ';
      const nextValue = value.slice(0, match.start) + inserted + value.slice(match.end);
      onChange(nextValue);
      onSelectionChange(match.start + inserted.length);
      selectedCommandRef.current = { start: match.start, command };
      onInvocationChange?.({
        resourceId: item.resourceId,
        resourceRevision: item.resourceRevision,
        command,
        kind: item.kind,
        scope: item.scope,
      });
      setDismissedKey(matchKey);
    },
    [match, matchKey, onChange, onInvocationChange, onSelectionChange, value],
  );

  const close = useCallback(() => {
    if (matchKey) {
      setDismissedKey(matchKey);
    }
  }, [matchKey]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!visible) {
        return false;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return true;
      }
      if (items.length === 0) {
        return false;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((previous) => (previous + 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((previous) => (previous - 1 + items.length) % items.length);
        return true;
      }
      if ((event.key === 'Enter' && !event.shiftKey) || event.key === 'Tab') {
        event.preventDefault();
        const selected = items[selectedIndex];
        if (selected) {
          applySelection(selected);
        }
        return true;
      }
      return false;
    },
    [applySelection, close, items, selectedIndex, visible],
  );

  return {
    open: visible && (loading || Boolean(warning) || items.length > 0),
    items,
    selectedIndex,
    setSelectedIndex,
    warning,
    loading,
    handleKeyDown,
    handleSelect: (index: number) => {
      const selected = items[index];
      if (selected) {
        applySelection(selected);
      }
    },
    close,
  };
}

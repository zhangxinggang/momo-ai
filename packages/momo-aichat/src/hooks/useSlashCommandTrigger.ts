import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import type {
  ISlashCommandItem,
  ISlashCommandsConfig,
  ISlashInvocation,
} from '../types/slash-command';
import { buildSlashInvocationToken } from '../utils/slash-token';

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
  slashCommands?: ISlashCommandsConfig;
  currentModel: string;
  workspacePaths: string[];
  workspaceEnabled: boolean;
}

/** 在当前光标所在文本边界识别 /query，不要求整段输入以 / 开头。 */
export function extractSlashTrigger(value: string, cursor: number): ISlashTriggerMatch | null {
  const safeCursor = Math.max(0, Math.min(cursor, value.length));
  const beforeCursor = value.slice(0, safeCursor);
  const match = beforeCursor.match(/(?:^|[\s([{，、])\/([\p{L}\p{N}_:-]*)$/iu);
  if (!match) {
    return null;
  }
  const token = '/' + (match[1] || '');
  const start = safeCursor - token.length;
  return { query: match[1] || '', start, end: safeCursor };
}

/** 把选择结果替换到触发它的 /query 位置，保留前后正文与已有行内资源。 */
export function insertSlashSelection(
  value: string,
  match: ISlashTriggerMatch,
  item: ISlashCommandItem,
): { value: string; cursor: number; invocation: ISlashInvocation } {
  const command = item.command.startsWith('/') ? item.command : '/' + item.command;
  const invocation: ISlashInvocation = {
    resourceId: item.resourceId,
    resourceRevision: item.resourceRevision,
    command,
    label: item.label,
    kind: item.kind,
    scope: item.scope,
    category: item.category,
    tags: item.tags,
  };
  const token = buildSlashInvocationToken(invocation);
  const trailingContent = value.slice(match.end);
  const separator = trailingContent.length === 0 || !/^\s/.test(trailingContent) ? ' ' : '';
  const nextValue = value.slice(0, match.start) + token + separator + trailingContent;
  return {
    value: nextValue,
    cursor: match.start + token.length + separator.length,
    invocation: { ...invocation, token },
  };
}

export function useSlashCommandTrigger(options: IUseSlashCommandTriggerOptions) {
  const {
    value,
    selectionStart,
    onChange,
    onSelectionChange,
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

  const enabled = Boolean(slashCommands?.isActive(currentModel));
  const match = useMemo(
    () => (enabled ? extractSlashTrigger(value, selectionStart) : null),
    [enabled, selectionStart, value],
  );
  const matchKey = match ? String(match.start) + ':' + match.query : '';
  const visible = Boolean(match && matchKey !== dismissedKey);

  // 选中资源后 match 会消失。此时必须释放上一次的关闭键，否则删除标签后
  // 再次在同一位置输入 “/” 会被误判为仍处于已关闭状态。
  useEffect(() => {
    if (!match && dismissedKey) {
      setDismissedKey('');
    }
  }, [dismissedKey, match]);

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
            setWarning('加载技能与命令失败');
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
      // token 插入用户当前光标所在位置；它与普通文字和 @ 引用共用同一套
      // value/surface 映射，因此一条消息可以包含任意多个 Skill/Command。
      const inserted = insertSlashSelection(value, match, item);
      onChange(inserted.value);
      onSelectionChange(inserted.cursor);
      setDismissedKey(matchKey);
    },
    [match, matchKey, onChange, onSelectionChange, value],
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
    // 保持空结果面板可见，明确告诉用户“没有匹配项”，避免看起来像触发失效。
    open: visible,
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

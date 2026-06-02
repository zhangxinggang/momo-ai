import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import type { ISlashCommandItem, ISlashCommandsConfig } from '../types/slash-command';

interface IUseSlashCommandTriggerOptions {
  value: string;
  onChange: (value: string) => void;
  slashCommands?: ISlashCommandsConfig;
  currentModel: string;
  workspacePaths: string[];
  workspaceEnabled: boolean;
}

function buildInsertText(command: string, hasArgs?: boolean): string {
  const normalized = command.startsWith('/') ? command : `/${command}`;
  if (hasArgs === false) {
    return `${normalized} `;
  }
  return `${normalized} `;
}

/** 仅在输入「命令名」阶段显示面板（选中后会有空格，与终端一致） */
function shouldShowSlashMenu(value: string): boolean {
  if (!value.startsWith('/')) {
    return false;
  }
  const afterSlash = value.slice(1);
  if (afterSlash.includes(' ')) {
    return false;
  }
  return true;
}

function extractSlashQuery(value: string): string {
  if (!shouldShowSlashMenu(value)) {
    return '';
  }
  return value.slice(1);
}

export function useSlashCommandTrigger(options: IUseSlashCommandTriggerOptions) {
  const { value, onChange, slashCommands, currentModel, workspacePaths, workspaceEnabled } =
    options;

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ISlashCommandItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [warning, setWarning] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  const isEnabled = useMemo(
    () => Boolean(slashCommands?.isActive(currentModel)),
    [slashCommands, currentModel],
  );

  const query = useMemo(() => extractSlashQuery(value), [value]);

  const menuVisible = useMemo(() => isEnabled && shouldShowSlashMenu(value), [isEnabled, value]);

  const loadItems = useCallback(async () => {
    if (!slashCommands || !isEnabled) {
      setItems([]);
      setWarning(undefined);
      return;
    }
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    try {
      const result = await slashCommands.list(query, {
        workspacePaths,
        workspaceEnabled,
      });
      if (requestIdRef.current !== requestId) {
        return;
      }
      setItems(result.items);
      setWarning(result.warning);
      setSelectedIndex(0);
    } catch {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setItems([]);
      setWarning('加载斜杠命令失败');
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [slashCommands, isEnabled, query, workspacePaths, workspaceEnabled]);

  useEffect(() => {
    if (!menuVisible) {
      setOpen(false);
      setItems([]);
      setWarning(undefined);
      return;
    }
    setOpen(true);
    const timer = window.setTimeout(() => {
      void loadItems();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [menuVisible, value, loadItems]);

  const applySelection = useCallback(
    (item: ISlashCommandItem) => {
      onChange(buildInsertText(item.command, item.hasArgs));
      setOpen(false);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!open || items.length === 0) {
        return false;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const item = items[selectedIndex];
        if (item) {
          applySelection(item);
        }
        return true;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        const item = items[selectedIndex];
        if (item) {
          applySelection(item);
        }
        return true;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return true;
      }
      return false;
    },
    [open, items, selectedIndex, applySelection],
  );

  const handleSelect = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        applySelection(item);
      }
    },
    [items, applySelection],
  );

  return {
    open: open && menuVisible,
    items,
    selectedIndex,
    setSelectedIndex,
    warning,
    loading,
    handleKeyDown,
    handleSelect,
    close: () => setOpen(false),
  };
}

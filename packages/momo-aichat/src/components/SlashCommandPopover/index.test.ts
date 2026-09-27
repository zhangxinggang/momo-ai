// @vitest-environment jsdom
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSlashCommandTrigger } from '../../hooks/useSlashCommandTrigger';
import type { ISlashCommandItem } from '../../types/slash-command';
import { findSlashInvocationTokens, slashTokensToPlainText } from '../../utils/slash-token';
import { SlashCommandPopover } from './index';

const items: ISlashCommandItem[] = [
  {
    resourceId: 'review',
    resourceRevision: '1',
    command: '/review',
    label: 'Review',
    kind: 'skill',
    scope: 'project',
    agentAppId: 'cursor',
    agentAppName: 'Cursor',
    description: 'code review',
    directoryPath: ['frontend', 'quality'],
  },
  {
    resourceId: 'deploy',
    resourceRevision: '1',
    command: '/deploy',
    label: 'Deploy',
    kind: 'skill',
    scope: 'project',
    agentAppId: 'cursor',
    agentAppName: 'Cursor',
    directoryPath: ['ops', 'release'],
  },
  {
    resourceId: 'smoke',
    resourceRevision: '1',
    command: '/smoke',
    label: 'Smoke',
    kind: 'skill',
    scope: 'project',
    agentAppId: 'cursor',
    agentAppName: 'Cursor',
    directoryPath: ['frontend', 'quality'],
  },
  {
    resourceId: 'codex-review',
    resourceRevision: '1',
    command: '/review',
    label: 'Review',
    kind: 'skill',
    scope: 'project',
    agentAppId: 'codex',
    agentAppName: 'Codex',
    directoryPath: ['frontend', 'quality'],
  },
  {
    resourceId: 'app-review',
    resourceRevision: '1',
    command: '/app',
    label: 'App review',
    kind: 'skill',
    scope: 'application',
    category: 'dev',
  },
];
const workspacePaths: string[] = [];

describe('slash resource search', () => {
  let container: HTMLDivElement, root: Root;
  let slash: ReturnType<typeof useSlashCommandTrigger>;
  let composer: string;
  let setComposer: (value: string) => void;
  const list = vi.fn(async (query: string) => ({
    items: items.filter((item) =>
      [item.label, item.description, item.directoryPath?.join('/')]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
  }));
  const config = { isActive: () => true, list };

  function Harness() {
    const [value, setValue] = useState('请用 / 完成检查');
    composer = value;
    setComposer = setValue;
    slash = useSlashCommandTrigger({
      value,
      selectionStart: 4,
      onChange: setValue,
      onSelectionChange: vi.fn(),
      currentModel: 'model',
      slashCommands: config,
      workspacePaths,
      workspaceEnabled: true,
    });
    return React.createElement(SlashCommandPopover, {
      open: slash.open,
      items: slash.items,
      selectedIndex: slash.selectedIndex,
      loading: slash.loading,
      warning: slash.warning,
      query: slash.query,
      onQueryChange: slash.setQuery,
      onSearchKeyDown: slash.handleKeyDown,
      onSelect: slash.handleSelect,
      onHover: slash.setSelectedIndex,
    });
  }
  async function settle() {
    await act(async () => vi.advanceTimersByTime(110));
  }
  async function search(query: string) {
    const input = container.querySelector('input')!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, query);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await settle();
  }
  async function key(key: string, isComposing = false) {
    await act(async () =>
      container
        .querySelector('input')!
        .dispatchEvent(new KeyboardEvent('keydown', { key, isComposing, bubbles: true })),
    );
  }
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    list.mockClear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => root.render(React.createElement(Harness)));
    await settle();
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('uses a generic title and keeps matching resources under their source and ancestor directories', async () => {
    expect(container.textContent).toContain('技能与命令');
    expect(container.textContent).not.toContain('Cursor ·');
    await search('review');
    expect(list).toHaveBeenLastCalledWith('review', expect.any(Object));
    expect(composer).toBe('请用 / 完成检查');
    for (const provider of ['Cursor', 'Codex']) {
      const source = container.querySelector(`[role="group"][aria-label="${provider} 项目技能"]`)!;
      const parent = source.querySelector('[role="group"][aria-label="frontend"]')!;
      expect(
        parent.querySelector('[role="group"][aria-label="quality"] [role="option"]')?.textContent,
      ).toContain('Review');
    }
    expect(
      container.querySelector('[role="group"][aria-label="开发"] [role="option"]')?.textContent,
    ).toContain('App review');
    expect(container.querySelector('[role="group"][aria-label="ops"]')).toBeNull();
    await search('no match');
    expect(container.textContent).toContain('没有找到匹配');
    expect(container.querySelectorAll('[role="group"]')).toHaveLength(0);
    await act(async () =>
      (container.querySelector('[aria-label="清空搜索"]') as HTMLButtonElement).click(),
    );
    await settle();
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(items.length);
  });

  it('navigates in directory order, ignores IME confirmation and replaces the original slash position', async () => {
    expect(slash.items.map((item) => item.resourceId)).toEqual([
      'review',
      'smoke',
      'deploy',
      'codex-review',
      'app-review',
    ]);
    await key('ArrowDown');
    expect(container.querySelector('[aria-selected="true"]')?.textContent).toContain('Smoke');
    await key('Enter', true);
    expect(composer).toBe('请用 / 完成检查');
    await key('Enter');
    expect(findSlashInvocationTokens(composer)[0].invocation.resourceId).toBe('smoke');
    expect(slashTokensToPlainText(composer)).toBe('请用 /Smoke 完成检查');
  });

  it('ignores older searches and resets the search when the slash panel is reopened', async () => {
    let finish!: (result: { items: ISlashCommandItem[] }) => void;
    list.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    await search('old');
    await search('Deploy');
    await act(async () => finish({ items: [items[0]] }));
    expect(slash.items.map((item) => item.resourceId)).toEqual(['deploy']);
    await act(async () => slash.close());
    await act(async () => setComposer(''));
    await act(async () => setComposer('请用 / 完成检查'));
    await settle();
    expect(slash.query).toBe('');
    expect(slash.items).toHaveLength(items.length);
  });
});

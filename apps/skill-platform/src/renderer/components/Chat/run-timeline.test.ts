// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { RunTimeline } from '../../../../../../packages/momo-aichat/src/components/RunTimeline';
vi.mock('../../../../../../packages/momo-aichat/src/components/MarkdownRenderer', () => ({
  default: () => null,
}));

it('shows the newest tool while collapsed and collapses the group and details when generation finishes', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const event = (id: number) => ({
    eventId: String(id),
    type: 'tool.started',
    payload: {
      callId: String(id),
      toolId: 'workspace.read',
      title: '读取文件 ' + id,
      arguments: { path: `${id}.txt` },
    },
  });
  const events = [event(1), event(2)];
  const render = (status: string) =>
    act(async () =>
      root.render(
        React.createElement(RunTimeline, {
          events: events as any,
          status,
          respond: async () => {},
        }),
      ),
    );
  try {
    await render('running');
    expect(container.querySelectorAll('.run-tool-card')).toHaveLength(1);
    const latest = container.querySelector<HTMLElement>('.run-tool-card-summary')!;
    await act(async () => latest.click());
    expect(container.querySelector('details[open]')).not.toBeNull();
    const toggle = container.querySelector<HTMLButtonElement>('.run-tool-group-summary')!;
    await act(async () => toggle.click());
    expect(container.querySelectorAll('.run-tool-card')).toHaveLength(2);
    events.push(event(3));
    await render('running');
    expect(container.querySelectorAll('.run-tool-card')).toHaveLength(3);
    await render('completed');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelectorAll('.run-tool-card')).toHaveLength(0);
    expect(container.querySelector('.run-tool-list')).toBeNull();
    await act(async () => toggle.click());
    expect(container.querySelectorAll('.run-tool-card')).toHaveLength(3);
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});

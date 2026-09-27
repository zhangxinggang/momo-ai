// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  detect: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  projects: [] as any[],
  order: [] as string[],
}));
vi.mock('antd', async () => {
  const React = await import('react');
  const Context = React.createContext<any>(null);
  const Checkbox = Object.assign(
    ({ value, children }: any) => {
      const group = React.useContext(Context);
      return React.createElement(
        'label',
        null,
        React.createElement('input', {
          type: 'checkbox',
          value,
          checked: group.value.includes(value),
          onChange: () =>
            group.onChange(
              group.value.includes(value)
                ? group.value.filter((id: string) => id !== value)
                : [...group.value, value],
            ),
        }),
        children,
      );
    },
    {
      Group: ({ value, onChange, children }: any) =>
        React.createElement(Context.Provider, { value: { value, onChange } }, children),
    },
  );
  return {
    Checkbox,
    Modal: ({ open, children, onOk, okButtonProps }: any) =>
      open
        ? React.createElement(
            'div',
            null,
            children,
            React.createElement(
              'button',
              { onClick: onOk, disabled: okButtonProps.disabled, 'aria-label': 'save' },
              '保存',
            ),
          )
        : null,
    Button: ({ children, onClick }: any) => React.createElement('button', { onClick }, children),
    Input: (props: any) => React.createElement('input', props),
  };
});
vi.mock('@renderer/components/ui/PlatformIcon', () => ({ PlatformIcon: () => null }));
vi.mock('@renderer/components/ui/Toast', () => ({ useToast: () => ({ showToast: vi.fn() }) }));
vi.mock('@renderer/services/agent-app/api', () => ({ detectAgentApps: mocks.detect }));
vi.mock('@renderer/services/desktop', () => ({ pickFolders: vi.fn() }));
vi.mock('@renderer/store', () => ({
  useSettingsStore: (select: any) => select({ skillPlatformOrder: mocks.order }),
}));
vi.mock('@renderer/store/chat', () => ({
  useChatProjectStore: (select: any) =>
    select({
      projects: mocks.projects,
      recentFolderPaths: [],
      createProject: mocks.create,
      updateProject: mocks.update,
      pushRecentFolders: vi.fn(),
      removeRecentFolder: vi.fn(),
    }),
}));

import { ChatProjectModal } from './index';

describe('project Agent checkboxes', () => {
  let container: HTMLDivElement, root: Root;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    mocks.projects = [
      { id: 'project', name: 'project', folderPaths: ['/workspace'], agentAppIds: ['cursor'] },
    ];
    mocks.detect.mockReset().mockImplementation(async (input: any) => ({
      ...input,
      errors: [],
      items: ['cursor', 'claude'].map((platformId) => ({
        platformId,
        matchedFolderPaths: input.folderPaths,
        matchedMarkers: [],
      })),
    }));
    mocks.update.mockReset().mockReturnValue({ ok: true });
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  async function mount() {
    await act(async () =>
      root.render(
        React.createElement(ChatProjectModal, {
          open: true,
          mode: 'edit',
          projectId: 'project',
          onClose: vi.fn(),
        }),
      ),
    );
    await act(async () => vi.advanceTimersByTime(300));
  }
  async function click(selector: string) {
    const element = container.querySelector(selector) as HTMLInputElement;
    expect(element).not.toBeNull();
    await act(async () => element.click());
  }

  it('retains the saved selection, shows detected Agents only, and saves multiple or zero selections', async () => {
    await mount();
    expect(
      Array.from(container.querySelectorAll('input[type="checkbox"]')).map(
        (input) => (input as HTMLInputElement).value,
      ),
    ).toEqual(['claude', 'cursor']);
    expect((container.querySelector('input[value="cursor"]') as HTMLInputElement).checked).toBe(
      true,
    );
    await click('input[value="claude"]');
    await click('button[aria-label="save"]');
    expect(mocks.update).toHaveBeenLastCalledWith(
      'project',
      'project',
      ['/workspace'],
      ['cursor', 'claude'],
    );
    await click('input[value="cursor"]');
    await click('input[value="claude"]');
    await click('button[aria-label="save"]');
    expect(mocks.update).toHaveBeenLastCalledWith('project', 'project', ['/workspace'], []);
  });

  it('does not automatically select an Agent when editing an explicitly empty selection', async () => {
    mocks.projects[0].agentAppIds = [];
    await mount();
    expect(
      Array.from(container.querySelectorAll('input[type="checkbox"]')).every(
        (input) => !(input as HTMLInputElement).checked,
      ),
    ).toBe(true);
    await click('button[aria-label="save"]');
    expect(mocks.update).toHaveBeenLastCalledWith('project', 'project', ['/workspace'], []);
  });
});

// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatProjectStore } from './project';

vi.mock(
  '@momo/aichat',
  () => import('../../../../../../packages/momo-aichat/src/utils/chat-project'),
);

beforeEach(() => {
  localStorage.clear();
  useChatProjectStore.setState({
    projects: [],
    recentFolderPaths: [],
    activeFolderPaths: [],
    activeAgentAppIds: [],
  });
});

describe('project Agent selection', () => {
  it('persists multiple selections and allows updating to no Agents', () => {
    const result = useChatProjectStore
      .getState()
      .createProject('project', ['/root'], [' cursor ', 'claude', 'cursor']);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected a project');
    expect(result.project.agentAppIds).toEqual(['cursor', 'claude']);
    useChatProjectStore.getState().updateProject(result.project.id, 'project', ['/root'], []);
    expect(useChatProjectStore.getState().projects[0].agentAppIds).toEqual([]);
    const persisted = JSON.parse(localStorage.getItem('chat-project-storage')!);
    expect(persisted.version).toBe(3);
    expect(persisted.state.projects[0].agentAppIds).toEqual([]);
  });

  it('migrates a legacy radio selection into the checkbox array', async () => {
    localStorage.setItem(
      'chat-project-storage',
      JSON.stringify({
        version: 2,
        state: {
          projects: [
            {
              id: 'legacy',
              name: 'project',
              folderPaths: [],
              agentAppId: 'cursor',
              createdAt: 1,
              updatedAt: 1,
            },
          ],
        },
      }),
    );
    await useChatProjectStore.persist.rehydrate();
    expect(useChatProjectStore.getState().projects[0].agentAppIds).toEqual(['cursor']);
  });

  it('preserves explicit deselection even if a legacy single selection remains', async () => {
    localStorage.setItem(
      'chat-project-storage',
      JSON.stringify({
        version: 2,
        state: {
          projects: [
            {
              id: 'legacy',
              name: 'project',
              folderPaths: [],
              agentAppIds: [],
              agentAppId: 'cursor',
            },
          ],
        },
      }),
    );
    await useChatProjectStore.persist.rehydrate();
    expect(useChatProjectStore.getState().projects[0].agentAppIds).toEqual([]);
  });
});

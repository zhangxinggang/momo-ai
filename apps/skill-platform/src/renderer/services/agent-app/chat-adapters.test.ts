import { describe, expect, it, vi } from 'vitest';
import { createAgentAppChatAdapters } from './chat-adapters';
const mocks = vi.hoisted(() => ({ list: vi.fn(), prepare: vi.fn() }));
vi.mock('./api', () => ({
  listAgentAppSlashCommands: mocks.list,
  prepareAgentAppSubmit: mocks.prepare,
}));

describe('Agent resource chat adapters', () => {
  it('passes the current multi-selection and workspace to list and submit, including deselection', async () => {
    let selected = ['cursor', 'claude'];
    const adapters = createAgentAppChatAdapters({
      getAgentAppIds: () => selected,
      getFolderPaths: () => ['/draft-project'],
    });
    mocks.list.mockResolvedValue({
      items: [
        {
          resourceId: 'cursor-skill',
          resourceRevision: 'rev',
          command: '/review',
          label: 'review',
          kind: 'skill',
          scope: 'project',
          agentAppId: 'cursor',
          agentAppName: 'Cursor',
          directoryPath: ['frontend', 'review'],
        },
      ],
    });
    const result = await adapters.slashCommands.list('', {
      workspacePaths: [],
      workspaceEnabled: true,
    });
    expect(mocks.list).toHaveBeenLastCalledWith({
      agentAppIds: ['cursor', 'claude'],
      folderPaths: ['/draft-project'],
      query: '',
    });
    expect(result.items[0].agentAppName).toBe('Cursor');
    expect(result.items[0].directoryPath).toEqual(['frontend', 'review']);
    mocks.prepare.mockResolvedValue({ action: 'allow' });
    await adapters.beforeSubmitPrompt({
      content: 'hello',
      displayContent: 'hello',
      modelId: 'model',
      workspacePaths: ['/draft-project'],
    });
    expect(mocks.prepare).toHaveBeenLastCalledWith(
      expect.objectContaining({ agentAppIds: ['cursor', 'claude'] }),
    );
    selected = [];
    await adapters.slashCommands.list('', {
      workspacePaths: ['/draft-project'],
      workspaceEnabled: true,
    });
    expect(mocks.list).toHaveBeenLastCalledWith({
      agentAppIds: [],
      folderPaths: ['/draft-project'],
      query: '',
    });
  });
});

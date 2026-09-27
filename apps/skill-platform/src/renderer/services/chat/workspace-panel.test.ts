import { expect, it } from 'vitest';
import {
  openChatBrowser,
  openChatWorkspaceFile,
  useWorkspacePanelRequest,
  workspaceFileTarget,
} from './workspace-panel';
it('matches path segments, Windows casing, and the most specific workspace root', () => {
  expect(
    workspaceFileTarget(
      ['C:\\work\\demo', 'C:\\work\\demo\\nested'],
      'c:/work/demo/nested/src/a.ts',
    ),
  ).toEqual({ root: 'C:\\work\\demo\\nested', relativePath: 'src/a.ts' });
  expect(workspaceFileTarget(['C:/work/demo'], 'C:/work/demo-old/a.ts')).toBeNull();
  expect(workspaceFileTarget(['C:/work/demo'], 'C:/work/demo/../outside.ts')).toBeNull();
});
it('routes web links and workspace files to their panel without accepting privileged URLs', () => {
  openChatBrowser('https://example.com');
  expect(useWorkspacePanelRequest.getState().request).toMatchObject({
    tab: 'browser',
    url: 'https://example.com',
  });
  openChatBrowser('file:///C:/secret');
  expect(useWorkspacePanelRequest.getState().request?.tab).toBe('browser');
  expect(openChatWorkspaceFile(['C:/work/demo'], 'C:/work/demo/src/a.ts')).toBe(true);
  expect(useWorkspacePanelRequest.getState().request).toMatchObject({
    tab: 'files',
    relativePath: 'src/a.ts',
  });
  expect(openChatWorkspaceFile(['C:/work/demo'], 'C:/else/a.ts')).toBe(false);
});

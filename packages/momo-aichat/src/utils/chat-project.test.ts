import { describe, expect, it } from 'vitest';

import {
  buildChatProjectUniqueKey,
  getChatProjectDisplayName,
  normalizeFolderPaths,
} from './chat-project';

describe('normalizeFolderPaths', () => {
  it('trim 去重排序', () => {
    expect(normalizeFolderPaths(['/b', ' /a ', '/b', ''])).toEqual(['/a', '/b']);
  });
});

describe('buildChatProjectUniqueKey', () => {
  it('同名空文件夹键相同', () => {
    expect(buildChatProjectUniqueKey('自由对话', [])).toBe(
      buildChatProjectUniqueKey(' 自由对话 ', []),
    );
  });
  it('路径顺序不影响键', () => {
    expect(buildChatProjectUniqueKey('p', ['/b', '/a'])).toBe(
      buildChatProjectUniqueKey('p', ['/a', '/b']),
    );
  });
});

describe('getChatProjectDisplayName', () => {
  it('有名称用名称', () => {
    expect(getChatProjectDisplayName({ name: '我的项目', folderPaths: ['/x/y'] })).toBe('我的项目');
  });
  it('无名称用首路径 basename', () => {
    expect(getChatProjectDisplayName({ name: '  ', folderPaths: ['/x/y'] })).toBe('y');
  });
});

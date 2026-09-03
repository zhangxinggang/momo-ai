// @vitest-environment jsdom

import '@momo/markdown-styles';
import { describe, expect, it } from 'vitest';
import { buildRichTextExtensions } from '../../../../../../packages/momo-markdown/src/components/MdEditor/layouts/Content/richtext/extensions';

function getExtension(name: string) {
  const extension = buildRichTextExtensions('', true, 30).find((item) => item.name === name);

  expect(extension, `${name} extension`).toBeDefined();
  return extension!;
}

describe('rich-text editor parity', () => {
  it('copies rendered content instead of Markdown source', () => {
    expect(getExtension('markdown').options.transformCopiedText).toBe(false);
  });

  it('uses the preview task-list hooks', () => {
    const taskList = getExtension('taskList');
    expect(taskList.options.HTMLAttributes).toMatchObject({
      class: 'contains-task-list',
    });
    expect(getExtension('taskItem').options.HTMLAttributes).toMatchObject({
      class: 'task-list-item',
    });

    const tightAttribute = (taskList.config as any).addAttributes.call({}).tight;
    const tightList = document.createElement('ul');
    tightList.innerHTML = '<li>one</li><li>two</li>';
    const looseList = document.createElement('ul');
    looseList.innerHTML = '<li><p>one</p></li><li><p>two</p></li>';

    expect(tightAttribute.parseHTML(tightList)).toBe(true);
    expect(tightAttribute.parseHTML(looseList)).toBe(false);
    expect(tightAttribute.renderHTML({ tight: false })).toEqual({ 'data-tight': 'false' });
  });

  it('does not apply preview-container styles to inline links or images', () => {
    expect(getExtension('link').options.HTMLAttributes?.class).toBeFalsy();
    expect(getExtension('image').options.HTMLAttributes?.class).toBeFalsy();
  });
});

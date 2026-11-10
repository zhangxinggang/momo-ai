import { createParser } from '@openuidev/react-lang';
import { describe, expect, it } from 'vitest';
import { projectRuntimeView } from '../aichat/runtime-view';
import { momoOpenuiLibrary } from './openui-library';
import { normalizeOpenuiSource } from './openui-source';

describe('Stack wrap position recovery', () => {
  it.each([
    ['"row", "s", true', undefined, true],
    ['"row", "s", false', undefined, false],
    ['"row", "s", "center", true', 'center', true],
  ])('places the trailing boolean in wrap: %s', (args, align, wrap) => {
    const source = `root = Stack([row])\nrow = Stack([text], ${args})\ntext = PlainText("出处：第 12 页")`;
    const view = projectRuntimeView(source, false)!;
    expect(view.status).toBe('complete');
    const parsed = createParser(momoOpenuiLibrary.toJSONSchema()).parse(view.content);
    const row = (parsed.root!.props.children as any[])[0];
    expect(row.props).toMatchObject({ direction: 'row', gap: 's', wrap });
    expect(row.props.align ?? undefined).toBe(align);
    expect(row.props.children[0].props.text).toBe('出处：第 12 页');
    expect(normalizeOpenuiSource(view.content)).toBe(view.content);
  });

  it('preserves literal text, comments, valid full arguments and partial streams', () => {
    const source =
      'root = Stack([PlainText("Stack([text], \\\"row\\\", \\\"s\\\", true)")], "row", "s", "center", "between", true)\n// Stack([x], "row", "s", true)';
    expect(normalizeOpenuiSource(source)).toBe(source);
    const partial = 'root = Stack([text], "row", "s", true';
    expect(normalizeOpenuiSource(partial)).toBe(partial);
    expect(projectRuntimeView(source, false)?.status).toBe('complete');
  });

  it.each([
    'root = Stack([], align=true)',
    'root = Stack([], "row", "s", "invalid", true)',
    'root = Stack([], "row", "s", true, "between", false)',
    'root = Stack([missing], "row", "s", true)',
  ])('keeps ambiguous values and missing content invalid: %s', (source) => {
    expect(projectRuntimeView(source, false)?.status).toBe('error');
  });
});

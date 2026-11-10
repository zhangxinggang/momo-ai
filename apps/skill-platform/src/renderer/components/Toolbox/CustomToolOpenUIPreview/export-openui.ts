import type { ICustomToolComponentConfig } from '@/types/modules';
import type { IChatSourceRef } from '@momo/aichat';
import { createParser, type ElementNode } from '@openuidev/react-lang';
import { momoOpenuiLibrary } from '@renderer/services/custom-tool/openui-library';
import { normalizeOpenuiSource } from '@renderer/services/custom-tool/openui-source';

function isElement(value: unknown): value is ElementNode {
  return Boolean(value && typeof value === 'object' && (value as ElementNode).type === 'element');
}

/** Build a semantic document from the complete component graph, without mounting UI,
 * switching tabs, fetching files/APIs, or losing rows to table pagination. */
export function createOpenuiExportSurface(
  source: string,
  overrides: Record<string, ICustomToolComponentConfig> = {},
  sources: IChatSourceRef[] = [],
): HTMLElement {
  const parsed = createParser(momoOpenuiLibrary.toJSONSchema()).parse(
    normalizeOpenuiSource(source),
  );
  if (
    !parsed.root ||
    parsed.root.partial ||
    parsed.meta.errors.length ||
    parsed.meta.unresolved.length
  ) {
    throw new Error('界面尚未完整生成或包含无效引用，无法导出完整报告。');
  }
  const surface = document.createElement('article');
  const propsOf = (node: ElementNode) => {
    const config = node.statementId ? overrides[node.statementId] : undefined;
    const props = { ...node.props, ...config?.props };
    if (config?.data?.mode === 'static' && config.data.targetProp) {
      props[config.data.targetProp] = config.data.staticValue;
    }
    return props;
  };
  const text = (parent: HTMLElement, value: unknown, tag = 'p') => {
    if (value == null || value === '') return;
    const element = document.createElement(tag);
    element.textContent = String(value);
    parent.append(element);
  };
  const append = (value: unknown, parent: HTMLElement, depth: number) => {
    if (Array.isArray(value)) {
      for (const child of value) append(child, parent, depth);
      return;
    }
    if (!isElement(value)) {
      if (typeof value === 'string' || typeof value === 'number') text(parent, value);
      return;
    }
    const props = propsOf(value);
    if (
      [
        'ExportDocx',
        'Button',
        'Input',
        'TextArea',
        'Select',
        'FileInput',
        'FileTask',
        'AgentTask',
      ].includes(value.typeName)
    )
      return;
    if (value.typeName === 'Tabs') {
      for (const tab of Array.isArray(props.items) ? props.items : []) {
        if (!isElement(tab)) continue;
        const tabProps = propsOf(tab);
        const section = document.createElement('section');
        text(section, tabProps.trigger, `h${Math.min(depth + 1, 6)}`);
        const content = tabProps.content;
        const first = Array.isArray(content) ? content[0] : undefined;
        const firstProps = isElement(first) ? propsOf(first) : undefined;
        const repeatedTitle =
          isElement(first) &&
          first.typeName === 'PlainText' &&
          firstProps?.emphasis === 'heading' &&
          firstProps.text === tabProps.trigger;
        append(
          Array.isArray(content) && repeatedTitle ? content.slice(1) : content,
          section,
          depth + 1,
        );
        parent.append(section);
      }
      return;
    }
    if (value.typeName === 'Table') {
      const columns = (Array.isArray(props.columns) ? props.columns : [])
        .filter(isElement)
        .map(propsOf);
      if (!columns.length) return;
      const table = document.createElement('table');
      const header = table.createTHead().insertRow();
      for (const column of columns) text(header, column.label ?? '', 'th');
      const body = table.createTBody();
      const count = Math.max(
        0,
        ...columns.map((column) => (Array.isArray(column.data) ? column.data.length : 0)),
      );
      for (let index = 0; index < count; index++) {
        const row = body.insertRow();
        for (const column of columns) {
          const cell = row.insertCell();
          append(Array.isArray(column.data) ? column.data[index] : '', cell, depth);
        }
      }
      parent.append(table);
      return;
    }
    if (value.typeName === 'FilePreview') {
      const file = sources.find((item) => item.sourceId === props.sourceId);
      text(
        parent,
        `模板附件：${file?.name || String(props.sourceId ?? '未提供文件')}（原版式 Word 请通过模板阅读器单独下载）`,
      );
      return;
    }
    if (value.typeName === 'PlainText') {
      text(parent, props.text, props.emphasis === 'heading' ? `h${Math.min(depth + 1, 6)}` : 'p');
      return;
    }
    // Other display components retain their text and nested content, rather than
    // exporting presentation properties such as colors, sizes or internal IDs.
    for (const key of [
      'title',
      'heading',
      'text',
      'textMarkdown',
      'description',
      'content',
      'children',
      'items',
      'left',
      'right',
      'header',
      'footer',
    ]) {
      if (props[key] != null) append(props[key], parent, depth);
    }
  };
  append(parsed.root, surface, 0);
  return surface;
}

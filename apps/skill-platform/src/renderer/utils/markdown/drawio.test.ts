import { describe, expect, it } from 'vitest';

import {
  createDrawioLoadAction,
  findMarkdownDiagram,
  getDrawioAssetId,
  withDrawioImageVersion,
} from '../../../../../../packages/momo-markdown/src/components/MdEditor/utils/drawio';

describe('draw.io Markdown bridge', () => {
  it('replaces only a complete fence and preserves adjacent Markdown', () => {
    const markdown = '# Before\n\n````mermaid\nflowchart LR\nA --> B\n````\n\nAfter';
    const result = findMarkdownDiagram(markdown, 2)!;
    expect(result.source).toEqual({ format: 'mermaid', data: 'flowchart LR\nA --> B' });
    expect(markdown.slice(0, result.from) + '![](asset.png)' + markdown.slice(result.to)).toBe(
      '# Before\n\n![](asset.png)\n\nAfter',
    );
    expect(findMarkdownDiagram('```mermaid\nA --> B', 0)).toBeNull();
    expect(findMarkdownDiagram('~~~puml\n@startuml\n@enduml\n~~~', 0)?.source.format).toBe(
      'plantuml',
    );
  });
  it('loads Mermaid and PlantUML source through editable draw.io descriptors', () => {
    expect(
      createDrawioLoadAction({
        source: { format: 'mermaid', data: 'flowchart LR\nA --> B' },
      }),
    ).toMatchObject({
      action: 'load',
      descriptor: { format: 'mermaid', wrap: true },
      noSaveBtn: true,
      saveAndExit: true,
    });

    expect(
      createDrawioLoadAction({
        source: { format: 'plantuml', data: '@startuml\nA -> B\n@enduml' },
      }),
    ).toMatchObject({ descriptor: { format: 'plantuml', wrap: true } });
  });

  it('reopens only managed draw.io PNG assets and ignores the cache query', () => {
    const id = 'drawio-123e4567-e89b-42d3-a456-426614174000';
    expect(getDrawioAssetId(`http://localhost:8081/assets/${id}.png?drawio-version=2`)).toBe(id);
    expect(getDrawioAssetId('http://localhost:8081/assets/plain-image.png')).toBeNull();
  });

  it('cache-busts the displayed image without replacing its persisted URL', () => {
    const src = 'http://localhost:8081/assets/drawio.png';
    expect(withDrawioImageVersion(src, 12)).toBe(`${src}?drawio-version=12`);
    expect(withDrawioImageVersion(src, 0)).toBe(src);
  });

  it('loads saved XML directly instead of exposing it in Markdown attributes', () => {
    const xml = '<mxGraphModel><root /></mxGraphModel>';
    expect(createDrawioLoadAction({ xml })).toEqual({
      action: 'load',
      xml,
      title: '图形编辑',
      noSaveBtn: true,
      saveAndExit: true,
    });
  });
});

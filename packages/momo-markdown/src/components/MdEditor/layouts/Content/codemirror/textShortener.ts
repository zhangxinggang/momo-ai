/**
 * https://discuss.codemirror.net/t/i-created-an-extension-to-collapse-and-display-long-text-but-im-encountering-issues-when-pasting-long-text-in-places-where-there-are-characters-before-or-after-it/9400
 *
 * 在 codemirror 作者帮助下优化了该插件。
 */

import {
  EditorState,
  Extension,
  RangeSetBuilder,
  StateEffect,
  StateField,
} from '@codemirror/state';
import { Decoration, DecorationSet, EditorView, ViewPlugin, WidgetType } from '@codemirror/view';

export interface IFindTextsContext {
  state: EditorState;
  lineText: string;
  lineNumber: number;
  lineFrom: number;
  lineTo: number;
  defaultTextRegex: RegExp;
}

export interface ITextShortenerOptions {
  maxLength: number;
  shortenText?: (text: string) => string;
  findTexts?: (context: IFindTextsContext) => Array<[number, number]>;
}

// http:// https:// ftp:// 等
const protoLink = /[a-z][a-z0-9.+-]*:\/\/[^\s<>"'`()]+(?:\([^\s<>"'`]*\)[^\s<>"'`]*)*/i;
// 协议相对链接 //example.com
const protocolRelative = /\/\/[^\s<>"'`()]+/i;
// data:...
const dataUri = /data:[a-z]+\/[a-z0-9.+-]+(?:;base64)?,[a-z0-9+/=%]+/i;
// /path/to/file
const absPath = /\/(?!\/)[^\s<>"'`()]+/i;

const defaultTextRegex = new RegExp(
  `(${protoLink.source}|${protocolRelative.source}|${dataUri.source}|${absPath.source})`,
  'gi',
);
const boundaryCharRegex = /[a-z0-9.+-]/i;

const findDefaultTextRanges = (text: string): Array<[number, number]> => {
  const ranges: Array<[number, number]> = [];
  defaultTextRegex.lastIndex = 0;

  let m: RegExpExecArray | null;
  while ((m = defaultTextRegex.exec(text))) {
    const start = m.index ?? 0;
    const prevChar = start > 0 ? text[start - 1] : '';
    if (prevChar && boundaryCharRegex.test(prevChar)) {
      continue;
    }

    const isClosingTag = prevChar === '<' && text[start] === '/';
    if (isClosingTag) {
      continue;
    }

    const end = start + m[0].length;
    ranges.push([start, end]);
  }

  return ranges;
};

type ShortenedRange = { from: number; to: number };

interface IShortenerState {
  deco: DecorationSet;
  expanded: ShortenedRange[];
}

const isExpandedRange = (ranges: ShortenedRange[], from: number, to: number) => {
  return ranges.some((range) => range.from === from && range.to === to);
};

const addExpandedRange = (ranges: ShortenedRange[], from: number, to: number): ShortenedRange[] => {
  if (isExpandedRange(ranges, from, to)) {
    return ranges;
  }
  return [...ranges, { from, to }];
};

const selectionOverlapsRange = (selFrom: number, selTo: number, from: number, to: number) => {
  return selFrom <= to && selTo >= from;
};

const collectSelectionExpandedRanges = (
  state: EditorState,
  expanded: ShortenedRange[],
  options: ITextShortenerOptions,
): ShortenedRange[] => {
  const selection = state.selection.main;
  if (selection.empty && selection.from === 0 && selection.to === 0) {
    return expanded;
  }

  let nextExpanded = expanded;

  for (let i = 1; i <= state.doc.lines; i++) {
    const line = state.doc.line(i);
    const text = line.text;
    defaultTextRegex.lastIndex = 0;
    const ranges =
      options.findTexts?.({
        state,
        lineText: text,
        lineNumber: line.number,
        lineFrom: line.from,
        lineTo: line.to,
        defaultTextRegex,
      }) ?? findDefaultTextRanges(text);

    for (const range of ranges) {
      if (!range) continue;

      const [relativeFrom, relativeTo] = range;
      if (
        typeof relativeFrom !== 'number' ||
        typeof relativeTo !== 'number' ||
        relativeFrom < 0 ||
        relativeTo <= relativeFrom ||
        relativeFrom >= text.length ||
        relativeTo > text.length
      ) {
        continue;
      }

      const raw = text.slice(relativeFrom, relativeTo);
      if (!raw || raw.length <= options.maxLength) {
        continue;
      }

      const from = line.from + relativeFrom;
      const to = line.from + relativeTo;
      if (selectionOverlapsRange(selection.from, selection.to, from, to)) {
        nextExpanded = addExpandedRange(nextExpanded, from, to);
      }
    }
  }

  return nextExpanded;
};

const HOVER_COLLAPSE_DELAY_MS = 120;

const shouldKeepRangeExpanded = (
  view: EditorView,
  expanded: ShortenedRange[],
  event: MouseEvent,
): boolean => {
  if ((event.target as Element | null)?.closest('.cm-short-text')) {
    return true;
  }

  const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
  const selection = view.state.selection.main;

  return expanded.some(({ from, to }) => {
    if (pos != null && pos >= from && pos <= to) {
      return true;
    }
    return selectionOverlapsRange(selection.from, selection.to, from, to);
  });
};

export const createTextShortener = (options: ITextShortenerOptions): Extension => {
  const shortenText = options.shortenText || (() => '...');

  const toggleShortTextEffect = StateEffect.define<ShortenedRange & { expand: boolean }>();
  const collapseShortTextEffect = StateEffect.define<void>();

  const shorten = (state: EditorState, expanded: ShortenedRange[]) => {
    const builder = new RangeSetBuilder<Decoration>();
    const nextExpanded: ShortenedRange[] = [];

    for (let i = 1; i <= state.doc.lines; i++) {
      const line = state.doc.line(i);
      const text = line.text;

      defaultTextRegex.lastIndex = 0;
      const ranges =
        options.findTexts?.({
          state,
          lineText: text,
          lineNumber: line.number,
          lineFrom: line.from,
          lineTo: line.to,
          defaultTextRegex,
        }) ?? findDefaultTextRanges(text);

      for (const range of ranges) {
        if (!range) continue;

        const [relativeFrom, relativeTo] = range;
        if (
          typeof relativeFrom !== 'number' ||
          typeof relativeTo !== 'number' ||
          relativeFrom < 0 ||
          relativeTo <= relativeFrom ||
          relativeFrom >= text.length ||
          relativeTo > text.length
        ) {
          continue;
        }

        const raw = text.slice(relativeFrom, relativeTo);
        if (!raw || raw.length <= options.maxLength) {
          continue;
        }

        const from = line.from + relativeFrom;
        const to = line.from + relativeTo;

        if (isExpandedRange(expanded, from, to)) {
          nextExpanded.push({ from, to });
          continue;
        }

        const short = shortenText(raw);
        builder.add(
          from,
          to,
          Decoration.replace({ widget: new ShortTextWidget(short, raw, from, to) }),
        );
      }
    }

    return { deco: builder.finish(), expanded: nextExpanded };
  };

  class ShortTextWidget extends WidgetType {
    constructor(
      readonly short: string,
      private readonly raw: string,
      private readonly from: number,
      private readonly to: number,
    ) {
      super();
    }

    toDOM(view: EditorView): HTMLElement {
      const span = document.createElement('span');
      span.textContent = this.short;
      span.className = 'cm-short-text';
      span.title = this.raw;
      span.style.display = 'inline';
      span.style.textDecoration = 'underline';
      span.addEventListener('mouseenter', () => {
        view.dispatch({
          effects: toggleShortTextEffect.of({
            from: this.from,
            to: this.to,
            expand: true,
          }),
        });
      });
      return span;
    }

    ignoreEvent() {
      return false;
    }

    eq(other: ShortTextWidget) {
      return (
        this.short === other.short &&
        this.raw === other.raw &&
        this.from === other.from &&
        this.to === other.to
      );
    }
  }

  const shortenerField = StateField.define<IShortenerState>({
    create(state) {
      return shorten(state, []);
    },

    update(value, tr) {
      let expanded = value.expanded;

      if (tr.docChanged && expanded.length) {
        expanded = expanded
          .map(({ from, to }) => ({
            from: tr.changes.mapPos(from, 1),
            to: tr.changes.mapPos(to, -1),
          }))
          .filter(({ from, to }) => from < to);
      }

      let expandedChanged = expanded !== value.expanded;

      for (const effect of tr.effects) {
        if (effect.is(toggleShortTextEffect)) {
          if (effect.value.expand) {
            expanded = addExpandedRange(expanded, effect.value.from, effect.value.to);
          } else {
            expanded = expanded.filter(
              ({ from, to }) => from !== effect.value.from || to !== effect.value.to,
            );
          }
        } else if (effect.is(collapseShortTextEffect)) {
          if (expanded.length > 0) {
            expanded = [];
          }
        }
      }

      if (tr.selection) {
        const selectionExpanded = collectSelectionExpandedRanges(tr.state, expanded, options);
        if (selectionExpanded !== expanded) {
          expanded = selectionExpanded;
        }
      }

      if (!expandedChanged && expanded !== value.expanded) {
        expandedChanged = true;
      }

      if (tr.docChanged || tr.selection || expandedChanged) {
        const result = shorten(tr.state, expanded);
        return result;
      }

      return value;
    },

    provide: (field) => EditorView.decorations.compute([field], (state) => state.field(field).deco),
  });

  const hoverCollapsePlugin = ViewPlugin.fromClass(
    class {
      private leaveTimer: ReturnType<typeof setTimeout> | null = null;

      constructor(readonly view: EditorView) {}

      destroy() {
        if (this.leaveTimer) {
          clearTimeout(this.leaveTimer);
        }
      }

      scheduleCollapseCheck(event: MouseEvent) {
        if (this.leaveTimer) {
          clearTimeout(this.leaveTimer);
        }
        this.leaveTimer = setTimeout(() => {
          this.leaveTimer = null;
          const field = this.view.state.field(shortenerField, false);
          if (!field?.expanded.length) {
            return;
          }
          if (shouldKeepRangeExpanded(this.view, field.expanded, event)) {
            return;
          }
          this.view.dispatch({ effects: collapseShortTextEffect.of(undefined) });
        }, HOVER_COLLAPSE_DELAY_MS);
      }
    },
    {
      eventHandlers: {
        mousemove(event) {
          this.scheduleCollapseCheck(event);
        },
        mouseleave(event) {
          this.scheduleCollapseCheck(event);
        },
      },
    },
  );

  return [shortenerField, hoverCollapsePlugin];
};

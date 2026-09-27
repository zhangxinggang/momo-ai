import { Extension } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { isDiagramLang } from './CodeBlock';

/** Delete rendered diagrams as whole nodes before the default code-block join commands. */
export const DiagramDeletion = Extension.create({
  name: 'diagramDeletion',
  priority: 1000,
  addKeyboardShortcuts() {
    const remove = (backward: boolean) => {
      const { state, view } = this.editor;
      const { selection } = state;
      const isDiagram = (node: typeof state.doc | null) =>
        node?.type.name === 'codeBlock' && isDiagramLang(node.attrs.language);
      const { $from, $to } = selection;
      let from: number;
      let to: number;
      if (selection instanceof NodeSelection && isDiagram(selection.node)) {
        from = selection.from;
        to = selection.to;
      } else if (isDiagram($from.parent) && $from.sameParent($to)) {
        from = $from.before();
        to = $from.after();
      } else {
        if (!selection.empty || !$from.parent.isTextblock) return false;
        if (
          backward ? $from.parentOffset !== 0 : $from.parentOffset !== $from.parent.content.size
        ) {
          return false;
        }
        const boundary = backward ? $from.before() : $from.after();
        const resolved = state.doc.resolve(boundary);
        const adjacent = backward ? resolved.nodeBefore : resolved.nodeAfter;
        if (!adjacent || !isDiagram(adjacent)) return false;
        from = backward ? boundary - adjacent.nodeSize : boundary;
        to = from + adjacent.nodeSize;
      }
      view.dispatch(state.tr.delete(from, to).scrollIntoView());
      return true;
    };
    return { Backspace: () => remove(true), Delete: () => remove(false) };
  },
});

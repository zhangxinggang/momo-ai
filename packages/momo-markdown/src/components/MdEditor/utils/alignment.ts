export type TextAlignment = 'left' | 'center' | 'right';

export const isTextAlignment = (value: unknown): value is TextAlignment =>
  value === 'left' || value === 'center' || value === 'right';

/** Alignment wrappers keep their contents as Markdown, including diagrams and formulas. */
export const alignmentOpening = (alignment: TextAlignment) =>
  `<div data-align="${alignment}" style="text-align: ${alignment};">\n\n`;

export const alignmentClosing = '\n\n</div>';

export function readTextAlignment(element: HTMLElement, fallback: TextAlignment | null = null) {
  let current: HTMLElement | null = element;
  while (current) {
    const alignment = current.getAttribute('data-align') || current.style.textAlign;
    if (isTextAlignment(alignment)) return alignment;
    current = current.parentElement;
  }
  return fallback;
}

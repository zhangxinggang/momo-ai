export interface IChatMentionTextareaRef {
  focus: () => void;
  getSelectionStart: () => number;
  setSelectionStart: (next: number) => void;
  getEditableElement: () => HTMLElement | null;
}

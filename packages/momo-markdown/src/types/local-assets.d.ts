declare module '*?url' {
  const url: string;
  export default url;
}

declare module 'cropperjs/dist/cropper.css';

declare module '@plantuml/core' {
  export function renderToString(
    lines: string[],
    onSuccess: (svg: string) => void,
    onError: (message: string) => void,
  ): void;
}

declare var PLANTUML_STDLIB_LOADER:
  | ((name: string, onLoad: () => void, onError: (message: string) => void) => boolean)
  | undefined;

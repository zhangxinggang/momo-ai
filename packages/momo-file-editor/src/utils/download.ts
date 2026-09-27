/** Download original bytes without passing through a text decoder. */
export function downloadFileBuffer(
  buffer: ArrayBuffer,
  name: string,
  mimeType = 'application/octet-stream',
) {
  const url = URL.createObjectURL(new Blob([buffer], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name.split(/[/\\]/).pop() || 'download';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

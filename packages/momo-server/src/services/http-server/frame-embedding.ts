/** Explicitly configured hosts may embed the local service, including file:// desktop pages. */
export function createFrameEmbeddingMiddleware(frameAncestors?: readonly string[]) {
  return async (
    ctx: { remove: (name: string) => void; set: (name: string, value: string) => void },
    next: () => Promise<unknown>,
  ) => {
    if (frameAncestors?.length) {
      ctx.remove('X-Frame-Options');
      ctx.set('Content-Security-Policy', `frame-ancestors ${frameAncestors.join(' ')}`);
    }
    await next();
  };
}

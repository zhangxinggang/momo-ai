import cors from 'koa2-cors';

type Headers = Record<string, string | number | string[] | undefined>;

/** Koa clears response headers on errors, so retain the existing CORS policy on failures. */
export function createCorsMiddleware() {
  const middleware = cors();
  return async (ctx: { response: { headers: Headers } }, next: () => Promise<unknown>) => {
    try {
      await middleware(ctx, next);
    } catch (cause) {
      const error = (cause instanceof Error ? cause : new Error(String(cause))) as Error & {
        headers?: Headers;
      };
      const corsHeaders = Object.fromEntries(
        Object.entries(ctx.response.headers).filter(([name]) => {
          const normalized = name.toLowerCase();
          return normalized === 'vary' || normalized.startsWith('access-control-');
        }),
      );
      error.headers = { ...error.headers, ...corsHeaders };
      throw error;
    }
  };
}

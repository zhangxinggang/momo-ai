/** JWT 载荷 */
export type IJwtPayload = Record<string, unknown>;

export type TNextFn = () => Promise<void>;

/** 与 Koa 兼容的鉴权上下文 */
export interface IKoaLikeContext {
  request: {
    url: string;
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  };
  headers: Record<string, string | string[] | undefined>;
  cookies: {
    get: (name: string) => string | undefined;
  };
  session?: {
    userInfo?: IJwtPayload | string;
    [key: string]: unknown;
  };
  throw: (status: number, error: Error) => never;
}

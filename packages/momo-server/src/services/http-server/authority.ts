import jwt from 'jsonwebtoken';
import picomatch from 'picomatch';
import type { IJwtPayload, IKoaLikeContext, TNextFn } from '../../types/http-server/authority';
import { getCookies } from './cookies';
const NKGlobal = global.NKGlobal;
const getToken = (payload: IJwtPayload, options: jwt.SignOptions = {}): string => {
  const security = NKGlobal.config.services.httpServer.security;
  const signOptions: jwt.SignOptions = Object.assign(
    { expiresIn: security.tokenExpiresIn },
    options,
  );
  return jwt.sign(payload, security.secret, signOptions);
};

const getTempToken = (): string => {
  const security = NKGlobal.config.services.httpServer.security;
  return jwt.sign({ isTemp: true }, security.secret, { expiresIn: '60s' });
};

const verifyToken = async (ctx: IKoaLikeContext, next: TNextFn): Promise<void> => {
  const httpServer = NKGlobal.config.services.httpServer;
  const reqUrl = ctx.request.url;
  const security = httpServer.security;
  const noAuth = security.noAuthorityRoutes.some((item: string) => picomatch.isMatch(reqUrl, item));

  if (noAuth) {
    await next();
    return;
  }
  const cookies = getCookies();
  const headerToken = ctx.headers[cookies.token];
  const tokenFromHeader = Array.isArray(headerToken) ? headerToken[0] : headerToken;
  const token =
    (ctx.request.body?.access_token as string | undefined) ||
    (ctx.request.query?.access_token as string | undefined) ||
    tokenFromHeader ||
    ctx.cookies.get(cookies.token);

  if (!token) {
    ctx.throw(403, new Error('No token provider!'));
  }

  try {
    const payload = await jwt.verify(token, security.secret);
    if (!ctx.session) {
      ctx.session = {};
    }
    if (!ctx.session.userInfo) {
      ctx.session.userInfo = payload as IJwtPayload | string;
    }
    await next();
  } catch (_err) {
    ctx.throw(403, new Error('Token error!'));
  }
};

export default {
  getToken,
  getTempToken,
  verifyToken,
};

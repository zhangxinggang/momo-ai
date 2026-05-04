const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';
const isDev = process.env.NODE_ENV === 'development';

export { isDev, isMac, isWin };

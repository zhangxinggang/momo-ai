/**
 * Packaged Electron application entry.
 *
 * `src/main/index.ts` is a reusable module and only exports `init`. Electron
 * does not invoke a module's default export, so the packaged app needs this
 * small executable entry to create its BrowserWindow in the main process.
 */
import { init } from '../index';

void init({});

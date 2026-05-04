/**
 * electron:dev 主进程入口：从 dist/src 加载并调用包导出的 init。
 */
import { init } from '../index';

void init({});

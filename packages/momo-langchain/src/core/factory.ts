import { ELoaderKind, ESplitterKind } from '../constants';
import type { ILoaderAdapter, IPdfLoaderInput } from '../types/loader';
import type { ISplitterAdapter } from '../types/splitter';
import { KindRegistry } from './registry';

const loaderRegistry = new KindRegistry<ELoaderKind, ILoaderAdapter<unknown>>();
const splitterRegistry = new KindRegistry<ESplitterKind, ISplitterAdapter>();

/** 注册 loader 工厂（模块初始化时调用） */
export function registerLoader(kind: ELoaderKind, factory: () => ILoaderAdapter<unknown>): void {
  loaderRegistry.register(kind, factory);
}

/** 注册 splitter 工厂（模块初始化时调用） */
export function registerSplitter(kind: ESplitterKind, factory: () => ISplitterAdapter): void {
  splitterRegistry.register(kind, factory);
}

/** 按 kind 创建 loader */
export function createLoader(kind: ELoaderKind.EPdf): ILoaderAdapter<IPdfLoaderInput>;
export function createLoader(kind: ELoaderKind): ILoaderAdapter<unknown> {
  return loaderRegistry.create(kind);
}

/** 按 kind 创建 splitter */
export function createSplitter(kind: ESplitterKind): ISplitterAdapter {
  return splitterRegistry.create(kind);
}

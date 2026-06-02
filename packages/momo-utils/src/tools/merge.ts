import { mergeWith } from 'lodash-es';

/**
 * 深度合并：数组直接拼接，不按索引逐项合并
 */
function concatArrayCustomizer(objValue: unknown, srcValue: unknown): unknown | undefined {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return objValue.concat(srcValue);
  }
  return undefined;
}

export function mergeDeep<T>(target: T, source: unknown): T {
  return mergeWith(target, source, concatArrayCustomizer) as T;
}

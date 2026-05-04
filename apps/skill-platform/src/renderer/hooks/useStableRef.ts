import { useRef } from 'react';

/** 保持 ref 始终指向最新值，供 stream 回调等闭包安全读取 */
export function useStableRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

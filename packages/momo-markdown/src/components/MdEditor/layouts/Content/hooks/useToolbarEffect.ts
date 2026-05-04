import { useRef } from 'react';
import { TToolbarNames } from '~/type';

const arraysEqual = (prev: TToolbarNames[], curr: TToolbarNames[]) => {
  if (prev === curr) return true;
  if (prev.length !== curr.length) return false;
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== curr[i]) return false;
  }
  return true;
};

export const useToolbarEffect = (effect: React.EffectCallback, deps: TToolbarNames[]) => {
  const prev = useRef<TToolbarNames[]>([]);

  if (!prev.current || !arraysEqual(prev.current, deps)) {
    prev.current = deps;
    effect();
  }
};

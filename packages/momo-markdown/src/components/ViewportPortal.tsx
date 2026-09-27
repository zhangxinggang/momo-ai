import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Move the same portal host to the viewport without remounting its editor. */
export function ViewportPortal({ active, children }: { active: boolean; children: ReactNode }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [host] = useState(() => {
    if (typeof document === 'undefined') return null;
    const element = document.createElement('div');
    element.style.display = 'contents';
    return element;
  });

  useLayoutEffect(() => {
    const parent = (active ? document.body : anchorRef.current) as
      | (HTMLElement & { moveBefore?: (node: Node, child: Node | null) => void })
      | null;
    if (!host || !parent || host.parentElement === parent) return;
    // Chromium's atomic move preserves iframe state and focus as well as React state.
    if (host.isConnected && parent.isConnected && parent.moveBefore) parent.moveBefore(host, null);
    else parent.appendChild(host);
  }, [active, host]);

  useLayoutEffect(() => () => host?.remove(), [host]);

  return (
    <>
      <div ref={anchorRef} style={{ display: 'contents' }} />
      {host ? createPortal(children, host) : children}
    </>
  );
}

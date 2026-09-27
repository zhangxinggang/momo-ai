import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import styles from './index.module.less';

/** Hidden tabs and layout transitions can report a zero-size chart container. */
export function MeasuredChart({ children, height }: { children: ReactNode; height?: unknown }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const minHeight =
    typeof height === 'number' && Number.isFinite(height) && height > 0 ? height : 300;

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const { width, height: measuredHeight } = element.getBoundingClientRect();
      setVisible(width > 0 && measuredHeight > 0);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={styles.chartFrame} style={{ minHeight }}>
      {visible ? children : null}
    </div>
  );
}

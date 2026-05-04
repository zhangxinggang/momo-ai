import { LoadingOutlined } from '@ant-design/icons';
import { BrainIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';

export interface IProps {
  content: string | null;
  isLoading?: boolean;
  defaultExpanded?: boolean;
  className?: string;
  /** \u6807\u9898\u6587\u6848\uff0c\u9ed8\u8ba4\u300c\u601d\u8003\u8fc7\u7a0b\u300d */
  title?: string;
}

/** \u53ef\u6298\u53e0\u7684\u601d\u8003\u8fc7\u7a0b\u5c55\u793a */
export function CollapsibleThinking({
  content,
  isLoading = false,
  defaultExpanded = false,
  className = '',
  title = '\u601d\u8003\u8fc7\u7a0b',
}: IProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevContentLength = useRef(0);

  useEffect(() => {
    if (isExpanded && contentRef.current && content && content.length > prevContentLength.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
    prevContentLength.current = content?.length || 0;
  }, [content, isExpanded]);

  useEffect(() => {
    if (isLoading) {
      setIsExpanded(true);
    }
  }, [isLoading]);

  if (content === null && !isLoading) {
    return null;
  }

  const hasContent = Boolean(content && content.length > 0);

  return (
    <div className={`${styles.thinking} ${className}`.trim()}>
      <button
        type='button'
        onClick={() => setIsExpanded((prev) => !prev)}
        className={styles['thinking-header']}
        aria-expanded={isExpanded}>
        <span className={styles['thinking-header-icon']}>
          {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        </span>
        <span
          className={`${styles['thinking-header-icon']} ${isLoading ? styles['thinking-header-icon--loading'] : ''}`.trim()}>
          <BrainIcon size={16} className={isLoading ? 'animate-pulse' : undefined} />
        </span>
        <span className={styles['thinking-title']}>{title}</span>
        {isLoading ? <LoadingOutlined className={styles['thinking-header-icon--loading']} /> : null}
        {hasContent ? (
          <span className={styles['thinking-count']}>{content!.length} chars</span>
        ) : null}
      </button>

      <div
        className={`${styles['thinking-body']} ${
          isExpanded ? styles['thinking-body--expanded'] : styles['thinking-body--collapsed']
        }`.trim()}>
        <div ref={contentRef} className={styles['thinking-content']}>
          {hasContent ? content : ''}
        </div>
      </div>
    </div>
  );
}

export default CollapsibleThinking;

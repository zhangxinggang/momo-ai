import { MarkdownPreview } from '@renderer/components/ui/MarkdownPreview';
import { preprocessGitHubMarkdown } from '@renderer/services/skill/detail-utils';
import { useMemo } from 'react';

interface IProps {
  content: string;
  sourceUrl?: string;
  contentUrl?: string;
  enableHighlight?: boolean;
  className?: string;
}

export function SkillMarkdown({ content, sourceUrl, contentUrl, className }: IProps) {
  const resolvedContent = useMemo(
    () => preprocessGitHubMarkdown(content, sourceUrl, contentUrl),
    [content, contentUrl, sourceUrl],
  );

  return <MarkdownPreview value={resolvedContent} className={className} />;
}

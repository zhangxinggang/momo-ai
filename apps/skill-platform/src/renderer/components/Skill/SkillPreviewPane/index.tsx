import type { ISkill } from '@/types/modules';
import { renderImmersiveSegments, stripFrontmatter } from '@renderer/services/skill/detail-utils';
import { normalizeStringArray } from '@renderer/services/skill/normalize';
import { Button } from 'antd';
import {
  BookOpenIcon,
  CheckIcon,
  CopyIcon,
  GlobeIcon,
  LanguagesIcon,
  Loader2Icon,
  RefreshCwIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import { SkillMarkdown } from '../SkillMarkdown';
import '../SkillMarkdown/index.module.less';
import { SkillRenderBoundary } from '../SkillRenderBoundary';

interface IProps {
  cachedInstructionsTranslation: string | null;
  copyStatus: Record<string, boolean>;
  handleCopy: (text: string, key: string) => void;
  handleTranslateSkill: (forceRefresh?: boolean) => void;
  hasStaleTranslation: boolean;
  isTranslating: boolean;
  resolvedDescription: string;
  selectedSkill: ISkill;
  showTranslation: boolean;
  skillContent: string;
  translationMode: 'immersive' | 'full';
}

export function SkillPreviewPane({
  cachedInstructionsTranslation,
  copyStatus,
  handleCopy,
  handleTranslateSkill,
  hasStaleTranslation,
  isTranslating,
  resolvedDescription,
  selectedSkill,
  showTranslation,
  skillContent,

  translationMode,
}: IProps) {
  const visibleTags = useMemo(
    () => normalizeStringArray(selectedSkill.tags).slice(0, 4),
    [selectedSkill.tags],
  );
  const safeCategory =
    typeof selectedSkill.category === 'string' ? selectedSkill.category : undefined;
  const safeAuthor = typeof selectedSkill.author === 'string' ? selectedSkill.author : undefined;
  const visibleSkillContent = useMemo(() => stripFrontmatter(skillContent), [skillContent]);
  const visibleTranslatedContent = useMemo(
    () => (cachedInstructionsTranslation ? stripFrontmatter(cachedInstructionsTranslation) : null),
    [cachedInstructionsTranslation],
  );

  return (
    <div className='flex h-full min-h-0 flex-col space-y-6 overflow-hidden lg:col-span-2'>
      <section className='shrink-0 space-y-4'>
        <h3 className='text-muted-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]'>
          {'技能描述'}
        </h3>
        <div className='app-wallpaper-panel border-border space-y-4 rounded-2xl border p-5'>
          <p className='text-foreground/90 text-sm leading-relaxed'>
            {resolvedDescription || '这是一个 AI 代理技能，包含执行特定任务的指令和配置。'}
          </p>

          <div className='flex flex-wrap gap-2'>
            {safeAuthor && (
              <span className='bg-accent text-foreground/80 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium'>
                <GlobeIcon className='text-muted-foreground h-3 w-3' />
                {safeAuthor}
              </span>
            )}
            {safeCategory && (
              <span className='bg-accent rounded-full px-2 py-1 text-xs font-medium capitalize'>
                {safeCategory}
              </span>
            )}
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className='bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium'>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className='flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden'>
        <div className='flex items-center justify-between'>
          <h3 className='text-muted-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]'>
            {'技能内容'}
          </h3>
          <div className='flex gap-2'>
            {skillContent.trim() && (
              <div className='flex gap-2'>
                <Button
                  size='small'
                  onClick={() => handleTranslateSkill(false)}
                  disabled={isTranslating}
                  icon={
                    isTranslating ? (
                      <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
                    ) : (
                      <LanguagesIcon className='h-3.5 w-3.5' />
                    )
                  }
                  className={`flex items-center gap-1.5 rounded-lg px-3 text-xs ${
                    showTranslation && cachedInstructionsTranslation
                      ? 'bg-primary/10 text-primary'
                      : 'bg-accent/50 hover:bg-accent'
                  }`}>
                  {isTranslating
                    ? '翻译中...'
                    : showTranslation && cachedInstructionsTranslation
                      ? '显示原文'
                      : cachedInstructionsTranslation
                        ? '显示译文'
                        : 'AI 翻译'}
                </Button>
                {cachedInstructionsTranslation && (
                  <Button
                    size='small'
                    onClick={() => handleTranslateSkill(true)}
                    disabled={isTranslating}
                    icon={
                      <RefreshCwIcon
                        className={`h-3.5 w-3.5 ${isTranslating ? 'animate-spin' : ''}`}
                      />
                    }
                    className='bg-accent/50 hover:bg-accent rounded-lg px-3 text-xs'
                    title={'刷新翻译'}>
                    {'刷新翻译'}
                  </Button>
                )}
                {hasStaleTranslation && !visibleTranslatedContent && (
                  <span className='inline-flex items-center rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300'>
                    {'已保存翻译需要刷新'}
                  </span>
                )}
              </div>
            )}
            <Button
              size='small'
              onClick={() => handleCopy(skillContent, 'instr')}
              className='bg-accent/50 hover:bg-accent flex items-center gap-1.5 rounded-lg px-3 text-xs'>
              {copyStatus.instr ? (
                <CheckIcon className='h-3.5 w-3.5 text-green-500' />
              ) : (
                <CopyIcon className='h-3.5 w-3.5' />
              )}
              {copyStatus.instr ? '已复制' : '复制 MD'}
            </Button>
          </div>
        </div>

        <div className='border-border app-wallpaper-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm'>
          <div className='skill-markdown-body min-h-0 flex-1 overflow-y-auto overscroll-contain p-6'>
            <SkillRenderBoundary
              compact
              resetKey={`${selectedSkill.id}:${selectedSkill.updated_at}:${showTranslation ? 'translated' : 'original'}:${translationMode}`}
              title={'技能预览暂时无法渲染'}
              description={
                '这份 ISkill 的内容或元数据格式存在兼容性问题，但不会再把整个详情页冲白。你可以稍后重试，或切回文件视图继续检查原始内容。'
              }
              secondaryActionLabel={'重试'}>
              {skillContent.trim() ? (
                showTranslation && visibleTranslatedContent ? (
                  translationMode === 'immersive' ? (
                    <div className='markdown-body'>
                      {renderImmersiveSegments(visibleTranslatedContent).map((segment, index) =>
                        segment.type === 'translation' ? (
                          <div
                            key={index}
                            className='border-primary/40 text-primary/70 my-1 border-l-2 pl-3 text-[12px] italic'>
                            <SkillMarkdown content={segment.text} enableHighlight />
                          </div>
                        ) : (
                          <SkillMarkdown
                            key={index}
                            content={segment.text}
                            sourceUrl={selectedSkill.source_url}
                            contentUrl={selectedSkill.content_url}
                            enableHighlight
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <div className='markdown-body'>
                      <SkillMarkdown content={visibleTranslatedContent} enableHighlight />
                    </div>
                  )
                ) : (
                  <div className='markdown-body'>
                    <SkillMarkdown
                      content={visibleSkillContent}
                      sourceUrl={selectedSkill.source_url}
                      contentUrl={selectedSkill.content_url}
                      enableHighlight
                    />
                  </div>
                )
              ) : (
                <div className='flex flex-col items-center justify-center py-16 opacity-30'>
                  <BookOpenIcon className='mb-2 h-12 w-12' />
                  <p>{'暂无指令内容'}</p>
                </div>
              )}
            </SkillRenderBoundary>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { ISkill } from '@/types/modules';
import { getRuntimeCapabilities } from '@renderer/runtime';
import { Button } from 'antd';
import {
  BellDotIcon,
  CheckSquareIcon,
  DownloadIcon,
  MessagesSquare,
  SquareIcon,
  StarIcon,
  TrashIcon,
} from 'lucide-react';
import React from 'react';
import { SkillIcon } from '../SkillIcon';

interface IProps {
  animationDelayMs: number;
  hasStoreUpdate?: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
  onDelete: (skill: ISkill) => void;
  onOpen: (skillId: string) => void;
  onOpenSkillAiChat: (skill: ISkill) => void;
  onQuickInstall: (skill: ISkill) => void;
  onToggleFavorite: (skillId: string) => void;
  onToggleSelection: (skillId: string) => void;
  skill: ISkill;
}

function SkillGalleryCardComponent({
  animationDelayMs,
  hasStoreUpdate = false,
  isSelected,
  isSelectionMode,
  onDelete,
  onOpen,
  onOpenSkillAiChat,
  onQuickInstall,
  onToggleFavorite,
  onToggleSelection,
  skill,
}: IProps) {
  const runtimeCapabilities = getRuntimeCapabilities();

  return (
    <div
      onClick={() => {
        if (isSelectionMode) {
          onToggleSelection(skill.id);
          return;
        }
        onOpen(skill.id);
      }}
      style={{
        animationDelay: `${animationDelayMs}ms`,
        contentVisibility: 'auto',
        containIntrinsicSize: '220px',
      }}
      className={`app-wallpaper-panel animate-in fade-in slide-in-from-bottom-4 group relative cursor-pointer rounded-2xl border p-5 transition-all ${
        isSelectionMode
          ? isSelected
            ? 'border-primary bg-primary/5 shadow-primary/10 shadow-lg'
            : 'border-border hover:border-primary/40'
          : 'border-border hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl'
      }`}>
      {hasStoreUpdate ? (
        <div
          className='absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-600 dark:text-amber-300'
          title={'有可用更新'}>
          <BellDotIcon className='h-3.5 w-3.5 animate-pulse' />
          {'有可用更新'}
        </div>
      ) : null}
      {isSelectionMode && (
        <Button
          type='text'
          onClick={(event) => {
            event.stopPropagation();
            onToggleSelection(skill.id);
          }}
          className={`absolute right-4 top-4 z-10 rounded-lg border p-2 ${
            isSelected
              ? 'border-primary/40 bg-primary/15 text-primary'
              : 'border-border bg-background/80 text-muted-foreground hover:text-foreground'
          }`}
          title={isSelected ? '清空' : '选择'}
          icon={
            isSelected ? (
              <CheckSquareIcon className='h-4 w-4' />
            ) : (
              <SquareIcon className='h-4 w-4' />
            )
          }
        />
      )}

      <div className='mb-4 flex items-start justify-between'>
        <SkillIcon
          iconUrl={skill.icon_url}
          iconEmoji={skill.icon_emoji}
          backgroundColor={skill.icon_background}
          name={skill.name}
          size='lg'
          className='transition-transform group-hover:scale-110 group-hover:shadow-lg'
        />
        {!isSelectionMode && (
          <div className='flex gap-1'>
            <Button
              type='text'
              onClick={(event) => {
                event.stopPropagation();
                onOpenSkillAiChat(skill);
              }}
              className='text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg p-2 opacity-0 active:scale-90 group-hover:opacity-100'
              title={'AI 对话'}
              icon={<MessagesSquare className='h-4 w-4' />}
            />
            {runtimeCapabilities.skillPlatformIntegration && (
              <Button
                type='text'
                onClick={(event) => {
                  event.stopPropagation();
                  onQuickInstall(skill);
                }}
                className='text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg p-2 opacity-0 active:scale-90 group-hover:opacity-100'
                title={'安装到平台'}
                icon={<DownloadIcon className='h-4 w-4' />}
              />
            )}
            <Button
              type='text'
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(skill.id);
              }}
              className={`rounded-lg p-2 active:scale-90 ${
                skill.is_favorite
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-muted-foreground opacity-0 hover:bg-yellow-500/10 hover:text-yellow-500 group-hover:opacity-100'
              }`}
              title={skill.is_favorite ? '取消收藏' : '添加收藏'}
              icon={<StarIcon className={`h-4 w-4 ${skill.is_favorite ? 'fill-current' : ''}`} />}
            />
            <Button
              type='text'
              danger
              onClick={(event) => {
                event.stopPropagation();
                onDelete(skill);
              }}
              className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg p-2 opacity-0 active:scale-90 group-hover:opacity-100'
              title={'删除'}
              icon={<TrashIcon className='h-4 w-4' />}
            />
          </div>
        )}
      </div>

      <h3
        className='text-foreground group-hover:text-primary mb-2 line-clamp-1 text-lg font-bold transition-colors'
        title={skill.name}>
        {skill.name}
      </h3>
      <p className='text-muted-foreground mb-4 line-clamp-2 h-10 text-sm italic leading-relaxed opacity-80'>
        {skill.description || '技能描述，帮助 AI 理解何时使用此技能'}
      </p>
    </div>
  );
}

export const SkillGalleryCard = React.memo(SkillGalleryCardComponent);

import { SkillTagSelect } from '../SkillTagSelect';
import type { IProps } from './types';

export function SkillTagEditor({
  value,
  options,
  label = '标签（可选）',
  placeholder,
  disabled,
  compact = false,
  bordered = false,
  size,
  className,
  onChange,
  onClick,
}: IProps) {
  const selectSize = size ?? (compact ? 'small' : undefined);
  const content = (
    <div className={className}>
      {label ? (
        <label
          className={
            compact
              ? 'text-foreground mb-1.5 block text-[11px] font-medium'
              : 'text-foreground mb-2 block text-sm font-medium'
          }>
          {label}
        </label>
      ) : null}
      <SkillTagSelect
        disabled={disabled}
        options={options}
        placeholder={placeholder}
        size={selectSize}
        value={value}
        onChange={onChange}
        onClick={onClick}
      />
    </div>
  );

  if (!bordered) {
    return content;
  }

  return (
    <div className='border-border bg-accent/20 space-y-2 rounded-xl border p-3'>{content}</div>
  );
}

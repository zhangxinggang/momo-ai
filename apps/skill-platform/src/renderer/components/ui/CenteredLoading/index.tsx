interface IProps {
  label?: string;
  className?: string;
}

/** 在父容器内垂直水平居中显示加载状态（父级需有高度，如 absolute inset-0 或 flex-1） */
export function CenteredLoading({ label = '加载中…', className = '' }: IProps) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${className}`.trim()}
      role='status'
      aria-live='polite'
      aria-busy='true'>
      <div className='text-muted-foreground flex flex-col items-center gap-3'>
        <div
          className='border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent'
          aria-hidden
        />
        {label ? <span className='text-sm'>{label}</span> : null}
      </div>
    </div>
  );
}

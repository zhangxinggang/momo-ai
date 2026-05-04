import { Button } from 'antd';
import { memo, type ReactNode } from 'react';

export interface IProps {
  icon: ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}

/** 侧栏导航项 */
export const NavItem = memo(function NavItem({
  icon,
  label,
  count,
  active,
  onClick,
  collapsed,
}: IProps) {
  return (
    <div className='w-full py-0.5'>
      <Button
        block={!collapsed}
        type={active ? 'primary' : 'text'}
        onClick={onClick}
        title={label}
        className={`group relative !flex !h-auto !flex-nowrap rounded-lg transition-all duration-300 ${collapsed ? '!h-10 !w-10 !justify-center !px-0' : '!w-full !items-center !justify-start !gap-3 !px-3 !py-2'} ${
          active
            ? 'bg-primary text-white shadow-sm'
            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
        } `}>
        <span
          className={`flex shrink-0 items-center justify-center transition-transform duration-300 ${collapsed ? 'h-5 w-5 group-hover:scale-110' : 'h-4 w-4'}`}>
          {icon}
        </span>
        {!collapsed && (
          <span className='flex min-w-0 flex-1 items-center gap-2 overflow-hidden'>
            <span className='min-w-0 flex-1 truncate text-left text-sm leading-none'>{label}</span>
            {count !== undefined && (
              <span className='bg-sidebar-accent/80 text-sidebar-foreground/50 flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full border border-white/5 px-1 text-[10px] tabular-nums leading-none'>
                {count}
              </span>
            )}
          </span>
        )}
      </Button>
    </div>
  );
});

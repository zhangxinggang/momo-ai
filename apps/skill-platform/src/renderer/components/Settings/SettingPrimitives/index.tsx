import { Input, Switch } from 'antd';
import type { ReactNode } from 'react';
import { memo } from 'react';

// Settings section component - flattened design
// 设置区块组件 - 扁平化设计
export function SettingSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className='relative'>
      <h3 className='text-muted-foreground mb-2 text-sm font-medium'>{title}</h3>
      <div className='app-settings-card'>{children}</div>
    </div>
  );
}

// Settings item component
// 设置项组件
export function SettingItem({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className='border-border/70 hover:bg-muted/20 flex items-center justify-between border-b px-4 py-3 transition-colors last:border-0'>
      <div>
        <div className='text-sm font-medium'>{label}</div>
        {description && <div className='text-muted-foreground mt-0.5 text-xs'>{description}</div>}
      </div>
      {children}
    </div>
  );
}

// Toggle switch component
// 开关组件
interface IProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
}

export function ToggleSwitch({ checked, onChange, defaultChecked = false }: IProps) {
  return <Switch checked={checked} defaultChecked={defaultChecked} onChange={onChange} />;
}

// Reusable password input component - wrapped with React.memo for performance
// 可复用的密码输入组件 - 使用 React.memo 包装以提升性能
export const PasswordInput = memo(function PasswordInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Input.Password
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`app-settings-input placeholder:text-muted-foreground/60 h-10 w-full rounded-lg text-sm ${className}`}
    />
  );
});

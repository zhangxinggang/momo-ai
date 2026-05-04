import { Button } from 'antd';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import React, { type ReactNode } from 'react';

interface IProps {
  children: ReactNode;
  resetKey?: string | number | null;
  compact?: boolean;
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

interface ISkillRenderBoundaryState {
  hasError: boolean;
}

export class SkillRenderBoundary extends React.Component<IProps, ISkillRenderBoundaryState> {
  state: ISkillRenderBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ISkillRenderBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ISkill render failed:', error);
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  private resetBoundary = (callback?: () => void) => {
    this.setState({ hasError: false }, () => {
      callback?.();
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const compact = this.props.compact ?? false;

    return (
      <div
        className={`border-border app-wallpaper-surface/80 flex flex-col items-center justify-center rounded-2xl border text-center ${
          compact ? 'min-h-[220px] px-6 py-10' : 'h-full min-h-[360px] px-8 py-12'
        }`}>
        <div className='mb-4 rounded-full bg-red-500/10 p-3 text-red-500'>
          <AlertTriangleIcon className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
        </div>
        <div className='text-foreground text-base font-semibold'>{this.props.title}</div>
        <p className='text-muted-foreground mt-2 max-w-md text-sm leading-6'>
          {this.props.description}
        </p>
        <div className='mt-5 flex flex-wrap items-center justify-center gap-3'>
          {this.props.primaryActionLabel ? (
            <Button
              onClick={() => this.resetBoundary(this.props.onPrimaryAction)}
              className='border-border bg-background text-foreground hover:bg-accent inline-flex h-auto items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium'>
              {this.props.primaryActionLabel}
            </Button>
          ) : null}
          {this.props.secondaryActionLabel ? (
            <Button
              type='primary'
              onClick={() => this.resetBoundary(this.props.onSecondaryAction)}
              icon={<RefreshCwIcon className='h-4 w-4' />}
              className='inline-flex h-auto items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium'>
              {this.props.secondaryActionLabel}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
}

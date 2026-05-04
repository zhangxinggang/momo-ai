import { Button } from 'antd';
import { Component, type ErrorInfo, type ReactNode } from 'react';

import styles from './index.module.less';

interface IProps {
  children: ReactNode;
}

interface IChatErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/** 捕获 AI 对话模块运行时错误，避免整页白屏 */
export class ChatErrorBoundary extends Component<IProps, IChatErrorBoundaryState> {
  constructor(props: IProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): IChatErrorBoundaryState {
    return { hasError: true, message: error.message || '未知错误' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ChatErrorBoundary]', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles['chat-error-boundary']}>
          <p className={styles['chat-error-boundary-title']}>AI 对话加载失败</p>
          <p className={styles['chat-error-boundary-message']}>{this.state.message}</p>
          <Button type='primary' onClick={this.handleRetry}>
            重试
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { Button, Modal, type ModalProps } from 'antd';
import type { ReactNode } from 'react';

import styles from './index.module.less';

export const FULLSCREEN_MODAL_WIDTH = '100vw';

export const fullscreenModalStyles = {
  wrapper: { padding: 0, margin: 0 },
  header: {
    flexShrink: 0,
    marginBottom: 0,
    margin: 0,
    padding: '0 20px',
    backgroundColor: 'hsl(var(--background))',
    borderBottom: '1px solid hsl(var(--border))',
  },
  container: {
    margin: 0,
    padding: 0,
    maxWidth: '100vw',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 0,
  },
  body: {
    flex: 1,
    minHeight: 0,
    height: '100%',
    padding: 0,
    margin: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  footer: {
    flexShrink: 0,
    margin: 0,
    padding: '12px 20px',
    backgroundColor: 'hsl(var(--background))',
    borderTop: '1px solid hsl(var(--border))',
  },
} as ModalProps['styles'];

export const fullscreenModalStyle: ModalProps['style'] = {
  top: 0,
  paddingBottom: 0,
  margin: 0,
  maxWidth: '100vw',
};

interface IProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode | null;
  zIndex?: number;
  getContainer?: ModalProps['getContainer'];
  destroyOnHidden?: boolean;
  mask?: ModalProps['mask'];
  showDefaultFooter?: boolean;
}

function resolveModalMask(mask: ModalProps['mask']): ModalProps['mask'] {
  if (mask === false) {
    return false;
  }

  const baseMask = { closable: false };
  if (typeof mask === 'object' && mask !== null) {
    return { ...baseMask, ...mask };
  }

  return baseMask;
}

/** 全屏 Modal 壳（头部样式对齐提示词 AI 测试弹框） */
export function FullscreenModal({
  open,
  title,
  onClose,
  children,
  footer,
  zIndex,
  getContainer,
  destroyOnHidden = true,
  mask,
  showDefaultFooter = true,
}: IProps) {
  const resolvedFooter =
    footer === null
      ? null
      : (footer ??
        (showDefaultFooter ? (
          <Button type='default' onClick={onClose}>
            关闭
          </Button>
        ) : undefined));

  return (
    <Modal
      open={open}
      title={title}
      footer={resolvedFooter}
      onCancel={onClose}
      zIndex={zIndex}
      getContainer={getContainer}
      mask={resolveModalMask(mask)}
      width={FULLSCREEN_MODAL_WIDTH}
      style={fullscreenModalStyle}
      styles={fullscreenModalStyles}
      destroyOnHidden={destroyOnHidden}
      classNames={{ header: styles['fullscreen-modal-header'] }}>
      <div className={styles['fullscreen-modal-body']}>{children}</div>
    </Modal>
  );
}

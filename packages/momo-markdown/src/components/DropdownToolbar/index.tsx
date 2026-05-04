import { ReactNode, memo, useContext, useMemo } from 'react';
import Dropdown from '~/components/Dropdown';
import { prefix } from '~/config';
import { EditorContext } from '~/context';

export interface IProps {
  title?: string;
  visible: boolean;
  trigger?: ReactNode;
  onChange: (visible: boolean) => void;
  overlay: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
}

const DropdownToolbar = (props: IProps) => {
  const { editorId } = useContext(EditorContext);
  const className = useMemo(() => {
    return `${prefix}-toolbar-item${props.disabled ? ' ' + prefix + '-disabled' : ''}`;
  }, [props.disabled]);

  return (
    <Dropdown
      relative={`#${editorId}-toolbar-wrapper`}
      visible={props.visible}
      onChange={props.onChange}
      overlay={props.overlay}
      disabled={props.disabled}>
      <button
        className={className}
        title={props.title || ''}
        aria-label={props.title || ''}
        disabled={props.disabled}
        type='button'>
        {props.children || props.trigger}
      </button>
    </Dropdown>
  );
};

export default memo(DropdownToolbar);

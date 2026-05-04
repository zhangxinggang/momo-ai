import Icon from '~~/components/MdEditor/components/Icon';
import { NormalToolbar } from '~~/index';

export default () => {
  return (
    <NormalToolbar
      trigger={<Icon name='strike-through' />}
      onClick={console.log}
      key='dddd'></NormalToolbar>
  );
};

import { ICustomIcon, ICustomStrIcon } from '~/type';
declare const StrIcon: (name: keyof ICustomStrIcon, customIcon: ICustomIcon) => string;
export default StrIcon;

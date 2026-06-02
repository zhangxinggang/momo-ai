import services from '@momo/server';
import { mergeDeep } from '@momo/utils';

const startServer = async (pcf: Record<string, any> = {}) => {
  import('./config').then((data) => {
    const config = data.default || data;
    mergeDeep(config, pcf);
    services(config);
  });
};

export default startServer;

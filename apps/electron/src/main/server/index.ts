import services from '@momo/server';
import merge from 'merge';
import config from './config';

const startServer = async (pcf: Record<string, any> = {}) => {
  merge.recursive(config, pcf);
  await services(config);
};

export default startServer;

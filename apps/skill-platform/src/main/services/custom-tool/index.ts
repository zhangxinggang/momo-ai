import path from 'node:path';
import { getDataDir, getStaticDir, getToolsDir } from '../../runtime-paths';
import { CustomToolWorkspaceService } from './workspace';

export { CustomToolWorkspaceService } from './workspace';

export const customToolWorkspaceService = new CustomToolWorkspaceService(
  getToolsDir(),
  getStaticDir(),
  path.join(getDataDir(), 'tools'),
);

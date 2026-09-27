import { getStaticDir, getToolsDir } from '../../runtime-paths';
import { CustomToolWorkspaceService } from './workspace';

export { CustomToolWorkspaceService } from './workspace';

export const customToolWorkspaceService = new CustomToolWorkspaceService(
  getToolsDir(),
  getStaticDir(),
);

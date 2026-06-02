/** GitHub 仓库本地安装目录名：owner-repo */
export function buildGitHubInstallDirName(owner: string, repo: string): string {
  return `${owner}-${repo}`;
}

/** 从 GitHub URL 解析 owner / repo，失败返回 null */
export function parseGitHubOwnerRepo(url: string): { owner: string; repo: string } | null {
  const matches = url.match(
    /^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/,
  );
  if (!matches) {
    return null;
  }
  return { owner: matches[1], repo: matches[2] };
}

/** 从 GitHub source_url 推导本地安装目录名 */
export function resolveGitHubInstallDirName(sourceUrl: string): string | null {
  const parsed = parseGitHubOwnerRepo(sourceUrl);
  if (parsed) {
    return buildGitHubInstallDirName(parsed.owner, parsed.repo);
  }
  if (!sourceUrl.includes('github.com')) {
    return null;
  }
  const urlParts = sourceUrl.replace(/^https?:\/\/github\.com\//, '').split('/');
  const owner = urlParts[0];
  const repo = urlParts[1]?.replace(/\.git$/, '');
  if (owner && repo) {
    return buildGitHubInstallDirName(owner, repo);
  }
  return null;
}

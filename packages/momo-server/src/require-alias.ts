/**
 * NKRequire requireAlias 与构建入口扫描共用。
 * 新增命名空间时在此补充，config 与 vite 会自动对齐。
 */
export const REQUIRE_ALIAS_ENTRIES = {
  NK: 'utils',
  NKH: 'services/http-server',
} as const;

export type TRequireAliasNamespace = keyof typeof REQUIRE_ALIAS_ENTRIES;

/** requireAlias 映射的 src 下相对目录列表 */
export const REQUIRE_ALIAS_SRC_DIRS = Object.values(REQUIRE_ALIAS_ENTRIES);

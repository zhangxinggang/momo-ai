export type IAMFAnyResult = { len: number; value: unknown };

export type IAMFObject = Record<string, unknown>;

/** 严格数组（AMF 编码用） */
export interface IStrictArrayLike extends Array<unknown> {
  sarray?: boolean;
}

import { momoOpenuiLibrary } from '@renderer/services/custom-tool/openui-library';

export type TSelectValue = string | number;

interface IZodLikeSchema {
  options?: readonly unknown[];
  shape?: Record<string, unknown> | (() => Record<string, unknown>);
  unwrap?: () => unknown;
  _def?: {
    type?: string;
    innerType?: unknown;
    entries?: Record<string, unknown>;
    values?: unknown[];
    shape?: Record<string, unknown> | (() => Record<string, unknown>);
  };
}

const WRAPPER_SCHEMA_TYPES = new Set([
  'optional',
  'nullable',
  'default',
  'catch',
  'readonly',
  'nonoptional',
  'prefault',
]);

export function isSelectValue(value: unknown): value is TSelectValue {
  return ['string', 'number'].includes(typeof value);
}

function unwrapSchema(schema: unknown): IZodLikeSchema | undefined {
  let current = schema as IZodLikeSchema | undefined;
  const visited = new Set<unknown>();
  while (current && !visited.has(current)) {
    visited.add(current);
    const schemaType = current._def?.type;
    if (!WRAPPER_SCHEMA_TYPES.has(schemaType ?? '')) break;
    const next = current.unwrap?.() ?? current._def?.innerType;
    if (!next || next === current) break;
    current = next as IZodLikeSchema;
  }
  return current;
}

function readSchemaShape(schema: unknown): Record<string, unknown> {
  const candidate = schema as IZodLikeSchema | undefined;
  const shape = candidate?.shape ?? candidate?._def?.shape;
  if (typeof shape === 'function') return shape();
  return shape ?? {};
}

/** 从 OpenUI 组件的 Zod 属性约束中读取有限选项，供配置面板渲染 Select。 */
export function getOpenUIPropertyOptions(
  componentType: string,
  propertyName: string,
): TSelectValue[] {
  const definition = Object.values(momoOpenuiLibrary.components).find(
    (component) => component.name === componentType,
  );
  const propertySchema = readSchemaShape(definition?.props)[propertyName];
  const schema = unwrapSchema(propertySchema);
  if (!schema) return [];

  const directOptions = schema.options;
  if (Array.isArray(directOptions) && directOptions.every(isSelectValue)) {
    return [...directOptions];
  }

  const entries = schema._def?.entries;
  if (entries) {
    return [...new Set(Object.values(entries).filter(isSelectValue))];
  }

  const literalValues = schema._def?.values;
  if (Array.isArray(literalValues)) return literalValues.filter(isSelectValue);
  return [];
}

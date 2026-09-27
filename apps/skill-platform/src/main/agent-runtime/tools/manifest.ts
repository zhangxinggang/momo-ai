import Ajv from 'ajv';

const ajv = new Ajv({ strict: true, allErrors: true, validateFormats: false });

export function validateSchema(schema: Record<string, unknown>, value: unknown) {
  const validate = ajv.compile(schema);
  if (!validate(value)) throw new Error(`Schema 校验失败：${ajv.errorsText(validate.errors)}`);
}

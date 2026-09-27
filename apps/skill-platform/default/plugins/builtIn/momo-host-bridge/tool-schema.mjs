/** Native presentation accepts a smaller vocabulary; the host retains the full Ajv contract. */
export function nativeInputSchema(schema) {
  const project = (node, depth=0) => {
    if (!node || typeof node !== 'object' || Array.isArray(node) || depth > 20) return {};
    const result = {};
    if (['object','array','string','number','integer','boolean','null'].includes(node.type)) result.type = node.type;
    for (const key of ['description','title']) if (typeof node[key] === 'string') result[key] = node[key];
    if (result.type === 'object') {
      if (node.properties && typeof node.properties === 'object') result.properties = Object.fromEntries(Object.entries(node.properties).map(([key,value])=>[key,project(value,depth+1)]));
      if (Array.isArray(node.required)) result.required = node.required.filter(key=>Object.hasOwn(result.properties ?? {},key));
      if (typeof node.additionalProperties === 'boolean') result.additionalProperties=node.additionalProperties;
    }
    if (result.type === 'array' && node.items && !Array.isArray(node.items)) result.items=project(node.items,depth+1);
    const matches = value => result.type === 'null' ? value === null : result.type === 'integer' ? Number.isInteger(value) : typeof value === result.type;
    if (['string','number','integer','boolean','null'].includes(result.type)) {
      if (Array.isArray(node.enum) && node.enum.length && node.enum.every(matches)) result.enum=node.enum;
      if (Object.hasOwn(node,'const') && matches(node.const)) result.const=node.const;
    }
    return result;
  };
  const projected=project(schema);
  return projected.type === 'object' ? projected : {type:'object',additionalProperties:true};
}

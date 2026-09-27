import { momoOpenuiLibrary } from './openui-library';

type Definition = { properties?: Record<string, { enum?: unknown[] }> };
const definitions =
  (momoOpenuiLibrary.toJSONSchema() as { $defs?: Record<string, Definition> }).$defs ?? {};

/** Models sometimes emit Python-style named arguments; OpenUI only accepts positional ones. */
export function normalizeOpenuiSource(source: string): string {
  const quotedEnd = (text: string, start: number) => {
    const quote = text[start];
    for (let i = start + 1; i < text.length; i++) {
      if (text[i] === '\\') i++;
      else if (text[i] === quote) return i + 1;
    }
    return text.length;
  };
  const splitArguments = (body: string) => {
    const parts: string[] = [];
    let depth = 0,
      start = 0;
    for (let i = 0; i < body.length; i++) {
      if (body[i] === '"' || body[i] === "'") i = quotedEnd(body, i) - 1;
      else if ('([{'.includes(body[i])) depth++;
      else if (')]}'.includes(body[i])) depth--;
      else if (body[i] === ',' && depth === 0) {
        parts.push(body.slice(start, i).trim());
        start = i + 1;
      }
    }
    if (body.slice(start).trim()) parts.push(body.slice(start).trim());
    return parts;
  };
  const normalize = (text: string): string => {
    let output = '';
    for (let i = 0; i < text.length; ) {
      if (text[i] === '"' || text[i] === "'") {
        const end = quotedEnd(text, i);
        output += text.slice(i, end);
        i = end;
        continue;
      }
      if (text.startsWith('//', i)) {
        const end = text.indexOf('\n', i);
        if (end < 0) return output + text.slice(i);
        output += text.slice(i, end + 1);
        i = end + 1;
        continue;
      }
      const call = /^[A-Z]\w*\s*\(/.exec(text.slice(i));
      if (!call) {
        output += text[i++];
        continue;
      }
      const name = call[0].slice(0, call[0].indexOf('(')).trim();
      const start = i + call[0].length;
      let end = start,
        depth = 1;
      for (; end < text.length; end++) {
        if (text[end] === '"' || text[end] === "'") end = quotedEnd(text, end) - 1;
        else if (text[end] === '(') depth++;
        else if (text[end] === ')' && --depth === 0) break;
      }
      // Preserve unfinished streaming content until the closing parenthesis arrives.
      if (depth) return output + text.slice(i);
      const body = normalize(text.slice(start, end));
      const args = splitArguments(body);
      const properties = definitions[name]?.properties;
      const keys = Object.keys(properties ?? {});
      const named = args.map((arg) => /^(\w+)\s*[:=]\s*([\s\S]+)$/.exec(arg));
      if (
        keys.length &&
        named.some(Boolean) &&
        named.every((item) => !item || keys.includes(item[1]))
      ) {
        const values = new Map<number, string>();
        let position = 0;
        for (let a = 0; a < args.length; a++) {
          const item = named[a];
          const index = item ? keys.indexOf(item[1]) : position++;
          // Duplicate assignments are invalid and must remain visible to validation.
          if (values.has(index)) {
            values.clear();
            break;
          }
          let value = item ? item[2] : args[a];
          if (properties?.[keys[index]]?.enum?.includes(value)) value = JSON.stringify(value);
          values.set(index, value);
        }
        if (values.size) {
          const last = Math.max(...values.keys());
          output += `${name}(${Array.from({ length: last + 1 }, (_, index) => values.get(index) ?? 'null').join(', ')})`;
          i = end + 1;
          continue;
        }
      }
      output += `${call[0]}${body})`;
      i = end + 1;
    }
    return output;
  };
  return normalize(source);
}

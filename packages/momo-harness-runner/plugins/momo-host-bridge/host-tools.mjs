import { nativeInputSchema } from './tool-schema.mjs';

/** Each AI tool is a real Cordis plugin scoped to the native agent context. */
export async function registerHostTools(agentCtx, tools, invoke) {
  const registrations = [];
  const names = new Set();
  for (const tool of tools) {
    if (names.has(tool.name)) throw Error('DUPLICATE_TOOL');
    names.add(tool.name);
  }
  try {
    for (const tool of tools) {
      const parameters = nativeInputSchema(tool.inputSchema);
      const aliases = [...new Set([tool.title, ...(tool.aliases ?? [])].filter(Boolean))];
      const description =
        tool.description +
        (aliases.length ? '\n可识别名称：' + aliases.join('、') : '') +
        (JSON.stringify(parameters) === JSON.stringify(tool.inputSchema)
          ? ''
          : '\n完整输入约束由宿主严格校验：' + JSON.stringify(tool.inputSchema));
      const execute = (args, exec) => invoke(tool, args, exec);
      if (tool.id.startsWith('custom.') && tool.registrationSource) {
        const plugin = await import(
          'data:text/javascript;base64,' + Buffer.from(tool.registrationSource).toString('base64')
        );
        if (plugin.name !== tool.name || typeof plugin.apply !== 'function')
          throw Error('INVALID_CUSTOM_PLUGIN');
        const fiber = await agentCtx.plugin(plugin, { parameters, description, execute });
        registrations.push(() => fiber.dispose());
      } else {
        registrations.push(
          agentCtx.get('tools').register({
            name: tool.name,
            description,
            parameters,
            output: {
              schema: {},
              render: (_, value) => [{ type: 'text', text: JSON.stringify(value) }],
            },
            isConcurrencySafe: () => tool.parallelSafe,
            execute,
          }),
        );
      }
    }
    return registrations;
  } catch (error) {
    for (const dispose of registrations.reverse()) await dispose();
    throw error;
  }
}

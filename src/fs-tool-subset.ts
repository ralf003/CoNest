import type { Context } from '@deepseek-ai/cordis';
import * as ToolFs from '@deepseek-ai/dsh-tool-fs';
import type { ToolDefinition } from '@deepseek-ai/dsh-tools';

/** Select registrations through a child view; never patch the shared tool service or upstream. */
export function selectFsTools(owner: 'reader' | 'gateway'): Omit<typeof ToolFs, 'name' | 'apply'> & {
  name: string;
  apply(ctx: Context, config: ToolFs.Config): void;
} {
  return { ...ToolFs, name: `conest-fs-${owner}`, apply(ctx: Context, config: ToolFs.Config) {
    const tools = ctx.tools;
    const view = ctx.extend({ tools: new Proxy(tools, {
      get(target, key, receiver) {
        if (key === 'register') return (definition: ToolDefinition) => {
          const selected = owner === 'reader' ? definition.name === 'read' : definition.name !== 'read';
          return selected ? tools.register(definition) : () => {};
        };
        return Reflect.get(target, key, receiver);
      },
    }) });
    ToolFs.apply(view, config);
  } };
}

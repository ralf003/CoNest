import { callGatewayFromCli } from 'openclaw/plugin-sdk/gateway-runtime';
import type { OpenClawPluginApi } from 'openclaw/plugin-sdk/plugin-entry';
import { isIncognitoSessionKey } from 'openclaw/plugin-sdk/routing';
import { mkdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { CordisBridgeHost } from './cordis-bridge-host.js';
import { createDshAgentHarness } from './dsh-agent-harness.js';
import { generatedComposition } from './generated/composition.generated.js';
import { extractLatestUserText, formatAutomaticMemoryContext, resolveAutomaticMemorySubject, selectAutomaticMemory } from './automatic-memory.js';
import { StudioActivity } from './activity.js';
import { MarketCatalog, type CatalogItem } from './catalog.js';

const sharedKey = Symbol.for('conest.studio.v1');
type StudioState = { host: CordisBridgeHost; activity: StudioActivity; market: MarketCatalog; owners: number; pending: Map<string, string>; loops: Map<string, string> };
const shared = ((globalThis as Record<symbol, unknown>)[sharedKey] ??= new Map<string, StudioState>()) as Map<string, StudioState>;
const PREFIX = '/plugins/conest-studio';

export function registerStudio(api: OpenClawPluginApi, workspaceRoot: string): void {
  const config = api.pluginConfig?.studio as { stateDir?: string } | undefined;
  if (!config) return;
  if (!config.stateDir || !path.isAbsolute(config.stateDir)) throw new Error('CoNest Studio requires an absolute stateDir');
  mkdirSync(config.stateDir, { recursive: true, mode: 0o700 });
  const stateDir = realpathSync(config.stateDir);
  let state = shared.get(stateDir);
  if (!state) {
    state = { host: new CordisBridgeHost(), activity: new StudioActivity(stateDir), market: new MarketCatalog(stateDir), owners: 0, pending: new Map(), loops: new Map() };
    shared.set(stateDir, state);
  }
  const { host, activity, market } = state;
  const { pending, loops } = state;
  let serviceOwned = false;
  api.registerService({
    id: 'conest-studio-runtime',
    async start() {
      await host.start({ workspaceRoot, memoryFilePath: path.join(stateDir, 'memory.jsonl'), sessionPersistenceRoot: path.join(stateDir, 'sessions') });
      if (!serviceOwned) { serviceOwned = true; state!.owners++; }
      void market.get(true).catch(error => api.logger.warn(`CoNest market: ${String(error)}`));
    },
    async stop() {
      if (!serviceOwned) return;
      serviceOwned = false;
      if (--state!.owners === 0) await host.stop();
    },
  });
  api.registerAgentHarness(createDshAgentHarness({ host, timeoutMs: 120_000,
    onRunStarted: (runId, sessionKey) => { loops.set(runId, 'dsh'); loops.set(sessionKey, 'dsh'); },
    onSupportEvaluated: message => api.logger.info('CoNest DSH: ' + message),
    onRunCompleted(result) {
      activity.record({ kind: 'loop.complete', loop: 'dsh', sessionKey: result.sessionId, state: 'completed', text: result.finalText });
    },
  }));

  for (const descriptor of generatedComposition.tools) api.registerTool(context => {
    if (context.sandboxed) return null;
    if (context.fsPolicy?.workspaceOnly) {
      try {
        if (realpathSync(context.fsPolicy.root ?? context.workspaceDir ?? '') !== realpathSync(workspaceRoot)) return null;
      } catch { return null; }
    }
    return {
      name: descriptor.openClawName, label: `DSH · ${descriptor.dshName}`,
      description: descriptor.description, parameters: descriptor.parameters,
      async execute(callId, args, signal) {
        const result = await host.execute(callId, descriptor.dshName, args,
          context.sessionKey ?? context.sessionId ?? context.agentId ?? 'operator', signal);
        if (result.isError) throw new Error(result.content.flatMap(c => c.type === 'text' ? [c.text] : []).join('\n'));
        return { content: result.content.flatMap(c => c.type === 'text' ? [{ type: 'text' as const, text: c.text }] : []),
          details: { source: 'dsh', tool: descriptor.dshName, value: result.value } };
      },
    };
  }, { name: descriptor.openClawName });

  api.on('before_prompt_build', async (event, context) => {
    if (isIncognitoSessionKey(context.sessionKey)) return;
    const key = context.runId ?? context.sessionKey;
    const loop = (key ? loops.get(key) : undefined) ?? (context.sessionKey ? loops.get(context.sessionKey) : undefined) ?? 'openclaw';
    if (key) loops.set(key, loop);
    const candidate = selectAutomaticMemory(event.prompt, 500) ?? selectAutomaticMemory(extractLatestUserText(event.messages) ?? '', 500);
    if (key && candidate) pending.set(key, candidate);
    api.logger.debug?.(`CoNest memory stage prompt=${event.prompt.length} latest=${extractLatestUserText(event.messages)?.length ?? 0} candidate=${!!candidate} key=${key}`);
    const subject = resolveAutomaticMemorySubject(context, 'conest');
    if (!subject) return;
    const memory = await host.recallAutomaticMemory(subject.entityName);
    activity.record({ kind: 'memory.recall', loop, runId: context.runId, sessionKey: context.sessionKey,
      state: 'completed', text: `${memory.observations.length} 条共享记忆` });
    const text = formatAutomaticMemoryContext(memory.observations, { maxItems: 20, maxChars: 4000 });
    if (text) return { prependContext: text };
  }, { timeoutMs: 10_000 });
  api.on('agent_end', async (event, context) => {
    const key = context.runId ?? context.sessionKey;
    const candidate = (key ? pending.get(key) : undefined) ?? selectAutomaticMemory(extractLatestUserText(event.messages) ?? '', 500);
    if (key) pending.delete(key);
    const loop = key ? loops.get(key) : undefined;
    if (key) loops.delete(key);
    if (!isIncognitoSessionKey(context.sessionKey)) {
      const last = [...event.messages].reverse().find((m: unknown) => (m as { role?: string })?.role === 'assistant') as { content?: Array<{ text?: string }> } | undefined;
      activity.record({ kind: 'run.complete', loop, runId: context.runId, sessionKey: context.sessionKey,
        state: event.success ? 'completed' : 'failed', text: last?.content?.map(c => c.text ?? '').join('') || event.error });
    }
    if (!event.success || isIncognitoSessionKey(context.sessionKey)) return;
    const subject = resolveAutomaticMemorySubject(context, 'conest');
    if (candidate && subject) {
      await host.storeAutomaticMemory(subject.entityName, candidate);
      activity.record({ kind: 'memory.write', loop, runId: context.runId, sessionKey: context.sessionKey,
        state: 'completed', text: candidate });
    }
  }, { timeoutMs: 10_000 });
  api.on('before_tool_call', (event, context) => {
    activity.record({ kind: 'tool.start', tool: event.toolName, runId: context.runId,
      sessionKey: context.sessionKey, source: event.toolName.startsWith('dsh_') ? 'dsh' : 'openclaw', state: 'running' });
  });
  api.on('after_tool_call', (event, context) => {
    activity.record({ kind: 'tool.end', tool: event.toolName, runId: context.runId,
      sessionKey: context.sessionKey, source: event.toolName.startsWith('dsh_') ? 'dsh' : 'openclaw',
      state: event.error ? 'failed' : 'completed', text: event.error, durationMs: event.durationMs });
  });

  // The shell contains no state or credentials; both host UIs load this same view.
  api.registerHttpRoute({ path: PREFIX, auth: 'plugin', match: 'exact', handler: async (_req, res) => {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('cache-control', 'no-store');
    res.end(readFileSync(new URL('./studio.html', import.meta.url), 'utf8')); return true;
  } });
  api.registerHttpRoute({ path: `${PREFIX}/api`, auth: 'plugin', match: 'prefix', gatewayRuntimeScopeSurface: 'trusted-operator',
    handler: async (req, res) => {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.setHeader('cache-control', 'no-store');
      try {
        const url = new URL(req.url!, 'http://localhost');
        const requestOrigin=req.headers.origin;
        if(requestOrigin==='null'||requestOrigin===`http://${req.headers.host}`||requestOrigin===`https://${req.headers.host}`) {
          res.setHeader('access-control-allow-origin',requestOrigin);res.setHeader('vary','Origin');
          res.setHeader('access-control-allow-methods','GET, POST, OPTIONS');res.setHeader('access-control-allow-headers','Authorization, Content-Type');
        }
        if(req.method==='OPTIONS'){res.statusCode=204;res.end();return true;}
        // Third-party plugins cannot use the trusted-official in-process dispatcher.
        // Forward this operator's presented token through the public Gateway client.
        const presentedToken = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
        if (!presentedToken) {res.statusCode=401;res.end(JSON.stringify({error:'Gateway token required'}));return true;}
        const gatewayRequest = async <T = Record<string, unknown>>(method: string, params: Record<string, unknown>) =>
          await callGatewayFromCli(method, { url: `ws://127.0.0.1:${api.config.gateway?.port ?? 18789}`,
            token: presentedToken, timeout: '15000', json: true }, params,
            { progress: false, scopes: method === 'plugins.list' || method === 'tools.catalog'
              ? ['operator.read'] : ['operator.read', 'operator.write'] }) as T;
        // Validate the caller before reading any private state, including opaque sandbox frames.
        try {await gatewayRequest('health',{});}catch{res.statusCode=401;res.end(JSON.stringify({error:'Gateway token invalid'}));return true;}
        if (req.method === 'GET' && url.pathname === `${PREFIX}/api/activity`) {
          const subject = resolveAutomaticMemorySubject({ agentId: 'main' }, 'conest')!;
          const memory = host.status() === 'ready' ? await host.recallAutomaticMemory(subject.entityName) : { observations: [] };
          res.end(JSON.stringify({ activity: activity.read(), memory: memory.observations }));
        } else if (req.method === 'GET' && url.pathname === `${PREFIX}/api/state`) {
          const results = await Promise.allSettled([
            gatewayRequest<Record<string, unknown>>('plugins.list', {}),
            gatewayRequest<{ groups: Array<{ tools: Array<{ id: string; label: string; description: string }> }> }>('tools.catalog', { agentId: 'main', includePlugins: true }),
            market.get(url.searchParams.get('refresh') === '1'),
          ]);
          const plugins = results[0].status === 'fulfilled' ? results[0].value : undefined;
          const tools = results[1].status === 'fulfilled' ? results[1].value.groups.flatMap(g => g.tools) : [];
          const remote = results[2].status === 'fulfilled' ? results[2].value : undefined;
          const nativePlugins = (Array.isArray(plugins?.plugins) ? plugins.plugins : []) as Array<Record<string, unknown>>;
          const items: CatalogItem[] = [
            ...nativePlugins.map(p => ({ id: `openclaw:plugin:${p.id}`, name: String(p.name ?? p.id), origin: 'openclaw' as const,
              kind: 'plugin', description: String(p.description ?? ''), version: String(p.version ?? ''), status: String(p.state ?? (p.enabled ? 'loaded' : p.installed ? 'disabled' : 'available')) })),
            ...tools.map(t => ({ id: `tool:${t.id}`, name: t.id, origin: t.id.startsWith('dsh_') ? 'dsh' as const : 'openclaw' as const,
              kind: 'tool', description: t.description, status: 'registered' })),
            ...remote?.items ?? [],
          ];
          const memorySubject = resolveAutomaticMemorySubject({ agentId: 'main' }, 'conest')!;
          const memory = host.status() === 'ready' ? await host.recallAutomaticMemory(memorySubject.entityName) : { observations: [] };
          res.end(JSON.stringify({ version: '0.6.2', status: host.status(), items,
            market: remote ? { ...remote, items: undefined } : undefined, activity: activity.read(), memory: memory.observations,
            errors: results.flatMap(r => r.status === 'rejected' ? [String(r.reason)] : []) }));
        } else if (req.method === 'POST' && url.pathname === `${PREFIX}/api/run`) {
          const origin = req.headers.origin;
          if (origin && origin !== 'null' && new URL(origin).host !== req.headers.host) throw new Error('跨站任务请求被拒绝');
          let raw = ''; for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > 16_000) throw new Error('任务文本过长'); }
          const body = JSON.parse(raw);
          if (!['openclaw', 'dsh'].includes(body.loop) || typeof body.message !== 'string' || !body.message.trim()) throw new Error('请选择 Loop 并输入任务');
          const sessionKey = `agent:main:conest-${crypto.randomUUID()}`;
          const selection = await gatewayRequest<{ runId?: string }>('chat.send', {
            sessionKey, message: `/model deepseek/deepseek-v4-flash --runtime ${body.loop === 'dsh' ? 'auto' : 'openclaw'}`, idempotencyKey: crypto.randomUUID(),
          });
          if (selection.runId) await gatewayRequest('agent.wait', { runId: selection.runId, timeoutMs: 10_000 });
          const run = await gatewayRequest('agent', { sessionKey, message: body.message, idempotencyKey: crypto.randomUUID() });
          activity.record({ kind: 'run.start', loop: body.loop, sessionKey, state: 'running', text: body.message });
          res.end(JSON.stringify({ sessionKey, run }));
        } else { res.statusCode = 404; res.end(JSON.stringify({ error: 'Unknown route' })); }
      } catch (error) { res.statusCode = 500; res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) })); }
      return true;
    },
  });
  api.session.controls.registerControlUiDescriptor({ surface: 'tab', id: 'conest-studio', label: 'CoNest Studio',
    description: '统一生态 · 双 Loop · 共享记忆', path: PREFIX, icon: 'sparkles', group: 'agent', order: 5, requiredScopes: ['operator.read'] });
}

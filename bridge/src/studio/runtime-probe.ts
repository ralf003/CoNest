import { managedMemoryTools } from '../memory-contract.js';
import type { AnyAgentTool } from 'openclaw/plugin-sdk/plugin-entry';
import assert from 'node:assert/strict';
import { mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BridgeClient } from '../client.js';
import { CordisBridgeHost } from './cordis-bridge-host.js';

/** Real DSH runtime/tool smoke test; model decisions use the explicit proof adapter. */
export async function probeRuntime() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'conest-platform-'));
  const workspace = path.join(root, 'workspace'); await mkdir(workspace);
  await writeFile(path.join(workspace, 'evidence.txt'), 'CoNest cross-platform probe\nCONEST_PLATFORM_OK\n');
  const host = new CordisBridgeHost();
  const searchWorker = new BridgeClient({ workerFile: fileURLToPath(new URL('../worker.js', import.meta.url)), workspaceRoot: workspace, memoryFilePath: path.join(root, 'memory.jsonl'), startupTimeoutMs: 15000, shutdownTimeoutMs: 5000 });
  const options = { workspaceRoot: workspace, enableBridgeProofAdapter: true };
  try {
    await host.start(options);
    const worker = await searchWorker.start();
    const read = await searchWorker.invoke({ capability: 'dsh_read', args: { file_path: 'evidence.txt' }, taskId: 'platform-read', callId: 'read-probe', subject: 'platform-probe', principal: { kind: 'operator' }, workspaceRoot: workspace, permissions: ['workspace:read'] });
    assert(!(read.value as { isError: boolean }).isError, JSON.stringify(read)); assert(JSON.stringify(read).includes('CONEST_PLATFORM_OK'));
    assert((await host.execute('local-read-absent', 'read', { file_path: 'evidence.txt' }, 'platform-read')).isError, 'Gateway must not retain local read');
    assert.notEqual(worker.pid, process.pid);
    const grep = await searchWorker.invoke({ capability: 'dsh_grep', args: { pattern: 'CONEST_PLATFORM_OK', path: '.' },
      taskId: 'platform-search', callId: 'grep-probe', subject: 'platform-probe', principal: { kind: 'operator' }, workspaceRoot: workspace, permissions: ['workspace:read'] });
    assert(JSON.stringify(grep.value).includes('CONEST_PLATFORM_OK'));
    const localSearch = await host.execute('local-search-absent', 'grep', { pattern: 'CONEST_PLATFORM_OK' }, 'platform-search');
    assert(localSearch.isError, 'Gateway composition must not retain a second grep implementation');
    assert((await host.execute('local-memory-absent', 'mcp__reference_memory__read_graph', {}, 'platform')).isError);
    const memoryCall = (capability: string, args: Record<string, unknown>) => searchWorker.invoke({ capability, args, taskId: crypto.randomUUID(), callId: crypto.randomUUID(), subject: 'platform', principal: { kind: 'operator' }, workspaceRoot: workspace, permissions: ['memory:read', 'memory:write'] });
    const hostTools: AnyAgentTool[] = managedMemoryTools.map(tool => ({
      name: tool.openClawName, label: tool.openClawName, description: tool.description, parameters: tool.parameters,
      async execute(_id, args) {
        const result = (await memoryCall(tool.openClawName, args as Record<string, unknown>)).value as { content: Array<{ type: 'text'; text: string }>; value: unknown };
        return { content: result.content, details: { value: result.value } };
      },
    }));
    const loop = await host.runHarnessAgent({ task: 'PROOF:MEMORY_WRITE:platform-user:portable-memory-ok', sessionKey: 'platform-loop', provider: 'bridge-proof', model: 'proof', timeoutMs: 30000, hostTools });
    assert(loop.toolResults.some(result => !result.isError), JSON.stringify(loop.toolResults));
    await memoryCall('memory_remember', { observation: 'Remember: portable-automatic-ok' });
    await searchWorker.stop(); await searchWorker.start();
    const memory = await memoryCall('memory_recall', {});
    assert(JSON.stringify(memory.value).includes('portable-automatic-ok'));
    const recall = await memoryCall('dsh_mcp__reference_memory__search_nodes', { query: 'platform-user' });
    assert(JSON.stringify(recall.value).includes('portable-memory-ok'));
    return { platform: process.platform, arch: process.arch, node: process.version, glibc: (process.report.getReport() as {header:{glibcVersionRuntime?: string}}).header.glibcVersionRuntime,
      passed: true, read: 'real DSH read in managed component worker', grep: 'real packaged ripgrep in managed component worker', loop: 'real DSH loop, deterministic model decisions', memory: 'persisted across runtime restart', nativeWindowsHostQualification: process.platform === 'win32' ? 'Record whether this is native Windows or an emulation environment in the test report' : undefined };
  } finally { await Promise.allSettled([host.stop(), searchWorker.stop()]); await rm(root, {recursive:true,force:true}); }
}

import assert from 'node:assert/strict';
import { mkdtemp, rm, symlink } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import gitInspector from '../examples/git-inspector/component.mjs';
import webFetch from '../examples/web-fetch/component.mjs';
import aiDebate from '../examples/ai-debate/component.mjs';

function handler(component, name, config = {}) {
  const handlers = new Map();
  component.apply({ bridgeCapabilities: { register(_ctx, id, fn) { handlers.set(id, fn); } } }, config);
  assert.ok(handlers.has(name));
  return handlers.get(name);
}

function invocation(workspaceRoot, signal = new AbortController().signal) {
  return { workspaceRoot, signal, progress() {} };
}

test('git inspector confines caller paths to the admitted workspace', async t => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'conest-git-workspace-'));
  const outside = await mkdtemp(path.join(os.tmpdir(), 'conest-git-outside-'));
  t.after(async () => { await rm(workspace, { recursive: true, force: true }); await rm(outside, { recursive: true, force: true }); });
  await symlink(outside, path.join(workspace, 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  const status = handler(gitInspector, 'git_status');
  await assert.rejects(status({ path: outside }, invocation(workspace)), /outside the admitted workspace/);
  await assert.rejects(status({ path: 'escape' }, invocation(workspace)), /outside the admitted workspace/);
  assert.deepEqual(await status({}, invocation(workspace)), { isRepository: false });
  const diff = handler(gitInspector, 'git_diff');
  await assert.rejects(diff({ ref: '--output=/tmp/unwanted' }, invocation(workspace)), /Invalid Git ref/);
});

test('web fetch stops after cancellation and bounds redirects', async t => {
  const server = createServer((req, res) => {
    if (req.url === '/slow') {
      setTimeout(() => { if (!res.destroyed) res.end('<title>late</title>'); }, 500);
    } else {
      res.writeHead(302, { location: '/loop' });
      res.end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const fetchUrl = handler(webFetch, 'fetch_url');
  const loop = await fetchUrl({ url: base + '/loop' }, invocation(process.cwd()));
  assert.match(loop.error, /Too many redirects/);
  const abort = new AbortController();
  const pending = fetchUrl({ url: base + '/slow' }, invocation(process.cwd(), abort.signal));
  abort.abort(new Error('task cancelled'));
  await assert.rejects(pending, /task cancelled/);
});

test('AI debate reports missing credentials as a component error', async () => {
  const debate = handler(aiDebate, 'ai_debate');
  await assert.rejects(debate({ topic: 'Should teams use one repository?' }, invocation(process.cwd())), /No DeepSeek API key configured/);
});

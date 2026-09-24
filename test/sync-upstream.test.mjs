import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../sync-upstream.sh', import.meta.url));

function command(cwd, program, ...args) {
  const result = spawnSync(program, args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, [program, ...args, result.stderr].join(' '));
  return result.stdout.trim();
}

function runSync(local, branch) {
  return spawnSync('bash', ['sync-upstream.sh', branch], { cwd: local, encoding: 'utf8' });
}

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'conest-sync-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const local = path.join(root, 'local');
  const origin = path.join(root, 'origin.git');
  const upstream = path.join(root, 'upstream.git');
  await mkdir(local);
  command(local, 'git', 'init', '-b', 'main');
  command(local, 'git', 'config', 'user.name', 'Test');
  command(local, 'git', 'config', 'user.email', 'test@example.invalid');
  await copyFile(script, path.join(local, 'sync-upstream.sh'));
  await writeFile(path.join(local, 'state.txt'), 'base\n');
  command(local, 'git', 'add', '.');
  command(local, 'git', 'commit', '-m', 'base');
  command(local, 'git', 'branch', 'develop');
  command(root, 'git', 'clone', '--bare', local, origin);
  command(root, 'git', 'clone', '--bare', local, upstream);
  command(local, 'git', 'remote', 'add', 'origin', origin);
  command(local, 'git', 'remote', 'add', 'upstream', upstream);
  command(local, 'git', 'fetch', 'origin');
  command(local, 'git', 'fetch', 'upstream');
  return { root, local, origin, upstream };
}

async function commit(local, value) {
  await writeFile(path.join(local, 'state.txt'), value);
  command(local, 'git', 'add', 'state.txt');
  command(local, 'git', 'commit', '-m', value.trim());
}

test('main refuses to discard an unmerged local commit', async t => {
  const { local, origin } = await fixture(t);
  await commit(local, 'local only\n');
  const localBefore = command(local, 'git', 'rev-parse', 'main');
  const forkBefore = command(local, 'git', '--git-dir', origin, 'rev-parse', 'main');
  const result = runSync(local, 'main');
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, /main differs from upstream\/main/);
  assert.equal(command(local, 'git', 'rev-parse', 'main'), localBefore);
  assert.equal(command(local, 'git', '--git-dir', origin, 'rev-parse', 'main'), forkBefore);
});

test('main refuses to replace origin-only commits', async t => {
  const { root, local, origin } = await fixture(t);
  const writer = path.join(root, 'writer');
  command(root, 'git', 'clone', origin, writer);
  command(writer, 'git', 'config', 'user.name', 'Test');
  command(writer, 'git', 'config', 'user.email', 'test@example.invalid');
  await commit(writer, 'fork only\n');
  command(writer, 'git', 'push', 'origin', 'main');
  const forkBefore = command(local, 'git', '--git-dir', origin, 'rev-parse', 'main');
  const result = runSync(local, 'main');
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, /origin\/main/);
  assert.equal(command(local, 'git', '--git-dir', origin, 'rev-parse', 'main'), forkBefore);
});

test('develop refuses to sync when upstream/develop is missing', async t => {
  const { local, origin, upstream } = await fixture(t);
  command(local, 'git', 'checkout', 'develop');
  await commit(local, 'develop only\n');
  command(local, 'git', '--git-dir', upstream, 'update-ref', '-d', 'refs/heads/develop');
  command(local, 'git', 'update-ref', '-d', 'refs/remotes/upstream/develop');
  const forkBefore = command(local, 'git', '--git-dir', origin, 'rev-parse', 'develop');
  const result = runSync(local, 'develop');
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, /upstream\/develop/);
  assert.equal(command(local, 'git', '--git-dir', origin, 'rev-parse', 'develop'), forkBefore);
});

test('develop handles a long divergence log and merges upstream', async t => {
  const { root, local, upstream } = await fixture(t);
  const writer = path.join(root, 'writer');
  command(root, 'git', 'clone', upstream, writer);
  command(writer, 'git', 'checkout', 'develop');
  command(writer, 'git', 'config', 'user.name', 'Test');
  command(writer, 'git', 'config', 'user.email', 'test@example.invalid');
  const base = command(writer, 'git', 'rev-parse', 'HEAD');
  const tree = command(writer, 'git', 'rev-parse', 'HEAD^{tree}');
  let parent = base;
  for (let i = 0; i < 3000; i++) {
    parent = command(writer, 'git', 'commit-tree', tree, '-p', parent, '-m', 'upstream commit ' + i);
  }
  command(writer, 'git', 'update-ref', 'refs/heads/develop', parent);
  command(writer, 'git', 'push', 'origin', 'develop');
  const result = runSync(local, 'develop');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(command(local, 'git', 'rev-parse', 'develop'), parent);
});

test('main follows an upstream advancement when local and fork commits are preserved upstream', async t => {
  const { root, local, origin, upstream } = await fixture(t);
  const writer = path.join(root, 'writer');
  command(root, 'git', 'clone', upstream, writer);
  command(writer, 'git', 'config', 'user.name', 'Test');
  command(writer, 'git', 'config', 'user.email', 'test@example.invalid');
  await commit(writer, 'upstream change\n');
  command(writer, 'git', 'push', 'origin', 'main');
  const upstreamTip = command(writer, 'git', 'rev-parse', 'main');
  const result = runSync(local, 'main');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(command(local, 'git', 'rev-parse', 'main'), upstreamTip);
  assert.equal(command(local, 'git', '--git-dir', origin, 'rev-parse', 'main'), upstreamTip);
});

test('main accepts rewritten upstream history with identical content', async t => {
  const { root, local, origin, upstream } = await fixture(t);
  const writer = path.join(root, 'writer');
  command(root, 'git', 'clone', upstream, writer);
  command(writer, 'git', 'config', 'user.name', 'Test');
  command(writer, 'git', 'config', 'user.email', 'test@example.invalid');
  command(writer, 'git', 'checkout', '--orphan', 'rewritten');
  command(writer, 'git', 'add', '.');
  command(writer, 'git', 'commit', '-m', 'rewritten with same content');
  command(writer, 'git', 'push', '--force', 'origin', 'HEAD:main');
  const upstreamTip = command(writer, 'git', 'rev-parse', 'HEAD');
  const result = runSync(local, 'main');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(command(local, 'git', 'rev-parse', 'main'), upstreamTip);
  assert.equal(command(local, 'git', '--git-dir', origin, 'rev-parse', 'main'), upstreamTip);
});

test('develop merges upstream changes while keeping local commits', async t => {
  const { root, local, origin, upstream } = await fixture(t);
  command(local, 'git', 'checkout', 'develop');
  await commit(local, 'local develop\n');
  const localTip = command(local, 'git', 'rev-parse', 'develop');
  const writer = path.join(root, 'writer');
  command(root, 'git', 'clone', upstream, writer);
  command(writer, 'git', 'checkout', 'develop');
  command(writer, 'git', 'config', 'user.name', 'Test');
  command(writer, 'git', 'config', 'user.email', 'test@example.invalid');
  await writeFile(path.join(writer, 'upstream.txt'), 'upstream develop\n');
  command(writer, 'git', 'add', 'upstream.txt');
  command(writer, 'git', 'commit', '-m', 'upstream develop');
  command(writer, 'git', 'push', 'origin', 'develop');
  const upstreamTip = command(writer, 'git', 'rev-parse', 'develop');
  const result = runSync(local, 'develop');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  command(local, 'git', 'merge-base', '--is-ancestor', localTip, 'develop');
  command(local, 'git', 'merge-base', '--is-ancestor', upstreamTip, 'develop');
  assert.equal(command(local, 'git', '--git-dir', origin, 'rev-parse', 'develop'), command(local, 'git', 'rev-parse', 'develop'));
});

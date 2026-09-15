import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

// Build a relocatable artifact from installed, pinned packages; never rewrite source packages.
const execute = promisify(execFile);
const source = fileURLToPath(new URL('..', import.meta.url));
const npmCli = path.join(source, 'node_modules/npm/bin/npm-cli.js');
const packlist = createRequire(npmCli)('npm-packlist');
const packResult = output => { const parsed = JSON.parse(output); return Array.isArray(parsed) ? parsed[0] : Object.values(parsed)[0]; };
assert.ok(process.argv.length === 2 || (process.argv.length === 4 && process.argv[2] === '--out'), 'Usage: pack-release.mjs [--out DIRECTORY]');
const output = process.argv[3] ? path.resolve(process.argv[3]) : path.join(source, 'releases');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'dsh-bridge-pack-'));
const stage = path.join(temporary, 'package');
const packages = new Map();
const provenance = [];
const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
const inside = (parent, file) => { const relative = path.relative(parent, file); return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)); };

async function resolvePackage(name, parent) {
  const require = createRequire(path.join(parent, 'package.json'));
  for (const base of require.resolve.paths(name) ?? []) {
    const candidate = path.join(base, name);
    try { await lstat(path.join(candidate, 'package.json')); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    return await realpath(candidate);
  }
}

async function collect(parent, manifest) {
  const references = { ...manifest.dependencies, ...manifest.optionalDependencies, ...manifest.peerDependencies };
  for (const name of Object.keys(references).sort()) {
    if (name === 'openclaw') continue;
    const directory = await resolvePackage(name, parent);
    if (!directory) {
      assert.ok(manifest.optionalDependencies?.[name] || manifest.peerDependenciesMeta?.[name]?.optional,
        `Missing required runtime package ${name} from ${manifest.name}`);
      continue;
    }
    const value = await readJson(path.join(directory, 'package.json'));
    const previous = packages.get(name);
    if (previous) {
      assert.equal(previous.directory, directory, `Multiple installed copies of ${name} require an explicit packaging decision`);
      continue;
    }
    packages.set(name, { directory, manifest: value });
    await collect(directory, value);
  }
}

async function filesIn(directory, base = '') {
  const files = [];
  for (const entry of await readdir(path.join(directory, base), { withFileTypes: true })) {
    const relative = path.join(base, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Artifact contains a symlink: ${relative}`);
    if (entry.isDirectory()) files.push(...await filesIn(directory, relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`Artifact contains a special file: ${relative}`);
  }
  return files.sort();
}

try {
  assert.equal(process.platform, 'linux', 'This release profile targets Linux only');
  assert.equal(process.arch, 'x64', 'This release profile targets x64 only');
  const rootManifest = await readJson(path.join(source, 'package.json'));
  await collect(source, { name: rootManifest.name, dependencies: rootManifest.dependencies });
  await mkdir(stage);
  const topFiles = ['dist', 'examples', 'STUDIO.md', 'README.md', 'ACCEPTANCE.md', 'AUTHORIZATION.md',
    'INSTALLATION.md', 'NAMING.md', 'RUNTIME-ACCEPTANCE.md', 'HOST-ADAPTER.md', 'CONTEXT-PROVIDERS.md', 'HOST-ENHANCEMENT-ACCEPTANCE.md',
    'conest.config.example.json', 'bridge.config.example.json', 'openclaw.plugin.json'];
  for (const file of topFiles) await cp(path.join(source, file), path.join(stage, file), { recursive: true, dereference: false });
  await mkdir(path.join(stage, 'companions/dsh-ui'), {recursive:true});
  for(const file of ['package.json','index.js','client.js','cordis.patch.yml','README.md']) await cp(path.join(source,'companions/dsh-ui',file),path.join(stage,'companions/dsh-ui',file));
  topFiles.push('companions');
  const rootLicense = path.resolve(source, '../source/workspace/deepseek-harness/LICENSE');
  const pending = [...packages.entries()];
  let completed = 0;
  const results = await Promise.allSettled(Array.from({ length: 4 }, async () => {
    for (;;) {
      const item = pending.shift();
      if (!item) return;
      const [name, { directory, manifest }] = item;
      const target = path.join(stage, 'node_modules', name);
      // Let npm's pinned file-list implementation apply publishing rules without asking
      // Arborist to traverse the source workspace's linked development dependency graph.
      const listed = await packlist({ path: directory, package: { ...manifest, bundleDependencies: [] },
        isProjectRoot: true, edgesOut: new Map() });
      if (name === 'node-pty') {
        // The installed Linux native module is excluded by upstream's publishing file list.
        listed.push('build/Release/pty.node');
      }
      const licenses = (await readdir(directory)).filter(file => /^(licen[sc]e|notice|copying)([.-]|$)/i.test(file));
      listed.push(...licenses);
      for (const file of [...new Set(listed)].sort()) {
        assert.ok(!path.isAbsolute(file) && inside(directory, path.resolve(directory, file)), `Unsafe package member ${file}`);
        assert.ok(!file.split('/').some(part => part === 'node_modules' || /^\.env(?:\.|$)/.test(part)), `Unexpected private/package member ${file}`);
        const member = path.join(directory, file);
        const stat = await lstat(member);
        assert.ok(stat.isFile() && !stat.isSymbolicLink(), `Package member must be a regular file: ${name}/${file}`);
        await mkdir(path.dirname(path.join(target, file)), { recursive: true });
        await cp(member, path.join(target, file));
      }
      if (licenses.length === 0) {
        if (name === '@openclaw/deepseek-provider') await cp(path.resolve(source,'../.runtime/node_modules/openclaw/LICENSE'),path.join(target,'LICENSE'));
        else if (name.startsWith('@img/sharp-libvips-')) {
          assert.ok((await readFile(path.join(directory,'README.md'),'utf8')).includes('## Licensing'));
          await cp(path.join(directory,'README.md'),path.join(target,'NOTICE.md'));
        } else if (name.startsWith('@koromix/koffi-')) await cp(path.join(source, 'node_modules/koffi/LICENSE.txt'), path.join(target, 'LICENSE'));
        else { assert.ok(name.startsWith('@deepseek-ai/dsh-'), `No preserved license found for ${name}`); await cp(rootLicense, path.join(target, 'LICENSE')); }
      }
      const rewritten = { ...manifest };
      if (name === 'node-pty') rewritten.files = [...manifest.files, 'build/Release/pty.node'];
      // The artifact is already built and contains exact dependencies. Installation runs no upstream hooks.
      for (const field of ['devDependencies', 'scripts', 'pnpm', 'workspaces', 'packageManager']) delete rewritten[field];
      for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
        if (!rewritten[field]) continue;
        rewritten[field] = Object.fromEntries(Object.keys(rewritten[field]).filter(key => packages.has(key))
          .map(key => [key, packages.get(key).manifest.version]));
      }
      await writeFile(path.join(target, 'package.json'), `${JSON.stringify(rewritten, null, 2)}\n`);
      const digest = createHash('sha256');
      const files = await filesIn(target);
      for (const file of files) digest.update(file).update('\0').update(await readFile(path.join(target, file))).update('\0');
      provenance.push({ name, version: manifest.version, license: manifest.license, files: files.length,
        sha256: digest.digest('hex'), metadataRewritten: true,
        ...(name === 'node-pty' ? { nativeAbi: process.versions.modules, patched: true } : {}) });
      process.stderr.write(`Packed dependency ${++completed}/${packages.size}: ${name}\n`);
    }
  }));
  const failed = results.find(result => result.status === 'rejected');
  if (failed) throw failed.reason;
  const dependencies = Object.fromEntries([...packages].sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => [name, value.manifest.version]));
  const manifest = { name: rootManifest.name, version: rootManifest.version, private: true, type: 'module',
    description: 'CoNest Connector for OpenClaw with a self-contained Linux x64 CoNest Runtime', license: 'UNLICENSED',
    engines: rootManifest.engines, os: ['linux'], cpu: ['x64'], libc: ['glibc'],
    bin: rootManifest.bin, files: [...topFiles, 'THIRD_PARTY_NOTICES.md', 'runtime-lock.json'],
    dependencies, bundledDependencies: Object.keys(dependencies), peerDependencies: rootManifest.peerDependencies,
    openclaw: rootManifest.openclaw };
  await writeFile(path.join(stage, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(stage, 'runtime-lock.json'), `${JSON.stringify({ bridgeVersion: manifest.version,
    platform: process.platform, arch: process.arch, node: process.version, nativeAbi: process.versions.modules,
    libc: process.report.getReport().header.glibcVersionRuntime,
    dependencies: provenance.sort((a, b) => a.name.localeCompare(b.name)) }, null, 2)}\n`);
  await writeFile(path.join(stage, 'THIRD_PARTY_NOTICES.md'), `# Third-party runtime notices\n\nCoNest Connector itself remains a private, unlicensed package; this archive is for local installation, not registry publication.\n\nBundled packages retain their own licenses and notices under \`node_modules/<package>/\`. DSH leaf packages additionally include the original DeepSeek root MIT license. Package manifests have exact versions and no install hooks. Studio JavaScript is bundled from the tested snapshot; its additional upstream notices are in dist/studio-licenses. Other executable JavaScript is preserved. The node-pty package includes the snapshot's existing patch and a Linux x64 native module built for Node ABI ${process.versions.modules}.\n\nSee \`runtime-lock.json\` for versions, file counts, and content hashes. These hashes record the produced artifact; they are not publisher signatures.\n`);
  await filesIn(stage);
  await mkdir(output, { recursive: true });
  const packed = await execute(process.execPath, [npmCli, 'pack', '--ignore-scripts', '--json', '--pack-destination', temporary], {
    cwd: stage, timeout: 120_000, maxBuffer: 32 * 1024 * 1024,
  });
  const result = packResult(packed.stdout);
  assert.equal(result.bundled.length, packages.size, 'npm omitted bundled runtime packages');
  const archive = path.join(output, result.filename);
  await cp(path.join(temporary, result.filename), archive, { errorOnExist: true, force: false });
  const sha256 = createHash('sha256').update(await readFile(archive)).digest('hex');
  await writeFile(`${archive}.sha256`, `${sha256}  ${result.filename}\n`, { flag: 'wx' });
  process.stdout.write(`${JSON.stringify({ archive, sha256, bundledPackages: packages.size, bytes: result.size, unpackedBytes: result.unpackedSize }, null, 2)}\n`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}

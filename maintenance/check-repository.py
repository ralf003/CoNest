#!/usr/bin/env python3
"""Dependency-free checks for source imports and future GitHub commits."""
import json
import re
import subprocess
from pathlib import Path
root = Path(__file__).resolve().parents[1]
files = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
files = [name for name in files if name]
errors = []
blocked = {'node_modules', '.vendor', '.runtime', '.tooling', '.platform-testing', 'private', 'backups', 'source', 'dist', 'lib', '__pycache__', '.dsh'}
secret_patterns = [
    rb'gh[pousr]_[A-Za-z0-9]{30,}',
    rb'github_pat_[A-Za-z0-9_]{40,}',
    rb'sk-[A-Za-z0-9_-]{24,}',
    rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
]
for name in files:
    path = Path(name)
    if blocked.intersection(path.parts) or name.startswith(('bridge/releases/', 'bridge/reports/', 'maintenance/local/')) or path.name.startswith('.env') and path.name != '.env.example' or path.suffix in {'.log', '.jsonl', '.pem', '.key', '.tgz', '.zip', '.bundle'}:
        errors.append(f'Excluded state, dependency or artifact path: {name}')
    if path.as_posix().endswith('.tar.gz'):
        errors.append(f'Archive must be distributed separately: {name}')
    target = root / path
    if target.is_symlink():
        errors.append(f'Unexpected tracked symlink: {name}')
        continue
    data = target.read_bytes()
    if len(data) > 5_000_000:
        errors.append(f'File exceeds source repository size limit: {name}')
    if any(re.search(pattern, data) for pattern in secret_patterns):
        errors.append(f'Possible credential material; inspect locally: {name}')
pkg = json.loads((root / 'bridge/package.json').read_text())
manifest = json.loads((root / 'bridge/openclaw.plugin.json').read_text())
if pkg['version'] != manifest['version']:
    errors.append('Package and plugin manifest versions disagree')
if manifest['id'] != 'dsh-bridge':
    errors.append('The existing plugin identity must be retained')
required = ['bridge/src/index.ts', 'bridge/src/runtime.ts', 'bridge/scripts/build.mjs', 'bridge/pnpm-lock.yaml', 'README.md', 'CONTRIBUTING.md']
for name in required:
    if name not in files:
        errors.append(f'Missing tracked project file: {name}')
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
for group in ('dependencies', 'devDependencies'):
    for name, spec in pkg.get(group, {}).items():
        if spec.startswith('link:') or 'source/workspace' in spec or '.runtime' in spec:
            raise SystemExit(f'Non-portable dependency: {name}')
print(f'Repository checks passed: {len(files)} files, CoNest {pkg["version"]}; full runtime tests are separate.')

#!/usr/bin/env python3
"""Wrap the verified Windows npm artifact with the isolated demo installer."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--archive', required=True, type=Path)
parser.add_argument('--out', required=True, type=Path)
args = parser.parse_args()
bridge = Path(__file__).resolve().parents[1]
version = json.loads((bridge / 'package.json').read_text())['version']
bundle = args.out / f'conest-{version}-windows-x64'
bundle.mkdir(parents=True, exist_ok=False)
packages = bundle / 'packages/win32-x64'
packages.mkdir(parents=True)
for file in [args.archive, Path(str(args.archive) + '.sha256')]:
    shutil.copy2(file, packages / file.name)
for name in ['install.ps1', 'start.ps1', 'setup.mjs', 'launch.mjs', 'configure-key.ps1', 'verify-windows.ps1']:
    shutil.copy2(bridge / 'delivery/multiplatform' / name, bundle / name)
shutil.copy2(bridge / 'docs/windows-0.6.4-zh.md', bundle / 'START-HERE-zh.md')
(bundle / 'delivery.json').write_text(json.dumps({
    'version': version, 'target': 'win32-x64', 'node': '24.15.0',
    'openclaw': '2026.9.2', 'defaultModel': 'deterministic-fixture',
    'validation': 'See the release validation report and Windows workflow; packaging is not execution evidence.',
}, indent=2) + '\n')
archive = bundle.with_suffix('.zip')
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as output:
    for file in sorted(bundle.rglob('*')):
        if file.is_file():
            output.write(file, file.relative_to(args.out))
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
Path(str(archive) + '.sha256').write_text(f'{digest}  {archive.name}\n')
print(archive.resolve())

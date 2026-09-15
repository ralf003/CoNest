#!/usr/bin/env python3
"""Package reviewed platform artifacts, source, instructions and evidence together."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import tempfile
import zipfile

bridge = Path(__file__).resolve().parents[1]
version = json.loads((bridge / 'package.json').read_text())['version']
release = bridge / 'releases' / version
name = f'conest-{version}-multiplatform'
archive = release / f'{name}.zip'
if archive.exists():
    raise SystemExit(f'Refusing to overwrite {archive}')

with tempfile.TemporaryDirectory(prefix='conest-delivery-') as temporary:
    stage = Path(temporary) / name
    shutil.copytree(bridge / 'delivery/multiplatform', stage)
    (stage / 'delivery.json').write_text(json.dumps({
        'version': version, 'status': 'candidate',
        'platforms': ['linux-x64', 'win32-x64'],
        'openclaw': '2026.9.2', 'node': '24.15.0',
        'qualification': {
            'linux-x64': 'UBI 8.10 / glibc 2.28, shared Linux 6.8 kernel: integration passed',
            'win32-x64': 'Wine component checks passed; native Windows integration pending',
        },
    }, ensure_ascii=False, indent=2) + '\n')
    for target in ['linux-x64', 'win32-x64']:
        folder = stage / 'packages' / target
        folder.mkdir(parents=True)
        package = release / target / f'local-conest-connector-{version}.tgz'
        expected = Path(str(package) + '.sha256').read_text().split()[0]
        assert hashlib.sha256(package.read_bytes()).hexdigest() == expected
        for file in [package, Path(str(package) + '.sha256')]:
            shutil.copy2(file, folder / file.name)
    for directory in ['src', 'scripts', 'test', 'companions', 'examples', 'delivery', '.github']:
        shutil.copytree(bridge / directory, stage / directory,
                        ignore=shutil.ignore_patterns('node_modules', '__pycache__', '*.pyc'))
    for file in ['package.json', 'pnpm-lock.yaml', 'tsconfig.json', 'openclaw.plugin.json',
                 'README.md', 'conest.config.example.json', 'bridge.config.example.json']:
        shutil.copy2(bridge / file, stage / file)
    # Keep the code's original reference documents available as Markdown.
    for file in bridge.glob('*.md'):
        if file.name != '先看这里.md':
            shutil.copy2(file, stage / file.name)
    shutil.copytree(bridge / 'docs', stage / 'docs')
    shutil.copytree(bridge / 'reports' / f'multiplatform-{version}',
                    stage / 'reports' / f'multiplatform-{version}')
    subprocess.run(['python3', str(bridge / 'scripts/render-platform-docs.py'), str(stage)], check=True)
    files = sorted(file for file in stage.rglob('*') if file.is_file())
    for file in files:
        assert not file.is_symlink(), file
        assert not any(part == 'node_modules' or part.startswith('.env') for part in file.relative_to(stage).parts), file
        assert file.name not in ['connection.json', 'deepseek.env', 'gateway.token'], file
    (stage / 'SHA256SUMS').write_text(''.join(
        f'{hashlib.sha256(file.read_bytes()).hexdigest()}  {file.relative_to(stage).as_posix()}\n'
        for file in files))
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as output:
        for file in sorted(stage.rglob('*')):
            if file.is_file():
                output.write(file, file.relative_to(stage.parent))
    with zipfile.ZipFile(archive) as output:
        assert output.testzip() is None
        sums = output.read(f'{name}/SHA256SUMS').decode()
        for line in sums.splitlines():
            expected, relative = line.split('  ', 1)
            assert hashlib.sha256(output.read(f'{name}/{relative}')).hexdigest() == expected, relative
    sha256 = hashlib.sha256(archive.read_bytes()).hexdigest()
    Path(str(archive) + '.sha256').write_text(f'{sha256}  {archive.name}\n')
    print(json.dumps({'archive': str(archive), 'sha256': sha256,
                      'files': len(files) + 1, 'bytes': archive.stat().st_size}, indent=2))

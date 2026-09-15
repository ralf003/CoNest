#!/usr/bin/env python3
"""Report required frozen link dependencies without installing or modifying them."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
pkg = json.loads((root / 'bridge/package.json').read_text())
missing = []
for group in ('dependencies', 'devDependencies', 'optionalDependencies'):
    for name, spec in pkg.get(group, {}).items():
        if spec.startswith('link:') and not (root / 'bridge' / spec[5:] / 'package.json').is_file():
            missing.append((name, spec[5:]))
if missing:
    print('Missing frozen dependencies:')
    for name, target in missing:
        print(f'  {name}: {target}')
    raise SystemExit(1)
print('All declared link dependency package manifests exist. Run the build to verify compiled contents.')

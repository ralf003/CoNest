#!/usr/bin/env python3
"""Bundle existing qualified artifacts and browser-readable handoff documents."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import zipfile
from urllib.parse import unquote

BRIDGE = Path(__file__).resolve().parents[1]
PROJECT = BRIDGE.parent
NAME = 'conest-ubuntu-demo-0.6.2'
OUTPUT = BRIDGE / 'releases' / 'ubuntu-demo'
PAYLOADS = {
    'releases/delivery/local-conest-connector-0.6.2.tgz':
        'c2f8c8b12ffebd7f3ca6d604ae77da897331603940ba7deaad53715ed0fb2371',
    'releases/ubuntu-demo/dsh-web-demo-0.1.0-rc.5-linux-x64.tar.gz':
        'f59f9a08c7645a8a0e20e15565c6e8d2da806374f229a69c241afe581ef1b7ff',
}


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def copy(source, target):
    if source.is_symlink():
        raise RuntimeError(f'Unexpected source symlink: {source}')
    target.parent.mkdir(parents=True, exist_ok=True)
    if source.is_dir():
        shutil.copytree(source, target, ignore=shutil.ignore_patterns(
            'node_modules', '.env*', '.npmrc', '__pycache__', '.git'), symlinks=True)
    else:
        shutil.copy2(source, target)


RENDERER = r'''
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const [root, markedPath] = process.argv.slice(1);
const {marked} = await import(pathToFileURL(markedPath).href);
const names = ['先看这里.md', '源码说明.md', 'docs/Ubuntu本地安装与演示教程.md', 'docs/CoNest当前设计说明.md'];
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const css = `:root{font-family:Inter,"Noto Sans CJK SC","Microsoft YaHei",system-ui,sans-serif;color:#203149;background:#edf3f9;line-height:1.8}*{box-sizing:border-box}body{margin:0}header{background:#102944;color:#fff;padding:32px max(24px,calc((100vw - 1040px)/2))}header strong{font-size:25px;letter-spacing:2px}header p{margin:3px 0;color:#b9d9ed}nav{margin-top:16px;display:flex;flex-wrap:wrap;gap:20px}nav a{color:#9ddcec}main{max-width:1100px;margin:28px auto 60px;background:white;padding:35px 44px;border-radius:18px;box-shadow:0 8px 35px #1636510b}h1{font-size:30px;line-height:1.4}h2{margin-top:42px;padding-bottom:8px;border-bottom:2px solid #e5eff5;color:#174b72}h3{margin-top:28px}a{color:#08799d;text-underline-offset:3px}pre{background:#152d42;color:#e6f3fa;padding:20px;border-radius:10px;overflow-x:auto;line-height:1.65}code{font-family:"DejaVu Sans Mono",Consolas,monospace;font-size:.89em}p code,li code,td code{background:#edf4f8;padding:2px 5px;border-radius:4px;overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;display:block;overflow:auto;margin:20px 0;font-size:14px}th{background:#e5f2f7;color:#174b72}th,td{padding:12px 14px;border:1px solid #d9e4ed;text-align:left;vertical-align:top}tr:nth-child(even){background:#f8fafc}blockquote{border-left:4px solid #56bbaa;margin:20px 0;padding:8px 20px;background:#edf8f4}img{max-width:100%;border-radius:10px}li{margin:8px 0}footer{font-size:13px;color:#65798b;margin-top:36px;border-top:1px solid #e0e8ee;padding-top:16px}@media(max-width:700px){main{margin:12px;padding:20px}h1{font-size:25px}header{padding:22px}pre{padding:14px}}@media print{header,nav{display:none}body{background:white}main{box-shadow:none;margin:0;padding:0}pre{white-space:pre-wrap;background:#f1f4f7;color:black}a{color:inherit}}`;
for (const name of names) {
  const rel = name.startsWith('docs/') ? '../' : '';
  const md = fs.readFileSync(path.join(root,name),'utf8');
  let body = marked.parse(md);
  // Only rewrite document links whose HTML counterparts are emitted here.
  body = body.replace(/href="([^"]+)\.md"/g, (all, link) => {
    const resolved = path.relative(root,path.resolve(root,path.dirname(name),decodeURIComponent(link)+'.md'));
    return names.includes(resolved) ? `href="${link}.html"` : all;
  });
  const title = escape(md.split('\n')[0].replace(/^#\s*/,''));
  fs.writeFileSync(path.join(root,name.replace(/\.md$/,'.html')),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style><header><strong>CoNest</strong><p>Ubuntu 演示交付 · Connector 0.6.2</p><nav><a href="${rel}先看这里.html">开始使用</a><a href="${rel}docs/Ubuntu本地安装与演示教程.html">安装与演示教程</a><a href="${rel}docs/CoNest当前设计说明.html">当前设计</a><a href="${rel}源码说明.html">源码说明</a></nav></header><main>${body}<footer>固定版本：OpenClaw 2026.9.2 · DSH 0.1.0-rc.5 · Node 24.15.0 · Ubuntu x86_64。文档可离线阅读。</footer></main></html>`);
}
'''


def main():
    if json.loads((BRIDGE / 'package.json').read_text())['version'] != '0.6.2':
        raise RuntimeError('The Ubuntu 0.6.2 builder must run from the frozen baseline; use pack-multiplatform.py for the current release')
    for relative, expected in PAYLOADS.items():
        if digest(BRIDGE / relative) != expected:
            raise RuntimeError(f'Qualified artifact changed: {relative}')
    node = 'node'
    marked = BRIDGE / 'node_modules/marked/lib/marked.esm.js'
    with tempfile.TemporaryDirectory(prefix='conest-delivery-') as tmp:
        root = Path(tmp) / NAME
        root.mkdir()
        for folder in ['docs', 'src', 'scripts', 'test', 'examples', 'companions',
                       'delivery', 'reports/studio-0.6.2', 'reports/ubuntu-tutorial']:
            copy(BRIDGE / folder, root / folder)
        for path in list(BRIDGE.glob('*.md')) + list(BRIDGE.glob('*.json')) + list(BRIDGE.glob('*.yaml')):
            copy(path, root / path.name)
        for relative in PAYLOADS:
            for suffix in ['', '.sha256']:
                copy(BRIDGE / (relative + suffix), root / (relative + suffix))
        for name in ['README.md', 'dsh-runtime-provenance.json']:
            copy(OUTPUT / name, root / 'releases/ubuntu-demo' / name)
        for path in (BRIDGE / 'delivery/ubuntu').iterdir():
            copy(path, root / path.name)
        for path in root.rglob('*'):
            if path.is_symlink():
                raise RuntimeError(f'Unexpected bundled symlink: {path}')
        for path in root.glob('*.sh'):
            path.chmod(0o755)
            subprocess.run(['bash', '-n', str(path)], check=True)
        subprocess.run([str(node), '--input-type=module', '-e', RENDERER, str(root), str(marked)], check=True)
        checked_links = 0
        for path in [*root.glob('*.html'), *root.glob('docs/*.html')]:
            for href in re.findall(r'href="([^"]+)"', path.read_text()):
                if re.match(r'^[a-z]+:', href) or href.startswith('#'):
                    continue
                if not (path.parent / unquote(href.split('#')[0])).exists():
                    raise RuntimeError(f'Broken document link: {path.name}: {href}')
                checked_links += 1
        files = sorted(p for p in root.rglob('*') if p.is_file())
        (root / 'SHA256SUMS').write_text(''.join(f'{digest(p)}  {p.relative_to(root).as_posix()}\n' for p in files))
        # Exercise the user-facing prepare step twice in a disposable destination.
        env = dict(os.environ, CONEST_FILES_DIR=str(Path(tmp) / 'downloads'))
        for _ in range(2):
            subprocess.run(['bash', str(root / 'prepare.sh')], cwd=tmp, env=env, check=True)
        archive = OUTPUT / (NAME + '.zip')
        temporary_archive = OUTPUT / (NAME + '.zip.tmp')
        with zipfile.ZipFile(temporary_archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6, strict_timestamps=False) as zf:
            for path in sorted(p for p in root.rglob('*') if p.is_file()):
                compression = zipfile.ZIP_STORED if path.name.endswith(('.tgz', '.tar.gz', '.png')) else zipfile.ZIP_DEFLATED
                zf.write(path, path.relative_to(root.parent).as_posix(), compress_type=compression)
        with zipfile.ZipFile(temporary_archive) as zf:
            if zf.testzip() is not None:
                raise RuntimeError('ZIP integrity failure')
            entries = len(zf.infolist())
        temporary_archive.replace(archive)
        sha = digest(archive)
        archive.with_suffix('.zip.sha256').write_text(f'{sha}  {archive.name}\n')
        result = {'archive': str(archive), 'bytes': archive.stat().st_size,
                  'sha256': sha, 'entries': entries, 'htmlLinksChecked': checked_links,
                  'prepareVerified': True, 'repeatPrepareVerified': True,
                  'zipIntegrity': 'passed', 'qualifiedInnerArchives': 'unchanged'}
        (OUTPUT / 'bundle-checks.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()

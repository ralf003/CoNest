from pathlib import Path
import importlib.util,subprocess,json
bridge=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('baseline_docs',bridge/'scripts/pack-ubuntu-delivery.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
renderer=module.RENDERER.replace("'源码说明.md', ",'').replace('Ubuntu本地安装与演示教程','RedHat8与Windows安装演示教程').replace('CoNest当前设计说明','多平台适配设计与验证').replace('源码说明.html','docs/多平台适配设计与验证.html').replace('源码说明</a>','验证说明</a>').replace('Ubuntu 演示交付 · Connector 0.6.2','多平台候选交付 · Connector 0.6.3').replace('Ubuntu x86_64','Red Hat 8 系 / Windows x64（验证状态见说明）')
import sys
root=Path(sys.argv[1]) if len(sys.argv)>1 else bridge
if root==bridge:
 (bridge/'先看这里.md').write_text((bridge/'delivery/multiplatform/先看这里.md').read_text())
node=bridge.parent/'.tooling/node_modules/.bin/node';marked=bridge.parent/'source/workspace/deepseek-harness/node_modules/.pnpm/marked@16.4.2/node_modules/marked/lib/marked.esm.js'
subprocess.run([str(node),'--input-type=module','-e',renderer,str(root),str(marked)],check=True)

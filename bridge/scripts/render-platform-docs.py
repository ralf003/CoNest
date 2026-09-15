from pathlib import Path
import importlib.util,subprocess,json
bridge=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('baseline_docs',bridge/'scripts/pack-ubuntu-delivery.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
renderer=module.RENDERER.replace("'SOURCE-NOTES-zh.md', ",'').replace('ubuntu-installation-demo-zh','rhel8-windows-installation-demo-zh').replace('conest-design-zh','multiplatform-design-validation-zh').replace('SOURCE-NOTES-zh.html','docs/multiplatform-design-validation-zh.html').replace('源码说明</a>','验证说明</a>').replace('Ubuntu 演示交付 · Connector 0.6.2','多平台候选交付 · Connector 0.6.3').replace('Ubuntu x86_64','Red Hat 8 系 / Windows x64（验证状态见说明）')
import sys
root=Path(sys.argv[1]) if len(sys.argv)>1 else bridge
if root==bridge:
 (bridge/'START-HERE-zh.md').write_text((bridge/'delivery/multiplatform/START-HERE-zh.md').read_text())
node='node';marked=bridge/'node_modules/marked/lib/marked.esm.js'
subprocess.run([str(node),'--input-type=module','-e',renderer,str(root),str(marked)],check=True)

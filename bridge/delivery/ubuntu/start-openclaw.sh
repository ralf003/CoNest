#!/usr/bin/env bash
set -euo pipefail
if [[ ! -f "$HOME/conest-demo/env.sh" ]]; then
  echo '请先按 Ubuntu 教程完成第 3–6 节安装和 Key 配置。' >&2
  exit 1
fi
source "$HOME/conest-demo/env.sh"
if [[ ! -f "$CONEST_PLUGIN_DIR/dist/demo-studio.mjs" || ! -s "$CONEST_CREDENTIAL_FILE" ]]; then
  echo '未找到已安装的插件或模型凭据，请完成教程第 4、6 节。' >&2
  exit 1
fi
cd "$CONEST_HOME"
exec node "$CONEST_PLUGIN_DIR/dist/demo-studio.mjs" --live

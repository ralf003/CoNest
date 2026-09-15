#!/usr/bin/env bash
set -euo pipefail
if [[ ! -f "$HOME/conest-demo/env.sh" ]]; then
  echo '请先按 Ubuntu 教程完成安装。' >&2
  exit 1
fi
source "$HOME/conest-demo/env.sh"
conest_dsh_entry="$CONEST_HOME/dsh-runtime/deepseek-harness/apps/cli/lib/bin.js"
if [[ ! -f "$conest_dsh_entry" || ! -f "$DSH_HOME/profiles/web/package.json" ]]; then
  echo '请先完成教程第 7 节：解压 DSH，并安装 DSH 侧 CoNest 插件。' >&2
  exit 1
fi
cd "$CONEST_HOME"
exec node "$conest_dsh_entry" web --host 127.0.0.1 --port 18801

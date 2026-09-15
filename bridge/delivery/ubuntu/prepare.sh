#!/usr/bin/env bash
set -euo pipefail
conest_bundle_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
conest_downloads="${CONEST_FILES_DIR:-$HOME/conest-demo/downloads}"
cd "$conest_bundle_dir"
echo '正在核对交付文件……'
sha256sum --check --quiet SHA256SUMS
mkdir -p "$conest_downloads"
conest_payloads=(
  releases/delivery/local-conest-connector-0.6.2.tgz
  releases/delivery/local-conest-connector-0.6.2.tgz.sha256
  releases/ubuntu-demo/dsh-web-demo-0.1.0-rc.5-linux-x64.tar.gz
  releases/ubuntu-demo/dsh-web-demo-0.1.0-rc.5-linux-x64.tar.gz.sha256
)
for conest_file in "${conest_payloads[@]}"; do
  conest_target="$conest_downloads/${conest_file##*/}"
  if [[ -e "$conest_target" ]] && ! cmp -s "$conest_file" "$conest_target"; then
    printf '目标已存在且内容不同，请先移走后重试：%s\n' "$conest_target" >&2
    exit 1
  fi
done
for conest_file in "${conest_payloads[@]}"; do
  conest_target="$conest_downloads/${conest_file##*/}"
  if [[ ! -e "$conest_target" ]]; then cp -- "$conest_file" "$conest_target"; fi
done
printf '\n校验通过，四个安装文件已准备到：%s\n' "$conest_downloads"
echo '请打开 docs/Ubuntu本地安装与演示教程.html，从第 3 节开始安装。'
echo '此脚本只准备文件；首次安装 Node/OpenClaw、获取市场清单和真实模型调用需要联网。'

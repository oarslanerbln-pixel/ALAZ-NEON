#!/bin/bash
# Claude Code on the web oturumlarinda bagimliliklari kurar; boylece
# typecheck / lint / test ilk turdan itibaren calisir.
set -euo pipefail

# Yerel makinede calismaya gerek yok: gelistiricinin node_modules'u zaten var.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# npm ci yerine npm install: konteyner durumu hook bittikten sonra
# onbellege alindigi icin tekrar calismalar aninda tamamlanir.
npm install --no-audit --no-fund

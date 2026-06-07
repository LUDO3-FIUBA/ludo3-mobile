#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

LOCAL_CLI="$SCRIPT_DIR/node_modules/playwright/cli.js"

if [ ! -f "$LOCAL_CLI" ]; then
  echo "Playwright no encontrado. Instalando dependencias..."
  npm install
fi

# Setup test DB user (idempotent — safe to run every time)
bash "$SCRIPT_DIR/scripts/setup-db.sh"

node "$LOCAL_CLI" test --config playwright.config.ts "$@"

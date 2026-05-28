#!/bin/bash
cd "$(dirname "$0")"

PLAYWRIGHT_CLI="$(dirname "$0")/node_modules/.bin/playwright"

if [ ! -f "$PLAYWRIGHT_CLI" ]; then
  echo "Playwright no encontrado. Instalando dependencias..."
  cd "$(dirname "$0")" && npm install
fi

# Setup test DB user (idempotent — safe to run every time)
bash "$(dirname "$0")/setup-db.sh"

node "$PLAYWRIGHT_CLI" test --config playwright.config.ts "$@"

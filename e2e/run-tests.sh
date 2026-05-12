#!/bin/bash
cd "$(dirname "$0")"

PLAYWRIGHT_CLI="/Users/lsalluzzi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/cli.js"

if [ ! -f "$PLAYWRIGHT_CLI" ]; then
  echo "Playwright no encontrado en caché. Instalando..."
  npx playwright install chromium
  PLAYWRIGHT_CLI=$(find ~/.npm/_npx -name "cli.js" -path "*/playwright/cli.js" 2>/dev/null | tail -1)
fi

node "$PLAYWRIGHT_CLI" test --config playwright.config.ts "$@"

#!/bin/bash
# This script lives in mobile/e2e/scripts/ but expects to run from the e2e
# directory (where node_modules, playwright.config.ts and tests/ live).
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR/.."

# Prefer the locally-installed @playwright/test (matches what specs import).
# Falls back to the npx cache for environments without a local install.
LOCAL_CLI="./node_modules/playwright/cli.js"
CACHE_CLI="/Users/lsalluzzi/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/cli.js"

if [ -f "$LOCAL_CLI" ]; then
  PLAYWRIGHT_CLI="$LOCAL_CLI"
elif [ -f "$CACHE_CLI" ]; then
  PLAYWRIGHT_CLI="$CACHE_CLI"
else
  echo "Playwright no encontrado. Instalando localmente..."
  npm install --save-dev @playwright/test
  npx playwright install chromium
  PLAYWRIGHT_CLI="$LOCAL_CLI"
fi

# Setup test DB user (idempotent — safe to run every time)
bash scripts/setup-db.sh

node "$PLAYWRIGHT_CLI" test --config playwright.config.ts "$@"

#!/bin/bash
# Seed the local DB with the Playwright e2e test fixture.
#
# All seeding logic and test data live in seed_test_data.py; this wrapper
# only loads credentials from test-user.env and pipes the script into the
# backend container's Django shell.
#
# Safe to run multiple times — the Python script is idempotent.

# shellcheck source=../test-user.env
SCRIPT_DIR="$(dirname "$0")"
E2E_DIR="$SCRIPT_DIR/.."
source "$E2E_DIR/test-user.env"

# BACKEND_DIR in the env file is relative to the e2e directory (where the
# env file lives); resolve it here so docker-compose works regardless of
# the caller's CWD.
BACKEND_DIR="$E2E_DIR/$BACKEND_DIR"

echo "[setup-db] Checking Docker..."
if ! docker ps --filter "name=web" --format "{{.Names}}" 2>/dev/null | grep -q web; then
  echo "[setup-db] Backend container not running. Start it with: cd ludo3-backend && docker compose up"
  exit 1
fi

# Support both Docker Compose v2 (`docker compose`) and the legacy v1 binary
# (`docker-compose`). Prefer v1 if present for backwards compatibility.
if command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker-compose)
elif docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE=(docker compose)
else
  echo "[setup-db] Neither 'docker-compose' nor 'docker compose' is available."
  exit 1
fi

echo "[setup-db] Seeding test user and approved subjects..."
# Pass values explicitly with `-e KEY=VALUE` (not just `-e KEY`) — sourcing
# test-user.env defines shell vars but does not export them, so the
# pass-through-from-caller form would forward empty values.
"${DOCKER_COMPOSE[@]}" -f "$BACKEND_DIR/docker-compose.yml" exec -T \
  -e TEST_USER_DNI="$TEST_USER_DNI" \
  -e TEST_USER_EMAIL="$TEST_USER_EMAIL" \
  -e TEST_USER_PADRON="$TEST_USER_PADRON" \
  -e TEST_USER_PASSWORD="$TEST_USER_PASSWORD" \
  -e TEST_USER_FIRST_NAME="$TEST_USER_FIRST_NAME" \
  -e TEST_USER_LAST_NAME="$TEST_USER_LAST_NAME" \
  web python manage.py shell < "$SCRIPT_DIR/seed_test_data.py"

echo "[setup-db] Done."

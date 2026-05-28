import * as fs from 'fs';
import * as path from 'path';

// Parses test-user.env (the same file setup-db.sh sources). Lines containing
// unresolved shell expansions like `$(dirname "$0")` or `$SCRIPT_DIR` are
// skipped — those are only meaningful when sourced from a shell script.
const envPath = path.resolve(__dirname, '..', 'test-user.env');
const env: Record<string, string> = {};

for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (!match) continue;
  const [, key, rawValue] = match;
  if (/\$[({]|\$[A-Z_]/.test(rawValue)) continue;
  let value = rawValue;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

function required(key: string): string {
  const value = env[key];
  if (!value) throw new Error(`Missing ${key} in test-user.env`);
  return value;
}

export const BASE = required('TEST_BASE_URL');
export const BACKEND = required('TEST_BACKEND_URL');
export const DNI = required('TEST_USER_DNI');
export const PASS = required('TEST_USER_PASSWORD');
export const EMAIL = required('TEST_USER_EMAIL');
export const PADRON = required('TEST_USER_PADRON');
export const FIRST_NAME = required('TEST_USER_FIRST_NAME');
export const LAST_NAME = required('TEST_USER_LAST_NAME');
export const FULL_NAME = `${FIRST_NAME} ${LAST_NAME}`;

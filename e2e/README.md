# Ludo E2E Tests

Tests de integración con Playwright para la web app de Ludo.

## Setup (primera vez)

```bash
cd mobile/e2e
npm install                       # instala @playwright/test localmente
npx playwright install chromium   # descarga el browser
```

`scripts/run-tests.sh` prefiere el binario local (`./node_modules/playwright/cli.js`)
y cae al caché de npx solo si no existe instalación local — necesario para que
el runtime y los specs usen la misma copia de `@playwright/test`.

## Requisitos para correr los tests

1. **Backend** en `localhost:8007`:
   ```bash
   cd ludo3-backend && docker-compose up
   ```

2. **Web app** en `localhost:8081`:
   ```bash
   cd ludo3-mobile && npm run web
   ```

3. **(Opcional) VPN de FIUBA** para los tests de integración con SIU Guaraní.
   Los tests en `siu_integration.spec.ts` y `fiuba_map_integration.spec.ts` se
   **saltean automáticamente** si el servidor SIU no es alcanzable o devuelve un
   error — no hace falta conectarse a la VPN para correr el resto de los tests.

   Si la VPN está conectada pero el servicio SIU devuelve 503 (caído
   temporalmente), los tests también se saltean en lugar de fallar.

   El host y puerto del servidor SIU se configuran en `test-user.env`:
   ```
   SIU_HOST=172.25.90.12
   SIU_PORT=8080
   ```

## Correr los tests

```bash
cd mobile/e2e

npm test              # headless
npm run test:headed   # con browser visible (mejor para debugging)
npm run test:menu     # solo menú
npm run test:map      # solo mapa de pisos
npm run test:auth     # solo auth
```

`scripts/run-tests.sh` siempre corre `scripts/setup-db.sh` primero para
asegurar el usuario de prueba en la DB (idempotente).

## Configuración del usuario de prueba

Hay dos archivos de configuración, con responsabilidades distintas:

1. **`test-user.env`** — identidad del usuario y URL de la app. Es el único
   punto de verdad que comparten el shell, Python y TypeScript.

   - `scripts/setup-db.sh` (shell) la sourcea y forwardea las vars `TEST_USER_*`.
   - `scripts/seed_test_data.py` (Python) lee `os.environ['TEST_USER_*']` para
     crear / actualizar el `User` y el `Student`.
   - `tests/test-config.ts` (TS) la parsea y re-exporta como constantes
     (`BASE`, `DNI`, `PASS`, `EMAIL`, `PADRON`, `FIRST_NAME`, `LAST_NAME`,
     `FULL_NAME`) que las specs importan en lugar de hardcodear strings.

   ```
   TEST_BASE_URL=http://localhost:8081
   TEST_BACKEND_URL=http://localhost:8007
   TEST_USER_DNI=00000001
   TEST_USER_EMAIL=user.test@ludo.com
   TEST_USER_PADRON=00001
   TEST_USER_PASSWORD=pelusa22
   TEST_USER_FIRST_NAME=Joe
   TEST_USER_LAST_NAME=Doe

   # SIU Guaraní (VPN required — tests skip automatically when unreachable)
   SIU_HOST=172.25.90.12
   SIU_PORT=8080
   ```

2. **`scripts/seed_test_data.py`** — datos académicos que NO van por env:
   lista de materias aprobadas (`APPROVED_SUBJECTS`), apellido del docente a
   usar (`TEACHER_LAST_NAME`) y fecha de los finales (`EXAM_DATE`). Editar
   esas constantes al principio del archivo cambia lo que el seed inserta.

Para cambiar credenciales, nombre, URL del web app o ruta del backend, editá
`test-user.env`. Para agregar/quitar materias o cambiar el docente, editá
`scripts/seed_test_data.py`.

## Estructura

```
e2e/
├── tests/
│   ├── test-config.ts            # parsea test-user.env → BASE/DNI/PASS/.../FULL_NAME
│   ├── helpers.ts                # login y navegación reutilizables
│   ├── auth.spec.ts              # login, landing, credenciales inválidas
│   ├── menu.spec.ts              # sidebar, submenus
│   ├── navigation.spec.ts        # flujos de navegación
│   ├── home.spec.ts              # pantalla de inicio
│   ├── academic.spec.ts          # Materias aprobadas/pendientes/en curso, stats
│   ├── calendar.spec.ts          # vista de calendario
│   ├── forms.spec.ts             # trámites
│   ├── user.spec.ts              # submenu de Usuario (credencial, cuenta, etc.)
│   ├── alert_dialog.spec.ts      # AlertDialog component (fix/alert-compatibility)
│   ├── map_floor.spec.ts         # mapa de pisos, búsqueda, cambio de piso
│   ├── fiuba_map_integration.spec.ts  # integración con FIUBA-Map (VPN)
│   └── siu_integration.spec.ts   # integración con SIU Guaraní (VPN)
├── test-user.env                 # identidad del usuario + URL (shell/Python/TS)
├── scripts/
│   ├── seed_test_data.py         # lógica + datos académicos del seed (Python)
│   ├── setup-db.sh               # wrapper: sourcea env y pipea seed_test_data.py al shell de Django
│   └── run-tests.sh              # wrapper que prefiere playwright local
├── playwright.config.ts
└── package.json
```

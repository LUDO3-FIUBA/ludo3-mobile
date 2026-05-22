# Ludo E2E Tests

Tests de integración con Playwright para la web app de Ludo.

## Setup (primera vez)

```bash
# 1. Instalar playwright y crear symlinks
npx playwright install chromium

# 2. Crear node_modules locales (solo si no existen)
cd e2e
PW=$(find ~/.npm/_npx -name "cli.js" -path "*/playwright/cli.js" | grep -v alpha | head -1 | xargs dirname | xargs dirname)
mkdir -p node_modules/@playwright
ln -sf "$PW" node_modules/@playwright/test
ln -sf "$PW" node_modules/playwright
```

## Requisitos para correr los tests

1. **Backend** en `localhost:8007`:
   ```bash
   cd ludo3-backend && docker-compose up
   ```

2. **Web app** en `localhost:8081`:
   ```bash
   cd ludo3-mobile && npm run web
   ```

## Correr los tests

```bash
cd e2e

npm test              # headless
npm run test:headed   # con browser visible (mejor para debugging)
npm run test:menu     # solo menú
npm run test:map      # solo mapa de pisos
npm run test:auth     # solo auth
```

## Usuario de prueba

- **DNI**: `37247189`  
- **Contraseña**: `soydeferro`

## Estructura

```
e2e/
├── tests/
│   ├── helpers.ts         # login y navegación reutilizables
│   ├── auth.spec.ts       # login, logout, landing
│   ├── menu.spec.ts       # sidebar, submenus, navegación (PR: menu)
│   ├── map_floor.spec.ts  # mapa de pisos, búsqueda, cambio de piso (PR: map)
│   ├── navigation.spec.ts # flujos generales de navegación
│   └── forms.spec.ts      # trámites
├── playwright.config.ts
├── run-tests.sh           # wrapper que encuentra playwright automáticamente
└── package.json
```

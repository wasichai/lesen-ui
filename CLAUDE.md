# Lesen — interfaz

Aprender idiomas leyendo. Esta es la interfaz web (React) de Lesen sobre `@wasichai/*`; el backend es `wasichai/lesen`
(su `docs/` tiene requisitos, arquitectura, API y ADR). El sistema de diseño está en `docs/design-system/lesen/`.

## Stack (no negociable sin ADR nueva en el backend)

React 19.3 · Vite 8 · TypeScript 7 · Tailwind CSS 4 · react-router 8 · TanStack Query 5 · i18next · zod · Vitest 5 ·
Testing Library · Playwright · Node 26 · Yarn 1. `@wasichai/core`, `@wasichai/ui` y `@wasichai/testing` de GitHub
Packages, fijados todos a la misma versión exacta.

## Reglas

1. **Una sola `WasichaiApp`** en `src/main.tsx`: un router, el login y la sesión de core. Cada experiencia es un
   `WasichaiModule` en `src/modules/<id>/` (rutas, i18n). Todas las rutas son `chrome: 'bare'` con `LearnerLayout`;
   el lector va sin marco (ADR-0006 del backend).
2. **Los módulos no se importan entre sí.** Lo compartido vive en `src/shared` (contratos, marco, componentes, claves de
   ruta en `shared/routes.ts`). `src/test/modules.test.ts` lo comprueba.
3. **Enlaces por clave de ruta** con `useWasichaiLinks()`; nunca una URL escrita a mano. Un enlace a otro módulo se
   protege con `links.has(…)`.
4. **Ningún texto visible escrito en un componente**: todo pasa por el i18n del módulo (es y en, con las mismas claves;
   lo comprueba la misma prueba). El nombre del producto sale de `VITE_APP_NAME` (`useAppName`).
5. **La API con el cliente de core** (`useLesenApi` en `shared/api.ts`) y cada respuesta validada con zod
   (`contract.ts`). Sin datos (404) es una respuesta (`orNull`), no un fallo.
6. **Lógica fuera de los componentes**: funciones puras con pruebas (`readerModel.ts`, `catalogFilters.ts`,
   `onboardingModel.ts`, `readerPreferences.ts`, `progressModel.ts`) y hooks.
7. **Accesibilidad WCAG 2.2 AA**: los tokens pasan `lesen.test.ts` (contraste), objetivos de 44 px, foco visible, `lang`
   en todo texto del idioma de estudio, movimiento reducido. `e2e/a11y.spec.ts` corre axe.
8. **Nada inventado**: si el backend no tiene la entrada o la traducción, la interfaz lo dice.
9. Sin sobreingeniería ni dependencias sin un requisito que las pida.

## Forma de trabajar

- Código en inglés; documentación, comentarios y mensajes de commit en español. Conventional Commits (commitlint).
- `.editorconfig` manda (160 columnas). Prettier sin punto y coma, comillas simples. `yarn format` antes de commitear.
- Definition of Done: `yarn lint && yarn typecheck && yarn test && yarn build && yarn e2e`, ejecutados y en verde.
- Las pruebas e2e usan la API simulada de `e2e/api.ts` sobre respuestas reales capturadas con
  `e2e/fixtures/capture.mjs`; si cambia el contrato, se vuelven a capturar.
- El token de GitHub Packages va en `~/.npmrc`, nunca en el repositorio.

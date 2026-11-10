# Lesen — interfaz

La interfaz web de Lesen: aprender idiomas leyendo historias que apetece leer. Descubrir lecturas de tu nivel, leer
con un diccionario en cada palabra, traducir solo lo que haga falta, guardar vocabulario y volver donde lo dejaste.

React 19 · Vite 8 · TypeScript · Tailwind CSS 4 · `@wasichai/core` y `@wasichai/ui`. El backend es
[`wasichai/lesen`](https://github.com/wasichai/lesen).

## Arrancar

Requisitos: Node 26, Yarn 1 y un token de GitHub con `read:packages` en `~/.npmrc`:

```text
//npm.pkg.github.com/:_authToken=<token>
```

```bash
yarn install
cp .env.example .env    # WASICHAI_API_URL apunta al backend (http://localhost:8095)
yarn dev                # http://localhost:5190
```

Con el backend en perfil dev y `model/apply.py --demo` aplicado, entra con `lena@demo.lesen.test` o
`tomas@demo.lesen.test` (la contraseña es la que diste a `LESEN_DEMO_PASSWORD`). Tomás no tiene perfil todavía: verás
el onboarding.

## Pruebas

```bash
yarn lint && yarn typecheck   # Prettier y TypeScript
yarn test                     # Vitest: modelos, contratos, componentes, fronteras, i18n, contraste del tema
yarn e2e                      # Playwright con la API simulada: recorrido completo, teclado, móvil, 6 anchos, axe
E2E_REAL=1 LESEN_PASSWORD=… yarn e2e:real   # humo contra el backend de verdad
yarn e2e:visual               # capturas de cada pantalla a 360–1920 px (solo en local)
VISUAL_DIRECTION=gaceta yarn e2e:visual       # las mismas, con otra identidad del perfil (por defecto, Musgo)
A11Y_DIRECTION=gaceta yarn e2e e2e/a11y.spec.ts   # axe con esa identidad
```

Las respuestas de la API simulada (`e2e/fixtures/lesen.json`) se capturan del backend real con
`LESEN_EMAIL=… LESEN_PASSWORD=… node e2e/fixtures/capture.mjs` (el estudio, como la editora de la demostración con la
misma contraseña, o `LESEN_EDITOR_EMAIL` y `LESEN_EDITOR_PASSWORD`), junto con la narración de una lectura
(`e2e/fixtures/audio/`) y las portadas ilustradas (`e2e/fixtures/covers/`); la simulación sirve la narración con
rangos, como el servidor.

La identidad visual se elige en el perfil (Musgo por defecto, cuatro más): `docs/design-system/lesen/explorations/`.

## Estructura

| Ruta                     | Qué es                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `src/modules/onboarding` | Primer paso: idiomas, nivel, intereses, ritmo                                                |
| `src/modules/discover`   | Portada editorial, catálogo con filtros en la URL, ficha de lectura                          |
| `src/modules/reader`     | El lector inmersivo: palabras, diccionario en contexto, traducciones, ayudas, posición       |
| `src/modules/library`    | Mis lecturas: en curso, guardadas, leídas y listas propias                                   |
| `src/modules/vocabulary` | El cuaderno de vocabulario                                                                   |
| `src/modules/dictionary` | Diccionario bilingüe: búsqueda en dos sentidos, entradas, favoritas, historial               |
| `src/modules/progress`   | Panel de progreso (medido y estimado), metas, racha semanal, logros, resumen semanal         |
| `src/modules/profile`    | Perfil de aprendizaje, metas y apariencia                                                    |
| `src/modules/studio`     | Estudio editorial: borradores, texto y traducciones, preguntas, audio, revisión, historial   |
| `src/shared`             | Marcos (`LearnerLayout`, `StudioLayout`), contratos compartidos, componentes, claves de ruta |
| `src/theme`              | Tokens y temas de Lesen (página y lector)                                                    |

## Integración continua

`yarn install` necesita leer `@wasichai/*` de GitHub Packages: el secreto `PACKAGES_TOKEN` (un PAT con `read:packages`)
o el acceso de Actions de este repositorio a esos paquetes. El trabajo `e2e-real` compila `main` de `wasichai/lesen`.

## Licencia

LGPL-3.0-or-later.

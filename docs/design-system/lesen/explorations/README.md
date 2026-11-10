# Identidades visuales (exploración de 2026-11)

Cuatro direcciones nuevas para la identidad de Lesen, en web y en Flutter, comparadas con «Papel y tinta».
**Decisión:** las cinco se ofrecen en el perfil, para que cada persona elija la suya, y **Musgo es la de por defecto**
(ADR-0011 de lesen-app, que reemplaza la ADR-0008). La elección se guarda en el dispositivo; las preferencias de la
cuenta aún no tienen dónde guardarla, y el campo se ha pedido al backend.

| Documento                                    | Contenido                                                                                             |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [audit.md](audit.md)                         | El sistema visual actual en las dos plataformas: lo que funciona, las debilidades y las oportunidades |
| [directions/gaceta.md](directions/gaceta.md) | **Gaceta**: editorial y literaria (Fraunces, Source Serif 4, IBM Plex Sans)                           |
| [directions/pulso.md](directions/pulso.md)   | **Pulso**: aprendizaje vibrante (Plus Jakarta Sans, Literata)                                         |
| [directions/musgo.md](directions/musgo.md)   | **Musgo**: calma natural (Manrope, Source Serif 4)                                                    |
| [directions/atlas.md](directions/atlas.md)   | **Atlas**: minimal premium con guiño cultural (Geist, Newsreader)                                     |
| [comparison.md](comparison.md)               | La matriz de comparación y las capturas de web y móvil                                                |
| [recommendation.md](recommendation.md)       | La recomendación razonada y cómo se adoptaría                                                         |
| `tokens/<id>.json`                           | La fuente compartida de cada dirección (web y Flutter la leen igual)                                  |
| `captures/`                                  | Hojas de comparación de las cinco identidades, generadas con la suite visual                          |

## Cómo funciona

### Web (lesen-ui)

- **Elegir:** Perfil → Apariencia de la app → Identidad (cinco opciones, con su muestra de color). Se guarda en
  `localStorage['lesen.direction']` y se aplica en el acto. El script de arranque de `index.html` la pone antes del
  bundle, sin destello; Musgo si no hay nada o el valor no es válido.
- **Por dentro:**
  - `src/theme/direction.ts` (`DIRECTIONS`, `DEFAULT_DIRECTION`, `useDirection`) pone `data-direction` en `<html>`.
    Papel y tinta es no poner atributo: es `lesen.css` tal cual.
  - Cada `src/theme/directions/<id>.css` vuelve a pintar los cinco temas de Lesen bajo ese atributo.
  - `<id>.signature.css` añade la firma visual sobre los ganchos `data-ui` de los componentes, que no tienen estilo
    propio.
  - `directions.css` lo reúne y lo importa `src/index.css`.
  - Las `@font-face` de las siete familias están en la build, pero el navegador solo descarga las de la identidad
    activa (`unicode-range` y `font-display: swap`). Musgo carga unos 143 KB la primera vez.
- **Generar:** los `<id>.css` y `swatches.ts` (las muestras del perfil) salen de `tokens/<id>.json` con
  `node scripts/design-directions.mjs`, que comprueba el contraste y no escribe nada si hay un par por debajo de AA
  (`--check` solo comprueba). No se editan a mano.
- **Capturas y accesibilidad:**
  - `VISUAL_DIRECTION=<id> [VISUAL_DARK=1] [VISUAL_VIEWPORTS=phone,desktop] yarn e2e:visual` (14 pantallas a 360, 390,
    768, 1024, 1440 y 1920 px, con un reloj fijo). Sin variable sale Musgo; `papel` reproduce las capturas de antes.
  - `A11Y_DIRECTION=<id> [A11Y_DARK=1] yarn e2e e2e/a11y.spec.ts` pasa axe con esa identidad.

### Flutter (lesen-app)

Se describe en `lesen-app/docs/design/README.md` y en su ADR-0011: la misma elección en el perfil (identidad y modo
claro u oscuro), guardada en el dispositivo, y los goldens por identidad con `flutter test --tags design --run-skipped`.

## Correspondencia de tokens

| Token compartido (semántico)                       | JSON / CSS                                                                       | Flutter (`LesenTokens` · `ReaderPalette`)       |
| -------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| `brand.primary`                                    | `brand` · `--brand`                                                              | `brand` · `brand`                               |
| `brand.strong`                                     | `brand-strong` · `--brand-strong`                                                | `brandStrong`                                   |
| `brand.soft` / `reader.word.active`                | `brand-soft` · `--brand-soft`                                                    | `brandSoft` · `active`                          |
| `brand.accent`                                     | `accent` · `--accent`                                                            | (decoración, en cada widget de firma)           |
| `surface.default` / `reader.background`            | `surface` · `--surface`                                                          | `surface` · `paper`                             |
| `surface.muted`                                    | `surface-muted` · `--surface-muted`                                              | `surfaceMuted`                                  |
| `surface.raised`                                   | `surface-raised` · `--surface-raised`                                            | `surfaceRaised`                                 |
| `text.primary` / `reader.text`                     | `ink` · `--ink`                                                                  | `ink` · `ink`                                   |
| `text.secondary`                                   | `ink-muted` · `--ink-muted`                                                      | `inkMuted` · `inkMuted`                         |
| `state.focus`                                      | `focus` · `--focus`                                                              | `focus`                                         |
| `reader.word.saved`                                | `mark-saved` · `--mark-saved`                                                    | `markSaved` · `saved`                           |
| `reader.word.unknown`                              | `mark-new` · `--mark-new`                                                        | `markNew`                                       |
| `reader.sentence.active`                           | `mark-sentence` · `--mark-sentence`                                              | `markSentence` · `sentence`                     |
| `tone.*`                                           | `sea`, `sage`, `ochre`, `plum`                                                   | `tones[0..3]`                                   |
| `font.display` / `font.read` / `font.sans`         | `--font-display` · `--font-read` · `--font-sans`                                 | `displayFont` · `readingFont` · `interfaceFont` |
| `radius.*`, `radius.button`, `radius.chip`         | `--radius-*` · `--radius-button` · `--radius-chip`                               | `radius*` · `buttonRadius` · `chipRadius`       |
| `shadow.card` / `shadow.raised` / `shadow.overlay` | `--shadow-cover` · `--shadow-cover-raised`, `--shadow-hero` · `--shadow-overlay` | (elevación de cada componente)                  |

Los semánticos (`state.success`, `state.warning`, `state.error`, `state.info` y sus versiones suaves) están en el JSON y
en la web. Flutter hoy los resuelve con `tones` y con el error de Material: adoptar una dirección es el momento de
añadirlos a `LesenTokens`.

## Retirar una identidad

Hay que borrar `tokens/<id>.json`, `directions/<id>.md`, `src/theme/directions/<id>.css` y `<id>.signature.css`,
quitar su línea de `directions.css`, su id de `DIRECTIONS` (`src/theme/direction.ts`) y de la lista del script de
arranque de `index.html`, y su nombre en la lista que espera `src/theme/lesen.test.ts`. Quien la tuviera elegida vuelve
a Musgo. En Flutter, borrar `lib/app/theme/explorations/<id>.dart` y su valor del enum.

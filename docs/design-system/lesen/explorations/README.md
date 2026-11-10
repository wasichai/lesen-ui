# Exploración de identidad visual (2026-11)

Cuatro direcciones nuevas para la identidad de Lesen, en web y en Flutter, comparadas con la de hoy («Papel y tinta»).
**Ninguna está aplicada a producción.** La decisión es de producto y se recoge en una ADR nueva cuando se tome.

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

## El laboratorio de diseño

Las direcciones se ven sobre las pantallas reales, con sus datos y sus interacciones; no son maquetas.

### Web (lesen-ui)

- **Arrancar:** `yarn dev`. Abajo a la izquierda aparece el botón «Laboratorio de diseño», que elige la dirección y el
  tema de la página (como la app, claro u oscuro). El tema del lector se elige en el lector, con «Aa».
- **Enlazar una dirección:** `?direction=gaceta` (o `pulso`, `musgo`, `atlas`). Con un navegador automatizado el botón
  no se pinta; `?lab` lo fuerza.
- **Cómo funciona:**
  - `src/dev/design-lab` pone `data-direction` en `<html>`.
  - Cada `src/theme/explorations/<id>.css` vuelve a pintar los cinco temas de Lesen bajo ese atributo.
  - `<id>.signature.css` añade la firma visual de la dirección sobre los ganchos `data-ui` de los componentes, que no
    tienen estilo propio.
  - `main.tsx` lo importa solo tras `import.meta.env.DEV`, así que la build no lo contiene; se comprueba con un grep en
    `dist/`.
- **Generar:** los `<id>.css` salen de `tokens/<id>.json` con `node scripts/design-directions.mjs`, que comprueba el
  contraste y no escribe nada si hay un par por debajo de AA (`--check` solo comprueba). No se editan a mano.
- **Capturas:**
  - `VISUAL_DIRECTION=<id> [VISUAL_DARK=1] [VISUAL_VIEWPORTS=phone,desktop] yarn e2e:visual` (14 pantallas a 360, 390,
    768, 1024, 1440 y 1920 px).
  - `A11Y_DIRECTION=<id> [A11Y_DARK=1] yarn e2e e2e/a11y.spec.ts` pasa axe con la dirección inyectada sobre la build.

### Flutter (lesen-app)

Se describe en `lesen-app/docs/design/README.md`: un selector flotante solo en el flavor dev y en modo debug, las
direcciones en `lib/app/theme/explorations/` y los goldens por dirección con `flutter test --tags design`.

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

## Retirar una dirección

Basta con borrar `tokens/<id>.json`, `directions/<id>.md`, `src/theme/explorations/<id>.css` y `<id>.signature.css`,
quitar su línea de `lab.css`, su entrada en `DIRECTIONS` (`src/dev/design-lab/index.tsx`) y su nombre en la lista que espera `src/theme/lesen.test.ts`. En Flutter, borrar
`lib/app/theme/explorations/<id>.dart` y su valor del enum. Nada de la app depende de ellas.

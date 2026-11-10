# Auditoría del sistema visual actual («Papel y tinta»)

Fecha: 2026-11-10. Alcance: `wasichai/lesen-ui` (web) y `wasichai/lesen-app` (Flutter). Método: lectura del código y
capturas reales con Playwright, contra el backend de demostración (Lena, perfil en alemán, meta de 10 min) y contra la
API simulada de e2e.

![Descubrir hoy, escritorio](captures/discover-desktop.jpg)

## 1. La identidad de hoy

La explica `../README.md`. Es «Papel y tinta»: papel cálido, tinta profunda, terracota como único acento de acción y
serifa editorial.

- Antes se exploraron «Botánica», descartada porque cansa en sesiones largas, y «Biblioteca nocturna», descartada
  porque es peor para leer de día.
- Las dos sobreviven como tonos (sage, ochre) y como tema oscuro del lector.
- **Resultado:** a la vista, una identidad editorial cuidada, con hero, carriles de portadas SVG ilustradas, titulares
  serif y mucho aire. No parece un LMS.
- **Pero:** es muy próxima a la plantilla «editorial cálida» que hoy usan muchos productos de lectura, y se nota poco
  la marca fuera de las portadas.

### Paleta (web `src/theme/lesen.css`, Flutter `lib/app/theme/tokens.dart`)

| Token          | Claro     | Oscuro    | Lector claro | Lector sepia | Lector oscuro |
| -------------- | --------- | --------- | ------------ | ------------ | ------------- |
| surface        | `#fbf7f0` | `#17181d` | `#fffdf8`    | `#f4ecdd`    | `#121318`     |
| surface-raised | `#fffdf9` | `#212229` | `#ffffff`    | `#f8f1e4`    | `#1c1d23`     |
| ink            | `#1f2430` | `#efe8dc` | `#22252e`    | `#3a2f22`    | `#e2dccf`     |
| ink-muted      | `#565b67` | `#b4ad9f` | `#585c66`    | `#5e4f3c`    | `#aaa396`     |
| brand          | `#a8402a` | `#f19a7b` | `#a8402a`    | `#9a3b25`    | `#f19a7b`     |
| brand-soft     | `#f6e3d8` | `#3b241c` | `#f6e3d8`    | `#eed7c4`    | `#36211a`     |
| focus          | `#2f5d8a` | `#8fb4e3` | `#2f5d8a`    | `#2f5d8a`    | `#8fb4e3`     |
| mark-saved     | `#f4e2a8` | `#4d4220` | `#f4e2a8`    | `#ead39a`    | `#4a3f1e`     |

- **Semánticos:** danger `#b42318`, success `#2f6b47`, warning `#855000` y notice `#275c6b`, cada uno con su versión
  suave.
- **Tonos:** sea, sage, ochre y plum.
- **El oscuro:** se diseñó aparte (fondo grafito, marca salmón) y no es una inversión.

### Tipografía

- **Familias:** Newsreader (variable, `opsz` y `wght`) para titulares y lectura; Source Sans 3 para la interfaz. Las dos
  son OFL y están autoalojadas en woff2 (latin y latin-ext) en la web y como TTF variables en Flutter.
- **Escala web:** display 52/56, h1 40/46, h2 30/36, h3 23/29, h4 19/25, body 16/24, secundaria 14/20, eyebrow 13/16 en
  versalitas.
- **Escala Flutter:** displayLarge 52, headlineLarge 30 y titleLarge 21. No es la misma correspondencia uno a uno: h1
  es 40 en la web y 30 como `headlineLarge` en Flutter.
- **Lectura:** 18–29 px con interlineado 1,55, 1,75 o 1,95, en las dos plataformas.

### Forma

- **Radios:** sm 6, md 10, lg 14, xl 20 y card 18, en las dos plataformas.
- **Botones y chips:** en píldora en la web (`rounded-full`); en Flutter, botones con `radiusLg` (14).
- **Objetivo táctil:** 44 px en la web y 48 dp en Flutter.

## 2. Lo que funciona y se conserva en cualquier dirección

- **Todo pasa por tokens.** La web no usa ningún color de la paleta de Tailwind y Flutter tiene una única fuente, el
  `ThemeExtension` `LesenTokens`. Por eso el laboratorio puede aplicar una dirección entera cambiando solo tokens.
- **Contraste comprobado por prueba** (`lesen.test.ts` y `test/app/accessibility_test.dart`), axe en 18 pantallas y en
  los tres temas del lector.
- **Ningún estado solo por color:** la palabra guardada lleva fondo y punto, la nueva un subrayado de puntos, la
  aprendida un subrayado continuo y la que suena un fondo y un subrayado.
- **Lectura excelente:** medida de 38 rem, eje óptico y tres interlineados a elección.
- **Movimiento reducido** respetado en las dos plataformas.

## 3. Debilidades

### Identidad

1. **Poca marca fuera de las portadas.** Si se quitan las ilustraciones, la interfaz es neutra: el terracota solo
   aparece en el botón principal y en el logo.
2. **Una sola familia serif para titulares y lectura.** Es coherente, pero quita contraste jerárquico: el titular de la
   destacada y el párrafo de lectura tienen la misma voz.
3. **La destacada depende del acento de cada lectura.** Hay un degradado radial al 12 % del color de la portada, así que
   la composición cambia de tono con cada lectura y no con la marca.
4. **El progreso es correcto pero plano.** Tarjetas iguales con borde y nada que celebre; en la cuenta de Lena, sin
   datos, se ve vacío.

### Coherencia técnica

5. **Web:**
   - Unos 90 tamaños y radios arbitrarios (`text-[12.5px]` ×17, `text-[17px]` ×10, `rounded-[28px]`, `rounded-[26px]`…)
     fuera de la escala.
   - `extendCn` no se usa aunque hay tamaños propios.
6. **Sombras con RGB cálido fijo** (`ReadingTile`, `DiscoverPage`, `ReadingDetailPage` y `AudioBar`), iguales en
   oscuro, donde no se ven.
   - En esta rama pasan a tokens (`--shadow-cover`, `--shadow-cover-raised` y `--shadow-hero`) con los mismos valores,
     y producción no cambia.
   - Diseñar las sombras del oscuro queda para la adopción.
7. **`SWATCH` duplicado** en `ReaderSettings.tsx`: el papel de cada tema escrito dos veces. Corregido en esta rama: la
   muestra usa el `data-theme` de su tema.
8. **`theme-color` fijo** (`#fbf7f0`) en `index.html`, también en oscuro.
9. **Flutter:**
   - No hay escala de espaciado: unos 140 `EdgeInsets` literales.
   - Breakpoints sueltos: 600, 640, 720, 900 y 400.
   - Unas 20 familias escritas como cadenas (`'Newsreader'`).
   - `copyWith` de `LesenTokens` ignora sus argumentos.
   - `measure` está definido y no se usa.
   - Las portadas llevan la tinta clara fija también en oscuro (`reading_meta.dart:22`).
10. **Diferencias entre plataformas:**
    - Los botones son píldora en la web y rectángulo de 14 en Flutter.
    - El objetivo táctil es de 44 px en la web y 48 dp en Flutter, lo que es correcto por plataforma, pero no está
      documentado.
    - La escala tipográfica tiene correspondencias distintas.
    - Flutter no tiene `danger`, `success` ni `warning` propios: usa los `tones` y un error `#B3261E` de Material.

### Pruebas

11. **La suite visual web** no cubría el progreso, el lector en sepia y oscuro ni el vistazo del diccionario, y la API
    simulada servía las portadas como un rectángulo de un solo color, así que las capturas no enseñaban la identidad.
    Las dos cosas se corrigen en esta rama.
12. **Flutter** no tiene goldens ni galería, y `pumpWidgetUnderTest` solo usa el tema claro.

## 4. Oportunidades

- Dar a la marca un papel fuera del botón: en las cabeceras de sección, la destacada, el progreso y los logros.
- Separar titulares y lectura en dos voces, o mantener una sola con intención.
- Un oscuro con personalidad propia, no un grafito neutro.
- Hacer del progreso un momento visual, siempre «sin castigo».
- Llevar la escala de espaciado y los breakpoints a tokens compartidos.

## 5. Qué se comparte y qué es de cada plataforma

| Se comparte (tokens de `tokens/*.json`)                                                         | Es de cada plataforma                                                                                           |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Colores de marca, superficies, texto, semánticos, tonos y marcas del lector, en los cinco temas | Navegación: barra superior y pestañas en la web; `NavigationBar` y rail (≥ 600 dp) en Flutter                   |
| Familias, pesos, tracking y escala tipográfica (como relación, no en px exactos)                | Diccionario: popover al pasar el ratón y hoja en la web; hoja arrastrable y panel lateral (≥ 900 dp) en Flutter |
| Radios y su intención (botón, chip, tarjeta)                                                    | Objetivo táctil: 44 px en la web, 48 dp en Flutter                                                              |
| Sombras como intención (tarjeta, elevada, flotante)                                             | Sombras: `box-shadow` en la web; `elevation` y `BoxShadow` en Flutter                                           |
| Principios de movimiento (duraciones, propósito, movimiento reducido)                           | Transiciones de navegación nativas en cada plataforma                                                           |
| Reglas de estado (ninguno solo por color)                                                       | Reproductor: barra fija en la web; mini player, pantalla completa y controles del sistema en Flutter            |

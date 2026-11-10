# Gaceta: editorial y literaria

> Lesen como una revista literaria internacional bien compuesta: marfil, tinta azul noche, un oxblood para actuar y
> filetes de oro que ordenan la página.

![Descubrir, escritorio, claro](../captures/discover-desktop.jpg)

## Concepto y personalidad

- **Idea:** la cabecera de una publicación cultural (suplemento literario, revista de libros) llevada a una app que se
  usa a diario. La jerarquía la marcan la tipografía y los filetes, no las cajas ni las sombras.
- **Personalidad:** culta, curiosa, segura y sobria. Inteligente sin ser académica.
- **Inspiración:** la maquetación de revistas literarias contemporáneas, las cubiertas de colección de las editoriales
  y los filetes dobles de las cabeceras de prensa.
- **Por qué le sirve a Lesen:** refuerza la promesa central («lee lo que de verdad quieres leer») haciendo que cada
  lectura parezca una pieza publicada, no un ejercicio.

## Color

- **Estrategia:** neutros con temperatura (marfil y azul noche) y un solo color de acción, el oxblood `#7a1f2b`. Es más
  serio y literario que el terracota actual.
- **Acento:** el oro `#9a7425` es solo decorativo (filetes) y nunca se usa como texto, porque solo llega a 3,8:1.
- **Oscuro:** se diseñó como una noche de imprenta. El fondo es azul tinta `#121521`, no gris, la tinta es papel viejo
  `#ede6d6` y el oxblood se aclara a un rosa vino `#e8a3a8`, que mantiene la identidad con 8,9:1.
- **Lector:**
  - El papel claro es casi blanco, `#fffcf4`.
  - El sepia baja la saturación y oscurece la marca, `#74202a`.
  - El oscuro es más profundo que la página, `#0f111a`, para leer de noche sin halo.

#### Marca

| Token (CSS · semántico)                                               | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| --------------------------------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--brand` · brand.primary — acción principal, enlaces fuertes         | `#7a1f2b`    | `#e8a3a8`     | `#7a1f2b`    | `#74202a`    | `#e8a3a8`     |
| `--brand-strong` · brand.strong — pulsado, texto de marca sobre tinte | `#5e1520`    | `#f3c6c9`     | `#5e1520`    | `#5a141e`    | `#f3c6c9`     |
| `--brand-soft` · brand.soft — seleccionado, hover de palabra          | `#f3e1df`    | `#3a1c22`     | `#f3e1df`    | `#ead2c8`    | `#3a1c22`     |
| `--on-brand` · text.onBrand — texto sobre la marca                    | `#ffffff`    | `#1a0b0e`     | `#ffffff`    | `#ffffff`    | `#1a0b0e`     |
| `--accent` · brand.accent — decoración (filetes, formas); nunca texto | `#9a7425`    | `#d8b46a`     | `#9a7425`    | `#9a7425`    | `#d8b46a`     |

#### Superficies

| Token (CSS · semántico)                                        | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| -------------------------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--surface` · surface.default — fondo de la app / papel        | `#f7f2e8`    | `#121521`     | `#fffcf4`    | `#f1e7d3`    | `#0f111a`     |
| `--surface-muted` · surface.muted — secundaria, pistas         | `#eee6d6`    | `#0c0e17`     | `#f5efe2`    | `#e8dcc4`    | `#0a0b12`     |
| `--surface-raised` · surface.raised — tarjetas, hojas, popover | `#fffcf5`    | `#1b1f2e`     | `#ffffff`    | `#f6eedd`    | `#181b26`     |
| `--border` · border.subtle                                     | `#ddd2bd`    | `#2c3245`     | `#e3d9c6`    | `#d6c6a8`    | `#2a2f40`     |
| `--border-control` · border.control — bordes de campos (3:1)   | `#827863`    | `#7c8299`     | `#827863`    | `#7a6a4f`    | `#7c8299`     |

#### Texto

| Token (CSS · semántico)                        | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ---------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--ink` · text.primary                         | `#141b2d`    | `#ede6d6`     | `#1a1f2c`    | `#33281b`    | `#e4dccb`     |
| `--ink-muted` · text.secondary                 | `#4f5566`    | `#aaa697`     | `#535867`    | `#5a4a35`    | `#a39e90`     |
| `--link` · text.link                           | `#5e1520`    | `#f3c6c9`     | `#5e1520`    | `#5a141e`    | `#f3c6c9`     |
| `--focus` · state.focus — anillo de foco (3:1) | `#1f4f8f`    | `#8fb0e8`     | `#1f4f8f`    | `#1f4f8f`    | `#8fb0e8`     |

#### Semánticos

| Token (CSS · semántico)               | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--success` · state.success           | `#2c5e3f`    | `#8cc79f`     | `#2c5e3f`    | `#2c5e3f`    | `#8cc79f`     |
| `--success-soft` · state.success.soft | `#e2ece0`    | `#15281c`     | `#e2ece0`    | `#e2ece0`    | `#15281c`     |
| `--warning` · state.warning           | `#7a4a00`    | `#e3b35c`     | `#7a4a00`    | `#7a4a00`    | `#e3b35c`     |
| `--warning-soft` · state.warning.soft | `#f4e7cc`    | `#2e240e`     | `#f4e7cc`    | `#f4e7cc`    | `#2e240e`     |
| `--danger` · state.error              | `#a3221a`    | `#f08a80`     | `#a3221a`    | `#a3221a`    | `#f08a80`     |
| `--danger-soft` · state.error.soft    | `#f7e3df`    | `#3a1c1d`     | `#f7e3df`    | `#f7e3df`    | `#3a1c1d`     |
| `--notice` · state.info               | `#1f5566`    | `#8cc3d1`     | `#1f5566`    | `#1f5566`    | `#8cc3d1`     |
| `--notice-soft` · state.info.soft     | `#dfe9ec`    | `#13252c`     | `#dfe9ec`    | `#dfe9ec`    | `#13252c`     |

#### Tonos de tema

| Token (CSS · semántico) | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ----------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--sea` · tone.sea      | `#1f5566`    | `#8cc3d1`     | `#1f5566`    | `#1f5566`    | `#8cc3d1`     |
| `--sage` · tone.sage    | `#4a6247`    | `#a7c3a0`     | `#4a6247`    | `#4a6247`    | `#a7c3a0`     |
| `--ochre` · tone.ochre  | `#7d5a10`    | `#dfbf73`     | `#7d5a10`    | `#7d5a10`    | `#dfbf73`     |
| `--plum` · tone.plum    | `#5f3a5c`    | `#d3a9cf`     | `#5f3a5c`    | `#5f3a5c`    | `#d3a9cf`     |

#### Lector

| Token (CSS · semántico)                                  | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| -------------------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--mark-saved` · reader.word.saved — fondo + punto       | `#f0dc9a`    | `#514520`     | `#f0dc9a`    | `#e8d08a`    | `#4b4020`     |
| `--mark-saved-ink` · reader.word.saved.ink               | `#141b2d`    | `#f4ecd8`     | `#1a1f2c`    | `#33281b`    | `#f4ecd8`     |
| `--mark-new` · reader.word.unknown — subrayado de puntos | `#7a1f2b`    | `#e8a3a8`     | `#7a1f2b`    | `#74202a`    | `#e8a3a8`     |
| `--brand-soft` · reader.word.active — fondo + subrayado  | `#f3e1df`    | `#3a1c22`     | `#f3e1df`    | `#ead2c8`    | `#3a1c22`     |
| `--mark-sentence` · reader.sentence.active               | `#efe3cf`    | `#252736`     | `#f3e9d6`    | `#e6d8bd`    | `#20222f`     |
| `--success` · reader.word.known — subrayado continuo     | `#2c5e3f`    | `#8cc79f`     | `#2c5e3f`    | `#2c5e3f`    | `#8cc79f`     |

#### Contraste medido (WCAG, sobre `surface`)

| Par                             | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `ink` / `surface`               | 15.4:1       | 14.6:1        | 16.0:1       | 11.7:1       | 13.8:1        |
| `ink-muted` / `surface`         | 6.7:1        | 7.5:1         | 6.9:1        | 6.9:1        | 7.0:1         |
| `brand` / `surface`             | 9.1:1        | 8.9:1         | 10.0:1       | 8.6:1        | 9.2:1         |
| `on-brand` / `brand`            | 10.2:1       | 9.3:1         | 10.2:1       | 10.6:1       | 9.3:1         |
| `mark-saved-ink` / `mark-saved` | 12.6:1       | 8.0:1         | 12.1:1       | 9.5:1        | 8.7:1         |
| `ink` / `mark-sentence`         | 13.5:1       | 11.9:1        | 13.7:1       | 10.2:1       | 11.6:1        |
| `mark-new` / `surface`          | 9.1:1        | 8.9:1         | 10.0:1       | 8.6:1        | 9.2:1         |
| `focus` / `surface`             | 7.3:1        | 8.3:1         | 8.0:1        | 6.6:1        | 8.6:1         |

## Tipografía

Son tres familias, todas con licencia SIL OFL, variables y con cobertura latin y latin-ext (ä ö ü ß, ¿ ¡ ñ y comillas
«» „“). Una tercera familia se justifica porque el display es la firma de la dirección.

| Papel             | Familia                                  | Por qué                                                                             |
| ----------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| Titulares y marca | **Fraunces** (eje óptico, 100–900)       | Serif «old style» con mucho carácter a tamaño grande y suave en el óptico           |
| Lectura           | **Source Serif 4** (eje óptico, 200–900) | Pensada para texto largo en pantalla; el eje óptico abre el ojo a 18–21 px          |
| Interfaz          | **IBM Plex Sans** (100–700)              | Grotesca con detalle de oficio, muy legible a 12–15 px y de cifras tabulares claras |

- **Escala:** comparte tamaños con la actual: display 52/56, h1 40/46, h2 30/36, h3 23/29, h4 19/25, body 16/24,
  secundaria 14/20, eyebrow 13/16.
- **Pesos:** display 380, h1 400, h2 430, h3 500 y h4 560. Los titulares son ligeros, como en las revistas.
- **Tracking:** −0,02 em en display y −0,015 em en h1. El eyebrow va en versalitas a +0,14 em.
- **Lectura:** 18–29 px con interlineado 1,55, 1,75 o 1,95, como hoy, y el eje óptico automático.
- **Peso de carga:** unos 228 KB en la primera carga (latin normal de las tres familias), frente a los 156 KB de hoy.
  Las cursivas y latin-ext solo bajan si hacen falta, por `unicode-range`.
- **Riesgo:** la cursiva de Fraunces es muy expresiva. En los subtítulos en alemán («stürmische») algunas letras llaman
  la atención; habría que fijar `font-variation-settings: 'WONK' 0` o usar Source Serif 4 cursiva para los subtítulos.

## Lenguaje de componentes

- **Radios:** 2–6 px, casi rectos. Las tarjetas con 3 px y los botones con 3 px.
- **Filetes:**
  - Las cabeceras de sección llevan un filete doble: 2 px de tinta y 1 px de oro.
  - La barra superior lleva un filete de tinta.
  - Los paneles del progreso son filetes, no cajas.
- **Navegación:** la sección activa va subrayada en oxblood, sin píldora.
- **La destacada:** sin degradado, entre filetes, con la portada recta (sin el giro de −2°).
- **Sombras:** apenas existen. Las tarjetas llevan un borde de 1 px de tinta al 10 %.
- **Chips y nivel:** etiquetas rectas de 2 px, como una signatura de biblioteca.
- **Popover del diccionario y hojas:** superficie elevada con filete fino y sombra corta.
- **Reproductor:** en oxblood; el botón de reproducir es un cuadrado de 3 px, no un círculo.
- **Estados vacíos y de error:** solo texto editorial, sin ilustración extra.
- **Logros:** una fila numerada, como un índice.

## Movimiento

Es el más quieto de todos:

- Las transiciones son de color y de filete, de 150–200 ms.
- Las tarjetas no se elevan al pasar el ratón: se subraya su título.
- Al terminar una lectura hay un único «pop» (se conserva `animate-pop`).
- Con `prefers-reduced-motion` desaparece todo.

## Accesibilidad

- Todos los pares del contrato pasan AA en los cinco temas, y la tinta del lector supera 7:1 en los tres.
- El oro no se usa nunca como texto.
- El oxblood del claro llega a 9,1:1, una holgura que permite cuerpos pequeños.
- Riesgo: los filetes de 1 px no deben ser la única señal de estado. La navegación activa conserva `aria-current` y el
  subrayado de 2 px.

## Ventajas e inconvenientes

**Ventajas**

- Es la más «Lesen»: evoluciona Papel y tinta sin romperla.
- La más distintiva frente a las apps de idiomas al uso.
- Excelente para leer.

**Inconvenientes**

- Tres familias.
- Es la de más peso de fuente.
- Puede leerse como seria o fría si no se compensa con las portadas ilustradas.
- Los filetes piden disciplina en cada componente nuevo.

## Implicaciones de implementación

- **Web:** los tokens ya están en `gaceta.css`. Habría que convertir la firma (`gaceta.signature.css`) en clases o
  variantes de los componentes y fijar el eje `WONK` en las cursivas.
- **Flutter:** las tres TTF variables, unos 1,6 MB en el paquete, además de `buttonRadius` y `chipRadius` pequeños.
  Los filetes de sección necesitan un `SectionHeading` con `Border`.
- **Coste estimado:** medio.

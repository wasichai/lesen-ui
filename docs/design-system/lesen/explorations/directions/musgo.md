# Musgo: calma natural

> Crecimiento intelectual sereno: arena, musgo y pizarra mineral, un acento contenido y formas orgánicas que no gritan.

![Descubrir, escritorio, claro](../captures/discover-desktop.jpg)

## Concepto y personalidad

- **Idea:** un lugar tranquilo para leer y aprender a tu ritmo. Encaja con el principio «ánimo sin castigo»: nada urge,
  todo crece.
- **Personalidad:** calmada, cálida, reflexiva y confiable.
- **Inspiración:** los cuadernos de campo, las editoriales de naturaleza y las apps de bienestar y meditación, con su
  paleta mineral y su tipografía humanista.
- **Por qué le sirve a Lesen:** es la que mejor sostiene sesiones largas. Corrige el motivo del descarte de «Botánica»
  (verdes por todas partes): aquí el verde es solo la marca, y las hojas aparecen en un único detalle.

## Color

- **Marca:** musgo `#2f5e45`, con 6,5:1 sobre arena.
- **Fondos:** arena `#f3efe6`.
- **Acento:** terracota otoñal `#a0522d`, solo para las palabras nuevas, en el subrayado de puntos.
- **Tonos:** pizarra, salvia, ocre y ciruela, todos apagados.
- **Oscuro:** un bosque de noche, `#141a17`, verde casi negro. La marca se aclara a salvia `#9fcaa9` y la tinta es
  hueso `#e8e6dc`.
- **Lector:** el papel claro es crema `#faf8f1`. El sepia tira a un pergamino más verde; el oscuro, a un verde
  profundo.

#### Marca

| Token (CSS · semántico)                                               | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| --------------------------------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--brand` · brand.primary — acción principal, enlaces fuertes         | `#2f5e45`    | `#9fcaa9`     | `#2f5e45`    | `#2d5a40`    | `#9fcaa9`     |
| `--brand-strong` · brand.strong — pulsado, texto de marca sobre tinte | `#224633`    | `#c2e0c8`     | `#224633`    | `#21432f`    | `#c2e0c8`     |
| `--brand-soft` · brand.soft — seleccionado, hover de palabra          | `#dfe9df`    | `#213429`     | `#dfe9df`    | `#dbe0cc`    | `#213429`     |
| `--on-brand` · text.onBrand — texto sobre la marca                    | `#ffffff`    | `#0d1a12`     | `#ffffff`    | `#ffffff`    | `#0d1a12`     |
| `--accent` · brand.accent — decoración (filetes, formas); nunca texto | `#a0522d`    | `#e3a27e`     | `#a0522d`    | `#a0522d`    | `#e3a27e`     |

#### Superficies

| Token (CSS · semántico)                                        | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| -------------------------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--surface` · surface.default — fondo de la app / papel        | `#f3efe6`    | `#141a17`     | `#faf8f1`    | `#efe6d2`    | `#101512`     |
| `--surface-muted` · surface.muted — secundaria, pistas         | `#e9e3d6`    | `#0e1311`     | `#f1eee4`    | `#e5dac2`    | `#0b0f0d`     |
| `--surface-raised` · surface.raised — tarjetas, hojas, popover | `#faf8f2`    | `#1c2420`     | `#fffefa`    | `#f4ecdc`    | `#18201b`     |
| `--border` · border.subtle                                     | `#d9d2c1`    | `#2c3631`     | `#e0dccd`    | `#d3c5a7`    | `#27312b`     |
| `--border-control` · border.control — bordes de campos (3:1)   | `#7c7a68`    | `#7b877f`     | `#7c7a68`    | `#786a50`    | `#7b877f`     |

#### Texto

| Token (CSS · semántico)                        | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ---------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--ink` · text.primary                         | `#1d2a24`    | `#e8e6dc`     | `#202b25`    | `#332b1d`    | `#dcdccf`     |
| `--ink-muted` · text.secondary                 | `#4d5a52`    | `#a9ada0`     | `#535f57`    | `#5a4c36`    | `#a1a598`     |
| `--link` · text.link                           | `#224633`    | `#c2e0c8`     | `#224633`    | `#21432f`    | `#c2e0c8`     |
| `--focus` · state.focus — anillo de foco (3:1) | `#2f5f7a`    | `#93bfd6`     | `#2f5f7a`    | `#2f5f7a`    | `#93bfd6`     |

#### Semánticos

| Token (CSS · semántico)               | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--success` · state.success           | `#2d6a3a`    | `#93cfa0`     | `#2d6a3a`    | `#2d6a3a`    | `#93cfa0`     |
| `--success-soft` · state.success.soft | `#e1ecdc`    | `#16291b`     | `#e1ecdc`    | `#e1ecdc`    | `#16291b`     |
| `--warning` · state.warning           | `#7d5000`    | `#dfb768`     | `#7d5000`    | `#7d5000`    | `#dfb768`     |
| `--warning-soft` · state.warning.soft | `#f3e6c9`    | `#2e250f`     | `#f3e6c9`    | `#f3e6c9`    | `#2e250f`     |
| `--danger` · state.error              | `#a5301f`    | `#f09080`     | `#a5301f`    | `#a5301f`    | `#f09080`     |
| `--danger-soft` · state.error.soft    | `#f6e2da`    | `#3a1d18`     | `#f6e2da`    | `#f6e2da`    | `#3a1d18`     |
| `--notice` · state.info               | `#2f5f6e`    | `#8fc3cf`     | `#2f5f6e`    | `#2f5f6e`    | `#8fc3cf`     |
| `--notice-soft` · state.info.soft     | `#dde9ea`    | `#142629`     | `#dde9ea`    | `#dde9ea`    | `#142629`     |

#### Tonos de tema

| Token (CSS · semántico) | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ----------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--sea` · tone.sea      | `#2f5f6e`    | `#8fc3cf`     | `#2f5f6e`    | `#2f5f6e`    | `#8fc3cf`     |
| `--sage` · tone.sage    | `#4f6a3e`    | `#b2cc98`     | `#4f6a3e`    | `#4f6a3e`    | `#b2cc98`     |
| `--ochre` · tone.ochre  | `#7f5b17`    | `#dcbf7a`     | `#7f5b17`    | `#7f5b17`    | `#dcbf7a`     |
| `--plum` · tone.plum    | `#6b4a5e`    | `#d2adc4`     | `#6b4a5e`    | `#6b4a5e`    | `#d2adc4`     |

#### Lector

| Token (CSS · semántico)                                  | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| -------------------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--mark-saved` · reader.word.saved — fondo + punto       | `#eadb9f`    | `#4a4422`     | `#eadb9f`    | `#e6d08a`    | `#45401f`     |
| `--mark-saved-ink` · reader.word.saved.ink               | `#1d2a24`    | `#f2ecd6`     | `#202b25`    | `#332b1d`    | `#f2ecd6`     |
| `--mark-new` · reader.word.unknown — subrayado de puntos | `#a0522d`    | `#e3a27e`     | `#a0522d`    | `#94491f`    | `#e3a27e`     |
| `--brand-soft` · reader.word.active — fondo + subrayado  | `#dfe9df`    | `#213429`     | `#dfe9df`    | `#dbe0cc`    | `#213429`     |
| `--mark-sentence` · reader.sentence.active               | `#e6e7d5`    | `#24302a`     | `#ebecdc`    | `#e3d8bd`    | `#1f2924`     |
| `--success` · reader.word.known — subrayado continuo     | `#2d6a3a`    | `#93cfa0`     | `#2d6a3a`    | `#2d6a3a`    | `#93cfa0`     |

#### Contraste medido (WCAG, sobre `surface`)

| Par                             | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `ink` / `surface`               | 13.0:1       | 14.1:1        | 13.8:1       | 11.2:1       | 13.3:1        |
| `ink-muted` / `surface`         | 6.3:1        | 7.7:1         | 6.3:1        | 6.7:1        | 7.3:1         |
| `brand` / `surface`             | 6.5:1        | 9.7:1         | 7.0:1        | 6.4:1        | 10.1:1        |
| `on-brand` / `brand`            | 7.5:1        | 9.8:1         | 7.5:1        | 7.9:1        | 9.8:1         |
| `mark-saved-ink` / `mark-saved` | 10.7:1       | 8.3:1         | 10.6:1       | 9.1:1        | 8.8:1         |
| `ink` / `mark-sentence`         | 11.9:1       | 11.0:1        | 12.3:1       | 9.9:1        | 10.8:1        |
| `mark-new` / `surface`          | 4.9:1        | 8.2:1         | 5.3:1        | 5.2:1        | 8.6:1         |
| `focus` / `surface`             | 6.0:1        | 9.0:1         | 6.5:1        | 5.6:1        | 9.4:1         |

## Tipografía

| Papel               | Familia                                  | Por qué                                                                    |
| ------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| Titulares y lectura | **Source Serif 4** (eje óptico, 200–900) | Serif de lectura con óptico; a tamaño display queda serena, sin dramatismo |
| Interfaz            | **Manrope** (200–800)                    | Grotesca moderna de formas redondeadas; legible y cálida a 12–15 px        |

- **Pesos:** display 500, h1 520, h2 560, h3 600 y h4 640. Las etiquetas van a 650.
- **Tracking:** −0,015 em en display y −0,01 em en h1. El eyebrow va a +0,1 em.
- **Peso de carga:** unos 143 KB (latin normal).
- **Riesgo:** Manrope no tiene cursiva, así que el navegador la sintetiza en la interfaz. Las cursivas del producto son
  serifas (subtítulos, estimaciones del progreso), que sí la tienen. El «estimado» del progreso va en cursiva de la
  interfaz y saldría sintetizado: habría que pasarlo a Source Serif 4 o cambiar el énfasis.

## Lenguaje de componentes

- **Radios:** medianos (tarjetas de 22 px). Los botones son de 14 px, rectángulos suaves y no píldoras; los chips, en
  píldora.
- **La destacada:** sin borde, sobre arena, con una esquina de hoja (40/40/40/12 px) y un claro de luz verde en lugar
  del degradado.
- **Titulares de sección:** una hoja de salvia delante. Es el único motivo orgánico de la interfaz.
- **Navegación:** la activa lleva tinte de musgo (`brand-soft`) y texto `brand-strong`.
- **Paneles y cifras:** sin borde; la superficie elevada basta.
- **Sombras:** difusas y verdosas.
- **Popover del diccionario:** crema, radio de 18 px y sombra suave.
- **Reproductor:** botón musgo de 14 px.
- **Logros:** hojas que crecen (de brote a rama) en lugar de medallas.
- **Estados vacíos:** una ilustración de planta pequeña.

## Movimiento

Lento y suave:

- Entradas de 420 ms con desaceleración.
- Las hojas y los paneles aparecen con un fundido y 8 px de desplazamiento.
- **Guardar una palabra:** un fundido del fondo, sin escala.
- **El progreso:** «crece», con barras que se llenan en 700 ms.
- **Movimiento reducido:** todo es instantáneo.

## Accesibilidad

- Todos los pares pasan AA en los cinco temas. La tinta del lector llega a 13,8:1 en el claro.
- Riesgo: verde de marca y verde de éxito se parecen (`#2f5e45` y `#2d6a3a`). El éxito siempre lleva icono y texto, y
  conviene llevar `success` hacia el azul pizarra si se adopta.

## Ventajas e inconvenientes

**Ventajas**

- La más descansada para leer.
- La de mejor encaje con los principios de ánimo sin castigo.
- Dos familias, peso moderado.
- El modo oscuro tiene personalidad propia.

**Inconvenientes**

- Menos memorable que Gaceta o Atlas.
- El verde se asocia a bienestar o ecología y puede diluir la idea de «idiomas».
- Choca con el `success` verde.

## Implicaciones de implementación

- **Web:** tokens y firma sencillos; la hoja de sección es un pseudoelemento.
- **Flutter:** dos TTF (unos 1,2 MB). La esquina asimétrica de la destacada es un `BorderRadius.only`.
- **Coste estimado:** bajo-medio.

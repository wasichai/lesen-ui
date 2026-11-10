# Pulso: aprendizaje vibrante

> Un producto de consumo con energía: índigo seguro, coral para lo nuevo, superficies frías y luminosas, y progreso
> protagonista. Emociona sin infantilizar.

![Descubrir, escritorio, claro](../captures/discover-desktop.jpg)

## Concepto y personalidad

- **Idea:** Lesen como la app que apetece abrir. Hay bloques de color con confianza, tipografía rotunda y respuestas
  que se notan (guardar una palabra, cumplir la meta).
- **Personalidad:** optimista, dinámica, cercana y contemporánea.
- **Inspiración:** las apps de consumo actuales de hábitos, fitness y finanzas personales, con su color de marca
  saturado y sus tarjetas grandes y redondeadas. La energía está controlada: un solo color de marca y el coral
  reservado para lo nuevo.
- **Por qué le sirve a Lesen:** sostiene el hábito, porque el progreso y la recompensa se ven. Es la que más se aleja
  del «aula».

## Color

- **Marca:** el índigo `#4a3fd6` es el color de acción y de los bloques destacados. La destacada de Descubrir es un
  bloque índigo con texto blanco, con tokens locales comprobados en `lesen.test.ts`.
- **Coral `#d1432c`:** marca las palabras nuevas en el lector, con subrayado de puntos.
- **Amarillo sol `#ffe27a`:** es el fondo de la palabra guardada y el eyebrow sobre índigo.
- **Superficies:** frías y claras (`#f6f7fb` y blanco).
- **Oscuro:** un azul profundo `#0f1226`, no negro. El índigo pasa a lavanda `#a49cff` y las superficies elevadas son
  azul tinta. Se lee de noche sin parecer un modo oscuro genérico.
- **Lector:**
  - El papel claro vuelve a ser cálido (`#fdfcf9`), para no cansar en sesiones largas. Es la gran diferencia con las
    superficies frías de la interfaz.
  - Sepia y oscuro siguen la misma lógica.

#### Marca

| Token (CSS · semántico)                                               | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| --------------------------------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--brand` · brand.primary — acción principal, enlaces fuertes         | `#4a3fd6`    | `#a49cff`     | `#4a3fd6`    | `#4337c4`    | `#a49cff`     |
| `--brand-strong` · brand.strong — pulsado, texto de marca sobre tinte | `#3529b0`    | `#c6c1ff`     | `#3529b0`    | `#3127a3`    | `#c6c1ff`     |
| `--brand-soft` · brand.soft — seleccionado, hover de palabra          | `#e6e4ff`    | `#2a2560`     | `#e6e4ff`    | `#e2dbf0`    | `#2a2560`     |
| `--on-brand` · text.onBrand — texto sobre la marca                    | `#ffffff`    | `#120e3d`     | `#ffffff`    | `#ffffff`    | `#120e3d`     |
| `--accent` · brand.accent — decoración (filetes, formas); nunca texto | `#e8553f`    | `#ff8a73`     | `#e8553f`    | `#e8553f`    | `#ff8a73`     |

#### Superficies

| Token (CSS · semántico)                                        | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| -------------------------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--surface` · surface.default — fondo de la app / papel        | `#f6f7fb`    | `#0f1226`     | `#fdfcf9`    | `#f3ead8`    | `#0c0e1c`     |
| `--surface-muted` · surface.muted — secundaria, pistas         | `#eceef7`    | `#0a0c1c`     | `#f4f3ee`    | `#e9dec8`    | `#080a15`     |
| `--surface-raised` · surface.raised — tarjetas, hojas, popover | `#ffffff`    | `#191d38`     | `#ffffff`    | `#f8f0e0`    | `#151831`     |
| `--border` · border.subtle                                     | `#dcdff0`    | `#2b3057`     | `#e4e2da`    | `#d7c8ab`    | `#262a4d`     |
| `--border-control` · border.control — bordes de campos (3:1)   | `#7b80a0`    | `#7f86b8`     | `#7b80a0`    | `#7d6d52`    | `#7f86b8`     |

#### Texto

| Token (CSS · semántico)                        | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ---------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--ink` · text.primary                         | `#161a33`    | `#eef0ff`     | `#1c1d2a`    | `#352a1c`    | `#e3e5f5`     |
| `--ink-muted` · text.secondary                 | `#4e5373`    | `#aeb3d4`     | `#53556a`    | `#5d4d38`    | `#a3a8c8`     |
| `--link` · text.link                           | `#3529b0`    | `#c6c1ff`     | `#3529b0`    | `#3127a3`    | `#c6c1ff`     |
| `--focus` · state.focus — anillo de foco (3:1) | `#0a66c2`    | `#7cc0ff`     | `#0a66c2`    | `#0a66c2`    | `#7cc0ff`     |

#### Semánticos

| Token (CSS · semántico)               | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--success` · state.success           | `#1f7a4d`    | `#7fd6a3`     | `#1f7a4d`    | `#1a6b43`    | `#7fd6a3`     |
| `--success-soft` · state.success.soft | `#dff3e8`    | `#12301f`     | `#dff3e8`    | `#dff3e8`    | `#12301f`     |
| `--warning` · state.warning           | `#8a5300`    | `#f2c063`     | `#8a5300`    | `#8a5300`    | `#f2c063`     |
| `--warning-soft` · state.warning.soft | `#fbefd6`    | `#33270b`     | `#fbefd6`    | `#fbefd6`    | `#33270b`     |
| `--danger` · state.error              | `#b3261e`    | `#ff8f84`     | `#b3261e`    | `#b3261e`    | `#ff8f84`     |
| `--danger-soft` · state.error.soft    | `#fde7e4`    | `#3d1820`     | `#fde7e4`    | `#fde7e4`    | `#3d1820`     |
| `--notice` · state.info               | `#0f6476`    | `#7fd3e3`     | `#0f6476`    | `#0f6476`    | `#7fd3e3`     |
| `--notice-soft` · state.info.soft     | `#def2f6`    | `#10303a`     | `#def2f6`    | `#def2f6`    | `#10303a`     |

#### Tonos de tema

| Token (CSS · semántico) | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ----------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--sea` · tone.sea      | `#0f6476`    | `#7fd3e3`     | `#0f6476`    | `#0f6476`    | `#7fd3e3`     |
| `--sage` · tone.sage    | `#2e6b45`    | `#8fd6a8`     | `#2e6b45`    | `#2e6b45`    | `#8fd6a8`     |
| `--ochre` · tone.ochre  | `#8a5300`    | `#f2c063`     | `#8a5300`    | `#8a5300`    | `#f2c063`     |
| `--plum` · tone.plum    | `#a02c5a`    | `#ff9fc0`     | `#a02c5a`    | `#a02c5a`    | `#ff9fc0`     |

#### Lector

| Token (CSS · semántico)                                  | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| -------------------------------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `--mark-saved` · reader.word.saved — fondo + punto       | `#ffe27a`    | `#5b4a12`     | `#ffe27a`    | `#efd58a`    | `#544411`     |
| `--mark-saved-ink` · reader.word.saved.ink               | `#161a33`    | `#fff4cc`     | `#1c1d2a`    | `#352a1c`    | `#fff4cc`     |
| `--mark-new` · reader.word.unknown — subrayado de puntos | `#d1432c`    | `#ff8a73`     | `#d1432c`    | `#b83a25`    | `#ff8a73`     |
| `--brand-soft` · reader.word.active — fondo + subrayado  | `#e6e4ff`    | `#2a2560`     | `#e6e4ff`    | `#e2dbf0`    | `#2a2560`     |
| `--mark-sentence` · reader.sentence.active               | `#ece9ff`    | `#232650`     | `#eeebff`    | `#e8dcc2`    | `#1e2146`     |
| `--success` · reader.word.known — subrayado continuo     | `#1f7a4d`    | `#7fd6a3`     | `#1f7a4d`    | `#1a6b43`    | `#7fd6a3`     |

#### Contraste medido (WCAG, sobre `surface`)

| Par                             | Página clara | Página oscura | Lector claro | Lector sepia | Lector oscuro |
| ------------------------------- | ------------ | ------------- | ------------ | ------------ | ------------- |
| `ink` / `surface`               | 16.0:1       | 16.3:1        | 16.3:1       | 11.7:1       | 15.3:1        |
| `ink-muted` / `surface`         | 7.0:1        | 9.0:1         | 7.1:1        | 6.8:1        | 8.2:1         |
| `brand` / `surface`             | 6.6:1        | 7.7:1         | 6.9:1        | 6.8:1        | 8.0:1         |
| `on-brand` / `brand`            | 7.1:1        | 7.6:1         | 7.1:1        | 8.1:1        | 7.6:1         |
| `mark-saved-ink` / `mark-saved` | 13.3:1       | 7.8:1         | 13.0:1       | 9.7:1        | 8.6:1         |
| `ink` / `mark-sentence`         | 14.4:1       | 12.7:1        | 14.3:1       | 10.3:1       | 12.3:1        |
| `mark-new` / `surface`          | 4.3:1        | 8.0:1         | 4.5:1        | 4.8:1        | 8.3:1         |
| `focus` / `surface`             | 5.3:1        | 9.6:1         | 5.5:1        | 4.8:1        | 9.9:1         |

## Tipografía

| Papel                | Familia                            | Por qué                                                                        |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| Titulares e interfaz | **Plus Jakarta Sans** (200–800)    | Geométrica humanista, rotunda en 700–800 y amable en 400; buenas cifras        |
| Lectura              | **Literata** (eje óptico, 200–900) | Diseñada para lectura larga en pantalla (Google Play Libros), cálida y abierta |

- **Pesos:** display 800, h1 800, h2 750, h3 y h4 700. Las etiquetas van a 700.
- **Tracking:** −0,035 em en display y −0,03 em en h1.
- **Escala:** los tamaños son los compartidos. En el teléfono los titulares en 800 ocupan más; habría que bajar h1 a
  34 px por debajo de 640 px.
- **Peso de carga:** unos 133 KB (latin normal), menos que hoy.
- **Riesgo:** Plus Jakarta en 800 con tracking negativo junta las letras en titulares largos en alemán
  («Gewohnheiten»). Conviene fijar un tracking mínimo de −0,02 em en h1 y h2.

## Lenguaje de componentes

- **Radios:** grandes (tarjetas de 24 px, hojas de 28 px). Botones y chips en píldora.
- **La destacada:** bloque de color de marca con la portada ilustrada encima.
- **Navegación:** la activa es una píldora índigo con texto blanco.
- **Tarjetas de lectura:** sombras de color (índigo al 28 %). La portada sube con un rebote corto al pasar el ratón.
- **Progreso:**
  - Las cifras del panel van sobre su tinte (`brand-soft`).
  - El anillo de meta y las barras usan índigo, con el coral para lo nuevo.
- **Popover del diccionario:** blanco, radio de 20 px y sombra profunda.
- **Reproductor:** botón circular índigo de 44 px.
- **Logros:** medallas redondas con el porcentaje dentro.
- **Estados vacíos:** ilustración y frase animada, sin culpa.

## Movimiento

Es el más expresivo, siempre con un propósito:

- **Guardar una palabra:** la palabra recibe el amarillo y su punto con una escala de 1 a 1,04 y vuelta, en 220 ms.
- **Meta cumplida:** el anillo se completa en 600 ms.
- **Tarjetas:** se elevan con `cubic-bezier(0.34, 1.5, 0.64, 1)`.
- **Movimiento reducido:** todo queda en cambios de color instantáneos.

## Accesibilidad

- Todos los pares pasan AA, también los de la destacada de color de marca.
- El sepia necesitó un `success` más oscuro (`#1a6b43`).
- Riesgo: hay más color y más estados visuales. Cada estado debe conservar su forma (punto, subrayado, icono), y eso ya
  lo garantiza el lector.

## Ventajas e inconvenientes

**Ventajas**

- La más atractiva para el hábito diario y para captar personas nuevas.
- La de menos peso de fuente.
- Escala bien a gamificación amable (logros, semanas).

**Inconvenientes**

- La menos «literaria».
- Se acerca a la estética genérica de las apps de consumo.
- Obliga a cuidar mucho las ilustraciones para no parecer infantil.
- Los titulares en 800 ocupan más en el teléfono.

## Implicaciones de implementación

- **Web:** la firma usa tokens locales en `data-ui='hero'`; al adoptarla sería una variante `tone="brand"` del bloque
  destacado. Además, los ajustes de h1 en el teléfono.
- **Flutter:** dos TTF variables (unos 1,0 MB). Los radios grandes ya caben en `LesenTokens`, y las sombras de color
  requieren `BoxShadow` desde los tokens.
- **Coste estimado:** medio-alto, por el movimiento.

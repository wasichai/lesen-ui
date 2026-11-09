# Sistema de diseño Lesen

Un producto de lectura de consumo, no un panel de administración: cálido, editorial, juguetón sin estridencias y
tranquilo para leer mucho rato. La lectura manda; la interfaz se aparta.

## Principios

1. **El texto primero.** En el lector no hay marco de app: título, texto a 38rem de ancho y una barra discreta.
2. **Invitar, no administrar.** Portadas ilustradas, titulares en serifa, carriles que se deslizan, nada de tablas ni
   gráficos por defecto.
3. **Ayudar sin delatar.** Las traducciones están a un toque, nunca a la vista por defecto; la ayuda se ofrece, no se
   impone.
4. **Honestidad.** Sin entrada en el diccionario, se dice. Un nivel elegido «sin estar seguro» se llama estimación.
5. **Ánimo sin castigo.** Metas en minutos, sin rachas que se rompen, celebraciones breves que no se repiten.
6. **Para todo el mundo.** WCAG 2.2 AA comprobado por prueba, objetivos de 44 px, foco visible, movimiento reducido,
   ningún estado solo por color (la palabra guardada lleva fondo y punto).

## Direcciones exploradas

| Dirección           | Idea                                                                                  | Por qué no (o sí)                                                                         |
| ------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Papel y tinta**   | Papel cálido, tinta profunda, terracota como único acento de acción, serifa editorial | **Elegida.** Calma para leer, carácter sin estridencia, contraste AA holgado              |
| Botánica            | Verdes y ocres, ilustración de hojas en todas partes, esquinas muy redondas           | Encantadora en portadas, cansa en sesiones largas; queda como tonos de tema (sage, ochre) |
| Biblioteca nocturna | Oscuro por defecto, dorados, tipografía display muy contrastada                       | Espectacular en la portada, peor para leer de día; queda como tema oscuro del lector      |

## Tokens

Los valores viven en `src/theme/lesen.css` (cinco temas que ponen todos los tokens de `@wasichai/ui` más los propios) y
se resumen en `tokens.json`. `src/theme/lesen.test.ts` comprueba el contrato y los pares de contraste.

| Tema                 | Uso                              | Superficie | Tinta     | Acento    |
| -------------------- | -------------------------------- | ---------- | --------- | --------- |
| `lesen`              | Página, claro                    | `#fbf7f0`  | `#1f2430` | `#a8402a` |
| `lesen-dark`         | Página, oscuro                   | `#17181d`  | `#efe8dc` | `#f19a7b` |
| `lesen-reader-light` | Lector, claro (papel más blanco) | `#fffdf8`  | `#22252e` | `#a8402a` |
| `lesen-reader-sepia` | Lector, sepia                    | `#f4ecdd`  | `#3a2f22` | `#9a3b25` |
| `lesen-reader-dark`  | Lector, oscuro                   | `#121318`  | `#e2dccf` | `#f19a7b` |

Tonos de tema: `sea`, `sage`, `ochre`, `plum` (texto AA sobre superficie). Marcas del lector: `mark-saved` (palabra
guardada, fondo), `mark-new` (palabra nueva, subrayado punteado), `success` (palabra aprendida, subrayado continuo) y
`mark-sentence` (oración abierta, la que suena con el audio y la citada desde los resultados). Nunca solo color: cada
marca tiene su forma.

## Tipografía

Newsreader (serifa variable con eje óptico) para titulares y lectura; Source Sans 3 para la interfaz. Las dos
autoalojadas en woff2 con licencia SIL OFL (`src/theme/fonts`), sin peticiones a terceros. Escala: `text-display` 52,
`text-h1` 40, `h2` 30, `h3` 23, `h4` 19, `text-body` 16, `text-secondary` 14, `text-eyebrow` 13 en versalitas. La
lectura va de 18 a 29 px con interlineado 1,55 / 1,75 / 1,95 a elección de quien lee.

## Componentes propios

`LearnerLayout` (barra superior desde 1024 px, barra de pestañas debajo), `ReadingTile` (alta y en fila), `Cover`
(proporción fija 3:4, perezosa), `LevelBadge`, `ProgressBar`, `Sheet` (abajo o a la derecha, sobre el `Dialog` de
`@wasichai/ui`), `EmptyState`, `ProblemState`, `Skeleton`, `LesenMark`. Botones y chips con `buttonClass` y `chipClass`
(`src/shared/ui.ts`).

`AudioBar` (lector, fase 3): barra fija abajo con posición, párrafo anterior y siguiente, ±5 s (desde 640 px),
reproducir, velocidad (0,75–1,5×), volumen (desde 1024 px) y «seguir la lectura». La palabra que suena lleva fondo y
subrayado (`data-playing`) y su oración el fondo de `mark-sentence` (`data-spoken`): nunca solo color. El resaltado se
escribe en el DOM fotograma a fotograma, sin pintar de nuevo los párrafos (`useAudioPlayer`). El desplazamiento sigue al
audio hasta que quien lee mueve la página; entonces aparece «seguir la lectura». Sin audio, o si falla, el lector es el
mismo.

Comprensión y repaso (fase 4): una pregunta por pantalla, sin reloj, con controles nativos (radios, casillas, campos,
desplegables para emparejar y botones de subir y bajar para ordenar, sin arrastrar). Los resultados se agrupan en «lo que
entendiste bien», «para volver a mirar» y «por valorar», con la solución, la explicación y la oración del texto; sin
rojo de examen. En el repaso, cada botón de valoración dice cuándo vuelve la palabra; espacio y 1–4 desde el teclado.

Progreso (fase 5): un panel editorial con pocas gráficas, en SVG o HTML propios y sin dependencias, siempre con su
tabla o su texto para tecnologías de apoyo. Cada cifra lleva su etiqueta: «medido» con borde continuo, «estimado» con
borde discontinuo, cursiva y «≈» delante; el nivel MCER siempre es estimado. Nada castiga un día sin leer: los días sin
actividad son una raya neutra, nunca roja; la racha es semanal, la semana en curso solo suma y los mensajes dicen lo que
se lleva, no lo que falta. Los logros pendientes muestran cuánto se lleva, sin candados. Con seis secciones, la barra de
pestañas del móvil usa nombres cortos (`nav.tab.*`) y la superior, en escritorio estrecho, deja «Cerrar sesión» en el
icono.

Estudio editorial (fase 6): su propio marco (`StudioLayout`), más ancho y sin barra de pestañas, para quien escribe y
publica sin perfil de lectora. El editor de un borrador va por pestañas (datos, texto y traducciones, preguntas, audio,
revisión) con una barra fija de guardado que dice si hay cambios sin guardar. Cada oración se escribe junto a sus
traducciones, con `lang` en cada campo. Los hallazgos de la comprobación se agrupan en «para arreglar» y «para mirar»,
cada uno con un enlace a la pestaña donde se arregla; las palabras sin entrada se añaden al diccionario desde una hoja.

## Movimiento

Entradas cortas (`animate-rise` 420 ms, `animate-sheet` 260 ms) y una sola celebración (`animate-pop` al terminar una
lectura). Con `prefers-reduced-motion` desaparece todo movimiento.

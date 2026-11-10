# Recomendación

**No se aplica nada.** Es una propuesta razonada; la decisión es de producto.

## Recomiendo: Gaceta, con tres ajustes

Gaceta y Atlas empatan en la matriz (44/50). Recomiendo **Gaceta** por cuatro razones:

1. **Es la que mejor dice lo que es Lesen.** «Aprende idiomas leyendo lo que de verdad quieres leer»: Gaceta hace que
   cada lectura parezca una pieza publicada. Atlas dice «producto premium», que es bueno, pero no habla de leer.
2. **Es la evolución natural de Papel y tinta.** Mantiene la serifa editorial, el papel cálido y un solo color de acción.
   Quien ya usa Lesen la reconoce, y el riesgo de adopción es menor.
3. **Es la más distintiva frente a las apps de idiomas.** Ninguna compite con una identidad literaria. Pulso, en cambio,
   se acerca a la estética común de las apps de consumo.
4. **Su lectura es excelente.** Source Serif 4 con eje óptico supera 15:1 de tinta sobre papel en el claro, y el sepia y
   el oscuro mantienen el carácter.

Los tres ajustes, antes de adoptarla:

- **Cursivas:** fijar `font-variation-settings: 'WONK' 0` en Fraunces, o usar Source Serif 4 cursiva para los
  subtítulos. La cursiva de Fraunces llama demasiado la atención en alemán («stürmische»).
- **Interfaz:** valorar Source Sans 3 (la de hoy) en lugar de IBM Plex Sans. Quedarían dos familias nuevas en lugar de
  tres y la carga bajaría de 228 KB a unos 210 KB. IBM Plex aporta carácter en las etiquetas, pero no es imprescindible.
- **Calidez del progreso:** tomar de Pulso una sola idea, la de celebrar la meta cumplida (el anillo que se completa) en
  oxblood. Así el panel no queda frío entre tantos filetes.

## Cuándo elegir otra

- **Atlas**, si la prioridad es una identidad que escale sin ilustrador y que se porte igual en web y móvil. Su coste
  es el más bajo: una sola fuente nueva.
- **Pulso**, si la prioridad es captar y retener personas nuevas (onboarding, hábito diario) por encima de la
  experiencia de lectura.
- **Musgo**, si el producto se orienta al bienestar y a sesiones largas. Antes habría que separar el verde de marca del
  `success`.
- **Papel y tinta**, si el momento no pide un cambio de identidad. En ese caso conviene adoptar igualmente las mejoras
  técnicas de la auditoría (sombras del oscuro, escala de espaciado en Flutter, semánticos en `LesenTokens`).

## Riesgos de adoptar Gaceta

| Riesgo                                                         | Mitigación                                                                                                           |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Tres familias pesan más en la web (unos 228 KB la primera vez) | `unicode-range`, `font-display: swap`, precargar solo la latin normal de la de lectura; o quedarse con Source Sans 3 |
| Los filetes exigen disciplina en cada componente nuevo         | Un `SectionHeading` y un `Rule` compartidos, en lugar de bordes sueltos                                              |
| Fraunces cambia mucho entre pesos y ópticos                    | Limitar el display a los pesos 380–500 y fijar el óptico automático                                                  |
| El binario de Flutter crece (unos 1,6 MB de TTF)               | Subconjuntos latin y latin-ext con `fonttools`, o las versiones estáticas de dos pesos                               |

## Cómo se adoptaría

1. **Una ADR nueva** en lesen-app, que reemplace la ADR-0008 «Papel y tinta», y su equivalente en el README del
   sistema de diseño de lesen-ui. Una ADR aceptada no se edita.
2. **Web:**
   - Pasar los valores de `tokens/gaceta.json` a `lesen.css` (los cinco bloques) y las fuentes a `src/theme/fonts`.
   - Convertir `gaceta.signature.css` en variantes de los componentes: `SectionHeading` con filete, `Hero` sin
     degradado y navegación subrayada.
   - Borrar el laboratorio.
3. **Flutter:**
   - Pasar `lib/app/theme/explorations/gaceta.dart` a `tokens.dart` y `reader_theme.dart`, y las TTF a
     `assets/fonts/` sin flavor.
   - Añadir los semánticos `success`, `warning` y `danger` a `LesenTokens`.
4. **Pruebas:**
   - Regenerar las capturas de referencia de la suite visual y los goldens.
   - El contraste lo siguen comprobando `lesen.test.ts` y `accessibility_test.dart`.
5. **Pendientes de la auditoría que conviene hacer a la vez:**
   - Sombras propias del oscuro.
   - `theme-color` según el tema.
   - Una escala de espaciado y breakpoints compartidos en Flutter.
6. **Revisión en dispositivo** (`lesen-app/docs/platform/device-verification.md`): lectura larga en el lector a 18 y a
   29 px, en sepia y oscuro, con VoiceOver y TalkBack.

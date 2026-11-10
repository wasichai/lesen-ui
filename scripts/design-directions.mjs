// genera los temas de exploración (docs/design-system/lesen/explorations) a partir de sus tokens en JSON:
//   node scripts/design-directions.mjs           escribe src/theme/explorations/<id>.css y comprueba el contraste
//   node scripts/design-directions.mjs --check   solo comprueba (sale con 1 si un par no llega a WCAG 2.2 AA)
// cada dirección da sus anclas para claro y oscuro; los temas del lector heredan de ellas y cambian lo que necesitan. el
// resto de tokens del contrato de @wasichai/ui se deriva aquí, siempre igual, para que ninguna dirección se los salte.
// solo el laboratorio de diseño (src/dev/design-lab) carga estas hojas, nunca la build de producción
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const source = join(root, 'docs/design-system/lesen/explorations/tokens')
const target = join(root, 'src/theme/explorations')

// los temas de Lesen que cada dirección vuelve a pintar, y de qué anclas parte cada uno
const THEMES = [
  { id: 'lesen', base: 'light', page: true },
  { id: 'lesen-dark', base: 'dark', page: true },
  { id: 'lesen-reader-light', base: 'light', extra: 'reader-light' },
  { id: 'lesen-reader-sepia', base: 'light', extra: 'reader-sepia' },
  { id: 'lesen-reader-dark', base: 'dark', extra: 'reader-dark' }
]

const hex = (value) =>
  value
    .replace('#', '')
    .match(/../g)
    .map((pair) => Number.parseInt(pair, 16))
const toHex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
const mix = (a, b, amount) => toHex(hex(a).map((c, i) => c + (hex(b)[i] - c) * amount))

function luminance(value) {
  const [r, g, b] = hex(value)
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

// los mismos pares que src/theme/lesen.test.ts, más tinta sobre papel a 7:1 para leer mucho rato
const TEXT = [
  ['ink', ['surface', 'surface-muted', 'surface-raised', 'table-head', 'brand-soft', 'mark-sentence']],
  ['ink-muted', ['surface', 'surface-muted', 'surface-raised']],
  ['brand', ['surface', 'surface-raised']],
  ['brand-strong', ['surface', 'surface-muted', 'brand-soft']],
  ['link', ['surface', 'surface-muted']],
  ['on-brand', ['brand', 'brand-strong']],
  ['on-danger', ['danger']],
  ['danger', ['surface', 'danger-soft']],
  ['success', ['surface', 'success-soft']],
  ['warning', ['surface', 'warning-soft']],
  ['notice', ['surface', 'notice-soft']],
  ['shell-ink', ['shell']],
  ['shell-muted', ['shell']],
  ['mark-saved-ink', ['mark-saved']],
  ['sage', ['surface', 'surface-raised']],
  ['ochre', ['surface', 'surface-raised']],
  ['sea', ['surface', 'surface-raised']],
  ['plum', ['surface', 'surface-raised']]
]
const MARKS = [
  ['border-control', ['surface', 'surface-muted']],
  ['focus', ['surface', 'surface-muted', 'surface-raised']],
  ['mark-new', ['surface', 'mark-sentence']]
]
const READING = [['ink', ['surface']]]

// el contrato completo de un tema, con lo derivado
function resolveTheme(direction, theme) {
  const color = { ...direction.color[theme.base], ...(theme.extra ? direction.color[theme.extra] : {}) }
  const dark = theme.base === 'dark'
  const ink = hex(color.ink)
  const derived = {
    shell: color.surface,
    'shell-ink': color.ink,
    'shell-muted': mix(color['ink-muted'], color.ink, 0.35),
    link: color['brand-strong'],
    'table-head': mix(color['surface-muted'], color.surface, 0.35),
    'table-stripe': mix(color.surface, color['surface-muted'], 0.45),
    'map-selected': color.brand,
    'mark-saved-ink': color.ink,
    overlay: dark ? 'rgb(0 0 0 / 64%)' : `rgb(${ink.join(' ')} / 52%)`
  }
  return { ...derived, ...color }
}

function failures(values, pairs, min) {
  return pairs.flatMap(([front, backs]) =>
    backs.flatMap((back) => {
      const ratio = contrast(values[front], values[back])
      return ratio >= min ? [] : [`${front} sobre ${back}: ${ratio.toFixed(2)} (< ${min})`]
    })
  )
}

const ORDER = [
  'surface',
  'surface-muted',
  'surface-raised',
  'border',
  'ink',
  'ink-muted',
  'brand',
  'brand-strong',
  'brand-soft',
  'on-brand',
  'shell',
  'shell-muted',
  'shell-ink',
  'danger',
  'danger-soft',
  'on-danger',
  'success',
  'success-soft',
  'warning',
  'warning-soft',
  'notice',
  'notice-soft',
  'overlay',
  'link',
  'focus',
  'table-head',
  'table-stripe',
  'map-selected',
  'border-control',
  'sage',
  'ochre',
  'sea',
  'plum',
  'accent',
  'mark-saved',
  'mark-saved-ink',
  'mark-new',
  'mark-sentence'
]

function block(direction, theme, values) {
  const shadow = direction.shadow[theme.base]
  const { radius } = direction.shape
  const selector = theme.page
    ? `:root[data-direction='${direction.id}'][data-theme='${theme.id}']`
    : `:root[data-direction='${direction.id}'] [data-theme='${theme.id}']`
  const lines = [
    ...ORDER.map((name) => `  --${name}: ${values[name]};`),
    '  --line: var(--border);',
    '  --placeholder: var(--ink-muted);',
    '',
    `  --font-sans: ${direction.font.sans};`,
    `  --radius: ${radius.base};`,
    ...['sm', 'md', 'lg', 'xl', 'card'].map((step) => `  --radius-${step}: ${radius[step]};`),
    `  --radius-button: ${direction.shape.button};`,
    `  --radius-chip: ${direction.shape.chip};`,
    `  --shadow-cover: ${shadow.card};`,
    `  --shadow-cover-raised: ${shadow.raised};`,
    `  --shadow-hero: ${shadow.raised};`,
    `  --shadow-overlay: ${shadow.overlay};`
  ]
  return `${selector} {\n${lines.join('\n')}\n}`
}

// la tipografía va en :root (la escala de Tailwind vive allí, en @theme); el lector solo hereda
function typography(direction) {
  const lines = [`  --font-display: ${direction.font.display};`, `  --font-read: ${direction.font.read};`]
  for (const [step, style] of Object.entries(direction.type)) {
    if (style.weight !== undefined) lines.push(`  --text-${step}--font-weight: ${style.weight};`)
    if (style.tracking !== undefined) lines.push(`  --text-${step}--letter-spacing: ${style.tracking};`)
  }
  return `:root[data-direction='${direction.id}'] {\n${lines.join('\n')}\n}`
}

const check = process.argv.includes('--check')
let problems = 0

for (const file of readdirSync(source)
  .filter((name) => name.endsWith('.json'))
  .sort()) {
  const direction = JSON.parse(readFileSync(join(source, file), 'utf8'))
  const blocks = [typography(direction)]
  for (const theme of THEMES) {
    const values = resolveTheme(direction, theme)
    const missing = ORDER.filter((name) => values[name] === undefined)
    const failed = [
      ...missing.map((name) => `falta --${name}`),
      ...failures(values, TEXT, 4.5),
      ...failures(values, MARKS, 3),
      ...failures(values, READING, theme.page ? 4.5 : 7)
    ]
    for (const problem of failed) console.error(`${direction.id} · ${theme.id}: ${problem}`)
    problems += failed.length
    blocks.push(block(direction, theme, values))
  }
  const header = `/* dirección de exploración «${direction.name}»: ${direction.concept}\n   generado por scripts/design-directions.mjs desde docs/design-system/lesen/explorations/tokens/${file}; no se edita a mano.\n   solo lo carga el laboratorio de diseño (src/dev/design-lab), en desarrollo */\n`
  if (!check) writeFileSync(join(target, `${direction.id}.css`), `${header}\n${blocks.join('\n\n')}\n`)
}

if (problems > 0) {
  console.error(`\n${problems} pares por debajo de WCAG 2.2 AA`)
  process.exit(1)
}
console.log(check ? 'contraste AA en todas las direcciones' : 'direcciones generadas en src/theme/explorations')

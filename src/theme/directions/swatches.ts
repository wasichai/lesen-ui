// generado por scripts/design-directions.mjs: la marca y la superficie de cada identidad, para su muestra en el perfil
export const SWATCHES = {
  papel: { light: ['#a8402a', '#fbf7f0'], dark: ['#f19a7b', '#17181d'] },
  atlas: { light: ['#1c3fd1', '#fafaf8'], dark: ['#8fa3ff', '#0c0c0e'] },
  gaceta: { light: ['#7a1f2b', '#f7f2e8'], dark: ['#e8a3a8', '#121521'] },
  musgo: { light: ['#2f5e45', '#f3efe6'], dark: ['#9fcaa9', '#141a17'] },
  pulso: { light: ['#4a3fd6', '#f6f7fb'], dark: ['#a49cff', '#0f1226'] }
} as const satisfies Record<string, { light: readonly [string, string]; dark: readonly [string, string] }>

import type { WasichaiModule } from '@wasichai/core'
import { DISCOVER_MODULE_ID, discoverMessages } from './i18n'

// descubrir qué leer: la portada editorial, el catálogo con filtros y la ficha de cada lectura
export function discoverModule(): WasichaiModule {
  return {
    id: DISCOVER_MODULE_ID,
    routes: [
      { id: 'home', path: 'discover', chrome: 'bare', lazy: () => import('./DiscoverPage').then((m) => ({ default: m.DiscoverPage })) },
      { id: 'explore', path: 'explore', chrome: 'bare', lazy: () => import('./ExplorePage').then((m) => ({ default: m.ExplorePage })) },
      { id: 'reading', path: 'readings/:slug', chrome: 'bare', lazy: () => import('./ReadingDetailPage').then((m) => ({ default: m.ReadingDetailPage })) }
    ],
    i18n: discoverMessages
  }
}

import { useAuth, useWasichaiLinks } from '@wasichai/core'
import { Compass, LogOut, PenLine } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { APP_NAMESPACE } from './appMessages'
import { EmptyState } from './EmptyState'
import { LesenMark } from './LesenMark'
import { ROUTES } from './routes'
import { useAppName } from './useAppName'

// el marco del estudio editorial (ADR-0012 del backend): para quien escribe y publica, que no necesita perfil de lectora.
// Ancho de escritorio, sin barra de pestañas; quien además lee vuelve a Lesen desde aquí
export function StudioLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { t } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const { signOut, can } = useAuth()
  const appName = useAppName()
  const allowed = can('estudio', 'READ')
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
      >
        {t('nav.skip')}
      </a>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
        <div className="mx-auto flex h-16 max-w-page items-center gap-3 px-4 sm:px-6">
          <NavLink to={links.to(ROUTES.studio)} end className="flex min-w-0 items-center gap-2 rounded-full pr-2">
            <LesenMark className="size-8 shrink-0" />
            <span className="truncate font-read text-[22px] font-semibold tracking-tight">{appName}</span>
            <span className="hidden rounded-full bg-surface-muted px-2.5 py-0.5 text-secondary font-semibold text-ink-muted sm:inline">
              {t('studio.label')}
            </span>
          </NavLink>
          <nav aria-label={t('studio.nav')} className="ml-auto flex items-center gap-1">
            <NavLink
              to={links.to(ROUTES.studio)}
              end
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-3 text-label ${isActive ? 'bg-ink text-surface' : 'text-ink hover:bg-surface-muted'}`
              }
            >
              <PenLine aria-hidden className="size-[18px]" />
              <span className="sr-only sm:not-sr-only">{t('studio.drafts')}</span>
            </NavLink>
            {can('cuaderno', 'READ') && links.has(ROUTES.discover) && (
              <NavLink
                to={links.to(ROUTES.discover)}
                className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-3 text-label text-ink hover:bg-surface-muted"
              >
                <Compass aria-hidden className="size-[18px]" />
                <span className="sr-only sm:not-sr-only">{t('studio.toReader')}</span>
              </NavLink>
            )}
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-secondary font-semibold text-ink-muted hover:bg-surface-muted hover:text-ink"
            >
              <LogOut aria-hidden className="size-4" />
              <span className="sr-only lg:not-sr-only">{t('nav.signOut')}</span>
            </button>
          </nav>
        </div>
      </header>
      <main id="content" tabIndex={-1} className={`mx-auto w-full flex-1 px-4 pb-16 pt-6 sm:px-6 ${wide ? 'max-w-[90rem]' : 'max-w-page'}`}>
        {allowed ? children : <EmptyState icon={PenLine} title={t('studio.forbidden')} body={t('studio.forbiddenBody')} />}
      </main>
    </div>
  )
}

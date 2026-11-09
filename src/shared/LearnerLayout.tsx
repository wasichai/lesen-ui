import { useAuth, useWasichaiLinks } from '@wasichai/core'
import { BookMarked, BookOpenText, Compass, Languages, LogOut, UserRound } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, NavLink, useLocation } from 'react-router'
import { useProfile } from './api'
import { APP_NAMESPACE } from './appMessages'
import { LesenMark } from './LesenMark'
import { ProblemState } from './ProblemState'
import { ROUTES, type RouteName } from './routes'
import { Skeleton } from './Skeleton'
import { useAppName } from './useAppName'

const NAV: { route: RouteName; key: string; icon: ComponentType<{ className?: string }> }[] = [
  { route: 'discover', key: 'nav.discover', icon: Compass },
  { route: 'library', key: 'nav.library', icon: BookOpenText },
  { route: 'vocabulary', key: 'nav.vocabulary', icon: BookMarked },
  { route: 'dictionary', key: 'nav.dictionary', icon: Languages },
  { route: 'profile', key: 'nav.profile', icon: UserRound }
]

// el marco de quien lee (ADR-0006): barra superior con las secciones en escritorio y tableta, barra de pestañas abajo en
// el móvil. Nada de barra lateral: el contenido es lo primero. Sin perfil todavía, lleva al onboarding
export function LearnerLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const profile = useProfile()
  const { signOut } = useAuth()
  const location = useLocation()
  const appName = useAppName()
  if (profile.isSuccess && profile.data === null) return <Navigate to={links.to(ROUTES.welcome)} replace state={{ from: location.pathname }} />
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
      >
        {t('nav.skip')}
      </a>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
        <div className="mx-auto flex h-16 max-w-page items-center gap-6 px-4 sm:px-6">
          <NavLink to={links.to(ROUTES.discover)} className="flex items-center gap-2 rounded-full pr-2">
            <LesenMark className="size-8" />
            <span className="font-read text-[22px] font-semibold tracking-tight">{appName}</span>
          </NavLink>
          <nav aria-label={t('nav.label')} className="hidden flex-1 lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map(({ route, key, icon: Icon }) => (
                <li key={route}>
                  <NavLink
                    to={links.to(ROUTES[route])}
                    end={route === 'discover'}
                    className={({ isActive }) =>
                      `inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-label transition-colors ${
                        isActive ? 'bg-ink text-surface' : 'text-ink hover:bg-surface-muted'
                      }`
                    }
                  >
                    <Icon aria-hidden className="size-[18px]" />
                    {t(key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            onClick={signOut}
            className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-secondary font-semibold text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            <LogOut aria-hidden className="size-4" />
            <span className="hidden sm:inline">{t('nav.signOut')}</span>
            <span className="sr-only sm:hidden">{t('nav.signOut')}</span>
          </button>
        </div>
      </header>
      <main id="content" tabIndex={-1} className={`mx-auto w-full flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-16 max-w-page`}>
        {profile.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : profile.isError ? (
          <ProblemState error={profile.error} onRetry={() => profile.refetch()} />
        ) : (
          children
        )}
      </main>
      <nav
        aria-label={t('nav.label')}
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-raised/95 backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV.map(({ route, key, icon: Icon }) => (
            <li key={route}>
              <NavLink
                to={links.to(ROUTES[route])}
                end={route === 'discover'}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11.5px] font-semibold leading-tight ${isActive ? 'text-brand-strong' : 'text-ink-muted'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${isActive ? 'bg-brand-soft' : ''}`}>
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="max-w-full truncate">{t(key)}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

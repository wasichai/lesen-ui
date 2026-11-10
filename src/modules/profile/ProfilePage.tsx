import { useSetLocale, useTheme } from '@wasichai/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguages, useLesenApi, useProfile, useTopics } from '../../shared/api'
import { APP_NAMESPACE } from '../../shared/appMessages'
import { languageName } from '../../shared/format'
import { deviceTimeZone, GOALS_KEY, goalsSchema, useGoals, type Goals } from '../../shared/goals'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { DIFFICULTIES, GOALS, LEVELS, profileSchema, type Profile } from '../../shared/schemas'
import { Skeleton } from '../../shared/Skeleton'
import { localizedLabel } from '../../shared/topics'
import { buttonClass, chipClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { DIRECTIONS, useDirection } from '../../theme/direction'
import { SWATCHES } from '../../theme/directions/swatches'
import { PROFILE_MODULE_ID } from './i18n'

const MINUTES = [5, 10, 15, 20, 30, 45, 60]
const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 7]

export function ProfilePage() {
  const { t } = useTranslation(PROFILE_MODULE_ID)
  usePageTitle(t('title'))
  const profile = useProfile()
  const goals = useGoals()
  return (
    <LearnerLayout>
      {profile.data && (goals.data || goals.isError) ? <ProfileForm profile={profile.data} goals={goals.data ?? null} /> : <Skeleton className="h-96" />}
    </LearnerLayout>
  )
}

type GoalsDraft = Pick<Goals, 'weeklyDays' | 'weeklySummary' | 'timeZone'>

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value])

function ProfileForm({ profile, goals }: { profile: Profile; goals: Goals | null }) {
  const { t, i18n } = useTranslation(PROFILE_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const languages = useLanguages()
  const topics = useTopics()
  const theme = useTheme()
  const [direction, setDirection] = useDirection()
  const setLocale = useSetLocale()
  const queryClient = useQueryClient()
  const { send } = useLesenApi()
  const [draft, setDraft] = useState<Profile>(profile)
  // sin metas guardadas todavía, los días se cuentan en la zona de este dispositivo
  const device = deviceTimeZone()
  const [rhythm, setRhythm] = useState<GoalsDraft | null>(
    goals && { weeklyDays: goals.weeklyDays, weeklySummary: goals.weeklySummary, timeZone: goals.configured ? goals.timeZone : (device ?? goals.timeZone) }
  )
  const save = useMutation({
    mutationFn: async () => {
      const saved = await send('PUT', '/lesen/learner/profile', draft, profileSchema)
      if (rhythm) queryClient.setQueryData(GOALS_KEY, await send('PUT', '/lesen/progress/goals', rhythm, goalsSchema))
      if (!i18n.language.startsWith(saved.interfaceLanguage)) await setLocale(saved.interfaceLanguage).catch(() => undefined)
      return saved
    },
    onSuccess: async (saved) => {
      queryClient.setQueryData(['me', 'profile'], saved)
      await queryClient.invalidateQueries({ queryKey: ['me'] })
    }
  })
  const setGoals = (change: Partial<GoalsDraft>) => {
    save.reset()
    setRhythm((current) => (current ? { ...current, ...change } : current))
  }
  const all = languages.data?.languages ?? []
  const set = (change: Partial<Profile>) => {
    save.reset()
    setDraft((current) => {
      const next = { ...current, ...change }
      if (next.targetLanguage === next.interfaceLanguage)
        next.targetLanguage = all.find((l) => l.study && l.code !== next.interfaceLanguage)?.code ?? next.targetLanguage
      return next
    })
  }
  return (
    <form
      className="mx-auto flex max-w-3xl flex-col gap-10"
      onSubmit={(event) => {
        event.preventDefault()
        save.mutate()
      }}
    >
      <header>
        <h1 className="font-display text-h1">{t('title')}</h1>
        <p className="mt-2 text-ink-muted">{t('lead')}</p>
      </header>

      <Section title={t('languages')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-label">{t('interface')}</span>
            <select
              value={draft.interfaceLanguage}
              onChange={(event) => set({ interfaceLanguage: event.target.value })}
              className="min-h-11 rounded-[var(--radius-md)] border border-border-control bg-surface-raised px-3 text-[16px]"
            >
              {all
                .filter((l) => l.interfaceLanguage)
                .map((l) => (
                  <option key={l.code} value={l.code} lang={l.code}>
                    {l.nativeName}
                  </option>
                ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-label">{t('target')}</span>
            <select
              value={draft.targetLanguage}
              onChange={(event) => set({ targetLanguage: event.target.value })}
              className="min-h-11 rounded-[var(--radius-md)] border border-border-control bg-surface-raised px-3 text-[16px]"
            >
              {all
                .filter((l) => l.study && l.code !== draft.interfaceLanguage)
                .map((l) => (
                  <option key={l.code} value={l.code}>
                    {languageName(l.code, i18n.language)}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </Section>

      <Section title={t('level')}>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('level')}>
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={draft.level === level}
              className={chipClass(draft.level === level)}
              onClick={() => set({ level, levelEstimated: false })}
            >
              {level} · {app(`level.${level}`)}
            </button>
          ))}
        </div>
        {draft.levelEstimated && <p className="mt-3 text-secondary text-ink-muted">{t('levelEstimated')}</p>}
      </Section>

      <Section title={t('goals')}>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              aria-pressed={draft.goals.includes(goal)}
              className={chipClass(draft.goals.includes(goal))}
              onClick={() => set({ goals: toggle(draft.goals, goal) })}
            >
              {draft.goals.includes(goal) && <Check aria-hidden className="size-4" />}
              {app(`goal.${goal}`)}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('topics')}>
        <div className="flex flex-wrap gap-2">
          {(topics.data ?? []).map((topic) => (
            <button
              key={topic.slug}
              type="button"
              aria-pressed={draft.topics.includes(topic.slug)}
              className={chipClass(draft.topics.includes(topic.slug))}
              onClick={() => set({ topics: toggle(draft.topics, topic.slug) })}
            >
              {draft.topics.includes(topic.slug) && <Check aria-hidden className="size-4" />}
              {localizedLabel(topic.labels, i18n.language)}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('habit')}>
        <p className="mb-3 text-label">{t('daily')}</p>
        <div className="flex flex-wrap gap-2">
          {MINUTES.map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={draft.dailyMinutes === minutes}
              className={chipClass(draft.dailyMinutes === minutes)}
              onClick={() => set({ dailyMinutes: minutes })}
            >
              {t('minutes', { count: minutes })}
            </button>
          ))}
        </div>
        {rhythm && (
          <>
            <p className="mb-1 mt-6 text-label">{t('weeklyDays')}</p>
            <p className="mb-3 text-secondary text-ink-muted">{t('weeklyDaysHint')}</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('weeklyDays')}>
              {WEEK_DAYS.map((days) => (
                <button
                  key={days}
                  type="button"
                  role="radio"
                  aria-checked={rhythm.weeklyDays === days}
                  className={chipClass(rhythm.weeklyDays === days)}
                  onClick={() => setGoals({ weeklyDays: days })}
                >
                  {t('days', { count: days })}
                </button>
              ))}
            </div>
            <label className="mt-6 flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                className="size-5 accent-[var(--brand)]"
                checked={rhythm.weeklySummary}
                onChange={(event) => setGoals({ weeklySummary: event.target.checked })}
              />
              <span>{t('weeklySummary')}</span>
            </label>
            <p className="mt-4 text-secondary text-ink-muted">
              {t('timeZone', { zone: rhythm.timeZone })}
              {device && device !== rhythm.timeZone && (
                <button type="button" className={buttonClass('quiet', 'sm', 'ml-1')} onClick={() => setGoals({ timeZone: device })}>
                  {t('useDeviceZone', { zone: device })}
                </button>
              )}
            </p>
          </>
        )}
        <p className="mb-3 mt-6 text-label">{t('difficulty')}</p>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty}
              type="button"
              aria-pressed={draft.difficulty === difficulty}
              className={chipClass(draft.difficulty === difficulty)}
              onClick={() => set({ difficulty })}
              title={app(`difficulty.hint.${difficulty}`)}
            >
              {app(`difficulty.${difficulty}`)}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('appearance')}>
        <p id="identity" className="mb-1 text-label">
          {t('identity')}
        </p>
        <p id="identity-lead" className="mb-3 text-secondary text-ink-muted">
          {t('identityLead')}
        </p>
        <div role="group" aria-labelledby="identity" aria-describedby="identity-lead" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DIRECTIONS.map((id) => {
            const [brand, surface] = SWATCHES[id][theme.colorScheme]
            const chosen = direction === id
            return (
              <button
                key={id}
                type="button"
                aria-pressed={chosen}
                className={`flex min-h-14 items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2 text-left transition-colors ${
                  chosen ? 'border-brand bg-brand-soft' : 'border-border bg-surface-raised hover:border-border-control'
                }`}
                onClick={() => setDirection(id)}
              >
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-border-control"
                  style={{ backgroundColor: surface }}
                >
                  <span className="size-4 rounded-full" style={{ backgroundColor: brand }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-label ${chosen ? 'text-brand-strong' : 'text-ink'}`}>{t(`direction.${id}.name`)}</span>
                  <span className="block text-[13px] text-ink-muted">{t(`direction.${id}.note`)}</span>
                </span>
                {chosen && <Check aria-hidden className="size-5 shrink-0 text-brand-strong" />}
              </button>
            )
          })}
        </div>
        <p className="mb-3 mt-6 text-label">{t('mode')}</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'system', label: t('theme.system') },
            { id: 'lesen', label: t('theme.lesen') },
            { id: 'lesen-dark', label: t('theme.lesenDark') }
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={theme.preference === option.id}
              className={chipClass(theme.preference === option.id)}
              onClick={() => void theme.setPreference(option.id).catch(() => undefined)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-4 rounded-full border border-border bg-surface-raised p-2 pl-5 shadow-sm">
        <p aria-live="polite" className={`flex-1 text-secondary ${save.isError ? 'text-danger' : 'text-ink-muted'}`}>
          {save.isError ? t('error') : save.isSuccess ? t('saved') : ''}
        </p>
        <button type="submit" className={buttonClass('primary')} disabled={save.isPending}>
          {save.isPending ? t('saving') : t('save')}
        </button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <h2 className="font-display text-h3">{title}</h2>
      <div>{children}</div>
    </section>
  )
}

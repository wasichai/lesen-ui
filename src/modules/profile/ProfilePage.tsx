import { useSetLocale, useTheme } from '@wasichai/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguages, useLesenApi, useProfile, useTopics } from '../../shared/api'
import { APP_NAMESPACE } from '../../shared/appMessages'
import { languageName } from '../../shared/format'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { DIFFICULTIES, GOALS, LEVELS, profileSchema, type Profile } from '../../shared/schemas'
import { Skeleton } from '../../shared/Skeleton'
import { localizedLabel } from '../../shared/topics'
import { buttonClass, chipClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { PROFILE_MODULE_ID } from './i18n'

const MINUTES = [5, 10, 15, 20, 30, 45, 60]

export function ProfilePage() {
  const { t } = useTranslation(PROFILE_MODULE_ID)
  usePageTitle(t('title'))
  const profile = useProfile()
  return <LearnerLayout>{profile.data ? <ProfileForm profile={profile.data} /> : <Skeleton className="h-96" />}</LearnerLayout>
}

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value])

function ProfileForm({ profile }: { profile: Profile }) {
  const { t, i18n } = useTranslation(PROFILE_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const languages = useLanguages()
  const topics = useTopics()
  const theme = useTheme()
  const setLocale = useSetLocale()
  const queryClient = useQueryClient()
  const { send } = useLesenApi()
  const [draft, setDraft] = useState<Profile>(profile)
  const save = useMutation({
    mutationFn: async () => {
      const saved = await send('PUT', '/lesen/learner/profile', draft, profileSchema)
      if (!i18n.language.startsWith(saved.interfaceLanguage)) await setLocale(saved.interfaceLanguage).catch(() => undefined)
      return saved
    },
    onSuccess: async (saved) => {
      queryClient.setQueryData(['me', 'profile'], saved)
      await queryClient.invalidateQueries({ queryKey: ['me'] })
    }
  })
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
        <h1 className="font-read text-h1">{t('title')}</h1>
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
      <h2 className="font-read text-h3">{title}</h2>
      <div>{children}</div>
    </section>
  )
}

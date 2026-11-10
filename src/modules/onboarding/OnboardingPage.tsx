import { useSetLocale, useWasichaiLinks } from '@wasichai/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { useLanguages, useLesenApi, useProfile, useTopics } from '../../shared/api'
import { APP_NAMESPACE } from '../../shared/appMessages'
import { languageName } from '../../shared/format'
import { LesenMark } from '../../shared/LesenMark'
import { ProblemState } from '../../shared/ProblemState'
import { ROUTES } from '../../shared/routes'
import { DIFFICULTIES, GOALS, LEVELS, profileSchema } from '../../shared/schemas'
import { Skeleton } from '../../shared/Skeleton'
import { localizedLabel } from '../../shared/topics'
import { buttonClass, chipClass } from '../../shared/ui'
import { useAppName } from '../../shared/useAppName'
import { ONBOARDING_MODULE_ID } from './i18n'
import { canAdvance, DAILY_OPTIONS, ESTIMATED_LEVEL, initialDraft, STEPS, toggle, toRequest, withInterface, type Draft } from './onboardingModel'

export function OnboardingPage() {
  const { t, i18n } = useTranslation(ONBOARDING_MODULE_ID)
  const { t: app } = useTranslation(APP_NAMESPACE)
  const links = useWasichaiLinks()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { send } = useLesenApi()
  const setLocale = useSetLocale()
  const appName = useAppName()
  const profile = useProfile()
  const languages = useLanguages()
  const topics = useTopics()
  const [draft, setDraft] = useState<Draft>(() => initialDraft(i18n.language.startsWith('en') ? 'en' : 'es'))
  const [index, setIndex] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const step = STEPS[index]!
  const save = useMutation({
    mutationFn: () => send('PUT', '/lesen/learner/profile', toRequest(draft), profileSchema),
    onSuccess: async (saved) => {
      queryClient.setQueryData(['me', 'profile'], saved)
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate(links.to(ROUTES.discover), { replace: true })
    }
  })
  // el foco va al titular de cada paso: quien usa un lector de pantalla sabe dónde está
  useEffect(() => {
    if (index > 0) heading.current?.focus()
  }, [index])

  if (profile.data) return <Navigate to={links.to(ROUTES.discover)} replace />
  if (languages.isError) return <ProblemState error={languages.error} onRetry={() => languages.refetch()} />
  if (!languages.data || profile.isPending) return <Skeleton className="m-6 h-96" />

  const interfaces = languages.data.languages.filter((l) => l.interfaceLanguage)
  const studies = languages.data.languages.filter((l) => l.study && l.code !== draft.interfaceLanguage)
  const target = draft.targetLanguage ? languageName(draft.targetLanguage, i18n.language) : ''
  const last = index === STEPS.length - 1

  const chooseInterface = async (code: string) => {
    setDraft((current) => withInterface(current, code))
    await setLocale(code).catch(() => undefined)
  }

  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 pb-8 pt-6 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LesenMark className="size-9" />
            <span className="font-display text-[22px] font-semibold">{appName}</span>
          </div>
          <p className="text-secondary font-semibold text-ink-muted" aria-live="polite">
            {t('step', { current: index + 1, total: STEPS.length })}
          </p>
        </header>
        <div className="mt-4 flex gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= index ? 'bg-brand' : 'bg-border'}`} />
          ))}
        </div>

        <form
          className="flex flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canAdvance(step, draft)) return
            if (last) save.mutate()
            else setIndex(index + 1)
          }}
        >
          <section key={step} className="flex-1 animate-rise py-8">
            {step === 'interface' && (
              <>
                <p className="flex items-center gap-2 text-eyebrow uppercase text-brand-strong">
                  <Sparkles aria-hidden className="size-4" />
                  {t('interface.eyebrow')}
                </p>
                <h1 ref={heading} tabIndex={-1} className="mt-3 font-display text-h1 sm:text-display">
                  {t('interface.heading')}
                </h1>
                <p className="mt-4 text-[18px] leading-relaxed text-ink-muted">{t('interface.body')}</p>
                <fieldset className="mt-8">
                  <legend className="sr-only">{t('interface.body')}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {interfaces.map((language) => (
                      <OptionCard
                        key={language.code}
                        name="interface"
                        checked={draft.interfaceLanguage === language.code}
                        onChange={() => void chooseInterface(language.code)}
                        title={language.nativeName}
                        lang={language.code}
                      />
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {step === 'target' && (
              <>
                <h1 ref={heading} tabIndex={-1} className="font-display text-h1">
                  {t('target.heading')}
                </h1>
                <p className="mt-3 text-ink-muted">{t('target.body')}</p>
                <fieldset className="mt-8">
                  <legend className="sr-only">{t('target.heading')}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {studies.map((language) => (
                      <OptionCard
                        key={language.code}
                        name="target"
                        checked={draft.targetLanguage === language.code}
                        onChange={() => setDraft({ ...draft, targetLanguage: language.code })}
                        title={languageName(language.code, i18n.language)}
                        detail={language.nativeName}
                      />
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {step === 'level' && (
              <>
                <h1 ref={heading} tabIndex={-1} className="font-display text-h1">
                  {t('level.heading', { language: target })}
                </h1>
                <p className="mt-3 text-ink-muted">{t('level.body')}</p>
                <fieldset className="mt-8">
                  <legend className="sr-only">{t('level.heading', { language: target })}</legend>
                  <div className="grid gap-3">
                    {LEVELS.map((level) => (
                      <OptionCard
                        key={level}
                        name="level"
                        checked={draft.level === level && !draft.levelEstimated}
                        onChange={() => setDraft({ ...draft, level, levelEstimated: false })}
                        title={`${level} · ${app(`level.${level}`)}`}
                        detail={app(`level.canDo.${level}`)}
                      />
                    ))}
                    <OptionCard
                      name="level"
                      checked={draft.levelEstimated}
                      onChange={() => setDraft({ ...draft, level: ESTIMATED_LEVEL, levelEstimated: true })}
                      title={t('level.unsure')}
                      detail={t('level.unsureBody')}
                    />
                  </div>
                </fieldset>
              </>
            )}
            {step === 'interests' && (
              <>
                <h1 ref={heading} tabIndex={-1} className="font-display text-h1">
                  {t('interests.heading')}
                </h1>
                <p className="mt-3 text-ink-muted">{t('interests.body')}</p>
                <fieldset className="mt-8">
                  <legend className="text-label">{t('interests.goals')}</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {GOALS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        aria-pressed={draft.goals.includes(goal)}
                        className={chipClass(draft.goals.includes(goal))}
                        onClick={() => setDraft({ ...draft, goals: toggle(draft.goals, goal) })}
                      >
                        {draft.goals.includes(goal) && <Check aria-hidden className="size-4" />}
                        {app(`goal.${goal}`)}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-8">
                  <legend className="text-label">{t('interests.topics')}</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(topics.data ?? []).map((topic) => (
                      <button
                        key={topic.slug}
                        type="button"
                        aria-pressed={draft.topics.includes(topic.slug)}
                        className={chipClass(draft.topics.includes(topic.slug))}
                        onClick={() => setDraft({ ...draft, topics: toggle(draft.topics, topic.slug) })}
                      >
                        {draft.topics.includes(topic.slug) && <Check aria-hidden className="size-4" />}
                        {localizedLabel(topic.labels, i18n.language)}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {step === 'habit' && (
              <>
                <h1 ref={heading} tabIndex={-1} className="font-display text-h1">
                  {t('habit.heading')}
                </h1>
                <p className="mt-3 text-ink-muted">{t('habit.body')}</p>
                <fieldset className="mt-8">
                  <legend className="text-label">{t('habit.daily')}</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DAILY_OPTIONS.map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        aria-pressed={draft.dailyMinutes === minutes}
                        className={chipClass(draft.dailyMinutes === minutes)}
                        onClick={() => setDraft({ ...draft, dailyMinutes: minutes })}
                      >
                        {t('habit.minutes', { count: minutes })}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-8">
                  <legend className="text-label">{t('habit.difficulty')}</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {DIFFICULTIES.map((difficulty) => (
                      <OptionCard
                        key={difficulty}
                        name="difficulty"
                        checked={draft.difficulty === difficulty}
                        onChange={() => setDraft({ ...draft, difficulty })}
                        title={app(`difficulty.${difficulty}`)}
                        detail={app(`difficulty.hint.${difficulty}`)}
                      />
                    ))}
                  </div>
                </fieldset>
              </>
            )}
          </section>

          {save.isError && (
            <p role="alert" className="mb-4 rounded-[var(--radius-md)] bg-danger-soft px-4 py-3 text-danger">
              {t('error')}
            </p>
          )}
          <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-3 border-t border-border bg-surface/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
            {index > 0 ? (
              <button type="button" className={buttonClass('ghost')} onClick={() => setIndex(index - 1)}>
                <ArrowLeft aria-hidden className="size-4" />
                {t('back')}
              </button>
            ) : (
              <span />
            )}
            <button type="submit" className={buttonClass('primary', 'md', 'px-7')} disabled={!canAdvance(step, draft) || save.isPending}>
              {save.isPending ? t('saving') : last ? t('finish') : t('next')}
              {!save.isPending && <ArrowRight aria-hidden className="size-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// una opción grande, radio nativo debajo: teclado (flechas) y lectores de pantalla como cualquier grupo de radios
function OptionCard({
  name,
  checked,
  onChange,
  title,
  detail,
  lang
}: {
  name: string
  checked: boolean
  onChange: () => void
  title: string
  detail?: string
  lang?: string
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border-2 p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-focus ${
        checked ? 'border-brand bg-brand-soft/60' : 'border-border bg-surface-raised hover:border-border-control'
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 ${checked ? 'border-brand bg-brand' : 'border-border-control'}`}
      >
        {checked && <span className="size-2 rounded-full bg-on-brand" />}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-label" lang={lang}>
          {title}
        </span>
        {detail && <span className="text-secondary text-ink-muted">{detail}</span>}
      </span>
    </label>
  )
}

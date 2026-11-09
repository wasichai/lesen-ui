import { ArrowDown, ArrowUp, Check } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { buttonClass, chipClass } from '../../shared/ui'
import type { Question } from './contract'
import { COMPREHENSION_MODULE_ID } from './i18n'
import { blanksOf, fillFromBank, move, toggleOption, type Draft } from './quizModel'

// cada forma de respuesta con controles nativos: radios y casillas para elegir, campos para los huecos, desplegables para
// emparejar y botones de subir y bajar para ordenar (sin arrastrar: todo se hace igual con teclado, ratón o dedo)
export function QuestionInput({
  question,
  draft,
  onChange,
  labelledBy,
  language
}: {
  question: Question
  draft: Draft
  onChange: (draft: Draft) => void
  labelledBy: string
  language: string
}) {
  const { t } = useTranslation(COMPREHENSION_MODULE_ID)
  const name = useId()
  switch (question.type) {
    case 'TRUE_FALSE':
      return (
        <fieldset aria-labelledby={labelledBy} className="grid gap-3 sm:grid-cols-2">
          {[true, false].map((value) => (
            <Choice
              key={String(value)}
              type="radio"
              name={name}
              checked={draft.value === value}
              onChange={() => onChange({ ...draft, value })}
              label={t(value ? 'true' : 'false')}
            />
          ))}
        </fieldset>
      )
    case 'COMPLETION':
      return <Completion question={question} draft={draft} onChange={onChange} language={language} />
    case 'MATCHING':
      return (
        <fieldset aria-labelledby={labelledBy} className="flex flex-col gap-3">
          <p className="text-secondary text-ink-muted">{t('matchHint')}</p>
          {(question.left ?? []).map((item) => (
            <MatchRow key={item.id} item={item} question={question} draft={draft} onChange={onChange} />
          ))}
        </fieldset>
      )
    case 'ORDERING': {
      const order = draft.order ?? []
      const label = (id: string) => question.items?.find((item) => item.id === id)
      return (
        <fieldset aria-labelledby={labelledBy} className="flex flex-col gap-3">
          <p className="text-secondary text-ink-muted">{t('orderHint')}</p>
          <ol className="flex flex-col gap-2" aria-live="polite">
            {order.map((id, index) => {
              const item = label(id)
              return (
                <li key={id} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface-raised py-1 pl-4 pr-1">
                  <span aria-hidden className="w-5 shrink-0 text-label tabular-nums text-ink-muted">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 py-2" lang={item?.lang}>
                    {item?.text}
                  </span>
                  <button
                    type="button"
                    className={buttonClass('ghost', 'icon')}
                    aria-label={t('up', { item: item?.text })}
                    disabled={index === 0}
                    onClick={() => onChange({ ...draft, order: move(order, index, -1) })}
                  >
                    <ArrowUp aria-hidden className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={buttonClass('ghost', 'icon')}
                    aria-label={t('down', { item: item?.text })}
                    disabled={index === order.length - 1}
                    onClick={() => onChange({ ...draft, order: move(order, index, 1) })}
                  >
                    <ArrowDown aria-hidden className="size-4" />
                  </button>
                </li>
              )
            })}
          </ol>
        </fieldset>
      )
    }
    case 'SHORT_ANSWER':
      return <ShortAnswer draft={draft} onChange={onChange} />
    default:
      return (
        <fieldset aria-labelledby={labelledBy} className="flex flex-col gap-3">
          <p className="text-secondary text-ink-muted">{t(question.multiple ? 'chooseAll' : 'chooseOne')}</p>
          {(question.options ?? []).map((option) => (
            <Choice
              key={option.id}
              type={question.multiple ? 'checkbox' : 'radio'}
              name={name}
              checked={(draft.options ?? []).includes(option.id)}
              onChange={() => onChange(toggleOption(question, draft, option.id))}
              label={option.text}
              lang={option.lang}
            />
          ))}
        </fieldset>
      )
  }
}

function Choice({
  type,
  name,
  checked,
  onChange,
  label,
  lang
}: {
  type: 'radio' | 'checkbox'
  name: string
  checked: boolean
  onChange: () => void
  label: string
  lang?: string
}) {
  return (
    <label
      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
        checked ? 'border-brand bg-brand-soft' : 'border-border bg-surface-raised hover:border-border-control'
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="size-5 shrink-0 accent-[var(--brand)]" />
      <span lang={lang} className="text-[17px]">
        {label}
      </span>
    </label>
  )
}

function Completion({ question, draft, onChange, language }: { question: Question; draft: Draft; onChange: (draft: Draft) => void; language: string }) {
  const { t } = useTranslation(COMPREHENSION_MODULE_ID)
  const blanks = blanksOf(question)
  const used = new Set(Object.values(draft.blanks ?? {}))
  return (
    <div className="flex flex-col gap-5">
      <p className="font-read text-[21px] leading-[2.2]" lang={language}>
        {(question.completion?.parts ?? []).map((part, i) =>
          part.blank ? (
            <input
              key={part.blank}
              type="text"
              aria-label={t('blank', { n: blanks.indexOf(part.blank) + 1 })}
              value={draft.blanks?.[part.blank] ?? ''}
              maxLength={64}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              onChange={(event) => onChange({ ...draft, blanks: { ...draft.blanks, [part.blank!]: event.target.value } })}
              className="mx-1 inline-block min-h-11 w-36 rounded-[var(--radius-md)] border-b-2 border-brand bg-surface-muted px-2 text-center font-read text-[19px]"
            />
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </p>
      {(question.completion?.bank.length ?? 0) > 0 && (
        <div>
          <p className="mb-2 text-secondary font-semibold text-ink-muted">{t('bank')}</p>
          <ul className="flex flex-wrap gap-2">
            {question.completion!.bank.map((word) => (
              <li key={word}>
                <button
                  type="button"
                  className={chipClass(used.has(word))}
                  aria-label={t('useWord', { word })}
                  onClick={() => onChange(fillFromBank(question, draft, word))}
                >
                  {used.has(word) && <Check aria-hidden className="size-4" />}
                  <span lang={language}>{word}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function MatchRow({
  item,
  question,
  draft,
  onChange
}: {
  item: NonNullable<Question['left']>[number]
  question: Question
  draft: Draft
  onChange: (draft: Draft) => void
}) {
  const { t } = useTranslation(COMPREHENSION_MODULE_ID)
  const id = useId()
  return (
    <div className="grid items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface-raised p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4">
      <label htmlFor={id} className="font-read text-[19px] font-semibold" lang={item.lang}>
        {item.text}
      </label>
      <select
        id={id}
        aria-label={t('matchFor', { word: item.text })}
        value={draft.pairs?.[item.id] ?? ''}
        onChange={(event) => onChange({ ...draft, pairs: { ...draft.pairs, [item.id]: event.target.value } })}
        className="min-h-11 w-full min-w-0 rounded-full border border-border-control bg-surface px-4 text-[16px]"
      >
        <option value="">{t('choose')}</option>
        {(question.right ?? []).map((option) => (
          <option key={option.id} value={option.id} lang={option.lang}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  )
}

function ShortAnswer({ draft, onChange }: { draft: Draft; onChange: (draft: Draft) => void }) {
  const { t } = useTranslation(COMPREHENSION_MODULE_ID)
  const id = useId()
  const hint = useId()
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-semibold">
        {t('answerLabel')}
      </label>
      <textarea
        id={id}
        aria-describedby={hint}
        value={draft.text ?? ''}
        maxLength={2000}
        rows={4}
        onChange={(event) => onChange({ ...draft, text: event.target.value })}
        className="rounded-[var(--radius-md)] border border-border-control bg-surface-raised px-4 py-3 text-[17px]"
      />
      <p id={hint} className="text-secondary text-ink-muted">
        {t('answerHint')}
      </p>
    </div>
  )
}

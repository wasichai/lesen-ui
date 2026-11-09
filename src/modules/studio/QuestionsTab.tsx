import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buttonClass } from '../../shared/ui'
import { QUESTION_TYPES, type Item, type Question, type QuestionType, type SentenceRef } from './contract'
import { fieldClass } from './DetailsTab'
import type { Edited } from './DraftPage'
import { isChoice, move, newQuestion, nextItemId, splitList } from './draftModel'
import { STUDIO_MODULE_ID } from './i18n'

interface Context {
  sentences: SentenceRef[]
  into: string[]
  language: string
}

export function QuestionsTab({ edited, onChange, sentences, into, language }: { edited: Edited; onChange: (next: Edited) => void } & Context) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const [type, setType] = useState<QuestionType>('MULTIPLE_CHOICE')
  const typeId = useId()
  const questions = edited.questions
  const set = (next: Question[]) => onChange({ ...edited, questions: next })
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-ink-muted">{t('questions.lead')}</p>
      {questions.length === 0 && <p className="text-ink-muted">{t('questions.none')}</p>}
      <ol className="flex flex-col gap-5">
        {questions.map((question, i) => (
          <li key={question.id}>
            <QuestionEditor
              question={question}
              context={{ sentences, into, language }}
              onChange={(q) => set(questions.map((x, j) => (j === i ? q : x)))}
              onRemove={() => set(questions.filter((_, j) => j !== i))}
              onMove={(delta) => set(move(questions, i, delta))}
              first={i === 0}
              last={i === questions.length - 1}
            />
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-dashed border-border-control p-4">
        <label htmlFor={typeId} className="flex min-w-0 flex-col gap-1.5">
          <span className="text-label">{t('questions.typeField')}</span>
          <select id={typeId} className={fieldClass} value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
            {QUESTION_TYPES.map((x) => (
              <option key={x} value={x}>
                {t(`questions.type.${x}`)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={buttonClass('primary')} onClick={() => set([...questions, newQuestion(type, questions, sentences[0])])}>
          <Plus aria-hidden className="size-4" />
          {t('questions.add')}
        </button>
      </div>
    </div>
  )
}

function Texts({
  label,
  value,
  languages,
  onChange,
  multiline = false
}: {
  label: (language: string) => string
  value: Record<string, string>
  languages: string[]
  onChange: (next: Record<string, string>) => void
  multiline?: boolean
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {languages.map((code) => (
        <label key={code} className="flex flex-col gap-1.5">
          <span className="text-secondary text-ink-muted">{label(code)}</span>
          {multiline ? (
            <textarea
              className={`${fieldClass} min-h-20`}
              lang={code}
              value={value[code] ?? ''}
              onChange={(e) => onChange({ ...value, [code]: e.target.value })}
            />
          ) : (
            <input className={fieldClass} lang={code} value={value[code] ?? ''} onChange={(e) => onChange({ ...value, [code]: e.target.value })} />
          )}
        </label>
      ))}
    </div>
  )
}

const asTexts = (text: Item['text']): Record<string, string> => (typeof text === 'string' ? {} : text)

function QuestionEditor({
  question,
  context,
  onChange,
  onRemove,
  onMove,
  first,
  last
}: {
  question: Question
  context: Context
  onChange: (q: Question) => void
  onRemove: () => void
  onMove: (delta: number) => void
  first: boolean
  last: boolean
}) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const languageName = (code: string) => t(`language.${code}`, { defaultValue: code })
  const set = (change: Partial<Question>) => onChange({ ...question, ...change })
  const setSpec = (change: Record<string, unknown>) => set({ spec: { ...question.spec, ...change } })
  const id = question.id
  return (
    <section
      aria-label={t('questions.question', { id })}
      className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-surface-raised p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-read text-h4">
          {t('questions.question', { id })} · {t(`questions.type.${question.type}`)}
        </h2>
        <button type="button" className={buttonClass('ghost', 'icon')} disabled={first} onClick={() => onMove(-1)} aria-label={t('questions.up', { id })}>
          <ArrowUp aria-hidden className="size-4" />
        </button>
        <button type="button" className={buttonClass('ghost', 'icon')} disabled={last} onClick={() => onMove(1)} aria-label={t('questions.down', { id })}>
          <ArrowDown aria-hidden className="size-4" />
        </button>
        <button type="button" className={buttonClass('ghost', 'icon')} onClick={onRemove} aria-label={t('questions.remove', { id })}>
          <Trash2 aria-hidden className="size-4" />
        </button>
      </div>
      <Texts
        label={(code) => t('questions.prompt', { language: languageName(code) })}
        value={question.prompt}
        languages={context.into}
        onChange={(prompt) => set({ prompt })}
      />
      <fieldset>
        <legend className="mb-2 text-label">{t('questions.refs')}</legend>
        <div className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-[var(--radius-md)] border border-border p-2">
          {context.sentences.map((sentence) => (
            <label key={sentence.id} className="flex min-h-11 items-start gap-3 rounded px-1 py-2 hover:bg-surface-muted">
              <input
                type="checkbox"
                className="mt-1 size-5 shrink-0 accent-[var(--brand)]"
                checked={question.refs.includes(sentence.id)}
                onChange={(e) => set({ refs: e.target.checked ? [...question.refs, sentence.id] : question.refs.filter((r) => r !== sentence.id) })}
              />
              <span className="min-w-0">
                <span className="mr-2 text-secondary font-semibold text-ink-muted">{sentence.id}</span>
                <span lang={context.language}>{sentence.text}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <TypeSpec question={question} context={context} setSpec={setSpec} />
      <Texts
        label={(code) => t('questions.explanation', { language: languageName(code) })}
        value={question.explanation}
        languages={context.into}
        onChange={(explanation) => set({ explanation })}
        multiline
      />
      <label className="flex max-w-xs flex-col gap-1.5">
        <span className="text-label">{t('questions.difficulty')}</span>
        <select className={fieldClass} value={question.difficulty} onChange={(e) => set({ difficulty: Number(e.target.value) })}>
          {[1, 2, 3].map((d) => (
            <option key={d} value={d}>
              {t(`questions.difficultyLevel.${d}`)}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}

// lo propio de cada tipo de pregunta
function TypeSpec({ question, context, setSpec }: { question: Question; context: Context; setSpec: (change: Record<string, unknown>) => void }) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const languageName = (code: string) => t(`language.${code}`, { defaultValue: code })
  const spec = question.spec
  const id = question.id
  if (isChoice(question.type)) {
    const options = (spec.options as Item[] | undefined) ?? []
    const correct = (spec.correct as string[] | undefined) ?? []
    const words = context.sentences.filter((s) => question.refs.includes(s.id)).flatMap((s) => s.words)
    return (
      <div className="flex flex-col gap-4">
        {question.type === 'VOCABULARY_IN_CONTEXT' && (
          <label className="flex max-w-md flex-col gap-1.5">
            <span className="text-label">{t('questions.token')}</span>
            {words.length === 0 ? (
              <span className="text-secondary text-ink-muted">{t('questions.pickRef')}</span>
            ) : (
              <select className={fieldClass} lang={context.language} value={(spec.token as string) ?? ''} onChange={(e) => setSpec({ token: e.target.value })}>
                <option value="" />
                {words.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.text} ({w.id})
                  </option>
                ))}
              </select>
            )}
          </label>
        )}
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-label">{t('questions.options')}</legend>
          {options.map((option, i) => (
            <div key={option.id} className="flex flex-wrap items-start gap-3 rounded-[var(--radius-md)] border border-border p-3">
              <label className="flex min-h-11 items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  className="size-5 accent-[var(--brand)]"
                  checked={correct.includes(option.id)}
                  onChange={(e) => setSpec({ correct: e.target.checked ? [...correct, option.id] : correct.filter((c) => c !== option.id) })}
                />
                {option.id} · {t('questions.correct')}
              </label>
              <div className="min-w-0 flex-1 basis-64">
                <Texts
                  label={(code) => t('questions.option', { id: option.id, language: languageName(code) })}
                  value={asTexts(option.text)}
                  languages={context.into}
                  onChange={(text) => setSpec({ options: options.map((o, j) => (j === i ? { ...o, text } : o)) })}
                />
              </div>
              <button
                type="button"
                className={buttonClass('ghost', 'icon')}
                onClick={() => setSpec({ options: options.filter((_, j) => j !== i), correct: correct.filter((c) => c !== option.id) })}
                aria-label={t('questions.removeOption', { id: option.id })}
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className={buttonClass('secondary', 'sm', 'self-start')}
            onClick={() => setSpec({ options: [...options, { id: nextItemId(options), text: {} }] })}
          >
            <Plus aria-hidden className="size-4" />
            {t('questions.addOption')}
          </button>
        </fieldset>
      </div>
    )
  }
  if (question.type === 'TRUE_FALSE') {
    return (
      <fieldset className="flex flex-wrap items-center gap-4">
        <legend className="mb-2 text-label">{t('questions.trueFalse')}</legend>
        {[true, false].map((value) => (
          <label key={String(value)} className="flex min-h-11 items-center gap-2">
            <input
              type="radio"
              name={`tf-${id}`}
              className="size-5 accent-[var(--brand)]"
              checked={spec.correct === value}
              onChange={() => setSpec({ correct: value })}
            />
            {value ? t('questions.true') : t('questions.false')}
          </label>
        ))}
      </fieldset>
    )
  }
  if (question.type === 'COMPLETION') {
    const sentence = context.sentences.find((s) => s.id === spec.sentence)
    const blanks = (spec.blanks as string[] | undefined) ?? []
    return (
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-label">{t('questions.completionSentence')}</span>
          <select
            className={fieldClass}
            lang={context.language}
            value={(spec.sentence as string) ?? ''}
            onChange={(e) => setSpec({ sentence: e.target.value, blanks: [] })}
          >
            <option value="" />
            {context.sentences.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} · {s.text}
              </option>
            ))}
          </select>
        </label>
        {sentence && (
          <fieldset>
            <legend className="mb-2 text-label">{t('questions.blanks')}</legend>
            <div className="flex flex-wrap gap-2" lang={context.language}>
              {sentence.words.map((w) => (
                <label key={w.id} className="flex min-h-11 items-center gap-2 rounded-full border border-border px-3">
                  <input
                    type="checkbox"
                    className="size-5 accent-[var(--brand)]"
                    checked={blanks.includes(w.id)}
                    onChange={(e) => setSpec({ blanks: e.target.checked ? [...blanks, w.id] : blanks.filter((b) => b !== w.id) })}
                  />
                  {w.text}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="text-label">{t('questions.bank')}</span>
          <input
            className={fieldClass}
            lang={context.language}
            value={((spec.bank as string[] | undefined) ?? []).join(', ')}
            onChange={(e) => setSpec({ bank: splitList(e.target.value) })}
          />
        </label>
      </div>
    )
  }
  if (question.type === 'MATCHING') {
    const left = (spec.left as Item[] | undefined) ?? []
    const right = (spec.right as Item[] | undefined) ?? []
    const pairs = (spec.pairs as Record<string, string> | undefined) ?? {}
    const first = context.into[0] ?? 'es'
    return (
      <div className="flex flex-col gap-3">
        <p className="text-label">
          {t('questions.left')} ↔ {t('questions.right', { language: context.into.map(languageName).join(', ') })}
        </p>
        {left.map((item, i) => {
          const partner = right.find((r) => r.id === pairs[item.id])
          return (
            <div key={item.id} className="grid gap-3 rounded-[var(--radius-md)] border border-border p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]">
              <input
                className={fieldClass}
                lang={context.language}
                aria-label={t('questions.left')}
                value={typeof item.text === 'string' ? item.text : ''}
                onChange={(e) => setSpec({ left: left.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })}
              />
              <Texts
                label={(code) => t('questions.right', { language: languageName(code) })}
                value={asTexts(partner?.text ?? {})}
                languages={context.into}
                onChange={(text) => {
                  const rightId = partner?.id ?? nextItemId(right)
                  const nextRight = partner ? right.map((r) => (r.id === rightId ? { ...r, text } : r)) : [...right, { id: rightId, text }]
                  setSpec({ right: nextRight, pairs: { ...pairs, [item.id]: rightId } })
                }}
              />
              <button
                type="button"
                className={buttonClass('ghost', 'icon')}
                onClick={() => {
                  const { [item.id]: _removed, ...rest } = pairs
                  void _removed
                  setSpec({ left: left.filter((_, j) => j !== i), right: right.filter((r) => r.id !== pairs[item.id]), pairs: rest })
                }}
                aria-label={t('questions.removePair', { id: item.id })}
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          )
        })}
        <button
          type="button"
          className={buttonClass('secondary', 'sm', 'self-start')}
          onClick={() => {
            const leftId = nextItemId(left, 'number')
            const rightId = nextItemId(right)
            setSpec({
              left: [...left, { id: leftId, text: '' }],
              right: [...right, { id: rightId, text: { [first]: '' } }],
              pairs: { ...pairs, [leftId]: rightId }
            })
          }}
        >
          <Plus aria-hidden className="size-4" />
          {t('questions.addPair')}
        </button>
      </div>
    )
  }
  if (question.type === 'ORDERING') {
    const items = (spec.items as Item[] | undefined) ?? []
    return (
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-label">{t('questions.items', { language: context.into.map(languageName).join(', ') })}</legend>
        {items.map((item, i) => (
          <div key={item.id} className="flex flex-wrap items-start gap-2 rounded-[var(--radius-md)] border border-border p-3">
            <span className="grid min-h-11 w-8 place-items-center font-semibold tabular-nums">{i + 1}</span>
            <div className="min-w-0 flex-1 basis-64">
              <Texts
                label={(code) => t('questions.option', { id: item.id, language: languageName(code) })}
                value={asTexts(item.text)}
                languages={context.into}
                onChange={(text) => setSpec({ items: items.map((x, j) => (j === i ? { ...x, text } : x)) })}
              />
            </div>
            <button
              type="button"
              className={buttonClass('ghost', 'icon')}
              disabled={i === 0}
              onClick={() => setSpec({ items: move(items, i, -1) })}
              aria-label={t('questions.itemUp', { id: item.id })}
            >
              <ArrowUp aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              className={buttonClass('ghost', 'icon')}
              disabled={i === items.length - 1}
              onClick={() => setSpec({ items: move(items, i, 1) })}
              aria-label={t('questions.itemDown', { id: item.id })}
            >
              <ArrowDown aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              className={buttonClass('ghost', 'icon')}
              onClick={() => setSpec({ items: items.filter((_, j) => j !== i) })}
              aria-label={t('questions.removeItem', { id: item.id })}
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className={buttonClass('secondary', 'sm', 'self-start')}
          onClick={() => setSpec({ items: [...items, { id: nextItemId(items), text: {} }] })}
        >
          <Plus aria-hidden className="size-4" />
          {t('questions.addItem')}
        </button>
      </fieldset>
    )
  }
  // respuesta breve
  return (
    <div className="flex flex-col gap-4">
      <Texts
        label={(code) => t('questions.model', { language: languageName(code) })}
        value={(spec.model as Record<string, string>) ?? {}}
        languages={context.into}
        onChange={(model) => setSpec({ model })}
        multiline
      />
      <Texts
        label={(code) => t('questions.rubric', { language: languageName(code) })}
        value={(spec.rubric as Record<string, string>) ?? {}}
        languages={context.into}
        onChange={(rubric) => setSpec({ rubric })}
        multiline
      />
    </div>
  )
}

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { buttonClass } from '../../shared/ui'
import { fieldClass } from './DetailsTab'
import type { Edited } from './DraftPage'
import { addParagraph, addSentence, moveParagraph, removeParagraph, removeSentence, sentenceId, updateParagraph, updateSentence } from './draftModel'
import { STUDIO_MODULE_ID } from './i18n'

// el texto, oración por oración, con la traducción de cada oración y de cada párrafo en los idiomas de interfaz
export function TextTab({ edited, onChange, language, into }: { edited: Edited; onChange: (next: Edited) => void; language: string; into: string[] }) {
  const { t } = useTranslation(STUDIO_MODULE_ID)
  const doc = edited.document
  const set = (next: typeof doc) => onChange({ ...edited, document: next })
  const languageName = (code: string) => t(`language.${code}`, { defaultValue: code })
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-ink-muted">{t('text.lead')}</p>
      <ol className="flex flex-col gap-6">
        {doc.paragraphs.map((paragraph, p) => (
          <li key={p} className="rounded-[var(--radius-card)] border border-border bg-surface-raised p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="mr-auto font-read text-h4">{t('text.paragraph', { n: p + 1 })}</h2>
              <button
                type="button"
                className={buttonClass('ghost', 'icon')}
                disabled={p === 0}
                onClick={() => set(moveParagraph(doc, p, -1))}
                aria-label={t('text.up', { n: p + 1 })}
              >
                <ArrowUp aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                className={buttonClass('ghost', 'icon')}
                disabled={p === doc.paragraphs.length - 1}
                onClick={() => set(moveParagraph(doc, p, 1))}
                aria-label={t('text.down', { n: p + 1 })}
              >
                <ArrowDown aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                className={buttonClass('ghost', 'icon')}
                onClick={() => set(removeParagraph(doc, p))}
                aria-label={t('text.removeParagraph', { n: p + 1 })}
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            </div>
            <ol className="flex flex-col gap-4">
              {paragraph.sentences.map((sentence, s) => {
                const id = sentenceId(p, s)
                return (
                  <li key={s} className="grid gap-3 border-l-2 border-border pl-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span id={`sentence-${id}`} className="text-secondary font-semibold">
                          {t('text.sentence', { id })}
                        </span>
                        <button
                          type="button"
                          className={buttonClass('ghost', 'icon', '-my-2')}
                          onClick={() => set(removeSentence(doc, p, s))}
                          aria-label={t('text.removeSentence', { id })}
                        >
                          <Trash2 aria-hidden className="size-4" />
                        </button>
                      </div>
                      <textarea
                        aria-labelledby={`sentence-${id}`}
                        className={`${fieldClass} min-h-20 font-read text-[18px]`}
                        lang={language}
                        value={sentence.text}
                        maxLength={4000}
                        onChange={(e) => set(updateSentence(doc, p, s, { text: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      {into.map((code) => (
                        <label key={code} className="flex flex-col gap-1.5">
                          <span className="text-secondary text-ink-muted">{t('text.translation', { language: languageName(code) })}</span>
                          <textarea
                            className={`${fieldClass} min-h-11`}
                            lang={code}
                            rows={2}
                            value={sentence.translations[code] ?? ''}
                            maxLength={4000}
                            onChange={(e) => set(updateSentence(doc, p, s, { translations: { ...sentence.translations, [code]: e.target.value } }))}
                          />
                        </label>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ol>
            <button type="button" className={buttonClass('secondary', 'sm', 'mt-4')} onClick={() => set(addSentence(doc, p, paragraph.sentences.length - 1))}>
              <Plus aria-hidden className="size-4" />
              {t('text.addSentence')}
            </button>
            <div className="mt-5 grid gap-3 border-t border-border pt-4 md:grid-cols-2">
              {into.map((code) => (
                <label key={code} className="flex flex-col gap-1.5">
                  <span className="text-secondary text-ink-muted">{t('text.paragraphTranslation', { language: languageName(code) })}</span>
                  <textarea
                    className={`${fieldClass} min-h-20`}
                    lang={code}
                    value={paragraph.translations[code] ?? ''}
                    maxLength={4000}
                    onChange={(e) => set(updateParagraph(doc, p, { translations: { ...paragraph.translations, [code]: e.target.value } }))}
                  />
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className={buttonClass('secondary', 'md', 'self-start')} onClick={() => set(addParagraph(doc, doc.paragraphs.length - 1))}>
        <Plus aria-hidden className="size-4" />
        {t('text.addParagraph')}
      </button>
    </div>
  )
}

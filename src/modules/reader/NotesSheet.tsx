import { ArrowDownToLine, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { useDeleteNote, useNotes } from './api'
import { READER_MODULE_ID } from './i18n'

export function NotesSheet({ slug, language, onGo }: { slug: string; language: string; onGo: (sentenceRef: string) => void }) {
  const { t } = useTranslation(READER_MODULE_ID)
  const notes = useNotes(slug)
  const remove = useDeleteNote(slug)
  if (!notes.data) return <Skeleton className="mt-6 h-24" />
  if (notes.data.length === 0) return <p className="mt-6 text-ink-muted">{t('notes.empty')}</p>
  return (
    <ul className="mt-6 flex flex-col gap-4">
      {notes.data.map((note) => (
        <li key={note.id} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <blockquote className="font-read text-[17px] leading-relaxed" lang={language}>
            {note.quote}
          </blockquote>
          {note.note && <p className="mt-2 text-secondary text-ink-muted">{note.note}</p>}
          <div className="mt-3 flex gap-2">
            <button type="button" className={buttonClass('secondary', 'sm')} onClick={() => onGo(note.sentenceRef)}>
              <ArrowDownToLine aria-hidden className="size-4" />
              {t('notes.go')}
            </button>
            <button type="button" className={buttonClass('ghost', 'sm')} onClick={() => remove.mutate(note.id)} disabled={remove.isPending}>
              <Trash2 aria-hidden className="size-4" />
              {t('notes.remove')}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

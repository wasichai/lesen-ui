import { ApiError } from '@wasichai/core'
import { Check, ListPlus } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LIST_NAME_MAX, useCreateList, useListReading, useLists } from '../../shared/lists'
import { Sheet } from '../../shared/Sheet'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { useIsWide } from '../../shared/useMediaQuery'
import { DISCOVER_MODULE_ID } from './i18n'

// añadir o quitar esta lectura de las listas propias, o crear una lista con ella dentro
export function ListsButton({ slug }: { slug: string }) {
  const { t } = useTranslation(DISCOVER_MODULE_ID)
  const [open, setOpen] = useState(false)
  const wide = useIsWide()
  const lists = useLists(slug)
  const inLists = lists.data?.filter((l) => l.contains).length ?? 0
  return (
    <>
      <button type="button" className={buttonClass('secondary')} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <ListPlus aria-hidden className="size-4" />
        {inLists > 0 ? t('detail.listsIn', { count: inLists }) : t('detail.lists')}
      </button>
      <Sheet open={open} onOpenChange={setOpen} title={t('detail.listsTitle')} side={wide ? 'right' : 'bottom'}>
        <ListsChoice slug={slug} />
      </Sheet>
    </>
  )
}

function ListsChoice({ slug }: { slug: string }) {
  const { t } = useTranslation(DISCOVER_MODULE_ID)
  const lists = useLists(slug)
  const toggle = useListReading()
  const create = useCreateList()
  const [name, setName] = useState('')
  const id = useId()
  const failed = toggle.error ?? create.error
  return (
    <div className="mt-4 flex flex-col gap-5">
      {!lists.data ? (
        <Skeleton className="h-24" />
      ) : lists.data.length === 0 ? (
        <p className="text-ink-muted">{t('detail.listsEmpty')}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {lists.data.map((list) => (
            <li key={list.id}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 hover:bg-surface-muted">
                <input
                  type="checkbox"
                  className="size-5 accent-[var(--brand)]"
                  checked={list.contains === true}
                  disabled={toggle.isPending}
                  onChange={(event) => toggle.mutate({ list: list.id, slug, on: event.target.checked })}
                />
                <span className="min-w-0 flex-1 truncate">{list.name}</span>
                {list.contains && <Check aria-hidden className="size-4 text-brand" />}
              </label>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex flex-col gap-2 border-t border-border pt-5"
        onSubmit={(event) => {
          event.preventDefault()
          const trimmed = name.trim()
          if (!trimmed) return
          create.mutate(trimmed, {
            onSuccess: (list) => {
              setName('')
              toggle.mutate({ list: list.id, slug, on: true })
            }
          })
        }}
      >
        <label htmlFor={id} className="text-label">
          {t('detail.listsNew')}
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id={id}
            value={name}
            maxLength={LIST_NAME_MAX}
            onChange={(event) => setName(event.target.value)}
            className="min-h-11 min-w-0 flex-1 basis-40 rounded-[var(--radius-md)] border border-border-control bg-surface-raised px-3 text-[16px]"
          />
          <button type="submit" className={buttonClass('primary')} disabled={!name.trim() || create.isPending}>
            {t('detail.listsCreate')}
          </button>
        </div>
      </form>
      <p aria-live="polite" className="text-secondary text-danger empty:hidden">
        {failed ? (failed instanceof ApiError && failed.status === 409 ? t('detail.listsDuplicate') : t('detail.listsError')) : ''}
      </p>
    </div>
  )
}

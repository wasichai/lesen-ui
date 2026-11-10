import { ApiError, useWasichaiLinks } from '@wasichai/core'
import { ArrowLeft, BookOpen, Pencil, Trash2, X } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import { EmptyState } from '../../shared/EmptyState'
import { LearnerLayout } from '../../shared/LearnerLayout'
import { LIST_NAME_MAX, useCreateList, useDeleteList, useList, useListReading, useRenameList } from '../../shared/lists'
import { ProblemState } from '../../shared/ProblemState'
import { ReadingTile } from '../../shared/ReadingTile'
import { ROUTES } from '../../shared/routes'
import { Skeleton } from '../../shared/Skeleton'
import { buttonClass } from '../../shared/ui'
import { usePageTitle } from '../../shared/useAppName'
import { LIBRARY_MODULE_ID } from './i18n'

const isConflict = (error: unknown) => error instanceof ApiError && error.status === 409

// el nombre de una lista, para crearla o cambiarlo: 1–80 caracteres, sin repetir otro de quien lee
function NameForm({
  initial = '',
  submit,
  pending,
  error,
  label,
  action,
  onCancel
}: {
  initial?: string
  submit: (name: string) => void
  pending: boolean
  error: unknown
  label: string
  action: string
  onCancel?: () => void
}) {
  const { t } = useTranslation(LIBRARY_MODULE_ID)
  const [name, setName] = useState(initial)
  const id = useId()
  const valid = name.trim().length > 0
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        if (valid) submit(name.trim())
      }}
    >
      <label htmlFor={id} className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
        <span className="text-label">{label}</span>
        <input
          id={id}
          value={name}
          maxLength={LIST_NAME_MAX}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('lists.placeholder')}
          className="min-h-11 rounded-[var(--radius-md)] border border-border-control bg-surface-raised px-3 text-[16px]"
        />
      </label>
      <button type="submit" className={buttonClass('primary')} disabled={!valid || pending}>
        {action}
      </button>
      {onCancel && (
        <button type="button" className={buttonClass('ghost')} onClick={onCancel}>
          {t('lists.cancel')}
        </button>
      )}
      <p aria-live="polite" className="basis-full text-secondary text-danger empty:hidden">
        {error ? (isConflict(error) ? t('lists.duplicate') : t('lists.error')) : ''}
      </p>
    </form>
  )
}

export function NewList() {
  const { t } = useTranslation(LIBRARY_MODULE_ID)
  const create = useCreateList()
  const [key, setKey] = useState(0)
  return (
    <NameForm
      key={key}
      label={t('lists.new')}
      action={t('lists.create')}
      pending={create.isPending}
      error={create.error}
      submit={(name) => create.mutate(name, { onSuccess: () => setKey((k) => k + 1) })}
    />
  )
}

export function ListPage() {
  return (
    <LearnerLayout>
      <List id={useParams().id ?? ''} />
    </LearnerLayout>
  )
}

function List({ id }: { id: string }) {
  const { t } = useTranslation(LIBRARY_MODULE_ID)
  const links = useWasichaiLinks()
  const navigate = useNavigate()
  const list = useList(id)
  const rename = useRenameList(id)
  const remove = useDeleteList(id)
  const toggle = useListReading()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  usePageTitle(list.data?.name ?? '')
  if (list.isError) return <ProblemState error={list.error} onRetry={() => list.refetch()} />
  if (!list.data) return <Skeleton className="h-64" />
  const data = list.data
  const back = `${links.to(ROUTES.library)}?tab=lists`
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to={back} className={buttonClass('ghost', 'sm', '-ml-3 mb-4')}>
          <ArrowLeft aria-hidden className="size-4" />
          {t('lists.back')}
        </Link>
        {editing ? (
          <NameForm
            initial={data.name}
            label={t('lists.rename')}
            action={t('lists.save')}
            pending={rename.isPending}
            error={rename.error}
            onCancel={() => setEditing(false)}
            submit={(name) => rename.mutate(name, { onSuccess: () => setEditing(false) })}
          />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="min-w-0 break-words font-display text-h1">{data.name}</h1>
            <button type="button" className={buttonClass('ghost', 'icon')} onClick={() => setEditing(true)} aria-label={t('lists.rename')}>
              <Pencil aria-hidden className="size-4" />
            </button>
          </div>
        )}
        <p className="mt-2 text-ink-muted">{t('lists.count', { count: data.readings.length })}</p>
      </div>
      {data.readings.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('lists.emptyList')}
          body={t('lists.emptyListBody')}
          action={
            <Link to={links.to(ROUTES.discover)} className={buttonClass('primary')}>
              {t('discover')}
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.readings.map((reading) => (
            <li key={reading.slug} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <ReadingTile reading={reading} variant="row" />
              </div>
              <button
                type="button"
                className={buttonClass('ghost', 'icon', 'shrink-0')}
                onClick={() => toggle.mutate({ list: id, slug: reading.slug, on: false })}
                aria-label={t('lists.removeReading', { title: reading.title })}
              >
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-border pt-6">
        {confirming ? (
          <div role="alert" className="flex flex-wrap items-center gap-3">
            <p className="basis-full">{t('lists.confirm', { name: data.name })}</p>
            <button
              type="button"
              className={buttonClass('primary')}
              disabled={remove.isPending}
              onClick={() => remove.mutate(undefined, { onSuccess: () => navigate(back, { replace: true }) })}
            >
              {t('lists.delete')}
            </button>
            <button type="button" className={buttonClass('ghost')} onClick={() => setConfirming(false)}>
              {t('lists.cancel')}
            </button>
          </div>
        ) : (
          <button type="button" className={buttonClass('secondary')} onClick={() => setConfirming(true)}>
            <Trash2 aria-hidden className="size-4" />
            {t('lists.delete')}
          </button>
        )}
      </div>
    </div>
  )
}

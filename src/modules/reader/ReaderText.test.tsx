import { renderWithProviders } from '@wasichai/testing'
import { fireEvent, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { appModule } from '../app/module'
import { readerModule } from './module'
import { indexContent } from './readerModel'
import { ReaderText, type WordEvents } from './ReaderText'
import { content } from './test/fixtures'

const index = indexContent(content)

function Text({ events, saved = new Set<string>() }: { events: WordEvents; saved?: Set<string> }) {
  const [current, setCurrent] = useState<string | null>(null)
  return (
    <ReaderText
      slug="der-alte-leuchtturm"
      version={1}
      language="de"
      paragraphs={content.paragraphs}
      index={index}
      currentWord={current}
      setCurrentWord={setCurrent}
      openWord={null}
      saved={saved}
      newWords={null}
      learnedWords={null}
      highlightSaved
      activeSentence={null}
      showParagraphTranslations={false}
      translationLanguage="es"
      events={events}
    />
  )
}

const events = () => ({ onOpen: vi.fn(), onHoverStart: vi.fn(), onHoverEnd: vi.fn() })
const word = (text: string) => screen.getByRole('button', { name: text })

describe('el texto de la lectura', () => {
  it('cada palabra es un botón y solo la primera entra en el orden de tabulación', () => {
    renderWithProviders(<Text events={events()} />, { modules: [appModule(), readerModule()] })
    expect(word('Mia')).toHaveAttribute('tabindex', '0')
    expect(word('verbringt')).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('group')).toHaveAttribute('lang', 'de')
  })

  it('las flechas recorren palabras y oraciones, e Intro abre la palabra', () => {
    const handlers = events()
    renderWithProviders(<Text events={handlers} />, { modules: [appModule(), readerModule()] })
    word('Mia').focus()
    fireEvent.keyDown(word('Mia'), { key: 'ArrowRight' })
    expect(word('verbringt')).toHaveFocus()
    expect(word('verbringt')).toHaveAttribute('tabindex', '0')
    fireEvent.keyDown(word('verbringt'), { key: 'ArrowDown' })
    expect(word('Er')).toHaveFocus()
    fireEvent.keyDown(word('Er'), { key: 'End' })
    expect(word('Ende')).toHaveFocus()
    fireEvent.click(word('Ende'))
    expect(handlers.onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'p2s1t1' }), word('Ende'))
  })

  it('marca las palabras guardadas', () => {
    renderWithProviders(<Text events={events()} saved={new Set(['de:verbringen'])} />, { modules: [appModule(), readerModule()] })
    expect(word('verbringt')).toHaveAttribute('data-saved', 'true')
    expect(word('Mia')).toHaveAttribute('data-saved', 'false')
  })
})

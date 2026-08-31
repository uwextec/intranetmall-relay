import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

type RequirementsExpandableProps = {
  storeName: string
  role: string
  text: string
}

export const RequirementsExpandable = ({ storeName, role, text }: RequirementsExpandableProps) => {
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const requirementsItems = useMemo(() => {
    const normalizedText = text
      .replace(/\r/g, '\n')
      .replace(/[•●▪]/g, '\n')
      .replace(/\s*;\s*/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim()

    const items = normalizedText
      .split('\n')
      .map((item) => item.replace(/^[-\s]+/, '').trim())
      .filter(Boolean)

    if (items.length > 0) {
      return items
    }

    return [text.trim()]
  }, [text])

  const previewText = useMemo(() => requirementsItems.join(' • '), [requirementsItems])

  useLayoutEffect(() => {
    const el = paragraphRef.current
    if (!el) {
      return
    }

    const measure = () => {
      if (!paragraphRef.current) {
        return
      }
      setHasOverflow(paragraphRef.current.scrollHeight > paragraphRef.current.clientHeight + 1)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [text])

  useEffect(() => {
    if (!isModalOpen) {
      return
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscapeKey)
    return () => window.removeEventListener('keydown', handleEscapeKey)
  }, [isModalOpen])

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleAnimateClose = () => {
    setIsModalVisible(false)
    window.setTimeout(() => {
      setIsModalOpen(false)
    }, 220)
  }

  const handleCloseModal = () => {
    handleAnimateClose()
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleCloseModal()
    }
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpenModal()
    }
  }

  useEffect(() => {
    if (!isModalOpen) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsModalVisible(true)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [isModalOpen])

  return (
    <div className="min-w-0">
      <p
        className="line-clamp-3 text-sm leading-5 tracking-[-0.02em] text-[var(--Color-Requirement-Value)]"
        ref={paragraphRef}
      >
        {previewText}
      </p>
      {hasOverflow ? (
        <button
          aria-expanded={isModalOpen}
          aria-haspopup="dialog"
          className="mt-3 inline-flex min-h-8 cursor-pointer items-center justify-center !rounded-[22px] border border-[#6c98c1] bg-transparent px-3 py-1.5 !text-[12px] font-semibold text-[#6c98c1] transition hover:bg-[#6c98c1]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c98c1]"
          onClick={handleOpenModal}
          onKeyDown={handleKeyDown}
          type="button"
        >
          Ver mais
        </button>
      ) : null}
      {isModalOpen ? (
        <div
          aria-hidden={!isModalOpen}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isModalVisible ? 'bg-black/50 opacity-100' : 'bg-black/0 opacity-0'}`}
          onClick={handleOverlayClick}
        >
          <div
            aria-labelledby="requirements-modal-title"
            aria-modal="true"
            className={`relative w-full max-w-[640px] rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ${isModalVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
            role="dialog"
          >
            <button
              aria-label="Fechar modal de requisitos"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#6c98c1] bg-transparent text-[#6c98c1] transition hover:bg-[#6c98c1]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c98c1]"
              onClick={handleCloseModal}
              type="button"
            >
              X
            </button>

            <h3
              className="pr-10 text-lg font-semibold leading-7 tracking-[-0.02em] text-[var(--Color-Base-02)]"
              id="requirements-modal-title"
            >
              Detalhes da vaga
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-6 text-[var(--Color-Requirement-Value)]">
              <p>
                <span className="font-semibold text-[var(--Color-Base-02)]">Nome da Loja: </span>
                <span>{storeName}</span>
              </p>
              <p>
                <span className="font-semibold text-[var(--Color-Base-02)]">Cargo: </span>
                <span>{role}</span>
              </p>
              <p>
                <span className="font-semibold text-[var(--Color-Base-02)]">Requisitos: </span>
              </p>
              <ul className="list-disc space-y-2 pl-5">
                {requirementsItems.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

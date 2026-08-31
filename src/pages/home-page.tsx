import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import tottemVagas from '../assets/tottem-vagas.webp'
import { PageShell } from '../components/layout/page-shell'
import { currentMall } from '../config/mall'
import { prefetchJobs } from '../features/jobs/service'
import { useDocumentTitle } from '../hooks/use-document-title'
import { getDominantColorFromImage } from '../lib/dominant-color-from-image'

const FALLBACK_BACKGROUND = '#e6e6e6'

type HomePageProps = {
  /** Quando true, renderiza entrada do totem (`/totem`) com link para `/totem/vagas`. */
  isTotem?: boolean
}

export const HomePage = ({ isTotem = false }: HomePageProps) => {
  useDocumentTitle(`${currentMall.name} | Trabalhe conosco`)
  const foregroundImageRef = useRef<HTMLImageElement | null>(null)
  const [backgroundColor, setBackgroundColor] = useState(FALLBACK_BACKGROUND)

  /** Pré-busca vagas em idle/timeouts — melhora navegação sem bloquear a home. */
  useEffect(() => {
    const runPrefetch = () => prefetchJobs()

    if (typeof window === 'undefined') {
      return
    }

    const timeoutId = window.setTimeout(runPrefetch, 120)

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(runPrefetch, { timeout: 1200 })
      return () => {
        window.clearTimeout(timeoutId)
        window.cancelIdleCallback(idleId)
      }
    }

    return () => window.clearTimeout(timeoutId)
  }, [])

  const applyBackgroundFromHeroImage = useCallback(() => {
    const img = foregroundImageRef.current
    if (!img) {
      return
    }
    setBackgroundColor(getDominantColorFromImage(img))
  }, [])

  /** A cor depende da imagem em primeiro plano; um único efeito evita registrar load duas vezes. */
  useEffect(() => {
    const img = foregroundImageRef.current
    if (!img) {
      return
    }

    const handleHeroReady = () => applyBackgroundFromHeroImage()

    if (img.complete) {
      handleHeroReady()
      return
    }

    img.addEventListener('load', handleHeroReady)

    return () => img.removeEventListener('load', handleHeroReady)
  }, [applyBackgroundFromHeroImage])

  const targetPath = isTotem ? '/totem/vagas' : '/vagas'
  const ctaAriaLabel = isTotem
    ? 'Conferir vagas disponíveis no totem'
    : 'Conferir vagas disponíveis'

  return (
    <PageShell isTotem={isTotem} showHeaderLogo={false} isFullBleed>
      <section
        className="fixed inset-0 overflow-hidden transition-colors duration-300"
        style={{ backgroundColor }}
      >
        {/* Fundo borrado: mesma arte, só como atmosfera — não deve competir com a peça principal. */}
        <div className="absolute inset-0" aria-hidden="true">
          <img
            alt=""
            className="h-full w-full scale-105 object-cover opacity-12 blur-lg"
            decoding="async"
            src={tottemVagas}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <Link
            aria-label={ctaAriaLabel}
            className="relative z-10 inline-block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3772FF] focus-visible:ring-inset"
            to={targetPath}
            onFocus={prefetchJobs}
            onMouseEnter={prefetchJobs}
            onPointerDown={prefetchJobs}
            onTouchStart={prefetchJobs}
          >
            <img
              alt="Trabalhe conosco"
              className="max-h-dvh w-auto max-w-[1200px] object-contain"
              decoding="async"
              ref={foregroundImageRef}
              src={tottemVagas}
            />
            <span className="sr-only">Conferir vagas</span>
          </Link>
        </div>
      </section>
    </PageShell>
  )
}

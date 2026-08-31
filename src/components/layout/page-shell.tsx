import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

import { PALLADIUM_LOGO_URL } from '../../config/branding'
import { currentMall } from '../../config/mall'
import { Container } from '../ui/container'
import { cn } from '../../lib/cn'

type PageShellProps = PropsWithChildren<{
  isTotem?: boolean
  /** Quando false, não renderiza o logo no topo (ex.: home com logo na própria seção). */
  showHeaderLogo?: boolean
  /** Quando true, remove container e espaçamentos para layout full-bleed. */
  isFullBleed?: boolean
}>

export const PageShell = ({
  children,
  isTotem = false,
  showHeaderLogo = true,
  isFullBleed = false,
}: PageShellProps) => {
  const homePath = isTotem ? '/totem' : '/'

  if (isFullBleed) {
    return (
      <main className="h-dvh w-screen overflow-hidden bg-(--Color-Background) text-(--Color-Base-02)">
        {children}
      </main>
    )
  }

  return (
    <main
      className={cn(
        'min-h-screen bg-(--Color-Background) py-6 text-(--Color-Base-02) sm:py-10',
        isTotem && 'min-h-screen w-full bg-(--Color-Background) py-8',
      )}
    >
      <Container size={isTotem ? 'totem' : 'default'}>
        <div
          className={cn(
            'overflow-hidden rounded-[2.75rem] bg-(--Color-Background)',
            isTotem && 'min-h-[calc(100vh-4rem)]',
          )}
        >
          {showHeaderLogo ? (
            <header className="flex justify-center px-6 pt-6 sm:px-10 sm:pt-8">
              <Link aria-label="Ir para a página inicial" to={homePath}>
                <img
                  alt={currentMall.logoAlt}
                  className={cn('h-auto w-[220px] sm:w-[260px]', isTotem && 'w-[320px]')}
                  src={PALLADIUM_LOGO_URL}
                />
              </Link>
            </header>
          ) : null}
          {children}
        </div>
      </Container>
    </main>
  )
}

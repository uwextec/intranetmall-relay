import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../lib/cn'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost'
    fullWidth?: boolean
  }
>

export const Button = ({
  children,
  className,
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-6 py-3 text-base font-semibold transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--Color-Primary)] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'bg-[#374248] text-white! shadow-[0_4px_47.4px_var(--Color-Shadow-Strong)] hover:-translate-y-0.5 hover:bg-[#2D363B]',
        variant === 'secondary' &&
          'border border-[var(--Color-Border-Default)] bg-white text-[var(--Color-Base-02)] hover:border-[var(--Color-Primary)]',
        variant === 'ghost' && 'bg-transparent text-[var(--Color-Base-02)] hover:bg-white/60',
        fullWidth && 'w-full',
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

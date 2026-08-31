import type { HTMLAttributes, PropsWithChildren } from 'react'

import { typography } from '../../design/tokens'
import { cn } from '../../lib/cn'

type TextProps = PropsWithChildren<
  HTMLAttributes<HTMLParagraphElement | HTMLHeadingElement | HTMLSpanElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'small' | 'span'
    variant?: keyof typeof typography
  }
>

export const Text = ({
  as = 'p',
  children,
  className,
  variant = 'p',
  ...props
}: TextProps) => {
  const Component = as

  return (
    <Component className={cn('text-[var(--Color-Base-02)]', typography[variant], className)} {...props}>
      {children}
    </Component>
  )
}

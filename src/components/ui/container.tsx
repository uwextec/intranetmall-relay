import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../lib/cn'

type ContainerProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    size?: 'default' | 'totem'
  }
>

export const Container = ({
  children,
  className,
  size = 'default',
  ...props
}: ContainerProps) => {
  return (
    <div
      className={cn(
        'mx-auto w-[min(100%-2rem,72rem)]',
        size === 'totem' && 'w-[min(100%-3rem,64rem)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

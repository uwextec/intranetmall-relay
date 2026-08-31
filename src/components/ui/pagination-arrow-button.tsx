import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type PaginationArrowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  direction: 'previous' | 'next'
}

const NextArrowIcon = () => (
  <svg aria-hidden="true" className="h-[17px] w-[25px]" fill="none" viewBox="0 0 25 17">
    <path
      clipRule="evenodd"
      d="M15.6927 16.418C16.3932 17.1221 17.4853 17.0746 18.132 16.3118L23.7089 9.73317C24.3193 9.01316 24.3193 7.90336 23.7089 7.18334L18.132 0.604571C17.4853 -0.158226 16.3932 -0.205797 15.6927 0.498314C14.9922 1.20242 14.9485 2.39159 15.5951 3.15438L18.4979 6.57862L1.72619 6.57862C0.772841 6.57862 -6.24419e-07 7.42015 -7.39445e-07 8.45824C-8.5447e-07 9.49633 0.772841 10.3379 1.72619 10.3379L18.4979 10.3379L15.5951 13.7619C14.9485 14.5247 14.9922 15.7139 15.6927 16.418Z"
      fill="#E4EDF6"
      fillRule="evenodd"
    />
  </svg>
)

const PreviousArrowIcon = () => (
  <svg aria-hidden="true" className="h-[17px] w-[25px]" fill="none" viewBox="0 0 25 17">
    <path
      clipRule="evenodd"
      d="M8.47392 16.418C7.7734 17.1221 6.68131 17.0746 6.03467 16.3118L0.457743 9.73317C-0.152633 9.01316 -0.152639 7.90336 0.45773 7.18334L6.03466 0.604571C6.68129 -0.158226 7.77338 -0.205797 8.47391 0.498314C9.17444 1.20242 9.21813 2.39159 8.57149 3.15438L5.66871 6.57862L22.4404 6.57862C23.3938 6.57862 24.1666 7.42015 24.1666 8.45824C24.1666 9.49633 23.3938 10.3379 22.4404 10.3379L5.66877 10.3379L8.57148 13.7619C9.21812 14.5247 9.17444 15.7139 8.47392 16.418Z"
      fill="#E4EDF6"
      fillRule="evenodd"
    />
  </svg>
)

export const PaginationArrowButton = ({
  direction,
  className,
  disabled,
  ...props
}: PaginationArrowButtonProps) => {
  return (
    <button
      className={cn(
        'flex size-[58px] shrink-0 cursor-pointer items-center justify-center rounded-[18px] bg-(--Color-Primary) text-white shadow-sm transition hover:bg-(--Color-Primary-Hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--Color-Primary) disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-(--Color-Primary)',
        className,
      )}
      disabled={disabled}
      type="button"
      {...props}
    >
      {direction === 'previous' ? <PreviousArrowIcon /> : <NextArrowIcon />}
    </button>
  )
}

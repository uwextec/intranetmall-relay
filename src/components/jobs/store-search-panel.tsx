import type { ChangeEvent, KeyboardEvent } from 'react'
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { cn } from '../../lib/cn'
import { Text } from '../ui/typography'

type StoreFilterTriggerProps = {
  isOpen: boolean
  selectedStore: string
  onToggle: () => void
  defaultLabel?: string
}

export const StoreFilterTrigger = ({
  isOpen,
  selectedStore,
  onToggle,
  defaultLabel = 'Filtrar por Loja',
}: StoreFilterTriggerProps) => {
  const triggerActive = isOpen || Boolean(selectedStore)

  const label = selectedStore ? selectedStore : defaultLabel

  return (
    <button
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className={cn(
        'flex h-[63px] w-full cursor-pointer items-center justify-center rounded-[22px] px-[22px] text-[15px] font-normal leading-[26px] tracking-[-0.02em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--Color-Base-01)]',
        triggerActive
          ? 'bg-[var(--Color-Base-01)] !text-white [color-scheme:light] [-webkit-text-fill-color:var(--Color-Surface)]'
          : 'bg-white text-[var(--Color-Text-Muted)] shadow-[0_1px_3px_var(--Color-Shadow-Light)]',
      )}
      type="button"
      onClick={onToggle}
    >
      <span className="inline-flex max-w-full min-w-0 items-center gap-[10px]">
        <span
          className={cn(
            'min-w-0 truncate',
            triggerActive && '!text-white [-webkit-text-fill-color:var(--Color-Surface)]',
          )}
        >
          {label}
        </span>
        <svg
          aria-hidden="true"
          className={cn('size-3 shrink-0', triggerActive ? 'text-white' : 'text-[var(--Color-Base-01)]')}
          fill="none"
          viewBox="0 0 10 6"
        >
          <path d="m1 1 4 4 4-4" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
    </button>
  )
}

type StoreAutocompletePanelProps = {
  defaultQuery: string
  stores: string[]
  selectedStore: string
  onSelectStore: (store: string) => void
  onClearStore: () => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  searchLabel?: string
  searchPlaceholder?: string
  suggestionsLabel?: string
  clearButtonLabel?: string
  emptyLabel?: string
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const MAX_INITIAL = 36
const MAX_FILTERED = 60

export const StoreAutocompletePanel = ({
  defaultQuery,
  stores,
  selectedStore,
  onSelectStore,
  onClearStore,
  onKeyDown,
  searchLabel = 'Buscar loja',
  searchPlaceholder = 'Buscar Loja',
  suggestionsLabel = 'Lojas sugeridas',
  clearButtonLabel = 'Limpar loja',
  emptyLabel = 'Nenhuma loja encontrada.',
}: StoreAutocompletePanelProps) => {
  const [storeQuery, setStoreQuery] = useState(defaultQuery)
  const [isContentVisible, setIsContentVisible] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const suggestionsListId = useId()

  const sortedStores = useMemo(
    () => Array.from(new Set(stores)).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [stores],
  )

  const suggestions = useMemo(() => {
    const query = storeQuery.trim()
    if (!query) {
      return sortedStores.slice(0, MAX_INITIAL)
    }

    const needle = normalize(query)
    return sortedStores.filter((name) => normalize(name).includes(needle)).slice(0, MAX_FILTERED)
  }, [sortedStores, storeQuery])

  useLayoutEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setIsContentVisible(false)
    const frameId = window.requestAnimationFrame(() => {
      setIsContentVisible(true)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [stores])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStoreQuery(event.target.value)
  }

  const handleSelectChip = (store: string) => {
    onSelectStore(store)
  }

  return (
    <div className="w-full space-y-[14px]" onKeyDown={onKeyDown}>
      <div className="relative w-full">
        <label className="sr-only" htmlFor={inputId}>
          {searchLabel}
        </label>
        <input
          aria-autocomplete="list"
          aria-controls={suggestionsListId}
          aria-expanded
          className="h-[63px] w-full rounded-[22px] border-0 bg-white py-0 pl-[22px] pr-14 text-[15px] font-normal leading-[26px] tracking-[-0.02em] text-[var(--Color-Base-02)] shadow-[inset_0_0_0_1px_var(--Color-Primary-Alpha-25)] outline-none placeholder:text-[var(--Color-Text-Muted)] focus-visible:shadow-[inset_0_0_0_2px_var(--Color-Base-01)]"
          id={inputId}
          onChange={handleInputChange}
          placeholder={searchPlaceholder}
          ref={inputRef}
          role="combobox"
          type="search"
          value={storeQuery}
        />
        <span className="pointer-events-none absolute right-[22px] top-1/2 -translate-y-1/2">
          <svg
            aria-hidden="true"
            className="size-6 shrink-0"
            fill="none"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.21451 10.9285C2.43598 9.76068 2.43598 8.23932 3.21451 7.07153C4.23294 5.54388 5.54381 4.23302 7.07146 3.21458C8.23925 2.43605 9.76061 2.43605 10.9284 3.21458C12.4561 4.23302 13.7669 5.54388 14.7853 7.07153C15.5639 8.23932 15.5639 9.76068 14.7853 10.9285C13.7669 12.4561 12.4561 13.767 10.9284 14.7854C9.76061 15.5639 8.23925 15.5639 7.07146 14.7854C5.54381 13.767 4.23294 12.4561 3.21451 10.9285Z"
              stroke="var(--Color-Base-01)"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M13 13L20 20"
              stroke="var(--Color-Base-01)"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </span>
      </div>

      <div
        aria-label={suggestionsLabel}
        className={cn(
          'max-h-[min(589px,52vh)] w-full overflow-y-auto rounded-[22px] border border-[var(--Color-Primary-Alpha-50)] bg-[var(--Color-Primary-Alpha-05)] p-[22px] transition-all duration-200 ease-out',
          isContentVisible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
        )}
        id={suggestionsListId}
        role="listbox"
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedStore ? (
            <button
              className="rounded-[12px] border border-[var(--Color-Base-01)] bg-white px-3 py-2 text-[13px] font-medium text-[var(--Color-Base-01)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--Color-Base-01)]"
              onClick={onClearStore}
              type="button"
            >
              {clearButtonLabel}
            </button>
          ) : null}
        </div>

        {suggestions.length === 0 ? (
          <Text as="p" variant="bodyMd" className="text-center text-[var(--Color-Text-Muted)]">
            {emptyLabel}
          </Text>
        ) : (
          <div className="flex flex-wrap gap-3">
            {suggestions.map((name) => {
              const isSelected = selectedStore === name
              return (
                <button
                  aria-selected={isSelected}
                  className={cn(
                    'min-h-[43px] max-w-full cursor-pointer rounded-[12px] border border-[var(--Color-Base-01)] px-3 py-2 text-left text-[15px] leading-snug tracking-[-0.02em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--Color-Base-01)]',
                    isSelected
                      ? 'bg-[var(--Color-Base-01)] text-white'
                      : 'bg-white text-[var(--Color-Heading)] hover:bg-[var(--Color-Store-Hover)]',
                  )}
                  key={name}
                  onClick={() => handleSelectChip(name)}
                  role="option"
                  type="button"
                >
                  <span className="break-words">{name}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

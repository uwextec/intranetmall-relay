import type { KeyboardEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

import type { JobFilters } from '../../features/jobs/types'
import { Button } from '../ui/button'
import { Text } from '../ui/typography'
import { StoreAutocompletePanel, StoreFilterTrigger } from './store-search-panel'

type JobFiltersProps = {
  filters: JobFilters
  roles: string[]
  stores: string[]
  totalJobs: number
  onChange: (nextFilters: JobFilters) => void
  onResetFilters: () => void
}

export const JobFiltersBar = ({
  filters,
  roles,
  stores,
  totalJobs,
  onChange,
  onResetFilters,
}: JobFiltersProps) => {
  const [rolePanelOpen, setRolePanelOpen] = useState(false)
  const [rolePanelSession, setRolePanelSession] = useState(0)
  const [storePanelOpen, setStorePanelOpen] = useState(false)
  const [storePanelSession, setStorePanelSession] = useState(0)
  const roleTriggerRef = useRef<HTMLDivElement>(null)
  const rolePanelRef = useRef<HTMLDivElement>(null)
  const storeTriggerRef = useRef<HTMLDivElement>(null)
  const storePanelRef = useRef<HTMLDivElement>(null)

  const handleRoleSelect = (role: string) => {
    onChange({
      ...filters,
      role,
    })
    setRolePanelOpen(false)
  }

  const handleClearRole = () => {
    onChange({
      ...filters,
      role: '',
    })
    setRolePanelSession((count) => count + 1)
  }

  const handleToggleRolePanel = () => {
    setRolePanelOpen((open) => {
      if (!open) {
        setRolePanelSession((count) => count + 1)
      }
      return !open
    })
    setStorePanelOpen(false)
  }

  const handleStoreSelect = (store: string) => {
    onChange({
      ...filters,
      store,
    })
    setStorePanelOpen(false)
  }

  const handleClearStore = () => {
    onChange({
      ...filters,
      store: '',
    })
    setStorePanelSession((count) => count + 1)
  }

  const handleToggleStorePanel = () => {
    setStorePanelOpen((open) => {
      if (!open) {
        setStorePanelSession((count) => count + 1)
      }
      return !open
    })
    setRolePanelOpen(false)
  }

  const handlePanelsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setRolePanelOpen(false)
      setStorePanelOpen(false)
    }
  }

  useEffect(() => {
    if (!storePanelOpen && !rolePanelOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        roleTriggerRef.current?.contains(target) ||
        rolePanelRef.current?.contains(target) ||
        storeTriggerRef.current?.contains(target) ||
        storePanelRef.current?.contains(target)
      ) {
        return
      }
      setRolePanelOpen(false)
      setStorePanelOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [rolePanelOpen, storePanelOpen])

  const hasActiveFilters = Boolean(filters.role || filters.store)

  const handleClearAllFilters = () => {
    setRolePanelOpen(false)
    setStorePanelOpen(false)
    setRolePanelSession((count) => count + 1)
    setStorePanelSession((count) => count + 1)
    onResetFilters()
  }

  return (
    <div className="grid w-full grid-cols-1 gap-x-[14px] gap-y-[14px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:pr-[22px]">
      {/* Filtro por piso desativado temporariamente. */}
      <div className="min-w-0" ref={roleTriggerRef}>
        <StoreFilterTrigger
          defaultLabel="Filtrar por Cargo"
          isOpen={rolePanelOpen}
          onToggle={handleToggleRolePanel}
          selectedStore={filters.role}
        />
      </div>

      <div className="min-w-0" ref={storeTriggerRef}>
        <StoreFilterTrigger
          isOpen={storePanelOpen}
          selectedStore={filters.store}
          onToggle={handleToggleStorePanel}
        />
      </div>

      <Text
        as="p"
        variant="bodyMd"
        className="shrink-0 text-right text-[var(--Color-Text-Muted)] lg:w-[346px] lg:pt-[18px] text-left"
      >
        <span className="font-bold text-[var(--Color-Heading)]">{totalJobs}</span> vagas disponiveis
      </Text>

      {hasActiveFilters ? (
        <div className="col-span-full flex justify-end">
          <Button onClick={handleClearAllFilters} variant="primary">
            Limpar filtros
          </Button>
        </div>
      ) : null}

      {rolePanelOpen ? (
        <div className="col-span-full min-w-0 w-full" ref={rolePanelRef}>
          <StoreAutocompletePanel
            clearButtonLabel="Limpar cargo"
            defaultQuery={filters.role || ''}
            emptyLabel="Nenhum cargo encontrado."
            key={rolePanelSession}
            onClearStore={handleClearRole}
            onKeyDown={handlePanelsKeyDown}
            onSelectStore={handleRoleSelect}
            searchLabel="Buscar cargo"
            searchPlaceholder="Buscar Cargo"
            selectedStore={filters.role}
            stores={roles}
            suggestionsLabel="Cargos sugeridos"
          />
        </div>
      ) : null}

      {storePanelOpen ? (
        <div className="col-span-full min-w-0 w-full" ref={storePanelRef}>
          <StoreAutocompletePanel
            key={storePanelSession}
            defaultQuery={filters.store || ''}
            onClearStore={handleClearStore}
            onKeyDown={handlePanelsKeyDown}
            onSelectStore={handleStoreSelect}
            selectedStore={filters.store}
            stores={stores}
          />
        </div>
      ) : null}
    </div>
  )
}

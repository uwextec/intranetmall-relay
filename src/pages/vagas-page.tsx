import { useEffect, useRef, useState } from 'react'

import { JobCard } from '../components/jobs/job-card'
import { JobFiltersBar } from '../components/jobs/job-filters'
import { PageShell } from '../components/layout/page-shell'
import { PaginationArrowButton } from '../components/ui/pagination-arrow-button'
import { StateSection } from '../components/ui/state-section'
import { currentMall } from '../config/mall'
import { useJobs } from '../features/jobs/useJobs'
import { useDocumentTitle } from '../hooks/use-document-title'

type VagasPageProps = {
  isTotem?: boolean
}

export const VagasPage = ({ isTotem = false }: VagasPageProps) => {
  useDocumentTitle(`${currentMall.name} | Vagas`)

  const { filteredJobs, filters, setFilters, resetFilters, storeOptions, roleOptions, isLoading, error } =
    useJobs()
  const jobsPerPage = 5
  const [page, setPage] = useState(1)
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false)
  const jobsTopRef = useRef<HTMLElement | null>(null)

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage))
  const currentPage = Math.min(page, totalPages)
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1)

  const handleChangeFilters = (nextFilters: typeof filters) => {
    setShouldScrollToTop(false)
    setPage(1)
    setFilters(nextFilters)
  }

  const handleResetFilters = () => {
    setShouldScrollToTop(false)
    setPage(1)
    resetFilters()
  }

  const handleScrollToJobsTop = () => {
    if (!jobsTopRef.current) return

    const headerOffset = isTotem ? 24 : 120
    const top = jobsTopRef.current.getBoundingClientRect().top + window.scrollY - headerOffset
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  const handleNextPage = () => {
    setShouldScrollToTop(true)
    setPage((previousPage) => Math.min(previousPage + 1, totalPages))
  }

  const handlePreviousPage = () => {
    setShouldScrollToTop(true)
    setPage((previousPage) => Math.max(previousPage - 1, 1))
  }

  useEffect(() => {
    if (!shouldScrollToTop || isLoading || error || filteredJobs.length === 0) return

    window.requestAnimationFrame(() => {
      handleScrollToJobsTop()
      setShouldScrollToTop(false)
    })
  }, [shouldScrollToTop, currentPage, isLoading, error, filteredJobs.length])

  return (
    <PageShell isTotem={isTotem}>
      <section className="px-0 pb-8 pt-8 sm:px-10 lg:px-16" ref={jobsTopRef}>
        <div className="rounded-[1.375rem] bg-(--Color-Base-03) p-5 shadow-[0_4px_27.5px_var(--Color-Shadow-Soft)] sm:p-8">
          <div className="grid gap-4">
            <JobFiltersBar
              filters={filters}
              roles={roleOptions}
              onChange={handleChangeFilters}
              onResetFilters={handleResetFilters}
              stores={storeOptions}
              totalJobs={filteredJobs.length}
            />
          </div>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <StateSection
                description="Buscando vagas e areas diretamente da IntranetMall."
                title="Carregando oportunidades"
              />
            ) : null}

            {!isLoading && error ? (
              <StateSection
                actionLabel="Tentar novamente"
                description={error}
                onAction={() => window.location.reload()}
                title="Nao foi possivel carregar as vagas"
              />
            ) : null}

            {!isLoading && !error && filteredJobs.length === 0 ? (
              <StateSection
                actionLabel="Remover filtros"
                description="Nenhuma vaga corresponde aos filtros informados."
                onAction={handleResetFilters}
                title="Nenhuma vaga encontrada"
              />
            ) : null}

            {!isLoading && !error
              ? paginatedJobs.map((job) => <JobCard job={job} key={job.id} />)
              : null}
          </div>

          {!isLoading && !error && filteredJobs.length > 0 ? (
            <nav
              aria-label="Paginacao de vagas"
              className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4 sm:pl-[10px]"
            >
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-3 text-[15px] leading-[26px] tracking-[-0.02em] sm:justify-start sm:gap-2">
                {visiblePages.map((pageNumber) => (
                  <button
                    aria-label={`Ir para pagina ${pageNumber}`}
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                    className={
                      pageNumber === currentPage
                        ? 'inline-flex min-h-9 min-w-9 items-center justify-center rounded-md px-2 py-1 text-base font-bold text-(--Color-Base-02) sm:min-h-0 sm:min-w-0 sm:px-0 sm:py-0 sm:text-[15px]'
                        : 'inline-flex min-h-9 min-w-9 items-center justify-center rounded-md px-2 py-1 text-base text-(--Color-Text-Muted) sm:min-h-0 sm:min-w-0 sm:px-0 sm:py-0 sm:text-[15px]'
                    }
                    key={pageNumber}
                    onClick={() => {
                      setShouldScrollToTop(true)
                      setPage(pageNumber)
                    }}
                    type="button"
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <div className="flex shrink-0 gap-3 sm:gap-2">
                <PaginationArrowButton
                  aria-label="Voltar para pagina anterior"
                  direction="previous"
                  disabled={currentPage <= 1}
                  onClick={handlePreviousPage}
                />
                <PaginationArrowButton
                  aria-label="Ir para proxima pagina"
                  direction="next"
                  disabled={currentPage >= totalPages}
                  onClick={handleNextPage}
                />
              </div>
            </nav>
          ) : null}
        </div>
      </section>
    </PageShell>
  )
}

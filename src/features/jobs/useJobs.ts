import { useEffect, useMemo, useState } from 'react'

import { dedupeAndNormalizeJobs, filterJobs } from './normalizers'
import { fetchJobs } from './service'
import type { Job, JobFilters } from './types'

const initialFilters: JobFilters = {
  // floor: '', // Filtro por piso desativado temporariamente no layout.
  role: '',
  store: '',
}

const sortLabels = (values: string[]) => values.sort((a, b) => a.localeCompare(b, 'pt-BR'))

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filters, setFilters] = useState<JobFilters>(initialFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const rawJobs = await fetchJobs()

        if (!isMounted) {
          return
        }

        const normalizedJobs = dedupeAndNormalizeJobs(rawJobs)
        setJobs(normalizedJobs)
      } catch (requestError) {
        if (!isMounted) {
          return
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Nao foi possivel carregar as vagas no momento.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const roleOptions = useMemo(() => {
    const jobsForRoleOptions = filters.store ? jobs.filter((job) => job.storeName === filters.store) : jobs
    const options = sortLabels(Array.from(new Set(jobsForRoleOptions.map((job) => job.title))))

    if (filters.role && !options.includes(filters.role)) {
      return [filters.role, ...options]
    }

    return options
  }, [jobs, filters.store, filters.role])

  const storeOptions = useMemo(() => {
    const jobsForStoreOptions = filters.role ? jobs.filter((job) => job.title === filters.role) : jobs
    const options = sortLabels(Array.from(new Set(jobsForStoreOptions.map((job) => job.storeName))))

    if (filters.store && !options.includes(filters.store)) {
      return [filters.store, ...options]
    }

    return options
  }, [jobs, filters.role, filters.store])

  const filteredJobs = useMemo(
    () => filterJobs(jobs, filters.role, filters.store),
    [filters.role, filters.store, jobs],
  )

  const resetFilters = () => setFilters(initialFilters)

  return {
    jobs,
    filteredJobs,
    filters,
    setFilters,
    resetFilters,
    storeOptions,
    roleOptions,
    isLoading,
    error,
  }
}

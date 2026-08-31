import type { AreasResponse, JobsResponse, RawJob } from './types'

const parseResponse = async <T>(response: Response) => {
  if (!response.ok) {
    throw new Error(`Falha na API interna (${response.status})`)
  }

  return (await response.json()) as T
}

/** Reutiliza resposta recente e une chamadas paralelas (prefetch na home + abertura de /vagas). */
const JOBS_CLIENT_CACHE_TTL_MS = 5 * 60_000
const JOBS_SESSION_STORAGE_KEY = 'lp-vagas::jobs-cache'

let jobsCache: { jobs: RawJob[]; fetchedAt: number } | null = null
let jobsInflight: Promise<RawJob[]> | null = null

const loadJobsFromSessionStorage = () => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(JOBS_SESSION_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { jobs?: unknown; fetchedAt?: unknown }
    if (!Array.isArray(parsed.jobs) || typeof parsed.fetchedAt !== 'number') {
      return null
    }

    const age = Date.now() - parsed.fetchedAt
    if (age > JOBS_CLIENT_CACHE_TTL_MS) {
      return null
    }

    return {
      jobs: parsed.jobs as RawJob[],
      fetchedAt: parsed.fetchedAt,
    }
  } catch {
    return null
  }
}

const saveJobsToSessionStorage = (jobs: RawJob[], fetchedAt: number) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(
      JOBS_SESSION_STORAGE_KEY,
      JSON.stringify({
        jobs,
        fetchedAt,
      }),
    )
  } catch {
    /* sem impacto funcional se storage indisponível */
  }
}

const fetchJobsFromNetwork = async (): Promise<RawJob[]> => {
  const response = await fetch('/api/jobs', {
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = await parseResponse<JobsResponse>(response)
  const jobs = payload.jobs as RawJob[]
  const fetchedAt = Date.now()
  jobsCache = { jobs, fetchedAt }
  saveJobsToSessionStorage(jobs, fetchedAt)
  return jobs
}

export const prefetchJobs = () => {
  void fetchJobs().catch(() => {
    /* prefetch opcional; /vagas repete a busca se falhar */
  })
}

export const fetchJobs = async (): Promise<RawJob[]> => {
  const now = Date.now()
  if (!jobsCache) {
    jobsCache = loadJobsFromSessionStorage()
  }

  if (jobsCache && now - jobsCache.fetchedAt < JOBS_CLIENT_CACHE_TTL_MS) {
    return jobsCache.jobs
  }

  if (jobsInflight) {
    return jobsInflight
  }

  jobsInflight = fetchJobsFromNetwork().finally(() => {
    jobsInflight = null
  })

  return jobsInflight
}

export const fetchAreas = async () => {
  const response = await fetch('/api/areas', {
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = await parseResponse<AreasResponse>(response)
  return payload.areas
}

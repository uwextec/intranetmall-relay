import type { Job, RawJob } from './types'

const splitDescription = (description?: string | null) => {
  if (!description) {
    return []
  }

  return description
    .split(/\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const extractRequirements = (paragraphs: string[]) => {
  return paragraphs
    .filter((paragraph) => /^[-*•]|requisitos?/i.test(paragraph))
    .map((paragraph) => paragraph.replace(/^[-*•]\s*/, '').replace(/^requisitos?:?\s*/i, '').trim())
    .filter(Boolean)
}

const normalizeRoleLabel = (value?: string | null) => {
  if (!value) {
    return ''
  }

  const sanitized = value.trim().replace(/\s+/g, ' ')
  if (!sanitized) {
    return ''
  }

  return sanitized
    .toLocaleLowerCase('pt-BR')
    .replace(/(^|[\s/-])([a-zà-ÿ])/g, (_match, separator: string, letter: string) => {
      return `${separator}${letter.toLocaleUpperCase('pt-BR')}`
    })
}

const extractFloor = (description: string) => {
  const floorMatch = description.match(/piso\s*[:-]\s*([^\n\r,.]+)/i)
  if (floorMatch?.[1]) {
    return floorMatch[1].trim()
  }

  return 'Nao informado'
}

export const slugifyJob = (title: string, id: string) => {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return `${base || 'vaga'}-${id}`
}

export const getJobIdFromParam = (value = '') => {
  const parts = value.split('-')
  return parts[parts.length - 1] || value
}

export const normalizeJob = (raw: RawJob): Job => {
  const id = String(raw.IdVaga)
  const normalizedTitle = normalizeRoleLabel(raw.NomeDaVaga) || normalizeRoleLabel(raw.TipoVaga)
  const title = normalizedTitle || 'Vaga em aberto'
  const storeName = raw.NomeDaLoja?.trim() || 'Loja nao informada'
  const roleType = raw.TipoVaga?.trim() || title
  const description = raw.DescricaoDaVaga?.trim() || 'Entre em contato com a loja para mais detalhes sobre esta oportunidade.'
  const descriptionParagraphs = splitDescription(description)
  const requirements = extractRequirements(descriptionParagraphs)
  const wpFloor = raw.storeFloorLabel?.trim()
  const floor = wpFloor || extractFloor(description)

  return {
    id,
    slug: slugifyJob(`${title}-${storeName}`, id),
    title,
    storeName,
    floor,
    roleType,
    description,
    descriptionParagraphs: descriptionParagraphs.length > 0 ? descriptionParagraphs : [description],
    requirements,
    email: raw.EmailDaVaga?.trim() || null,
    storeId: raw.IdLoja ? String(raw.IdLoja) : null,
    createdAt: raw.DataCadastro || null,
  }
}

const compareJobsAlphabetically = (a: Job, b: Job) => {
  const byStore = a.storeName.localeCompare(b.storeName, 'pt-BR')
  if (byStore !== 0) {
    return byStore
  }

  return a.title.localeCompare(b.title, 'pt-BR')
}

export const sortJobsAlphabetically = (jobs: Job[]) => [...jobs].sort(compareJobsAlphabetically)

export const dedupeAndNormalizeJobs = (rawJobs: RawJob[]) => {
  const map = new Map<string, Job>()

  rawJobs.forEach((rawJob) => {
    const id = String(rawJob.IdVaga)
    if (!map.has(id)) {
      map.set(id, normalizeJob(rawJob))
    }
  })

  return sortJobsAlphabetically(Array.from(map.values()))
}

export const filterJobs = (jobs: Job[], role: string, store: string) => {
  return jobs.filter((job) => {
    const matchesRole = !role || job.title === role
    const matchesStore = !store || job.storeName === store

    return matchesRole && matchesStore
  })
}

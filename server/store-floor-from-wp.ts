import type { WpLoja } from './wordpress-lojas.js'

const stripDiacritics = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '')

const normalizeKey = (value: string) => {
  const collapsed = stripDiacritics(value)
    .toLowerCase()
    .replace(/[\u00a0\s]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return collapsed
}

const cleanIntranetStoreName = (name: string) =>
  name
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const formatFloorLabel = (loja: WpLoja) => {
  const piso = loja.piso?.trim()
  if (!piso) {
    return null
  }

  return piso
}

const registerNumeroKeys = (numero: string, label: string, map: Map<string, string>) => {
  const raw = numero.trim().toUpperCase()
  if (!raw) {
    return
  }

  if (!map.has(raw)) {
    map.set(raw, label)
  }

  const digitsOnly = raw.replace(/\D/g, '')
  if (digitsOnly.length >= 3 && digitsOnly !== raw && !map.has(digitsOnly)) {
    map.set(digitsOnly, label)
  }
}

const buildExactTitleMap = (lojas: WpLoja[]) => {
  const map = new Map<string, string>()

  for (const loja of lojas) {
    const label = formatFloorLabel(loja)
    if (!label) {
      continue
    }

    const titleKey = normalizeKey(loja.title)
    if (titleKey && !map.has(titleKey)) {
      map.set(titleKey, label)
    }

    const slugKey = normalizeKey(loja.slug.replace(/-/g, ' '))
    if (slugKey && slugKey !== titleKey && !map.has(slugKey)) {
      map.set(slugKey, label)
    }

    const numero = loja.numero?.trim()
    if (numero) {
      registerNumeroKeys(numero, label, map)
    }
  }

  return map
}

const resolveByNumeroHints = (originalName: string, cleanedName: string, map: Map<string, string>) => {
  const paren = originalName.match(/\(([^)]+)\)\s*$/)
  if (paren?.[1]) {
    const token = paren[1].trim().toUpperCase()
    const hit = map.get(token) ?? map.get(token.replace(/\D/g, ''))
    if (hit) {
      return hit
    }
  }

  const tail = cleanedName.match(/(?:^|\s)(\d{3,5}|[A-Z]?\d{3,5})\s*$/i)
  if (tail?.[1]) {
    const token = tail[1].trim().toUpperCase()
    const hit = map.get(token) ?? map.get(token.replace(/\D/g, ''))
    if (hit) {
      return hit
    }
  }

  return null
}

const resolveByPrefix = (norm: string, lojas: WpLoja[]) => {
  let best: { score: number; label: string } | null = null

  for (const loja of lojas) {
    const label = formatFloorLabel(loja)
    if (!label) {
      continue
    }

    const tk = normalizeKey(loja.title)
    if (tk.length < 5) {
      continue
    }

    if (norm === tk) {
      return label
    }

    if (norm.startsWith(tk) || tk.startsWith(norm)) {
      const shorter = Math.min(norm.length, tk.length)
      const longer = Math.max(norm.length, tk.length)
      if (shorter / longer < 0.65) {
        continue
      }

      if (!best || shorter > best.score) {
        best = { score: shorter, label }
      }
    }
  }

  return best?.label ?? null
}

export const resolveFloorLabelForStore = (
  nomeDaLoja: string | null | undefined,
  lojas: WpLoja[],
  exactMap: Map<string, string>,
) => {
  if (!nomeDaLoja?.trim()) {
    return null
  }

  const cleaned = cleanIntranetStoreName(nomeDaLoja)
  const norm = normalizeKey(cleaned)

  const direct = exactMap.get(norm)
  if (direct) {
    return direct
  }

  const firstSegment = norm.split(/\s+-\s+/)[0]?.trim() ?? ''
  if (firstSegment && firstSegment !== norm) {
    const hit = exactMap.get(firstSegment)
    if (hit) {
      return hit
    }
  }

  const withoutParens = normalizeKey(cleaned.replace(/\([^)]*\)/g, ''))
  if (withoutParens && withoutParens !== norm) {
    const hit = exactMap.get(withoutParens)
    if (hit) {
      return hit
    }
  }

  const byNumero = resolveByNumeroHints(nomeDaLoja, cleaned, exactMap)
  if (byNumero) {
    return byNumero
  }

  return resolveByPrefix(norm, lojas)
}

export const attachWpFloorToJobs = (jobs: unknown[], lojas: WpLoja[]) => {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return jobs
  }

  if (lojas.length === 0) {
    return jobs
  }

  const exactMap = buildExactTitleMap(lojas)

  return jobs.map((job) => {
    if (!job || typeof job !== 'object') {
      return job
    }

    const record = job as Record<string, unknown>
    const tipo = String(record.TipoVaga ?? '')
    if (/administra/i.test(tipo)) {
      return { ...record, storeFloorLabel: null }
    }

    const nome = typeof record.NomeDaLoja === 'string' ? record.NomeDaLoja : ''
    const label = resolveFloorLabelForStore(nome, lojas, exactMap)

    return { ...record, storeFloorLabel: label }
  })
}

export const fetchJobsWithWpFloors = async (
  fetchJobsPayload: () => Promise<unknown[]>,
  fetchLojas: () => Promise<WpLoja[]>,
) => {
  const [jobs, lojasResult] = await Promise.all([
    fetchJobsPayload(),
    fetchLojas().catch(() => [] as WpLoja[]),
  ])

  return attachWpFloorToJobs(jobs, lojasResult)
}

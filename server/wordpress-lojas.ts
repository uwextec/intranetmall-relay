const DEFAULT_LOJAS_BASE_URL = 'https://palladiumcuritiba.com.br/wp-json/wp/v2/loja'

export type WpLoja = {
  title: string
  slug: string
  piso: string | null
  numero: string | null
}

type WpLojaRestRow = {
  title?: { rendered?: string }
  slug?: string
  acf?: Record<string, unknown>
}

const readAcfString = (acf: Record<string, unknown> | undefined, key: string) => {
  const value = acf?.[key]
  return typeof value === 'string' ? value.trim() || null : null
}

const parseRow = (row: WpLojaRestRow): WpLoja | null => {
  const title = row.title?.rendered?.replace(/\s+/g, ' ').trim()
  const slug = row.slug?.trim()
  if (!title || !slug) {
    return null
  }

  const acf = row.acf
  const piso = readAcfString(acf, 'piso-loja')
  const numero = readAcfString(acf, 'numero-loja')

  return {
    title,
    slug,
    piso,
    numero,
  }
}

const getLojasBaseUrl = () => {
  const fromEnv = process.env.WORDPRESS_LOJAS_BASE_URL?.trim()
  const base = (fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_LOJAS_BASE_URL).replace(/\/$/, '')
  return base
}

const getCacheTtlMs = () => {
  const raw = process.env.WORDPRESS_LOJAS_CACHE_TTL_MS?.trim()
  if (raw === '0') {
    return 0
  }
  if (raw) {
    const parsed = Number.parseInt(raw, 10)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed
    }
  }
  return 15 * 60 * 1000
}

type WpLojasCache = {
  lojas: WpLoja[]
  expiresAt: number
}

let memoryCache: WpLojasCache | null = null
let inFlight: Promise<WpLoja[]> | null = null

const fetchWpLojaPage = async (baseUrl: string, perPage: number, page: number) => {
  const url = `${baseUrl}?per_page=${perPage}&page=${page}`
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Falha ao buscar lojas no WordPress (${response.status}): ${url}`)
  }

  const payload = (await response.json()) as WpLojaRestRow[]
  const totalPagesRaw = response.headers.get('x-wp-totalpages')
  const totalPagesParsed = totalPagesRaw ? Number.parseInt(totalPagesRaw, 10) : 1
  const totalPages = Number.isFinite(totalPagesParsed) && totalPagesParsed >= 1 ? totalPagesParsed : 1

  return { rows: Array.isArray(payload) ? payload : [], totalPages }
}

const rowsToLojas = (rows: WpLojaRestRow[]) => {
  const collected: WpLoja[] = []
  for (const row of rows) {
    const parsed = parseRow(row)
    if (parsed) {
      collected.push(parsed)
    }
  }
  return collected
}

/**
 * Lista todas as lojas publicadas no WordPress (CPT `loja`).
 * Primeira página define o total; páginas seguintes são buscadas em paralelo.
 */
const fetchAllWpLojasFresh = async (): Promise<WpLoja[]> => {
  const baseUrl = getLojasBaseUrl()
  const perPage = 100

  const first = await fetchWpLojaPage(baseUrl, perPage, 1)
  const totalPages = first.totalPages

  if (totalPages <= 1) {
    return rowsToLojas(first.rows)
  }

  const otherPageIndexes = Array.from({ length: totalPages - 1 }, (_, index) => index + 2)
  const otherResponses = await Promise.all(
    otherPageIndexes.map((page) => fetchWpLojaPage(baseUrl, perPage, page)),
  )

  const allRows = [...first.rows, ...otherResponses.flatMap((item) => item.rows)]
  return rowsToLojas(allRows)
}

/**
 * Lojas do WordPress com cache em memória (TTL configurável) e deduplicação
 * de chamadas simultâneas — evita várias idas à API em cada reload.
 */
export const fetchAllWpLojas = async (): Promise<WpLoja[]> => {
  const ttlMs = getCacheTtlMs()
  const now = Date.now()

  if (ttlMs > 0 && memoryCache && memoryCache.expiresAt > now) {
    return memoryCache.lojas
  }

  if (inFlight) {
    return inFlight
  }

  inFlight = (async () => {
    try {
      const lojas = await fetchAllWpLojasFresh()
      if (ttlMs > 0) {
        memoryCache = { lojas, expiresAt: Date.now() + ttlMs }
      }
      return lojas
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}

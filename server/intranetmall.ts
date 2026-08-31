import type { IncomingMessage, ServerResponse } from 'node:http'
import { timingSafeEqual } from 'node:crypto'

import { fetchJobsWithWpFloors } from './store-floor-from-wp.js'
import { fetchAllWpLojas } from './wordpress-lojas.js'

type JsonRecord = Record<string, unknown>

const defaultBaseUrl = 'https://www.intranetmall.com/ApiVagasCurriculum/api'

const getServerConfig = () => {
  const baseUrl = process.env.INTRANETMALL_API_BASE_URL || defaultBaseUrl
  const login = process.env.INTRANETMALL_LOGIN
  const password = process.env.INTRANETMALL_PASSWORD
  const group = process.env.INTRANETMALL_GROUP
  const shopping = process.env.INTRANETMALL_SHOPPING_CODE || process.env.INTRANETMALL_DB_ENTITY

  if (!login || !password || !group || !shopping) {
    throw new Error('Variaveis de ambiente do IntranetMall nao foram configuradas corretamente.')
  }

  return {
    baseUrl,
    login,
    password,
    group,
    shopping,
  }
}

const requestJson = async <T>(endpoint: string, headers: Record<string, string>) => {
  const { baseUrl } = getServerConfig()
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Falha ao consultar ${endpoint}: ${response.status}`)
  }

  return (await response.json()) as T
}

const requestPostJson = async <T>(endpoint: string, headers: Record<string, string>, body: unknown) => {
  const { baseUrl } = getServerConfig()
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Falha ao consultar ${endpoint}: ${response.status}`)
  }

  return (await response.json()) as T
}

const getTokenCacheTtlMs = () => {
  const raw = process.env.INTRANETMALL_TOKEN_CACHE_TTL_MS?.trim()
  if (raw === '0') {
    return 0
  }
  if (raw) {
    const parsed = Number.parseInt(raw, 10)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed
    }
  }
  return 12 * 60 * 1000
}

let tokenCache: { token: string; expiresAt: number } | null = null

const clearTokenCache = () => {
  tokenCache = null
}

const getToken = async () => {
  const ttlMs = getTokenCacheTtlMs()
  const now = Date.now()
  if (ttlMs > 0 && tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token
  }

  const { login, password, group } = getServerConfig()
  const payload = await requestJson<{ Token?: string }>('/Login', {
    Login: login,
    Senha: password,
    Grupo: group,
  })

  if (!payload.Token) {
    throw new Error('A API nao retornou um token valido.')
  }

  if (ttlMs > 0) {
    tokenCache = { token: payload.Token, expiresAt: now + ttlMs }
  }

  return payload.Token
}

const buildAuthenticatedHeaders = async () => {
  const { shopping, group } = getServerConfig()
  const token = await getToken()

  return {
    Token: token,
    Shopping: shopping,
    Grupo: group,
  }
}

const fetchBuscaVagasOnce = async () => {
  return requestJson<unknown[]>('/BuscaVagas', await buildAuthenticatedHeaders())
}

export const fetchJobsPayload = async () => {
  try {
    const payload = await fetchBuscaVagasOnce()
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('401')) {
      clearTokenCache()
      const payload = await fetchBuscaVagasOnce()
      return Array.isArray(payload) ? payload : []
    }
    throw error
  }
}

export const fetchJobsPayloadWithWpFloors = async () => {
  return fetchJobsWithWpFloors(fetchJobsPayload, fetchAllWpLojas)
}

export const fetchAreasPayload = async () => {
  const payload = await requestJson<unknown[]>('/Adm', await buildAuthenticatedHeaders())

  if (!Array.isArray(payload)) {
    return []
  }

  return payload
    .flatMap((item) => {
      if (typeof item === 'string') {
        return [item]
      }

      if (item && typeof item === 'object') {
        return Object.values(item as JsonRecord)
          .filter((value): value is string => typeof value === 'string')
          .slice(0, 1)
      }

      return []
    })
    .filter(Boolean)
}

const fetchAdmOnce = async () => {
  return requestJson<unknown[]>('/Adm', await buildAuthenticatedHeaders())
}

/**
 * Retorno cru de /Adm (com IdArea e Nome), sem o achatamento que fetchAreasPayload faz
 * para a LP. E o formato que intranetmall_areas() do tema WordPress espera.
 */
export const fetchRawAdm = async () => {
  try {
    const payload = await fetchAdmOnce()
    return Array.isArray(payload) ? payload : []
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('401')) {
      clearTokenCache()
      const payload = await fetchAdmOnce()
      return Array.isArray(payload) ? payload : []
    }
    throw error
  }
}

const postCurriculumOnce = async (body: unknown) => {
  return requestPostJson<unknown>('/Curriculum', await buildAuthenticatedHeaders(), body)
}

export const postCurriculo = async (body: unknown) => {
  try {
    return await postCurriculumOnce(body)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('401')) {
      clearTokenCache()
      return await postCurriculumOnce(body)
    }
    throw error
  }
}

/**
 * Confirma que a chamada veio do WordPress (header x-relay-key), nao de um visitante
 * qualquer. Comparacao em tempo constante para nao vazar a chave por timing.
 */
export const isAuthorizedRelay = (request: IncomingMessage) => {
  const expected = process.env.RELAY_KEY
  const provided = request.headers['x-relay-key']

  if (!expected || typeof provided !== 'string') {
    return false
  }

  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)

  if (expectedBuffer.length !== providedBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, providedBuffer)
}

export const sendUnauthorized = (response: ServerResponse) => {
  sendJson(response, 401, {
    message: 'Nao autorizado.',
  })
}

export const sendJson = (response: ServerResponse, statusCode: number, payload: unknown) => {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

export const sendMethodNotAllowed = (response: ServerResponse) => {
  sendJson(response, 405, {
    message: 'Metodo nao permitido.',
  })
}

export const handleServerError = (response: ServerResponse, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Erro interno.'

  sendJson(response, 500, {
    message,
  })
}

export const isGetRequest = (request: IncomingMessage) => request.method === 'GET'

export const isPostRequest = (request: IncomingMessage) => request.method === 'POST'

export const readJsonBody = async (request: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(chunk as Buffer)
  }

  const raw = Buffer.concat(chunks).toString('utf-8')

  return raw ? JSON.parse(raw) : null
}


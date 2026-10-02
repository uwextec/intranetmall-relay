import type { IncomingMessage, ServerResponse } from 'node:http'
import { timingSafeEqual } from 'node:crypto'

const defaultBaseUrl = 'https://www.intranetmall.com/ApiVagasCurriculum/api'

export type ShoppingConfig = {
  login: string
  password: string
  group: string
  shopping: string
}

const getBaseUrl = () => process.env.INTRANETMALL_API_BASE_URL || defaultBaseUrl

const headerValue = (request: IncomingMessage, name: string) => {
  const value = request.headers[name]
  return typeof value === 'string' && value.trim() ? value : null
}

/**
 * Le as credenciais que o proprio WordPress ja manda em toda chamada
 * (intranetmall_relay_headers, em integracao/intranetmall-api.php). Cada site
 * WordPress manda as credenciais do seu proprio shopping, entao um unico
 * deploy deste relay atende todos eles.
 */
export const getConfigFromHeaders = (request: IncomingMessage): ShoppingConfig | null => {
  const login = headerValue(request, 'x-login')
  const password = headerValue(request, 'x-senha')
  const group = headerValue(request, 'x-grupo')
  const shopping = headerValue(request, 'x-shopping')

  if (!login || !password || !group || !shopping) {
    return null
  }

  return { login, password, group, shopping }
}

const requestJson = async <T>(endpoint: string, headers: Record<string, string>) => {
  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Falha ao consultar ${endpoint}: ${response.status}`)
  }

  return (await response.json()) as T
}

const requestPostJson = async <T>(endpoint: string, headers: Record<string, string>, body: unknown) => {
  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
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

/**
 * Um relay so atende varios shoppings ao mesmo tempo, entao o cache de token
 * precisa ser por shopping (login+grupo), nao um valor global unico.
 */
const tokenCacheByShopping = new Map<string, { token: string; expiresAt: number }>()

const tokenCacheKey = (config: ShoppingConfig) => `${config.login}::${config.group}`

const clearTokenCache = (config: ShoppingConfig) => {
  tokenCacheByShopping.delete(tokenCacheKey(config))
}

const getToken = async (config: ShoppingConfig) => {
  const ttlMs = getTokenCacheTtlMs()
  const cacheKey = tokenCacheKey(config)
  const now = Date.now()

  if (ttlMs > 0) {
    const cached = tokenCacheByShopping.get(cacheKey)
    if (cached && cached.expiresAt > now) {
      return cached.token
    }
  }

  const payload = await requestJson<{ Token?: string }>('/Login', {
    Login: config.login,
    Senha: config.password,
    Grupo: config.group,
  })

  if (!payload.Token) {
    throw new Error('A API nao retornou um token valido.')
  }

  if (ttlMs > 0) {
    tokenCacheByShopping.set(cacheKey, { token: payload.Token, expiresAt: now + ttlMs })
  }

  return payload.Token
}

const buildAuthenticatedHeaders = async (config: ShoppingConfig) => {
  const token = await getToken(config)

  return {
    Token: token,
    Shopping: config.shopping,
    Grupo: config.group,
  }
}

const withTokenRetry = async <T>(config: ShoppingConfig, run: (headers: Record<string, string>) => Promise<T>) => {
  try {
    return await run(await buildAuthenticatedHeaders(config))
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('401')) {
      clearTokenCache(config)
      return await run(await buildAuthenticatedHeaders(config))
    }
    throw error
  }
}

/** Array cru de BuscaVagas, no formato que intranetmall_vagas() do tema WordPress espera. */
export const fetchJobsPayload = async (config: ShoppingConfig) => {
  const payload = await withTokenRetry(config, (headers) => requestJson<unknown[]>('/BuscaVagas', headers))
  return Array.isArray(payload) ? payload : []
}

/** Array cru de Adm (com IdArea e Nome), no formato que intranetmall_areas() espera. */
export const fetchRawAdm = async (config: ShoppingConfig) => {
  const payload = await withTokenRetry(config, (headers) => requestJson<unknown[]>('/Adm', headers))
  return Array.isArray(payload) ? payload : []
}

/** Repassa o envio de curriculo para /Curriculum, autenticado com o token do shopping. */
export const postCurriculo = async (config: ShoppingConfig, body: unknown) => {
  return withTokenRetry(config, (headers) => requestPostJson<unknown>('/Curriculum', headers, body))
}

/** Repassa um contato do Fale Conosco para /Sac, autenticado com o token do shopping. */
export const postSac = async (config: ShoppingConfig, body: unknown) => {
  return withTokenRetry(config, (headers) => requestPostJson<unknown>('/Sac', headers, body))
}

/**
 * Confirma que a chamada veio do WordPress (header x-relay-key), nao de um visitante
 * qualquer. Comparacao em tempo constante para nao vazar a chave por timing.
 */
export const isAuthorizedRelay = (request: IncomingMessage) => {
  const expected = process.env.RELAY_KEY
  const provided = headerValue(request, 'x-relay-key')

  if (!expected || !provided) {
    return false
  }

  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)

  if (expectedBuffer.length !== providedBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, providedBuffer)
}

export const sendJson = (response: ServerResponse, statusCode: number, payload: unknown) => {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

export const sendUnauthorized = (response: ServerResponse) => {
  sendJson(response, 401, { message: 'Nao autorizado.' })
}

export const sendBadRequest = (response: ServerResponse, message: string) => {
  sendJson(response, 400, { message })
}

export const sendMethodNotAllowed = (response: ServerResponse) => {
  sendJson(response, 405, { message: 'Metodo nao permitido.' })
}

export const handleServerError = (response: ServerResponse, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Erro interno.'
  sendJson(response, 500, { message })
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

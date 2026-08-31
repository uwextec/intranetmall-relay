import type { IncomingMessage, ServerResponse } from 'node:http'

import {
  fetchRawAdm,
  getConfigFromHeaders,
  handleServerError,
  isAuthorizedRelay,
  isGetRequest,
  sendBadRequest,
  sendJson,
  sendMethodNotAllowed,
  sendUnauthorized,
} from '../server/intranetmall.js'

/**
 * Rota do relay: o WordPress (intranetmall_relay_recurso) chama GET /api/areas
 * e espera o array cru de Adm (com IdArea e Nome), sem embrulho nem achatamento.
 */
export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (!isGetRequest(request)) {
    sendMethodNotAllowed(response)
    return
  }

  if (!isAuthorizedRelay(request)) {
    sendUnauthorized(response)
    return
  }

  const config = getConfigFromHeaders(request)

  if (!config) {
    sendBadRequest(response, 'Credenciais da Intranet Mall nao foram enviadas.')
    return
  }

  try {
    const areas = await fetchRawAdm(config)
    sendJson(response, 200, areas)
  } catch (error) {
    handleServerError(response, error)
  }
}

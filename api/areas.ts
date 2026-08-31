import type { IncomingMessage, ServerResponse } from 'node:http'

import {
  fetchRawAdm,
  handleServerError,
  isAuthorizedRelay,
  isGetRequest,
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

  try {
    const areas = await fetchRawAdm()
    sendJson(response, 200, areas)
  } catch (error) {
    handleServerError(response, error)
  }
}

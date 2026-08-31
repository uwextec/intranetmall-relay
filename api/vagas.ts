import type { IncomingMessage, ServerResponse } from 'node:http'

import {
  fetchJobsPayload,
  handleServerError,
  isAuthorizedRelay,
  isGetRequest,
  sendJson,
  sendMethodNotAllowed,
  sendUnauthorized,
} from '../server/intranetmall.js'

/**
 * Rota do relay: o WordPress (intranetmall_relay_recurso) chama GET /api/vagas
 * e espera o array cru de BuscaVagas, sem embrulho.
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
    const jobs = await fetchJobsPayload()
    sendJson(response, 200, jobs)
  } catch (error) {
    handleServerError(response, error)
  }
}

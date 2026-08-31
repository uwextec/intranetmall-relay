import type { IncomingMessage, ServerResponse } from 'node:http'

import {
  handleServerError,
  isAuthorizedRelay,
  isPostRequest,
  postCurriculo,
  readJsonBody,
  sendJson,
  sendMethodNotAllowed,
  sendUnauthorized,
} from '../server/intranetmall.js'

/**
 * Rota do relay: o WordPress (envia_curriculo_curl) chama POST /api/curriculo
 * com o mesmo corpo que mandaria direto para /Curriculum da Intranet Mall.
 */
export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (!isPostRequest(request)) {
    sendMethodNotAllowed(response)
    return
  }

  if (!isAuthorizedRelay(request)) {
    sendUnauthorized(response)
    return
  }

  try {
    const body = await readJsonBody(request)
    const resultado = await postCurriculo(body)
    sendJson(response, 200, resultado)
  } catch (error) {
    handleServerError(response, error)
  }
}

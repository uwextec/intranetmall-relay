import type { IncomingMessage, ServerResponse } from 'node:http'

import {
  fetchJobsPayloadWithWpFloors,
  handleServerError,
  isGetRequest,
  sendJson,
  sendMethodNotAllowed,
} from '../server/intranetmall.js'

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (!isGetRequest(request)) {
    sendMethodNotAllowed(response)
    return
  }

  try {
    const jobs = await fetchJobsPayloadWithWpFloors()
    sendJson(response, 200, { jobs })
  } catch (error) {
    handleServerError(response, error)
  }
}

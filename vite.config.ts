import type { IncomingMessage, ServerResponse } from 'node:http'

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import {
  fetchAreasPayload,
  fetchJobsPayloadWithWpFloors,
  handleServerError,
  sendJson,
  sendMethodNotAllowed,
} from './server/intranetmall.js'

const localApiPlugin = () => ({
  name: 'local-intranetmall-api',
  configureServer(server: { middlewares: { use: (handler: (request: IncomingMessage, response: ServerResponse, next: () => void) => void) => void } }) {
    server.middlewares.use((request, response, next) => {
      if (!request.url?.startsWith('/api/')) {
        next()
        return
      }

      if (request.method !== 'GET') {
        sendMethodNotAllowed(response)
        return
      }

      const handleRequest = async () => {
        try {
          if (request.url === '/api/jobs') {
            const jobs = await fetchJobsPayloadWithWpFloors()
            sendJson(response, 200, { jobs })
            return
          }

          if (request.url === '/api/areas') {
            const areas = await fetchAreasPayload()
            sendJson(response, 200, { areas })
            return
          }

          next()
        } catch (error) {
          handleServerError(response, error)
        }
      }

      void handleRequest()
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
  }
})

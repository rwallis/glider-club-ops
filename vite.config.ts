import type { Connect } from 'vite'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error shared JS weather proxy
import { fetchNearbyMetarObservations } from './weatherApi.mjs'

function weatherApiPlugin(): Plugin {
  return {
    name: 'weather-api',
    configureServer(server) {
      server.middlewares.use(async (req: Connect.IncomingMessage, res, next) => {
        if (!req.url?.startsWith('/api/weather')) {
          next()
          return
        }

        try {
          const observations = await fetchNearbyMetarObservations(req.url)
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'public, max-age=300')
          res.end(JSON.stringify(observations))
        } catch (err) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Weather unavailable',
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), weatherApiPlugin()],
})

import type { Connect } from 'vite'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error shared JS weather proxy
import { fetchNearbyMetarObservations } from './weatherApi.mjs'
// @ts-expect-error shared JS glidingops hours proxy
import { fetchHoursSinceAnnual } from './glidingOpsHours.mjs'

function readJsonBody(req: Connect.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim()
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function apiPlugin(): Plugin {
  return {
    name: 'club-api',
    configureServer(server) {
      server.middlewares.use(async (req: Connect.IncomingMessage, res, next) => {
        const url = req.url ?? ''

        if (url.startsWith('/api/weather')) {
          try {
            const observations = await fetchNearbyMetarObservations(url)
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
          return
        }

        if (url.startsWith('/api/glidingops-hours')) {
          if (req.method !== 'POST' && req.method !== 'GET') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Use POST or GET' }))
            return
          }
          try {
            const body =
              req.method === 'POST' ? ((await readJsonBody(req)) as { fleet?: unknown }) : {}
            const result = await fetchHoursSinceAnnual({
              fleet: Array.isArray(body.fleet) ? body.fleet : undefined,
            })
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'no-store')
            res.end(JSON.stringify(result))
          } catch (err) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'GlidingOps hours unavailable',
              }),
            )
          }
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiPlugin()],
})

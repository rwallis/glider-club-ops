import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchNearbyMetarObservations } from './weatherApi.mjs'
import { fetchHoursSinceAnnual, fetchOpsStats } from './glidingOpsHours.mjs'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
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

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST = join(__dirname, 'dist')
const PORT = Number(process.env.PORT) || 3000

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

async function serveStatic(pathname, res) {
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '')
  let filePath = join(DIST, relative)

  if (!filePath.startsWith(DIST)) {
    res.writeHead(403).end()
    return
  }

  if (!existsSync(filePath)) {
    filePath = join(DIST, 'index.html')
  }

  const data = await readFile(filePath)
  const ext = extname(filePath)
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream' })
  res.end(data)
}

createServer(async (req, res) => {
  try {
    const pathname = req.url?.split('?')[0] ?? '/'

    if (pathname === '/api/weather') {
      const observations = await fetchNearbyMetarObservations(req.url)
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      })
      res.end(JSON.stringify(observations))
      return
    }

    if (pathname === '/api/glidingops-hours') {
      if (req.method !== 'POST' && req.method !== 'GET') {
        res.writeHead(405, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Use POST or GET' }))
        return
      }
      const body = req.method === 'POST' ? await readJsonBody(req) : {}
      const result = await fetchHoursSinceAnnual({
        fleet: Array.isArray(body.fleet) ? body.fleet : undefined,
      })
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      })
      res.end(JSON.stringify(result))
      return
    }

    if (pathname === '/api/glidingops-stats') {
      const force = (req.url || '').includes('force=1') || (req.url || '').includes('force=true')
      const result = await fetchOpsStats({ force })
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      })
      res.end(JSON.stringify(result))
      return
    }

    await serveStatic(pathname, res)
  } catch (err) {
    console.error(err)
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }))
  }
}).listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})

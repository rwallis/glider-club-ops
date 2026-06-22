import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchNearbyMetarObservations } from './weatherApi.mjs'

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

    await serveStatic(pathname, res)
  } catch (err) {
    console.error(err)
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }))
  }
}).listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})

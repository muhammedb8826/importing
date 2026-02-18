import http from 'http'
import https from 'https'
import { parse } from 'url'
import next from 'next'

const port = parseInt(process.env.PORT || '4000', 10)
// Backend API URL (e.g. your NestJS app). Default: http://127.0.0.1:3001
const apiBackendUrl = process.env.API_BACKEND_URL || 'https://packing-api.qenenia.com'
const dev = process.env.NODE_ENV !== 'production'

const app = next({ dev })
const handle = app.getRequestHandler()

function main() {
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url || '', true)
    const pathname = parsedUrl.pathname || ''

    if (pathname.startsWith('/api/')) {
      const apiPath = pathname.slice(4) + (parsedUrl.search || '')
      const backend = new URL(apiPath, apiBackendUrl)
      const isHttps = backend.protocol === 'https:'
      const client = isHttps ? https : http
      const opts = {
        hostname: backend.hostname,
        port: backend.port || (isHttps ? 443 : 80),
        path: backend.pathname + backend.search,
        method: req.method,
        headers: { ...req.headers, host: backend.host },
      }
      const proxyReq = client.request(opts, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res)
      })
      proxyReq.on('error', (err) => {
        console.error('API proxy error:', err.message)
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            error: 'API backend unavailable. Is your backend running? Set API_BACKEND_URL if needed.',
          })
        )
      })
      req.pipe(proxyReq)
      return
    }

    handle(req, res, parsedUrl)
  })
  server.listen(port)

  console.log(`> Server listening at http://localhost:${port}`)
  console.log(`> /api/* proxied to ${apiBackendUrl}`)
}

app.prepare().then(main).catch((err) => {
  console.error(err)
  process.exit(1)
})
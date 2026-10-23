import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdirSync, writeFileSync } from 'node:fs'

/**
 * Dev-only: lets /lab/bake save rendered code paintings to public/art/paintings so the site can ship them as
 * plain images (instant) instead of painting them in the browser on every visit.
 */
const bake = (): Plugin => ({
  name: 'bake-paintings',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__bake', (req, res) => {
      const name = new URL(req.url ?? '', 'http://x').searchParams.get('name') ?? ''
      if (req.method !== 'POST' || !/^[a-z0-9-]+$/.test(name)) { res.statusCode = 400; return res.end('bad') }
      let body = ''
      req.on('data', (c) => (body += c))
      req.on('end', () => {
        const m = body.match(/^data:image\/jpeg;base64,(.+)$/)
        if (!m) { res.statusCode = 400; return res.end('not a jpeg data url') }
        mkdirSync('public/art/paintings', { recursive: true })
        writeFileSync(`public/art/paintings/${name}.jpg`, Buffer.from(m[1], 'base64'))
        res.end('ok')
      })
    })
  },
})

export default defineConfig({ plugins: [react(), bake()], server: { port: 8000 } })

import { EmailMessage } from 'cloudflare:email'

interface Env {
  ASSETS: Fetcher
  EMAIL: SendEmail
  /** Where messages are delivered. A verified Email Routing destination, set as a plain-text variable in the Cloudflare dashboard. */
  FORWARD_TO?: string
}

const FROM = 'contact@javicruz.dev'
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

// Strip anything that could break out of a header line.
const LINE_BREAKS = new RegExp('[\\r\\n' + String.fromCharCode(0x2028) + String.fromCharCode(0x2029) + ']+', 'g')
const clean = (s: string) => s.replace(LINE_BREAKS, ' ').trim()
const b64 = (s: string) => {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}
const wrap = (s: string) => s.replace(/(.{76})/g, '$1\r\n')
const encodedWord = (s: string) => `=?UTF-8?B?${b64(s)}?=`

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname !== '/api/contact') return json({ error: 'not_found' }, 404)
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

    // Same-origin only: browsers always send Origin on cross-site POSTs.
    const origin = request.headers.get('origin')
    if (origin && origin !== url.origin) return json({ error: 'forbidden' }, 403)

    let data: Record<string, unknown>
    try {
      const text = await request.text()
      if (text.length > 20_000) return json({ error: 'too_large' }, 413)
      data = JSON.parse(text)
    } catch {
      return json({ error: 'bad_request' }, 400)
    }

    const name = clean(String(data.name ?? '')).slice(0, 100)
    const email = clean(String(data.email ?? '')).slice(0, 200)
    const message = String(data.message ?? '').replace(/\r\n/g, '\n').trim()
    const started = Number(data.t)

    // Bots fill the hidden field and submit instantly; real people take a few seconds.
    if (String(data.company ?? '') !== '') return json({ ok: true }) // pretend success, send nothing
    if (!Number.isFinite(started) || Date.now() - started < 2500 || Date.now() - started > 86_400_000) return json({ error: 'bad_request' }, 400)

    if (!name || !/^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(email) || message.length < 10 || message.length > 5000) {
      return json({ error: 'invalid' }, 400)
    }
    if (!env.FORWARD_TO) return json({ error: 'not_configured' }, 503)

    const subject = `New message from ${name}`
    const body = `From: ${name} <${email}>\nSent via javicruz.dev contact form\n\n${message}\n`
    const raw = [
      `From: "javicruz.dev contact form" <${FROM}>`,
      `To: ${env.FORWARD_TO}`,
      `Reply-To: ${encodedWord(name)} <${email}>`,
      `Subject: ${encodedWord(subject)}`,
      `Message-ID: <${crypto.randomUUID()}@javicruz.dev>`,
      `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      wrap(b64(body)),
      '',
    ].join('\r\n')

    try {
      await env.EMAIL.send(new EmailMessage(FROM, env.FORWARD_TO, raw))
    } catch (err) {
      console.error('send failed', err)
      return json({ error: 'send_failed' }, 502)
    }
    return json({ ok: true })
  },
}

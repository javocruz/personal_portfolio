import { EmailMessage } from 'cloudflare:email'
import type { Guestbook } from './guestbook'

export { Guestbook } from './guestbook'

interface Env {
  ASSETS: Fetcher
  EMAIL: SendEmail
  /** Where messages are delivered. A verified Email Routing destination, set as a plain-text variable in the Cloudflare dashboard. */
  FORWARD_TO?: string
  /** A few messages a minute per visitor; absent on preview deployments. */
  CONTACT_LIMIT?: { limit(o: { key: string }): Promise<{ success: boolean }> }
  GUESTBOOK_LIMIT?: { limit(o: { key: string }): Promise<{ success: boolean }> }
  GUESTBOOK: DurableObjectNamespace<Guestbook>
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
    if (url.pathname.startsWith('/api/guestbook')) return guestbook(request, env, url)
    if (url.pathname !== '/api/contact') return json({ error: 'not_found' }, 404)
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

    // Same-origin only: browsers send Origin on every POST, so a request without it is not the site's form.
    if (request.headers.get('origin') !== url.origin) return json({ error: 'forbidden' }, 403)
    if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'bad_request' }, 400)

    // At most three messages a minute from one address, so the form can't be used to flood the inbox.
    const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
    if (env.CONTACT_LIMIT && !(await env.CONTACT_LIMIT.limit({ key: ip })).success) return json({ error: 'slow_down' }, 429)

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

// ---------- the guestbook ----------
const NO_LINKS = /(https?:|www\.|\.(com|net|org|io|dev|xyz|ru|cn|info|biz|ly|me)\b|\/\/)/i
async function guestbook(request: Request, env: Env, url: URL): Promise<Response> {
  const book = env.GUESTBOOK.get(env.GUESTBOOK.idFromName('main'))
  const sameOrigin = request.headers.get('origin') === url.origin

  // the review page from the email: GET shows the signature with two buttons, POST (from those buttons) acts
  if (url.pathname === '/api/guestbook/review') {
    const id = Number(url.searchParams.get('id')), sig = url.searchParams.get('sig') ?? ''
    if (!Number.isInteger(id) || id < 1) return json({ error: 'not_found' }, 404)
    if (request.method === 'GET') return book.review(id, sig, null)
    if (request.method !== 'POST' || !sameOrigin) return json({ error: 'forbidden' }, 403)
    const a = (await request.formData()).get('a')
    return book.review(id, sig, a === 'approve' || a === 'delete' ? a : null)
  }
  if (url.pathname !== '/api/guestbook') return json({ error: 'not_found' }, 404)

  if (request.method === 'GET') {
    return new Response(JSON.stringify({ entries: await book.list() }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=30' } })
  }
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
  if (!sameOrigin) return json({ error: 'forbidden' }, 403)
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'bad_request' }, 400)
  let data: Record<string, unknown>
  try {
    const text = await request.text()
    if (text.length > 4000) return json({ error: 'too_large' }, 413)
    data = JSON.parse(text)
  } catch {
    return json({ error: 'bad_request' }, 400)
  }
  const started = Number(data.t)
  if (String(data.company ?? '') !== '') return json({ ok: true }) // the honeypot: pretend, keep nothing
  if (!Number.isFinite(started) || Date.now() - started < 2500 || Date.now() - started > 86_400_000) return json({ error: 'bad_request' }, 400)
  const name = clean(String(data.name ?? '')).replace(/\s+/g, ' ').slice(0, 40)
  const message = clean(String(data.message ?? '')).replace(/\s+/g, ' ').slice(0, 140)
  const mark = String(data.mark ?? '')
  if (!name || message.length < 2 || !/^([0-7][0-9a-f]){7}$/.test(mark)) return json({ error: 'invalid' }, 400)
  if (NO_LINKS.test(name) || NO_LINKS.test(message)) return json({ error: 'no_links' }, 400)
  // only signatures that would be kept count towards the limit, so a typo doesn't lock anyone out
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  if (env.GUESTBOOK_LIMIT && !(await env.GUESTBOOK_LIMIT.limit({ key: ip })).success) return json({ error: 'slow_down' }, 429)
  const r = await book.add(name, message, mark, url.origin)
  return r === 'ok' ? json({ ok: true }) : json({ error: r }, r === 'not_configured' ? 503 : 502)
}


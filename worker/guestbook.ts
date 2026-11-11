import { DurableObject } from 'cloudflare:workers'
import { EmailMessage } from 'cloudflare:email'

/**
 * The guestbook: one Durable Object with its own SQLite table. Visitors sign with a name, one line and a 7x7 mark;
 * nothing is public until Javier approves it. Each signature emails him a review link, signed with a secret the
 * object makes for itself on first use (it never leaves except inside those links), so approving needs no login and
 * no dashboard setup. The link opens a page with buttons: link scanners that follow it can't approve anything.
 */
interface Env { EMAIL: SendEmail; FORWARD_TO?: string }

export type Entry = { id: number; name: string; message: string; mark: string; at: string }
const FROM = 'contact@javicruz.dev'
const MAX_PENDING = 300

const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const b64 = (s: string) => { let bin = ''; for (const b of new TextEncoder().encode(s)) bin += String.fromCharCode(b); return btoa(bin) }
const page = (title: string, body: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#1a1917;color:#fff7f0;font:14px/1.6 ui-monospace,Menlo,monospace}main{max-width:32rem;padding:24px}p{margin:0 0 12px}.dim{opacity:.5}button{font:inherit;background:none;color:inherit;border:1px solid rgba(255,247,240,.35);padding:8px 14px;margin-right:8px;cursor:pointer}button:hover{border-color:#fff7f0}pre{font:inherit;line-height:1;letter-spacing:.2em}</style></head><body><main>${body}</main></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'", 'x-robots-tag': 'noindex' } },
  )
const drawMark = (mark: string) => Array.from({ length: 7 }, (_, r) => { const v = parseInt(mark.slice(r * 2, r * 2 + 2), 16); return Array.from({ length: 7 }, (_, c) => (v >> (6 - c)) & 1 ? '■' : '·').join('') }).join('\n')

export class Guestbook extends DurableObject<Env> {
  sql = this.ctx.storage.sql
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, message TEXT NOT NULL, mark TEXT NOT NULL, at TEXT NOT NULL, approved INTEGER NOT NULL DEFAULT 0)`)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)`)
  }

  private async key() {
    let s = this.sql.exec<{ v: string }>(`SELECT v FROM meta WHERE k = 'secret'`).toArray()[0]?.v
    if (!s) { s = hex(crypto.getRandomValues(new Uint8Array(32)).buffer); this.sql.exec(`INSERT INTO meta (k, v) VALUES ('secret', ?)`, s) }
    return crypto.subtle.importKey('raw', new TextEncoder().encode(s), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
  }
  private async sign(id: number) { return hex(await crypto.subtle.sign('HMAC', await this.key(), new TextEncoder().encode(`entry:${id}`))) }
  private async valid(id: number, sig: string) {
    if (!/^[0-9a-f]{64}$/.test(sig)) return false
    const bytes = new Uint8Array(sig.match(/../g)!.map((h) => parseInt(h, 16)))
    return crypto.subtle.verify('HMAC', await this.key(), bytes, new TextEncoder().encode(`entry:${id}`))
  }

  list(): Entry[] {
    return this.sql.exec<Entry>(`SELECT id, name, message, mark, at FROM entries WHERE approved = 1 ORDER BY id DESC LIMIT 200`).toArray()
  }

  async add(name: string, message: string, mark: string, origin: string) {
    if (!this.env.FORWARD_TO) return 'not_configured'
    const at = new Date().toISOString().slice(0, 10)
    const id = this.sql.exec<{ id: number }>(`INSERT INTO entries (name, message, mark, at) VALUES (?, ?, ?, ?) RETURNING id`, name, message, mark, at).one().id
    // keep the waiting list bounded, whatever happens
    this.sql.exec(`DELETE FROM entries WHERE approved = 0 AND id NOT IN (SELECT id FROM entries WHERE approved = 0 ORDER BY id DESC LIMIT ${MAX_PENDING})`)
    const link = `${origin}/api/guestbook/review?id=${id}&sig=${await this.sign(id)}`
    const body = `New guestbook signature, waiting for you:\n\n${name}\n${message}\n\n${drawMark(mark)}\n\nApprove or delete it here:\n${link}\n`
    const raw = [
      `From: "javicruz.dev guestbook" <${FROM}>`, `To: ${this.env.FORWARD_TO}`,
      `Subject: =?UTF-8?B?${b64(`Guestbook: ${name}`)}?=`, `Message-ID: <${crypto.randomUUID()}@javicruz.dev>`, `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(body).replace(/(.{76})/g, '$1\r\n'), '',
    ].join('\r\n')
    try { await this.env.EMAIL.send(new EmailMessage(FROM, this.env.FORWARD_TO, raw)) } catch (err) { console.error('guestbook mail failed', err); return 'send_failed' }
    return 'ok'
  }

  async review(id: number, sig: string, action: string | null) {
    if (!(await this.valid(id, sig))) return page('Not found', '<p>This link is not valid.</p>', 404)
    const e = this.sql.exec<Entry & { approved: number }>(`SELECT id, name, message, mark, at, approved FROM entries WHERE id = ?`, id).toArray()[0]
    if (!e) return page('Gone', '<p>This signature has already been deleted.</p>')
    if (action === 'approve') { this.sql.exec(`UPDATE entries SET approved = 1 WHERE id = ?`, id); return page('Approved', `<p>Approved. <b>${esc(e.name)}</b> is in the guestbook now.</p><p><a style="color:inherit" href="/guestbook">see it</a></p>`) }
    if (action === 'delete') { this.sql.exec(`DELETE FROM entries WHERE id = ?`, id); return page('Deleted', `<p>Deleted.</p>`) }
    return page('Review', `<p class="dim">guestbook · ${esc(e.at)} · ${e.approved ? 'public' : 'waiting'}</p><p><b>${esc(e.name)}</b></p><p>${esc(e.message)}</p><pre>${drawMark(e.mark)}</pre><form method="post"><button name="a" value="approve">approve</button><button name="a" value="delete">delete</button></form>`)
  }
}

import { DurableObject } from 'cloudflare:workers'
import { EmailMessage } from 'cloudflare:email'

/**
 * The guestbook: one Durable Object with its own SQLite table. Visitors sign with a name, one line and a drawing;
 * nothing is public until Javier approves it.
 *
 * A drawing is a list of pen strokes on a 255 x 255 board, stored as base64 bytes: x, y pairs (0-254), with 255
 * between strokes. (The first signatures used a 7x7 grid, stored as 14 hex digits; those still render.)
 *
 * Each signature emails him two links, both signed with a secret the object makes for itself on first use (it never
 * leaves except inside those links): one for that signature, and one for the review queue, a page with every waiting
 * signature and every published one, each with approve or delete. Both pages act only through their buttons (POST),
 * so mail scanners that open links can't change anything.
 */
interface Env { EMAIL: SendEmail; FORWARD_TO?: string }

export type Entry = { id: number; name: string; message: string; mark: string; at: string }
type Row = Entry & { approved: number }
const FROM = 'contact@javicruz.dev'
const MAX_PENDING = 300

const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const b64 = (s: string) => { let bin = ''; for (const b of new TextEncoder().encode(s)) bin += String.fromCharCode(b); return btoa(bin) }

/** The strokes of a drawing, or null if it isn't one. */
export function strokes(mark: string): number[][][] | null {
  if (/^([0-7][0-9a-f]){7}$/.test(mark)) {
    // a 7x7 grid from the first version: each lit cell becomes a short stroke
    const out: number[][][] = []
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) if ((parseInt(mark.slice(r * 2, r * 2 + 2), 16) >> (6 - c)) & 1) { const x = 18 + c * 36, y = 18 + r * 36; out.push([[x - 10, y], [x + 10, y], [x + 10, y + 1], [x - 10, y + 1]]) }
    return out
  }
  let bytes: Uint8Array
  try { bytes = Uint8Array.from(atob(mark), (ch) => ch.charCodeAt(0)) } catch { return null }
  const out: number[][][] = []
  let cur: number[][] = []
  for (let i = 0; i < bytes.length;) {
    if (bytes[i] === 255) { if (cur.length) out.push(cur); cur = []; i++; continue }
    if (i + 1 >= bytes.length || bytes[i + 1] === 255) return null
    cur.push([bytes[i], bytes[i + 1]]); i += 2
  }
  if (cur.length) out.push(cur)
  return out
}
const svg = (mark: string, size: number) => {
  const s = strokes(mark) ?? []
  const lines = s.map((st) => (st.length === 1 ? `<circle cx="${st[0][0]}" cy="${st[0][1]}" r="2.5"/>` : `<polyline points="${st.map((p) => p.join(',')).join(' ')}"/>`)).join('')
  return `<svg width="${size}" height="${size}" viewBox="0 0 255 255" fill="none" stroke="#fff7f0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="border:1px solid rgba(255,247,240,.15)">${lines}</svg>`
}
/** A small picture of a drawing in text, for the email. */
const ascii = (mark: string, W = 32, H = 16) => {
  const g = Array.from({ length: H }, () => Array(W).fill('·'))
  for (const st of strokes(mark) ?? []) for (let k = 0; k < st.length; k++) {
    const [x0, y0] = st[k], [x1, y1] = st[Math.min(k + 1, st.length - 1)], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4))
    for (let j = 0; j <= n; j++) { const x = x0 + ((x1 - x0) * j) / n, y = y0 + ((y1 - y0) * j) / n; g[Math.min(H - 1, Math.floor((y / 255) * H))][Math.min(W - 1, Math.floor((x / 255) * W))] = '■' }
  }
  return g.map((r) => r.join('')).join('\n')
}

const STYLE = `body{margin:0;background:#1a1917;color:#fff7f0;font:14px/1.6 ui-monospace,Menlo,monospace}main{max-width:44rem;margin:0 auto;padding:48px 24px}p{margin:0 0 8px}.dim{opacity:.5}h1{font-size:14px;font-weight:500;margin:0 0 4px}h2{font-size:12px;font-weight:400;opacity:.5;margin:40px 0 12px;text-transform:lowercase}.e{display:flex;gap:16px;align-items:flex-start;padding:14px 0;border-top:1px solid rgba(255,247,240,.12)}.e>div{flex:1;min-width:0;overflow-wrap:anywhere}form{display:inline}button{font:inherit;background:none;color:inherit;border:1px solid rgba(255,247,240,.35);padding:6px 12px;margin:6px 8px 0 0;cursor:pointer}button:hover{border-color:#fff7f0}.del{opacity:.6}a{color:inherit}`
const page = (title: string, body: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><meta name="referrer" content="same-origin"><title>${esc(title)}</title><style>${STYLE}</style></head><body><main>${body}</main></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'same-origin', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'", 'x-robots-tag': 'noindex' } },
  )
const card = (e: Row, buttons: string) => `<div class="e">${svg(e.mark, 96)}<div><p><b>${esc(e.name)}</b> <span class="dim">${esc(e.at)} · ${e.approved ? 'public' : 'waiting'}</span></p><p>${esc(e.message)}</p>${buttons}</div></div>`

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
  private async sign(what: string) { return hex(await crypto.subtle.sign('HMAC', await this.key(), new TextEncoder().encode(what))) }
  private async valid(what: string, sig: string) {
    if (!/^[0-9a-f]{64}$/.test(sig)) return false
    return crypto.subtle.verify('HMAC', await this.key(), new Uint8Array(sig.match(/../g)!.map((h) => parseInt(h, 16))), new TextEncoder().encode(what))
  }
  private row(id: number) { return this.sql.exec<Row>(`SELECT id, name, message, mark, at, approved FROM entries WHERE id = ?`, id).toArray()[0] }
  private act(id: number, a: string) {
    if (a === 'approve') this.sql.exec(`UPDATE entries SET approved = 1 WHERE id = ?`, id)
    else if (a === 'hide') this.sql.exec(`UPDATE entries SET approved = 0 WHERE id = ?`, id)
    else if (a === 'delete') this.sql.exec(`DELETE FROM entries WHERE id = ?`, id)
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
    const waiting = this.sql.exec<{ n: number }>(`SELECT COUNT(*) AS n FROM entries WHERE approved = 0`).one().n
    const one = `${origin}/api/guestbook/review?id=${id}&sig=${await this.sign(`entry:${id}`)}`
    const queue = `${origin}/api/guestbook/queue?key=${await this.sign('queue')}`
    const body = `New guestbook signature:\n\n${name}\n${message}\n\n${ascii(mark)}\n\nThis one:\n${one}\n\nAll ${waiting} waiting, and everything published:\n${queue}\n`
    const raw = [
      `From: "javicruz.dev guestbook" <${FROM}>`, `To: ${this.env.FORWARD_TO}`,
      `Subject: =?UTF-8?B?${b64(`Guestbook: ${name}`)}?=`, `Message-ID: <${crypto.randomUUID()}@javicruz.dev>`, `Date: ${new Date().toUTCString()}`,
      'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(body).replace(/(.{76})/g, '$1\r\n'), '',
    ].join('\r\n')
    try { await this.env.EMAIL.send(new EmailMessage(FROM, this.env.FORWARD_TO, raw)) } catch (err) { console.error('guestbook mail failed', err); return 'send_failed' }
    return 'ok'
  }

  /** One signature, from its email link. */
  async review(id: number, sig: string, action: string | null) {
    if (!(await this.valid(`entry:${id}`, sig))) return page('Not found', '<p>This link is not valid.</p>', 404)
    if (action) this.act(id, action)
    const e = this.row(id)
    if (!e) return page('Deleted', '<p>Deleted. It’s gone for good.</p><p><a href="/guestbook">the guestbook</a></p>')
    const b = e.approved ? `<button name="a" value="hide">unpublish</button><button class="del" name="a" value="delete">delete</button>` : `<button name="a" value="approve">approve</button><button class="del" name="a" value="delete">delete</button>`
    return page('Review', `<h1>guestbook</h1>${action === 'approve' ? '<p>Approved. It’s on the guestbook now.</p>' : ''}${card(e, `<form method="post">${b}</form>`)}<p class="dim" style="margin-top:24px"><a href="/guestbook">the guestbook</a></p>`)
  }

  /** Everything at once: waiting first (oldest at the top), then what's published. */
  async queue(key: string, form: { id: number; a: string } | null) {
    if (!(await this.valid('queue', key))) return page('Not found', '<p>This link is not valid.</p>', 404)
    if (form) this.act(form.id, form.a)
    const waiting = this.sql.exec<Row>(`SELECT id, name, message, mark, at, approved FROM entries WHERE approved = 0 ORDER BY id ASC LIMIT 100`).toArray()
    const live = this.sql.exec<Row>(`SELECT id, name, message, mark, at, approved FROM entries WHERE approved = 1 ORDER BY id DESC LIMIT 100`).toArray()
    const f = (e: Row, b: string) => `<form method="post"><input type="hidden" name="id" value="${e.id}">${b}</form>`
    const w = waiting.map((e) => card(e, f(e, `<button name="a" value="approve">approve</button><button class="del" name="a" value="delete">delete</button>`))).join('')
    const l = live.map((e) => card(e, f(e, `<button name="a" value="hide">unpublish</button><button class="del" name="a" value="delete">delete</button>`))).join('')
    return page('Guestbook queue', `<h1>guestbook · review</h1><p class="dim">Keep this link to yourself: it lets whoever has it publish and delete. <a href="/guestbook">the guestbook</a></p><h2>waiting · ${waiting.length}</h2>${w || '<p class="dim">nothing waiting.</p>'}<h2>published · ${live.length}</h2>${l || '<p class="dim">nothing published yet.</p>'}`)
  }
}

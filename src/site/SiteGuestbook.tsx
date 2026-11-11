import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'

/**
 * The guestbook: sign with a name, one line and a drawing. Signatures go to Javier first and appear here once he's
 * approved them (worker/guestbook.ts). A drawing is pen strokes on a 255 x 255 board, sent as base64 bytes: x, y pairs
 * (0-254) with 255 between strokes, up to 6000 bytes. The first signatures were 7x7 grids (14 hex digits).
 */
type Entry = { id: number; name: string; message: string; mark: string; at: string }
type Stroke = [number, number][]
const BOARD = 255, MAX_BYTES = 6000
const bytesOf = (s: Stroke[]) => s.reduce((n, st) => n + st.length * 2 + 1, 0)
const encode = (s: Stroke[]) => { let bin = ''; s.forEach((st, k) => { if (k) bin += String.fromCharCode(255); for (const [x, y] of st) bin += String.fromCharCode(x, y) }); return btoa(bin) }
const decode = (mark: string): Stroke[] => {
  if (/^([0-7][0-9a-f]){7}$/.test(mark)) {
    const out: Stroke[] = []
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) if ((parseInt(mark.slice(r * 2, r * 2 + 2), 16) >> (6 - c)) & 1) { const x = 18 + c * 36, y = 18 + r * 36; out.push([[x - 10, y], [x + 10, y], [x + 10, y + 1], [x - 10, y + 1]]) }
    return out
  }
  try {
    const b = Uint8Array.from(atob(mark), (ch) => ch.charCodeAt(0)), out: Stroke[] = []
    let cur: Stroke = []
    for (let i = 0; i < b.length;) { if (b[i] === 255) { if (cur.length) out.push(cur); cur = []; i++ } else { cur.push([b[i], b[i + 1]]); i += 2 } }
    if (cur.length) out.push(cur)
    return out
  } catch { return [] }
}
const path = (st: Stroke) => st.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('') + (st.length === 1 ? 'l0.1 0' : '')

/** A signer's drawing. */
function Mark({ mark, size = 96 }: { mark: string; size?: number }) {
  return (
    <svg className="gb-mark" width={size} height={size} viewBox={`0 0 ${BOARD} ${BOARD}`} aria-hidden>
      {decode(mark).map((st, i) => <path key={i} d={path(st)} />)}
    </svg>
  )
}

/** The board you draw on: a pen that follows the pointer, with undo and clear. */
function Pad({ strokes, set }: { strokes: Stroke[]; set: React.Dispatch<React.SetStateAction<Stroke[]>> }) {
  const { l } = useI18n()
  const ref = useRef<SVGSVGElement>(null)
  const drawing = useRef(false)
  const at = (e: React.PointerEvent): [number, number] => {
    const b = ref.current!.getBoundingClientRect()
    const c = (v: number) => Math.max(0, Math.min(254, Math.round(v)))
    return [c(((e.clientX - b.left) / b.width) * BOARD), c(((e.clientY - b.top) / b.height) * BOARD)]
  }
  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId); drawing.current = true
    const p = at(e)
    set((s) => (bytesOf(s) + 3 > MAX_BYTES ? s : [...s, [p]]))
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const p = at(e)
    set((s) => {
      const last = s[s.length - 1]
      if (!last || bytesOf(s) + 2 > MAX_BYTES) return s
      const q = last[last.length - 1]
      if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 2.5) return s
      return [...s.slice(0, -1), [...last, p]]
    })
  }
  const up = () => { drawing.current = false }
  const used = bytesOf(strokes) / MAX_BYTES
  return (
    <div className="gb-padwrap">
      <svg ref={ref} className="gb-pad" viewBox={`0 0 ${BOARD} ${BOARD}`} role="img" aria-label={l({ en: 'Drawing board', es: 'Lienzo para dibujar' })}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {strokes.map((st, i) => <path key={i} d={path(st)} />)}
      </svg>
      <p className="gb-tools">
        <button type="button" onClick={() => set((s) => s.slice(0, -1))} disabled={!strokes.length}>{l({ en: 'undo', es: 'deshacer' })}</button>
        <button type="button" onClick={() => set([])} disabled={!strokes.length}>{l({ en: 'clear', es: 'borrar' })}</button>
        <span className="gb-ink" aria-hidden><i style={{ width: `${Math.min(100, used * 100)}%` }} /></span>
      </p>
    </div>
  )
}

export default function SiteGuestbook() {
  const { l, lang } = useI18n()
  useHead('Guestbook · Javier Cruz Villarreal', l({ en: 'Leave a mark: a name, one line and a little drawing.', es: 'Deja tu marca: un nombre, una línea y un pequeño dibujo.' }))
  const [entries, setEntries] = useState<Entry[] | null | 'err'>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'invalid' | 'empty' | 'no_links' | 'slow_down' | 'error' | 'local'>('idle')
  const [msg, setMsg] = useState('')
  const started = useRef(Date.now())

  useEffect(() => {
    let dead = false
    fetch('/api/guestbook').then((r) => (r.ok ? r.json() : Promise.reject(r.status))).then((d) => !dead && setEntries(d.entries)).catch(() => !dead && setEntries('err'))
    return () => { dead = true }
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (strokes.reduce((n, st) => n + st.length, 0) < 2) return setState('empty')
    setState('sending')
    try {
      const r = await fetch('/api/guestbook', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: String(f.get('name') ?? ''), message: String(f.get('message') ?? ''), mark: encode(strokes), company: String(f.get('company') ?? ''), t: started.current }),
      })
      if (r.status === 404 && import.meta.env.DEV) return setState('local')
      const d = await r.json().catch(() => ({}))
      if (r.ok) { setState('sent'); (e.target as HTMLFormElement).reset(); setMsg(''); setStrokes([]) }
      else setState(d.error === 'no_links' ? 'no_links' : r.status === 429 ? 'slow_down' : r.status === 400 ? 'invalid' : 'error')
    } catch { setState('error') }
  }

  const note: Record<typeof state, string> = {
    idle: '', sending: l({ en: 'sending…', es: 'enviando…' }),
    sent: l({ en: 'thank you. it shows up here once I’ve read it.', es: 'gracias. aparece aquí cuando la lea.' }),
    invalid: l({ en: 'a name and a line, please.', es: 'un nombre y una línea, por favor.' }),
    empty: l({ en: 'draw something first.', es: 'dibuja algo primero.' }),
    no_links: l({ en: 'no links, please.', es: 'sin enlaces, por favor.' }),
    slow_down: l({ en: 'one moment, then try again.', es: 'un momento y vuelve a intentarlo.' }),
    error: l({ en: 'that didn’t go through. try again later.', es: 'no se envió. inténtalo más tarde.' }),
    local: l({ en: 'the guestbook only works on the live site.', es: 'el libro de visitas solo funciona en el sitio publicado.' }),
  }
  const date = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <main className="site-main site-guestbook">
      <header className="gb-head" data-block style={{ ['--order' as string]: 0 }}>
        <h1>{l({ en: 'guestbook', es: 'libro de visitas' })}</h1>
        <p>{l({ en: 'Leave a mark: draw something, sign it, add a line. I read every one before it goes up.', es: 'Deja tu marca: dibuja algo, fírmalo y añade una línea. Leo cada una antes de publicarla.' })}</p>
      </header>

      <form className="gb-form" onSubmit={submit} data-block style={{ ['--order' as string]: 1 }}>
        <Pad strokes={strokes} set={setStrokes} />
        <div className="gb-fields">
          <label>{l({ en: 'name', es: 'nombre' })}<input name="name" required maxLength={40} autoComplete="nickname" /></label>
          <label>{l({ en: 'one line', es: 'una línea' })}<input name="message" required minLength={2} maxLength={140} value={msg} onChange={(e) => setMsg(e.target.value)} /></label>
          <label className="hp" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
          <p className="gb-row">
            <button type="submit" disabled={state === 'sending'}>{l({ en: 'sign', es: 'firmar' })} →</button>
            <span className="gb-count">{msg.length}/140</span>
          </p>
          <p className="gb-note" role="status">{note[state]}</p>
        </div>
      </form>

      <section className="gb-list" data-block style={{ ['--order' as string]: 2 }} aria-label={l({ en: 'Signatures', es: 'Firmas' })}>
        {entries === null && <p className="gb-dim">{l({ en: 'loading…', es: 'cargando…' })}</p>}
        {entries === 'err' && <p className="gb-dim">{l({ en: 'the guestbook can’t be read right now.', es: 'ahora mismo no se puede leer el libro de visitas.' })}</p>}
        {Array.isArray(entries) && entries.length === 0 && <p className="gb-dim">{l({ en: 'no marks yet. be the first.', es: 'aún no hay marcas. sé la primera persona.' })}</p>}
        {Array.isArray(entries) && entries.map((e) => (
          <article key={e.id} className="gb-entry">
            <Mark mark={e.mark} />
            <div><p><b>{e.name}</b> <time>{date(e.at)}</time></p><p>{e.message}</p></div>
          </article>
        ))}
      </section>
    </main>
  )
}

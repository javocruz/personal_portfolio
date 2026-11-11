import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'

/**
 * The guestbook: sign with a name, one line and a 7x7 mark you draw. Signatures go to Javier first and appear here
 * once he's approved them (worker/guestbook.ts). A mark is stored as seven rows of seven bits, two hex digits a row.
 */
type Entry = { id: number; name: string; message: string; mark: string; at: string }
const N = 7
const encode = (cells: boolean[]) => Array.from({ length: N }, (_, r) => cells.slice(r * N, r * N + N).reduce((v, on) => (v << 1) | (on ? 1 : 0), 0).toString(16).padStart(2, '0')).join('')
const decode = (mark: string) => Array.from({ length: N * N }, (_, i) => ((parseInt(mark.slice(Math.floor(i / N) * 2, Math.floor(i / N) * 2 + 2), 16) >> (N - 1 - (i % N))) & 1) === 1)

/** A signer's mark, drawn small. */
function Mark({ mark, size = 42 }: { mark: string; size?: number }) {
  const cells = decode(mark)
  return (
    <svg className="gb-mark" width={size} height={size} viewBox={`0 0 ${N} ${N}`} aria-hidden>
      {cells.map((on, i) => <rect key={i} x={(i % N) + 0.1} y={Math.floor(i / N) + 0.1} width={0.8} height={0.8} opacity={on ? 0.9 : 0.1} />)}
    </svg>
  )
}

/** The pad you draw your mark on: click or drag across cells. */
function Pad({ cells, set }: { cells: boolean[]; set: React.Dispatch<React.SetStateAction<boolean[]>> }) {
  const { l } = useI18n()
  const paint = useRef<boolean | null>(null)
  const apply = (i: number, v: boolean) => set((prev) => { if (prev[i] === v) return prev; const c = prev.slice(); c[i] = v; return c })
  useEffect(() => { const up = () => { paint.current = null }; addEventListener('pointerup', up); return () => removeEventListener('pointerup', up) }, [])
  return (
    <div className="gb-pad" role="group" aria-label={l({ en: 'Your mark, 7 by 7', es: 'Tu marca, de 7 por 7' })} onPointerLeave={() => { paint.current = null }}>
      {cells.map((on, i) => (
        <button key={i} type="button" aria-pressed={on} aria-label={`${Math.floor(i / N) + 1}, ${(i % N) + 1}`}
          onPointerDown={(e) => { e.preventDefault(); paint.current = !on; apply(i, !on) }}
          onPointerEnter={() => { if (paint.current !== null) apply(i, paint.current) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); apply(i, !on) } }} />
      ))}
    </div>
  )
}

export default function SiteGuestbook() {
  const { l, lang } = useI18n()
  useHead('Guestbook · Javier Cruz Villarreal', l({ en: 'Leave a mark: a name, one line and a little drawing.', es: 'Deja tu marca: un nombre, una línea y un pequeño dibujo.' }))
  const [entries, setEntries] = useState<Entry[] | null | 'err'>(null)
  const [cells, setCells] = useState<boolean[]>(() => Array(N * N).fill(false))
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'invalid' | 'no_links' | 'slow_down' | 'error' | 'local'>('idle')
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
    setState('sending')
    try {
      const r = await fetch('/api/guestbook', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: String(f.get('name') ?? ''), message: String(f.get('message') ?? ''), mark: encode(cells), company: String(f.get('company') ?? ''), t: started.current }),
      })
      if (r.status === 404 && import.meta.env.DEV) return setState('local')
      const d = await r.json().catch(() => ({}))
      if (r.ok) { setState('sent'); (e.target as HTMLFormElement).reset(); setMsg(''); setCells(Array(N * N).fill(false)) }
      else setState(d.error === 'no_links' ? 'no_links' : r.status === 429 ? 'slow_down' : r.status === 400 ? 'invalid' : 'error')
    } catch { setState('error') }
  }

  const note: Record<typeof state, string> = {
    idle: '', sending: l({ en: 'sending…', es: 'enviando…' }),
    sent: l({ en: 'thank you. it shows up here once I’ve read it.', es: 'gracias. aparece aquí cuando la lea.' }),
    invalid: l({ en: 'a name and a line, please.', es: 'un nombre y una línea, por favor.' }),
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
        <p>{l({ en: 'Leave a mark: draw something small, add your name and a line. I read every one before it goes up.', es: 'Deja tu marca: dibuja algo pequeño, pon tu nombre y una línea. Leo cada una antes de publicarla.' })}</p>
      </header>

      <form className="gb-form" onSubmit={submit} data-block style={{ ['--order' as string]: 1 }}>
        <Pad cells={cells} set={setCells} />
        <div className="gb-fields">
          <label>{l({ en: 'name', es: 'nombre' })}<input name="name" required maxLength={40} autoComplete="nickname" /></label>
          <label>{l({ en: 'one line', es: 'una línea' })}<input name="message" required minLength={2} maxLength={140} value={msg} onChange={(e) => setMsg(e.target.value)} /></label>
          <label className="hp" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
          <p className="gb-row">
            <button type="submit" disabled={state === 'sending'}>{l({ en: 'sign', es: 'firmar' })} →</button>
            <button type="button" className="gb-clear" onClick={() => setCells(Array(N * N).fill(false))}>{l({ en: 'clear the mark', es: 'borrar la marca' })}</button>
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

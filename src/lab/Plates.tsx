import { useEffect, useMemo, useRef, useState } from 'react'
import { LabBar } from './LabBar'
import { PLATES_ROTHKO } from './art/plates-rothko'
import { PLATES_MONDRIAN } from './art/plates-mondrian'
import { compose, type Level } from './art/mondrian'
import { mulberry, ROTHKO, type ProjectId } from './art/rothko'
import { runLayers } from './art/layers'
import { CORE_SEEDS } from '../content/art'
import './lab.css'

/**
 * Dev-only seed picker for Core's paintings. 24 candidates per project for Rothko and for each Mondrian level, with the
 * seed under each one; Mondrian candidates are ranked by the composition score. Click a painting to pick it, then
 * "Copy seeds" and paste the result over CORE_SEEDS in src/content/art.ts.
 */
type View = 'rothko' | 'level1' | 'level2' | 'level3'
const VIEWS: [View, string][] = [['rothko', 'Rothko'], ['level1', 'Mondrian · 1 Classic'], ['level2', 'Mondrian · 2 Dense'], ['level3', 'Mondrian · 3 Boogie-Woogie']]
const N = 24, TW = 200, TH = 250

const candidates = (view: View, id: ProjectId) => {
  if (view === 'rothko') return Array.from({ length: N }, (_, i) => ({ seed: i + 1, score: null as number | null }))
  const lv = Number(view.slice(-1)) as Level
  // score a wider pool cheaply (composition only), keep the best 24
  return Array.from({ length: 160 }, (_, i) => i + 1)
    .map((seed) => ({ seed, score: compose(mulberry(seed * 104729 + 7 + lv * 7777), id, lv).score as number | null }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, N)
}

function Thumb({ view, id, seed, picked, onPick, queue }: { view: View; id: ProjectId; seed: number; picked: boolean; onPick: () => void; queue: (job: () => void) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    queue(() => {
      const c = ref.current
      if (!c) return
      const ctx = c.getContext('2d')!
      ctx.clearRect(0, 0, TW, TH)
      if (view === 'rothko') { const p = PLATES_ROTHKO.find((x) => x.id === id)!; runLayers(() => p.paint(ctx, TW, TH, seed)) }
      else { const p = PLATES_MONDRIAN.find((x) => x.id === id)!; runLayers(() => p.paint(ctx, TW, TH, seed, Number(view.slice(-1)) as Level)) }
    })
  }, [view, id, seed, queue])
  return <canvas ref={ref} width={TW} height={TH} onClick={onPick} style={{ width: TW, height: TH, display: 'block', cursor: 'pointer', outline: picked ? '3px solid #e8b04a' : '1px solid #2a2430', outlineOffset: picked ? 2 : 0 }} />
}

export default function Plates() {
  const [view, setView] = useState<View>('rothko')
  const [picks, setPicks] = useState(() => structuredClone(CORE_SEEDS))
  const [copied, setCopied] = useState(false)
  // paint one thumbnail per tick so the page stays responsive
  const jobs = useRef<(() => void)[]>([])
  const queue = useMemo(() => {
    let running = false
    const tick = () => { const j = jobs.current.shift(); if (!j) { running = false; return } j(); setTimeout(tick, 0) }
    return (job: () => void) => { jobs.current.push(job); if (!running) { running = true; setTimeout(tick, 0) } }
  }, [])
  if (!import.meta.env.DEV) return <div className="lab"><LabBar /><p style={{ padding: 120 }}>The seed picker only runs in development.</p></div>

  const current = (id: ProjectId) => (view === 'rothko' ? picks.rothko[id] : picks.mondrian[view][id])
  const pick = (id: ProjectId, seed: number) => setPicks((p) => {
    const n = structuredClone(p)
    if (view === 'rothko') n.rothko[id] = seed; else n.mondrian[view][id] = seed
    return n
  })
  const text = `export const CORE_SEEDS = ${JSON.stringify(picks, null, 2).replace(/"(\w+)":/g, '$1:')}\n`
  const copy = () => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })

  return (
    <div className="lab">
      <LabBar />
      <main style={{ padding: '100px 24px 80px', maxWidth: 1400, margin: '0 auto', font: '13px/1.5 var(--mono)' }}>
        <h1 style={{ font: '400 44px/1 var(--serif)', margin: '0 0 12px' }}>Core seeds</h1>
        <p style={{ opacity: 0.7, maxWidth: 760 }}>24 candidates per project. Click one to pick it (gold outline), then copy the seeds and paste them over CORE_SEEDS in src/content/art.ts. Mondrian candidates are sorted by composition score, best first.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '20px 0' }}>
          {VIEWS.map(([v, label]) => <button key={v} onClick={() => { jobs.current = []; setView(v) }} style={{ padding: '6px 12px', border: '1px solid #555', background: view === v ? '#e8b04a' : 'none', color: view === v ? '#111' : 'inherit' }}>{label}</button>)}
          <button id="copy-seeds" onClick={copy} style={{ padding: '6px 12px', border: '1px solid #e8b04a', marginLeft: 'auto' }}>{copied ? 'Copied' : 'Copy seeds'}</button>
        </div>
        {PLATES_ROTHKO.map(({ id }) => (
          <section key={view + id} style={{ margin: '28px 0 40px' }}>
            <h2 style={{ font: '400 20px var(--serif)', margin: '0 0 4px' }}>{id} · picked {current(id)}</h2>
            <p style={{ opacity: 0.6, margin: '0 0 12px', maxWidth: 900 }}>{view === 'rothko' ? ROTHKO[id].note.en : ''}</p>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, ${TW}px)`, gap: 14 }}>
              {candidates(view, id).map(({ seed, score }) => (
                <figure key={seed} style={{ margin: 0 }} data-seed={seed}>
                  <Thumb view={view} id={id} seed={seed} picked={current(id) === seed} onPick={() => pick(id, seed)} queue={queue} />
                  <figcaption style={{ marginTop: 4, opacity: 0.8 }}>seed {seed}{score !== null ? ` · ${score.toFixed(2)}` : ''}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        ))}
        <pre id="seeds-out" style={{ marginTop: 40, padding: 14, border: '1px solid #2a2430', whiteSpace: 'pre-wrap' }}>{text}</pre>
      </main>
    </div>
  )
}

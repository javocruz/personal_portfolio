import { useState } from 'react'
import { LabBar } from './LabBar'
import { Painting } from './art/Painting'
import { PLATES } from './art/plates'
import plateSrc from './art/plates.ts?raw'
import { projects } from '../content/projects'
import './lab.css'

const source = (id: string) => (plateSrc.match(new RegExp(`// <plate:${id}>([\\s\\S]*?)// </plate:${id}>`)) ?? [])[1]?.trim() ?? ''
const CAPTION: Record<string, string> = {
  fire: 'Fire front · wind lean 16° · 280 strokes',
  cost: '$633/t → $29/t · −95%',
  chain: '7 blocks · 1 critical finding · SHA-256 chained',
  stream: '96 intervals · 4 moments worth surfacing',
  iris: 'authenticity 1.0 → 0.0, left to right',
  hills: 'CO₂ · land · water',
}

export default function Plates() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="lab">
      <LabBar />
      <main style={{ padding: '110px 24px 80px', maxWidth: 1180, margin: '0 auto' }}>
        <h1 style={{ font: '400 clamp(44px,7vw,92px)/.95 var(--serif)', letterSpacing: '-.03em' }}>The <em style={{ color: '#e8b04a' }}>plates</em></h1>
        <p style={{ opacity: .7, margin: '14px 0 40px', maxWidth: 620 }}>Each painting is a few lines of code, driven by a real number from the project. Hit “view source” to see it.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 36 }}>
          {PLATES.map((pl, i) => {
            const p = projects.find((x) => x.slug === pl.slug)!
            return (
              <figure key={pl.id} style={{ margin: 0 }}>
                <div style={{ boxShadow: '0 30px 60px -30px #000', border: '10px solid #14111a', outline: '1px solid #3a3342' }}>
                  <Painting id={pl.id} sketch={pl.sketch} opts={{ W: 800, H: 1000, seed: i + 1 }} />
                </div>
                <figcaption style={{ marginTop: 12, font: '400 11px/1.6 var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                  <b style={{ color: '#e8b04a', fontWeight: 400 }}>Plate {['I', 'II', 'III', 'IV', 'V', 'VI'][i]}</b> · {p.title}<br />
                  <span style={{ opacity: .65 }}>Code, ink & watercolour · {CAPTION[pl.id]}</span><br />
                  <button onClick={() => setOpen(open === pl.id ? null : pl.id)} style={{ marginTop: 6, color: '#e8b04a', textDecoration: 'underline', font: 'inherit' }}>{open === pl.id ? 'hide source' : 'view source'}</button>
                </figcaption>
                {open === pl.id && <pre style={{ marginTop: 10, padding: 14, background: '#0d0a12', border: '1px solid #2a2430', borderRadius: 6, overflow: 'auto', font: '12px/1.5 var(--mono)', maxHeight: 360 }}>{source(pl.id)}</pre>}
              </figure>
            )
          })}
        </div>
      </main>
    </div>
  )
}

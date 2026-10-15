import { Link } from 'react-router-dom'
import { LabBar } from './LabBar'
import './lab.css'

const cards: [string, string, string][] = [
  ['/lab/heroes', 'Heroes', 'Six hero concepts: the eye, the isle in different treatments, and the merge.'],
  ['/lab/plates', 'Plates', 'Project art painted in code from each project’s real numbers.'],
  ['/lab/cabinet', 'Cabinet', 'Self-portrait painted in code, ink-face generator, and the loading painting.'],
  ['/lab/a', 'Layout A', 'Gallery hall: museum structure with wall labels.'],
  ['/lab/b', 'Layout B', 'The voyage: one scroll across the water to the isle.'],
  ['/lab/c', 'Layout C', 'The index: typographic list, art appears on hover.'],
]

export default function LabIndex() {
  return (
    <div className="lab">
      <LabBar />
      <main style={{ padding: '120px 24px 80px', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ font: '400 clamp(48px,8vw,100px)/.95 var(--serif)', letterSpacing: '-.03em' }}>Design <em style={{ color: '#e8b04a' }}>lab</em></h1>
        <p style={{ marginTop: 18, opacity: .75, maxWidth: 560 }}>Local prototypes. Nothing here is on the live site. Pick the parts you like.</p>
        <div style={{ display: 'grid', gap: 1, marginTop: 48, background: '#2a2430', border: '1px solid #2a2430' }}>
          {cards.map(([to, t, d]) => (
            <Link key={to} to={to} style={{ background: '#050407', padding: '22px 24px', display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16 }}>
              <span style={{ font: '400 28px var(--serif)' }}>{t}</span><span style={{ opacity: .7 }}>{d}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

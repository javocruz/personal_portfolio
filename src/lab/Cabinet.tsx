import { useEffect, useState } from 'react'
import { LabBar } from './LabBar'
import { Painting } from './art/Painting'
import { loadRef, makePortrait, type Ref } from './art/portrait'
import { faceSheet } from './art/faces'
import './lab.css'

export default function Cabinet() {
  const [ref, setRef] = useState<Ref | null>(null)
  useEffect(() => { loadRef().then(setRef) }, [])
  return (
    <div className="lab">
      <LabBar />
      <main style={{ padding: '110px 24px 80px', maxWidth: 1180, margin: '0 auto' }}>
        <h1 style={{ font: '400 clamp(44px,7vw,92px)/.95 var(--serif)', letterSpacing: '-.03em' }}>The <em style={{ color: '#e8b04a' }}>cabinet</em></h1>
        <p style={{ opacity: .7, margin: '14px 0 40px', maxWidth: 620 }}>Experiments. A self-portrait painted in code from a tiny colour reference, and a sheet of ink faces that are all generated.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 40, alignItems: 'start' }}>
          <figure style={{ margin: 0 }}>
            <div style={{ border: '10px solid #14111a', outline: '1px solid #3a3342' }}>
              {ref ? <Painting id="portrait" sketch={makePortrait(ref)} opts={{ W: 720, H: 794, bg: '#efe6d4', seed: 42 }} /> : <div style={{ aspectRatio: '720/794', background: '#14111a' }} />}
            </div>
            <figcaption style={{ marginTop: 12, font: '400 11px/1.6 var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}><b style={{ color: '#e8b04a', fontWeight: 400 }}>Self-portrait</b> · watercolour washes and 8,000 strokes, in code</figcaption>
          </figure>
          <figure style={{ margin: 0 }}>
            <div style={{ border: '10px solid #14111a', outline: '1px solid #3a3342' }}>
              <Painting id="faces" sketch={faceSheet} opts={{ W: 720, H: 960, bg: '#e8dfc9', seed: 77 }} />
            </div>
            <figcaption style={{ marginTop: 12, font: '400 11px/1.6 var(--mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}><b style={{ color: '#e8b04a', fontWeight: 400 }}>Forty-eight faces</b> · none drawn by hand</figcaption>
          </figure>
        </div>
      </main>
    </div>
  )
}

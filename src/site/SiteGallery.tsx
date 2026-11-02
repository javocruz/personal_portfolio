import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { useMode, type Mode } from '../lib/mode'
import { POSE } from './steps'
import type { L } from '../content/types'

/** The works in the gallery: whole websites, each one entered from here. */
const WORKS: { mode: Mode; title: string; year: string; medium: L; note: L; img: string }[] = [
  {
    mode: 'core', title: 'Core', year: '2026',
    medium: { en: 'one page · Rothko, in code', es: 'una página · Rothko, en código' },
    note: { en: 'The quick version: everything on one page, set like a studio index, with colour fields painted from each project’s numbers.', es: 'La versión rápida: todo en una página, como un índice de estudio, con campos de color pintados a partir de los números de cada proyecto.' },
    img: '/art/site/core',
  },
  {
    mode: 'complete', title: 'Complete', year: '2026',
    medium: { en: 'the full exhibition · Cole, Böcklin, Hillier', es: 'la exposición completa · Cole, Böcklin, Hillier' },
    note: { en: 'The long version: Thomas Cole’s Course of Empire told by scroll, one painting dissolving into the next.', es: 'La versión larga: El curso del imperio de Thomas Cole contado con el scroll, una pintura disolviéndose en la siguiente.' },
    img: '/art/site/complete',
  },
]

/** The gallery (after daoho.dev): a quiet grid of works, and a full-screen viewer to look closer and step inside. */
export default function SiteGallery() {
  const { l } = useI18n()
  const { setMode } = useMode()
  const navigate = useNavigate()
  const [open, setOpen] = useState<number | null>(null)
  useHead('Gallery · Javier Cruz Villarreal', l({ en: 'Two whole websites in one: Core and Complete.', es: 'Dos sitios completos en uno: Core y Complete.' }))
  const enter = (m: Mode) => {
    // the same stepped exit as every page change, then into the exhibit
    document.documentElement.dataset.phase = 'out'
    window.setTimeout(() => { delete document.documentElement.dataset.phase; setMode(m); navigate('/'); scrollTo(0, 0) }, POSE * 2)
  }
  useEffect(() => {
    if (open === null) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((o) => ((o ?? 0) + 1) % WORKS.length)
      if (e.key === 'ArrowLeft') setOpen((o) => ((o ?? 0) - 1 + WORKS.length) % WORKS.length)
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [open])
  const w = open !== null ? WORKS[open] : null
  return (
    <main className="site-main site-gallery">
      <header className="sg-head" data-block style={{ ['--order' as string]: 0 }}>
        <p className="sg-kicker">{l({ en: 'two sites, one person.', es: 'dos sitios, una persona.' })}</p>
        <p className="sg-sub">{l({ en: 'Each one is a whole website. Look closer, then step inside.', es: 'Cada uno es un sitio completo. Míralo de cerca y entra.' })}</p>
      </header>
      <div className="sg-grid">
        {WORKS.map((it, i) => (
          <figure key={it.mode} className="sg-work" data-block style={{ ['--order' as string]: i + 1 }}>
            <button className="sg-img" onClick={() => setOpen(i)} aria-label={l({ en: `Look at ${it.title}`, es: `Ver ${it.title}` })}>
              <img src={`${it.img}-1200.jpg`} srcSet={`${it.img}-800.jpg 800w, ${it.img}-1200.jpg 1200w`} sizes="(max-width: 900px) 92vw, 28rem" alt="" width={1200} height={750} loading={i < 2 ? 'eager' : 'lazy'} />
            </button>
            <figcaption>
              <p><b>{it.title}</b> <span>{it.year}</span></p>
              <p className="sg-medium">{l(it.medium)}</p>
              <button className="sg-enter" onClick={() => enter(it.mode)}>{l({ en: 'enter', es: 'entrar' })} →</button>
            </figcaption>
          </figure>
        ))}
      </div>
      {w && (
        <div className="sg-view" role="dialog" aria-modal="true" aria-label={w.title}>
          <div className="sg-view-top">
            <button onClick={() => setOpen(null)}>{l({ en: 'close', es: 'cerrar' })}</button>
            <span>{(open ?? 0) + 1} / {WORKS.length}</span>
          </div>
          <button className="sg-view-arrow sg-l" onClick={() => setOpen(((open ?? 0) - 1 + WORKS.length) % WORKS.length)} aria-label={l({ en: 'Previous', es: 'Anterior' })}>‹</button>
          <img className="sg-view-img" src={`${w.img}-1200.jpg`} alt={w.title} />
          <button className="sg-view-arrow sg-r" onClick={() => setOpen(((open ?? 0) + 1) % WORKS.length)} aria-label={l({ en: 'Next', es: 'Siguiente' })}>›</button>
          <div className="sg-view-foot">
            <p><b>{w.title}</b> <span>{w.year}</span></p>
            <p className="sg-medium">{l(w.note)}</p>
            <button className="sg-view-enter" onClick={() => enter(w.mode)}>{l({ en: `enter ${w.title.toLowerCase()}`, es: `entrar a ${w.title.toLowerCase()}` })} →</button>
          </div>
        </div>
      )}
    </main>
  )
}

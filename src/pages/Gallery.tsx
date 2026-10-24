import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { reveal } from '../lib/motion'
import { projects, builds } from '../content/projects'
import { plateBySlug, plateSet, plateSrc, paintingSrc, paintingSet, ROMAN } from '../content/art'
import plateCode from '../lab/art/plates.ts?raw'

const source = (id: string) => (plateCode.match(new RegExp(`// <plate:${id}>([\\s\\S]*?)// </plate:${id}>`)) ?? [])[1]?.trim() ?? ''

/** Complete's work page: every project hangs as a painting with a wall label. */
export default function Gallery() {
  const { t, l } = useI18n()
  const [open, setOpen] = useState<string | null>(null)
  useHead('Gallery · Javier Cruz Villarreal', l({ en: 'Every project as a painting, each made in code from the project’s own numbers.', es: 'Cada proyecto como una pintura, hecha con código a partir de sus propios datos.' }))
  return (
    <main className="complete gallery">
      <header className="blog-head gallery-head">
        <p className="mono dim">{t('nav.work')}</p>
        <h1>{l({ en: 'The', es: 'La' })} <em>{l({ en: 'gallery', es: 'galería' })}</em></h1>
        <p>{l({ en: 'Every project hangs here as a painting. Each one is a few lines of code, painted from a real number in the project. Read the label, or view the source.', es: 'Cada proyecto cuelga aquí como una pintura. Cada una son unas líneas de código, pintadas a partir de un dato real del proyecto. Lee la ficha o mira el código.' })}</p>
      </header>
      <div className="hall">
        {projects.map((p, i) => {
          const plate = plateBySlug[p.slug]
          return (
            <motion.figure key={p.slug} className={`plate p${i + 1}`} {...reveal}>
              <Link to={`/work/${p.slug}`} className="frame-art"><img src={plateSrc(p.slug)} srcSet={plateSet(p.slug)} sizes="(max-width: 900px) 92vw, 40vw" alt={p.title} loading={i < 2 ? 'eager' : 'lazy'} width={600} height={750} /></Link>
              <figcaption className="wall">
                <b>{l({ en: 'Plate', es: 'Lámina' })} {ROMAN[i]}</b> · {p.title}<br />
                <span className="dim">{l({ en: 'Code, ink and watercolour', es: 'Código, tinta y acuarela' })} · {plate?.caption}</span><br />
                <span className="dim">{l(p.kind)} · {l(p.when)}</span><br />
                <span className="badge">{l(p.badge)}</span><br />
                <Link className="enter" to={`/work/${p.slug}`}>{l({ en: 'Enter the room', es: 'Entrar a la sala' })} →</Link>
                {plate && <button className="enter src-btn" onClick={() => setOpen(open === p.slug ? null : p.slug)}>{open === p.slug ? l({ en: 'Hide source', es: 'Ocultar código' }) : l({ en: 'View source', es: 'Ver código' })}</button>}
              </figcaption>
              {open === p.slug && plate && <pre className="plate-src">{source(plate.id)}</pre>}
            </motion.figure>
          )
        })}
      </div>

      <section className="block">
        <h2 className="sub-h">{t('builds.title')}</h2>
        <div className="builds">
          {builds.map((b) => (
            <motion.div className="build" key={b.title} {...reveal}>
              <p className="mono dim">{b.when}</p>
              <h3>{b.href ? <a href={b.href} target="_blank" rel="noreferrer">{b.title} ↗</a> : b.title}</h3>
              <p>{l(b.text)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="block cabinet">
        <h2 className="sub-h">{l({ en: 'The cabinet', es: 'El gabinete' })}</h2>
        <motion.figure className="plate" {...reveal} style={{ maxWidth: 560 }}>
          <div className="frame-art"><img src={paintingSrc('faces', 600)} srcSet={paintingSet('faces')} sizes="(max-width: 900px) 92vw, 560px" alt={l({ en: 'A sheet of 48 ink faces, all generated in code', es: 'Una hoja de 48 caras a tinta, todas generadas con código' })} loading="lazy" width={600} height={800} /></div>
          <figcaption className="wall"><b>{l({ en: 'Forty-eight faces', es: 'Cuarenta y ocho caras' })}</b> · {l({ en: 'none drawn by hand', es: 'ninguna dibujada a mano' })}</figcaption>
        </motion.figure>
      </section>
    </main>
  )
}

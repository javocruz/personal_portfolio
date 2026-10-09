import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Scene } from './Scene'
import { useI18n } from '../lib/i18n'
import { reveal } from '../lib/motion'
import type { Project } from '../content/types'

export function ProjectCard({ p }: { p: Project }) {
  const { l } = useI18n()
  return (
    <motion.article className="work" {...reveal}>
      <Link to={`/work/${p.slug}`} className="work-cover" aria-label={p.title}>
        <Scene name={p.cover} />
        <span className="work-index">{p.index}</span>
        <span className="work-badge mono">{l(p.badge)}</span>
      </Link>
      <div className="work-body">
        <p className="mono dim">{l(p.kind)} · {l(p.when)}</p>
        <h3><Link to={`/work/${p.slug}`}>{p.title}</Link></h3>
        <p className="lead">{l(p.tagline)}</p>
        <div className="tags">{p.stack.slice(0, 5).map((s) => <span key={s}>{s}</span>)}</div>
        <Link className="arrow-link" to={`/work/${p.slug}`}>{l({ en: 'Read the case study', es: 'Leer el caso de estudio' })} →</Link>
      </div>
    </motion.article>
  )
}

import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Scene } from '../components/Scene'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { reveal } from '../lib/motion'
import { projects } from '../content/projects'
import NotFound from './NotFound'

export default function CaseStudy() {
  const { slug } = useParams()
  const { t, l } = useI18n()
  const i = projects.findIndex((p) => p.slug === slug)
  const p = projects[i]
  useHead(p ? `${p.title} — Javier Cruz Villarreal` : 'Not found', p ? l(p.tagline) : undefined)
  if (!p) return <NotFound />
  const next = projects[(i + 1) % projects.length]
  const meta: [string, string][] = [
    [t('case.when'), l(p.when)],
    ...(p.role ? [[t('case.role'), l(p.role)] as [string, string]] : []),
    ...(p.team ? [[t('case.team'), l(p.team)] as [string, string]] : []),
  ]
  return (
    <main className="case">
      <header className="case-hero stage">
        <Scene name={p.cover} className="case-bg" />
        <div className="case-hero-inner">
          <Link to="/work" className="mono back">← {t('case.back')}</Link>
          <p className="mono">{l(p.kind)} · <span className="badge">{l(p.badge)}</span></p>
          <h1>{p.title}</h1>
          <p className="case-tag">{l(p.tagline)}</p>
        </div>
      </header>
      <div className="case-body">
        <dl className="case-meta">
          {meta.map(([k, v]) => <div key={k}><dt className="mono dim">{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <motion.section {...reveal}><h2>{t('case.problem')}</h2><p className="lead big">{l(p.problem)}</p></motion.section>
        <motion.section {...reveal}>
          <h2>{t('case.built')}</h2>
          <ul className="case-list">{p.built.map((b, k) => <li key={k}>{l(b)}</li>)}</ul>
        </motion.section>
        <motion.section {...reveal}><h2>{t('case.outcome')}</h2><p className="lead big outcome">{l(p.outcome)}</p></motion.section>
        <motion.section {...reveal}>
          <h2>{t('case.stack')}</h2>
          <div className="tags">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
          {p.links.length > 0 && <div className="case-links">{p.links.map((k) => <a key={k.href} className="arrow-link" href={k.href} target="_blank" rel="noreferrer">{l(k.label)} ↗</a>)}</div>}
        </motion.section>
        <Link to={`/work/${next.slug}`} className="case-next">
          <span className="mono dim">{t('case.next')}</span>
          <strong>{next.title} →</strong>
        </Link>
      </div>
    </main>
  )
}

import { motion } from 'motion/react'
import { ProjectCard } from '../components/ProjectCard'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { reveal } from '../lib/motion'
import { projects, builds } from '../content/projects'

export default function Work() {
  const { t, l } = useI18n()
  useHead('Work — Javier Cruz Villarreal', l({ en: 'Case studies from startups, client work, hackathons and competitions.', es: 'Casos de estudio de startups, proyectos para clientes, hackathons y competiciones.' }))
  return (
    <main className="block page-top">
      <header className="blog-head">
        <p className="mono dim">{t('nav.work')}</p>
        <h1>{t('work.title1')} <em>{t('work.title2')}</em></h1>
        <p>{t('work.index.sub')}</p>
      </header>
      <div className="works">{projects.map((p) => <ProjectCard key={p.slug} p={p} />)}</div>
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
    </main>
  )
}

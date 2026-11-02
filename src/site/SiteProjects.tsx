import { useEffect, useRef } from 'react'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { projects } from '../content/projects'
import { plateSrc, plateSet } from '../content/art'
import { StepLink } from './steps'

/** A project's painting, hung on a soft wash of its own colours (the painting itself, blurred and enlarged). */
export function PlateCard({ slug, alt, eager = false, sizes = '(max-width: 900px) 80vw, 840px' }: { slug: string; alt: string; eager?: boolean; sizes?: string }) {
  return (
    <div className="plate-card">
      <img className="plate-card-wash" src={plateSrc(slug)} alt="" aria-hidden loading={eager ? 'eager' : 'lazy'} />
      <img className="plate-card-art" src={plateSrc(slug, 1200)} srcSet={plateSet(slug)} sizes={sizes} alt={alt} loading={eager ? 'eager' : 'lazy'} width={600} height={750} />
    </div>
  )
}

/** Projects (after daoho.dev): one row of large cards that scrolls sideways; the mouse wheel moves it too. */
export default function SiteProjects() {
  const { l } = useI18n()
  useHead('Projects · Javier Cruz Villarreal', l({ en: 'Projects: hackathons, startups and client work, each with a painting made in code.', es: 'Proyectos: hackathons, startups y trabajo para clientes, cada uno con una pintura hecha con código.' }))
  const row = useRef<HTMLDivElement>(null)
  // a vertical wheel scrolls the row sideways (trackpads that scroll sideways already do)
  useEffect(() => {
    const el = row.current!
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault(); el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', wheel, { passive: false })
    return () => el.removeEventListener('wheel', wheel)
  }, [])
  return (
    <main className="site-main site-projects">
      <div className="proj-row" ref={row}>
        {projects.map((p, i) => (
          <StepLink key={p.slug} to={`/projects/${p.slug}`} className="proj-card" data-block style={{ ['--order' as string]: i }}>
            <div className="proj-img">
              <PlateCard slug={p.slug} alt={p.title} eager={i < 2} />
              <span className="proj-view">{l({ en: 'view project', es: 'ver proyecto' })}</span>
            </div>
            <p className="proj-title"><b>{p.title}</b> <span>{l(p.when)}</span></p>
            <p className="proj-line">{l(p.tagline)}</p>
          </StepLink>
        ))}
      </div>
    </main>
  )
}

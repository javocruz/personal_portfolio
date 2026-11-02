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

/** Projects: a two-column grid that scrolls down (like Core's), each painting hung on a wash of its own colours. */
export default function SiteProjects() {
  const { l } = useI18n()
  useHead('Projects · Javier Cruz Villarreal', l({ en: 'Projects: hackathons, startups and client work, each with a painting made in code.', es: 'Proyectos: hackathons, startups y trabajo para clientes, cada uno con una pintura hecha con código.' }))
  return (
    <main className="site-main site-projects">
      <div className="proj-grid">
        {projects.map((p, i) => (
          <StepLink key={p.slug} to={`/projects/${p.slug}`} className="proj-card" data-block style={{ ['--order' as string]: i }}>
            <div className="proj-img">
              <PlateCard slug={p.slug} alt={p.title} eager={i < 4} sizes="(max-width: 1023px) 92vw, 28rem" />
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

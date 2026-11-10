import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { projects } from '../content/projects'
import { plateBySlug } from '../content/art'
import NotFound from '../pages/NotFound'
import { PlateCard } from './SiteProjects'
import { StepLink } from './steps'

/** A carousel of a project's photos, with a counter (after daoho.dev's "web 1 / 3"). */
function Photos({ items, label }: { items: { name: string; alt: { en: string; es: string } }[]; label: string }) {
  const { l } = useI18n()
  const [i, setI] = useState(0)
  const p = items[i]
  return (
    <figure className="sp-photos" data-block style={{ ['--order' as string]: 6 }}>
      <div className="sp-photos-bar">
        <span>{label}</span>
        <span className="sp-photos-nav">
          <button onClick={() => setI((i - 1 + items.length) % items.length)} aria-label={l({ en: 'Previous photo', es: 'Foto anterior' })}>←</button>
          {i + 1} / {items.length}
          <button onClick={() => setI((i + 1) % items.length)} aria-label={l({ en: 'Next photo', es: 'Foto siguiente' })}>→</button>
        </span>
      </div>
      <img src={`/art/photos/${p.name}-1600.jpg`} srcSet={`/art/photos/${p.name}-800.jpg 800w, /art/photos/${p.name}-1600.jpg 1600w`} sizes="(max-width: 900px) 92vw, 56rem" alt={l(p.alt)} width={1600} height={1067} />
      <figcaption>{l(p.alt)}</figcaption>
    </figure>
  )
}

/** A project page (after daoho.dev): the painting as a wide band, the story in one column, then previous and next. */
export default function SiteProject() {
  const { slug } = useParams()
  const { l } = useI18n()
  const i = projects.findIndex((p) => p.slug === slug)
  const p = projects[i]
  useHead(p ? `${p.title} · Javier Cruz Villarreal` : 'Not found', p ? l(p.tagline) : undefined)
  if (!p) return <NotFound />
  const prev = projects[(i - 1 + projects.length) % projects.length], next = projects[(i + 1) % projects.length]
  const meta: [string, string][] = [
    [l({ en: 'when', es: 'cuándo' }), l(p.when)],
    ...(p.role ? [[l({ en: 'role', es: 'rol' }), l(p.role)] as [string, string]] : []),
    ...(p.team ? [[l({ en: 'team', es: 'equipo' }), l(p.team)] as [string, string]] : []),
    [l({ en: 'result', es: 'resultado' }), l(p.badge)],
  ]
  return (
    <main className="site-main site-project">
      <div className="sp-hero" data-block style={{ ['--order' as string]: 0 }}>
        <PlateCard slug={p.slug} alt={p.title} eager sizes="100vw" />
      </div>
      <article className="sp-col">
        <StepLink to="/projects" className="sp-back" data-block style={{ ['--order' as string]: 1 }}>← {l({ en: 'Projects', es: 'Proyectos' })}</StepLink>
        <header data-block style={{ ['--order' as string]: 2 }}>
          <h1>{p.title}</h1>
          <p className="sp-tag">{l(p.tagline)}</p>
        </header>
        <p className="sp-story" data-block style={{ ['--order' as string]: 3 }}>{l(p.problem)}</p>
        {p.links.length > 0 && (
          <p className="sp-links" data-block style={{ ['--order' as string]: 3 }}>
            {p.links.map((k, n) => <span key={k.href}>{n ? ' / ' : ''}<a href={k.href} target="_blank" rel="noreferrer">{l(k.label)}</a></span>)}
          </p>
        )}
        <dl className="sp-meta" data-block style={{ ['--order' as string]: 4 }}>
          {meta.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        {p.numbers && (
          <ul className="sp-nums" data-block style={{ ['--order' as string]: 4 }}>
            {p.numbers.map((n) => <li key={n.value + n.label.en}><b>{n.value}</b><span>{l(n.label)}</span></li>)}
          </ul>
        )}
        <section data-block style={{ ['--order' as string]: 5 }}>
          <h2>{l({ en: 'The build', es: 'Lo construido' })}</h2>
          <ul className="sp-list">{p.built.map((b, k) => <li key={k}>{l(b)}</li>)}</ul>
        </section>
        {p.photos && <Photos items={p.photos} label={l({ en: 'photos', es: 'fotos' })} />}
        <section data-block style={{ ['--order' as string]: 7 }}>
          <h2>{l({ en: 'Outcome', es: 'Resultado' })}</h2>
          <p>{l(p.outcome)}</p>
        </section>
        <section data-block style={{ ['--order' as string]: 8 }}>
          <h2>Stack</h2>
          <p className="sp-stack">{p.stack.join(' · ')}</p>
          {plateBySlug[p.slug] && <p className="sp-plate">{l({ en: 'The painting: ', es: 'La pintura: ' })}{plateBySlug[p.slug].caption}</p>}
        </section>
        <nav className="sp-next" aria-label={l({ en: 'More projects', es: 'Más proyectos' })} data-block style={{ ['--order' as string]: 9 }}>
          <StepLink to={`/projects/${prev.slug}`}><span className="sp-dim">{l({ en: 'previous', es: 'anterior' })}</span><b>← {prev.title}</b><span className="sp-dim">{l(prev.when)}</span><span>{l(prev.tagline)}</span></StepLink>
          <StepLink to={`/projects/${next.slug}`} className="sp-next-r"><span className="sp-dim">{l({ en: 'next', es: 'siguiente' })}</span><b>{next.title} →</b><span className="sp-dim">{l(next.when)}</span><span>{l(next.tagline)}</span></StepLink>
        </nav>
      </article>
    </main>
  )
}

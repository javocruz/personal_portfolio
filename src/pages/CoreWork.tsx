import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { projects, builds } from '../content/projects'
import { plateSrc } from '../content/art'

/** Core's work page: the same numbered index as the home page, plus the smaller builds. */
export default function CoreWork() {
  const { l, t } = useI18n()
  useHead('Work · Javier Cruz Villarreal', t('work.index.sub'))
  return (
    <main className="core">
      <div className="core-col">
        <p className="msg">{t('work.index.sub')}</p>
        <section className="core-index">
          {projects.map((p, i) => (
            <Link to={`/work/${p.slug}`} className="core-card" key={p.slug}>
              {plateSrc(p.slug) && <img src={plateSrc(p.slug)} alt="" loading="lazy" width={600} height={750} />}
              <span className="core-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="core-title">{p.title}</span>
              <span className="core-line">{l(p.tagline)}</span>
              <span className="core-meta">{l(p.badge)} · {l(p.when)}</span>
            </Link>
          ))}
        </section>
        <section className="core-xp">
          {builds.map((b, i) => (
            <div className="core-row" key={b.title}>
              <span className="core-num">{String(i + 7).padStart(2, '0')}</span>
              <span><b>{b.href ? <a href={b.href} target="_blank" rel="noreferrer">{b.title}</a> : b.title}</b><br />{l(b.text)}</span>
              <span className="core-meta">{b.when}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}

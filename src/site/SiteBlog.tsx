import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { posts } from '../posts'
import { StepLink } from './steps'

/** The blog (after daoho.dev): "coming soon." until there are posts, then a plain list. */
export default function SiteBlog() {
  const { l, lang } = useI18n()
  useHead('Blog · Javier Cruz Villarreal', l({ en: 'Notes on what I’m building and learning.', es: 'Notas sobre lo que construyo y aprendo.' }))
  const date = (d: string) => new Date(d).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  if (!posts.length) return (
    <main className="site-main site-blog site-blog-empty">
      <p data-block>{l({ en: 'coming soon.', es: 'muy pronto.' })}<span className="caret" /></p>
    </main>
  )
  return (
    <main className="site-main site-blog">
      <ul className="sb-list">
        {posts.map((p, i) => (
          <li key={p.slug} data-block style={{ ['--order' as string]: i }}>
            <StepLink to={`/blog/${p.slug}`}><b>{p.title}</b><span>{date(p.date)}</span></StepLink>
            {p.summary && <p>{p.summary}</p>}
          </li>
        ))}
      </ul>
    </main>
  )
}

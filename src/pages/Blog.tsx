import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ReadingProgress } from '../components/ReadingProgress'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { renderMarkdown } from '../lib/markdown'
import { posts } from '../posts'
import NotFound from './NotFound'

const fmt = (d: string, lang: string) => new Date(d).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function BlogIndex() {
  const { t, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const tag = params.get('tag')
  useHead('Writing — Javier Cruz Villarreal', t('blog.sub'))
  const tags = [...new Set(posts.flatMap((p) => p.tags))].sort()
  const shown = tag ? posts.filter((p) => p.tags.includes(tag)) : posts
  return (
    <main className="blog">
      <header className="blog-head">
        <p className="mono dim">{t('nav.writing')} · <a href="/rss.xml">{t('blog.rss')}</a></p>
        <h1>{t('blog.title1')} <em>{t('blog.title2')}</em></h1>
        <p>{t('blog.sub')}</p>
        {tags.length > 0 && (
          <div className="tags filter" aria-label={t('blog.filter')}>
            {tags.map((g) => <button key={g} className={g === tag ? 'on' : ''} onClick={() => setParams(g === tag ? {} : { tag: g })}>#{g}</button>)}
            {tag && <button onClick={() => setParams({})}>{t('blog.clear')} ×</button>}
          </div>
        )}
      </header>
      <div className="post-list">
        {shown.length === 0 && <p className="empty">{t('blog.empty')}</p>}
        {shown.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="post-row">
            <span className="mono dim">{fmt(p.date, lang)}</span>
            <div><h2>{p.title}</h2><p>{p.summary}</p></div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const { t, lang } = useI18n()
  const post = posts.find((p) => p.slug === slug)
  useHead(post ? `${post.title} — Javier Cruz Villarreal` : 'Not found', post?.summary)
  if (!post) return <NotFound />
  return (
    <main className="blog post">
      <ReadingProgress />
      <Link to="/blog" className="mono dim back">← {t('blog.all')}</Link>
      <p className="meta mono dim"><span>{fmt(post.date, lang)}</span><span>{post.minutes} {t('blog.min')}</span>{post.tags.map((g) => <Link key={g} to={`/blog?tag=${g}`}>#{g}</Link>)}</p>
      <h1>{post.title}</h1>
      <article className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
    </main>
  )
}

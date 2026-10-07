import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import { posts } from './posts'

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function useTitle(t: string) {
  useEffect(() => { const prev = document.title; document.title = t; return () => { document.title = prev } }, [t])
}

export function BlogIndex() {
  useTitle('Writing — Javier Cruz Villarreal')
  return (
    <main className="blog">
      <header className="blog-head">
        <p className="mono dim">Writing</p>
        <h1>Notes & <em>essays</em></h1>
        <p>Things I'm building, learning and figuring out.</p>
      </header>
      <div className="post-list">
        {posts.length === 0 && <p className="empty">First post coming soon.</p>}
        {posts.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="post-row">
            <span className="mono dim">{fmt(p.date)}</span>
            <div><h2>{p.title}</h2><p>{p.summary}</p></div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const post = posts.find((p) => p.slug === slug)
  useTitle(post ? `${post.title} — Javier Cruz Villarreal` : 'Not found')
  if (!post)
    return <main className="blog"><Link to="/blog" className="mono dim back">← All writing</Link><h1>Post not found</h1></main>
  return (
    <main className="blog post">
      <Link to="/blog" className="mono dim back">← All writing</Link>
      <p className="meta mono dim"><span>{fmt(post.date)}</span><span>{post.minutes} min read</span>{post.tags.map((t) => <span key={t}>#{t}</span>)}</p>
      <h1>{post.title}</h1>
      <article className="prose" dangerouslySetInnerHTML={{ __html: marked.parse(post.body, { async: false }) as string }} />
    </main>
  )
}

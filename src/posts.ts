// Every file in content/posts/*.md becomes a post. Frontmatter format is documented in BLOG.md.
const files = import.meta.glob('../content/posts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export type Post = { slug: string; title: string; date: string; summary: string; tags: string[]; body: string; minutes: number }

function parse(path: string, raw: string): (Post & { draft: boolean }) | null {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return null
  const meta: Record<string, string> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  }
  const body = m[2].trim()
  return {
    slug: path.split('/').pop()!.replace(/\.md$/, ''),
    title: meta.title || 'Untitled',
    date: meta.date || '1970-01-01',
    summary: meta.summary || '',
    tags: (meta.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    draft: meta.draft === 'true',
    body,
    minutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)),
  }
}

// Drafts show up in `npm run dev` but never in the production build.
export const posts: Post[] = Object.entries(files)
  .map(([p, r]) => parse(p, r))
  .filter((p): p is Post & { draft: boolean } => !!p && (import.meta.env.DEV || !p.draft))
  .sort((a, b) => b.date.localeCompare(a.date))

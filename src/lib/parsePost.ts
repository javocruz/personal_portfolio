// Pure post parser, shared by the browser bundle and the build-time prerender script.
export type Post = { slug: string; title: string; date: string; summary: string; tags: string[]; body: string; minutes: number; draft: boolean }

export function parsePost(path: string, raw: string): Post | null {
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
    tags: (meta.tags || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    draft: meta.draft === 'true',
    body,
    minutes: Math.max(1, Math.round(body.split(/\s+/).length / 220)),
  }
}

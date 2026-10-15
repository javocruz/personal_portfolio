// Every file in content/posts/*.md becomes a post. Format is documented in BLOG.md.
import { parsePost, type Post } from './lib/parsePost'

const files = import.meta.glob('../content/posts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

// Drafts show up in `npm run dev` but never in the production build.
export const posts: Post[] = Object.entries(files)
  .map(([p, r]) => parsePost(p, r))
  .filter((p): p is Post => !!p && (import.meta.env.DEV || !p.draft))
  .sort((a, b) => b.date.localeCompare(a.date))

export type { Post }

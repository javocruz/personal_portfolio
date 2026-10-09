/**
 * Runs after `vite build`. The site is a single-page app, so this step gives every route its own
 * HTML file with correct <title>, description and social tags, plus a preview image, sitemap and RSS feed.
 * Crawlers and link-preview bots (LinkedIn, WhatsApp, Slack, X) read these tags without running any JavaScript.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { projects } from '../src/content/projects'
import { summary, profile } from '../src/content/profile'
import { parsePost } from '../src/lib/parsePost'
import { renderMarkdown } from '../src/lib/markdown'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = profile.siteUrl
const NAME = profile.name

type Route = { path: string; title: string; description: string; og: string; ogTitle: string; ogLabel: string; type?: 'website' | 'article'; date?: string }

const posts = existsSync(join(root, 'content/posts'))
  ? readdirSync(join(root, 'content/posts')).filter((f) => f.endsWith('.md')).map((f) => parsePost(f, readFileSync(join(root, 'content/posts', f), 'utf8'))).filter((p): p is NonNullable<typeof p> => !!p && !p.draft).sort((a, b) => b.date.localeCompare(a.date))
  : []

const routes: Route[] = [
  { path: '/', title: `${NAME} — CS & AI`, description: summary.en, og: 'home', ogTitle: NAME, ogLabel: 'CS & AI · Madrid' },
  { path: '/work', title: `Work — ${NAME}`, description: 'Case studies from startups, client work, hackathons and competitions.', og: 'work', ogTitle: 'Selected work', ogLabel: NAME },
  { path: '/blog', title: `Writing — ${NAME}`, description: 'Things I’m building, learning and figuring out.', og: 'blog', ogTitle: 'Notes & essays', ogLabel: NAME },
  { path: '/cv', title: `CV — ${NAME}`, description: 'Curriculum vitae: three versions of the same person, tuned for different roles.', og: 'cv', ogTitle: 'Curriculum vitae', ogLabel: NAME },
  ...projects.map((p) => ({ path: `/work/${p.slug}`, title: `${p.title} — ${NAME}`, description: p.tagline.en, og: `work-${p.slug}`, ogTitle: p.title, ogLabel: p.badge.en })),
  ...posts.map((p) => ({ path: `/blog/${p.slug}`, title: `${p.title} — ${NAME}`, description: p.summary || summary.en, og: `blog-${p.slug}`, ogTitle: p.title, ogLabel: `${p.date} · ${p.minutes} min read`, type: 'article' as const, date: p.date })),
]

// ---------- preview images ----------
const font = (pkg: string, file: string) => readFileSync(join(root, 'node_modules/@fontsource', pkg, 'files', file))
const fonts = [
  { name: 'Serif', data: font('instrument-serif', 'instrument-serif-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Sans', data: font('inter-tight', 'inter-tight-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
]

async function ogImage(r: Route) {
  const size = r.ogTitle.length > 44 ? 72 : r.ogTitle.length > 24 ? 96 : 120
  const tree = {
    type: 'div',
    props: {
      style: {
        width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, color: '#f1ece4', background: '#0a0908',
        boxSizing: 'border-box',
        backgroundImage: 'radial-gradient(circle at 88% 12%, rgba(255,91,46,0.95) 0%, rgba(255,91,46,0) 52%), radial-gradient(circle at 8% 112%, rgba(107,23,230,0.7) 0%, rgba(107,23,230,0) 58%)',
      },
      children: [
        { type: 'div', props: { style: { display: 'flex', fontFamily: 'Sans', fontSize: 26, letterSpacing: 3, textTransform: 'uppercase', color: '#cfc8bd' }, children: r.ogLabel } },
        { type: 'div', props: { style: { display: 'flex', fontFamily: 'Serif', fontSize: size, lineHeight: 1.0, letterSpacing: -2, maxWidth: 1000 }, children: r.ogTitle } },
        {
          type: 'div',
          props: {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Sans', fontSize: 28, color: '#cfc8bd' },
            children: [
              { type: 'div', props: { style: { display: 'flex' }, children: NAME } },
              { type: 'div', props: { style: { display: 'flex', color: '#ff5b2e' }, children: 'javicruz.dev' } },
            ],
          },
        },
      ],
    },
  }
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts })
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
}

// ---------- HTML ----------
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

function page(r: Route) {
  const url = SITE + (r.path === '/' ? '/' : r.path + '/')
  const img = `${SITE}/og/${r.og}.png`
  const set = (html: string, re: RegExp, to: string) => {
    if (!re.test(html)) throw new Error(`template is missing a tag matching ${re}`)
    return html.replace(re, to)
  }
  let h = template
  h = set(h, /<title>[\s\S]*?<\/title>/, `<title>${esc(r.title)}</title>`)
  h = set(h, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(r.description)}" />`)
  h = set(h, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
  h = set(h, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(r.title)}" />`)
  h = set(h, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(r.description)}" />`)
  h = set(h, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
  h = set(h, /<meta property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="${r.type ?? 'website'}" />`)
  h = set(h, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${img}" />`)
  h = set(h, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(r.title)}" />`)
  h = set(h, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(r.description)}" />`)
  h = set(h, /<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${img}" />`)
  h = set(h, /<noscript>[\s\S]*?<\/noscript>/, `<noscript><h1>${esc(r.ogTitle)}</h1><p>${esc(r.description)}</p><p><a href="${SITE}/">${NAME}</a> · <a href="mailto:${profile.email}">${profile.email}</a></p></noscript>`)
  return h
}

mkdirSync(join(dist, 'og'), { recursive: true })
for (const r of routes) {
  writeFileSync(join(dist, 'og', `${r.og}.png`), await ogImage(r))
  const html = page(r)
  if (r.path === '/') writeFileSync(join(dist, 'index.html'), html)
  else {
    mkdirSync(join(dist, r.path), { recursive: true })
    writeFileSync(join(dist, r.path, 'index.html'), html)
  }
}

// ---------- sitemap, RSS ----------
const today = new Date().toISOString().slice(0, 10)
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map((r) => `  <url><loc>${SITE}${r.path === '/' ? '/' : r.path + '/'}</loc><lastmod>${r.date ?? today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
)

writeFileSync(
  join(dist, 'rss.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n  <title>${esc(NAME)} — Writing</title>\n  <link>${SITE}/blog/</link>\n  <description>Things I’m building, learning and figuring out.</description>\n  <language>en</language>\n  <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />\n${posts
    .map((p) => `  <item>\n    <title>${esc(p.title)}</title>\n    <link>${SITE}/blog/${p.slug}/</link>\n    <guid>${SITE}/blog/${p.slug}/</guid>\n    <pubDate>${new Date(p.date).toUTCString()}</pubDate>\n    <description>${esc(p.summary)}</description>\n    <content:encoded><![CDATA[${renderMarkdown(p.body).replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded>\n  </item>`)
    .join('\n')}\n</channel>\n</rss>\n`,
)

console.log(`prerendered ${routes.length} pages, ${routes.length} preview images, sitemap.xml and rss.xml (${posts.length} posts)`)

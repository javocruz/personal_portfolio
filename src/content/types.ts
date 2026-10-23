export type Lang = 'en' | 'es'
export type L = { en: string; es: string }
export const tr = (l: L, lang: Lang) => l[lang]

export type Link = { label: L; href: string }

export type CoverKind = 'frost' | 'fire' | 'shield' | 'pharma' | 'stream' | 'aero' | 'fruit'

export type Project = {
  slug: string
  index: string
  title: string
  tagline: L
  badge: L
  kind: L
  when: L
  role?: L
  team?: L
  cover: CoverKind
  featured: boolean
  problem: L
  built: L[]
  outcome: L
  stack: string[]
  links: Link[]
  /** real photos from the project; `name` maps to /art/photos/{name}-{800|1600}.jpg */
  photos?: { name: string; alt: L }[]
}

export type Build = { title: string; when: string; text: L; href?: string }

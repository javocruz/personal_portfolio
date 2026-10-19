/** Pre-baked artwork. Everything here is a plain image so pages load instantly. */
export const plateBySlug: Record<string, { id: string; caption: string }> = {
  'los-panaderos': { id: 'fire', caption: 'Fire front · wind lean 16° · 340 strokes' },
  'iata-saf-datathon': { id: 'cost', caption: '$633/t → $29/t · −95%' },
  pharmable: { id: 'chain', caption: '7 blocks · 1 critical finding · SHA-256 chained' },
  streamscope: { id: 'stream', caption: '84 intervals · 4 moments worth surfacing' },
  'sybol-compliance-engine': { id: 'iris', caption: 'Authenticity 1.0 → 0.0, left to right' },
  'frutas-prohibidas': { id: 'hills', caption: 'CO₂ · land · water' },
}

export const paintingSrc = (name: string, w: 600 | 1200 = 600) => `/art/paintings/${name}-${w}.jpg`
export const paintingSet = (name: string) => `${paintingSrc(name, 600)} 600w, ${paintingSrc(name, 1200)} 1200w`
export const plateSrc = (slug: string, w: 600 | 1200 = 600) => (plateBySlug[slug] ? paintingSrc(`plate-${plateBySlug[slug].id}`, w) : '')
/** 1-bit blue dither version, shown before hover in Complete's gallery. */
export const plateDither = (slug: string) => (plateBySlug[slug] ? `/art/paintings/plate-${plateBySlug[slug].id}-dither.png` : '')
export const plateSet = (slug: string) => (plateBySlug[slug] ? paintingSet(`plate-${plateBySlug[slug].id}`) : '')

export const isle = {
  dusk: { src: '/art/isle-dusk-1920.jpg', set: '/art/isle-dusk-960.jpg 960w, /art/isle-dusk-1920.jpg 1920w' },
  dither: { src: '/art/isle-dither-1920.png', set: '/art/isle-dither-960.png 960w, /art/isle-dither-1920.png 1920w' },
  /** Where the gap in the cypresses sits in the painting (fractions of width/height): the eye rises there. */
  gap: { x: 0.5, y: 0.3 },
  aspect: 1920 / 1023,
}

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

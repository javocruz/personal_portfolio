/** Pre-baked artwork. Everything here is a plain image so pages load instantly. */
export const plateBySlug: Record<string, { id: string; caption: string }> = {
  snapfrost: { id: 'frost', caption: '358 nights · forecast error 1.50 → 1.29 °C' },
  'los-panaderos': { id: 'maps', caption: 'The truth and what the system knows, 12 steps apart' },
  'sybol-compliance-engine': { id: 'iris', caption: 'Authenticity 1.0 → 0.0, left to right' },
  pharmable: { id: 'chain', caption: '7 blocks · 1 critical finding · SHA-256 chained' },
  'frutas-prohibidas': { id: 'hills', caption: 'CO₂ · land · water' },
}

export const paintingSrc = (name: string, w: 600 | 1200 = 600) => `/art/paintings/${name}-${w}.jpg`
export const paintingSet = (name: string) => `${paintingSrc(name, 600)} 600w, ${paintingSrc(name, 1200)} 1200w`
/** Core's styles each have their own set of the plates. No style = the original plates, which Complete uses. */
export type PlateStyle = 'mondrian' | 'rothko'
export const plateName = (slug: string, style?: PlateStyle) => (plateBySlug[slug] ? `plate-${plateBySlug[slug].id}${style ? '-' + style : ''}` : '')
export const plateSrc = (slug: string, w: 600 | 1200 = 600, style?: PlateStyle) => (plateBySlug[slug] ? paintingSrc(plateName(slug, style), w) : '')
export const plateSet = (slug: string, style?: PlateStyle) => (plateBySlug[slug] ? paintingSet(plateName(slug, style)) : '')

export const isle = {
  dusk: { src: '/art/isle-dusk-1920.jpg', set: '/art/isle-dusk-960.jpg 960w, /art/isle-dusk-1920.jpg 1920w' },
  /** Where the gap in the cypresses sits in the painting (fractions of width/height): the eye rises there. */
  gap: { x: 0.5, y: 0.3 },
  aspect: 1920 / 1023,
}

/**
 * Core's chosen seeds, one per project and style (and per level for Mondrian). Picked on /lab/plates, which renders
 * 24 candidates each and has a "copy seeds" button: paste its output here to change a pick, then re-bake.
 */
export const CORE_SEEDS = {
  rothko: { frost: 10, maps: 19, iris: 24, chain: 23, hills: 11 },
  mondrian: {
    level1: { frost: 94, maps: 96, iris: 34, chain: 63, hills: 107 },
    level2: { frost: 107, maps: 62, iris: 107, chain: 143, hills: 60 },
    level3: { frost: 75, maps: 140, iris: 37, chain: 107, hills: 20 },
  },
}

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
